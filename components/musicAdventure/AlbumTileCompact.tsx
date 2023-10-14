import { ReactNode } from "react";
import { Album } from "lib/types";
import AlbumCover from "./AlbumCover";

const AlbumTileCompact = ({
    album,
    className = "",
    children = null,
}: {
    album: Album;
    children?: ReactNode;
    className?: string;
}): JSX.Element => {
    return (
        <div
            className={`flex flex-col md:flex-row gap-2 md:gap-6 md:h-48 items-center ${className}`}
        >
            <AlbumCover album={album} sizeClassName="w-36 h-36" />
            <div
                className="flex flex-col items-center md:items-start gap-1 text-center md:text-left"
                style={{
                    width: "calc(100% - 9rem)",
                }}
            >
                <h3 className="text-lg m-0 leading-none">{album.albumName}</h3>
                <h2 className="text-sm m-0 leading-none">{album.artistName}</h2>
                <p className="text-xs italic text-neutral-400">{album.description}</p>
                {children}
            </div>
        </div>
    );
};

export default AlbumTileCompact;
