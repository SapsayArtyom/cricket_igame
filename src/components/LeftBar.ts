import { Container, Sprite, Text } from "pixi.js";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";
import { formatNumberWithCommas } from "../helpers/helper";

export default class LeftBar extends Container {
    private logoContainer: Container;
    private winContainer: Container;
    private winValue: number;
    private textWin!: Text;
    private textWinValue!: Text;

    constructor() {
        super();
		
        this.logoContainer = new Container();
        this.winContainer = new Container();

        this.winValue = config.defaultBet * 10;

        this.initWinDisplay();
        this.subscribeToEvents();
        this.addChild(this.logoContainer, this.winContainer);
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.COUNT_HITTER, this.updateWinDisplay.bind(this));
    }
	
    private initWinDisplay() {
        const sprite = Sprite.from('Panel-in-game');
        this.winContainer.addChild(sprite);

        const chain = Sprite.from('chain');
        const ww = chain.width;
        chain.width = chain.height;
        chain.height = ww;
        this.winContainer.addChild(chain);
        chain.position.set(78, -23);
        const chain2 = Sprite.from('chain');
        chain2.width = chain2.height;
        chain2.height = ww;
        this.winContainer.addChild(chain2);
        chain2.position.set(330, -23);

        this.textWin = new Text(`With ${config.defaultHitter} Big Hitter the\nmaximum win is`, config.styles.default);
        this.textWin.position.set(
            (this.winContainer.width - this.textWin.width) / 2,
            50
        );
        this.winContainer.addChild(this.textWin);

        this.textWinValue = new Text(`€ ${this.winValue.toFixed(2)}`, config.styles.winLabel);

        this.textWinValue.position.set(
            (this.winContainer.width - this.textWinValue.width) / 2,
            this.textWin.getBounds().bottom + 18
        );
        this.winContainer.addChild(this.textWinValue);
    }

    public updateWinDisplay({hitterIndex, betIndex}: { hitterIndex: number, betIndex: number }) {
        const amount = hitterIndex;
        this.textWin.text = `With ${amount} Big Hitter the\nmaximum win is`;

        const currentIndexHitter = Object.keys(config.firstNextPicks).findIndex(item => Number(item) === hitterIndex);
        this.winValue = config.maxWins[currentIndexHitter] * (config.bets[betIndex]);
        this.textWinValue.text = `€ ${formatNumberWithCommas(this.winValue.toFixed(2))}`;

        this.textWinValue.x = (this.winContainer.width - this.textWinValue.width) / 2;
    }
}
