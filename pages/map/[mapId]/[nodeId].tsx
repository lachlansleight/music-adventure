import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import Layout from "components/layout/Layout";
import MusicAdventure from "lib/MusicAdventure";
import { Album, Direction, isAlbum } from "lib/types";
import { Node } from "lib/Graph";
import AlbumTile from "components/musicAdventure/AlbumTile";
import AlbumTileCompact from "components/musicAdventure/AlbumTileCompact";
import Button from "components/controls/Button";
import MusicPath from "components/musicAdventure/MusicPath";
import FakeProgressBar from "components/FakeProgressBar";
import GraphDiv from "components/musicAdventure/GraphDiv";

const MapNode = (): JSX.Element => {
    const [mapId, setMapId] = useState("");
    const [nodeId, setNodeId] = useState("");
    const [albumNode, setAlbumNode] = useState<Node<Album> | null>(null);
    const [childDirectionNodes, setChildDirectionNodes] = useState<Node<Direction>[]>([]);
    const [parentDirectionNode, setParentDirectionNode] = useState<Node<Direction> | null>(null);
    const [directionNode, setDirectionNode] = useState<Node<Direction> | null>(null);
    const [childAlbumNodes, setChildAlbumNodes] = useState<Node<Album>[]>([]);
    const [parentAlbumNode, setParentAlbumNode] = useState<Node<Album> | null>(null);

    const [loading, setLoading] = useState(false);

    const loadChildren = useCallback(async () => {
        const adventure = new MusicAdventure();
        adventure.loadFromLocalStorage(mapId);
        if (albumNode && parentDirectionNode) {
            setLoading(true);
            await adventure.chooseAlbum(parentDirectionNode.id, albumNode.data.index);
            adventure.saveToLocalStorage();
            setLoading(false);
        } else if (directionNode && parentAlbumNode) {
            setLoading(true);
            await adventure.chooseDirection(parentAlbumNode.id, directionNode.data.index);
            adventure.saveToLocalStorage();
            setLoading(false);
        } else {
            console.error(
                "Somehow we got here - both album and direction node are null, and we're trying to load children. Weird"
            );
        }
    }, [mapId, nodeId, albumNode, directionNode, parentAlbumNode, parentDirectionNode]);

    const router = useRouter();

    useEffect(() => {
        if (!router) return;
        const query = router.query;
        if (query.mapId) setMapId(query.mapId as string);
        if (query.nodeId) setNodeId(query.nodeId as string);
    }, [router]);

    useEffect(() => {
        setAlbumNode(null);
        setDirectionNode(null);
        setChildAlbumNodes([]);
        setChildAlbumNodes([]);
        setParentAlbumNode(null);
        setParentDirectionNode(null);

        const adventure = new MusicAdventure();
        adventure.loadFromLocalStorage(mapId);
        const node = adventure.getNode(nodeId);
        if (node) {
            const data = node.data;
            console.log(data);
            if (isAlbum(data)) {
                setAlbumNode(node as Node<Album>);
                const children = adventure.getChildren(node.id);
                setChildDirectionNodes(children.map(c => c as Node<Direction>));
                const parent = adventure.getParent(node.id);
                if (parent) setParentDirectionNode(parent as Node<Direction>);
                else setParentDirectionNode(null);
            } else {
                setDirectionNode(node as Node<Direction>);
                const children = adventure.getChildren(node.id);
                setChildAlbumNodes(children.map(c => c as Node<Album>));
                const parent = adventure.getParent(node.id);
                if (parent) setParentAlbumNode(parent as Node<Album>);
                else setParentAlbumNode(null);
            }
        }
    }, [mapId, nodeId, loading]);

    // useEffect(() => {
    //     console.log({parentAlbumNode, directionNode, childAlbumNodes, loading});
    //     if(nodeId !== directionNode?.id && !!nodeId) return;
    //     if(!!parentAlbumNode && !!directionNode && childAlbumNodes.length === 0 && !loading) {
    //         loadChildren();
    //     }
    // }, [loadChildren, parentAlbumNode, directionNode, childAlbumNodes, loading, mapId, nodeId]);

    {
        !albumNode && !directionNode && (
            <Layout>
                <p>...</p>
            </Layout>
        );
    }

    return (
        <Layout>
            {nodeId !== "0" && (
                <MusicPath
                    mapId={mapId}
                    nodeId={nodeId}
                    className="mb-4 border border-white border-opacity-20 rounded-lg p-2"
                    onNodeClicked={id => router.push(`/map/${mapId}/${id}`)}
                />
            )}
            {albumNode && (
                <div className="flex flex-col gap-8 px-4">
                    {parentDirectionNode && (
                        <div
                            className="text-sm underline select-none cursor-pointer"
                            onClick={() => router.push(`/map/${mapId}/${parentDirectionNode.id}`)}
                        >
                            <p>&lt; Back to &quot;{parentDirectionNode.data.direction}&quot;</p>
                        </div>
                    )}
                    <AlbumTile album={albumNode.data} />
                    {childDirectionNodes && childDirectionNodes.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {childDirectionNodes.map(dir => {
                                return (
                                    <div
                                        key={dir.id}
                                        className="select-none cursor-pointer bg-white bg-opacity-10 hover:bg-opacity-20 transition-all rounded p-1"
                                        onClick={() => router.push(`/map/${mapId}/${dir.id}`)}
                                    >
                                        <p className="text-center text-sm">{dir.data.direction}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {parentDirectionNode &&
                        (!childDirectionNodes || childDirectionNodes.length === 0) && (
                            <>
                                <Button onClick={() => loadChildren()} disabled={loading}>
                                    {loading ? (
                                        <FaSync className="animate-spin text-2xl my-1" />
                                    ) : (
                                        <span>Generate Paths</span>
                                    )}
                                </Button>
                                {loading && (
                                    <FakeProgressBar duration={45} className="w-full h-8" />
                                )}
                            </>
                        )}
                </div>
            )}
            {directionNode && (
                <div className="flex flex-col gap-4 px-4">
                    {parentAlbumNode && (
                        <div
                            className="text-sm underline select-none cursor-pointer"
                            onClick={() => router.push(`/map/${mapId}/${parentAlbumNode.id}`)}
                        >
                            <p>&lt; Back to {parentAlbumNode.data.albumName}</p>
                        </div>
                    )}
                    <div className="select-none cursor-pointer bg-white bg-opacity-10 rounded p-1">
                        <p className="text-center text-sm">{directionNode.data.direction}</p>
                    </div>
                    {childAlbumNodes && childAlbumNodes.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {childAlbumNodes.map(album => {
                                return (
                                    <div
                                        key={album.id}
                                        className="cursor-pointer bg-white bg-opacity-0 hover:bg-opacity-10 rounded-lg md:px-2 transition-all"
                                        onClick={() => router.push(`/map/${mapId}/${album.id}`)}
                                    >
                                        <AlbumTileCompact album={album.data} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {parentAlbumNode && (!childAlbumNodes || childAlbumNodes.length === 0) && (
                        <>
                            <Button onClick={() => loadChildren()} disabled={loading}>
                                {loading ? (
                                    <FaSync className="animate-spin text-2xl my-1" />
                                ) : (
                                    <span>Generate Albums</span>
                                )}
                            </Button>
                            {loading && <FakeProgressBar duration={45} className="w-full h-8" />}
                        </>
                    )}
                </div>
            )}
            {nodeId === "0" && (
                <GraphDiv
                    mapId={mapId}
                    className="text-white mt-4 border border-white rounded-lg border-opacity-20"
                />
            )}
        </Layout>
    );
};

export default MapNode;
