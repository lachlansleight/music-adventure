import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import OpenAi, { OpenAiChatMessage } from "lib/openAi";
import { AdventureSetup } from "lib/types";

const api = new NextRestApiRoute("/getResponse");

const prompt = `I would like you to make a musical choose your own adventure for me, to help me discover new music. Each step of the process should be formatted as JSON in the following format:

{
  "albumName": "Example Album",
  "artistName": "Example Artist",
  "description": "A one-sentence description of the album",
  "options": [
    { "index": "a", "description": "Something that is more X" },
    { "index": "b", "description": "Something that is more Y" }
  ]
}

Present two options with the format "something that is more...", and two options with the format "something else that is also...". The first two options should present new musical directions, the second two options should present albums similar to the current one.
Don't present more than one album by the same artist.

I will respond with the index of the option I chose. When I do that, give me four albums that fit the description presented in the following format:

{
    "albums": [
        {
            "index": "a",
            "albumName": "Example Album",
            "artistName": "Example Artist",
            "description": "A one-sentence description of the album"
        },
        {
            "index": "b",
            "albumName": "Another Album",
            "artistName": "Another Artist",
            "description": "A one-sentence description of the album"
        }
    ]
}

I will respond with the index of the album option I choose. The process should then repeat with that album representing the new origin point for the first JSON format. If I respond with 'more options', then you should present four different options in the same format.

All album suggestions should meet the following criteria:
[CRITERIA]

All your responses should be pure JSON.

Let's start with the following album:

[STARTALBUM]
`;

api.post = async (req, res) => {
    const pastMessages = req.body.pastMessages;
    const setup: AdventureSetup = req.body.setup;
    console.log(req.body);
    if (!pastMessages && !setup) {
        throw new RestError("Need to provide either past messages OR an adventure setup!", 400);
    }

    if (pastMessages) {
        try {
            const completion = await OpenAi.getChatCompletion("gpt-4", pastMessages);
            pastMessages.push(completion.choices[0].message);
            const response = completion.choices[0].message.content;
            try {
                const parsedResponse = JSON.parse(response);
                const messages = [...pastMessages];
                res.status(200).json({ messages, parsedResponse });
            } catch {
                console.error("Failed to parse JSON from", response);
                throw new RestError("OpenAI returned an invalid response!", 500);
            }
        } catch (e: any) {
            if (e.message) throw new RestError(e.message, e.response.status);
            else {
                console.error(e);
                throw new RestError("Unknown error: " + JSON.stringify(e), 500);
            }
        }
    } else {
        const filledPrompt = prompt
            .replace("[CRITERIA]", setup.criteria.join("\n-  "))
            .replace("[STARTALBUM]", JSON.stringify(setup.startingAlbum, null, 2));
        const messages: OpenAiChatMessage[] = [
            {
                role: "system",
                content: "You are a helpful assistant",
            },
            {
                role: "user",
                content: filledPrompt,
            },
        ];
        const completion = await OpenAi.getChatCompletion("gpt-4", messages);
        const response = completion.choices[0].message.content;
        messages.push(completion.choices[0].message);
        try {
            const parsedResponse = JSON.parse(response);
            res.status(200).json({ messages, parsedResponse });
        } catch {
            console.error("Failed to parse JSON from", response);
            throw new RestError("OpenAI returned an invalid response!", 500);
        }
    }
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
