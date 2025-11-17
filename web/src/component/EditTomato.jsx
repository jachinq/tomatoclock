import useState from "react-usestateref";
import Button from "../component-ui/Button";
import Modal from "../component-ui/Modal";
import { useEffect } from "react";
import Storge from "../scripts/Storge";
import Toast from "../component-ui/Toast";
import useAsync from "../hooks/useAsync";
import { set_history } from "../scripts/Database";

export default function EditTomato({form={}, close=()=>{}}) {

    const [editForm, setForm, formRef] = useState({
        id: form.id || '',
        name: form.name || '',
        mark: form.mark || '',
    });

    const {execute: setHistory} = useAsync(set_history);

    const change = (key, e) => {
        setForm({...formRef.current, [key]: e.target.value})
    }

    const save = ()=> {
        if (editForm.id === undefined || editForm.id === null || editForm.id === '') {
            Toast.error('当前记录 ID 有误，无法修改');
            return;
        }
        console.log(editForm);
        setHistory(editForm, close);
    }

    return (<>
        <Modal maskClick={()=>close()}>
            <div slot='title'>
                <strong>编辑</strong>
            </div>
            <div slot='body' className=" grid gap-4 grid-cols-[50px_1fr]">
                <span className="mr-2">ID</span><input type="text" defaultValue={form.id} disabled/>
                <span className="mr-2">状态</span><input type="text" defaultValue={form.statusName} disabled/>
                <span className="mr-2">名称</span><input type="text" defaultValue={editForm.name} onChange={(e)=>change('name', e)}/>
                <span className="mr-2">笔记</span><textarea placeholder="笔记" defaultValue={editForm.mark} onChange={(e)=>change('mark', e)}/>
            </div>
            <div slot='footer'>
                <Button onClick={()=>close()}>取消</Button>
                <Button type='primary' onClick={()=>save()}>确定</Button>
            </div>
        </Modal>
    </>)
}