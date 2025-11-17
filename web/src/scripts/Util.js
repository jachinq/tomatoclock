import Storge from "./Storge";

// 播放音效
export function music(setting) {
    if (setting === null || setting === undefined) setting = {};
    const { notice = false, noticeSoundUrl = "", noticeSound = false } = setting;
    if (!notice || !noticeSound) return;

    let sound = noticeSoundUrl === "" ? '/assets/notify.mp3' : noticeSoundUrl;

    console.log("music")
    const notificationAudio = new Audio(sound);
    notificationAudio?.play();
    return;

    if (!window.AudioContext) {
        alert('当前浏览器不支持Web Audio API');
        return;
    }

    // 创建新的音频上下文接口
    const audioCtx = new AudioContext();

    // 发出的声音频率数据，表现为音调的高低
    let arrFrequency = [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];

    // 音调依次递增或者递减处理需要的参数
    let start = 0, direction = 1;
    // 当前频率
    let frequency = arrFrequency[start];
    // 如果到头，改变音调的变化规则（增减切换）
    if (!frequency) {
        direction = -1 * direction;
        start = start + 2 * direction;
        frequency = arrFrequency[start];
    }
    // 改变索引，下一次hover时候使用
    start = start + direction;

    // 创建一个OscillatorNode, 它表示一个周期性波形（振荡），基本上来说创造了一个音调
    let oscillator = audioCtx.createOscillator();
    // 创建一个GainNode,它可以控制音频的总音量
    let gainNode = audioCtx.createGain();
    // 把音量，音调和终节点进行关联
    oscillator.connect(gainNode);
    // audioCtx.destination返回AudioDestinationNode对象，表示当前audio context中所有节点的最终节点，一般表示音频渲染设备
    gainNode.connect(audioCtx.destination);
    // 指定音调的类型，其他还有square|triangle|sawtooth
    oscillator.type = 'sine';
    // 设置当前播放声音的频率，也就是最终播放声音的调调
    oscillator.frequency.value = frequency;
    // 当前时间设置音量为0
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    // 0.01秒后音量为1
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    // 音调从当前时间开始播放
    oscillator.start(audioCtx.currentTime);
    // 1秒内声音慢慢降低，是个不错的停止声音的方法
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    // 1秒后完全停止声音
    oscillator.stop(audioCtx.currentTime + 1);
}

// 推送 win 通知
export function mesgNotice(setting, title = "提示", body = "您有新的消息") {
    if (setting === null || setting === undefined) setting = {};
    const { notice=false, noticePicture = false, noticePictureUrl = "" } = setting;
    if (!notice) return;

    if (window.Notification && Notification.permission === "denied") {
        alert(`${title}-${body}`);
    }

    const option = {
        body,
        data: { a: 1, b: 2 },
        // image: "https://api.likepoems.com/img/pc",
        // image: "https://www.dmoe.cc/random.php",
        // image: "https://counter.likepoems.com/get/@Jachin?theme=gelbooru-h",
        icon: "/assets/icon.png",
        vibrate: [300, 100, 300],
        // sound: '/notify.mp3',
    }

    if (noticePicture) {
        const hasCustomerImageUrl = noticePictureUrl !== "";
        option.image = hasCustomerImageUrl ? noticePictureUrl : "https://api.likepoems.com/img/pc";
    }

    // 全配置说明
    const o = {
        body: '你的好友XX上线了！',//通知显示正文。非必须，默认为空
        image: 'imgae url',//通知显示正文的图片地址。非必须，默认为空
        icon: 'imgae url',//通知左侧图标。非必须，默认为空
        tag: 'test',//通知的分类标记（ID）。非必须，默认为空
        data: '可以是任意数据类型',//通知相关联的数据，通常用于方法的回调，传参。非必须，默认为空
        timestamp: '',//通知显示延迟的时间。非必须，默认通知实例创建完成就显示
        dir: 'auto',//通知主体内容的水平展示顺序，有点类似direction属性。非必须，默认值是auto, 可以是ltr或rtl
        badge: 'xxx',//当没有足够的空间来显示通知本身时，用于表示通知的图像的URL。非必须，默认为空
        lang: '',//通知的语言。非必须默认为空
        vibrate: [300, 100, 300],//通知显示时，设备的振动模式。非必须，默认为空// 震动300ms，停止100ms，再震动300ms
        renotify: true,//新通知出现是否覆盖旧的通知，覆盖（true）则永远只显示一条通知，不覆盖（false）则会多条通知重叠。非必须，默认为true
        silent: false,//通知是否静音。非必须，默认为false，表示无声
        sound: 'mp3',//通知声源文件地址。非必须，默认为空
        noscreen: false,//是否不在屏幕上显示通知信息。非必须，默认为false表示要显示
        sticky: false,//指定通知是否应该粘滞性，即不容易被用户清理。非必须，默认false表示不具粘滞性
        requireInteraction: false, //指定通知是否保持活性，直到用户点击或关闭。非必须，默认为false
    }

    if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission(function (status) {
            var notice_ = new Notification(title, option);
            notice_.onclick = function (e) {//单击消息提示框，进入浏览器页面
                // console.log(e);
                window.focus();
                notice_.close();
            }
        });
    }
}

