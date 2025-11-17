
import { useEffect } from 'react';
import '../style/Countdown.css'
import useState from 'react-usestateref';
import { useRef } from 'react';
import mitt from '../scripts/mitt';
import EventBus from '../scripts/EventBus';

export default function Countdown({ 
    name, count = 0, total,
    onClick = () => { }, done = () => { }, exec = () => { }
}) {
    const [countdown, setCountdown] = useState(count);

    const cdRef = useRef();
    const dotRef = useRef();

    const minute = (Math.floor(countdown / 60)).toString().padStart(2, '0');
    const second = (countdown % 60).toString().padStart(2, '0');

    const r = 120; const b = 15; const sr = r - b / 2; const p = 2 * 3.14 * sr;

    const refreshUI = (countdown, total) => {
        // console.log("refreshUI", {total, countdown, p, off: p - (p * countdown) / total});
        if (cdRef && cdRef.current) {
            cdRef.current.style.strokeDasharray = p;
            cdRef.current.style.strokeDashoffset = p - (p * countdown) / total;
        }

        if (dotRef && dotRef.current) {
            dotRef.current.style.transform = `rotateZ(${countdown * (360 / total)}deg)`;
        }
    }

    const countdownHandle = (countdown) => {
        // 倒计时结束回调
        if (countdown <= 0) {
            done({ countdown });
            return;
        }

        // 倒计时执行回调
        exec({ countdown });
    }

    const refreshCountdown = (data) => {
        const { countdown, total } = data;
        setCountdown(countdown);
        refreshUI(countdown, total);
        countdownHandle(countdown);
    }

    useEffect(() => {
        if (count > 0) {
            setCountdown(count);
            mitt.emit(EventBus.START_COUNTDOWN, { countdown: count, total });
        }
        else {
            cdRef.current.style.strokeDasharray = p;
            cdRef.current.style.strokeDashoffset = p;
        }
    }, [count])

    // 初始化
    useEffect(() => {
        mitt.on(EventBus.REFRESH_COUNTDOWN, refreshCountdown);
        return () => {
            mitt.off(EventBus.REFRESH_COUNTDOWN, refreshCountdown);
        }
    }, [])

    return (<>
        <div className="glass countdown hover:cursor-pointer"
            onClick={() => onClick()}>

            <div className="flex flex-col justify-center items-center absolute w-full h-full">
                <div className='text-4xl'>
                    <span id="minute">{minute}</span>
                    <span>:</span>
                    <span id="second">{second}</span>
                </div>
                {countdown > 0 && <div className="text-xs">{name}</div>}
            </div>

            {countdown > 0 && <div className="dot" ref={dotRef}></div>}
            <svg>
                <circle></circle>
                <circle ref={cdRef}></circle>
            </svg>

        </div>
    </>)

}