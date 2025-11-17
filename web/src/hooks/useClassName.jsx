import { useCallback } from "react";

/**
 * 根据 object，生成 className，
 * @param {"className": Boolean} object value=true 则组合对应的 "className"
 * @returns function
 */
const useClassName = () => {
    return useCallback((object) => {
        const classNameList = [];
        Object.keys(object).map(key => {
            if (object[key]) {
                classNameList.push(key);
            }
        })
        return classNameList.join(' ');
    }, []);
}

export default useClassName;