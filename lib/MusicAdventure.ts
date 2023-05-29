import axios from "axios";
import Graph, { Edge, Node } from "./Graph";
import { getStartingPrompt, systemMessage, wrapMessage } from "./gpt";
import { OpenAiChatMessage } from "./openAi";
import { Album, Direction, isAlbum } from "./types";

export type MusicAdventureData = {
    id: string;
    nodes: Record<string, Node<Album | Direction>>;
    edges: Record<string, Edge>;
    criteria: string[];
};

class MusicAdventure {
    public loading: boolean;
    public id: string;
    public startingAlbum: Album;
    public criteria: string[];
    private graph: Graph<Album | Direction>;

    public onLoadingChanged: ((loading: boolean) => void) | null;
    public onDataChanged: ((data: Graph<Album | Direction>) => void) | null;

    constructor(startingAlbum?: Album, criteria?: string[]) {
        this.id = new Date().valueOf().toFixed();
        this.loading = false;
        this.startingAlbum = startingAlbum || {
            albumName: "",
            artistName: "",
            description: "",
            index: "0",
            coverUrl: "",
        };
        this.criteria = criteria || [];
        this.graph = new Graph<Album | Direction>({ ...this.startingAlbum });
        this.onDataChanged = null;
        this.onLoadingChanged = null;
    }

    public static load(id: string): MusicAdventure {
        const adventure = new MusicAdventure();
        adventure.loadFromLocalStorage(id);
        return adventure;
    }

    public setFromSerializedData(data: MusicAdventureData) {
        this.id = data.id;
        this.criteria = data.criteria;
        this.graph.setFromSerializedGraph(data.nodes, data.edges);
        this.startingAlbum = this.graph.originNode.data as Album;
        if (this.onDataChanged) this.onDataChanged(this.graph);
    }

    public saveToLocalStorage() {
        const ids: string[] = JSON.parse(localStorage.getItem("mapIds") || "[]");
        if (!ids.includes(this.id)) ids.push(this.id);
        localStorage.setItem("adventure_" + this.id, JSON.stringify(this.getData()));
        localStorage.setItem("mapIds", JSON.stringify(ids));
    }

    public loadFromLocalStorage(id: string) {
        this.id = id;
        const dataString = localStorage.getItem("adventure_" + id);
        if (!dataString) return;
        const data = JSON.parse(dataString) as MusicAdventureData;
        if (!data.id) data.id = id;
        this.setFromSerializedData(data);
    }

    public getPathToNode(nodeId: string) {
        return this.graph.getPathToNode(nodeId);
    }

    public getChatHistoryAtNode(id: string): OpenAiChatMessage[] {
        const path = this.graph.getPathToNode(id);
        console.log({ id, path });
        const chatHistory: OpenAiChatMessage[] = [];
        chatHistory.push(systemMessage);
        chatHistory.push(
            wrapMessage("assistant", getStartingPrompt(this.startingAlbum, this.criteria))
        );
        if (this.graph.originNode.id === id) {
            const children = this.graph.getNodeChildren(id);
            if (!children || children.length === 0) return chatHistory;
            chatHistory.push(this.getChatMessageOfNode(this.graph.originNode.id));
            return chatHistory;
        }
        chatHistory.push(this.getChatMessageOfNode(this.graph.originNode.id));

        for (let i = 1; i < path.length; i++) {
            const node = this.graph.nodes[path[i]];
            const data = node.data;
            chatHistory.push(wrapMessage("user", data.index));
            try {
                chatHistory.push(this.getChatMessageOfNode(path[i]));
            } catch {
                break;
            }
        }

        return chatHistory;
    }

