import { useRouter } from "next/router";
import Layout from "components/layout/Layout";
import AdventureDebug from "components/musicAdventure/AdventureDebug";

const debug = (): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            <AdventureDebug id={(router?.query.mapId as string) || ""} />
        </Layout>
    );
};

export default debug;
