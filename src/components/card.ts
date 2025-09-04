import gsap from "gsap";
import { Container, Sprite, Texture } from "pixi.js";
import { ICardValue } from "./cardManager";

export default class Card extends Container {
    protected view!: Sprite
    protected valueTexture!: Texture;

    constructor(value: ICardValue) {
        super();
        this.valueTexture = Sprite.from(value).texture;

        this.init();
    }

    private init() {
        this.view = this.addChild(Sprite.from("suit"));
        this.view.anchor.set(0.5);
        this.view.scale.set(0.3);
    }

    public async flipCard() {
        await new Promise<void>((resolve) => {
            gsap.to(this.view.scale, {
                duration: 0.3,
                x: 0,
                ease: "none",
                onComplete: () => {
                    resolve();
                },
            });
        });

        await this.flipReturn();
    }

    private async flipReturn() {
        return new Promise<void>((resolve) => {
            this.view.texture = this.valueTexture;
            this.view.scale.set(0, 0.3);
            gsap.to(this.view.scale, {
                duration: 0.3,
                x: 0.3,
                ease: "none",
                onComplete: () => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                },
            });
        });
    }

    public async hide() {
        return new Promise<void>(resolve => {
            gsap.to(this.view, {
                duration: 0.2,
                alpha: 0,
                ease: "none",
                onComplete: () => {
                    this.view.visible = false;
                    resolve();
                },
            });
        }) 
		
    }
}