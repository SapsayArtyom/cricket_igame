import { Container, Graphics, Sprite, Text } from "pixi.js";
import { config } from "../configs/config";

export default class BottomBar extends Container {
    private walletText!: Text;
    private bullets: Sprite[] = [];

    constructor() {
        super();
        this.init();
    }

    private init() {
        const bg = new Graphics();
        bg.rect(0, 0, config.appWidth, 100);
        bg.fill({color: '0x000000', alpha: 0.5});
        this.addChild(bg);
        this.addWallet(0);
        this.addBalls();
    }

    private addWallet(amount: number) {
        const walletContainer = new Container();
        this.addChild(walletContainer);

        this.walletText = new Text({
            text: `$ ${amount}`,
            style: config.styles.wallet
        });
        this.walletText.pivot.x = this.walletText.getBounds().width / 2;
        const text = new Text({
            text: 'BALANCE',
            style: config.styles.balance
        });
        text.pivot.x = text.getBounds().width / 2;
        text.position.set(
            0,
            this.walletText.getBounds().height
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
            bullet.scale.set(0.65);
            bullet.x = i > 11 ? (i - 12) * bullet.width : (i) * bullet.width;
            bullet.y = i > 11 ? bullet.height : 0;
            ballCont.addChild(bullet);
            this.bullets.push(bullet);
        };

        ballCont.position.set(
            (this.width - ballCont.width) / 2, 
            (this.height - ballCont.height) / 2 - 5
        );
    }
}