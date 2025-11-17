const svgNamespace = "http://www.w3.org/2000/svg";

// 使用 JavaScript 实现生成饼状统计图的函数
export function generatePieChart(element, data, d = 200) {
    if (element === undefined || element === null) return;
    if (element.firstChild) element.removeChild(element.firstChild);
    if (data === null || data === undefined) return;
    console.log("data", data);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const radius = d / 4;
    const originX = d / 2;
    const originY = d / 2;

    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", d);
    svg.setAttribute("height", d);

    if (data.length === 0) {
        const noData = document.createElementNS(svgNamespace, "text");
        noData.setAttribute("x", originX);
        noData.setAttribute("y", originY);
        noData.textContent = "无数据"
    } else {
        let startAngleOutter = 0;
        let startAngleInner = 0;
        let duration = 0;
        data.forEach(({ name, value }) => {
            const id = name + value;
            const textFill = "#dff";
            const percentage = value / total * 360;
            const endAngleOutter = percentage === 360 ? 45 : startAngleOutter + percentage;
            const endAngleInner = startAngleInner + percentage;

            const hoverText = document.createElementNS(svgNamespace, "text");
            hoverText.textContent = `${name}-${value}/${total}-${(value / total * 100).toFixed(2)}%`;
            const {clientWidth: hoverTextWidth} = getRealAttr(hoverText);
            let hoverTextX = (d - hoverTextWidth) / 2;
            if (hoverTextX < 0) hoverTextX= 0;
            
            hoverText.setAttribute("x", hoverTextX);
            hoverText.setAttribute("y", 30);
            hoverText.setAttribute("fill", textFill)
            hoverText.classList.add("tips");
            hoverText.classList.add(id);

            const pieTag = percentage === 360 ? 'circle' : 'path';

            const pie = document.createElementNS(svgNamespace, pieTag);
            if (percentage === 360) {
                pie.setAttribute("cx", originX);
                pie.setAttribute("cy", originY);
                pie.setAttribute("r", radius / 1.3);
                pie.setAttribute("fill", "transparent");
                pie.setAttribute("stroke-width", radius / 2);
                pie.setAttribute("stroke", getRandomColor());
            } else {
                pie.setAttribute("d", describeArc(originX, originY, radius, startAngleOutter, endAngleOutter, startAngleInner, endAngleInner));
                pie.setAttribute("fill", getRandomColor());
            }
            pie.classList.add("pie");
            pie.classList.add(id);
            pie.style.setProperty("--duration", `${duration}ms`);
            duration += 60

            pie.addEventListener("mouseover", () => {
                hoverText.style.display = 'block';
            })
            pie.addEventListener("mouseleave", () => {
                hoverText.style.display = 'none';
            })


            const text = document.createElementNS(svgNamespace, "text");
            text.textContent = name;
            text.setAttribute("fill", textFill)
            text.classList.add("line");

            const line = document.createElementNS(svgNamespace, "path");
            line.setAttribute("d", describeLine(d / 2, d / 2, d / 4, startAngleOutter, endAngleOutter, text));
            line.setAttribute("stroke", textFill);
            line.setAttribute("fill", "transparent");
            line.classList.add("line");

            svg.appendChild(hoverText);
            svg.appendChild(text);
            svg.appendChild(line);
            svg.appendChild(pie);

            startAngleOutter = endAngleOutter;
            startAngleInner = endAngleInner;
        });
    }
    element.appendChild(svg);

    // 生成饼图
    function describeArc(x, y, radius, startAngle, endAngle, startAngleInner, endAngleInner) {
        // 外弧线
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);

        // 内弧线
        const { x: startInnerX, y: startInnerY } = polarToCartesian(x, y, radius / 2, endAngleInner);
        const { x: endInnerX, y: endInnerY } = polarToCartesian(x, y, radius / 2, startAngleInner);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        /*  A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            参数说明
            弧形命令A前两个参数rx和ry分别是x轴半径和y轴半径。
            弧形命令A的第三个参数表示弧形的旋转情况。
            large-arc-flag决定弧线是大于还是小于180度，0表示小角度弧，1表示大角度弧。
            sweep-flag表示弧线的方向，0表示从起点到终点沿逆时针画弧，1表示从起点到终点沿顺时针画弧。
            x：结束点x坐标。
            y：结束点y坐标。
         */
        const d = [
            `M ${start.x} ${start.y}`, // 移动到这里
            `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, // 画圆弧
            `L ${endInnerX} ${endInnerY}`, // 回到中心点
            `A ${radius / 2} ${radius / 2} 0 ${largeArcFlag} 1 ${startInnerX} ${startInnerY}`, // 反向画圆弧
            "Z", //  闭合路径
        ].join(' ');

        return d;
    }

    // 根据三角函数计算终点坐标
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {

        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    // 生成描述线
    function describeLine(x, y, radius, startAngle, endAngle, text) {
        const {clientWidth: lineWidth} = getRealAttr(text);

        // 计算出线条的角度
        const lineAngle = (startAngle + (endAngle - startAngle) / 2);
        // 决定是向左还是向右画水平线条
        const largeArcFlag = lineAngle > 180 ? -1 : 1;

        // 弧度 = 弧长 / 半径 
        //      = [(角度 / 360) * 周长] / 半径 
        //      =[ (角度 / 360) * 2πr] / r
        //      = 角度 * π / 180
        // const angleInRadians = ((startAngle + (endAngle - startAngle) / 2) * Math.PI) / 180;
        const angleInRadians = ((lineAngle - 90) * Math.PI) / 180;

        const x1 = x + ((radius / 1.5) * Math.cos(angleInRadians))
        const y1 = y + ((radius / 1.5) * Math.sin(angleInRadians))

        const x2 = x + ((radius * 1.25) * Math.cos(angleInRadians))
        const y2 = y + ((radius * 1.25) * Math.sin(angleInRadians))

        text.setAttribute("x", largeArcFlag < 0 ? x2 + largeArcFlag * lineWidth : x2 + 4);
        text.setAttribute("y", y2 - 6);
        // console.log(x, radius, angleInRadians, Math.sin(angleInRadians), radius * Math.sin(angleInRadians));        

        const d = [
            `M ${x1} ${y1}`, // 移动到这里
            `L ${x2} ${y2}`, // 延弧线中段画出去
            `H ${x2 + largeArcFlag * (lineWidth + 5)}`
        ].join(' ');

        return d;
    }

    // 随机生成颜色
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}


const  getRealAttr = (element) => {
    // 先渲染出来，拿到元素的真实宽度，再移除掉，因为append和remove的操作很快，浏览器实际是来不及渲染就移除了，因此对性能无影响
    const svgTmp = document.createElementNS(svgNamespace, "svg");
    svgTmp.appendChild(element);
    document.body.appendChild(svgTmp);
    const clientWidth = element.clientWidth;
    document.body.removeChild(svgTmp);
    return {
        clientWidth
    };
}