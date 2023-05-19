import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import MusicAdventure from "lib/MusicAdventure";
import { Album, Direction, isAlbum } from "lib/types";
import AlbumCover from "./AlbumCover";

const MusicPath = ({
    mapId,
    nodeId,
    className = "",
    onNodeClicked,
}: {
    mapId: string;
    nodeId: string;
    className?: string;
    onNodeClicked?: (id: string) => void;
}): JSX.Element => {
    const [path, setPath] = useState<JSX.Element[]>([]);

    useEffect(() => {
        if (!mapId || !nodeId) return;

        const adventure = new MusicAdventure();
        adventure.loadFromLocalStorage(mapId);
        console.log(adventure.getRawData());
        const pathIds = adventure.getPathToNode(nodeId);
        const newPaths: JSX.Element[] = [];
        const covers = pathIds
            .filter(id => isAlbum(adventure.getNode(id).data))
            .map(id => {
                const parent = adventure.getParent(id);
                const title = parent ? (parent.data as Direction).direction : "Starting Album";
                return (
                    <div
                        key={id}
                        className="h-20 w-20 cursor-pointer"
                        title={title}
                        onClick={() => {
                            if (onNodeClicked) onNodeClicked(id);
                        }}
                    >
                        <AlbumCover
                            album={adventure.getNode(id).data as Album}
                            sizeClassName="h-20 w-20"
                            showFullHallucinationWarning={false}
                        />
                    </div>
                );
            });
        for (let i = 0; i < covers.length; i++) {
            newPaths.push(covers[i]);
            if (i !== covers.length - 1) {
                newPaths.push(<FaArrowRight />);
            }
        }
        setPath(newPaths);
    }, [mapId, nodeId]);

    return <div className={`flex gap-2 items-center ${className}`}>{path}</div>;
};

export default MusicPath;
