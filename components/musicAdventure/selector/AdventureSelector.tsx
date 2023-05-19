import { useState } from "react";
import SelectorHome from "./SelectorHome";
import SelectorCreate from "./SelectorCreate";
import SelectorLoad from "./SelectorLoad";

const AdventureSelector = ({
    onAdventureChosen,
}: {
    onAdventureChosen: (id: string) => void;
}): JSX.Element => {
    const [page, setPage] = useState<"home" | "create" | "load">("home");

    return (
        <div
            className={`${page === "home" ? "grid place-items-center" : ""} w-full px-4`}
            style={{
                height: page === "home" ? `calc(100vh - 4rem)` : undefined,
            }}
        >
            {page === "home" && (
                <SelectorHome
                    onCreateClicked={() => setPage("create")}
                    onLoadClicked={() => setPage("load")}
                />
            )}
            {page === "create" && (
                <SelectorCreate
                    onBackClicked={() => setPage("home")}
                    onConfirm={onAdventureChosen}
                />
            )}
            {page === "load" && (
                <SelectorLoad onBackClicked={() => setPage("home")} onConfirm={onAdventureChosen} />
            )}
        </div>
    );
};

export default AdventureSelector;
