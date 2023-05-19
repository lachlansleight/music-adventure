import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Edge, Node } from "lib/Graph";
import { Album, Direction } from "lib/types";
import MusicAdventure from "lib/MusicAdventure";

const GraphDiv = ({
    mapId,
    className = "",
}: {
    mapId: string;
    className?: string;
}): JSX.Element => {
    const [nodes, setNodes] = useState<Node<Album | Direction>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        setNodes([]);
        setEdges([]);
        if (!mapId) return;
        const adventure = new MusicAdventure();
        adventure.loadFromLocalStorage(mapId);
        const rawData = adventure.getRawData();
        setNodes(Object.values(rawData.nodes));
        setEdges(Object.values(rawData.edges));
    }, [mapId]);

    const containerDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!nodes || !edges) return;
        if (!containerDiv?.current) return;

        console.log(nodes, edges);

        cytoscape({
            container: containerDiv.current,
            elements: {
                nodes: nodes.map(n => ({ data: n })),
                edges: edges.map(e => ({ data: e })),
            },
            layout: {
                name: "breadthfirst",
                directed: true,
            },
            style: [
                {
                    selector: "node[data.direction]",
                    style: {
                        color: "white",
                        backgroundColor: "#C13298",
                    },
                },
                {
                    selector: "node[data.albumName]",
                    style: {
                        label: "data(data.albumName)",
                        color: "white",
                        //"background-image": "data(data.coverUrl)",
                        //"background-image":
                        //    "https://i.discogs.com/z1I1AArlfEnsMxt_sDBqwjDo5mlt7f_wrVWkGcrI7e4/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTM3MTQ3/NzgtMTQwMzQ1Nzkw/NS02NjE1LmpwZWc.jpeg",
                        //"background-fit": "cover",
                        //"background-clip": "none",
                        //backgroundColor: "#283FC7",
                    },
                },
            ],
            wheelSensitivity: 0.1,
        });
    }, [nodes, edges, containerDiv]);

    return <div ref={containerDiv} className={`${className}`} style={{ height: 1000 }} />;
};

export default GraphDiv;
