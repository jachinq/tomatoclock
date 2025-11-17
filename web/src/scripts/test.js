var module_version = '2.51.0';

var websocketUrl = "https://ws-bj.clink.cn";
var identifier = '8003346';
if (document.location.protocol === 'https:') {
    websocketUrl = websocketUrl.replace('http:', 'https:')
}

var Util = (function () {
    function Util() {
    }

        /**
     * 浏览器控制台日志输出
     */
        var logger = (function () {
            function logger() {
            }
    
            var LEVEL = {
                DEBUG: '',
                INFO: 'blue',
                WARN: 'orange',
                ERROR: 'red',
            };
    
            logger.debug = function (message) {
                if (GLOBAL.debug) {
                    print(message, LEVEL.DEBUG)
                }
            };
    
            logger.info = function (message) {
                if (GLOBAL.debug) {
                    print(message, LEVEL.INFO)
                }
            };
    
            logger.warn = function (message) {
                if (GLOBAL.debug) {
                    print(message, LEVEL.WARN)
                }
            };
    
            logger.error = function (message) {
                if (GLOBAL.debug) {
                    print(message, LEVEL.ERROR)
                }
            };
    
            logger.log = function (message, color) {
                print(message, color)
            };
    
            var print = function (message, color) {
                if (typeof color !== 'undefined') {
                    color = 'color:' + color
                }
    
                const finalMessage = '[' + Util.currentTime() + '] ' + message;
    
                if (GLOBAL.connected && Agent.getDebug()) {
                    WebSocketClient.debug({message: finalMessage});
                }
    
                if (
                    typeof window !== 'undefined' &&
                    window !== null &&
                    window.console !== null
                ) {
                    window.console.log('%c' + finalMessage, color);
                    if (window.DATAFLUX_RUM && window.DATAFLUX_RUM.addAction) {
                        window.DATAFLUX_RUM.addAction('ws_log', {
                            info: message
                        });
                    }
                }
            };
    
            return logger
        })();

    /**
     * 加载js文件
     * @param urls
     * @param i
     * @param callback
     */
    Util.loadScript = function (urls, i, callback) {

        if (i === urls.length) {

            logger.log('Util.loadScript: JS files is loaded [' + JSON.stringify(urls) + ']');

            if (Util.isFunction(GLOBAL.callback)) {
                GLOBAL.callback()
            } else if (Util.isFunction(callback)) {
                callback()
            }

            GLOBAL.ready = true;
            return
        }

        var oHead = document.getElementsByTagName('head').item(0);

        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src =
            GLOBAL.webSocketUrl + urls[i].url + '?version=' + urls[i].version + '&timeStamp=' + new Date().getTime();
        oScript.charset = 'UTF-8';

        oHead.appendChild(oScript);

        if (oScript.readyState) {
            // IE

            oScript.onreadystatechange = function () {
                if (
                    oScript.readyState === 'loaded' ||
                    oScript.readyState === 'complete'
                ) {
                    oScript.onreadystatechange = null;
                    Util.loadScript(urls, i + 1, callback)
                }
            }
        } else {
            // Other
            oScript.onload = function () {
                logger.log('Util.loadScript: JS file[' + i + '] is loaded [' + JSON.stringify(urls[i]) + ']');
                Util.loadScript(urls, i + 1, callback)
            }
        }
    };


    /**
     * 修改录音文件
     * @param id
     * @param url
     */
    Util.changeAudio = function (id, url) {
        logger.debug(
            'changeAudio: id [' + id + '], url [' + url + ']'
        );
        var existAudio = document.getElementById(id);
        if (!existAudio) {
            return
        }
        existAudio.src = GLOBAL.webSocketUrl + url;
    };

    /**
     *  加载媒体文件
     * @param urls
     * @param i
     */
    Util.loadAudio = function (urls, i) {
        if (i === urls.length) {
            logger.debug(
                'loadAudio: SipAudio file is loaded [' + JSON.stringify(urls) + ']'
            );
            return
        }

        // 由于js是放在head中的 因此js加载时body标签不一定渲染出来了，因此做了个容错
        var oBody;
        if (!oBody) {
            var getBodyInterval = setInterval(function () {
                oBody = window.document.getElementsByTagName('body').item(0);
                if (oBody) {
                    clearInterval(getBodyInterval);

                    var exist = document.getElementById('audio_remote');
                    if (!exist) {
                        var oAudio = document.createElement('audio');
                        oAudio.id = 'audio_remote';
                        oAudio.autoplay = 'autoplay';
                        oAudio.style = 'display: none';
                        oBody.appendChild(oAudio)
                    }

                    var oHead = document.getElementsByTagName('head').item(0);
                    exist = document.getElementById(urls[i].id);
                    if (exist) {
                        return
                    }
                    var oScript = document.createElement('audio');
                    oScript.id = urls[i].id;
                    if (urls[i].id === 'ringtone' || urls[i].id === 'ringbacktone') {
                        oScript.loop = 'loop'
                    }
                    oScript.src = GLOBAL.webSocketUrl + urls[i].url;
                    oHead.appendChild(oScript);
                    oScript.addEventListener('canplaythrough', function () {
                        Util.loadAudio(urls, i + 1)
                    })
                }
            }, 200)
        }
    };

    /**
     * 判断浏览器类型
     */
    Util.isIE = (function () {
        var browser = {};
        return function (ver, c) {
            var key = ver ? (c ? 'is' + c + 'IE' + ver : 'isIE' + ver) : 'isIE';
            var v = browser[key];
            if (typeof v !== 'undefined') {
                return v
            }
            if (!ver) {
                v =
                    navigator.userAgent.indexOf('MSIE') !== -1 ||
                    navigator.appVersion.indexOf('Trident/') > 0
            } else {
                var match = navigator.userAgent.match(
                    /(?:MSIE |Trident\/.*; rv:|Edge\/)(\d+)/
                );
                if (match) {
                    var v1 = parseInt(match[1]);
                    v = c
                        ? c === 'lt'
                            ? v1 < ver
                            : c === 'gt'
                                ? v1 > ver
                                : undefined
                        : v1 === ver
                } else if (ver <= 9) {
                    var b = document.createElement('b');
                    b.innerHTML =
                        '<!--[if ' + (c ? c : '') + ' IE ' + ver + ']><i></i><![endif]-->';
                    v = b.getElementsByTagName('i').length === 1
                } else {
                    v = undefined
                }
            }
            browser[key] = v;
            return v
        }
    })();

    //随机数字
    Util.randomNumber = function (n) {
        return Math.floor(Math.random() * n + 5)
    };

    Util.isFunction = function (arg) {
        return typeof arg === 'function'
    };
    Util.isNumber = function (arg) {
        return typeof arg === 'number'
    };

    Util.isUndefined = function (arg) {
        return arg === void 0
    };

    Util.isEmpty = function (arg) {
        return JSON.stringify(arg) === '{}'
    };

    Util.randomString = function (length) {
        var rdmString = '';
        //toSting接受的参数表示进制，默认为10进制。36进制为0-9 a-z
        while (rdmString.length < length) {
            rdmString += Math.random()
                .toString(36)
                .substr(2)
        }
        return rdmString.substr(0, length)
    };

    Util.generateSessionId = function () {
        GLOBAL.sessionId = Util.randomString(10);
        return GLOBAL.sessionId
    };

    /**
     * 使用javascript原生XMLHttpRequest实现jquery ajax功能，支持jsonp
     */
    Util.ajax = function (params) {
        params = params || {};
        params.data = params.data || {};

        switch (params.dataType) {
            case 'jsonp':
                jsonp(params);
                break;
            case 'json':
                json(params);
                break;
            default:
                logger.error('function ajax only support json and jsonp dataType!');
                break
        }

        // ajax请求
        function json(params) {
            params.type = (params.type || 'GET').toUpperCase();
            params.data = formatParams(params.data);
            var xhr = null;
            // 实例化XMLHttpRequest对象
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest()
            } else {
                // IE6及其以下版本
                xhr = new ActiveXObjcet('Microsoft.XMLHTTP')
            }

            // 监听事件
            xhr.onReadyStateChange = function () {
                if (xhr.readyState === 4) {
                    var status = xhr.status;

                    if (status >= 200 && status < 300) {
                        var response = '';
                        var type = xhr.getResponseHeader('Content-type');
                        if (type.indexOf('xml') !== -1 && xhr.responseXML) {
                            //Document对象响应
                            response = xhr.responseXML
                        } else if (type === 'application/json') {
                            //JSON响应
                            if (this.JSON) {
                                response = this.JSON.parse(xhr.responseText)
                            } else {
                                response = eval('(' + xhr.responseText + ')')
                            }
                        } else {
                            //字符串响应
                            response = xhr.responseText
                        }
                        params.success && params.success(response)
                    } else {
                        params.error && params.error(status)
                    }
                } else {
                    logger.debug('state: ' + xhr.readyState)
                }
            };

            switch (params.type) {
                case 'GET':
                    xhr.open(params.type, params.url + '?' + params.data, true);
                    xhr.send(null);
                    break;
                case 'POST':
                    xhr.open(params.type, params.url, true);
                    //设置提交时的内容类型
                    xhr.setRequestHeader(
                        'Content-Type',
                        'application/x-www-form-urlencoded; charset=UTF-8'
                    );
                    xhr.send(params.data);
                    break;
                default:
                    logger.error('function json only support GET and POST type!');
                    break
            }
        }

        // jsonp请求
        function jsonp(params) {
            //创建script标签并加入到页面中
            var callbackName;
            if (params.suffix) {
                callbackName = params.jsonp + '_' + params.suffix;
            } else {
                callbackName = params.jsonp + '_' + new Date().getTime();
            }

            var head = document.getElementsByTagName('head')[0];
            // 设置传递给后台的回调参数名
            params.data['callback'] = callbackName;
            var data = formatParams(params.data);
            var script = document.createElement('script');
            head.appendChild(script);

            //创建jsonp回调函数
            window[callbackName] = function (json) {
                head.removeChild(script);
                clearTimeout(script.timer);
                window[callbackName] = null;
                params.success && params.success(json)
            };

            //发送请求
            script.src = params.url + '?' + data;

            //超时处理
            if (params.time) {
                script.timer = setTimeout(function () {
                    window[callbackName] = null;
                    head.removeChild(script);
                    params.error &&
                    params.error({
                        message: 'jsonp request time out!',
                    })
                }, params.time)
            }
        }

        //格式化参数
        function formatParams(data) {
            var arr = [];
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    arr.push(name + '=' + data[name])
                }
            }
            // 添加一个随机数，防止缓存
            arr.push('t=' + new Date().getTime());
            return arr.join('&')
        }
    };

    // 精准到毫秒
    Util.currentTime = function () {

        const date = new Date()
        try {
            const year = date.getFullYear()
            let month = date.getMonth() + 1
            month = month < 10 ? '0' + month : month
            const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
            const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
            const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
            const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
            const milliSeconds = date.getMilliseconds() < 100 ?
                (date.getSeconds() < 10 ? '00' + date.getSeconds() : '0' + date.getSeconds()) : date.getMilliseconds()

            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + milliSeconds
        } catch (e) {
            logger.error("", e);
        }
        return date;
    }

    Util.simplify = function (target, source, reference) {
        if (typeof (source) == "object") {
            if (Array.isArray(source)) {
                var temp = Util.simplifyArr(source, reference);
                if (temp.length > 0) {
                    target = temp;
                }
            } else {
                for (var prop in source) {
                    if (typeof (source[prop]) == "object") {
                        if (Array.isArray(source[prop])) { // 处理数组
                            var temp = Util.simplifyArr(source[prop], reference[prop]);
                            if (temp.length > 0) {
                                target[prop] = temp;
                            }
                        } else if (reference[prop] === undefined) {
                            target[prop] = source[prop];
                        } else if (source[prop] != reference[prop]) { // 当对象不同时向下遍历
                            var tmpSource = source[prop];
                            var tempRef = reference[prop];
                            var temp = {};
                            Util.simplify(temp, tmpSource, tempRef);
                            if (!Util.isEmpty(temp)) {
                                target[prop] = temp;
                            }
                        }
                    } else {
                        if (reference[prop] === undefined) { // 直接存储
                            target[prop] = source[prop];
                        } else { // 比较两个值是否相等
                            if (source[prop] != reference[prop]) {
                                target[prop] = source[prop];
                            }
                        }
                    }
                }
            }
        } else {
            if (reference[prop] === undefined) { // 直接存储
                target[prop] = source[prop];
            } else { // 比较两个值是否相等
                if (source[prop] != reference[prop]) {
                    target[prop] = source[prop];
                }
            }
        }
    };

    Util.simplifyArr = function (source, reference) {
        var change = false;
        if (reference != undefined) {
            var len = Math.min(source.length, reference.length);
            var temp = [];
            for (var i = 0; i < len; i++) {
                var item = {};
                var sourceItem = source[i];
                var refItem = reference[i];
                if (typeof (sourceItem) == "string") {
                    item = sourceItem === refItem ? {} : sourceItem;
                } else {
                    Util.simplify(item, sourceItem, refItem);
                }
                if (!Util.isEmpty(item)) {
                    temp.push(item);
                }
            }
            if (len < source.length) {
                for (var j = len; j < source.length; j++) {
                    temp.push(source[j]);
                }
            }
            return temp;
        } else {
            change = true;
        }
        if (change) {
            return source;
        }
        return [];
    };

    Util.deepCopy = function (obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj; // 对于非对象和 null 的值，直接返回
        }

        let copy;
        if (Array.isArray(obj)) {
            copy = [];
            for (let i = 0; i < obj.length; i++) {
                copy[i] = Util.deepCopy(obj[i]);
            }
        } else {
            copy = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    copy[key] = Util.deepCopy(obj[key]);
                }
            }
        }

        return copy;
    }


    return Util
})();