/* 通用工具 */

/**
 * vue对象深拷贝：自己定义了一个对象，因该对象要做双向数据绑定操作，因开发需要所以要备份一下该对象的初始状态，但是普通的备份对象无效仍然会因双向数据绑定而导致备份对象跟着改变
 * @param data：json对象
 * @returns {any} 深度拷贝后的新对象
 */
const deepClone = function (data) {
    return JSON.parse(JSON.stringify(data));
};

/**
 * 排列函数，根据 sort 字段排序
 * 对象 sort 的值要求是数字
 * @param a
 * @param b
 * @returns {number}
 */
const sortAsc = function (a, b) {
    let x = a.sort;
    let y = b.sort;
    if (x == null || y == null) {
        // console.log(a, b);
        return 0;
    }
    if (x < y) {
        return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
};

/**
 * 排列函数，根据 sort 字段排序
 * 对象 sort 的值要求是数字
 * @param a
 * @param b
 * @returns {number}
 */
const sortDesc = function (a, b) {
    let x = a.sort;
    let y = b.sort;
    if (x == null || y == null) {
        // console.log(a, b);
        return 0;
    }
    if (x > y) {
        return -1;
    }
    if (x < y) {
        return 1;
    }
    return 0;
};

const compare = function (prop, desc) {
    return (obj1, obj2) => {
        let val1 = obj1[prop];
        let val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }

        if (desc) { // 降序
            if (val1 < val2) {
                return 1;
            } else if (val1 > val2) {
                return -1;
            } else {
                return 0;
            }
        }

        // 升序
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}

/**
 * 随机打乱数组
 * @param a
 * @param b
 * @returns {number}
 */
const randomSort = function (a, b) {
    return Math.random() > .5 ? -1 : 1;
    //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1，使用例子如下
    // var arr = [1, 2, 3, 4, 5];
    // arr.sort(randomSort);
};

/**
 * 设置 :root 的 css 变量
 */
const setRootCssValue = function (key, value) {
    let root = document.querySelector(":root");
    if (root && root.style) {
        root.style.setProperty(key, value);
    }
    // console.log(root.style.getPropertyValue(key));
};
/**
 * 获取 :root 的 css 变量
 */
const getRootCssValue = function (key) {
    let root = document.querySelector(":root");
    if (root && root.style) {
        return root.style.getPropertyValue(key);
    }
    return null;
};


/**
 * 下载图片，通过不跨域的 Canvas 下载
 * @param imgSrc
 * @param name
 */
const downloadPicture = function (imgSrc, name) {

    const image = new Image();
    // 解决跨域Canvas 污染问题
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = imgSrc;
    console.log(image);
    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height);
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = name || new Date().format("bgimg_yyyyMMddhhmmss");
            a.href = url;
            a.click();
            a.remove();
            // 用完释放URL对象
            URL.revokeObjectURL(url);
        })
    };
    image.onerror = () => downloadPictureByLink(imgSrc);
};

/**
 * 下载图片，通过链接标签下载。跨域时会打开新窗口
 * @param url
 */
const downloadPictureByLink = function (url) {
    let aTagEle = document.createElement('a');
    aTagEle.setAttribute('href', url);
    aTagEle.setAttribute('target', '_blank');
    // a.setAttribute('download', '');
    let timestamp = (new Date()).valueOf();
    aTagEle.setAttribute("download", '');
    document.body.appendChild(aTagEle);
    // console.log(a);
    aTagEle.click();
    aTagEle.remove();

    // <a href="/getAttachmentFileStream?name=test.jpg" download target="_blank">附件jpg流</a>
};

const downloadText = function (fileName, text) {

    fileName = fileName + formatDateTime(new Date(), "yyyyMMddhhmmss") + ".tomato";
    // console.log('downloadText', fileName);

    // type 的格式可以可以设置，可以把 appcation/json 设置进去，然后设置导出的类型
    const blob = new Blob([text], { type: 'charset=utf-8' });
    // 兼容ie和360浏览器
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        //  fileName需要指定后缀类型例：.starter
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        let url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);   // 删除节点
        window.URL.revokeObjectURL(url);  // 释放blob对象
    }
};

