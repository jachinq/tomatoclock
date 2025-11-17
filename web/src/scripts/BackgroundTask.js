import EventBus from "./EventBus";
import { setBackgroundImg } from "./Util";
import mitt from "./mitt";

const getNow = () => {
    const date = new Date();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const mil = date.getMilliseconds();
    return `${min}:${sec}.${mil}`;
}

// 定义一个多线程 worker
const createWorker = (f) => {
    const blob = new Blob(['(' + f.toString() + ')()']);
    const url = window.URL.createObjectURL(blob);
    const worker = new Worker(url);
    return worker;
}

let countdownWorker = null;

const startCountdown = (data) => {
    const { countdown, total } = data;
    // console.log('mitt on start cd', countdown, total);

    if (countdownWorker != null) {
        countdownWorker.postMessage({ type: "stop" }) // 先停掉上个
        // console.log("drop last countdown workder")
    }

    // 启用多线程：倒计时
    countdownWorker = createWorker(function () {
        let only = null;
        function init(countdown) {
            // console.log("cd workder;beg countdown and start a interval", countdown);
            clearInterval(only);
            self.postMessage(countdown--)
            only = setInterval(function () {
                self.postMessage(countdown--)
            }, 1000)
        }
        self.onmessage = function (messageEvent) {
            const { type, data } = messageEvent.data;
            // console.log('bg cd worker.on msg', messageEvent.data);
            switch (type) {
                case "init":
                    // console.log('init worker');
                    init(data);
                    break;
                case "stop":
                    // console.log("close worker");
                    self.close();
                    break;
            }

        }
    })

    if (countdown && countdown > 0) {
        countdownWorker.postMessage({ type: "init", data: countdown })
        // console.log("mitt has cd and post msg to workder", { type: "init", data: countdown })
    }

    countdownWorker.onmessage = function (event) {
        const countdownTmp = event.data;
        if (event.data % 30 === 0)
            console.log(getNow(), countdownTmp);
        if (countdownTmp <= 0) {
            countdownWorker.postMessage({ type: "stop" })
        }

        mitt.emit(EventBus.REFRESH_COUNTDOWN, { countdown: countdownTmp, total });
    }
}

const initUI = (config) => {
    // console.log("init config", config)
    if (!config) return

    const { dark = true, yiyan = false, picture = false, themePictureUrl = "" } = config;
    // console.log('initUi', { config, dark });

    mitt.emit(EventBus.CHANGE_THEME, dark);
    mitt.emit(EventBus.OPEN_YIYAN, yiyan);
    setBackgroundImg(dark, picture, themePictureUrl);
}

// 启动后台任务
const start = () => {
    // console.log("bg starting...")
    // initUI(); // 初始化UI
    mitt.on(EventBus.REFRESH_UI, initUI);

    mitt.on(EventBus.START_COUNTDOWN, startCountdown);

    // console.log("bg start ok.")

    // console.log('sys', navigator.userAgent.toLowerCase());
}

const stop = () => {
    mitt.off(EventBus.START_COUNTDOWN, startCountdown);
}

export default {
    start, stop
}