import { useEffect, useState } from "react";
import { Node } from "lib/Graph";
import { Album, Direction, isAlbum } from "lib/types";
import MusicAdventure from "lib/MusicAdventure";
import AlbumCover from "./AlbumCover";

const DirectionButton = ({
    mapId,
    nodeId,
    onClick,
}: {
    mapId: string;
    nodeId: string;
    onClick: () => void;
}): JSX.Element => {
    const [direction, setDirection] = useState<Node<Direction> | null>(null);
    const [childAlbums, setChildAlbums] = useState<Node<Album>[]>([]);

    useEffect(() => {
        setDirection(null);
        setChildAlbums([]);

        if (!mapId || nodeId == null) return;
        const adventure = MusicAdventure.load(mapId);
        const node = adventure.getNode(nodeId);
        if (!node) return;

        setDirection(node as Node<Direction>);
        const children = adventure.getChildren(node.id).filter(node => isAlbum(node.data));
        setChildAlbums(children as Node<Album>[]);
    }, [mapId, nodeId]);

    if (!direction) return <div></div>;

    return (
        <div
            className="select-none cursor-pointer bg-white bg-opacity-10 hover:bg-opacity-20 transition-all rounded p-1 flex flex-col items-center gap-2"
            onClick={onClick}
        >
            <p className="text-center text-sm">{direction.data.direction}</p>
            {childAlbums.length > 0 && (
                <div className="flex gap-2">
                    {childAlbums.map(albumNode => (
                        <AlbumCover
                            key={albumNode.id}
                            album={albumNode.data}
                            sizeClassName="w-12 h-12"
                            showFullHallucinationWarning={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DirectionButton;
