import { useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import MusicAdventure from "lib/MusicAdventure";
import Button from "components/controls/Button";
import { Album, Direction, isAlbum } from "lib/types";
import AlbumTile from "components/musicAdventure/AlbumTile";
import Foldout from "components/Foldout";
import GraphDiv from "components/musicAdventure/GraphDiv";
import AlbumTileCompact from "./AlbumTileCompact";

const AdventureDebug = ({ id }: { id: string }): JSX.Element => {
    const [adventure, setAdventure] = useState<MusicAdventure | null>(null);
    const [loading, setLoading] = useState(false);
    const [testData, setTestData] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (!id) return;

        if (loading) return;

        const ad = new MusicAdventure();
        ad.loadFromLocalStorage(id);
        ad.onLoadingChanged = setLoading;
        ad.onDataChanged = () => ad.saveToLocalStorage();

        setAdventure(ad);
    }, [id, loading]);

    useEffect(() => {
        if (!adventure) return;

        const getChildren = (parentId: string, margin: number): JSX.Element[] => {
            const nodeChildren = adventure.getChildren(parentId);
            return nodeChildren.map(child => {
                return getNodeElement(child.id, margin);
            });
        };

        const getNodeElement = (nodeId: string, margin: number): JSX.Element => {
            const node = adventure.getNode(nodeId);
            const parentNode = adventure.getParent(nodeId);
            const album = isAlbum(node.data) ? (node.data as Album) : null;
            const direction = isAlbum(node.data) ? null : (node.data as Direction);
            const children = adventure.getChildren(nodeId);
            return (
                <div
                    key={nodeId}
                    style={{ marginLeft: `${margin * 1.5}rem` }}
                    className="pl-2"
                    title={nodeId}
                >
                    {/* <span>{nodeId}</span> */}
                    {album && children.length === 0 && !!parentNode && (
                        <AlbumTile album={album} showDescription={false} showLink={false}>
                            <Button
                                disabled={loading}
                                onClick={() => {
                                    if (album != null)
                                        adventure.chooseAlbum(parentNode?.id, node.data.index);
                                    else adventure.chooseDirection(parentNode?.id, node.data.index);
                                }}
                            >
                                {loading ? (
                                    <FaSync className="animate-spin my-1.5" />
                                ) : (
                                    "Choose Album"
                                )}
                            </Button>
                            <Button onClick={() => adventure.pruneNode(node.id)}>
                                Remove Album &amp; Children
                            </Button>
                        </AlbumTile>
                    )}
                    {album && !(children.length === 0 && !!parentNode) && (
                        <AlbumTileCompact album={album} />
                    )}
                    {direction && children.length === 0 && !!parentNode && (
                        <>
                            <p
                                className="italic bg-white bg-opacity-0 hover:bg-opacity-10 transition-all rounded cursor-pointer no-select"
                                onClick={() => {
                                    adventure.chooseDirection(parentNode?.id, node.data.index);
                                }}
                            >
                                {direction.direction}:
                            </p>
                        </>
                    )}
                    {direction && !(children.length === 0 && !!parentNode) && (
                        <Foldout label={direction.direction} labelClassName="italic">
                            <div className="flex flex-col gap-4">
                                {children.length > 0 && getChildren(nodeId, margin + 1)}
                            </div>
                        </Foldout>
                    )}
                    {album && (
                        <div className="flex flex-col gap-4">
                            {children.length > 0 && getChildren(nodeId, margin + 1)}
                        </div>
                    )}
                </div>
            );
        };

        setTestData(getNodeElement(adventure.getOriginNode().id, 0));
    }, [adventure, loading]);

    if (!adventure) return <div></div>;

    return (
        <div>
            <h1 className="text-3xl text-white">Music Adventure</h1>
            <div className="flex flex-col gap-2">{testData}</div>
            {adventure && <GraphDiv mapId={id} />}
        </div>
    );
};

export default AdventureDebug;