    public getChatMessageOfNode(id: string): OpenAiChatMessage {
        const node = this.graph.nodes[id];
        if (!node) throw new Error(`Node ${id} not found`);
        const childNodes = this.graph.getNodeChildren(id);
        if (!childNodes || childNodes.length === 0) {
            throw new Error(`Node ${id} has no children`);
        }
        const data = node.data;
        if (isAlbum(data)) {
            return wrapMessage(
                "assistant",
                JSON.stringify(
                    {
                        albumName: data.albumName,
                        artistName: data.artistName,
                        description: data.description,
                        options: childNodes.map(child => child.data as Direction),
                    },
                    null,
                    2
                )
            );
        } else {
            return wrapMessage(
                "assistant",
                JSON.stringify(
                    {
                        albums: childNodes.map(child => {
                            const album = child.data as Album;
                            return {
                                index: album.index,
                                albumName: album.albumName,
                                artistName: album.artistName,
                                description: album.description,
                            };
                        }),
                    },
                    null,
                    2
                )
            );
        }
    }

    /** When the app is first run, all we have is the album and artist name.
     * This gets a one-sentence description from GPT-4, and an album image from Discogs
     */
    public async setStartingAlbum(albumName: string, artistName: string) {
        this.setLoading(true);

        const response = await axios.post("/api/populateRootNode", {
            albumName: albumName,
            artistName: artistName,
        });
        this.startingAlbum = response.data;
        this.graph.originNode.data = response.data;
        if (this.onDataChanged) this.onDataChanged(this.graph);

        this.setLoading(false);
    }

    /** Once we have the first album, this function creates the initial directions.
     * Once this is done, everything else is just the normal recursive functions where we choose direcitons and albums
     */
    public async populateFirstAlbumDirections() {
        this.setLoading(true);

        const albumNode = this.graph.originNode;
        const history = this.getChatHistoryAtNode(albumNode.id);
        console.log("Getting GPT-4 continuation of the following chat", history);
        const response = await axios.post("/api/continueChat", { chatHistory: history });
        // const response: any = {
        //     data: {
        //         albumName: "The album you just said",
        //         artistName: "I don't know the artist lol",
        //         description: "Bruh this is just test data",
        //         options: [
        //             {
        //                 index: "a",
        //                 description: "Something more instrumental"
        //             },
        //             {
        //                 index: "b",
        //                 description: "Something more electronic"
        //             }
        //         ]
        //     }
        // }
        // await new Promise(resolve => setTimeout(resolve, 1000));
        if (response.data.invalidResponse) {
            console.error("Invalid response from GPT4:", response.data.invalidResponse);
            throw new Error("GPT-4 returned invalid response: " + response.data.invalidResponse);
        }
        console.log("Got response", response.data);
        const newDirections = response.data.options as Direction[];
        for (let i = 0; i < newDirections.length; i++) {
            this.graph.addNode(albumNode.id, newDirections[i]);
        }
        if (this.onDataChanged) this.onDataChanged(this.graph);
        this.setLoading(false);
    }

    /** Takes in the ID of an album node and the index of the direction choice,
     * and asks GPT-4 to generate a list of albums that fit that direction, adding them to the graph as child nodes of the direction
     */
    public async chooseDirection(parentAlbumId: string, directionIndex: string) {
        this.setLoading(true);

        const parentNode = this.graph.nodes[parentAlbumId];
        if (!parentNode) throw new Error(`Parent album ${parentAlbumId} not found`);
        const directionNode = this.graph
            .getNodeChildren(parentAlbumId)
            .find(node => node.data.index === directionIndex);
        if (!directionNode) throw new Error(`Direction ${directionIndex} not found`);

        const history = this.getChatHistoryAtNode(directionNode.id);
        console.log("Getting GPT-4 continuation of the following chat", history);
        const response = await axios.post("/api/continueChat", { chatHistory: history });
        // const response: any = {
        //     data: {
        //         albums: [
        //             {
        //                 index: "a",
        //                 albumName: "Piper at the Gates of Dawn",
        //                 artistName: "Pink Floyd",
        //                 description: "Wow what a nice album",
        //                 coverUrl: "http://example.com/test.jpg"
        //             }
        //         ]
        //     }
        // }
        // await new Promise(resolve => setTimeout(resolve, 1000));
        if (response.data.invalidResponse) {
            console.error("Invalid response from GPT4:", response.data.invalidResponse);
            throw new Error("GPT-4 returned invalid response: " + response.data.invalidResponse);
        }
        console.log("Got response", response.data);
        const newAlbums = response.data.albums as Album[];
        for (let i = 0; i < newAlbums.length; i++) {
            const newAlbum = newAlbums[i];
            const discogsInfo = await axios.post("/api/getDiscogsInfo", {
                albumName: newAlbum.albumName,
                artistName: newAlbum.artistName,
            });
            newAlbum.coverUrl = discogsInfo.data.cover_image;
            this.graph.addNode(directionNode.id, newAlbum);
        }
        console.log("New albums: ", newAlbums);
        if (this.onDataChanged) this.onDataChanged(this.graph);
        this.setLoading(false);
    }

