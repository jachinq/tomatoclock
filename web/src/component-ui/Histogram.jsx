import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";


export default function Histogram(props) {

    const [showTooltips, setShowTooltips] = useState(false);
    const [tooltips, setTooltips] = useState(false);
    const tooltipsRef = useRef();
    const tooltipsLineRef = useRef();

    const data = props.data || [
        { date: 12, value: 2 },
        { date: 13, value: 1 },
        { date: 14, value: 5 },
        { date: 15, value: 3 },
        { date: 16, value: 18 },
        { date: 17, value: 8 },
        { date: 18, value: 4 },
    ];

    const height = props.height || 400;
    const width = props.width || 400;
    const y = props.y || 'value';
    const x = props.x || 'date';
    const title = props.title || "一周分布图";



    const hover = (e, data) => {
        const top = e.target.offsetTop;
        // const left = e.screenX - e.pageX;
        // console.log(e);
        // setShowTooltips(true);
        setTooltips(data);

        // console.log(top, left);

        const tooltipsWidth = tooltipsRef.current.offsetWidth;
        const eWidth = e.target.offsetWidth;

        const offsetLeft = e.target.offsetLeft;

        let left = offsetLeft + eWidth / 2 - tooltipsWidth / 2;
        if (left < 0) left = 0;
        if ((left + tooltipsWidth) > width) {
            left = width - tooltipsWidth;
        }

        // console.log(offsetLeft, eWidth, left, tooltipsWidth);

        if (tooltipsRef.current) {
            tooltipsRef.current.style.left = left + 'px';
            tooltipsRef.current.style.top = 10 + 'px';
        }

        if (tooltipsLineRef.current) {
            // console.log(top);
            tooltipsLineRef.current.style.height = top - 10 + 'px';
            tooltipsLineRef.current.style.top = 10 + 'px';
            tooltipsLineRef.current.style.left = offsetLeft + eWidth / 2 + 'px';
        }
    }
    const onMouseLeave = (e, data) => {
        // setShowTooltips(false);

    }

    const getMaxY = () => {
        let max = 0;
        data.map(item => {
            if (max < item[y]) max = item[y]
        })
        return max;
    }
    const maxY = getMaxY();
    let heightFactor = maxY > 1 ? Math.ceil((height - 250) / maxY) : maxY === 1 ? 50 : 10;
    heightFactor = heightFactor === 50 ? 40 : heightFactor;

    const getHeight = (item) => {
        return item[y] * heightFactor + 'px';
    }
    const getWidth = (item) => {
        let temp = Math.floor(width / data.length - 25);
        if (temp <= 15) {
            temp = 15;
        }

        const widthPx = temp + 'px';
        // console.log(widthPx)
        return widthPx;
    }

    const gap = maxY > 1 ? Math.ceil(maxY / 2) : maxY === 1 ? 1 : 5;

    const yList = [0, gap, 2 * gap, 3 * gap].reverse();
    // yList.sort((a, b) => b - a);

    useEffect(() => {
        setShowTooltips(false);
    },[data])

    // console.log('heightFactor', maxY, heightFactor, gap, yList);
    return (<>

        <div className="w-full">
        <div style={{ width: width + "px", height: height + "px" }}>

            {title && <div
            //  style={{marginBottom: gap * heightFactor + 18 + 'px'}}
            ><strong>{title}</strong></div>}

            <div className="flex relative h-full">
                <div className="tips-line absolute border border-solid border-blue-500 transition-all"
                    style={{ display: showTooltips ? 'block' : 'none' }}
                    ref={tooltipsLineRef}></div>
                <div className="tips absolute top-0 left-4 bg-blue-500 rounded p-2 text-xs text-center
                        transition-all whitespace-nowrap" ref={tooltipsRef}
                    style={{ display: showTooltips ? 'block' : 'none' }}>
                    <div>{tooltips.tip}</div>
                    <div>{tooltips.value}{tooltips.unit}</div>
                </div>

                <div className="bg text-xs absolute w-full -z-10 top-[-20px]"
                    style={{ height: yList.length * gap * heightFactor + 'px' }}
                >
                    {yList && yList.map(item =>
                        <div className=" relative w-full border-gray-300 dark:border-gray-600 border border-solid border-x-0 border-b-1 border-t-0"
                            style={{ height: gap * heightFactor + 'px' }}
                            key={nanoid()}
                        >
                            <span className=" absolute bottom-[-10px] bg-white dark:bg-gray-800">{item}</span>

                        </div>)}
                </div>
                <div className="flex ml-4 justify-between w-full"
                    style={{ height: yList.length * gap * heightFactor + 'px' }}
                >
                    {data && data.map(item =>
                        <div key={nanoid()} className="flex flex-col items-center justify-end">
                            <div className="bg-blue-500 flex justify-center transition-all border-blue-400
                                hover:border-solid" style={{ 
                                    height: getHeight(item), 
                                    width: getWidth(item), 
                                    backgroundImage: 'linear-gradient(to bottom, skyblue 0%, lightgreen 100%)' }
                                }
                                onMouseEnter={(e) => { hover(e, item) }}
                                onClick={(e) => { setShowTooltips(!showTooltips) }}
                                onMouseLeave={(e) => { onMouseLeave(e, item) }}
                            >
                            </div>
                            <div className="text-xs whitespace-nowrap">{item[x]}</div>
                        </div>
                    )}
                </div>
            </div>

        </div>
        </div>

    </>)
}