import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";
import axios from "axios";
import Layout from "components/layout/Layout";
import { Album, BranchPresentation, OptionsPresentation } from "lib/types";
import TextField from "components/controls/TextField";
import Button from "components/controls/Button";
import { OpenAiChatMessage } from "lib/openAi";
import AlbumTile from "components/AlbumTile";

const HomePage = (): JSX.Element => {
    const [startingAlbum, setStartingAlbum] = useState<Album>({
        artistName: "Bridget St John",
        albumName: "Songs for the Gentle Man",
    });
    const [criteria, setCriteria] = useState<string[]>([
        "Released after 1965 and before 1980",
        "obscure",
    ]);
    const [sequence, setSequence] = useState<
        {
            branch: BranchPresentation;
            branchChoice: string;
            options: OptionsPresentation;
            optionsChoice: string;
        }[]
    >([]);
    const [phase, setPhase] = useState<"startup" | "branch" | "options">("startup");
    const [pastMessages, setPastMessages] = useState<OpenAiChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const submit = useCallback(
        async (choice: string) => {
            setLoading(true);
            switch (phase) {
                case "startup":
                    setPhase("branch");
                    break;
                case "branch":
                    setPhase("options");
                    break;
                case "options":
                    setPhase("branch");
                    break;
            }
            const response =
                phase === "startup"
                    ? await axios.post("api/getResponse", { setup: { startingAlbum, criteria } })
                    : await axios.post("api/getResponse", {
                          pastMessages: [...pastMessages, { role: "user", content: choice }],
                      });
            console.log(response.data);
            switch (phase) {
                case "startup":
                case "options":
                    setSequence(cur => [
                        ...cur,
                        {
                            branch: response.data.parsedResponse,
                            branchChoice: "",
                            options: {
                                albums: [],
                            },
                            optionsChoice: "",
                        },
                    ]);
                    setPastMessages(response.data.messages);
                    break;
                case "branch":
                    setSequence(cur => {
                        return cur.map((c, i) => {
                            if (i !== cur.length - 1) return c;
                            return {
                                ...c,
                                options: response.data.parsedResponse,
                            };
                        });
                    });
                    setPastMessages(response.data.messages);
                    break;
            }

            setLoading(false);
        },
        [startingAlbum, criteria, phase, pastMessages]
    );

    if (loading) {
        return (
            <Layout>
                <div className="h-96 grid place-items-center">
                    <div className="flex flex-col gap-2 items-center">
                        <FaSync className="text-4xl animate-spin" />
                        <p>Thinking</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {phase === "startup" && (
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl text-white">Music Adventure</h1>
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
                    <div>
                        <h2 className="text-lg">Criteria</h2>
                        <ul>
                            {criteria.map((c, i) => (
                                <li key={i} className="flex gap-2 relative">
                                    <TextField
                                        value={c}
                                        onChange={val =>
                                            setCriteria(cur =>
                                                cur.map((c, j) => (i === j ? val : c))
                                            )
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
                    </div>
                    <Button onClick={() => submit("")}>Begin!</Button>
                </div>
            )}
            {phase === "branch" && (
                <div>
                    <AlbumTile album={sequence.slice(-1)[0].branch} />
                    <div className="flex gap-2 flex-col">
                        {sequence.slice(-1)[0].branch.options.map((o, i) => (
                            <div
                                key={i}
                                className="rounded bg-white bg-opacity-5 hover:bg-opacity-20 transition-all cursor-pointer select-none px-1 py-2"
                                onClick={() => submit(o.index)}
                            >
                                <p>
                                    {o.index} - {o.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {phase === "options" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sequence.slice(-1)[0].options.albums.map((o, i) => (
                        <AlbumTile album={o} key={i}>
                            <Button onClick={() => submit(o.index)}>Select This Album</Button>
                        </AlbumTile>
                    ))}
                    <Button className="col-span-2" onClick={() => submit("more options")}>
                        See more options
                    </Button>
                </div>
            )}
        </Layout>
    );
};

export default HomePage;

/*
//Leaving this here so that I don't have to keep looking up the syntax...
import { GetServerSidePropsContext } from "next/types";
export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<{ props: any }> {
    return {
        props: {  },
    };
}
*/
