import { useState, useEffect, useMemo } from 'react'

// .............................................................
// Hook que detecta si un elemento está visible en pantalla usando Intersection Observer API
const useElementOnScreen = (options, targetRef) => {

    const [isVisible, setIsVisible] = useState(false);

    // .............................
    const callbackFunction = (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
    }

    // .............................
    const optionsMemo = useMemo(() => options, [options]);

    // .............................
    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunction, optionsMemo);
        const currentTarget = targetRef.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        }
    }, [targetRef, optionsMemo]);

    // .............................
    return isVisible;
}

export default useElementOnScreen