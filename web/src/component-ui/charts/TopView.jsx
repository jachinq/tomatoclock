import { nanoid } from "nanoid";
import useSlot from "../../hooks/useSlot";
import { useEffect } from "react";

export default function TopView({ title = "", datas = [], children, onChange = () => { } }) {
    if (datas === null || datas.length === 0) {
        return <></>;
    }

    const slotMap = useSlot(children);

    useEffect(() => {
        if (datas === undefined || datas === null) return;

        // Object.keys(datas).map(key => {
        //     const data = datas[key];
        //     const widthMap = {}; // 样式数据，长度
        //     let maxWidth = 0;
        //     for (let i = 0; i < data.length; i++) {
        //         const cnt = data[i].cnt || 0;
        //         if (widthMap[cnt]) continue;
        //         widthMap[cnt] = maxWidth;
        //         maxWidth += 40;
        //     }

        //     let index = 1;
        //     data.map(item => {
        //         item.width = `calc(100% - ${widthMap[item.cnt]}px)`;
        //         item.sort = index++;
        //     })
        // })
    }, [datas])

    return <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded w-full overflow-x-scroll">

        {/* {title && <strong>{title}</strong>} */}

        {Object.keys(datas).map(item => title === item ?
            <strong key={item}>{item}</strong> :
            <span key={item} className="ml-1 text-xs cursor-pointer hover:underline" onClick={() => onChange(item)}>{item}</span>)
        }

        {datas[title]?.map(item =>
            <div className="bg-gray-200 dark:bg-gray-700 my-2 border-solid border-0 border-r-2 border-blue-600 pr-2"
                style={{ width: item.width || item.cnt * 80 + "px" }}
                key={nanoid()}>
                <div className="flex items-center">
                    <div className="text-xl h-16 bg-gray-300 
                                    dark:bg-gray-800 p-2 flex items-center mr-2 
                                    whitespace-nowrap overflow-hidden">
                        {item.sort}
                    </div>
                    {slotMap['slot'] ? <>
                        {slotMap['slot'].props?.render ? slotMap['slot'].props.render(item.name, item) : <div>{item.name}</div>}
                    </> :
                        <div>
                            <strong className="whitespace-nowrap">{item.name}</strong>
                            <div className="text-sm whitespace-nowrap">{item.cntFmt}</div>
                            <div className="text-xs whitespace-nowrap">{item.remark}</div>
                        </div>
                    }
                </div>
            </div>
        )}
    </div>
}