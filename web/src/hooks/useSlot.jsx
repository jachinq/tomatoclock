import { useMemo } from "react";
import { useCallback } from "react";

/**
 * 插槽扩展处理，将 children 中的 slot 属性，转为 map 结构
 * @param {*} children 
 * @returns { key: slot, value: child }
 */
export default function useSlot(children) {

    const getSlotKeys = useCallback((keys) => {
        if (keys) {
            if (keys.toString().indexOf(" ")) {
                return keys.toString().split(" ");
            }
            return [keys];
        }
        return [];
    }, []);

    return useMemo(() => {
        const slotMap = {};
        if (children === undefined || children === null) {
            return slotMap;
        }

        // console.log(children);
        if (children.length) { // 多个插槽
            children.map(item => getSlotKeys(item?.props?.slot).map(key => slotMap[key] = item))
        } else {
            getSlotKeys(children?.props?.slot).map(key => slotMap[key] = children);
        }
        return slotMap;

    }, [children])
}