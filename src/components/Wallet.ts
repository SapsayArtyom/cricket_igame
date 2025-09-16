import { Container, Text } from "pixi.js";
import { config } from "../configs/config";
import { isMobile } from "../helpers/helper";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";


export default class Wallet extends Container {
    private balance: number;
    private walletText!: Text;
    private mobile: boolean;

    constructor() {
        super();

        this.balance = config.balance;
        this.mobile = isMobile();

        this.init();
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.UPDATE_WALLET, this.updateWallet.bind(this));     
        globalEventEmitter.on(EVENTS.WIN, this.updateWallet.bind(this));     
    }

    private init() {
        this.walletText = new Text(`€ ${this.balance.toFixed(2)}`, config.styles.wallet);
        this.walletText.pivot.x = this.walletText.getBounds().width / 2;
        const text = new Text('BALANCE', config.styles.balance);
        text.pivot.x = text.getBounds().width / 2;
        if (this.mobile) {
            text.position.set(
                0,
                this.walletText.getBounds().height + 10
            );
        } else {
            text.position.set(
                0,
                this.walletText.getBounds().height + 5
            );
        }

        
        this.addChild(this.walletText, text);
    }

    public updateWallet({amount}: {amount: number}) {
        this.balance += amount;
        config.balance = this.balance;
        this.walletText.text = `€ ${this.balance.toFixed(2)}`;
        this.walletText.pivot.x = this.walletText.getBounds().width / 2;
    }
}
