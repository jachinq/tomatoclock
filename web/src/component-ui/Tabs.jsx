
import { useRef } from 'react';
import '../style/Tabs.css'
import useSlot from '../hooks/useSlot';

export default function Tabs({ tabs, active, maxHeight = 500, children, onChange = () => { } }) {

    const slotMap = useSlot(children);
    const slideRef = useRef();

    const changeTab = (e, key) => {
        // console.log(slotMap);
        const offsetWidth = e.target.offsetWidth;
        const offsetLeft = e.target.offsetLeft;

        slideRef.current.style['left'] = offsetLeft + 'px';
        slideRef.current.style['width'] = offsetWidth + 'px';
        onChange(key);
    }

    return (<>
        <div className="tabs flex">
            {tabs && tabs.map(item =>
                <div key={item.key} className={active === item.key ? "tab-item tab-def-active" : "tab-item"}
                    onClick={(e) => changeTab(e, item.key)}
                >
                    {item.name}
                </div>
            )}
            {tabs && <div className="tab-active" ref={slideRef} ></div>}
        </div>
        <div className='tab-body' style={{ maxHeight: maxHeight + 'px' }}>
            {slotMap[active] && slotMap[active]}
        </div>
    </>)
}