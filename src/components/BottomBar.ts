import { Container, Graphics, Sprite, Text } from "pixi.js";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";

export default class BottomBar extends Container {
    private walletText!: Text;
    private bullets: Sprite[] = [];

    constructor() {
        super();
        this.init();
    }

    private init() {
        const bg = new Graphics();
        bg.beginFill(0x000000, 0.5);
        bg.drawRect(0, 0, config.appWidth, 105);
        bg.endFill();
        this.addChild(bg);
        this.addWallet(0);
        this.addBalls();
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.PLAY, this.updBalls.bind(this));
        globalEventEmitter.on(EVENTS.SHOOT, this.updBalls.bind(this));
    }

    private addWallet(amount: number) {
        const walletContainer = new Container();
        this.addChild(walletContainer);

        this.walletText = new Text(`$ ${amount}`, config.styles.wallet);
        this.walletText.pivot.x = this.walletText.getBounds().width / 2;
        const text = new Text('BALANCE', config.styles.balance);
        text.pivot.x = text.getBounds().width / 2;
        text.position.set(
            0,
            this.walletText.getBounds().height + 10
        );
        walletContainer.addChild(this.walletText, text);
        walletContainer.position.set(
            200,
            (this.height - walletContainer.height) / 2 - 5
        );
    }

    private addBalls() {
        const ballCont = new Container();
        this.addChild(ballCont);

        for (let i = 0; i < 24; i++) {
            const bullet = Sprite.from('Bulett-empty');
            bullet.scale.set(0.75);
            bullet.x = i > 11 ? (i - 12) * bullet.width : (i) * bullet.width;
            bullet.y = i > 11 ? bullet.height + 2 : 0;
            ballCont.addChild(bullet);
            this.bullets.push(bullet);
        };

        ballCont.position.set(
            (this.width - ballCont.width) / 2, 
            (this.height - ballCont.height) / 2
        );
    }

    private updBalls({bullets}: {bullets: number}) {
        this.bullets.forEach((bullet, index) => {
            if (index < bullets) {
                bullet.texture = Sprite.from('Bulett-full').texture;
            } else {
                bullet.texture = Sprite.from('Bulett-empty').texture;
            }
        });
    }

    public updateWallet(amount: number) {
        this.walletText.text = `$ ${amount}`;
        this.walletText.pivot.x = this.walletText.getBounds().width / 2;
    }
}