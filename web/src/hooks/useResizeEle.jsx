import React, { useState, useEffect } from 'react';

export default useResizeEle = (element) => {
    const [data, setData] = useState({});

    useEffect(() => {
        if (!element) return
        const handleResize = () => {
            setData({
                width: element?.width,
                offsetWidth: element?.offsetWidth
            });
        };

        element.addEventListener('resize', handleResize);
        return () => element.removeEventListener('resize', handleResize);
    }, [element]);
    
    return { data }
}