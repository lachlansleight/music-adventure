import { useCallback, useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import MusicAdventure from "lib/MusicAdventure";
import Layout from "components/layout/Layout";
import Graph from "lib/Graph";
import Button from "components/controls/Button";
import { Album, Direction, isAlbum } from "lib/types";
import AlbumTile from "components/musicAdventure/AlbumTile";
import TextField from "components/controls/TextField";
import Foldout from "components/Foldout";
import GraphDiv from "components/musicAdventure/GraphDiv";

const test = (): JSX.Element => {
    const [startingAlbum, setStartingAlbum] = useState<{ artistName: string; albumName: string }>({
        artistName: "Bridget St John",
        albumName: "Songs for the Gentle Man",
    });
    const [criteria, setCriteria] = useState<string[]>([
        "Released after 1965 and before 1980",
        "obscure",
    ]);
    const [adventure, setAdventure] = useState<MusicAdventure | null>(null);
    const [adventureGraph, setAdventureGraph] = useState<Graph<Album | Direction> | null>(null);
    const [loading, setLoading] = useState(false);
    const [testData, setTestData] = useState<JSX.Element | null>(null);

    useEffect(() => {
        const storedGraph = localStorage.getItem("adventure");
        if (storedGraph) {
            const data = JSON.parse(storedGraph);
            const startAlbum =
                data.nodes && data.nodes.length > 0
                    ? data.nodes[0].data
                    : {
                          index: "",
                          albumName: "Songs for the Gentle Man",
                          artistName: "Bridget St John",
                          description: "",
                          coverUrl: "",
                      };
            const adventure = new MusicAdventure(startAlbum);
            adventure.onDataChanged = data => {
                if (!data) setAdventureGraph(null);
                const newGraph = new Graph<Album | Direction>({ index: "a", direction: "temp" });
                newGraph.setFromSerializedGraph(data.nodes, data.edges);
                setAdventureGraph(newGraph);
            };
            adventure.onLoadingChanged = setLoading;
            adventure.setFromSerializedData(data.nodes, data.edges, data.criteria);
            setAdventure(adventure);
        } else {
            const adventure = new MusicAdventure({
                index: "",
                albumName: "Songs for the Gentle Man",
                artistName: "Bridget St John",
                description: "",
                coverUrl: "",
            });
            adventure.onDataChanged = data => {
                if (!data) setAdventureGraph(null);
                const newGraph = new Graph<Album | Direction>({ index: "a", direction: "temp" });
                newGraph.setFromSerializedGraph(data.nodes, data.edges);
                setAdventureGraph(newGraph);
            };
            adventure.onLoadingChanged = setLoading;
            setAdventure(adventure);
        }
    }, []);

    const doSetup = useCallback(() => {
        if (!adventure) return;
        adventure.criteria = criteria;
        adventure.setStartingAlbum(startingAlbum.albumName, startingAlbum.artistName);
    }, [adventure, startingAlbum, criteria]);

    useEffect(() => {
        if (!adventureGraph || !adventure) return;

        const getChildren = (parentId: string, margin: number): JSX.Element[] => {
            const nodeChildren = adventureGraph.getNodeChildren(parentId);
            return nodeChildren.map(child => {
                return getNodeElement(child.id, margin);
            });
        };

        const getNodeElement = (nodeId: string, margin: number): JSX.Element => {
            const node = adventureGraph.nodes[nodeId];
            const parentNode = adventureGraph.getNodeParent(nodeId);
            const album = isAlbum(node.data) ? (node.data as Album) : null;
            const direction = isAlbum(node.data) ? null : (node.data as Direction);
            const children = adventureGraph.getNodeChildren(nodeId);
            return (
                <div
                    key={nodeId}
                    style={{ marginLeft: `${margin * 1}rem` }}
                    className="border-white border-l pl-2"
                >
                    {/* <span>{nodeId}</span> */}
                    {album && <AlbumTile album={album} />}
                    {direction && (
                        <>
                            <p>{direction.direction}</p>
                        </>
                    )}
                    {children.length > 0 && getChildren(nodeId, margin + 1)}
                    {children.length === 0 && !!parentNode && (
                        <Button
                            disabled={loading}
                            onClick={() => {
                                if (album != null)
                                    adventure.chooseAlbum(parentNode?.id, node.data.index);
                                else adventure.chooseDirection(parentNode?.id, node.data.index);
                            }}
                        >
                            {loading ? <FaSync className="animate-spin my-1.5" /> : node.data.index}
                        </Button>
                    )}
                </div>
            );
        };

        setTestData(getNodeElement(adventureGraph.originNode.id, 0));
    }, [adventure, adventureGraph, loading]);

    useEffect(() => {
        if (!adventureGraph) return;
        const data = {
            nodes: adventureGraph?.nodes || [],
            edges: adventureGraph?.edges || [],
            criteria: criteria,
        };
        console.log("Caching data", data);
        localStorage.setItem("adventure", JSON.stringify(data));
    }, [adventureGraph, criteria]);

    if (!adventure)
        return (
            <Layout>
                <div></div>
            </Layout>
        );

    return (
        <Layout>
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl text-white">Music Adventure</h1>
                {(adventureGraph?.originNode.data.index || "") === "" && (
                    <div>
                        <h2 className="text-lg">Starting Album</h2>
                        <TextField
                            value={startingAlbum.artistName}
                            onChange={val =>
                                setStartingAlbum({ ...startingAlbum, artistName: val })
                            }
                            label="Artist Name"
                        />
                        <TextField
                            value={startingAlbum.albumName}
                            onChange={val => setStartingAlbum({ ...startingAlbum, albumName: val })}
                            label="Album Name"
                        />
                    </div>
                )}
                <Foldout label="Criteria" startsOut={true}>
                    <h2 className="text-lg">Criteria</h2>
                    <ul>
                        {criteria.map((c, i) => (
                            <li key={i} className="flex gap-2 relative">
                                <TextField
                                    value={c}
                                    onChange={val =>
                                        setCriteria(cur => cur.map((c, j) => (i === j ? val : c)))
                                    }
                                />
                                <Button
                                    onClick={() =>
                                        setCriteria(cur => cur.filter((_, j) => i !== j))
                                    }
                                    className="relative bottom-4"
                                >
                                    X
                                </Button>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={() => setCriteria(cur => [...cur, ""])} disabled={loading}>
                        Add Criteria
                    </Button>
                </Foldout>
                {(adventureGraph?.originNode.data.index || "") === "" ? (
                    <Button disabled={loading} onClick={() => doSetup()}>
                        Set Starting Album
                    </Button>
                ) : Object.keys(adventureGraph?.edges || {}).length === 0 ? (
                    <div className="flex gap-4 justify-between">
                        <Button
                            disabled={loading}
                            onClick={() => adventure.populateFirstAlbumDirections()}
                        >
                            Begin Exploring
                        </Button>
                    </div>
                ) : null}
            </div>
            <div className="flex flex-col gap-2">{testData}</div>
            {adventureGraph && (
                <GraphDiv
                    nodes={Object.values(adventureGraph.nodes)}
                    edges={Object.values(adventureGraph.edges)}
                />
            )}
        </Layout>
    );
};

export default test;
