import { nanoid } from 'nanoid';
import React from 'react'
import useState from 'react-usestateref';
import { useEffect } from 'react';

import '../style/Modal.css'
import useSlot from '../hooks/useSlot';
import useWindownResize from '../hooks/useResizeWin';

const zIndexs = [];

export function getZindex() {
    console.log(zIndexs);
    return zIndexs;
}

export default function Modal({children, maskClick = () => { }, width}) {
    const { windowWidth } = useWindownResize();

    const [id, setId, idRef] = useState('');
    const [zIndex, setZIndex, zIndexRef] = useState(0);

    // 插槽
    const slotMap = useSlot(children);

    // zindex 管理
    useEffect(() => {
        setId(nanoid());

        let maxIndex = 0;
        if (zIndexs && zIndexs.length > 0) maxIndex = zIndexs[zIndexs.length - 1].index + 10;
        zIndexs.push({ id: idRef.current, index: maxIndex });
        setZIndex(maxIndex);

        return () => {
            let index = -1;
            zIndexs.map((i, item) => {
                if (item.id === idRef.current) index = i;
            })
            zIndexs.splice(index, 1);
        }
    }, [])

    return (<>
        <div className="modal-wrap" id={id}>
            <div className="mask" style={{ zIndex: zIndex }} onClick={() => maskClick()}></div>
            <div className="modal animation-open" style={{ zIndex: zIndex + 1, maxWidth: windowWidth, width, overflow: "scroll" }}>
                {slotMap['title'] && <div className="title mb-4 flex items-center flex-row">
                    {slotMap['title']}
                </div>}
                {slotMap['body'] && <div className="modal-body">
                    {slotMap['body']}
                </div>}
                {slotMap['footer'] && <div className="footer">
                    {slotMap['footer']}
                </div>}
            </div>
        </div>
    </>)
}