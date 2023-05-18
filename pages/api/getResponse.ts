import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import OpenAi, { OpenAiChatMessage } from "lib/openAi";
import { AdventureSetup } from "lib/types";
import { getStartingPrompt, systemMessage, wrapMessage } from "lib/gpt";

const api = new NextRestApiRoute("/getResponse");

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
        const filledPrompt = getStartingPrompt(setup.startingAlbum, setup.criteria);
        const messages: OpenAiChatMessage[] = [systemMessage, wrapMessage("user", filledPrompt)];
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
