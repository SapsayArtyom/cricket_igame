import { Container, Sprite, Text } from "pixi.js";
import { Button } from "./btn";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";
import { Spine } from "pixi-spine";
import { spineCache } from "../helpers/loadSpineJSON";

export default class Controls extends Container {
    private betContainer: Container;
    private hitterContainer: Container;
    private btnContainer: Container;
    private betValue: number;
    private hitterValue: number;
    private textBet!: Text;
    private textHitter!: Text;
    private minusBtnHitter!: Button;
    private plusBtnHitter!: Button;
    private minusBtnBet!: Button;
    private plusBtnBet!: Button;
    private playBtn!: Button;
    private betBtn!: Button;
    private bullets: number
    private hand!: Spine;
    private handContainer!: Container;

    constructor() {
        super();
        
        this.betContainer = new Container();
        this.hitterContainer = new Container();
        this.btnContainer = new Container();
        this.handContainer = new Container();

        this.betValue = config.defaultBet;
        this.hitterValue = config.defaultHitter;
        this.bullets = config.cells;

        this.initBetControls();
        this.initHitterControls();
        this.addPlayBtn();
        this.addHand();
        this.subscribeToEvents();
        this.addChild(this.betContainer, this.hitterContainer, this.btnContainer, this.handContainer);
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.LOSS, () => this.disableControls(false));
        globalEventEmitter.on(EVENTS.SHOOT, () => this.animHand());
    }

    private initBetControls() {
        const sprite = Sprite.from('Panel-in-game');
        this.betContainer.addChild(sprite);

        const text = new Text('BET', { 
            fontFamily: "Roboto Bold",
            fontSize: 26, 
            fill: 0xffffff,
            stroke: '#0039e2',
            strokeThickness: 4,
        });
        text.position.set(
            (sprite.width - text.width) / 2, 
            20
        );

        this.textBet = new Text(`$${this.betValue}`, {
            fontFamily: "Roboto Bold",
            fontSize: 40, 
            fill: 0xffffff,
            stroke: '#0039e2',
            strokeThickness: 4,
        });
        this.textBet.position.set(
            (sprite.width - this.textBet.width) / 2, 
            (sprite.height - this.textBet.height) / 2
        );

        const coins = Sprite.from('Coin4-menu');
        coins.position.set(
            245,    
            sprite.height - coins.height - 30
        );

        this.betContainer.addChild(text, coins, this.textBet);

        this.plusBtnBet = new Button({
            textures: {
                default: 'plus_normal',
            },
            onClick: () => {
                this.updateBetDisplay(10);
            }
        });
        this.plusBtnBet.position.set(
            sprite.width - 70,
            sprite.height/ 2
        );

        this.minusBtnBet = new Button({
            textures: {
                default: 'minus_normal',
            },
            onClick: () => {
                this.updateBetDisplay(-10);
                console.log('minus button clicked');
            }
        });
        this.minusBtnBet.position.set(
            70,
            sprite.height/ 2
        );
        this.betContainer.addChild(this.plusBtnBet, this.minusBtnBet);
    }

    private initHitterControls() {
        const sprite = Sprite.from('Panel-in-game');
        this.hitterContainer.addChild(sprite);
        this.hitterContainer.y = this.betContainer.getBounds().bottom + 10;

        const text = new Text('Big Hitter', config.styles.default);
        text.position.set(
            120, 
            20
        );
        this.textHitter = new Text(this.hitterValue.toString(), { 
            fontFamily: "Roboto Bold",
            fontSize: 56, 
            fill: 0xffffff,
            stroke: '#0039e2',
            strokeThickness: 4,
        });
        this.textHitter.position.set(
            150, 
            (sprite.height - this.textHitter.height) / 2
        );

        const hero = Sprite.from('TNT-small-menu');
        hero.position.set(
            245,
            (sprite.height - hero.height) / 2
        );

        this.plusBtnHitter = new Button({
            textures: {
                default: 'plus_normal',
            },
            onClick: () => {
                console.log('Plus button clicked');
                this.updateHitterDisplay(1);
            }
        });
        this.plusBtnHitter.position.set(
            sprite.width - 70,
            sprite.height/ 2
        );

        this.minusBtnHitter = new Button({
            textures: {
                default: 'minus_normal',
            },
            onClick: () => {
                console.log('minus button clicked');
                this.updateHitterDisplay(-1);
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
            label: 'PLAY',
            labelStyle: config.styles.buttonLabel,
            onClick: () => {
                this.playGame();
            }
        });
        this.betBtn = new Button({
            textures: {
                hover: 'Cash-out-disable',
                default: 'Cash-out-disable',
                // default: 'Cash-out-selected',
            },
            disabled: true,
            hoverScale: 1,
            label: 'CASH OUT',
            labelStyle: config.styles.betBtn,
            onClick: () => {
                console.log('Bet button clicked');
            }
        });
        this.betBtn.visible = false;
        this.betBtn.setPositionLabel(0, 70);
        this.btnContainer.addChild(this.playBtn, this.betBtn);
        this.btnContainer.position.set(
            this.hitterContainer.width / 2,
            this.hitterContainer.getBounds().bottom + this.btnContainer.height / 2 + 20
        );
    }

    private addHand() {
        this.hand = spineCache.createSpine('spines', 'pistol_hand');
        // this.hand = spineCache.createSpine('spines', 'coin');
        // this.hand.state.setAnimation(0, 'coins_Win', true);
        this.hand.state.setAnimation(0, 'Idle_pistol_off', true);
        this.hand.position.set(this.hand.width / 2, this.hand.height / 2);
        this.handContainer.addChild(this.hand);

        this.handContainer.position.set(
            20,
            852
        );
    }

    private updateBetDisplay(amount: number) {
        if (this.betValue + amount < 10) return;

        this.betValue += amount;
        globalEventEmitter.emit('COUNT_BET', this.betValue);
        this.textBet.text = `$${this.betValue}`;
    }

    private updateHitterDisplay(num: number) {
        if (this.hitterValue + num < 1 || this.hitterValue + num > this.bullets) return;
        this.hitterValue += num;
        globalEventEmitter.emit('COUNT_HITTER', this.hitterValue);
        this.textHitter.text = this.hitterValue.toString();
        if (this.hitterValue === 1) this.minusBtnHitter.setDisabled(true);
        else this.minusBtnHitter.setDisabled(false);

        if (this.hitterValue === 24) this.plusBtnHitter.setDisabled(true);
        else this.plusBtnHitter.setDisabled(false);
    }

    private playGame() {
        this.bullets -= (this.hitterValue - 1);
        this.disableControls(true);
        globalEventEmitter.emit(EVENTS.PLAY, { 
            bullets: this.bullets, 
            bet: this.betValue, 
            hitter: this.hitterValue
        });
        this.hand.state.addAnimation(0, 'Idle_pistol_on', true, 0);
    }

    private disableControls(bool: boolean = true) {
        this.plusBtnHitter.setDisabled(bool);
        this.minusBtnHitter.setDisabled(bool);
        this.plusBtnBet.setDisabled(bool);
        this.minusBtnBet.setDisabled(bool);

        this.playBtn.visible = !bool;
        this.betBtn.visible = bool;
        this.betBtn.setDisabled(!bool);
    }

    private animHand() {
        this.hand.state.setAnimation(0, 'Shoot', false);
        this.hand.state.addAnimation(0, 'Idle_pistol_on', true, 0);
    }
}
