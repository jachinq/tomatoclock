
import { useEffect, forwardRef } from "react";
import Util from "../scripts/Util";
import mitt from "../scripts/mitt";
import EventBus from "../scripts/EventBus";
import Countdown from "./Countdown";
import useState from 'react-usestateref';
import useAsync from "../hooks/useAsync";
import { add_history, get_resetTime, get_tomato, set_tomato } from "../scripts/Database";
import { useCallback } from "react";


/**
 * 负责：渲染倒计时
 */
export default forwardRef(({ }, _ref) => {
    const [clock, setClock, clockRef] = useState({});
    const [time, setTime] = useState(0);

    const { execute: addHistory } = useAsync(add_history);
    const { execute: getResetTime, data: clockRestTime } = useAsync(get_resetTime);
    const { execute: setTomato } = useAsync(set_tomato);
    const { execute: getTomato, data: fixTomato } = useAsync(get_tomato);

    // 保存 clock 数据
    const saveClock = (data) => {
        const save = { ...clockRef.current, ...data, update: new Date().getTime() };

        if (save.status === 2 && save.rest !== 1) {
            save.rest = undefined;
            addHistory(save);
        }

        setTime(save.countdown || 0);
        setClock(save);
        // console.log('saveClock', data);
        setTomato(save);
    }

    // 开启一个新的番茄钟
    const startTomato = (clock, rest) => {
        const total = new Number(clock.minute) * 60 + new Number(clock.second);
        const newClock = { ...clock, status: 1, create: new Date().getTime(), total, countdown: total, rest };
        saveClock(newClock);
        // console.log('start clock', newClock, total)
    }

    // 完成一个番茄钟
    const finshTomato = useCallback((data) => {
        const clock = clockRef.current;
        console.log(Util.getNow(), 'finished', data, clock);
        if (clock.status === undefined || clock.status === 2) {
            return;
        }
        saveClock({ ...data, status: 2 });
        getResetTime(clock);
    }, [])

    useEffect(() => {
        // console.log("clockRestTime change", clockRestTime);
        if (!clockRestTime && new Number(clockRestTime) <= 0) return;
        if (clock.rest === 1) return;
        startTomato({ name: '休息一下~', minute: clockRestTime, second: '00' }, 1); // 自动开启一个休息时钟
    }, [clockRestTime])

    // 修正数据
    useEffect(() => {
        if (!fixTomato) return

        const { status = 0, create = 0, total = 0 } = fixTomato;

        if (status === 1) {
            // 复原倒计时
            if (create > 0) {
                let realCountdown = Math.floor(((create + total * 1000) - new Date().getTime()) / 1000);

                if (realCountdown > 0) {
                    fixTomato.countdown = realCountdown;
                    setTime(fixTomato.countdown || 0)
                    setClock(fixTomato); // 用本地数据覆盖组件数据
                    console.log(Util.getNow(), "fix count down", 'real', fixTomato.countdown)
                } else {
                    // 否则说明倒计时早已结束，更新状态为已完成，以及设置对应结束时间
                    const finshTime = create + total * 1000; // 计算出这个时钟真正结束的时间
                    const save = { ...fixTomato, status: 2, update: finshTime };
                    set_tomato(save);
                    if (save.status === 2 && save.rest !== 1) {
                        addHistory(save);
                    }
                }

            }
        }
    }, [fixTomato])

    useEffect(() => {
        getTomato();
        mitt.on(EventBus.START_TOMATO, startTomato); // 监听是否开启了番茄钟
        return () => {
            mitt.off(EventBus.START_TOMATO, startTomato);
        }
    }, [])

    return (<>
        <div className="w-full h-full flex transition-all" ref={_ref}>
            <Countdown name={clock.name} total={clock.total} count={time}
                done={(data) => finshTomato(data)}
                // exec={(data) => saveClock(data)}
                onClick={() => mitt.emit(EventBus.SHOW_ADD_TOMATO)}></Countdown>
        </div>
    </>)

});