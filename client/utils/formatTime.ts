import { useEffect, useState } from "react";

export function formatTime(isoString? : string | null) : string{
    if(!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if(diffMins<1) return"just now";
    if(diffHours < 1) return `${diffMins}m ago`;
    if(diffDays < 1) {
        return date.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", hour12: true})
    }
    if(diffDays === 1) return "Yesterday";
    if (diffDays < 7){
        return date.toLocaleDateString([], {month: "short", day:"numeric"});
    }
    return date.toLocaleDateString([], {month: "short", day:"numeric"});
}


export function useLiveTime(intervalMs: number = 30000) {
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const id = setInterval(() => forceUpdate((n) => n + 1), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
}