import useState from "react-usestateref"
import Button from "../component-ui/Button";
import Modal from "../component-ui/Modal";
import Switch from "../component-ui/Switch";
import mitt from "../scripts/mitt";
import EventBus from "../scripts/EventBus";
import { setBackgroundImg, music, mesgNotice } from "../scripts/Util";
import Upload from "../component-ui/Upload";
import { useCallback, useMemo } from "react";
import FormItem from "../component-ui/FormItem";
import Tabs from "../component-ui/Tabs";
import useAsync from "../hooks/useAsync";
import { export_data, import_data, set_config } from "../scripts/Database";

import '../style/Setting.css';

const defaultConfig = {
    yiyanConfig: `{"url":"xxx","call":"async (res) => await res.text()"}`,
}

export default function Setting({ setting = {}, close = () => { } }) {
    const [config, setConfig] = useState(setting);
    const [activeTab, setActiveTab] = useState('clock');

    const { execute: setSetting } = useAsync(set_config);
    const { execute: importData, } = useAsync(import_data);
    const { execute: exportData, } = useAsync(export_data);

    const changeConfig = useCallback((key, value) => {
        const keyMap = {
            "music": () => mitt.emit(EventBus.CHANGE_BACKGROUND_MUSIC, value),
            "musicUrl": () => mitt.emit(EventBus.CHANGE_BACKGROUND_MUSIC, true, value),
            "yiyan": () => mitt.emit(EventBus.OPEN_YIYAN, value),
            "picture": () => setBackgroundImg(setting.dark || true, value, setting.themePictureUrl),
        };

        setConfig((oldVal) => {
            const newVal = { ...oldVal, [key]: value, }
            setSetting("setting", newVal);

            (keyMap[key] ? keyMap[key] : () => { })(); // 如果有匹配的说明要处理额外的事件。    
            mitt.emit(EventBus.REFRESH_SETTING);  // 刷新App的设置数据
            return newVal;
        });
    }, []);

    const tabs = useMemo(() => {
        return [
            { key: "clock", name: "时钟设置" },
            { key: "ui", name: "样式设置" },
            { key: "notice", name: "通知设置" },
            { key: "music", name: "音乐设置" },
            { key: "data", name: "数据操作" },
        ];
    }, []);

    return (<>
        <Modal maskClick={() => close()}>
            <div slot='body'>
                <Tabs tabs={tabs} active={activeTab} onChange={(e) => setActiveTab(e)}>
                    <div slot="clock" className="setting-form">
                        <FormItem label="默认专注时间" width={120}>
                            <div>
                                <input placeholder="单位：分钟" type="number" min={0}
                                    value={config.clockFocusTime} style={{ width: "120px" }}
                                    onChange={(e) => changeConfig('clockFocusTime', e.target.value)}></input>
                                <span className=" ml-1 text-xs">分钟</span>
                            </div>
                        </FormItem>
                        <FormItem label="休息时间" width={120}>
                            <div>
                                <input placeholder="单位：分钟" type="number" min={0}
                                    value={config.clockRestTime} style={{ width: "120px" }}
                                    onChange={(e) => changeConfig('clockRestTime', e.target.value)}></input>
                                <span className=" ml-1 text-xs">分钟</span>
                            </div>
                        </FormItem>
                    </div>
                    <div slot="ui" className="setting-form">
                        <FormItem label="图片背景">
                            <Switch value={config.picture} onChange={(e) => changeConfig('picture', e)}></Switch>
                        </FormItem>
                        <FormItem label="黑暗主题">
                            <Switch value={config.dark} onChange={(e) => changeConfig('dark', e)}></Switch>
                        </FormItem>
                        <FormItem label="波浪效果">
                            <Switch value={config.footer} onChange={(e) => changeConfig('footer', e)}></Switch>
                        </FormItem>
                        <FormItem label="开启一言">
                            <Switch value={config.yiyan} onChange={(e) => changeConfig('yiyan', e)}></Switch>
                        </FormItem>
                        {config.picture && <FormItem label="图片地址">
                            <textarea placeholder="为空则使用默认地址" rows={3} value={config.themePictureUrl}
                                onChange={(e) => changeConfig('themePictureUrl', e.target.value)}></textarea>
                        </FormItem>}
                        {config.footer &&
                            <FormItem label="波浪颜色">
                                <div className=" flex">
                                    <input type="color" value={config.footerColor || ''}
                                        onChange={(e) => changeConfig('footerColor', e.target.value)}></input>
                                    <button icon='close' title="清除"
                                        onClick={(e) => changeConfig('footerColor')}>x</button>
                                </div>
                            </FormItem>
                        }
                        {config.yiyan && <FormItem label="一言配置">
                            <textarea placeholder={"提供JSON字符，包含url和call字段，url为api地址，call为async方法，返回一言字符串。示例" + defaultConfig.yiyanConfig} rows={3} value={config.yiyanConfig}
                                onChange={(e) => changeConfig('yiyanConfig', e.target.value)}></textarea>
                        </FormItem>}
                    </div>
                    <div slot="notice" className="setting-form">
                        <FormItem label="开启提醒">
                            <Switch value={config.notice} onChange={(e) => changeConfig('notice', e)}></Switch>
                        </FormItem>
                        <FormItem label="提醒音效">
                            <Switch value={config.noticeSound} onChange={(e) => changeConfig('noticeSound', e)}></Switch>
                        </FormItem>
                        <FormItem label="开启图片">
                            <Switch value={config.noticePicture} onChange={(e) => changeConfig('noticePicture', e)}></Switch>
                        </FormItem>
                        {config.noticeSound &&
                            <FormItem label="音效地址">
                                <textarea placeholder="为空则使用默认音效" rows={3} value={config.noticeSoundUrl}
                                    onChange={(e) => changeConfig('noticeSoundUrl', e.target.value)}></textarea>
                            </FormItem>}
                        {config.noticePicture &&
                            <FormItem label="图片地址">
                                <textarea placeholder="为空则使用默认地址" rows={3} value={config.noticePictureUrl}
                                    onChange={(e) => changeConfig('noticePictureUrl', e.target.value)}></textarea>
                            </FormItem>
                        }
                        <Button onClick={() => { mesgNotice(setting); music(setting) }}>提醒测试</Button>
                    </div>
                    <div slot="music" className="setting-form">
                        <FormItem label="背景音乐">
                            <Switch value={config.music} onChange={(e) => changeConfig('music', e)}></Switch>
                        </FormItem>
                        <FormItem label="音乐地址">
                            <textarea placeholder="为空则使用默认地址" rows={3} value={config.musicUrl}
                                onChange={(e) => changeConfig('musicUrl', e.target.value)}></textarea>
                        </FormItem>
                    </div>
                    <div slot="data" className="setting-form">
                        <Upload type='success' icon='import' buttonText={'导入数据'} onChange={(data) => importData(data, close)}></Upload>
                        <Button type='primary' onClick={() => exportData()} icon='export'>导出备份</Button>
                    </div>
                </Tabs>
            </div>
        </Modal>
    </>)
}