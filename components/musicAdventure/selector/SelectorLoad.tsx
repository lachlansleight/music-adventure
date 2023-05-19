import { useEffect, useState } from "react";
import MusicAdventure from "lib/MusicAdventure";
import { Album, isAlbum } from "lib/types";
import Button from "components/controls/Button";
import AlbumTileCompact from "../AlbumTileCompact";

const SelectorLoad = ({
    onBackClicked,
    onConfirm,
}: {
    onBackClicked: () => void;
    onConfirm: (id: string) => void;
}): JSX.Element => {
    const [mapIds, setMapIds] = useState<string[]>([]);
    const [mapData, setMapData] = useState<
        {
            startingAlbum: Album;
            id: string;
            totalAlbums: number;
            totalDirections: number;
        }[]
    >([]);

    useEffect(() => {
        const ids = localStorage.getItem("mapIds");
        if (!ids) setMapIds([]);
        else setMapIds(JSON.parse(ids));
    }, []);

    useEffect(() => {
        if (!mapIds || mapIds.length === 0) {
            setMapData([]);
            return;
        }

        const newMapData: {
            startingAlbum: Album;
            id: string;
            totalAlbums: number;
            totalDirections: number;
        }[] = [];
        for (let i = 0; i < mapIds.length; i++) {
            const adventure = new MusicAdventure();
            adventure.loadFromLocalStorage(mapIds[i]);
            const albumNodes = Object.values(adventure.getRawData().nodes).filter(node =>
                isAlbum(node.data)
            ).length;
            const directionNodes = Object.values(adventure.getRawData().nodes).filter(
                node => !isAlbum(node.data)
            ).length;
            newMapData.push({
                startingAlbum: adventure.getOriginNode().data as Album,
                id: mapIds[i],
                totalAlbums: albumNodes,
                totalDirections: directionNodes,
            });
        }
        setMapData(newMapData);
    }, [mapIds]);

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl">Select Existing Map</h1>
            {mapData.length === 0 ? (
                <p>You haven&apos;t created any maps!</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {mapData.map(map => (
                        <div
                            key={map.id}
                            onClick={() => onConfirm(map.id)}
                            className="select-none cursor-pointer"
                        >
                            <AlbumTileCompact album={map.startingAlbum}>
                                <p>
                                    {map.totalAlbums} album{map.totalAlbums === 1 ? "" : "s"},{" "}
                                    {map.totalDirections} direction
                                    {map.totalDirections === 1 ? "" : "s"}
                                </p>
                            </AlbumTileCompact>
                        </div>
                    ))}
                </ul>
            )}
            <Button onClick={onBackClicked}>Back</Button>
        </div>
    );
};

export default SelectorLoad;
