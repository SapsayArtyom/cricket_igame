/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/ui/ScrollBox.ts
import { Container, Graphics, Rectangle, Sprite, Ticker } from "pixi.js";

export type ScrollBoxOptions = {
  width: number;
  height: number;
  scrollbar?: boolean;   // показывать ли скроллбар
  wheel?: boolean;       // подключать колесо автоматически
  wheelStep?: number;    // пикселей на шаг колеса
  drag?: boolean;        // включить drag/тач-скролл
};

export class ScrollBox extends Container {
    public readonly content: Container;
    private readonly maskGfx: Graphics;
    private readonly viewport: Rectangle;
    // private readonly scrollTrack?: Graphics;
    private readonly scrollThumb?: Sprite;
    // private readonly scrollThumb?: Graphics;

    private isDragging = false;
    private lastPointerY = 0;
    private _scrollY = 0;
    private wheelStep: number;
    private cleanupWheel?: () => void;

    constructor(opts: ScrollBoxOptions) {
        super();

        const {
            width,
            height,
            scrollbar = true,
            wheel = true,
            wheelStep = 60,
            // drag = true,
        } = opts;

        this.wheelStep = wheelStep;
        this.viewport = new Rectangle(0, 0, width, height);

        // Маска вьюпорта
        this.maskGfx = new Graphics()
            .beginFill(0x000000, 1)
            .drawRect(0, 0, width, height)
            .endFill();
        this.addChild(this.maskGfx);

        // Контент, который будем прокручивать
        this.content = new Container();
        this.content.mask = this.maskGfx;
        this.addChild(this.content);

        // ВАЖНО: для Pixi v6 нужна интерактивность + hitArea,
        // в v7+ — eventMode; сделаем совместимость.
        this.hitArea = new Rectangle(0, 0, width, height);
        this.cursor = "default";
        if ("eventMode" in (this as any)) {
            (this as any).eventMode = "static"; // v7+
        } else {
            (this as any).interactive = true;   // v6
        }

        // Скроллбар (опционально)
        if (scrollbar) {
            const trackW = 6;
            const trackPad = 4;

            const track = new Graphics();
            track.alpha = 0.35;
            track.beginFill(0x000000, 0).drawRoundedRect(
                this.viewport.width + trackPad,
                0,
                trackW,
                this.viewport.height,
                trackW / 2
            ).endFill();

            const thumb = new Graphics();
            thumb.beginFill(0xffffff).drawRoundedRect(
                this.viewport.width + trackPad,
                0,
                trackW,
                40,
                trackW / 2
            ).endFill();
            thumb.alpha = 0.7;

            // this.addChild(track, thumb);
            // this.scrollTrack = track;
            // this.scrollThumb = thumb;
            this.scrollThumb = Sprite.from('Scroller');
            this.addChild(track, this.scrollThumb);
        }

        // Drag/Touch скролл (навешиваем обработчики только если drag=true)
        // if (drag) {
        this.on("pointerdown", this.onPointerDown, this);
        this.on("pointerup", this.onPointerUp, this);
        this.on("pointerupoutside", this.onPointerUp, this);
        this.on("pointermove", this.onPointerMove, this);
        // }

        // Колёсико — автоматически подключим при добавлении в сцену, если wheel=true
        if (wheel) {
            this.on("added", () => {
                // Попробуем найти canvas (renderer.view) через глобалку или родителя.
                // Рекомендуется просто вызвать scrollBox.attachWheel(app.view) вручную.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const app = (this.parent as any)?.app || (globalThis as any).__PIXI_APP__;
                const view: HTMLCanvasElement | undefined = app?.view;
                if (view) this.attachWheel(view);
            });

            this.on("removed", () => {
                if (this.cleanupWheel) this.cleanupWheel();
            });
        }

        // Обновляем скроллбар каждый тик
        Ticker.shared.add(this.updateScrollbar, this);
    }

    /** Текущая вертикальная прокрутка (clamped) */
    public get scrollY() {
        return this._scrollY;
    }
    public set scrollY(val: number) {
        const maxScroll = Math.max(0, this.content.height - this.viewport.height);
        this._scrollY = Math.max(0, Math.min(val, maxScroll));
        this.content.y = -this._scrollY;
    }

    /** Прокрутить на delta пикселей */
    public scrollBy(deltaY: number) {
        this.scrollY = this._scrollY + deltaY;
    }

    /** Прокрутить к абсолютной позиции Y */
    public scrollTo(y: number) {
        this.scrollY = y;
    }

    /** Явно подключить колесо мыши к canvas */
    public attachWheel(view: HTMLCanvasElement) {
    // отключаем нативные жесты, чтобы тач/drag не «воровал» прокрутку страницы
        view.style.touchAction = "none";

        const onWheel = (ev: WheelEvent) => {
            // Проверим, что курсор внутри ScrollBox
            const bounds = this.getBounds();
            const x = ev.clientX;
            const y = ev.clientY;
            const inside =
        x >= bounds.left &&
        x <= bounds.right &&
        y >= bounds.top &&
        y <= bounds.bottom;

            if (inside) {
                this.scrollBy(ev.deltaY > 0 ? this.wheelStep : -this.wheelStep);
                ev.preventDefault();
            }
        };

        view.addEventListener("wheel", onWheel, { passive: false });
        this.cleanupWheel = () => view.removeEventListener("wheel", onWheel as any);
    }

    private getEventGlobal(e: any) {
        // v7: FederatedPointerEvent.global
        if (e && e.global) return e.global;
        // v6: InteractionEvent.data.global
        if (e && e.data && e.data.global) return e.data.global;
        return null;
    }

    private onPointerDown(e: any) {
        e?.stopPropagation?.();

        const g = this.getEventGlobal(e);
        if (!g) return; // подстраховка, чтобы не падать

        this.isDragging = true;
        this.lastPointerY = g.y;
        // курсор — опционально; в v6 не у всех таргетов есть cursor
        try { (this as any).cursor = "grabbing"; } catch {}
    }

    private onPointerUp() {
        this.isDragging = false;
        try { (this as any).cursor = "default"; } catch {}
    }

    private onPointerMove(e: any) {
        if (!this.isDragging) return;

        const g = this.getEventGlobal(e);
        if (!g) return;

        const dy = g.y - this.lastPointerY;
        this.lastPointerY = g.y;
        this.scrollBy(-dy);
    }

    private updateScrollbar = () => {
        if (!this.scrollThumb) return;

        const contentH = Math.max(this.content.height, 1);
        const viewH = this.viewport.height;

        // коэффициент видимой части
        // const visibleRatio = Math.min(1, viewH / contentH);
        // const thumbH = Math.max(24, viewH * visibleRatio);
        const thumbH = 100;

        // позиция от скролла
        const maxScroll = Math.max(0, contentH - viewH);
        const scrollRatio = maxScroll > 0 ? this._scrollY / maxScroll : 0;
        const thumbY = scrollRatio * (viewH - thumbH);

        const x = this.viewport.width + 4;

        this.scrollThumb.x = x;
        this.scrollThumb.y = thumbY;
        // this.scrollThumb.clear();
        // this.scrollThumb.beginFill(0xffffff).drawRoundedRect(
        //     x,
        //     thumbY,
        //     15,
        //     thumbH,
        //     10
        // ).endFill();
        this.scrollThumb.alpha = 1;
    };

    /** Важно корректно чистить ресурсы */
    public destroy(options?: any) {
        Ticker.shared.remove(this.updateScrollbar, this);
        if (this.cleanupWheel) this.cleanupWheel();
        super.destroy(options);
    }
}

export default ScrollBox;
