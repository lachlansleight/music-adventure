import { ReactNode } from "react";
import Head from "next/head";

const Layout = ({ children }: { children: ReactNode }): JSX.Element => {
    return (
        <>
            <Head>
                <title>Music Adventure</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="min-h-screen bg-neutral-900 text-white">
                <div className="w-[1000px] m-auto py-8">{children}</div>
            </main>
        </>
    );
};

export default Layout;
