import { useEffect, useState } from "react";
import { useAnimationFrame } from "lib/useAnimationFrame";
import ProgressBar from "./controls/ProgressBar";

const FakeProgressBar = ({
    duration,
    className,
}: {
    duration: number;
    className: string;
}): JSX.Element => {
    const [progress, setProgress] = useState(0);
    useAnimationFrame(
        e => {
            setProgress(cur => Math.min(1, cur + e.delta / duration));
        },
        [duration]
    );
    useEffect(() => {
        setProgress(0);
    }, [duration]);

    return <ProgressBar progress={progress} className={className} />;
};

export default FakeProgressBar;
