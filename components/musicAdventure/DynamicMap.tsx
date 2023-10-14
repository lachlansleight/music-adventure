import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import useElementDimensions from "lib/hooks/useElementDimensions";
import { useAnimationFrame } from "lib/hooks/useAnimationFrame";
import MusicAdventure from "lib/MusicAdventure";
import { Album } from "lib/types";

const DynamicMap = ({
    mapId,
    className = "",
}: {
    mapId: string;
    className?: string;
}): JSX.Element => {
    const router = useRouter();

    const containerDiv = useRef<HTMLDivElement>(null);
    const size = useElementDimensions(containerDiv);
    const canvasSize = useMemo(() => {
        return {
            width: size.width * 2,
            height: size.height * 2,
        };
    }, [size]);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const [adventure, setAdventure] = useState<MusicAdventure | null>(null);

    const [options] = useState({
        centerForceX: 3,
        centerForceY: 3,
        repelForce: 2000,
        linkForce: 3,
        linkDistance: 200,
        damping: 0.98,
    });

    useEffect(() => {
        if (!containerDiv.current) return;
        if (!canvas.current) return;
        canvas.current.width = canvasSize.width;
        canvas.current.height = canvasSize.height;
        setCtx(canvas.current.getContext("2d") as CanvasRenderingContext2D);
    }, [containerDiv, size, canvas]);

    useEffect(() => {
        if (!mapId) return;
        setAdventure(MusicAdventure.load(mapId));
    }, [mapId]);

    const nodeObjects = useRef<{
        [id: string]: {
            album: Album;
            position: { x: number; y: number };
            velocity: { x: number; y: number };
            parent?: string;
            children: string[];
        };
    }>({});

    const hoveredNode = useRef("");
    const grabbedNode = useRef("");
    const grabTime = useRef(0);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!canvas.current) return;

            //get mouse position in px relative to canvas.current
            const rect = canvas.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            mousePos.current = { x: x * canvasSize.width, y: y * canvasSize.height };
        },
        [canvas, canvasSize, mousePos]
    );

    useEffect(() => {
        if (!adventure) return;
        const allNodes = adventure.getAllAlbums();
        nodeObjects.current = {};
        allNodes.forEach(node => {
            const depth = adventure.getPathToNode(node.id).length;
            const parent = adventure.getParent(node.id);
            const parentConnection = parent ? adventure.getParent(parent.id) : null;
            const directions = adventure.getChildren(node.id);
            const childrenConnections: string[] = parentConnection ? [parentConnection.id] : [];
            for (let i = 0; i < directions.length; i++) {
                const grandchildren = adventure.getChildren(directions[i].id).map(n => n.id);
                childrenConnections.push(...grandchildren);
            }
            const angle = Math.random() * 2 * Math.PI;
            nodeObjects.current[node.id] = {
                album: node.data,
                position: {
                    x:
                        canvasSize.width * 0.25 +
                        100 * depth -
                        options.linkDistance * Math.cos(angle),
                    y: canvasSize.height * 0.5 - options.linkDistance * Math.sin(angle),
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
                parent: parentConnection?.id,
                children: childrenConnections,
            };
        });
    }, [adventure, canvasSize, options]);

    const handleMouseDown = useCallback(() => {
        if (hoveredNode.current !== "") {
            grabbedNode.current = hoveredNode.current;
            grabTime.current = new Date().valueOf();
        }
    }, [mousePos, hoveredNode, grabbedNode]);

    const handleMouseUp = useCallback(() => {
        if (!router) return;
        if (grabbedNode.current && new Date().valueOf() - grabTime.current < 200) {
            router.push(`/map/${mapId}/${grabbedNode.current}`);
        }
        grabbedNode.current = "";
    }, [router, grabbedNode]);

    useAnimationFrame(
        ({ delta }) => {
            if (!adventure) return;
            if (!nodeObjects.current) return;
            if (!ctx) return;
            if (delta > 0.1) return;
            const { width, height } = canvasSize;
            const keys = Object.keys(nodeObjects.current);

            if (!nodeObjects.current) return;
            hoveredNode.current = "";
            if (canvas.current) canvas.current.style.cursor = "default";
            for (let i = 0; i < keys.length; i++) {
                const offsetX = nodeObjects.current[keys[i]].position.x - mousePos.current.x;
                if (Math.abs(offsetX) > 50) continue;
                const offsetY = nodeObjects.current[keys[i]].position.y - mousePos.current.y;
                if (Math.abs(offsetY) > 50) continue;

                hoveredNode.current = keys[i];
                if (canvas.current) canvas.current.style.cursor = "pointer";
                break;
            }

            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < keys.length; i++) {
                const force = { x: 0, y: 0 };
                const nodeA = nodeObjects.current[keys[i]];

                if (grabbedNode.current === keys[i]) {
                    nodeObjects.current[keys[i]].position.x = mousePos.current.x;
                    nodeObjects.current[keys[i]].position.y = mousePos.current.y;
                    continue;
                }

                // if(!nodeA.parent) {
                //     nodeObjects.current[keys[i]].position.x = width / 2;
                //     nodeObjects.current[keys[i]].position.y = height / 2;
                //     continue;
                // }

                force.x += (width / 2 - nodeA.position.x) * options.centerForceX;
                force.y += (height / 2 - nodeA.position.y) * options.centerForceY;

                for (let j = 0; j < keys.length; j++) {
                    if (i === j) continue;
                    const nodeB = nodeObjects.current[keys[j]];
                    const offset = {
                        x: nodeB.position.x - nodeA.position.x,
                        y: nodeB.position.y - nodeA.position.y,
                    };
                    const distance = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
                    const normOffset = { x: offset.x / distance, y: offset.y / distance };

                    if (nodeA.parent === keys[j]) {
                        force.x +=
                            options.linkForce * normOffset.x * (distance - options.linkDistance);
                        force.y +=
                            options.linkForce * normOffset.y * (distance - options.linkDistance);
                    } else {
                        force.x -= (options.repelForce * normOffset.x) / Math.sqrt(distance);
                        force.y -= (options.repelForce * normOffset.y) / Math.sqrt(distance);
                    }
                }

                nodeObjects.current[keys[i]].velocity.x += force.x * delta;
                nodeObjects.current[keys[i]].velocity.y += force.y * delta;

                nodeObjects.current[keys[i]].position.x +=
                    nodeObjects.current[keys[i]].velocity.x * delta;
                nodeObjects.current[keys[i]].position.y +=
                    nodeObjects.current[keys[i]].velocity.y * delta;

                nodeObjects.current[keys[i]].velocity.x *= options.damping;
                nodeObjects.current[keys[i]].velocity.y *= options.damping;
            }

            //draw connections
            Object.keys(nodeObjects.current).forEach(key => {
                const node = nodeObjects.current[key];

                if (node.parent && nodeObjects.current[node.parent]) {
                    const nodeB = nodeObjects.current[node.parent];
                    ctx.strokeStyle = "rgba(255,255,255,0.3)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(node.position.x, node.position.y);
                    ctx.lineTo(nodeB.position.x, nodeB.position.y);
                    ctx.stroke();
                }
            });

            //draw nodes
            Object.keys(nodeObjects.current).forEach(key => {
                const node = nodeObjects.current[key];

                ctx.fillStyle =
                    hoveredNode.current === key ? "rgba(100,150,255,1)" : "rgba(200,200,200,1)";
                ctx.beginPath();
                ctx.ellipse(node.position.x, node.position.y, 10, 10, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.textAlign = "center";
                ctx.font = "18px Arial";
                ctx.fillText(node.album.albumName, node.position.x, node.position.y - 20);
            });
        },
        [ctx, canvas, nodeObjects, canvasSize, mousePos, adventure, hoveredNode, grabbedNode]
    );

    return (
        <div ref={containerDiv} className={`relative w-full ${className}`}>
            <canvas
                className="w-full h-full"
                ref={canvas}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};

export default DynamicMap;
