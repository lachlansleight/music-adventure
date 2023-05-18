import { ReactNode } from "react";

const Button = ({
    className,
    children,
    onClick,
    disabled,
}: {
    className?: string;
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
}): JSX.Element => {
    return (
        <button
            disabled={disabled}
            className={`${
                disabled
                    ? "text-lg grid place-items-center px-4 py-1 rounded mt-4 bg-neutral-700 text-neutral-400 font-bold"
                    : "text-lg grid place-items-center px-4 py-1 rounded mt-4 bg-primary-400 text-neutral-900 font-bold"
            } ${className || ""}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
