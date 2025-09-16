/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container, Sprite, Texture, Text, Rectangle } from 'pixi.js';
import type { TextStyle } from 'pixi.js';

export type ButtonTextures = {
    default: Texture | string;
    hover?: Texture | string;
    pressed?: Texture | string;
    disabled?: Texture | string;
};

export type ButtonOptions = {
    textures: ButtonTextures;
    label?: string;
    labelStyle?: Partial<TextStyle>;
    hitPadding?: number;
    anchor?: number | { x: number; y: number };
    disabled?: boolean;
    hoverScale?: number; // default 1.03
    pressScale?: number; // default 0.97
    swipeSize?: boolean;
    onClick?: (ev: any) => void;
    onDown?: (ev: any) => void;
    onUp?: (ev: any) => void;
    onOver?: (ev: any) => void;
};

function tex(input: Texture | string): Texture {
    return typeof input === 'string' ? Texture.from(input) : input;
}
export class Button extends Container {
    private _sprite: Sprite;
    private _label?: Text;
    private _textures: { default: Texture; hover?: Texture; pressed?: Texture; disabled?: Texture };
    private _disabled = false;
    private _hoverScale: number;
    private _pressScale: number;
    private _hitPadding: number;
    private _anchorX = 0.5;
    private _anchorY = 0.5;

    constructor(opts: ButtonOptions) {
        super();

        this.interactive = true;
        this.cursor = 'pointer';
        this.sortableChildren = true;

        this._textures = {
            default: tex(opts.textures.default),
            hover: opts.textures.hover && tex(opts.textures.hover),
            pressed: opts.textures.pressed && tex(opts.textures.pressed),
            disabled: opts.textures.disabled && tex(opts.textures.disabled),
        } as { default: Texture; hover?: Texture; pressed?: Texture; disabled?: Texture };

        this._hoverScale = opts.hoverScale ?? 1.03;
        this._pressScale = opts.pressScale ?? 0.97;
        this._hitPadding = opts.hitPadding ?? 0;

        // Sprite (base visual)
        this._sprite = new Sprite(this._textures.default);
        if (opts.swipeSize)  {
            const ww = this._sprite.width;
            this._sprite.width = this._sprite.height;
            this._sprite.height = ww;
        }
        this._sprite.anchor.set(0.5);
        this._applyAnchor(opts.anchor);
        this.addChild(this._sprite);

        if (opts.label) {
            const styleObj: Partial<TextStyle> = {
                fontFamily: 'Inter, Arial, Helvetica, sans-serif',
                fontSize: 24,
                fontWeight: '600',
                align: 'center',
                fill: 0xffffff,
                ...opts.labelStyle,
            };
            this._label = new Text(opts.label, styleObj);
            this._label.anchor.set(0.5);
            this._label.zIndex = 10;
            this.addChild(this._label);
        }

        // Pointer events
        this.on('pointerover', this._onOver, this)
            .on('pointerout', this._onOut, this)
            .on('pointerdown', this._onDown, this)
            .on('pointerup', this._onUp, this)
            .on('pointerupoutside', this._onUpOutside, this)
            .on('pointertap', (ev) => {
                if (this._disabled) return;
                opts.onClick?.(ev);
            });

        (this as any).tabIndex = 0;
        this.on('keydown', (ev: KeyboardEvent) => {
            if (this._disabled) return;
            if (ev.code === 'Space' || ev.code === 'Enter') {
                this._onDown(ev as any);
            }
        });
        this.on('keyup', (ev: KeyboardEvent) => {
            if (this._disabled) return;
            if (ev.code === 'Space' || ev.code === 'Enter') {
                this._onUp(ev as any);
                opts.onClick?.(ev);
            }
        });

        if (opts.disabled) this.setDisabled(true);

        this._refreshHitArea();
    }

    setAnchor(anchor: number | { x: number; y: number }) {
        this._applyAnchor(anchor);
    }

    private _applyAnchor(anchor?: number | { x: number; y: number }) {
        if (typeof anchor === 'number') {
            this._anchorX = anchor; this._anchorY = anchor;
        } else if (anchor) {
            this._anchorX = anchor.x; this._anchorY = anchor.y;
        }
        this._sprite.anchor.set(this._anchorX, this._anchorY);
        this._centerLabel();
        this._refreshHitArea();
    }

