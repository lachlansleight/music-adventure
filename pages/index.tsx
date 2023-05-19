import { useRouter } from "next/router";
import Layout from "components/layout/Layout";
import AdventureSelector from "components/musicAdventure/selector/AdventureSelector";

const IndexPage = (): JSX.Element => {
    const router = useRouter();

    const gotoAdventure = (id: string) => {
        router.push(`/map/${id}/0`);
    };

    return (
        <Layout>
            <AdventureSelector onAdventureChosen={gotoAdventure} />
        </Layout>
    );
};

export default IndexPage;
