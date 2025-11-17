import { useMemo, useState, useCallback } from "react"
import Util, { formatDateTime, formatWeekend, getDefaultValue } from "../../scripts/Util";
import useAsync from "../../hooks/useAsync";

import Tabs from "../../component-ui/Tabs";
import Detail from "./Detail";
import Modal from "../../component-ui/Modal";
import { useEffect } from "react";
import { get_historys } from "../../scripts/Database";
import HistogramGrid from "../../component-ui/charts/HistogramGrid";
import ChangeDate from "../../component/ChangeDate";
import TopView from "../../component-ui/charts/TopView";
import CircularChart from "../../component-ui/charts/CircularChart";

// 统计方法
const statistic = (sourceData, type = "个数排名", top = 8) => {
    const result = [];

    const statis = {};
    sourceData.map(item => {
        const tmp = statis[item.name] || []
        tmp.push(item);
        statis[item.name] = tmp;
    })

    const timeFormat = (timeLong) => {
        let format = "";
        const hour = Math.floor(timeLong / 3600);
        const minute = Math.floor(timeLong / 60) % 60;
        const second = timeLong % 60;
        if (hour > 0) format += `${hour} 时`;
        if (minute > 0) format += `${minute} 分`;
        if (second > 0) format += `${second} 秒`;
        return format;
    }

    const cntFormat = (cnt = 0) => `共 ${cnt} 个`

    Object.keys(statis).map(name => {
        const nameList = statis[name];
        const number = nameList.length; // 个数
        const timeLong = nameList.reduce((o, n) => o + getDefaultValue(n, "total", 0), 0); // 时长

        let cnt = 0, cntFmt = '', remark = '';
        if (type === "个数排名") {
            cntFmt = cntFormat(number);
            remark = timeFormat(timeLong);
            cnt = number;
        } else if (type === "时长排名") {
            remark = cntFormat(number);
            cntFmt = timeFormat(timeLong);
            cnt = timeLong;
        }

        result.push({ name, cnt, cntFmt, remark })
    })
    result.sort(Util.compare("cnt", true))

    const widthMap = {}; // 样式数据，长度
    let maxWidth = 0;
    for (let i = 0; i < result.length; i++) {
        const cnt = result[i].cnt || 0;
        if (widthMap[cnt]) continue;
        widthMap[cnt] = maxWidth;
        maxWidth += 40;
    }

    // 设置序号及其他
    result.reduce((sort, item) => {
        item.width = `calc(100% - ${widthMap[item.cnt]}px)`;
        item.sort = ++sort;
        return sort;
    }, 0)
    result.slice(0, result.length > top ? top : result.length)
    return result;
}

