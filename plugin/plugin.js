var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { width: 300, height: 150, themeColors: true, title: "Wireframe Bot", visible: true, position: { x: -300, y: -600 } });
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
}
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === "generate-layout") {
        try {
            const response = yield fetch("http://localhost:8000/generate-layout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: msg.prompt }),
            });
            const layout = yield response.json();
            yield buildFrame(layout);
        }
        catch (err) {
            console.error("Failed to fetch layout:", err);
        }
    }
});
function buildFrame(layout) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    return __awaiter(this, void 0, void 0, function* () {
        let frame = figma.currentPage.findOne(n => n.type === "FRAME" && n.name === "Generated UI");
        if (!frame) {
            frame = figma.createFrame();
            frame.name = "Generated UI";
            figma.currentPage.appendChild(frame);
        }
        frame.name = "Generated UI";
        frame.resize(900, 900);
        frame.x = -250;
        frame.y = -250;
        frame.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
        for (const child of frame.children.slice()) {
            child.remove();
        }
        let yOffset = 20;
        for (const el of layout.elements) {
            if (el.type === "input") {
                const inputRect = figma.createRectangle();
                const inputWidth = (_b = (_a = el.options) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 300;
                const inputHeight = (_d = (_c = el.options) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 40;
                inputRect.resize(inputWidth, inputHeight);
                inputRect.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                inputRect.strokes = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
                inputRect.x = 20;
                inputRect.y = yOffset;
                inputRect.name = el.label;
                const label = figma.createText();
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                label.characters = el.label || "Input";
                label.fontSize = 14;
                label.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
                label.x = 25;
                label.y = yOffset - 18;
                label.fontName = { family: "Inter", style: "Regular" };
                label.name = el.label;
                frame.appendChild(label);
                frame.appendChild(inputRect);
                yOffset += 70;
            }
            if (el.type === "checkbox") {
                const box = figma.createRectangle();
                box.resize(16, 16);
                box.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                box.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
                box.x = 20;
                box.y = yOffset;
                box.name = el.label;
                const label = figma.createText();
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                label.characters = el.label || "Checkbox";
                label.fontSize = 14;
                label.x = 45;
                label.y = yOffset - 2;
                label.name = el.label;
                frame.appendChild(box);
                frame.appendChild(label);
                yOffset += 40;
            }
            if (el.type === "dropdown") {
                const width = (_f = (_e = el.options) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 300;
                const height = (_h = (_g = el.options) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 40;
                const dropdown = figma.createRectangle();
                dropdown.resize(width, height);
                dropdown.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                dropdown.strokes = [{ type: "SOLID", color: { r: 0.6, g: 0.6, b: 0.6 } }];
                dropdown.x = 20;
                dropdown.y = yOffset;
                dropdown.name = el.label;
                const label = figma.createText();
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                label.characters = el.label || "Dropdown";
                label.fontSize = 14;
                label.x = 25;
                label.y = yOffset - 18;
                label.name = `${el.label}_label`;
                frame.appendChild(label);
                frame.appendChild(dropdown);
                yOffset += height + 10;
                if (Array.isArray((_j = el.options) === null || _j === void 0 ? void 0 : _j.items)) {
                    for (const item of el.options.items) {
                        const optionText = figma.createText();
                        yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                        optionText.characters = item;
                        optionText.fontSize = 12;
                        optionText.x = 40;
                        optionText.y = yOffset;
                        optionText.name = `${el.label}_option_${item}`;
                        frame.appendChild(optionText);
                        yOffset += 25;
                    }
                }
                yOffset += 10;
            }
            if (el.type === "button") {
                const buttonRect = figma.createRectangle();
                const buttonWidth = (_l = (_k = el.options) === null || _k === void 0 ? void 0 : _k.width) !== null && _l !== void 0 ? _l : 300;
                const buttonHeight = (_o = (_m = el.options) === null || _m === void 0 ? void 0 : _m.height) !== null && _o !== void 0 ? _o : 40;
                buttonRect.resize(buttonWidth, buttonHeight);
                buttonRect.cornerRadius = typeof ((_p = el.options) === null || _p === void 0 ? void 0 : _p.cornerRadius) === "number" ? el.options.cornerRadius : 6;
                buttonRect.x = 20;
                buttonRect.y = yOffset;
                buttonRect.name = el.label;
                let fillColor = { r: 1, g: 0, b: 0 };
                if ((_q = el.options) === null || _q === void 0 ? void 0 : _q.color) {
                    fillColor = hexToRgb(el.options.color);
                }
                buttonRect.fills = [{ type: "SOLID", color: fillColor }];
                if (((_r = el.options) === null || _r === void 0 ? void 0 : _r.variant) === "secondary") {
                    buttonRect.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
                    buttonRect.strokeWeight = 1.5;
                }
                else {
                    buttonRect.strokes = [];
                }
                const btnText = figma.createText();
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                btnText.characters = el.label || "Button";
                btnText.fontSize = 16;
                btnText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
                btnText.fontName = { family: "Inter", style: "Regular" };
                btnText.name = el.label;
                yield figma.loadFontAsync(btnText.fontName);
                btnText.resizeWithoutConstraints(btnText.width, btnText.height);
                btnText.x = buttonRect.x + (buttonRect.width - btnText.width) / 2;
                btnText.y = buttonRect.y + (buttonRect.height - btnText.height) / 2;
                frame.appendChild(buttonRect);
                frame.appendChild(btnText);
                yOffset += 60;
            }
            if (el.type === "barchart") {
                const chartFrame = figma.createFrame();
                chartFrame.name = el.label;
                const chartHeight = (_t = (_s = el.options) === null || _s === void 0 ? void 0 : _s.height) !== null && _t !== void 0 ? _t : 150;
                chartFrame.resize(300, chartHeight + 60);
                chartFrame.x = 20;
                chartFrame.y = yOffset;
                chartFrame.fills = [];
                const data = (_v = (_u = el.options) === null || _u === void 0 ? void 0 : _u.data) !== null && _v !== void 0 ? _v : [];
                const maxValue = Math.max(...data.map((d) => Number(d.value))) || 1;
                const barWidth = (_x = (_w = el.options) === null || _w === void 0 ? void 0 : _w.barWidth) !== null && _x !== void 0 ? _x : 30;
                const barSpacing = (_z = (_y = el.options) === null || _y === void 0 ? void 0 : _y.barSpacing) !== null && _z !== void 0 ? _z : 15;
                let xPos = 0;
                for (const item of data) {
                    const barHeight = (Number(item.value) / maxValue) * chartHeight;
                    const rect = figma.createRectangle();
                    rect.resize(barWidth, barHeight);
                    rect.x = xPos;
                    rect.y = chartHeight - barHeight;
                    rect.fills = [{ type: "SOLID", color: hexToRgb(item.color) }];
                    rect.name = item.label;
                    chartFrame.appendChild(rect);
                    const valueLabel = figma.createText();
                    yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                    valueLabel.characters = String(item.value);
                    valueLabel.fontSize = 12;
                    valueLabel.x = xPos;
                    valueLabel.y = chartHeight - barHeight - 18;
                    chartFrame.appendChild(valueLabel);
                    const label = figma.createText();
                    yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                    label.characters = item.label;
                    label.fontSize = 12;
                    label.x = xPos;
                    label.y = chartHeight + 5;
                    label.name = item.label;
                    chartFrame.appendChild(label);
                    xPos += barWidth + barSpacing;
                }
                const title = figma.createText();
                yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                title.characters = el.label;
                title.fontSize = 16;
                title.x = 0;
                title.y = -25;
                chartFrame.appendChild(title);
                frame.appendChild(chartFrame);
                yOffset += chartHeight + 80;
            }
        }
        let maxWidth = 0;
        for (const child of frame.children) {
            const childRight = child.x + child.width;
            if (childRight > maxWidth) {
                maxWidth = childRight;
            }
        }
        const totalHeight = yOffset + 20;
        frame.resize(maxWidth + 20, totalHeight);
    });
}