    public async chooseAlbum(parentDirectionId: string, albumIndex: string) {
        this.setLoading(true);

        const parentNode = this.graph.nodes[parentDirectionId];
        if (!parentNode) throw new Error(`Parent direction ${parentDirectionId} not found`);
        const albumNode = this.graph
            .getNodeChildren(parentDirectionId)
            .find(node => node.data.index === albumIndex);
        if (!albumNode) throw new Error(`Album ${albumIndex} not found`);

        const history = this.getChatHistoryAtNode(albumNode.id);
        console.log("Getting GPT-4 continuation of the following chat", history);
        const response = await axios.post("/api/continueChat", { chatHistory: history });
        // const response: any = {
        //     data: {
        //         albumName: "The album you just said",
        //         artistName: "I don't know the artist lol",
        //         description: "Bruh this is just test data",
        //         options: [
        //             {
        //                 index: "a",
        //                 description: "Something more instrumental"
        //             },
        //             {
        //                 index: "b",
        //                 description: "Something more electronic"
        //             }
        //         ]
        //     }
        // }
        // await new Promise(resolve => setTimeout(resolve, 1000));
        if (response.data.invalidResponse) {
            console.error("Invalid response from GPT4:", response.data.invalidResponse);
            throw new Error("GPT-4 returned invalid response: " + response.data.invalidResponse);
        }
        console.log("Got response", response.data);
        const newDirections = response.data.options as Direction[];
        for (let i = 0; i < newDirections.length; i++) {
            this.graph.addNode(albumNode.id, newDirections[i]);
        }
        if (this.onDataChanged) this.onDataChanged(this.graph);
        this.setLoading(false);
    }

    public getNode(id: string): Node<Album | Direction> {
        return this.graph.nodes[id];
    }

    public getParent(id: string): Node<Album | Direction> | null {
        return this.graph.getNodeParent(id);
    }

    public getChildren(id: string): Node<Album | Direction>[] {
        return this.graph.getNodeChildren(id);
    }

    public getOriginNode() {
        return this.graph.originNode;
    }

    public addNodeDebug(parentId: string, data: Album | Direction) {
        const newId = this.graph.addNode(parentId, data);
        if (this.onDataChanged) this.onDataChanged(this.graph);
        return newId;
    }

    public pruneNode(id: string) {
        this.graph.pruneNode(id);
        if (this.onDataChanged) this.onDataChanged(this.graph);
    }

    private setLoading(val: boolean) {
        this.loading = val;
        if (this.onLoadingChanged) this.onLoadingChanged(this.loading);
    }

    public getRawData() {
        return {
            nodes: this.graph.nodes,
            edges: this.graph.edges,
        };
    }

    public getData(): MusicAdventureData {
        return {
            id: this.id,
            nodes: this.graph.nodes,
            edges: this.graph.edges,
            criteria: this.criteria,
        };
    }
}

export default MusicAdventure;
