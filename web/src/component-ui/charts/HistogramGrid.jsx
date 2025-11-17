import { useState, useMemo, useEffect, useRef } from "react"
import useResizeWin from "../../hooks/useResizeWin";
import { useCallback } from "react";
import { nanoid } from "nanoid";

import './charts.css'

const def_datas = [
    { date: "01", value: 12, tip: "共 12 个" },
    { date: "02", value: 0, tip: "共 0 个" },
    { date: "03", value: 10, tip: "共 10 个" },
    { date: "04", value: 18, tip: "共 18 个" },
    { date: "05", value: 8, tip: "共 8 个" },
]
for (let i = 6; i < 32; i++) {
    def_datas.push({ date: i.toString().padStart(2, "0"), value: i, tip: `共 ${i} 个` })
}

export default function ({ title="", datas = def_datas, maxWidth = 980, maxHeight = 305 }) {
    if (datas === null || datas.length === 0) {
        console.log("no datas", datas);
        return <></>;
    }

    const { windowWidth } = useResizeWin();
    const [xlayer, setXlayer] = useState([]);

    const { ylayer = [], maxValue = 0, dataSize = 0 } = useMemo(() => {

        const maxValue = datas.reduce((v1, v2) => v1.value > v2.value ? v1 : v2, { value: 0 }).value;

        const ylayerValueClass = "flex items-start justify-end mx-1";
        const ylayerValueStyle = { transform: "translateY(-10px)" };
        const ylayerBgClass = "border-0 border-solid border-t border-gray-300 dark:border-gray-600";
        const yValue = maxValue > 2 ? maxValue / 3 : 1;
        const ylayer = [
            { value: Math.floor(yValue * 4), className: ylayerValueClass, style: ylayerValueStyle },
            { className: ylayerBgClass },
            { value: Math.floor(yValue * 3), className: ylayerValueClass, style: ylayerValueStyle },
            { className: ylayerBgClass },
            { value: Math.floor(yValue * 2), className: ylayerValueClass, style: ylayerValueStyle },
            { className: ylayerBgClass },
            { value: Math.floor(yValue * 1), className: ylayerValueClass, style: ylayerValueStyle },
            { className: ylayerBgClass },
            { value: Math.floor(yValue * 0), className: ylayerValueClass, style: ylayerValueStyle },// 最后一行占位
            { className: ylayerBgClass },
        ]; // 纵坐标层数

        ylayer.map(item => { // 单位换算
            if (item.value) {
                if (item.value > 999 && item.value < 9999) {
                    item.value = item.value / 1000 + 'k';
                } else if (item.value > 9999 && item.value <= 999999) {
                    item.value = item.value / 10000 + 'w';
                } else if (item.value > 999999 && item.value <= 9999999) {
                    item.value = item.value / 1000000 + 'm';
                } else if (item.value > 9999999) {
                    item.value = item.value / 10000000 + 'kw';
                }
            }
        })


        setXlayer([{}, ...datas]); // 第一列占位

        const dataSize = (datas?.length || 0);
        return {
            ylayer, maxValue, dataSize
        }
    }, [datas])

    const calculte = useMemo(() => {
        const ylayerTextW = 40;
        const xlayerTextH = 32;

        const xGap = 5;
        const wwidth = windowWidth > maxWidth ? maxWidth : windowWidth;
        let xUnitPx = dataSize > 0 ? (wwidth / (dataSize + xGap * 2)) : 0; // x轴条形图宽度

        const totalW = wwidth - 100 * 2;
        const totalH = maxHeight;

        // 计算 y 轴的单位高度，最终和数值相乘就是条形的高度
        const splitUnitPx = (totalH - xlayerTextH) / (ylayer.length / 2 - 1);  // 背景图一个栅格的高度
        const histoMaxH = totalH - xlayerTextH - splitUnitPx; // 条形图的最大高度
        let yUnitPx = histoMaxH / maxValue; // 条形图的最大高度除最大值，得出y轴的单位高度
        if (maxValue < 3) {
            yUnitPx = histoMaxH / ( 4 - maxValue )
        }

        let needW = (xUnitPx + xGap * 2) * dataSize;
        while (needW > (totalW - ylayerTextW)) {
            xUnitPx -= 1;
            if (xUnitPx < 10) { // 到达底线了，还是放不下，砍掉后面放不下的数据
                xUnitPx = 10;
                const realSize = Math.ceil((totalW - ylayerTextW) / (xUnitPx + xGap * 2)); // 刚好放得下的个数
                const tmp = xlayer.slice(0, realSize);
                // console.log("宽度不够", {size: dataSize, totalW, needW, realSize}, tmp);
                if (tmp.length > 0) {
                    setXlayer(tmp)
                };
                break;
            }
            needW = (xUnitPx + xGap * 2) * dataSize;
        }

        xlayer.map(item => { item.hide = undefined });
        if (xlayer.length < datas.length + 1) { // 只要是隐藏了数据的，检查一次当前宽度最新能放的个数
            const last = xlayer[xlayer.length - 1];
            if (last) last.hide = true;
            // console.log(last);
            const realSize = Math.ceil((totalW - ylayerTextW) / (xUnitPx + xGap * 2)); // 刚好放得下的个数
            if (realSize > xlayer.length) {
                const tmp = [{}, ...datas].slice(0, realSize);
                setXlayer(tmp)
                // console.log('恢复', realSize, xlayer.length, tmp)
            }
        }

        return {
            yUnitPx, xUnitPx, totalW, totalH, ylayerTextW, xlayerTextH
        }
    }, [windowWidth, datas]);

    const {
        yUnitPx = 0,
        xUnitPx = 0,
        totalW = 0,
        totalH = 0,
        ylayerTextW = 0,
        xlayerTextH = 0,
    } = calculte;

    useEffect(() => {
        // console.log(xlayer.length, calculte);
        // console.log('##@#@#', yUnitPx)
    }, [calculte])


    // 提示相关
    const tooltipsRef = useRef();
    const tooltipsLineRef = useRef();
    const [showTooltips, setShowTooltips] = useState(false);
    const [tooltips, setTooltips] = useState(false);
    const hover = useCallback((e, data) => {
        setTooltips(data);
        setShowTooltips(true);
        setTimeout(() => {
            const top = e.target.offsetTop;
            const tooltipsWidth = tooltipsRef.current.offsetWidth || 0;
            const eWidth = e.target.offsetWidth;

            const offsetLeft = e.target.offsetLeft;

            let left = offsetLeft + eWidth / 2 - tooltipsWidth / 2;
            if (left < 0) left = 0;
            if ((left + tooltipsWidth) > maxWidth) {
                left = maxWidth - tooltipsWidth;
            }

            // console.log(offsetLeft, eWidth, left, tooltipsWidth);

            if (tooltipsRef.current) {
                tooltipsRef.current.style.left = left + 'px';
                tooltipsRef.current.style.top = -10 + 'px';
            }

            if (tooltipsLineRef.current) {
                // console.log(top);
                tooltipsLineRef.current.style.height = top - 10 + 'px';
                tooltipsLineRef.current.style.top = 10 + 'px';
                tooltipsLineRef.current.style.left = offsetLeft + eWidth / 2 + 'px';
            }
        }, 1);

    }, [])

    return (<>
        {title && <div
        //  style={{marginBottom: gap * heightFactor + 18 + 'px'}}
        ><strong>{title}</strong></div>}
        <div className="histogram border mb-4 mt-8" style={{
            width: totalW, height: totalH,
            position: "relative"
        }}>

            {/* y轴数值及背景栅格 */}
            <div className="ylayer grid absolute w-full h-full" style={{
                gridTemplateColumns: `${ylayerTextW}px 1fr`,
                gridTemplateRows: `repeat(${ylayer.length / 2 - 1}, 1fr) ${xlayerTextH}px`
            }}>
                {ylayer?.map(item => <div key={nanoid()} className={item.className}
                    style={item.style}> {item.value} </div>)}
            </div>

            {/* 提示 */}
            {/* <div className="tips-line absolute border border-solid border-blue-500 transition-all"
                style={{ display: showTooltips ? 'block' : 'none' }}
                ref={tooltipsLineRef}></div>
            <div className="tips absolute top-0 left-4 bg-blue-500 rounded p-2 text-xs text-center
                        transition-all whitespace-nowrap" ref={tooltipsRef}
                style={{ display: showTooltips ? 'block' : 'none' }}>
                <div>{tooltips.tip}</div>
                {tooltips.hide && <div>宽度不够隐藏后面数据</div>}
                <div>{tooltips.value}{tooltips.unit}</div>
            </div> */}

            {/* 条形图 */}
            <div className="xlayer grid absolute w-full h-full" style={{
                gridTemplateColumns: `${ylayerTextW}px repeat(${xlayer.length - 1}, 1fr)`,
                gridTemplateRows: `1fr ${xlayerTextH}px`,
            }}>

                { // 条形
                    xlayer?.map(item => (
                        <div key={nanoid()} className="flex flex-col-reverse items-center justify-beg">
                            <div className="bar border-blue-400 hover:border-solid" style={{
                                borderRadius: '4px 4px 0 0',
                                backgroundColor: "lightgreen",
                                width: xUnitPx,
                                height: (item.value || 0) * yUnitPx,
                                backgroundImage: item.hide ? 'linear-gradient(to bottom, #db5656 0%, lightgreen 100%)'
                                    : 'linear-gradient(to bottom, skyblue 0%, lightgreen 100%)',
                            }}
                                // onMouseEnter={(e) => { hover(e, item) }}
                                // onClick={() => { setShowTooltips(!showTooltips) }}
                                // onMouseLeave={() => { setShowTooltips(false) }}
                            ></div>
                            {item.value > 0 && <div className="bar-tips text-xs">{item.value}</div>}
                        </div>
                    ))
                }

                { // 数值
                    xlayer?.map(item => (
                        <div key={nanoid()} className="flex flex-row items-center justify-center text-sm">
                            {item.date}
                        </div>
                    ))
                }


            </div>

        </div>
    </>)
}