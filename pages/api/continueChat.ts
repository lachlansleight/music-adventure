import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import OpenAi, { OpenAiChatMessage } from "lib/openAi";

const api = new NextRestApiRoute("/populateAlbum");

api.post = async (req, res) => {
    const history: OpenAiChatMessage[] = req.body.chatHistory;
    try {
        const completion = await OpenAi.getChatCompletion("gpt-4", history);
        const response = completion.choices[0].message.content;
        try {
            const parsedResponse = JSON.parse(response);
            res.status(200).json(parsedResponse);
        } catch {
            console.error("Failed to parse JSON from", response);
            res.status(200).json({ invalidResponse: response });
        }
    } catch (e: any) {
        if (e.message) throw new RestError(e.message, e.response.status);
        else {
            console.error(e);
            throw new RestError("Unknown error: " + JSON.stringify(e), 500);
        }
    }
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