/**
 * 检查事件源，判断是否为对应 class 元素发起的事件。不会检索父元素
 * @param e
 * @param key
 * @returns {boolean}
 */
const checkEventSourceClassOnce = function (e, key) {
    let check = false;

    try {
        if (e === null) {
            return check;
        }
        let element = e.target;
        if (element === undefined || element === null) {
            return check;
        }

        let className = element.className;
        if (className === undefined || className === null || className === '') {
            return check;
        }

        if (!className instanceof String) {
            return check;
        }
        if (className instanceof SVGAnimatedString) {
            className = className.baseVal || '';
        }

        // console.log('once click check', className);
        let classNameArray = className.split(' ');
        for (let item of classNameArray) {
            if (item === key) {
                check = true;
                return check;
            }
        }

    } catch (e) {
        console.log('checkEventSourceClass has exception', e);
    }

    return check;
};

/**
 * 检查事件源，判断是否为对应 class 元素发起的事件。会检索父元素，直到匹配到 class 名
 * @param e
 * @param key
 * @returns {boolean}
 */
const checkEventSourceClass = function (e, key) {
    // let path = e.path;
    // let target = e.target;
    let check = false;

    try {
        let path = getPath(e);
        // console.log(path);

        if (path === undefined || path === null || path.length === 0) {
            return false;
        }

        for (let element of path) {
            if (element === undefined || element === null) {
                continue;
            }

            let className = element.className;
            if (className === undefined || className === null || className === '') {
                continue
            }

            if (!className instanceof String) {
                continue;
            }
            if (className instanceof SVGAnimatedString) {
                // console.log('className', className);
                className = className.baseVal || '';
            }

            // console.log("source click check", className);
            let classNameArray = className.split(' ');
            for (let item of classNameArray) {
                // let reg = new RegExp("\\b" + item + "\\b");

                // let result = reg.test(key);

                // if (key === 'search-input') {
                //     console.log(key, ":", item, result);
                // }

                if (item === key) {
                    check = true;
                    return check;
                }
            }

            // console.log(className);
            // if (className !== undefined && className !== null && className !== '') {
            //     let reg = new RegExp("\\b" + className + "\\b");
            //     console.log(key, ":", className, reg.test(key));
            //     // 点击了应用区内的item
            //     if (reg.test(key)) {
            //         check = true;
            //     }
            // }
        }
    } catch (e) {
        console.log('checkEventSourceClass has exception', e);
    }

    return check;
};

/**
 * 获取事件的元素路径
 * @param e
 * @returns {SVGPathElement}
 */
const getPath = function (e) {
    let path = e.path;
    if (path !== undefined && path !== null && path.length !== 0) {
        return path;
    }

    let target = e.target;
    if (target !== undefined && target !== null) {
        path = [];
        path.push(target);
        recursionGetPath(target, path);
        // console.log(path);
    }
    return path;
};

/**
 * 递归获取事件的父元素
 * @param node
 * @param path
 */
const recursionGetPath = function (node, path) {
    let parentNode = node.parentNode;
    if (parentNode === undefined || parentNode === null) {
        return;
    }
    path.push(parentNode);
    recursionGetPath(parentNode, path);
};

/**
 * 复制指定文本到剪贴板
 * @param text
 * @returns {boolean}
 */
const copyText = function (text) {
    if (text == null || text === '') {
        return true;
    }
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand("copy");
    } catch (err) {
        console.log('复制文本到剪贴板失败', err);
        return false;
    } finally {
        document.body.removeChild(textArea);
    }
    return true;
};

/**
 * 从剪贴板读取文本
 * @returns {string}
 */
const pasteText = async function () {
    try {
        return await navigator.clipboard.readText().catch((e) => { console.log(e); });
    } catch (err) {
        console.log('读取剪贴板失败', err);
        return "";
    }
};

/**
 * 取出url
 * @param s
 * @returns {null}
 */
const getStrUrl = function (s) {
    // var reg= /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
    let reg = /(https?|http|ftp|file):\/\/([^:\/\n]+)/g;
    s = s.match(reg);
    return (s && s.length ? s[0] : null);
};

/**
 * 全局转为黑暗/明亮主题
 */
