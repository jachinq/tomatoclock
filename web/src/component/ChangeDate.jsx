
import React, { useMemo } from "react"
import { formatDateTime } from "../scripts/Util";
import Icon from "../component-ui/Icon";

const getWeekNumber = (date) => {
    const dayOffset = 24 * 60 * 60 * 1000; // 一天的毫秒数
    const year = date.getFullYear();
    const yearStart = new Date(year, 0, 1); // 元旦
    const yearStartWeek = yearStart.getDay(); // 元旦是周几
    // 计算元旦后的第一个周一，距离元旦的天数
    const dayOffsetForMonday = yearStartWeek === 1 || yearStartWeek === 0 ?
        1 - yearStartWeek : 8 - yearStartWeek;
    // 计算出每天第一周的开始
    const firstWeekStart = yearStart.getTime() + dayOffsetForMonday * dayOffset;
    // 用当前日期减去今年的第一个周一，得到天数差
    const weekNumber = Math.ceil((date.getTime() - firstWeekStart) / (7 * dayOffset)) + 1;
    // console.log({dayOffset, dayOffsetForMonday, firstWeekStart, weekNumber})

    // 寻找规律：
    // 元旦为周日，则本年第一周的起始日为 01-02，规律：0 1
    // 元旦为周一，则本年第一周的起始日为 01-01，规律：1 0
    // 元旦为周二，则本年第一周的起始日为 01-07，规律：2 6
    // 元旦为周三，则本年第一周的起始日为 01-06，规律：3 5
    // 元旦为周四，则本年第一周的起始日为 01-05，规律：4 4
    // 元旦为周五，则本年第一周的起始日为 01-04，规律：5 3
    // 元旦为周六，则本年第一周的起始日为 01-03，规律：6 2
    return weekNumber;
}

const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
const getTimeBeg = (time = new Date()) => time.setHours(0, 0, 0, 0); // day beg
const getTimeEnd = (time = new Date()) => time.setHours(23, 59, 59, 999); // day end

const getMonthBeg = (date = new Date()) => date.setDate(1) ? getTimeBeg(date) : date; // month beg

// month end
const getMonthEnd = (date = new Date()) => {
    const nextMonth = date.getMonth() + 1;
    const nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    return getTimeEnd(new Date(nextMonthFirstDay - oneDay));
};

const getYearBeg = (date = new Date()) => date.setDate(1) && date.setMonth(0) ? getTimeBeg(date) : date; // year beg

// year end
const getYearEnd = (date = new Date()) => date.setFullYear(date.getFullYear() + 1) && // 设置到明年
    date.setMonth(0) && // 明年的1月
    date.setDate(0) ? // 明年的0日
    getTimeEnd(date) : date;

const getDayBeginAndEnd = (time = new Date()) => ({ begTime: getTimeBeg(time), endTime: getTimeEnd(time) }); // day beg and end
const getMonthBeginAndEnd = (time = new Date()) => ({ begTime: getMonthBeg(time), endTime: getMonthEnd(time) }); // month beg and end
const getYearBeginAndEnd = (time = new Date()) => ({ begTime: getYearBeg(time), endTime: getYearEnd(time) }); // month beg and end

// week beg and end
const getWeekBeginAndEnd = (time = new Date()) => {
    // current是本周的第几天
    let nowDayOfWeek = time.getDay();
    if (nowDayOfWeek === 0) nowDayOfWeek = 7;
    const dayNum = 1 * 24 * 60 * 60 * 1000;
    // 获取本周星期一的时间，星期一作为一周的第一天
    const firstDate = new Date(time.valueOf() - (nowDayOfWeek - 1) * dayNum);
    // 获取本周星期天的时间，星期天作为一周的最后一天
    const lastDate = new Date(new Date(firstDate).valueOf() + 6 * dayNum);
    return {
        begTime: getTimeBeg(firstDate),
        endTime: getTimeEnd(lastDate),
    };
};

export default function ChangeDate({ type, currentTime = new Date().getTime(), onChange = () => { } }) {
    const date = useMemo(() => {
        // console.log('memo', formatDateTime(currentTime));
        if (!type) return
        if (!currentTime) return

        const currentDate = new Date(currentTime);

        // year,month
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");

        // week
        const week = getWeekNumber(currentDate).toString().padStart(2, "0");
        const weekInfo = getWeekBeginAndEnd(currentDate);
        const weekBegFmt = new Date(weekInfo?.begTime).getDate().toString().padStart(2, "0");
        const weekEndFmt = new Date(weekInfo?.endTime).getDate().toString().padStart(2, "0");

        switch (type) {
            case "day": return `${formatDateTime(currentTime)}`;
            case "week": return `${year}年 第${week}周 ${month}月${weekBegFmt}至${weekEndFmt}`;
            case "month": return `${year}年${month}月`;
            case "year": return `${year}年`;
        }
        return "none"
    }, [currentTime, type])

    const changeDate = (evt, next) => {
        const currentDate = new Date(currentTime);
        let changeDate;
        switch (type) {
            case "day":
                const dayDate = next ? new Date(currentTime + oneDay) : new Date(currentTime - oneDay);
                changeDate = getDayBeginAndEnd(dayDate);
                break;
            case "week":
                const weekDate = next ? new Date(currentTime + 7 * oneDay) : new Date(currentTime - 7 * oneDay);
                changeDate = getWeekBeginAndEnd(weekDate);
                break;
            case "month":
                const month = currentDate.getMonth();
                next ? currentDate.setMonth(month + 1) : currentDate.setMonth(month - 1);
                changeDate = getMonthBeginAndEnd(currentDate);
                break;
            case "year":
                const year = currentDate.getFullYear();
                next ? currentDate.setFullYear(year + 1) : currentDate.setFullYear(year - 1);
                changeDate = getYearBeginAndEnd(currentDate);
                break;
        }
        changeDate ? onChange(changeDate) : undefined;
    }

    return (
        <>
            <div className="flex select-none mt-1">
                <span className=" text-sm">{date}</span>
                <div className="data-page-btn" onClick={(e) => { changeDate(e, false) }}>
                    <div className="flex w-full h-full items-center justify-center">
                        <Icon width={14} height={14} icon="arrow-left-bold"/>
                    </div>
                </div>
                <div className="data-page-btn" onClick={(e) => { changeDate(e, true) }}>
                    <div className="flex w-full h-full items-center justify-center">
                        <Icon width={14} height={14} icon="arrow-right-bold"/>
                    </div>
                </div>
            </div>
        </>
    )
}