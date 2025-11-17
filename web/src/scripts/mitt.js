function mitt(all) {
    all = all || new Map();
    return {
        // 事件键值对映射对象
        all,
        /**
         * 注册一个命名的事件处理
         * @param type 事件名，官方表示事件名如是 *，用来标记为通用事件，调用任何事件，都会触发命名为 * 的事件
         * @param handler 事件处理函数
         */
        on(type, handler) {
            // 根据type去查找事件
            const handlers = all.get(type);
            if (handlers === undefined) {
                all.set(type, [handler]); // 注意此处值是数组类型，可以添加多个相同的事件
                return;
            }

            // if (handlers.indexOf(handler) === -1) {
                handlers.push(handler);   
            // }
            // 如果找到有相同的事件，则继续添加，Array.prototype.push 返回值为添加后的新长度，
            // const added = handlers && handlers.push(handler);
            // console.log('add', handlers);
            // 如果已添加了type事件，则不再执行set操作
            // if (!added) {
            // }
        },

        /**
         * 移除指定的事件处理
         * @param type 事件名，和第二个参数一起用来移除指定的事件，
         * @param handler 事件处理函数
         */
        off(type, handler) {
            // 根据type去查找事件
            const handlers = all.get(type);
            // 如果找到则进行删除操作
            if (handlers) {
                // 这里用了个骚操作，其实就是找到了，则删除(多个相同的只会删除找到的第一个)，没找到则不会对原数组有任何影响
                handlers.splice(handlers.indexOf(handler) >>> 0, 1);
            }
        },

        /**
         * 触发所有 type 事件，如果有type为 * 的事件，则最后会执行。
         * @param type 事件名
         * @param evt 传递给处理函数的参数
         */
        emit(type, ...evt) {
            // 找到type的事件循环执行
            // const a = all.get(type);
            // console.log("type", type, "func", a);
            (all.get(type) || []).slice().map((handler) => { 
                handler(...evt);
            });
            // 然后找到所有为*的事件，循环执行
            // (all.get('*') || []).slice().map((handler) => { handler(type, evt); });
        }
    };
}

export default mitt();