import { useEffect, useMemo, useState } from "react"
import mitt from "../scripts/mitt";
import EventBus from "../scripts/EventBus";
import useAsync from "../hooks/useAsync";
import Util, { formatDateTime } from "../scripts/Util";
import Toast from "../component-ui/Toast";
import { get_other, get_setting, set_other } from "../scripts/Database";

const className = "left-0 top-2 fixed text-sm hover:cursor-pointer max-w-xs";
const style = { writingMode: 'vertical-lr', textOrientation: 'upright', letterSpacing: '4px' };


export default function Yiyan({ setting }) {
    const { execute: getOther, data: other } = useAsync(get_other);
    const { execute: setOther } = useAsync(set_other);
    const [config, setConfig] = useState({});

    useEffect(() => {
        if (!setting) return;
        // const tmp = {
        //     url: "https://api.likepoems.com/ana/yiyan/",
        //     call: async (res) => {
        //         return await res.text();
        //     }
        // };

        const { yiyanConfig = undefined } = setting || {};
        if (yiyanConfig && yiyanConfig.trim() !== "") {
            try {
                const conf = JSON.parse(yiyanConfig);
                console.log(conf);
                conf.call = eval(conf.call); // 通过 eval 把回调方法解析出来
                setConfig(conf);
                return;
            } catch (e) {
                console.log(e);
            }
        }

        const defaultValue = {
            url: "https://v1.hitokoto.cn/",
            call: async (res) => {
                const json = await res.json();
                const { hitokoto = "", from, from_who } = json || {};
                let showSuffix = from || from_who;
                let suffix = "——";
                if (from) suffix += `《${from}》`;
                if (from_who) suffix += `${from_who}`;
                return hitokoto + (showSuffix ? suffix : "");
            }
        }
        setConfig(defaultValue);

    }, [setting])

    useEffect(() => {
        if (!other) return;
        const today = formatDateTime(new Date().getTime());
        const { date, yan } = other?.yiyan || {}; // 不是手动刷新的话，每天只从接口获取一次新数据
        if (date === today && yan !== null && yan !== undefined && yan !== "") {
            setYiyan(yan)
        } else {
            fetchYiyan(); // 缓存没有，请求接口拿
        }
    }, [other])


    // 通过 useAsync 这个函数，只需要提供异步逻辑的实现
    const { setData: setYiyan, execute: fetchYiyan, data, loading, error } = useAsync(
        async () => {
            const res = await fetch(config.url);
            if (res.status === 200) {
                const today = formatDateTime(new Date().getTime());
                const text = await config.call(res);
                other.yiyan = { date: today, yan: text };
                setOther(other);
                return text;
            } else {
                console.log("get yiyan error", res);
            }
            return "";
        },
    );

    useEffect(() => {
        mitt.on(EventBus.OPEN_YIYAN, getYiyan);
        return () => {
            mitt.off(EventBus.OPEN_YIYAN, getYiyan)
        }
    }, [])

    const getYiyan = (open = true, manual = false) => {
        if (!open) {
            setYiyan("");
            return
        }
        if (!manual) { // 非手动刷新，走缓存
            getOther();
        }
        else { // 从接口拿
            if (loading) return
            fetchYiyan();
        }
    }

    return <>
        {error &&
            <div className={className} style={style}>
                <div className=" text-red-400">Failed: {String(error)}</div>
            </div>}

        {data && data !== '' &&
            <div className={className} style={style}
                onClick={() => { Util.copyText(data); Toast.info('已复制~') }}
                onDoubleClick={() => getYiyan(true, true)}>
                <div className="px-4 py-2 rounded">
                    {data}
                </div>
            </div>}
    </>
}