import { Spine } from "pixi-spine";
import { Container, Sprite, Text } from "pixi.js";
import { spineCache } from "../helpers/loadSpineJSON";
import { setSkinByName } from "../helpers/spineSkine";
import gsap from "gsap";
import { randomInt } from "../helpers/math";
import { config } from "../configs/config";

export default class Cell extends Container {
    private spineCell!: Spine;
    private ballLoader!: Spine;
    private lossCell!: Spine;
    private previewCell!: Sprite;
    private winLabel!: Text;
    private winLabelContainer!: Container;

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
        bg.scale.set(0.995);
        this.winLabel = new Text(`X 0`, config.styles.winLabelCell);
        this.winLabelContainer.addChild(bg, this.winLabel);
        this.winLabelContainer.visible = false;
        this.winLabelContainer.y = 50;
    }

    public addPreview() {
        this.previewCell.alpha = 1;
        this.interactive = true;
        this.buttonMode = true;
    }

    public play(amount: number) {
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
                if (amount) {
                    this.winCell(amount);
                } else {
                    this.playLossCell();
                }
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

    private playLossCell() {
        this.winLabelContainer.visible = false;
        this.spineCell.visible = false;
        this.lossCell.visible = true;
        this.lossCell.state.setAnimation(0, 'TNT2', false);
        this.lossCell.state.timeScale = 1;
    }

    public onClick(callback: () => void) {
        this.on('pointerdown', callback);
    }

    public reset() {
        this.isPlayed = false;
        this.spineCell.alpha = 0;
        this.lossCell.visible = false;
        this.winLabelContainer.visible = false;
        this.addPreview();
    }
}