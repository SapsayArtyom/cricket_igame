 
import { Spine } from "pixi-spine";
import { Container, Text } from "pixi.js";
import gsap from "gsap";
import { spineCache } from "../helpers/loadSpineJSON";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";

export class WinPopUp extends Container {
    private win!: Spine;
    private textWin!: Text;

    constructor() {
        super();
        this.init();
        this.subscribeToEvents();
        this.visible = false;
    }		

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.WIN, (data: {amount: number}) => this.show(data.amount));
    }

    private init() {
        this.win = spineCache.createSpine('spines', 'win_pop_up');
        this.win.state.setAnimation(0, 'loop', true);
        this.addChild(this.win);

        const text = new Text('YOU WON', config.styles.winPopup);
        text.position.set(
            -text.width / 2, 
            -330
        );
        this.addChild(text);

        this.textWin = new Text('$ 0', config.styles.winPopupValue);
        this.textWin.position.set(
            -this.textWin.width / 2,
            50
        );
        this.addChild(this.textWin);
    }

    show(amount: number) {
        this.visible = true;
        this.textWin.text = amount.toFixed(2);
        this.textWin.position.set(
            -this.textWin.width / 2,
            50
        );
        this.scale.set(0);
        gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: 0.5,
            onComplete: () => {
                setTimeout(() => {
                    this.hide();
                }, 500);
            }
        });

    }
	
    hide() {
        gsap.to(this.scale, {
            x: 0,
            y: 0,
            duration: 0.5,
        });
    }
}