const toDark = function (dark) {
    const darkId = 'dark-style';
    if (dark) { // 黑暗主题
        console.log('set dark');
        const style = `
        html {
            background-color: rgba(255, 255, 255) !important;
            filter: invert(1) contrast(0.95) !important;
        }
        /*iframe {
            background-color: rgba(255, 255, 255) !important;
            filter: invert(1) contrast(0.95) !important;
        }
        img {
            filter: invert(1) contrast(0.95) !important;
        }*/
        `;
        const styleElement = document.createElement('style');
        styleElement.id = darkId;
        styleElement.textContent = style;
        document.head.append(styleElement);
        console.log('set dark end');
    } else {
        console.log('remove dark');
        let styleElement = document.getElementById(darkId);
        if (styleElement) {
            styleElement.remove();
            console.log('remove dark end');
        }
    }
};

/**
 * 获取元素在页面的绝对坐标值
 * @param node
 * @returns {{left: number, top: number}}
 */
const getPosition = function (node) {
    //获取元素相对于其父元素的left值var left
    let left = node.offsetLeft;
    let top = node.offsetTop;
    // 取得元素的offsetParent
    let current = node.offsetParent;

    // 一直循环直到根元素
    while (current != null) {
        left += current.offsetLeft;
        top += current.offsetTop;
        current = current.offsetParent;
    }
    return {
        "left": left,
        "top": top
    }
};

const getNow = () => {
    const date = new Date();
    const hour = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    const sec = date.getSeconds().toString().padStart(2, "0");
    const mil = date.getMilliseconds().toString().padStart(3, "0");
    return `${hour}:${min}:${sec}.${mil}`;
}

const transformationRGB = (hex) => {
    if (hex === undefined || hex === null) return null;
    hex = hex.replace('#', '');
    let regSplit = /([0-9a-fA-F]{2})/,
        rgb = hex.split(regSplit);
    rgb = rgb.filter(item => item != "");
    rgb = rgb.map(item => parseInt('0x' + item));
    return rgb;
};

// 格式化星期
export function formatWeekend(date) {
    if (date === undefined || date === null || date === '') {
        return null;
    }
    date = new Date(date);
    const day = date.getDay();
    switch (day) {
        case 0: return "日";
        case 1: return "一";
        case 2: return "二";
        case 3: return "三";
        case 4: return "四";
        case 5: return "五";
        case 6: return "六";
    }
}

// 格式化日期
export function formatDateTime(date, format = 'yyyy-MM-dd') {
    if (date === undefined || date === null || date === '') {
        return null;
    }
    date = new Date(date);
    const o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
        'H+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds(), // 毫秒
        a: date.getHours() < 12 ? '上午' : '下午', // 上午/下午
        A: date.getHours() < 12 ? 'AM' : 'PM', // AM/PM
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
            );
        }
    }
    return format;
}

/**
 * 获取对象的默认值
 * @param {Object} data 对象
 * @param {String} key key 值 
 * @param {*} defaultValue 给定的默认值
 * @returns 
 */
export function getDefaultValue(data, key, defaultValue) {
    return data[key] || defaultValue;
}


// 刷新背景图片
export function setBackgroundImg(dark = true, picture = false, themePictureUrl = "") {
    if (picture) {
        document.documentElement.classList.add('pic');
        const picEles = window.document.getElementsByClassName('pic');
        if (picEles) {
            if (picEles.length > 0) {
                const picEle = picEles[0];
                const themePictureUrlTrim = themePictureUrl.toString().trim();
                const backgroundImage = themePictureUrlTrim !== "" ? themePictureUrl : "https://api.likepoems.com/img/bing";
                picEle.style.backgroundImage = `url(${backgroundImage})`;
                // console.log(picEle.style.backgroundImage);
            }
        }

        const bgMask = document.getElementById('bg-mask');
        const apps = document.getElementsByClassName('app');
        if (bgMask) {
            bgMask.style.display = 'block';
            if (apps && apps.length > 0) {
                const app = apps[0];
                if (app) {
                    app.style['background-color'] = 'transparent';
                }
            }
        }
    } else {
        document.documentElement.classList.remove('pic');
        const bgMask = document.getElementById('bg-mask');
        const apps = document.getElementsByClassName('app');
        if (bgMask) {
            bgMask.style.display = 'none';
            if (apps && apps.length > 0) {
                const app = apps[0];
                if (app && dark) {
                    app.style['background-color'] = 'rgb(30 41 59 / var(--tw-bg-opacity))';
                }
            }
        }
    }
}

export default {
    getPath,
    toDark,
    deepClone,
    sortAsc,
    sortDesc,
    compare,
    setRootCssValue,
    getRootCssValue,
    randomSort,
    downloadPicture,
    downloadText,
    checkEventSourceClass,
    checkEventSourceClassOnce,
    copyText,
    pasteText,
    getStrUrl,
    getPosition,
    getNow,
    transformationRGB,
}

