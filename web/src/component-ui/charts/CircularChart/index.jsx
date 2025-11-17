import './style.css'

import { useEffect, useRef } from "react";
import { generatePieChart } from "../charts";

const datas_def = [
    // { name: 'aa', value: 10 },
    // { name: 'bbbbb', value: 20 },
    // { name: 'ccc', value: 30 },
    // { name: 'dddddddd', value: 40 },
];

export default function CircularChart({ title = "", datas = datas_def }) {
    // if (datas === null || datas.length === 0) {
    //     return <></>;
    // }

    const chartRef = useRef();

    useEffect(() => {
        if (datas === null || datas === undefined) return;
        // if (chartRef.current && chartRef.current.firstChild) chartRef.current.removeChild(chartRef.current.firstChild);
        
        generatePieChart(chartRef.current, datas, 400)
    }, [datas])

    return <>

        <div className="circular-chart mt-4" >
            <div>
                <strong>{title}</strong>
            </div>
            <div ref={chartRef}></div>
        </div>

    </>
}