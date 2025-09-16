import { Container, Sprite, Text } from "pixi.js";
import { Button } from "./btn";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS, SOUNDS } from "../helpers/events";
import { Spine } from "pixi-spine";
import { spineCache } from "../helpers/loadSpineJSON";
import { isMobile } from "../helpers/helper";
import { randomInt } from "../helpers/math";

export default class Controls extends Container {
    private betContainer: Container;
    private hitterContainer: Container;
    private btnContainer: Container;
    private handContainer!: Container;
    
    private betValue: number;
    private hitterValue: number;
    private bullets: number;
    private winValue: number;
    private mobile: boolean = false;

    private textBet!: Text;
    private textHitter!: Text;
    private minusBtnHitter!: Button;
    private plusBtnHitter!: Button;
    private minusBtnBet!: Button;
    private plusBtnBet!: Button;
    private playBtn!: Button;
    private betBtn!: Button;
    private hand!: Spine;

    private hittersArray: number[] = []
    private currentHitterIndex: number = 0;
    private currentBetIndex: number = 0;

    constructor() {
        super();
        
        this.betContainer = new Container();
        this.hitterContainer = new Container();
        this.btnContainer = new Container();
        this.handContainer = new Container();
        this.hittersArray = Object.keys(config.firstNextPicks).map(Number);

        this.currentBetIndex = randomInt(0, config.bets.length - 1);
        this.betValue = config.bets[this.currentBetIndex] / config.currencyCoeff;
        config.currentBet = this.betValue;
        this.hitterValue = config.defaultHitter;
        this.bullets = config.cells;
        this.winValue = 0;
        this.mobile = isMobile();

        this.initBetControls();
        this.initHitterControls();
        this.addPlayBtn();
        this.addHand();
        this.subscribeToEvents();
        this.addChild(this.betContainer, this.hitterContainer, this.btnContainer, this.handContainer);

        if (this.mobile) this.updatePosition();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.LOSS, () => {
            this.disableControls(false);
            this.animHandToStart();
        });
        globalEventEmitter.on(EVENTS.SHOOT, () => this.animHand());
        globalEventEmitter.on(EVENTS.END_GAME, () => this.cashOut());
        globalEventEmitter.on(EVENTS.UPDATE_CASHOUT, (data: {amount: number}) => this.updateCashoutDisplay(data.amount));
    }

    private initBetControls() {
        const sprite = Sprite.from('Panel-in-game');
        this.betContainer.addChild(sprite);

        if (this.mobile) {
            const chain = Sprite.from('chain');
            const ww = chain.width;
            chain.width = chain.height;
            chain.height = ww;
            this.betContainer.addChild(chain);
            chain.position.set(78, -23);
            const chain2 = Sprite.from('chain');
            chain2.width = chain2.height;
            chain2.height = ww;
            this.betContainer.addChild(chain2);
            chain2.position.set(330, -23);
        }

        const text = new Text('BET', { 
            fontFamily: "Araboto Medium",
            fontSize: 30, 
            fill: 0xffffff,
            stroke: '#0031c3',
            strokeThickness: 5,
        });
        text.position.set(
            (sprite.width - text.width) / 2, 
            30
        );

        this.textBet = new Text(`€ ${this.betValue.toFixed(2)}`, {
            fontFamily: "Roboto Bold",
            fontSize: 44, 
            fill: 0xffffff,
            stroke: '#0031c3',
            strokeThickness: 6,
        });
        this.textBet.position.set(
            (sprite.width - this.textBet.width) / 2, 
            (sprite.height - this.textBet.height) / 2 + 3
        );

        const coins = Sprite.from('Coin4-menu');

        if (this.mobile) {
            coins.position.set(
                255,    
                sprite.height - coins.height - 30
            );
        } else {
            coins.position.set(
                255,
                sprite.height - coins.height - 25
            );
        }

        this.betContainer.addChild(text, coins, this.textBet);

        this.plusBtnBet = new Button({
            textures: {
                default: 'plus_button_s',
            },
            onClick: () => {
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.PLUS_BUTTON);
                this.currentBetIndex++;
                this.updateBetDisplay();
            }
        });
        this.plusBtnBet.position.set(
            sprite.width - 70,
            sprite.height/ 2
        );
        if (this.currentBetIndex === 0) this.plusBtnBet.setDisabled(false);

        this.minusBtnBet = new Button({
            textures: {
                default: 'minus_button_s',
            },
            onClick: () => {
                this.currentBetIndex--;
                this.updateBetDisplay();
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.MINUS_BUTTON);
            }
        });
        this.minusBtnBet.position.set(
            70,
            sprite.height/ 2
        );
        this.betContainer.addChild(this.plusBtnBet, this.minusBtnBet);

        if (this.currentBetIndex === 0) this.minusBtnBet.setDisabled(true);
        else this.minusBtnBet.setDisabled(false);
        if (this.currentBetIndex === config.bets.length - 1) this.plusBtnBet.setDisabled(true);
        else this.plusBtnBet.setDisabled(false);
    }

    private checkBetControls() {
        const nextBet = config.bets[this.currentBetIndex + 1] / config.currencyCoeff;
        if (this.currentBetIndex === 0) this.minusBtnBet.setDisabled(true);
        else this.minusBtnBet.setDisabled(false);
        if (this.currentBetIndex === config.bets.length - 1 || nextBet > config.balance) this.plusBtnBet.setDisabled(true);
        else this.plusBtnBet.setDisabled(false);
    }

    private initHitterControls() {
        const sprite = Sprite.from('Panel-in-game');
        this.hitterContainer.addChild(sprite);
        this.hitterContainer.y = this.betContainer.getBounds().bottom + 6;

        const chain = Sprite.from('chain');
        const ww = chain.width;
        chain.width = chain.height;
        chain.height = ww;
        this.hitterContainer.addChild(chain);
        chain.position.set(78, -22);
        const chain2 = Sprite.from('chain');
        chain2.width = chain2.height;
        chain2.height = ww;
        this.hitterContainer.addChild(chain2);
        chain2.position.set(330, -22);

        const text = new Text('Big Hitter', { 
            fontFamily: "Araboto Medium",
            fontSize: 30, 
            fill: 0xffffff,
            stroke: '#0031c3',
            strokeThickness: 6,
        });
        text.position.set(
            98, 
            29
        );
        this.textHitter = new Text(this.hitterValue.toString(), { 
            fontFamily: "Roboto Bold",
            fontSize: 56, 
            fill: 0xffffff,
            stroke: '#0031c3',
            strokeThickness: 6,
        });
        this.textHitter.position.set(
            140, 
            (sprite.height - this.textHitter.height) / 2 + 2
        );

        const hero = Sprite.from('TNT-small-menu');
        if (this.mobile) {
            hero.position.set(
                260,
                (sprite.height - hero.height) / 2 - 10
            );
        } else {
            hero.position.set(
                260,
                (sprite.height - hero.height) / 2 - 5
            );
        }

        this.plusBtnHitter = new Button({
            textures: {
                default: 'plus_button_s',
            },
            onClick: () => {
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BIG_HITTER_PLUS);
                this.currentHitterIndex++;
                this.updateHitterDisplay(this.currentHitterIndex);
            }
        });
        this.plusBtnHitter.position.set(
            sprite.width - 70,
            sprite.height/ 2
        );

        this.minusBtnHitter = new Button({
            textures: {
                default: 'minus_button_s',
            },
            onClick: () => {
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BIG_HITTER_MINUS);
                this.currentHitterIndex--;
                this.updateHitterDisplay(this.currentHitterIndex);
            },
            disabled: true,
        });
        this.minusBtnHitter.position.set(
            70,
            sprite.height/ 2
        );
        this.hitterContainer.addChild(text, this.textHitter, hero, this.plusBtnHitter, this.minusBtnHitter);
    }

    private addPlayBtn() {
        this.playBtn = new Button({
            textures: {
                default: 'Play-start-state',
                hover: 'Play-highlight-state',
                pressed: 'Play-activate-state',
            },
            hoverScale: 1,
            // label: 'PLAY',
            labelStyle: config.styles.buttonLabel,
            onClick: () => {
                this.playGame();
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.PLAY_PRESS_SOUND);
            }
        });
        const containerLabel = new Container();
        this.playBtn.addChild(containerLabel);
        const text = new Text('PLA', config.styles.buttonLabel);
        const textY = new Text('Y', config.styles.buttonLabel);
        textY.position.set(text.width - 5, 0);
        containerLabel.addChild(text, textY);
        containerLabel.position.set(
            -containerLabel.width / 2,
            -containerLabel.height / 2 - 3
        );
        this.betBtn = new Button({
            textures: {
                hover: 'Cash-out-disable',
                default: 'Cash-out-selected',
            },
            disabled: true,
            hoverScale: 1,
            swipeSize: true,
            label: 'CASH OUT',
            labelStyle: config.styles.betBtn,
            onClick: () => {
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.CASH_OUT_PRESS_SOUND);
                this.cashOut();
            }
        });
        this.betBtn.visible = false;
        this.betBtn.setAlphaLabel(0.8);
        this.betBtn.setPositionLabel(0, 70);
        this.btnContainer.addChild(this.playBtn, this.betBtn);
        this.btnContainer.position.set(
            this.hitterContainer.width / 2 - 13,
            this.hitterContainer.getBounds().bottom + this.btnContainer.height / 2 + 25
        );
    }

    private addHand() {
        this.hand = spineCache.createSpine('spines', 'pistol_hand');
        this.hand.state.setAnimation(0, 'Idle_pistol_off', true);
        this.hand.position.set(this.hand.width / 2, this.hand.height / 2);
        this.handContainer.addChild(this.hand);

        this.handContainer.position.set(
            20,
            852
        );
    }

    private updateBetDisplay() {
        this.betValue = config.bets[this.currentBetIndex] / config.currencyCoeff;
        config.currentBet = this.betValue;
        this.textBet.text = `€ ${this.betValue.toFixed(2)}`;
        this.textBet.x = (this.betContainer.width - this.textBet.width) / 2;
        globalEventEmitter.emit(EVENTS.COUNT_HITTER, { hitterIndex: this.hitterValue, betIndex: this.currentBetIndex });
        this.checkBetControls();
    }

    private updateHitterDisplay(num: number) {
        this.hitterValue = this.hittersArray[num];
        globalEventEmitter.emit(EVENTS.COUNT_HITTER, { hitterIndex: this.hitterValue, betIndex: this.currentBetIndex });
        this.textHitter.text = this.hitterValue.toString();
        if (num === 0) this.minusBtnHitter.setDisabled(true);
        else this.minusBtnHitter.setDisabled(false);

        if (num === this.hittersArray.length - 1) this.plusBtnHitter.setDisabled(true);
        else this.plusBtnHitter.setDisabled(false);
    }

    private updateCashoutDisplay(amount: number) {
        this.betBtn.setAlphaLabel(1);
        this.winValue += amount;
        this.betBtn.setLabel(`€ ${this.winValue.toFixed(2)}\nCASH OUT`, config.styles.betBtnCashout);
        this.betBtn.setPositionLabel(0, 70);
        // this.betBtn.alpha = 1;
        this.betBtn.setDisabled(false);
    }

    private cashOut() {
        globalEventEmitter.emit(EVENTS.WIN, {amount: this.winValue});
        this.disableControls(false);
        this.hand.state.setAnimation(0, 'Idle_pistol_off', false);
    }

    private playGame() {
        this.winValue = 0;
        this.betBtn.setLabel(`CASH OUT`, config.styles.betBtn);
        this.betBtn.setPositionLabel(0, 70);
        this.bullets -= (this.hitterValue - 1);
        this.disableControls(true);
        globalEventEmitter.emit(EVENTS.PLAY, { 
            bullets: this.bullets, 
            bet: this.betValue, 
            hitter: this.hitterValue
        });
        globalEventEmitter.emit(EVENTS.UPDATE_WALLET, {amount: -this.betValue});
        this.hand.state.addAnimation(0, 'Idle_pistol_on', true, 0);
    }

    private disableControls(bool: boolean = true) {
        this.plusBtnHitter.setDisabled(bool);
        this.minusBtnHitter.setDisabled(bool);
        this.plusBtnBet.setDisabled(bool);
        this.minusBtnBet.setDisabled(bool);

        this.playBtn.visible = !bool;
        this.betBtn.visible = bool;
        this.betBtn.setDisabled(bool);
    }

    private animHandToStart() {
        this.hand.state.setAnimation(0, 'Shoot', false);
        this.hand.state.addAnimation(0, 'Idle_pistol_off', false, 0);
    }

    private animHand() {
        this.hand.state.setAnimation(0, 'Shoot', false);
        this.hand.state.addAnimation(0, 'Idle_pistol_on', true, 0);
        this.betBtn.setDisabled(true);
    }

    private updatePosition() {
        this.hitterContainer.position.set(0, 0);
        this.betContainer.position.set(
            this.hitterContainer.width + 57, 
            0
        );
        this.btnContainer.position.set(
            this.betContainer.width / 2 + this.betContainer.x - 13,
            this.hitterContainer.getBounds().bottom + 146
        );

        this.handContainer.position.set(
            (config.appWidth - this.handContainer.width) - 126,
            637
        );
    }

    public updatedBetsAndHitters() {
        globalEventEmitter.emit(EVENTS.COUNT_HITTER, { hitterIndex: this.hitterValue, betIndex: this.currentBetIndex });
    }
}