    /** Update label text (creates label if it did not exist). */
    setLabel(text: string, style?: Partial<TextStyle>) {
        if (!this._label) {
            this._label = new Text(text, style || {});
            this._label.anchor.set(0.5);
            this._label.zIndex = 10;
            this.addChild(this._label);
        } else {
            this._label.text = text;
            if (style) {
                // style — plain object
                this._label.style = { ...(this._label.style as any), ...style } as any;
            }
        }
        this._centerLabel();
    }

    /** Replace textures at runtime. */
    setTextures(textures: Partial<ButtonTextures>) {
        if (textures.default) this._textures.default = tex(textures.default);
        if (textures.hover) this._textures.hover = tex(textures.hover);
        if (textures.pressed) this._textures.pressed = tex(textures.pressed);
        if (textures.disabled) this._textures.disabled = tex(textures.disabled);
        this._sprite.texture = this._textures.default;
        this._refreshHitArea();
    }

    setDisabled(disabled: boolean) {
        this._disabled = disabled;
        this.alpha = disabled ? 0.5 : 1.0;
        this.cursor = disabled ? 'default' : 'pointer';
        this.interactive = !disabled;
        this._sprite.texture = disabled && this._textures.disabled ? this._textures.disabled : this._textures.default;
        this.scale.set(1);
    }

    /** Adjust how big the clickable rect is relative to sprite bounds. */
    setHitPadding(pixels: number) {
        this._hitPadding = Math.max(0, pixels);
        this._refreshHitArea();
    }

    setPositionLabel(x: number, y: number) {
        if (!this._label) return;
        this._label.position.set(x, y);
    }

    setAlphaLabel(alpha: number) {
        if (!this._label) return;
        this._label.alpha = alpha;
    }

    setTint(tint: number) {
        this._sprite.tint = tint;
    }

    private _centerLabel() {
        if (!this._label) return;
        this._label.position.set(0, 0);
    }

    private _refreshHitArea() {
        const b = this._sprite.getLocalBounds();
        const padded = new Rectangle(
            b.x - this._hitPadding,
            b.y - this._hitPadding,
            b.width + this._hitPadding * 2,
            b.height + this._hitPadding * 2,
        );
        this.hitArea = padded;
    }

    private _onOver(ev: any) {
        if (this._disabled) return;
        if (this._textures.hover) this._sprite.texture = this._textures.hover;
        this.scale.set(this._hoverScale);
        const onOver = (this as any).onOver as ButtonOptions['onOver'];
        onOver?.(ev);
    }

    private _onOut() {
        if (this._disabled) return;
        this._sprite.texture = this._textures.default;
        this.scale.set(1);
    }

    private _onDown(ev: any) {
        if (this._disabled) return;
        if (this._textures.pressed) this._sprite.texture = this._textures.pressed;
        this.scale.set(this._pressScale);
        // Pass through for user hook
        const onDown = (this as any).onDown as ButtonOptions['onDown'];
        onDown?.(ev);
    }

    private _onUp(ev: any) {
        if (this._disabled) return;
        // Restore hover if still inside, else default
        const over = this._isPointerInside(ev);
        if (over && this._textures.hover) {
            this._sprite.texture = this._textures.hover;
            this.scale.set(this._hoverScale);
        } else {
            this._sprite.texture = this._textures.default;
            this.scale.set(1);
        }
        const onUp = (this as any).onUp as ButtonOptions['onUp'];
        onUp?.(ev);
    }

    private _onUpOutside(ev: any) {
        if (this._disabled) return;
        this._sprite.texture = this._textures.default;
        this.scale.set(1);
        const onUp = (this as any).onUp as ButtonOptions['onUp'];
        onUp?.(ev);
    }

    private _isPointerInside(ev: any): boolean {
        if (!ev || !ev.global) return false;
        const local = this.toLocal(ev.global);
        return (this.hitArea as Rectangle).contains(local.x, local.y);
    }

    override destroy(options?: boolean | { children?: boolean; texture?: boolean; baseTexture?: boolean }) {
        this.removeAllListeners();
        super.destroy(options);
    }
}
