import { Node } from "lib/Graph";
import { Album, Direction, isAlbum } from "./types";
import MusicAdventure from "./MusicAdventure";
import { getUrlSafeName } from "./text";

class MarkdownUtils {
    static getAlbumNodeMarkdown(mapId: string, nodeId: string, withTitle = false): string {
        const adventure = MusicAdventure.load(mapId);
        const node = adventure.getNode(nodeId);
        if (!isAlbum(node.data)) return "";

        const album = node.data;
        let markdown = withTitle
            ? `# ${album.albumName.replace(/\*"\\\/<>:\|\?/g, "")}, ${album.artistName}\n`
            : "";
        markdown += `${album.description}\n`;
        markdown += `[YouTube Album Link](https://www.youtube.com/results?search_query=${getUrlSafeName(
            album.artistName
        )}+${getUrlSafeName(album.albumName)}+full+album)\n\n`;

        const children = adventure.getChildren(nodeId).map(c => c as Node<Direction>);
        children.forEach(child => {
            markdown += `${child.data.direction}\n`;
            const grandchildren = adventure.getChildren(child.id).map(c => c as Node<Album>);
            if (grandchildren.length > 0) {
                grandchildren.forEach(grandchild => {
                    markdown += `-  [[${grandchild.data.albumName}, ${grandchild.data.artistName}]]\n`;
                });
            }
        });

        return markdown;
    }
}

export default MarkdownUtils;
