import { useCallback } from "react";
import { useRef } from "react"

/**
 * 封装一个函数，保证当前组件下，回调函数只会执行一次
 * @param {*} callback 业务的回调函数，只会执行一次
 * @returns 
 */
const useSingleton = (callback) => {
    const excutedRef = useRef(null);

    return useCallback((args)=>{
        if (excutedRef.current) {
            return;
        }

        callback(args);
        excutedRef.current = true;  
    }, [callback])
}

export default useSingleton;