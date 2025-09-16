import { Container, Sprite, Text } from "pixi.js";
import { isMobile } from "../helpers/helper";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";

export default class WinPanel extends Container {
    private winMessages: Text[];
    private mobile: boolean = false;

    constructor() {
        super();
        this.winMessages = [];

        this.mobile = isMobile();

        this.init();
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.COUNT_HITTER, this.updateWinMessages.bind(this));
        globalEventEmitter.on(EVENTS.UPDATE_CASHOUT, this.swipeMultiplierValues.bind(this));
    }

    private init() {
        for (let i = 0; i < 4; i++) {
            this.addPanel(i === 0, i);
        }
    }

    private addPanel(first: boolean, index: number) {
        const container = new Container();
        const panel = Sprite.from(first ? 'Tile-light-tablet' : 'Tile-disable-tablet');
        if (this.mobile) panel.scale.set(1.02, 1);
        panel.y = first ? 0 : 5;
        container.addChild(panel);
        this.addChild(container);

        let text: Text;
        const values = config.firstNextPicks['1'];
        if (first) {
            const title = new Text('NEXT', {
                fontSize: 26,
                fontFamily: "RobotoCondensed Regular",
                fill: '#f5de04',
                align: 'center',
                stroke: '#01124f',
                strokeThickness: 4,
                lineHeight: 30,
            });
            title.position.set(
                (container.width - title.width) / 2,
                8
            );
            container.addChild(title);
            const val = (values[index] / config.currencyCoeff).toFixed(2);
            text = new Text(`€ ${val}`, {
                fontSize: 30,
                fontFamily: "RobotoCondensed Regular",
                fill: '#f5de04',
                align: 'center',
                stroke: '#01124f',
                strokeThickness: 4,
                lineHeight: 30,
            });
            this.winMessages.push(text);
            text.position.set(
                (container.width - text.width) / 2,
                (container.height - text.height) / 2 + 11
            );
        } else {
            text = new Text(`${(values[index] / config.currencyCoeff).toFixed(2)}`, {
                fontFamily: "Roboto Condensed Bold",
                fontSize: this.mobile ? 28 : 30,
                fill: '#fff',
                stroke: '#0031c3',
                strokeThickness: 6,
            });
            this.winMessages.push(text);
            text.position.set(
                (container.width - text.width) / 2,
                (container.height - text.height) / 2
            );
        }
        container.addChild(text);
        const length = this.children.length;
        if (this.mobile) {
            container.x = (container.width + 37) * (length - 1);
        } else {
            container.x = (container.width + 43) * (length - 1);
        }
    }

    public updateWinMessages({  hitterIndex, betIndex}: { hitterIndex: number, betIndex: number }) {
        const key = hitterIndex.toString() as keyof typeof config.firstNextPicks;
        const values = config.firstNextPicks[key];

        const arr = config.defaultMultipliers.slice();
        arr.splice(0, values.length, ...values);
        config.multipliers = arr;
        config.multipliers.forEach((value, index) => {
            if (this.winMessages[index]) {
                const valueBet = value * config.bets[betIndex] / config.currencyCoeff;
                this.winMessages[index].text = index === 0 ? `€ ${valueBet.toFixed(2)}` : `${valueBet.toFixed(2)}`;
                this.winMessages[index].x = (this.winMessages[index].parent.width - this.winMessages[index].width) / 2;
            }
        });
    }

    private swipeMultiplierValues({index}: {index: number}) {
        for (let i = 0; i < this.winMessages.length; i++) {
            const value = config.multipliers[i + index] * config.currentBet;
            this.winMessages[i].text = i === 0 ? `€ ${value.toFixed(2)}` : `${value.toFixed(2)}`;
            this.winMessages[i].x = (this.winMessages[i].parent.width - this.winMessages[i].width) / 2;
        }
    }
}