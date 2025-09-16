import { Texture } from "pixi.js";

interface AddGradientColor {
    percent: number,
    color: string
}

export function getGradientTexture(arrColor: AddGradientColor[], width = 256, height = 1, vertical = false) {
    // adjust it if somehow you need better quality for very very big images
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error("2D context not available");
    }
    // use canvas2d API to create gradient
    let grd;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    vertical ? grd = ctx.createLinearGradient(0, 0, 0, height) : grd = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i < arrColor.length; i++) {
        const element = arrColor[i];
        grd.addColorStop(element.percent, element.color);
    }

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    return Texture.from(canvas);
}

export function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
    );
}

export function formatNumberWithCommas(num: number | string): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function hideLogs() {
    const origGroupCollapsed = console.groupCollapsed?.bind(console);
    const origWarn = console.warn.bind(console);

    let suppressNextWarnStack = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.groupCollapsed = (...args: any[]) => {
        const first = args[0];
        if (typeof first === 'string' && first.includes('PixiJS Deprecation Warning')) {
            // заглушаем группу с депрекейшеном и отметим, что следующий warn — это стэк
            suppressNextWarnStack = true;
            return;
        }
        origGroupCollapsed?.(...args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
    // если только что скрыли «шапку» — следующий warn это стэк, его тоже скрываем
        if (suppressNextWarnStack) {
            suppressNextWarnStack = false;
            return;
        }
        // на случай fallback-ветки без groupCollapsed (старые браузеры/бандлы):
        if (typeof args[0] === 'string' && args[0].includes('PixiJS Deprecation Warning')) {
            suppressNextWarnStack = true; // следующий warn — стэк
            return; // скрываем заголовок
        }
        origWarn(...args);
    };
}