/**
 * 内部全局变量
 */
var GLOBAL = {
    ready: false,
    debug: false, // 是否开启debug
    sipPhone: false, // 是否是webrtc
    connecting: false, //建立连接中
    connected: false, // 是否建立websocket连接
    connectionCloseCount: 0, // 连接断开次数
    sessionId: '',
    lastPingTime: null, // 上次ping时间
    pingValue: false, // 检测断线
    pingTimer: '',
    latency: 0, // 网络时延
    logout: false,
    connectInterval: 1000, //建立连接的时间间隔, 默认1秒
    randoms: 0,
    identifier: identifier,
    webSocketUrl: websocketUrl,
    allowBackward: true,
    answerCallsByCloseBrowser: 0,
    unbindPhoneByCloseBrowser: 0,
    breakLines: [],
    ringtone: '/sipjs/sounds/ringtone.wav',
    deltaTimes: 2,
    ipChangeNotify: false,
    getUserMediaNotify: false,
};


var script = [
    {url: '/HackTimer.js', version: module_version},
    {url: '/sockjs1.6.1.js', version: module_version},
    {url: '/stomp.2.61.0.js', version: module_version},
    {url: '/js/CryptoJS/rollups/aes.js', version: module_version},
    {url: '/js/CryptoJS/components/mode-ecb-min.js', version: module_version},
    {url: '/js/CryptoJS/components/md5-min.js', version: module_version},
    {url: '/js/CryptoJS/components/sha256-min.js', version: module_version},
];


Util.loadScript(script, 0);
