import { OpenAiChatMessage } from "./openAi";
import { Album } from "./types";

const mainPrompt = `I would like you to make a musical choose your own adventure for me, to help me discover new music. Each step of the process should be formatted as JSON in the following format:

{
  "albumName": "Example Album",
  "artistName": "Example Artist",
  "description": "A one-sentence description of the album",
  "options": [
    { "index": "a", "direction": "Something that is more X" },
    { "index": "b", "direction": "Something that is more Y" }
  ]
}

Present two options with the format "something that is more...", and two options with the format "something else that is also...". The first two options should present albums that differ from the source album in the interesting ways. The second two options should be albums that are similar to the source album in interesting ways.
Don't present more than one album by the same artist.

I will respond with the index of the option I chose. If I respond with 'more options', then you should respond with a JSON object containing an array at the key 'options' containing four more options in the same format as above (with indices starting at the next available letter). I may respond with 'custom: [custom direction]'. Once I make a selection, give me four albums that fit the chosen direction in the following format:

{
    "albums": [
        {
            "index": "a",
            "albumName": "Example Album",
            "artistName": "Example Artist",
            "description": "A one-sentence description of the album"
        },
        {
            "index": "b",
            "albumName": "Another Album",
            "artistName": "Another Artist",
            "description": "A one-sentence description of the album"
        }
    ]
}

I will respond with the index of the album option I choose. If I respond with 'more options', then you should respond with a JSON object containing an array at the key 'albums' containing four more albums in the same format as above (with indices starting at the next available letter). The process should then repeat with that album representing the new origin point for the first JSON format.

All album suggestions should meet the following criteria:
[CRITERIA]

All your responses should be pure JSON.

Let's start with the following album:

[STARTALBUM]
`;

export const systemMessage: OpenAiChatMessage = {
    role: "system",
    content: "You are a helpful assistant",
};

export const getStartingPrompt = (startingAlbum: Album, criteria: string[]) => {
    if (criteria.length > 0) criteria[0] = "-  " + criteria[0];
    let prompt = mainPrompt.replace("[CRITERIA]", criteria.join("\n-  ")).replace(
        "[STARTALBUM]",
        JSON.stringify(
            {
                albumName: startingAlbum.albumName,
                artistName: startingAlbum.artistName,
            },
            null,
            2
        )
    );
    if (criteria.length === 0)
        prompt = prompt.replace(
            "All album suggestions should meet the following criteria:\n\n\n",
            ""
        );
    return prompt;
};

export const wrapMessage = (
    role: "system" | "user" | "assistant",
    content: string
): OpenAiChatMessage => {
    return {
        role,
        content,
    };
};
