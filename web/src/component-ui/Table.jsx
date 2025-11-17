import { useState } from 'react';
import '../style/Table.css'
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import useSlot from '../hooks/useSlot';
import useClassName from '../hooks/useClassName';

export default function Table({ title, data, columns, pagination = true, limit = 10, children,
    total = 0, setPage = () => { }, currentPage
}) {
    const [listPage, setListPage] = useState([]);
    const slotMap = useSlot(children); // 插槽
    const getClassName = useClassName();

    // 重新渲染分页条
    useEffect(() => {
        const totalPage = total % limit > 0 ? Math.floor(total / limit) + 1 : Math.floor(total / limit);
        if (totalPage <= 0) {
            return;
        }

        // 处理分页条展示
        const pageList = [];
        if (totalPage > 0) pageList.push({ page: 1, isPage: true });

        const middlePageLimit = totalPage < 5 ? totalPage : 5;
        const tmpMiddlePageList = [];
        for (let i = middlePageLimit; i > 0; i--) {
            if (currentPage - i > 1 && currentPage - i < totalPage) tmpMiddlePageList.push({ page: currentPage - i, isPage: true });
        }
        for (let i = 0; i < middlePageLimit; i++) {
            if (currentPage + i > 1 && currentPage + i < totalPage) tmpMiddlePageList.push({ page: currentPage + i, isPage: true });
        }

        const middlePageList = [];
        tmpMiddlePageList.map(item => {
            if (middlePageLimit < tmpMiddlePageList.length) {
                const a = Math.floor(middlePageLimit / 2);
                // console.log( {'page-a': page - a, 'curPage': item.page, page});
                if (currentPage > item.page && currentPage - a <= item.page) {
                    middlePageList.push(item)
                }
                if (currentPage === item.page) {
                    middlePageList.push(item)
                }
                if (currentPage < item.page && currentPage + a >= item.page) {
                    middlePageList.push(item)
                }
            } else {
                middlePageList.push(item)
            }
        });

        if (middlePageList.length > 0 && middlePageList[0].page > 2) {
            pageList.push({ page: "◀◀", plus: false });
            // pageList.push({ page: "◀", plus: false });
        }
        middlePageList.map(item => pageList.push(item));
        if (middlePageList.length > 0 && middlePageList[middlePageList.length - 1].page < totalPage - 1) {
            pageList.push({ page: "▶▶", plus: true });
            // pageList.push({ page: "▶", plus: true });
        }

        if (totalPage > 1) pageList.push({ page: totalPage, isPage: true });
        setListPage(pageList);
    }, [total, currentPage])

    // 分页
    const onPage = useCallback((pageItem) => {
        if (!pagination) {
            return;
        }

        const totalPage = total % limit > 0 ? Math.floor(total / limit) + 1 : Math.floor(total / limit);
        let { page, isPage, plus } = pageItem;

        // 根据不同条件，计算出下一页是哪页
        if (isPage === undefined) {
            const jumpPage = 5;
            if (plus) {
                page = (currentPage + jumpPage) > totalPage ? totalPage : currentPage + jumpPage;
            } else {
                page = (currentPage - jumpPage) < 1 ? 1 : currentPage - jumpPage;
            }
        }
        setPage(page);
    }, [total, currentPage])

    return (<>
        <table>
            {title &&
                <caption>
                    {title}<span className="table-row-count">({data && data.length})</span>
                </caption>
            }

            <thead>
                <tr>
                    {columns && columns.map(column => <th key={nanoid()}>{column.name}</th>)}
                </tr>
            </thead>

            <tbody>
                {data && data.map(item =>
                    <tr key={nanoid()} className="hover:bg-sky-200 dark:hover:bg-sky-900">
                        {columns && columns.map(column => <td key={nanoid()} className="px-2 py-1 text-center">
                            {slotMap[column.key] ? slotMap[column.key].props.render(column.name, item) :
                                <span key={nanoid()}>{item[column.key]}</span>
                            }
                        </td>)}
                    </tr>
                )}
            </tbody>

            {pagination &&
                <tfoot>
                    <tr>
                        <td>共{total}条</td>
                        <td colSpan={columns.length}>
                            <ul className='pagination'>
                                {listPage && listPage.map(item =>
                                    <li key={nanoid()} onClick={() => onPage(item)}>
                                        <span className={getClassName({ 'active': currentPage === item.page, 'jumpPage': !item.isPage })}>
                                            {item.page}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </td>

                    </tr>
                </tfoot>}
        </table>
    </>)
}