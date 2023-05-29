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
            const adventure = MusicAdventure.load(mapIds[i]);
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

    const copyMap = (id: string) => {
        const adventure = MusicAdventure.load(id);
        const data = adventure.getData();
        navigator.clipboard.writeText(JSON.stringify(data));
        alert("Music map copied to clipboard!");
    };

    const importMap = () => {
        const mapString = prompt("Paste map export here");
        if (!mapString) return;
        const data = JSON.parse(mapString);
        const adventure = new MusicAdventure();
        adventure.setFromSerializedData(data);
        adventure.id = new Date().valueOf().toFixed();
        adventure.saveToLocalStorage();
        const ids = localStorage.getItem("mapIds");
        if (!ids) setMapIds([]);
        else setMapIds(JSON.parse(ids));
    };

    const deleteMap = (id: string) => {
        if (!confirm("Really delete map? This cannot be undone!")) return;
        let ids: string[] = JSON.parse(localStorage.getItem("mapIds") || "[]");
        if (ids) {
            localStorage.setItem("mapIds", JSON.stringify(ids.filter(i => i !== id)));
        }
        localStorage.removeItem("adventure_" + id);

        ids = JSON.parse(localStorage.getItem("mapIds") || "[]");
        setMapIds(ids);
    };

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
                            className="flex justify-between border border-white border-opacity-10 rounded-lg px-4"
                        >
                            <div className="flex-grow">
                                <AlbumTileCompact album={map.startingAlbum}>
                                    <p>
                                        {map.totalAlbums} album{map.totalAlbums === 1 ? "" : "s"},{" "}
                                        {map.totalDirections} direction
                                        {map.totalDirections === 1 ? "" : "s"}
                                    </p>
                                </AlbumTileCompact>
                            </div>
                            <div className="flex flex-col items-center gap-2 justify-center">
                                <Button onClick={() => onConfirm(map.id)} className="mt-0 w-36">
                                    Load Map
                                </Button>
                                <Button onClick={() => copyMap(map.id)} className="mt-0 w-36">
                                    Export Map
                                </Button>
                                <Button onClick={() => deleteMap(map.id)} className="mt-0 w-36">
                                    Delete Map
                                </Button>
                            </div>
                        </div>
                    ))}
                </ul>
            )}
            <div className="flex gap-2 justify-between">
                <Button onClick={onBackClicked}>Back</Button>
                <Button onClick={importMap}>Import Map</Button>
            </div>
        </div>
    );
};

export default SelectorLoad;
