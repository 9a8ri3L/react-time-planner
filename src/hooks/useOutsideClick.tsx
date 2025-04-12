import React, { useEffect, useRef } from 'react';
interface UseClickOutside {
    open: boolean;
    close: () => void;
    triggerRef: React.RefObject<HTMLElement>;
}
export function useClickOutside<T extends HTMLElement>(
    // isOpen: boolean,
    // onClose: () => void,
    // excludeRef?: React.RefObject<HTMLElement>,
    { open, close, triggerRef }: UseClickOutside,
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const clickedOutsideRef =
                ref.current && !ref.current.contains(event.target as Node);
            const clickedOutsideExcluded = triggerRef?.current
                ? !triggerRef.current.contains(event.target as Node)
                : true;

            if (open && clickedOutsideRef && clickedOutsideExcluded) {
                close();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                close();
            }
        };

        document.addEventListener('click', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [open, close, triggerRef]);

    return ref;
}
