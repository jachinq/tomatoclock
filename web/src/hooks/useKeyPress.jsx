import { useState, useEffect } from "react";

/**
 * 处理键盘输入事件
 * @param {*} domNode 
 * @returns 按键对应的 keyCode
 */
const useKeyPress = (domNode = document.body) => {
    const [key, setKey] = useState(null);
    useEffect(() => {
        const handleKeyPress = (evt) => {
            setKey(evt?.keyCode);
        }

        domNode.addEventListener('keypress', handleKeyPress);

        return () => {
            domNode.removeEventListener('keypress', handleKeyPress)
        };
    }, [domNode])

    return key;
};

export default useKeyPress;