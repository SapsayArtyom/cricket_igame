import { Container, Sprite } from "pixi.js";
import { Button } from "./btn";
import SoundManager from "../managers/SoundManager";
import { SCREENS, SOUNDS } from "../helpers/events";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";

export default class InfoPanel extends Container {
    private soundIcon!: Button;
    private infoIcon!: Button;
    private isSoundOn: boolean = true;
    private sound: SoundManager

    constructor() {
        super();
        this.sound = SoundManager.getInstance();

        this.init();
    }

    private init() {
        const bg = Sprite.from('info_sound_bar');
        this.soundIcon = new Button({
            textures: {
                default: 'sound_normal',
                hover: 'sound_highlighted',
                disabled: 'sound_off',
            },
            hoverScale: 1,
            pressScale: 1,
            onClick: () => {
                this.isSoundOn = !this.isSoundOn;
                const texture = this.isSoundOn ? 'sound_normal' : 'sound_off';
                this.soundIcon.setTextures({ default: texture });
                this.sound.soundMuteUnmute(!this.isSoundOn);
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
            }
        });
        this.soundIcon.position.set(
            this.soundIcon.width / 2,
            bg.height / 2
        );
        this.infoIcon = new Button({
            textures: {
                default: 'info_normal',
                hover: 'info_highlighted',
            },
            hoverScale: 1,
            pressScale: 1,
            onClick: () => {
                globalEventEmitter.emit(EVENTS.OPEN_SCREEN, SCREENS.HOW_TO_PLAY);
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
            }
        });
        this.infoIcon.position.set(
            bg.width - this.infoIcon.width / 2, 
            bg.height / 2
        );

        this.addChild(bg);
        this.addChild(this.soundIcon);
        this.addChild(this.infoIcon);
    }
}