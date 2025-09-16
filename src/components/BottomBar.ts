import { Container, Graphics, Sprite, Text } from "pixi.js";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";
import { isMobile } from "../helpers/helper";

export default class BottomBar extends Container {
    private bg!: Graphics;
    private walletText!: Text;
    private countText!: Text;
    private bullets: Sprite[] = [];
    private countContainer!: Container;
    private mobile: boolean = false;

    constructor() {
        super();

        this.mobile = isMobile();

        this.init();
    }

    private init() {
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0.6);
        if (this.mobile) this.bg.drawRect(0, 0, config.appWidth, 90);
        else this.bg.drawRect(0, 0, config.appWidth, 105);
        this.bg.endFill();
        this.addChild(this.bg);

        const underRect = new Graphics();
        underRect.beginFill(0x000000, 1);
        underRect.drawRect(0, 0, config.appWidth, this.mobile ? 90 : 105);
        underRect.endFill();
        this.addChild(underRect);
        underRect.y = this.bg.getBounds().bottom;
        this.addBalls();
        this.addCounter();

        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.PLAY, this.updBalls.bind(this));
        globalEventEmitter.on(EVENTS.SHOOT, ({step}: {step: number}) => this.setShooting(step));
        globalEventEmitter.on(EVENTS.LOSS, () =>{ 
            this.updBalls({bullets: 0});
            this.countContainer.alpha = 0;
        });
        globalEventEmitter.on(EVENTS.WIN, () => {
            this.updBalls({bullets: 0});
            this.countContainer.alpha = 0;
        });
        globalEventEmitter.on(EVENTS.COUNT_HITTER, ({  hitterIndex}: { hitterIndex: number }) => {
            this.updBullets(config.defaultBullets - hitterIndex);
        });
    }

    private addBalls() {
        const ballCont = new Container();
        this.addChild(ballCont);

        for (let i = 0; i < config.defaultBullets; i++) {
            const bullet = Sprite.from('Bulett-empty');
            bullet.scale.set(0.725);
            bullet.x = i > 11 ? (i - 12) * bullet.width : (i) * bullet.width;
            bullet.y = i > 11 ? bullet.height + 2 : 0;
            ballCont.addChild(bullet);
            this.bullets.push(bullet);
        };

        // ballCont.scale.set(0.95);
        if (this.mobile) {
            ballCont.position.set(
                (this.width - ballCont.width) / 2  - 10, 
                (this.bg.height - ballCont.height) / 2
            );
        } else {
            ballCont.position.set(
                (this.width - ballCont.width) / 2  - 10, 
                (this.bg.height - ballCont.height) / 2 + 2
            );
        }
    }

    private addCounter() {
        this.countContainer = new Container();
        this.addChild(this.countContainer);
        this.countText = new Text('0 / 0', config.styles.wallet);
        this.countText.pivot.x = this.countText.getBounds().width / 2;
        
        const text = new Text('THROW', config.styles.balance);
        text.pivot.x = text.getBounds().width / 2;
        text.position.set(
            this.countContainer.width / 2,
            this.countText.getBounds().height + 5
        );
        this.countContainer.addChild(this.countText);
        this.countContainer.addChild(text);

        this.countContainer.position.set(
            1370,
            (this.bg.height - this.countContainer.height) / 2 - 5
        );
        this.countContainer.alpha = 0;
    }

    private updBullets(amount: number) {
        this.bullets.forEach((bullet, index) => {
            if (index > amount) bullet.alpha = 0;
            else bullet.alpha = 1;
        });
    }

    private updBalls({bullets}: {bullets: number}) {
        this.countContainer.alpha = 1;
        this.bullets.forEach((bullet, index) => {
            if (index < bullets) {
                bullet.texture = Sprite.from('Bulett-full').texture;
            } else {
                bullet.texture = Sprite.from('Bulett-empty').texture;
            }
        });
        const totalBullets = this.bullets.filter(b => b.alpha === 1).length;
        this.updCounter(totalBullets - bullets, totalBullets);
    }

    setShooting(step: number) {
        const totalBullets = this.bullets.filter(b => b.alpha === 1).length;
        this.updCounter(step, totalBullets);

        this.updBalls({bullets: totalBullets - step});
        // if (step === totalBullets) {
        //     globalEventEmitter.emit(EVENTS.END_GAME);
        // }
    }

    public updateWallet(amount: number) {
        this.walletText.text = `€ ${amount}`;
        this.walletText.pivot.x = this.walletText.getBounds().width / 2;
    }

    private updCounter(current: number, total: number) {
        this.countText.text = `${current} / ${total}`;
        this.countText.pivot.x = this.countText.getBounds().width / 2;
    }
}