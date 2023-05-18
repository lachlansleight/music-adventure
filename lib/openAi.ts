import axios from "axios";

export const apiUrl = "https://api.openai.com/v1";

export type OpenAiEngine =
    | "text-davinci"
    | "text-curie-001"
    | "text-babbage-001"
    | "text-ada-001"
    | "gpt-3.5-turbo"
    | "gpt-4"
    | "gpt-4-32k";
export type OpenAiCompletionOptions = {
    suffix?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    n?: number;
    logprobs?: number;
    stop?: string | string[];
    echo?: boolean;
    presence_penalty?: number;
    frequency_penalty?: number;
    best_of?: number;
};
export type OpenAiChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};
export type OpenAiChatCompletionOptions = {
    temperature?: number;
    top_p?: number;
    n?: number;
    stream?: false;
    stop?: string | string[];
    max_tokens?: number;
    echo?: boolean;
    presence_penalty?: number;
    frequency_penalty?: number;
    best_of?: number;
};
export type OpenAiCompletionChoice = {
    text: string;
    index: number;
    logprobs: any;
    finish_reason: string;
};
export type OpenAiChatCompletionChoice = {
    index: number;
    message: OpenAiChatMessage;
    finish_reason: string;
};
export type OpenAiCompletionResponse = {
    id: string;
    object: string;
    created: number;
    model: OpenAiEngine;
    choices: OpenAiCompletionChoice[];
};
export type OpenAiChatCompletionResponse = {
    id: string;
    object: string;
    created: number;
    choices: OpenAiChatCompletionChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
};

class OpenAi {
    static async getCompletion(
        engine: OpenAiEngine,
        prompt: string,
        options?: OpenAiCompletionOptions
    ): Promise<OpenAiCompletionResponse> {
        const response = await axios.post(
            `${apiUrl}/engines/${engine}/completions`,
            {
                prompt,
                ...options,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_KEY}`,
                },
            }
        );
        return response.data;
    }

    static async getChatCompletion(
        model: OpenAiEngine,
        messages: OpenAiChatMessage[],
        options?: OpenAiChatCompletionOptions
    ): Promise<OpenAiChatCompletionResponse> {
        if (model !== "gpt-4" && model !== "gpt-3.5-turbo")
            throw new Error("Invalid model for chat completion");
        const response = await axios.post(
            `${apiUrl}/chat/completions`,
            {
                model,
                messages,
                ...options,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_KEY}`,
                },
            }
        );
        return response.data;
    }

    static estimateCompletionPrice(engine: OpenAiEngine, characterCount: number): number {
        const tokenCount = characterCount / 4000; //very roughly four characters per token to get a rough idea
        switch (engine) {
            case "gpt-3.5-turbo":
                return tokenCount * 0.002;
            case "gpt-4":
                return tokenCount * 0.03;
            case "gpt-4-32k":
                return tokenCount * 0.06;
            case "text-davinci":
                return tokenCount * 0.06;
            case "text-curie-001":
                return tokenCount * 0.006;
            case "text-babbage-001":
                return tokenCount * 0.0012;
            case "text-ada-001":
                return tokenCount * 0.0008;
            default:
                return 0;
        }
    }
}

export default OpenAi;
