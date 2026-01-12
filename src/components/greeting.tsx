// components/greeting.tsx
import { pickGreeting } from "../lib/holidays";

function sizeClassByLength(text: string) {
    const len = text.trim().length;

    // smaller text if overflow
    if (len <= 14) {
        return "text-6xl sm:text-6xl md:text-8xl lg:text-9xl";
    }
    if (len <= 22) {
        return "text-5xl sm:text-5xl md:text-7xl lg:text-8xl";
    }
    return "text-4xl sm:text-4xl md:text-6xl lg:text-7xl";
}

export default function Greeting() {
    // server time
    const { greeting } = pickGreeting(new Date());

    const sizeClass = sizeClassByLength(greeting);

    return (
        <h1
            className={[
                "self-start font-bold text-white mix-blend-difference relative leading-tight",
                "md:px-20 lg:px-32",
                sizeClass,
            ].join(" ")}
        >
            {greeting}
        </h1>
    );
}
