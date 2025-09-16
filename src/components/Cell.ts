/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spine } from "pixi-spine";
import { Container, Sprite, Text, Texture } from "pixi.js";
import { spineCache } from "../helpers/loadSpineJSON";
import { setSkinByName } from "../helpers/spineSkine";
import gsap from "gsap";
import { randomInt } from "../helpers/math";
import { config } from "../configs/config";
import { EVENTS, SOUNDS } from "../helpers/events";
import globalEventEmitter from "../helpers/GlobalEventEmitters";

export default class Cell extends Container {
    private spineCell!: Spine;
    private ballLoader!: Spine;
    private lossCell!: Spine;
    private previewCell!: Sprite;
    private winLabel!: Text;
    private winLabelContainer!: Container;
    private disabledContainer!: Container;
    private arrTextures: Texture[] = [];

    public isPlayed: boolean = false;

    constructor() {
        super();
		
        this.init();
    }

    private init() {
        this.spineCell = spineCache.createSpine('spines', 'coin');
        setSkinByName(this.spineCell, '2');
        this.spineCell.state.setAnimation(0, 'coins_Idle', true);
        this.spineCell.state.timeScale = 0;
        this.spineCell.alpha = 0;
        this.addChild(this.spineCell);

        this.ballLoader = spineCache.createSpine('spines', 'target');
        this.ballLoader.state.setAnimation(0, 'Target_1_Falls', true);
        this.ballLoader.state.timeScale = 1;
        this.ballLoader.scale.set(0);
        this.addChild(this.ballLoader);

        this.lossCell = spineCache.createSpine('spines', 'deflect');
        this.lossCell.state.setAnimation(0, 'TNT2', false);
        this.lossCell.state.timeScale = 0;
        this.lossCell.visible = false;
        this.addChild(this.lossCell);

        this.previewCell = Sprite.from('Target-Portrait');
        this.previewCell.anchor.set(0.5);
        this.previewCell.x = this.ballLoader.x;
        this.previewCell.y = this.ballLoader.y;
        this.previewCell.alpha = 0;
        this.addChild(this.previewCell);

        this.winLabelContainer = new Container();
        this.addChild(this.winLabelContainer);

        const bg = Sprite.from('Panel-infocoin-portrait');
        bg.anchor.set(0.5);
        bg.rotation = Math.PI / 2;
        this.winLabel = new Text(`X 0`, config.styles.winLabelCell);
        this.winLabelContainer.addChild(bg, this.winLabel);
        this.winLabelContainer.visible = false;
        this.winLabelContainer.y = 50;

        this.disabledContainer = new Container();
        this.addChild(this.disabledContainer);
        const disBg = Sprite.from('coin-bags-portrait-icon');
        disBg.name = 'disBg';
        // const ww = disBg.width;
        // disBg.width = disBg.height;
        // disBg.height = ww;
        disBg.anchor.set(0.5);
        disBg.scale.set(0.98);
        this.disabledContainer.addChild(disBg);
        const disOverlay = Sprite.from('greyout-portrait-panel');
        disOverlay.anchor.set(0.5);
        disOverlay.scale.set(0.98);
        this.arrTextures.push(Texture.from('coin-bags-portrait-icon'));
        this.arrTextures.push(Texture.from('TNT-in-game-icon'));
        this.disabledContainer.addChild(disOverlay);
        this.disabledContainer.visible = false;
    }

    public addPreview() {
        this.previewCell.alpha = 1;
        this.interactive = true;
        this.buttonMode = true;
    }

    public play(index: number, isEndgame: boolean = false) {
        this.previewCell.alpha = 0;
        this.interactive = false;
        this.buttonMode = false;
        this.spineCell.alpha = 1;
        this.spineCell.visible = true;
        this.isPlayed = true;

        this.spineCell.state.setAnimation(0, 'coins_Idle', false);
        setSkinByName(this.spineCell, '2');
        this.spineCell.state.timeScale = 0;
        
        gsap.to(this.ballLoader.scale, {
            x: 1,
            y: 1,
            duration: 0.5,
            onComplete: () => {
                this.ballLoader.scale.set(0);
                if (index) {
                    const amount = config.multipliers[index - 1];
                    this.winCell(amount);
                    globalEventEmitter.emit(EVENTS.UPDATE_CASHOUT, {amount: amount * config.currentBet, index});
                    globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BAG_OF_MONEY_REVEALED);
                    if (isEndgame) globalEventEmitter.emit(EVENTS.END_GAME);
                } else {
                    this.playLossCell();
                    globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.TNT_REVEALED);
                    globalEventEmitter.emit(EVENTS.LOGO_SHINE);
                }
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.GENERAL_AMBIANCE);
            }
        });
    }

    private winCell(amount: number) {
        this.spineCell.state.timeScale = 1;
        setSkinByName(this.spineCell, randomInt(1, 6).toString());
        this.spineCell.state.setAnimation(0, 'coins_Idle', false);
        this.spineCell.state.addAnimation(0, 'coins_Win', true, 0);

        this.winLabelContainer.visible = true;
        
        this.winLabel.text = `X ${amount.toFixed(1)}`;
        this.winLabel.position.set(
            -(this.winLabel.width / 2), 
            -(this.winLabel.height / 2)
        );
    }

    private async playLossCell() {
        this.winLabelContainer.visible = false;
        this.spineCell.visible = false;
        this.lossCell.visible = true;
        this.lossCell.state.setAnimation(0, 'TNT2', false);
        this.lossCell.state.timeScale = 1;

        this.lossCell.state.addListener({
            complete: (entry) => {
                const animationEntry = entry as any;
                if (animationEntry.animation && animationEntry.animation.name === 'TNT2') {
                    globalEventEmitter.emit(EVENTS.DISABLE_BOARD);
                }
            }
        });
    }

    public hideWinLabel() {
        this.winLabelContainer.visible = false;
    }

    public onClick(callback: () => void) {
        this.on('pointerdown', callback);
    }

    public disableCell(bool: boolean = true, isDeflect: boolean = false) {
        if (isDeflect) (this.disabledContainer.children[0] as Sprite).texture = this.arrTextures[1];
        else {
            (this.disabledContainer.children[0] as Sprite).texture = this.arrTextures[0];
            const sprite = this.disabledContainer.children[0] as Sprite;
            sprite.width = 93;
            sprite.height = 139;
        }
        this.previewCell.alpha = 0;
        this.disabledContainer.visible = bool;
    }

    public reset() {
        this.isPlayed = false;
        this.spineCell.alpha = 0;
        this.lossCell.visible = false;
        this.winLabelContainer.visible = false;
        this.disableCell(false);
        this.addPreview();
    }
}