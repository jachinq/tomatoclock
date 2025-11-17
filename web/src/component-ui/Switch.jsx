// import useState from 'react-usestateref';
import { useCallback } from 'react';
import '../style/Swithch.css'

export default function Switch({ label, value = false,
    // 默认不处理 onChange 事件
    onChange = () => { console.log('please use onChange event') }
}) {

    // 定义一个事件处理函数统一处理 value 变化的场景
    const handleChange = useCallback(
        (deltaValue) => {
            // 直接修改外部的 value 值
            if (deltaValue != null && deltaValue != undefined) {
                onChange(deltaValue);
            } else {
                onChange(value);
            }
        }
        , [value, onChange]
    );

    return (<>
        <label className="switch-wrapper">
            <span className="switch__label">
                {label}
            </span>
            <span className="switch">
                <input type="checkbox" checked={value}
                    onChange={(evt) => handleChange(evt.target.checked)}
                />
                <span className="slider round"></span>
            </span>
            <span>
                {/* {props.labelRight} */}
            </span>
        </label>
    </>);

}