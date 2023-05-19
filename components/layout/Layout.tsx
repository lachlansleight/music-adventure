import { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

const Layout = ({
    padding = 2,
    children,
}: {
    padding?: number;
    children?: ReactNode;
}): JSX.Element => {
    return (
        <>
            <Head>
                <title>Music Adventure</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="w-screen min-h-screen bg-neutral-900 text-white">
                <div
                    className="w-screen h-10"
                    style={{
                        boxShadow: "0px 5px 5px rgba(0,0,0,0.2)",
                    }}
                >
                    <div className="md: w-[1000px] m-auto h-full">
                        <div className="flex h-full gap-4 items-center text-lg text-white text-opacity-50">
                            <Link href="/" className="h-full">
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
                <div
                    className="w-screen md:w-[1000px] m-auto"
                    style={{
                        paddingTop: `${padding}rem`,
                        paddingBottom: `${padding}rem`,
                    }}
                >
                    {children}
                </div>
            </main>
        </>
    );
};

export default Layout;
