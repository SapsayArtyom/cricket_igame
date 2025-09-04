import { Application, Container } from "pixi.js";
import CardManager from "./cardManager";
import { sound } from "@pixi/sound";
import Btn from "./btn";


export default class Scene extends Container {
    private app: Application;

    constructor(app: Application) {
        super();
        this.app = app;
        this.init();
    }

    private init() {
        const manager = this.addChild(new CardManager());
        manager.position.set(
            this.app.screen.width / 2, 
            this.app.screen.height / 2
        );

        const btn = this.addChild(new Btn());
        btn.position.set(
            (this.app.screen.width - btn.width) / 2, 
            manager.y + manager.height / 2 + 50
        );
        btn.on("pointertap", async () => {
            sound.play("click");
            btn.eventMode = 'none';
            btn.alpha = 0.5;
            await manager.revealNext();
            if (manager.getCardLength()) {
                btn.alpha = 1;
                btn.eventMode = 'static';
            }
        });
    }
}