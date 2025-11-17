import { useState, useCallback } from "react";

export default (asyncFunction) => {
    // 设置三个异步逻辑相关的 state
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // 定义一个 callback 用于执行异步逻辑
    const execute = useCallback((...arg) => {
        // 请求开始时，设置 loading 为 true，清除已有数据和 error 状态
        setLoading(true);
        setData(null);
        setError(null);
        // console.log("开始请求");
        return asyncFunction(...arg)
            .then((response) => {
                // 请求成功时，将数据写进 state，设置 loading 为 false
                // console.log(asyncFunction.name, "请求成功，写入数据：", response)
                setData(response);
                setLoading(false);
            })
            .catch((error) => {
                // 请求失败时，设置 loading 为 false，并设置错误状态
                setError(error);
                setLoading(false);
            });
    }, [asyncFunction]);

    return { setData, execute, loading, data, error };
};
