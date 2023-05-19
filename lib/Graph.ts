class Graph<T> {
    originNode: Node<T>;
    nodes: Record<string, Node<T>>;
    edges: Record<string, Edge>;

    private nextId: number;

    constructor(originData: T) {
        this.nodes = {};
        this.edges = {};
        this.nextId = 0;

        const id = this.getNextId();
        this.nodes[id] = {
            id,
            data: originData,
        };
        this.originNode = this.nodes[0];
    }

    public setFromSerializedGraph(nodes: Record<string, Node<T>>, edges: Record<string, Edge>) {
        this.nodes = JSON.parse(JSON.stringify(nodes));
        this.edges = JSON.parse(JSON.stringify(edges));
        this.originNode = this.nodes[0];
        while (this.nodes[this.nextId] || this.edges[this.nextId]) this.nextId++;
    }

    /** Adds a node to the graph as a child of the provided node ID, and returns its ID */
    public addNode(originId: string, nodeData: T): string {
        const originNode = this.nodes[originId];
        if (!originNode) throw new Error(`Index ${originId} not found`);
        const newNodeId = this.getNextId();
        const newEdgeId = this.getNextId();
        this.edges[newEdgeId] = {
            id: newEdgeId,
            source: originId,
            target: newNodeId,
        };
        this.nodes[newNodeId] = {
            id: newNodeId,
            data: nodeData,
        };
        return newNodeId;
    }

    /** Removes the node, and recursively removes all of its children. Cannot be called on the origin node */
    public pruneNode(id: string) {
        if (id === this.originNode.id) return;

        //recursively remove children
        const children = this.getNodeChildren(id);
        for (let i = 0; i < children.length; i++) {
            this.pruneNode(children[i].id);
        }

        //remove the node, and any edges that lead to it
        delete this.nodes[id];
        Object.values(this.edges).forEach(edge => {
            if (edge.target === id) delete this.edges[edge.id];
        });
    }

    /** Gets the child node of the node with the provided ID */
    public getNodeChildren(id: string) {
        const originNode = this.nodes[id];
        if (!originNode) throw new Error(`Index ${id} not found`);
        return Object.values(this.edges)
            .filter(edge => edge.source === id)
            .map(edge => this.nodes[edge.target]);
    }

    /** Returns the parent node of the provided node
     * Returns null if the ID provided is the ID of the origin node
     */
    public getNodeParent(id: string) {
        if (this.originNode.id === id) return null;

        const edgeWithTarget = Object.values(this.edges).find(edge => edge.target === id);
        if (!edgeWithTarget) throw new Error(`Index ${id} not found`);
        return this.nodes[edgeWithTarget.source];
    }

    /** Returns the node IDs representing the path from the origin node to the node with the provided ID.
     * The first index of this array will always be the origin node */
    public getPathToNode(id: string): string[] {
        const path: string[] = [];
        let nodeId = id;
        while (nodeId !== this.originNode.id) {
            path.unshift(nodeId);
            const parent = this.getNodeParent(nodeId);
            if (!parent) throw new Error(`Node ${nodeId} has no parent`);
            nodeId = parent.id;
        }
        path.unshift(this.originNode.id);
        return path;
    }

    private getNextId(): string {
        const newId = this.nextId.toFixed();
        this.nextId++;
        return newId;
    }
}

export interface Node<T> {
    id: string;
    data: T;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
}

export default Graph;
