import { Container, Sprite, Text } from "pixi.js";
import { config } from "../configs/config";
import { Spine } from "pixi-spine";
import { spineCache } from "../helpers/loadSpineJSON";
import globalEventEmitter from "../helpers/GlobalEventEmitters";

export default class LeftBar extends Container {
    private logoContainer: Container;
    private winContainer: Container;
    private winValue: number;
    private textWin!: Text;
    private textWinValue!: Text;
    private logo!: Spine

    constructor() {
        super();
		
        this.logoContainer = new Container();
        this.winContainer = new Container();

        this.winValue = config.defaultBet * 10;

        this.initLogo();
        this.initWinDisplay();
        this.subscribeToEvents();
        this.addChild(this.logoContainer, this.winContainer);
    }

    private subscribeToEvents() {
        globalEventEmitter.on('COUNT_HITTER', this.updateWinDisplay.bind(this));
        globalEventEmitter.on('COUNT_BET', this.updateWinValue.bind(this));
    }

    private initLogo() {
        this.logo = spineCache.createSpine('spines', 'logo');
        this.logo.state.setAnimation(0, 'logo_landscape', false);
        this.logo.state.timeScale = 0;
        this.logo.position.set(this.logo.width / 2, this.logo.height / 2);
        this.logoContainer.addChild(this.logo);
    }
	
    private initWinDisplay() {
        const sprite = Sprite.from('Panel-in-game');
        this.winContainer.addChild(sprite);

        this.textWin = new Text(`With ${config.defaultHitter} Big Hitter the\nmaximum win is`, config.styles.default);
        this.textWin.position.set(
            (this.winContainer.width - this.textWin.width) / 2,
            50
        );
        this.winContainer.addChild(this.textWin);

        this.textWinValue = new Text(`$${this.winValue}`, config.styles.winLabel);

        this.textWinValue.position.set(
            (this.winContainer.width - this.textWinValue.width) / 2,
            this.textWin.getBounds().bottom + 15
        );
        this.winContainer.addChild(this.textWinValue);

        this.winContainer.y = this.logoContainer.getBounds().bottom + 5;
    }

    public updateWinDisplay(amount: number) {
        this.textWin.text = `With ${amount} Big Hitter the\nmaximum win is`;
    }
    
    public updateWinValue(amount: number) {
        this.winValue = amount * 10;
        this.textWinValue.text = `$${this.winValue}`;
		
        this.textWinValue.position.set(
            (this.winContainer.width - this.textWinValue.width) / 2,
            this.textWin.y + this.textWin.height + 15
        );
    }

    public playLogo() {
        this.logo.state.setAnimation(0, 'logo_landscape', false);
        this.logo.state.timeScale = 1;
    }
}
