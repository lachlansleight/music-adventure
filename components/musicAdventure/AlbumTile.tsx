import { ReactNode } from "react";
import { Album } from "lib/types";
import { getUrlSafeName } from "lib/text";
import AlbumCover from "./AlbumCover";

const AlbumTile = ({
    album,
    children = null,
    className = "",
    showLink = true,
    showDescription = true,
}: {
    album: Album;
    children?: ReactNode;
    className?: string;
    showLink?: boolean;
    showDescription?: boolean;
}): JSX.Element => {
    return (
        <div
            className={`flex flex-col md:flex-row gap-2 md:gap-6 md:h-48 items-center ${className}`}
        >
            <AlbumCover album={album} sizeClassName="w-36 h-36 shrink-0" />
            <div className="flex-grow flex flex-col items-center md:items-start">
                <h3 className="text-2xl">{album.albumName}</h3>
                <h2 className="txt-lg mb-2">{album.artistName}</h2>
                {showDescription && (
                    <p className="italic mb-2 text-center md:text-left">
                        {album.description || ""}
                    </p>
                )}
                {showLink && (
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
                )}
                {children}
            </div>
        </div>
    );
};

export default AlbumTile;
