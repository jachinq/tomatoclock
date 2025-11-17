const storge = localStorage;

const Key = {
    TOMATO: 'tomato', // 当前时钟
    HISTORY: 'history', // 历史完成
    SETTING: 'setting', // 设置
    OTHER: 'other', // 其他
}

const setData = (key, data) => {
    storge.setItem(key, JSON.stringify(data));
}
const getObject = (key) => {
    return JSON.parse(storge.getItem(key) || "{}");
}
const getList = (key) => {
    return JSON.parse(storge.getItem(key) || "[]");
}

const addItem = (key, data) => {
    const list = JSON.parse(storge.getItem(key));
    if (list === undefined || list === null) {
        setData(key, [data]);
        return;
    }
    if (!list instanceof Array) {
        console.log(key, 'data is not array', list);
        return;
    }

    setData(key, [data, ...list]); // 插到首位
}

export default {
    getTomato: ()=> getObject(Key.TOMATO),
    setTomato: (data)=> setData(Key.TOMATO, data),

    getHistory: ()=> getList(Key.HISTORY),
    // addHistory: (data)=> console.log('add his'),
    addHistory: (data)=> addItem(Key.HISTORY, data),
    setHistory: (data)=> setData(Key.HISTORY, data),

    getSetting: ()=> getObject(Key.SETTING),
    setSetting: (data)=> setData(Key.SETTING, data),

    getOther: ()=> getObject(Key.OTHER),
    setOther: (data)=> setData(Key.OTHER, data),
}