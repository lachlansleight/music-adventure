import FieldHeader from "./FieldHeader";

const TextField = ({
    value,
    onChange,
    label,
    error,
    placeholder,
    required,
    disabled,
    className,
}: {
    value: string;
    onChange: (val: string) => void;
    label?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}): JSX.Element => {
    return (
        <div className={`flex flex-col w-full ${className || ""}`}>
            <FieldHeader label={label} required={required} error={error} />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || ""}
                disabled={disabled}
                className={`${
                    disabled
                        ? "bg-neutral-800 text-neutral-200 px-2 py-1 rounded"
                        : "bg-neutral-700 text-white px-2 py-1 rounded outline-none"
                }`}
            />
        </div>
    );
};

export default TextField;
