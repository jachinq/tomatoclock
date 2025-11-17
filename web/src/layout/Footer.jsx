import '../style/Footer.css'

import { useMemo, useEffect, useState } from 'react'
import Util from "../scripts/Util";

export default ({setting}) => {
    const [show, setShow] = useState(false);
    const [fill, setFill] = useState(null);

    const fills = useMemo(() => {
        let r = null;
        let g = null;
        let b = null;
        if (fill === null) {
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 256);
        } else {
            r = fill[0];
            g = fill[1];
            b = fill[2];
        }
        // console.log(`rgba(${r},${g},${b},0.9)`, fill);
        return [
            `rgba(${r},${g},${b},0.9)`,
            `rgba(${r},${g},${b},0.5)`,
            `rgba(${r},${g},${b},0.3)`,
            `rgba(${r},${g},${b},0.1)`,
        ]
    }, [fill])

    useEffect(()=>{
        if (!setting) return;
        const { footer = false, footerColor } = setting;
        setFill(Util.transformationRGB(footerColor));
        setShow(footer);
    }, [setting])

    if (!show) {
        return null;
    }

    return (
        <div className="wrapper">
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shapeRendering="auto">
                <defs>
                    <g id="gentle-wave">
                        <path d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                    </g>
                </defs>
                <g className="parallax">
                    <use className='gentle-waves' xlinkHref="#gentle-wave" x="48" y="0" fill={fills[0]} />
                    <use className='gentle-waves' xlinkHref="#gentle-wave" x="48" y="3" fill={fills[1]} />
                    <use className='gentle-waves' xlinkHref="#gentle-wave" x="48" y="5" fill={fills[2]} />
                    <use className='gentle-waves' xlinkHref="#gentle-wave" x="48" y="7" fill={fills[3]} />
                </g>
            </svg>
        </div>
    )
}