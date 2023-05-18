import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";

const api = new NextRestApiRoute("/getDiscogsInfo");

const getSafeAlbumName = (name: string): string => {
    //regex to remove anything other than letters, numbers and spaces
    return name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "+");
};

api.post = async (req, res) => {
    const albumName = getSafeAlbumName(req.body.albumName || "");
    const artistName = getSafeAlbumName(req.body.artistName || "");
    if (!albumName) throw new RestError("Need to provide an album name!", 400);
    if (!artistName) throw new RestError("Need to provide an artist name!", 400);
    const url = `https://api.discogs.com/database/search?q=${albumName}+${artistName}&type=release&key=${process.env.DISCOGS_KEY}&secret=${process.env.DISCOGS_SECRET}`;
    try {
        const discogsResponse = await axios(url);
        res.json(discogsResponse.data.results[0]);
    } catch (e: any) {
        if (e.message) throw new RestError(e.message, e.response.status);
        else {
            console.error(e);
            throw new RestError("Unknown error: " + JSON.stringify(e), 500);
        }
    }
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
