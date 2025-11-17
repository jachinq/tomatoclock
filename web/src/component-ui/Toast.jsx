import React from 'react'
import ReactDOM from 'react-dom/client'
import '../style/Toast.css'
import { useEffect,useRef } from 'react';
import Icon from './Icon';

const notices = [];

function Toast(props) {
    const elemRef = useRef();
    useEffect(() => {
        notices.push(elemRef.current);

        return () => {
            notices.pop();
        }
    }, [])

    const initType = (type) => {
        const style = {};
        switch (type) {
            case 'info':
                style.iconType = 'prompt';
                style.bgColor = '#f0f0f0';
                style.textColor = '#000';
                break;
            case 'success':
                style.iconType = 'success';
                style.bgColor = '#67C23A';
                style.textColor = '#e1f3d8';
                break;
            case 'error':
                style.iconType = 'error';
                style.bgColor = '#F56C6C';
                style.textColor = '#fde2e2';
                break;
            case 'warning':
                style.iconType = 'prompt';
                style.bgColor = '#E6A23C';
                style.textColor = '#faecd8';
                break;
        }
        return style;
    }

    return (<>
        <div ref={elemRef} className="notification" style={
            {
                "--i": notices.length,
                '--d': `${props.notice.duration}ms`,
                "--notification-background": initType(props.notice.type).bgColor,
                "--notification-primary": initType(props.notice.type).textColor,
            }
        }>
            <div className="notification__body">
                <Icon icon={initType(props.notice.type).iconType} fill={initType(props.notice.type).textColor}></Icon>
                {props.notice.content}
            </div>
        </div>
    </>)
}

function createNotification() {
    const element = document.createElement('div')

    document.body.appendChild(element);
    const root = ReactDOM.createRoot(element);
    return { root, element };
}

function destroy(data) {
    const { root, element } = data;
    root.unmount()
    document.body.removeChild(element);
    
    // console.log('remove')
    notices.map(elementRef => {
        // elementRef.style.setProperty("--i", "0");
        // elementRef.style.top = "24px";
        // console.log(elementRef);
    })
}

const notice = (type, content, duration = 10000, onClose) => {

    // console.log(notices);

    const notification = createNotification();
    const { root } = notification;
    root.render(
        <React.StrictMode>
            <Toast notice={{ type, content, duration, onClose }} />
        </React.StrictMode>
    );

    if (duration > 0) {
        setTimeout(() => {
            if (onClose && onClose instanceof Function) {
                onClose(notification);
            }
            destroy(notification);
        }, duration);
    }

}

export default {
    info(content, duration, onClose) {
        notice('info', content, duration, onClose)
    },
    success(content = '操作成功', duration, onClose) {
        notice('success', content, duration, onClose)
    },
    error(content, duration, onClose) {
        notice('error', content, duration, onClose)
    },
    warning(content = '警告', duration, onClose) {
        notice('warning', content, duration, onClose)
    }
}