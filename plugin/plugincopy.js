var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// // figma.showUI(__html__, { width: 300, height: 150 });
// // figma.ui.onmessage = async msg => {
// //   if (msg.type === 'generate-layout') {
// //     const response = await fetch("http://localhost:8000/generate-layout", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ prompt: msg.prompt })
// //     });
// //     const layout = await response.json();
// //     buildFrame(layout); // Now this will be defined below
// //   }
// // };
// // function buildFrame(layout: any) {
// //   const frame = figma.createFrame();
// //   frame.name = layout.layout?.label || "Frame";
// //   frame.resize(400, 400);
// //   layout.layout?.children?.forEach((el: any, i: number) => {
// //     const node = figma.createText();
// //     node.characters = el.label || "Element";
// //     node.x = 20;
// //     node.y = 40 + i * 40;
// //     frame.appendChild(node);
// //   });
// //   figma.currentPage.appendChild(frame);
// // }
// figma.showUI(__html__, { width: 300, height: 150 });
// figma.ui.onmessage = async msg => {
//   if (msg.type === 'generate-layout') {
//     const response = await fetch("http://localhost:8000/generate-layout", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ prompt: msg.prompt })
//     });
//     const layout = await response.json();
//     buildFrame(layout);
//   }
// };
// function buildFrame(layout) {
//   const frame = figma.createFrame();
//   frame.name = layout.label || "Generated UI";
//   frame.resize(400, 400);
//   layout.elements.forEach((el, i) => {
//     const node = figma.createText();
//     node.characters = el.label || el.type;
//     node.x = 20;
//     node.y = 40 + i * 40;
//     frame.appendChild(node);
//   });
//   figma.currentPage.appendChild(frame);
// }
figma.showUI(__html__, { width: 300, height: 150 });
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'generate-layout') {
        const response = yield fetch("http://localhost:8000/generate-layout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: msg.prompt })
        });
        const layout = yield response.json();
        buildFrame(layout);
    }
});
function buildFrame(layout) {
    const frame = figma.createFrame();
    frame.name = layout.label || "Generated UI";
    frame.resize(400, 600);
    let yOffset = 20;
    layout.elements.forEach((el) => {
        let node;
        if (el.type === 'input') {
            node = figma.createRectangle();
            node.resize(200, 40);
            node.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        }
        else if (el.type === 'button') {
            node = figma.createRectangle();
            node.resize(200, 40);
            node.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 1 } }];
        }
        if (node) {
            node.x = 20;
            node.y = yOffset;
            const label = figma.createText();
            label.characters = el.label || el.type;
            label.x = 20;
            label.y = yOffset - 20;
            frame.appendChild(label);
            frame.appendChild(node);
            yOffset += 70;
        }
    });
    figma.currentPage.appendChild(frame);
}
