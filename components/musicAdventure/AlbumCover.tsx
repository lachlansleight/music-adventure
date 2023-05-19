import { GiIdea } from "react-icons/gi";
import { Album } from "lib/types";

const AlbumCover = ({
    album,
    sizeClassName,
    showFullHallucinationWarning = true,
}: {
    album: Album;
    sizeClassName: string;
    showFullHallucinationWarning?: boolean;
}): JSX.Element => {
    return (
        <div
            className={`${sizeClassName} grid place-items-center ${
                album.coverUrl ? "" : "border border-red-500 border-opacity-50 rounded-xl shrink-0"
            }`}
        >
            {album.coverUrl ? (
                <img
                    src={album.coverUrl}
                    alt={album.albumName}
                    className={`${sizeClassName} object-contain rounded-xl`}
                />
            ) : (
                <div className={`${sizeClassName} text-red-500 grid place-items-center`}>
                    <div className="flex flex-col items-center text-center">
                        <GiIdea className="text-5xl mb-2" />
                        {showFullHallucinationWarning && (
                            <>
                                <span className="leading-none">Possible AI Hallucination</span>
                                <span className="text-xs italic text-red-500 text-opacity-60">
                                    This album may not exist
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumCover;
