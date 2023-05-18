import Link from "next/link";
import { ReactNode, useState } from "react";

const Foldout = ({
    className,
    labelClassName,
    label,
    startsOut,
    children,
    url,
    showButton = true,
}: {
    className?: string;
    labelClassName?: string;
    label: string;
    startsOut?: boolean;
    children: ReactNode;
    url?: string;
    showButton?: boolean;
}): JSX.Element => {
    const [isOut, setIsOut] = useState(startsOut || false);

    return (
        <div className={className}>
            <p className={"select-none " + labelClassName || ""}>
                {url ? <Link href={url}>{label}</Link> : label}{" "}
                {showButton ? (
                    <span
                        className="bg-white bg-opacity-50 rounded text-black inline-grid place-items-center w-8 text-center bold cursor-pointer"
                        onClick={() => setIsOut(cur => !cur)}
                    >
                        {isOut ? "▾" : "▸"}
                    </span>
                ) : null}
            </p>
            {isOut ? (
                <div className="pl-8 border-l border-opacity-30 border-white border-dashed">
                    {children}
                </div>
            ) : null}
        </div>
    );
};

export default Foldout;
