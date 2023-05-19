import Button from "components/controls/Button";

const SelectorHome = ({
    onCreateClicked,
    onLoadClicked,
}: {
    onCreateClicked: () => void;
    onLoadClicked: () => void;
}): JSX.Element => {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-4xl mb-6">Music Adventure</h1>
            <Button onClick={onCreateClicked}>Create New Map</Button>
            <Button onClick={onLoadClicked}>Load Saved Map</Button>
        </div>
    );
};

export default SelectorHome;
