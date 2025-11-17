import { useState } from "react";
import Table from "../../component-ui/Table";
import { useEffect } from "react";
import { formatDateTime } from "../../scripts/Util";
import MessageBox from "../../component-ui/MessageBox";
import Button from "../../component-ui/Button";
import EditTomato from "../../component/EditTomato";
import useAsync from "../../hooks/useAsync";
import { useCallback } from "react";
import {del_history, get_historys_page} from "../../scripts/Database";
import useSingleton from "../../hooks/useSingleton";

export default function ({}) {

    const [form, setForm] = useState({ begTime: '', endTime: '', page: 1, limit: 10 });
    const [historysFmt, setHistorysFmt] = useState([]);

    const [showEditTomato, setShowEditTomato] = useState(false);
    const [editTomato, setEditTomato] = useState({});

    const columns = [
        { key: 'name', name: '名称' },
        { key: 'statusName', name: '状态' },
        { key: 'goalTime', name: '目标' },
        { key: 'realTime', name: '执行' },
        { key: 'createFmt', name: '创建时间' },
        { key: 'updateFmt', name: '完成时间' },
        { key: 'edit', name: '操作' },
    ]

    const { execute: getHistorys, data: pageHistorys, } = useAsync(get_historys_page);
    const { execute: delHistory, } = useAsync(del_history);

    // 改变查询条件
    const changeForm = (form) => {
        let begTime = undefined;
        let endTime = undefined;
        if (form.begTime !== '') {
            begTime = new Date(form.begTime + " 00:00:00").getTime();
        }
        if (form.endTime !== '') {
            endTime = new Date(form.endTime + " 23:59:59").getTime();
        }

        // 开始比结束还大，自动交换两者
        if (begTime !== undefined && endTime !== undefined && begTime > endTime) {
            const { begTime: begTimeFmt, endTime: endTimeFmt } = form;
            form = { ...form, begTime: endTimeFmt, endTime: begTimeFmt };
            begTime = new Date(form.begTime + " 00:00:00").getTime();
            endTime = new Date(form.endTime + " 23:59:59").getTime();
        }
        console.log("form change", form)
        setForm(form); // 重新渲染组件值
        getHistorys(form); // 查询数据
    }
    const initData = useSingleton(changeForm);

    useEffect(() => {
        if (pageHistorys) {
            formatDetail(pageHistorys.list); // 拿到数据后，进行数据格式化
        }
    }, [pageHistorys])

    const formatDetail = useCallback((historys) => {
        if (!historys) return;

        historys.map(item => {
            item.statusName = getStatusName(item.status);
            item.updateFmt = formatDateTime(item.update, 'yyyy-MM-dd HH:mm:ss');
            item.createFmt = formatDateTime(item.create, 'yyyy-MM-dd HH:mm:ss');
            const real = item.update - item.create;
            const realMin = (Math.floor(real / 1000 / 60)).toString().padStart(2, "0");
            const realSec = (Math.floor(real / 1000 % 60)).toString().padStart(2, "0");
            item.realTime = `${realMin}:${realSec}`;
            item.goalTime = `${item.minute}:${item.second}`;
        })
        // console.log('format detail', historys);
        setHistorysFmt(historys);
    }, []);

    // 获取状态名称
    const getStatusName = useCallback((status) => {
        switch (status) {
            case 1: return "进行中";
            case 2: return "已完成";
            case 3: return "已放弃";
            default: return "";
        }
    }, []);

    const onDel = (text, record) => {
        MessageBox.confirm({
            content: <>
                <span className=" text-red-400">确定删除当前记录？</span>
                <br />
                <div>名称：{record.name}</div>
                <div>时间：{record.createFmt}</div>
                <div>备注：{record.mark}</div>
            </>,
            title: "警告",
            option: {
                confirmButtonType: 'danger',
            },
            onConfirm: () => {
                delHistory(record.id);
                changeForm(form); // 刷新数据
            }
        })

    }

    useEffect(() => {
        initData(form)
    }, [])

    return <>
        <div className="search my-4">
            <label className="pr-2" htmlFor="begTime" label="begTime">开始</label>
            <input value={form.begTime} type="date" className=""
                onChange={e => changeForm({ ...form, begTime: e.target.value })} />
            <label className="px-2" htmlFor="begTime" label="begTime">结束</label>
            <input value={form.endTime} type="date" className=""
                onChange={e => changeForm({ ...form, endTime: e.target.value })} />
        </div>
        {/* <Table columns={columns} data={historysFmt} pagination={true} frontedPage={false} total={pageHistorys?.total} setPage={(page)=>{changeForm({page})}}> */}
        <Table columns={columns} data={historysFmt} pagination={true} 
            total={pageHistorys?.total} 
            limit={form.limit}
            currentPage={form.page}
            setPage={(page)=>{changeForm({...form, page})}}>
            <div slot='edit' className="whitespace-nowrap" render={(text, record) => {
                return <div className=" whitespace-nowrap">
                    <Button type='danger' onClick={() => onDel(text, record)} icon='delete'></Button>
                    <Button type='primary' onClick={() => { setEditTomato(record); setShowEditTomato(true) }} icon='edit'></Button>
                </div>
            }}>
            </div>
        </Table>

        {showEditTomato && <EditTomato form={editTomato} close={(hit) => { setShowEditTomato(false); if (hit) changeForm({form}) }}></EditTomato>}
    </>
}