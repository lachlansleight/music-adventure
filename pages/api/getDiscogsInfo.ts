import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { NextRestApiRoute, RestError } from "lib/NextRestApiRoute";
import { getUrlSafeName } from "lib/text";

const api = new NextRestApiRoute("/getDiscogsInfo");

export interface DiscogsAlbum {
    country: string;
    year: string;
    format: string[];
    label: string[];
    genre: string[];
    style: string[];
    id: number;
    barcode: string[];
    master_id: number;
    master_url: string;
    uri: string;
    catno: string;
    title: string;
    thumb: string;
    cover_image: string;
    resource_url: string;
    formats: {
        name: string;
        descriptions: string[];
    }[];
}

export const performDiscogsSearch = async (
    query: string,
    type: string
): Promise<DiscogsAlbum[]> => {
    const url = `https://api.discogs.com/database/search?q=${query}&type=${type}&key=${process.env.DISCOGS_KEY}&secret=${process.env.DISCOGS_SECRET}`;
    const response: { results: DiscogsAlbum[] } = (await axios(url)).data;
    return response.results;
};

api.post = async (req, res) => {
    const albumName = getUrlSafeName(req.body.albumName || "");
    const artistName = getUrlSafeName(req.body.artistName || "");
    if (!albumName) throw new RestError("Need to provide an album name!", 400);
    if (!artistName) throw new RestError("Need to provide an artist name!", 400);
    try {
        const discogsResponse = await performDiscogsSearch(`${albumName}+${artistName}`, "release");
        res.json(discogsResponse[0]);
    } catch (e: any) {
        if (e.message) throw new RestError(e.message, e.response.status);
        else {
            console.error(e);
            throw new RestError("Unknown error: " + JSON.stringify(e), 500);
        }
    }
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
