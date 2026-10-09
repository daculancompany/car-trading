import { useCallback, useState } from "react";

export const MAX_COMPARE = 3;

export const useCompare = () => {
    const [ids, setIds] = useState<number[]>([]);

    const toggle = useCallback((id: number) => {
        setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.length >= MAX_COMPARE ? current : [...current, id]));
    }, []);

    const clear = useCallback(() => setIds([]), []);

    return { ids, toggle, clear, full: ids.length >= MAX_COMPARE };
};
