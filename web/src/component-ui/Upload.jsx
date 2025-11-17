import { useRef } from "react";
import Button from "./Button";

export default function Upload({ type, icon, buttonText, children, onChange }) {
    const uploadRef = useRef();

    const importData = () => {
        // console.log(uploadRef);
        if (uploadRef.current) {
            uploadRef.current.click();
        }
    }

    const uploadFile = (e) => {
        // console.log(e);
        // console.log(e.target.files);

        if (e.target.files && e.target.files.length > 0) {
            let file = e.target.files[0]; // 解析上传的文件
            let reader = new FileReader();
            // abort none 中断读取
            // readAsBinaryString file 将文件读取为二进制码，通常我们将它传送到后端，后端可以通过这段字符串存储文件
            // readAsDataURL file 将文件读取为 DataURL，一段以 data: 开头的字符串，这段字符串的实质就是 Data URL，Data URL是一种将小文件直接嵌入文档的方案。这里的小文件通常是指图像与 html 等格式的文件
            // readAsText file, [encoding] 将文件读取为文本，读取的结果即是这个文本文件中的内容
            reader.readAsText(file);
            // onabort 中断时触发
            // onerror 出错时触发
            // onload 文件读取成功完成时触发
            // onloadend 读取完成触发，无论成功或失败
            // onloadstart 读取开始时触发
            // onprogress 读取中
            reader.onload = (event) => {
                // 读取文件内容
                const fileString = event.target.result;
                // 接下来可对文件内容进行处理
                try {
                    if (onChange) onChange(fileString, file);
                    uploadRef.current.value = ''; // 置空值，保证下次的选择，onchange事件能触发
                } catch (exp) {
                    console.log(exp);
                    // this.$message({ type: 'error', message: '导入数据格式有误' });
                }
            }
        }
    }

    return (<>
        {children === undefined ?
            <>
                <Button type={type || 'primary'} icon={icon} onClick={() => importData()}>{buttonText || "上传文件"}</Button>
            </>
            :
            <>
                {children}
            </>

        }
        <input type='file' accept='.tomato' className="hidden" ref={uploadRef} onChange={(e) => { uploadFile(e) }} />

    </>)
}