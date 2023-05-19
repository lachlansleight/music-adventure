import { useCallback, useState } from "react";
import axios from "axios";
import { FaSync, FaPlus, FaTimes } from "react-icons/fa";
import TextField from "components/controls/TextField";
import { Album } from "lib/types";
import Button from "components/controls/Button";
import MusicAdventure from "lib/MusicAdventure";
import AlbumTile from "../AlbumTile";

const SelectorCreate = ({
    onBackClicked,
    onConfirm,
}: {
    onBackClicked: () => void;
    onConfirm: (id: string) => void;
}): JSX.Element => {
    const [phase, setPhase] = useState<"rawAlbum" | "criteria" | "confirm" | "preparing">(
        "rawAlbum"
    );
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(false);

    const [rawAlbum, setRawAlbum] = useState<{ albumName: string; artistName: string }>({
        albumName: "",
        artistName: "",
    });
    const [criteria, setCriteria] = useState<string[]>([]);

    const back = useCallback(() => {
        switch (phase) {
            case "rawAlbum":
                onBackClicked();
                break;
            case "criteria":
                setPhase("rawAlbum");
                break;
            case "confirm":
                setPhase("criteria");
                break;
            case "preparing":
                setPhase("confirm");
                break;
        }
    }, [phase]);

    const submitAlbum = async (albumName: string, artistName: string) => {
        setLoading(true);
        const response = await axios.post("/api/populateRootNode", { albumName, artistName });
        setAlbum(response.data);
        setLoading(false);
        setPhase("criteria");
    };

    const generateFirstNode = useCallback(async () => {
        if (!album) return;
        const adventure = new MusicAdventure(album, criteria);
        await adventure.populateFirstAlbumDirections();
        adventure.saveToLocalStorage();
        onConfirm(adventure.id);
    }, [album, criteria]);

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl">Create New Map</h1>
            {phase === "rawAlbum" && (
                <div>
                    <h2 className="text-lg">Starting Album</h2>
                    <TextField
                        value={rawAlbum.albumName}
                        onChange={val => setRawAlbum({ ...rawAlbum, albumName: val })}
                        label="Album Name"
                    />
                    <TextField
                        value={rawAlbum.artistName}
                        onChange={val => setRawAlbum({ ...rawAlbum, artistName: val })}
                        label="Artist Name"
                    />
                    <div className="flex gap-2 items-center justify-center relative">
                        <Button onClick={back}>Cancel</Button>
                        <Button
                            onClick={() => submitAlbum(rawAlbum.albumName, rawAlbum.artistName)}
                            disabled={loading}
                        >
                            {loading ? "Loading" : "Confirm"}
                        </Button>
                    </div>
                    <div className="flex justify-center mt-4">
                        {loading && <FaSync className="animate-spin text-2xl relative top-2" />}
                    </div>
                </div>
            )}
            {phase === "criteria" && !!album && (
                <div>
                    <AlbumTile album={album} showLink={false} showDescription={false} />
                    <h2 className="text-lg mt-8 -mb-1">Criteria</h2>
                    <p className="text-neutral-500 italic text-xs">
                        The AI will do its best to present albums that meet to these requirements
                    </p>
                    <ul className="flex flex-col gap-2 mb-2 mt-2">
                        {criteria.map((c, i) => (
                            <li key={i} className="flex gap-2 relative">
                                <TextField
                                    value={c}
                                    onChange={val =>
                                        setCriteria(cur => cur.map((c, j) => (i === j ? val : c)))
                                    }
                                />
                                <button
                                    onClick={() =>
                                        setCriteria(cur => cur.filter((_, j) => i !== j))
                                    }
                                    className="bg-primary-500 rounded-full w-9 grid place-items-center text-black"
                                >
                                    <FaTimes />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-end gap-2 items-center">
                        <span className="text-sm">Add Criteria</span>
                        <button
                            onClick={() => setCriteria(cur => [...cur, ""])}
                            className="bg-primary-500 rounded-full w-8 h-8 grid place-items-center text-white"
                        >
                            <FaPlus />
                        </button>
                    </div>
                    <div className="flex gap-2 items-center justify-center relative">
                        <Button onClick={back}>Back</Button>
                        <Button
                            onClick={() => {
                                setPhase("confirm");
                                setCriteria(cur => cur.filter(s => s.length > 0));
                            }}
                        >
                            Confirm
                        </Button>
                        {loading && <FaSync className="animate-spin text-2xl relative top-2" />}
                    </div>
                </div>
            )}
            {phase === "confirm" && !!album && (
                <div className="flex flex-col gap-4">
                    <AlbumTile album={album} showLink={false} showDescription={false} />
                    <h2 className="text-lg mt-4 -mb-4 text-center">Criteria</h2>
                    <ul className="flex flex-col gap-1 items-center">
                        {criteria.map((c, i) => (
                            <li key={i} className="text-sm italic">
                                {c}
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2 items-center justify-center relative">
                        <Button onClick={back}>Back</Button>
                        <Button
                            onClick={() => {
                                generateFirstNode();
                                setPhase("preparing");
                            }}
                        >
                            Create Map
                        </Button>
                        {loading && <FaSync className="animate-spin text-2xl relative top-2" />}
                    </div>
                </div>
            )}
            {phase === "preparing" && (
                <div>
                    <h2 className="text-lg">Generating suggestions</h2>
                    <p>Each generation takes a moment, so be patient!</p>
                </div>
            )}
        </div>
    );
};

export default SelectorCreate;
