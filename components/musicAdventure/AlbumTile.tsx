import { ReactNode } from "react";
import { Album } from "lib/types";
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
    return (
        <div className={`flex gap-6 h-48 items-center ${className}`}>
            <div className="w-36 h-36 grid place-items-center">
                <img
                    src={album.coverUrl}
                    alt={album.albumName}
                    className="w-36 h-36 object-contain rounded-xl"
                />
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
