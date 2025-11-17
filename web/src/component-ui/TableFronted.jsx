import { useState } from 'react';
import '../style/Table.css'
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import useSlot from '../hooks/useSlot';
import useClassName from '../hooks/useClassName';

export default function Table({ title, data, columns, pagination = true, limit = 10, children }) {
    const [listPage, setListPage] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const slotMap = useSlot(children); // 插槽
    const getClassName = useClassName();

    // 初始化
    useEffect(() => {
        onPage({ page: activePage });
    }, [data])

    // 计算当前页需要展示的数据
    const listShow = useMemo(()=>{
        if (!pagination) { // 如果不开启分页，则直接返回全部数据
            return [...data];
        }

        // 处理分页数据
        let start = (activePage - 1) * limit;
        const end = start + limit;
        if (start < 0 || end < 0) return [];
        // console.log(page, start, end);

        const resultData = [];
        for (; start < end; start++) {
            if (data[start]) {
                resultData.push(data[start]);
            }
        }
        return resultData;
    }, [data, activePage])

    // 分页
    const onPage = useCallback((pageItem) => {
        if (!pagination) {
            return;
        }

        // 根据不同条件，计算出下一页是哪页
        const total = data.length || 0;
        const totalPage = total % limit > 0 ? Math.floor(total / limit) + 1 : Math.floor(total / limit);

        let { page, isPage, plus } = pageItem;
        if (isPage === undefined) {
            const jumpPage = 5;
            if (plus) {
                page = (activePage + jumpPage) > totalPage ? totalPage : activePage + jumpPage;
            } else {
                page = (activePage - jumpPage) < 1 ? 1 : activePage - jumpPage;
            }
            // console.log(isPage, page, pageItem);
        }
        setActivePage(page);

        // 处理分页条展示
        const pageList = [];
        if (totalPage > 0) pageList.push({ page: 1, isPage: true });

        const middlePageLimit = totalPage < 5 ? totalPage : 5;
        const tmpMiddlePageList = [];
        for (let i = middlePageLimit; i > 0; i--) {
            if (page - i > 1 && page - i < totalPage) tmpMiddlePageList.push({ page: page - i, isPage: true });
        }
        for (let i = 0; i < middlePageLimit; i++) {
            if (page + i > 1 && page + i < totalPage) tmpMiddlePageList.push({ page: page + i, isPage: true });
        }

        const middlePageList = [];
        tmpMiddlePageList.map(item => {
            if (middlePageLimit < tmpMiddlePageList.length) {
                const a = Math.floor(middlePageLimit / 2);
                // console.log( {'page-a': page - a, 'curPage': item.page, page});
                if (page > item.page && page - a <= item.page) {
                    middlePageList.push(item)
                }
                if (page === item.page) {
                    middlePageList.push(item)
                }
                if (page < item.page && page + a >= item.page) {
                    middlePageList.push(item)
                }
            } else {
                middlePageList.push(item)
            }
        });

        if (middlePageList.length > 0 && middlePageList[0].page > 2) {
            pageList.push({ page: "<<", plus: false });
        }
        middlePageList.map(item => pageList.push(item));
        if (middlePageList.length > 0 && middlePageList[middlePageList.length - 1].page < totalPage - 1) {
            pageList.push({ page: ">>", plus: true });
        }

        if (totalPage > 1) pageList.push({ page: totalPage, isPage: true });
        setListPage(pageList);
    }, [data, activePage])

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
                {listShow && listShow.map(item =>
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
                        <td>共{data.length}条</td>
                        {data.length > 0 &&
                            <td colSpan={columns.length}>
                                <ul className='pagination'>
                                    {listPage && listPage.map(item =>
                                        <li key={nanoid()} onClick={() => onPage(item)}>
                                            <span className={getClassName({ 'active': activePage === item.page, 'jumpPage': !item.isPage })}>
                                                {item.page}
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </td>
                        }
                    </tr>
                </tfoot>}
        </table>
    </>)
}