export default function Data({ close = () => { } }) {
    const [tab, setTab] = useState('week');
    const [form, setForm] = useState({});
    const [histogram, setHistogram] = useState([]);
    const [topView, setTopView] = useState({});
    const [topViewTitle, setTopViewTitle] = useState();
    const [overview, setOverview] = useState({});
    const [pies, setPies] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date().getTime());

    const tabs = useMemo(() => [
        { key: 'day', name: '日' },
        { key: 'week', name: '周' },
        { key: 'month', name: '月' },
        { key: 'year', name: '年' },
        { key: 'detail', name: '明细' },
    ], [])

    // 获取时间开始
    const getDateBeg = useCallback(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const day = now.getDay();
        const dateStr = `${year}-${month + 1}-${date}`;

        const dayBeg = new Date(formatDateTime(now.getTime()));
        const weekBeg = new Date(dateStr);
        weekBeg.setDate(date - (day === 0 ? 6 : day - 1));
        const monthBeg = new Date(dateStr);
        monthBeg.setDate(1);
        const yearBeg = new Date(`${year}-01-01`);
        // console.log('dateStr', dateStr, formatDateTime(weekBeg))
        return {
            year, month, date, day,
            dayBeg, weekBeg, monthBeg, yearBeg
        }
    }, [])

    // 通过 useAsync 这个函数，只需要提供异步逻辑的实现
    const { execute: getHistorys, data: historys, } = useAsync(get_historys);

    useEffect(() => {
        if (tab === 'detail') return
        setCurrentDate(new Date().getTime());
        const { dayBeg, weekBeg, monthBeg, yearBeg } = getDateBeg();
        const begTime = {
            'day': dayBeg,
            'week': weekBeg,
            'month': monthBeg,
            'year': yearBeg,
        }[tab];
        let form = { begTime: formatDateTime(begTime?.getTime()) };
        setForm(form);
        getHistorys(form)

    }, [tab])

    // 计算直方图数据
    useEffect(() => {
        // if (!historys) return;
        setOverview(procOverview(historys));
        setHistogram(procHistogram(historys));
        setTopView(procTopView(historys));
        setPies(procPie(historys));
    }, [historys])


    // 计算统计数据
    const procOverview = useCallback((sourceData) => {
        if (sourceData === null || sourceData === undefined) {
            return {}
        }
        // const historys = getData();
        const statisticInfo = sourceData.reduce((pre, cur) => cur.status !== 2 ? {} : {
            total: getDefaultValue(pre, 'total', 0) + getDefaultValue(cur, 'total', 0),
            count: getDefaultValue(pre, 'count', 0) + 1
        }, {})
        // console.log(statisticInfo);
        return statisticInfo;
    }, [])

    const procHistogram = useCallback((sourceData) => {
        let data = [];
        if (sourceData === null || sourceData === undefined || tab === undefined) return data;

        const { month, dayBeg, weekBeg, monthBeg } = getDateBeg();

        let begTime = form?.begTime;
        let endTime = form?.endTime;

        if (tab === 'day') {
            const statis = {};

            const key2DateMap = {};
            for (let i = 0; i < 24; i++) {
                const date = dayBeg.getTime() + i * 3600 * 1000;
                const key = new Date(date).getHours();
                statis[key] = 0;
                key2DateMap[key] = date;
            }

            const statisKeys = Object.keys(statis);
            sourceData.map(item => {
                const date = new Date(item.update).getHours();
                statis[date] = getDefaultValue(statis, date, 0) + 1;
            })

            statisKeys.map(key => {
                data.push({ date: key, value: statis[key], tip: formatDateTime(key2DateMap[key]), unit: '个' });
            })
        }
        else if (tab === 'week') {
            const statis = {};

            const key2DateMap = {};
            for (let i = 0; i < 7; i++) {
                const date = weekBeg.getTime() + i * 24 * 3600 * 1000;
                const key = formatWeekend(date);
                statis[key] = 0;
                key2DateMap[key] = date;
            }

            const statisKeys = Object.keys(statis);
            sourceData.map(item => {
                const date = formatWeekend(item.update);
                statis[date] = getDefaultValue(statis, date, 0) + 1;
            })

            statisKeys.map(key => {
                data.push({ date: key, value: statis[key], tip: formatDateTime(key2DateMap[key]), unit: '个' });
            })
        }
        else if (tab === 'month') {
            const statis = {};

            const begDate = new Date(begTime);
            const currentMonth = begDate.getMonth();
            for (let i = 0; i < 31; i++) {
                const date = begDate.getTime() + i * 24 * 3600 * 1000;
                if (new Date(date).getMonth() != currentMonth) {
                    break;
                }
                statis[formatDateTime(date)] = 0;
            }

            sourceData.map(item => {
                const date = formatDateTime(item.update);
                statis[date] = getDefaultValue(statis, date, 0) + 1;
            })

            const statisKeys = Object.keys(statis);
            statisKeys.map(key => {
                data.push({ date: key.substr(8, 10), value: statis[key], tip: key, unit: '个' });
            })
            // data.reverse();
        }
        else if (tab === 'year') {
            const statis = {};
            const date = new Date().getFullYear();
            for (let i = 1; i < 13; i++) {
                statis[date + "-" + i.toString().padStart(2, "0")] = 0;
            }

            sourceData.map(item => {
                const date = formatDateTime(item.create, "yyyy-MM");
                statis[date] = getDefaultValue(statis, date, 0) + 1;
            })

            const statisKeys = Object.keys(statis);
            statisKeys.map(key => {
                data.push({ date: key.substr(5, 8), value: statis[key], tip: key, unit: '个' });
            })
        }

        // console.log("histogram", data)
        return data;
    }, [tab, form])

    // 计算前n的数据
    const procTopView = useCallback((sourceData) => {
        if (sourceData === null || sourceData === undefined) return {};
        const types = ["个数排名", "时长排名"];

        const result = {};
        setTopViewTitle(types[0]);
        types.map(item => result[item] = statistic(sourceData, item));

        return result;
    }, [])

    const procPie = useCallback(sourceData => {
        if (sourceData === undefined || sourceData === null) return;

        const result = statistic(sourceData);

        const total = result.reduce((o, item) => o + item.cnt, 0);
        const list = [];
        const other = {name: 'other', value: 0};
        result.map(item => {
            const name = item.name || "";
            const value = item.cnt || 0;
            if (value / total < 0.1) {
                other.value = other.value + value;
            } else {
                list.push({name, value});
            }
        });
        if (other.value > 0) list.push(other);
        // console.log(list);

        return list;
    }, [])

    const changeDate = ({ begTime, endTime }) => {

        // console.log("changeDate", begTime, endTime, 'beg', formatDateTime(begTime), 'end', formatDateTime(endTime));
        setCurrentDate(begTime);
        let form = { begTime: formatDateTime(begTime), endTime: formatDateTime(endTime) };
        setForm(form);
        getHistorys(form);
    }
    return (<>

        <Modal maskClick={() => close(false)}>
            <Tabs slot='body' onChange={(data) => setTab(data)} tabs={tabs} active={tab}>

                <div slot="day week month year">
                    <ChangeDate type={tab} currentTime={currentDate} onChange={(data) => { changeDate(data) }}></ChangeDate>
                    <p>完成数: {overview.count || 0} 个</p>
                    <p>总时间: {overview.total || 0} 秒</p>
                    {/* <Histogram data={histogram} width={tab === 'day' || tab === 'month' ? 650 : 400}></Histogram> */}
                    {histogram.length > 0 && <HistogramGrid datas={histogram} title="直方图"></HistogramGrid>}
                    {topView &&
                        <TopView title={topViewTitle || ""}// Object.keys(topView).length > 0 ? Object.keys(topView)[0] : ""} 
                            datas={topView}
                            onChange={(item) => setTopViewTitle(item)}>
                            <div slot="slot" render={(text, record) => <div>
                                <strong className="whitespace-nowrap">{record.name}</strong>
                                <div className="text-sm whitespace-nowrap">{record.cntFmt}</div>
                                <div className="text-xs whitespace-nowrap">{record.remark}</div>
                            </div>
                            }></div>
                        </TopView>
                    }
                    <CircularChart title="分布" datas={pies} />

                </div>

                <div slot="detail">
                    <Detail />
                </div>
            </Tabs>
        </Modal>


    </>)
}