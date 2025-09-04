import { Container, Sprite, Text } from "pixi.js";
import { Button } from "./btn";
import { config } from "../configs/config";

export default class Controls extends Container {
    private betContainer: Container;
    private hitterContainer: Container;
    private betValue: number;
    private hitterValue: number;
    private textBet!: Text;
    private textHitter!: Text;
    private minusBtnHitter!: Button;

    constructor() {
        super();
        
        this.betContainer = new Container();
        this.hitterContainer = new Container();

        this.betValue = 10;
        this.hitterValue = 1;

        this.initBetControls();
        this.initHitterControls();
        this.addPlayBtn();

        this.addChild(this.betContainer, this.hitterContainer);
    }

    private initBetControls() {
        const sprite = Sprite.from('Panel-in-game');
        this.betContainer.addChild(sprite);

        const text = new Text({ 
            text: 'BET',
            style: { 
                fontSize: 26, 
                fill: 0xffffff,
                stroke: { color: '#0039e2', width: 8, join: 'round' },
            }
        });
        text.position.set(
            (sprite.width - text.width) / 2, 
            20
        );
        
        this.textBet = new Text({ 
            text: `$${this.betValue}`,
            style: { 
                fontSize: 40, 
                fill: 0xffffff,
                stroke: { color: '#0039e2', width: 8, join: 'round' },
            }
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

        const plus = new Button({
            textures: {
                default: 'plus_normal',
            },
            onClick: () => {
                this.updateBetDisplay(10);
            }
        });
        plus.position.set(
            sprite.width - 70,
            sprite.height/ 2
        );
        
        const minus = new Button({
            textures: {
                default: 'minus_normal',
            },
            onClick: () => {
                this.updateBetDisplay(-10);
                console.log('minus button clicked');
            }
        });
        minus.position.set(
            70,
            sprite.height/ 2
        );
        this.betContainer.addChild(plus, minus);
    }

    private initHitterControls() {
        const sprite = Sprite.from('Panel-in-game');
        this.hitterContainer.addChild(sprite);
        this.hitterContainer.y = this.betContainer.getBounds().bottom + 10;

        const text = new Text({ 
            text: 'Big Hitter',
            style: { 
                fontSize: 26, 
                fill: 0xffffff,
                stroke: { color: '#0039e2', width: 8, join: 'round' },
            }
        });
        text.position.set(
            120, 
            20
        );
        this.textHitter = new Text({ 
            text: this.hitterValue.toString(),
            style: { 
                fontSize: 50, 
                fill: 0xffffff,
                stroke: { color: '#0039e2', width: 8, join: 'round' },
            }
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

        const plus = new Button({
            textures: {
                default: 'plus_normal',
            },
            onClick: () => {
                console.log('Plus button clicked');
                this.updateHitterDisplay(1);
            }
        });
        plus.position.set(
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
            }
        });
        this.minusBtnHitter.position.set(
            70,
            sprite.height/ 2
        );
        this.minusBtnHitter.alpha = 0.5;
        this.hitterContainer.addChild(text, this.textHitter, hero, plus, this.minusBtnHitter);
    }

    private addPlayBtn() {
        const playBtn = new Button({
            textures: {
                default: 'Play-start-state',
            },
            label: 'PLAY',
            labelStyle: config.styles.buttonLabel,
            onClick: () => {
                console.log('Play button clicked');
            }
        });
        playBtn.position.set(
            this.hitterContainer.width / 2,
            350
        );
        this.hitterContainer.addChild(playBtn);
    }

    private updateBetDisplay(amount: number) {
        if (this.betValue + amount < 10) return;

        this.betValue += amount;
        this.textBet.text = `$${this.betValue}`;
    }

    private updateHitterDisplay(num: number) {
        if (this.hitterValue + num < 1) return;
        this.hitterValue += num;
        this.textHitter.text = this.hitterValue.toString();
        if (this.hitterValue === 1) this.minusBtnHitter.alpha = 0.5;
        else this.minusBtnHitter.alpha = 1;
    }

}
