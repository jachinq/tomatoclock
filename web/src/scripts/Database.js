import Toast from "../component-ui/Toast";
import EventBus from "./EventBus";
import Util, { mesgNotice, music } from "./Util";
import mitt from "./mitt";

const IS_DEV = true;
const BACKEND_URL = IS_DEV ? "http://localhost:8080" : "";

async function fetchData(cmd, params) {
    if (cmd === null || cmd === undefined) return;
    if (!(params instanceof Object)) return;

    const urlParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        urlParams.append(key, params[key]);
    })
    const url = `${BACKEND_URL}/api/${cmd}`;
    return await fetch(url, {
        method: "POST",
        body: urlParams.toString(),
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    });
}

// 查历史记录
export async function get_historys(form) {
    // return null || [];
    const params = form ? {
        begTime: form.begTime ? new Date(form.begTime + " 00:00:00").getTime() : undefined,
        endTime: form.endTime ? new Date(form.endTime + " 23:59:59").getTime() : undefined,
        page: form.page || 0,
        limit: form.limit || 0,
    } : {};

    let res = await fetchData("get_historys", params);
    if (res.status === 200) {
        const json = await res.json();
        // console.log(json);
        return json.data?.list || [];
    } else {
        console.log("get list error", res);
        return []
    }
}

// 查历史记录
export async function get_historys_page(form) {
    // return null || [];
    const params = form ? {
        begTime: form.begTime ? new Date(form.begTime + " 00:00:00").getTime() : undefined,
        endTime: form.endTime ? new Date(form.endTime + " 23:59:59").getTime() : undefined,
        page: form.page || 0,
        limit: form.limit || 0,
    } : {};

    let res = await fetchData("get_historys", params);
    if (res.status === 200) {
        const json = await res.json();
        console.log(json);
        return json.data || [];
    } else {
        console.log("get list error", res);
        return []
    }
}

// 删除指定id的历史记录
export async function del_history(id) {
    const params = { id }
    let res = await fetchData("del_history", params);
    if (res.status === 200) {
        const json = await res.json();
        if (json.success) {
            Toast.success(json.msg || "删除成功");
        } else {
            Toast.error(json.msg || "删除失败");
        }
    } else {
        Toast.error("请求失败.status=" + res.status);
        console.log("del error", res);
    }
}

// 新增历史记录
export async function add_history(history) {
    let res = await fetchData("add_history", history);
    if (res.status === 200) {
        const json = await res.json();
        if (json.success) {
            // Toast.success(json.msg || "添加成功");
            return true;
        } else {
            Toast.error("添加历史记录失败" + json.msg);
        }
    } else {
        Toast.error("请求失败.status=" + res.status);
        console.log("add error", res);
    }
    return false;
}

// 修改指定id的历史记录
export async function set_history(history, close = () => { }) {
    const res = await fetchData("set_history", history);
    if (res.status === 200) {
        const json = await res.json();
        if (json.success) {
            Toast.success("修改成功");
        } else {
            Toast.error(json.msg || "修改失败");
        }
        console.log(close);
        close(json.success);
    } else {
        Toast.error("请求失败 status=" + res.status);
        console.log("del error", res);
    }
}


// 修改指定id的map-data
export async function set_config(id, config, close = () => { }) {
    const params = { id, config: JSON.stringify(config) };
    const res = await fetchData("set_config", params);
    if (res.status === 200) {
        const json = await res.json();
        if (json.success) {
            // if (id !== 'tomato') {
            //     Toast.success(json.msg || "修改成功");
            // }
        } else {
            Toast.error(json.msg || "修改失败");
        }
        // console.log(close);
        close(json.success);
    } else {
        Toast.error("请求失败 status=" + res.status);
        console.log("del error", res);
    }
}

// 查 map_data
export async function get_config(id) {
    try {
        const params = { id };
        let res = await fetchData("get_config", params);
        if (res.status === 200) {
            const json = await res.json();
            if (json.data && json.data.config) {
                try {
                    return JSON.parse(json.data.config);
                } catch (e) {
                    console.error(e);
                }
            }
            return {}
        } else {
            console.log("get list error", res);
            return {}
        }
    } catch (e) {
        console.error(e);
    }
}

export async function get_setting() {
    return await get_config("setting");
}

export async function set_theme(newVal) {
    try {
        let data = await get_setting();
        if (data === undefined || data === null || Object.keys(data).length === 0) return;
    
        let { dark = true} = data || {};
        // 如果不一致则刷新
        if (dark !== newVal) {
            set_config("setting", { ...data, dark: newVal })
            mitt.emit(EventBus.REFRESH_SETTING);
        };
    } catch (e) {
        console.error(e);
    }
}

// 获取默认配置的休息时间
export async function get_resetTime(clock={}) {
    try {
        let data = await get_setting();

        // console.log("setting", data);
        music(data);
        mesgNotice(data, "完成", `${clock.name}完成啦，点击查看`);

        let value = data?.clockRestTime;
        if (value !== null && value !== undefined && value !== "") {
            if (Number.isInteger(parseInt(value))) {
                return value.toString().padStart(2, "0");
            }
        }
    } catch (e) {
        console.error(e);
    }
    return "05";
}

// 获取当前或上一个番茄钟
export async function get_tomato() {
    try {
        let data = await get_config("tomato");
        return data;
    } catch (e) {
        console.error(e);
    }
    return null;
}
// 更新当前或上一个番茄钟
export async function set_tomato(tomato) {
    try {
        await set_config("tomato", tomato);
    } catch (e) {
        console.error(e);
    }
}

// 获取当前是否启用背景音乐
export async function get_bgMusic(play) {
    try {
        let data = await get_setting();

        let { music = false, musicUrl = "" } = data || {};
        musicUrl = musicUrl.toString().trim();

        // 如果不一致则刷新
        if (play !== music) {
            set_config("setting", { ...data, music: play });
            mitt.emit(EventBus.REFRESH_SETTING);
        }

        return {
            music: play,
            musicUrl
        }
    } catch (e) {
        console.error(e);
    }
    return {};
}

// 获取其他数据
export async function get_other() {
    try {
        return await get_config("other");
    } catch (e) {
        console.error(e);
    }
    return {};
}

// 设置其他数据
export async function set_other(data) {
    try {
        return await set_config("other", data);
    } catch (e) {
        console.error(e);
    }
    return {};
}

// 导入数据
export async function import_data(data, close = () => { }) {
    const importData = JSON.parse(data);
    if (!importData) return;

    let msg = "";
    if (importData.setting) {
        set_config("setting", importData.setting);
        close();
        setTimeout(() => {
            mitt.emit(EventBus.REFRESH_SETTING);
            console.log("导入设置，刷新页面样式");
            mitt.emit(EventBus.REFRESH_UI, importData.setting)
        }, 10);
        msg += `导入设置成功~`;
    }

    if (importData.history) {
        const localHistory = await get_historys();
        const importHistory = importData.history;
        const idMap = {}
        localHistory.map(item => idMap[item.id] = true);
        const imports = [];
        importHistory.map(async item => {
            if (item && item.id && item.id !== '' && idMap[item.id] !== true) {
                imports.push(item);
                add_history(item);
            }
        })
        if (imports?.length > 0) {
            msg += `共导入${imports?.length}条历史记录。`;
        }
    }

    if (msg && msg !== "") {
        Toast.success(msg)
    }
}

// 导出数据
export async function export_data() {
    const history = await get_historys();
    const setting = await get_setting();
    const backup = {
        history, setting
    }
    console.log(backup);
    Util.downloadText('', JSON.stringify(backup));
}