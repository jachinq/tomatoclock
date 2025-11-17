import { useState, useEffect, useRef } from "react"
import { nanoid } from 'nanoid'

import '../style/AddTomato.css'
import mitt from "../scripts/mitt";
import useKeyPress from "../hooks/useKeyPress";

import EventBus from "../scripts/EventBus";
import Icon from "../component-ui/Icon";
import Modal from "../component-ui/Modal";
import Button from "../component-ui/Button";
import { useMemo } from "react";
import Toast from "../component-ui/Toast";
import useAsync from "../hooks/useAsync";
import { get_historys } from "../scripts/Database";

export default function AddTomato({setting = {}, close=()=>{}}) {

    const nameInputRef = useRef();
    const keyPress = useKeyPress(nameInputRef.current);

    const { execute: getHistorys, data: historys } = useAsync(get_historys);

    const tmpClock = useMemo(() => ({ name: 'tomato', minute: setting.clockFocusTime || "25", second: "00" }), [setting])

    const [clock, setClock] = useState(tmpClock);

    // 添加一个番茄钟
    const addTomato = function () {
        if (clock.name === undefined || clock.name === '') {
            Toast.error("请输入名字");
            return;
        }

        if (clock.minute === undefined) {
            Toast.error("请选择正确分钟数");
            return;
        }

        if (clock.second === undefined) {
            Toast.error("请输入正确秒数");
            return;
        }

        close(false)
        clock["time"] = new Date().getTime();
        clock['id'] = nanoid()
        mitt.emit(EventBus.START_TOMATO, clock);
    }

    function scrollMouse(key, e) {
        if (e === undefined || e === null) return;
        if (e.deltaY === undefined || e.deltaY === null) return;
        const down = e.deltaY > 0;
        stepTime(key, !down);
    }

    function stepTime(key, plus, e) {
        if (e) {
            const down = e.deltaY > 0;
            if (down === plus) {
                return;
            }
        }

        if (key !== '') {
            if (plus) {
                if (clock[key] > 58) {
                    return;
                }
                setClock({ ...clock, [key]: (++clock[key]).toString().padStart(2, "0") });
            } else {
                if (clock[key] < 1) {
                    return;
                }
                setClock({ ...clock, [key]: (--clock[key]).toString().padStart(2, "0") });
            }
        }
    }

    function setClockWithKey(key, e) {
        let value = e.target.value;
        if (value > 58) value = 59;
        if (value < 0) value = 0;
        if (value.length) {
            if (value.length === 1) {
                value = value.toString().padStart(2, "0")
            }
            if (value.length > 2) {
                value = new Number(value).toString().padStart(2, "0");
            }
        }

        setClock({ ...clock, [key]: value })
    }

    useEffect(() => {
        // console.log("historys", historys);
        if (historys && historys.length > 0) {
            const history = historys[0];
            const histortClock = {};
            histortClock.name = history.name || "tomato";
            histortClock.minute = history.minute || "25";
            histortClock.second = history.second || "00";
            setClock(histortClock);
            // console.log("historys init clock", histortClock);
        } 
        if (nameInputRef.current) nameInputRef.current.focus();
    }, [historys])
    
    useEffect(() => {
        // 如果没有配置默认专注信息的话，就从历史里面拿
        const clockFocusTime = setting?.clockFocusTime;
        if (clockFocusTime === undefined || clockFocusTime === null || clockFocusTime === "") {
            // console.log("没有配置默认时钟信息")
            getHistorys({limit: 1});
        }
    }, [setting])

    useEffect(() => {
        if (keyPress === 13) addTomato();
    }, [keyPress])

    return (<>
        <Modal maskClick={() => close(false)}>
            <div slot="title" className="flex items-center w-full">
                <strong>New Tomata</strong>
                <Icon icon={'close'} className="ml-auto animation-spin-hover svg-hover fill-gray-800 dark:fill-gray-50" width={16} height={16}
                    onClick={() => close(false)} />
            </div>

            <div slot="body">
                <div className="mb-2">
                    <span className="pr-2" htmlFor="name" label="name">名字</span>
                    <input value={clock.name} type="text" ref={nameInputRef}
                        // onKeyDown={e=> keyDown(e, 'name')}
                        onChange={e => setClock({ ...clock, name: e.target.value })} />
                </div>

                <div className="mb-2 flex items-center">
                    <span className="pr-2" htmlFor="time" label="time">时间</span>

                    <div className="inline-block">
                        <div className="flex flex-col">
                            <div className="flex justify-center">
                                <Icon icon={'up'} className="hover:cursor-pointer svg-hover fill-gray-800 dark:fill-gray-50"
                                    onClick={() => { stepTime('minute', true) }}
                                    onWheel={(e) => { stepTime('minute', true, e) }} />
                                <span className="w-6"></span>
                                <Icon icon={'up'} className="hover:cursor-pointer svg-hover fill-gray-800 dark:fill-gray-50"
                                    onClick={() => { stepTime('second', true) }}
                                    onWheel={(e) => { stepTime('second', true, e) }} />
                            </div>
                            <div className="rounded-sm 
                                        border-solid border border-x-0 border-y-gray-300 
                                        dark:border-y-gray-600 ">
                                <input className="w-8 text-center hover:cursor-grab" value={clock.minute} type="text"
                                    onWheel={(e) => { scrollMouse('minute', e) }}
                                    onChange={(e) => setClockWithKey('minute', e)} />
                                <span className="ml-2 mr-2">:</span>
                                <input className="w-8 text-center hover:cursor-grab" value={clock.second} type="text"
                                    onWheel={(e) => { scrollMouse('second', e) }}
                                    onChange={(e) => setClockWithKey('second', e)} />
                            </div>

                            <div className="flex justify-center">
                                <Icon icon={'down'} className="hover:cursor-pointer svg-hover fill-gray-800 dark:fill-gray-50"
                                    onClick={() => { stepTime('minute', false) }}
                                    onWheel={(e) => { stepTime('minute', false, e) }} />
                                <span className="w-6"></span>
                                <Icon icon={'down'} className="hover:cursor-pointer svg-hover fill-gray-800 dark:fill-gray-50"
                                    onClick={() => { stepTime('second', false) }}
                                    onWheel={(e) => { stepTime('second', false, e) }} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div slot="footer">
                <Button type='primary' onClick={() => addTomato()}>添加</Button>
                <Button onClick={() => close(false)}>取消</Button>
            </div>

        </Modal>

    </>)
}