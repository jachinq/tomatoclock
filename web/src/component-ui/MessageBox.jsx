import React from 'react'
import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import Icon from "./Icon";
import Modal, {getZindex} from './Modal';
import Button from './Button';

const Type = {
    ALERT: 'alert',
    CONFIRM: 'confirm',
    PROMTPT: 'prompt',
    MESSAGE_BOX: 'msgbox',
}

function destroy(data) {
    const { root, element } = data;
    root.unmount()
    document.body.removeChild(element)
}

const messageBox = (type, option) => {

    const element = document.createElement('div')
    document.body.appendChild(element);
    const root = ReactDOM.createRoot(element);

    const onCancel = (e) => {
        // console.log("组件内：点击取消");
        if (option.onCancel && option.onCancel instanceof Function) option.onCancel();
        destroy({ root, element })
    }

    const onConfirm = (e) => {
        // console.log("组件内：点击确定");
        if (option.onConfirm && option.onConfirm instanceof Function) option.onConfirm();
        destroy({ root, element })
    }

    root.render(
        <React.StrictMode>
            <Confirm {...option} onCancel={() => onCancel()} onConfirm={() => onConfirm()} />
        </React.StrictMode>
    )
}


export default {
    confirm(option) {
        return messageBox('confirm', option);
    }
}

const initType = (type) => {
    const style = {};
    switch (type) {
        case Type.CONFIRM:
            style.iconType = 'help';
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


function Confirm(props) {

    const arg = { ...props };
    arg.confirmButtonText = props.option.confirmButtonText || "确定";
    arg.cancelButtonText = props.option.cancelButtonText || "取消";

    useEffect(() => {

    }, [])

    const onCancel = () => {
        props.onCancel();
    }
    const onConfirm = () => {
        props.onConfirm();
    }

    return (<>
        <Modal maskClick={() => onCancel()}>
            <div slot='title' className="flex items-center flex-row">
                <Icon icon={'help'} style={{ fill: 'rgb(243 244 246)' }}></Icon>
                {props.title || "提示"}
            </div>
            <div slot='body' className="tips">
                <div>{props.content}</div>
            </div>
            <div slot='footer' className='mt-4'>
                <Button type={props.option.cancelButtonType || ''} onClick={() => onCancel()}>{arg.cancelButtonText}</Button>
                <Button type={props.option.confirmButtonType || ''} onClick={() => onConfirm()}>{arg.confirmButtonText}</Button>
            </div>
        </Modal>
    </>)
}