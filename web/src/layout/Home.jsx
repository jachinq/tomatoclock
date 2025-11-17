
import Tomatos from '../component/Tomatos'
import AddTomato from '../component/AddTomato'
import { useRef, useEffect, useState, useCallback } from 'react'
import Modal from '../component-ui/Modal';
import Button from '../component-ui/Button';
import { nanoid } from 'nanoid';

export default function Home(props) {

    const [flags, setFlags] = useState([]);
    const [time, setTime] = useState(0);
    const timer = useRef(null);

    useEffect(() => {
    }, [time])

    const handleStart = useCallback(() => {
        if (timer.current !== null) {
            return
        }
        timer.current = window.setInterval(() => {
            setTime((time) => time + 1);
        }, 100)
    }, [])

    const handleStop = useCallback(() => {
        window.clearInterval(timer.current);
        timer.current = null;
    }, [])

    const handleReset = useCallback(() => {
        setTime(0);
        setFlags([]);
    }, [])

    const handleFlag = useCallback(() => {
        console.log(flags);
        setFlags((flags) => {
            flags.push({ id: nanoid(), name: '', time: time / 10 })
            return flags;
        });
    }, [])

    return (<>
        <Modal maskClick={() => props.close && props.close()}>
            <div slot='title'>
                <h1>秒表</h1>
            </div>
            <div slot='body'>
                <div className="w-80">
                    <div className=" min-w-[200px] w-80 inline-block">

                        {(time / 10).toFixed(1)} seconds
                    </div>
                </div>
                <Button onClick={handleStart}>开始</Button>
                <Button onClick={handleStop}>暂停</Button>
                <Button onClick={handleFlag}>标记</Button>
                <Button onClick={handleReset}>重置</Button>

                <div>
                    {flags.map(item => {
                        return <>
                            <div key={item.id}>{item.time}</div>
                        </>
                    })}
                </div>
            </div>
            <div slot='footer'></div>

        </Modal>
    </>)
}