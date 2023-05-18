import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import { Album, DiscogsAlbum } from "lib/types";
import { getUrlSafeName } from "lib/text";

const AlbumTile = ({
    album,
    children = null,
    className = "",
}: {
    album: Album;
    children?: ReactNode;
    className?: string;
}): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const [discogsInfo, setDiscogsInfo] = useState<DiscogsAlbum | null>(null);

    useEffect(() => {
        const getDiscogsInfo = async () => {
            setLoading(true);
            setDiscogsInfo(null);
            const response = await axios.post("/api/getDiscogsInfo", album);
            setDiscogsInfo(response.data);
            setLoading(false);
        };
        getDiscogsInfo();
    }, [album]);

    return (
        <div className={`flex gap-6 h-48 items-center ${className}`}>
            <div className="w-36 h-36 grid place-items-center relative">
                {loading && <FaSync className="animate-spin text-4xl" />}
                {discogsInfo && (
                    <img
                        src={discogsInfo.cover_image}
                        alt={album.albumName}
                        className="w-36 h-36 object-contain rounded-xl"
                    />
                )}
                {discogsInfo && (
                    <div className="opacity-0 hover:opacity-100 flex flex-col gap-2 items-center justify-center absolute left-0 top-0 w-full h-full bg-black bg-opacity-70 text-center select-none">
                        <span>Year: {discogsInfo.year}</span>
                        <span>Label: {discogsInfo.label[0]}</span>
                    </div>
                )}
            </div>
            <div className="flex-grow flex flex-col">
                <h3 className="text-2xl">{album.albumName}</h3>
                <h2 className="txt-lg mb-2">{album.artistName}</h2>
                <p className="italic mb-2">{album.description || ""}</p>
                <a
                    className="text-primary-500 underline"
                    href={`https://www.youtube.com/results?search_query=${getUrlSafeName(
                        album.artistName
                    )}+${getUrlSafeName(album.albumName)}+full+album`}
                    target="_blank"
                    rel="noreferrer"
                >
                    YouTube Album Link
                </a>
                {children}
            </div>
        </div>
    );
};

export default AlbumTile;
