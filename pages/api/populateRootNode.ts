import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import OpenAi from "lib/openAi";
import { getUrlSafeName } from "lib/text";
import { systemMessage, wrapMessage } from "lib/gpt";
import { performDiscogsSearch } from "./getDiscogsInfo";

const api = new NextRestApiRoute("/populateRootNode");

api.post = async (req, res) => {
    const albumName = getUrlSafeName(req.body.albumName || "");
    const artistName = getUrlSafeName(req.body.artistName || "");
    if (!albumName) throw new RestError("Need to provide an album name!", 400);
    if (!artistName) throw new RestError("Need to provide an artist name!", 400);

    const completion = await OpenAi.getChatCompletion("gpt-4", [
        systemMessage,
        wrapMessage(
            "user",
            `Provide a one-sentence summary of the album '${req.body.albumName}' by ${req.body.artistName}`
        ),
    ]);
    const response = completion.choices[0].message.content.replace(/"/g, "");
    const discogsInfo = await performDiscogsSearch(albumName + "+" + artistName, "release");
    res.status(200).json({
        index: "0",
        albumName: req.body.albumName,
        artistName: req.body.artistName,
        description: response,
        coverUrl: discogsInfo[0].cover_image,
    });
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
