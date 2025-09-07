import { Container, Sprite, Text } from "pixi.js";
import BaseScreen from "./BaseScreen";
import { config } from "../configs/config";

export default class SplashScreen extends BaseScreen {
    private barContainer: Container;
    private fillBar: Sprite;
    private text: Text;

    constructor() {
        super();

        this.barContainer = new Container();
        this.fillBar = Sprite.from('loading_bar_middle');
        console.log('fillBar', this.fillBar);
        
        this.init();
        this.addBar();
		
        this.text = new Text("0%", config.styles.loading);
        this.text.position.set(
            this.fillBar.getBounds().right + 10,
            (this.barContainer.height - this.text.height) / 2
        );
        this.barContainer.addChild(this.text);
    }

    private init() {
        const bg = Sprite.from('BGLoadLand');
        this.addChild(bg);
    }

    private addBar() {
        this.addChild(this.barContainer);
        this.barContainer.y = 905;

        const barEmptyStart = Sprite.from('loading_bar_empty_end');
        barEmptyStart.x = 190;
        this.barContainer.addChild(barEmptyStart);
        const barEmptyEnd = Sprite.from('loading_bar_empty_end');
        barEmptyEnd.x = this.width - 190;
        barEmptyEnd.scale.x = -1;
        this.barContainer.addChild(barEmptyEnd);
        const barEmpty = Sprite.from('loading_bar_empty_middle');
        barEmpty.x = barEmptyStart.getBounds().right;
        barEmpty.width = this.width - barEmptyStart.getBounds().right - (this.width - barEmptyEnd.getBounds().left);
        this.barContainer.addChild(barEmpty);

        const fillBarStart = Sprite.from('loading_bar_end');
        fillBarStart.x = barEmptyStart.getBounds().left;
        fillBarStart.y = (barEmptyStart.height - fillBarStart.height) / 2;
        this.barContainer.addChild(fillBarStart);

        this.fillBar.position.set(
            fillBarStart.getBounds().right,
            (barEmptyStart.height - this.fillBar.height) / 2
        );
        this.barContainer.addChild(this.fillBar);
    }

    public update(num: number | string) {
        console.log(`Loading progress: ${num}%`);
        const defaultWidth = this.barContainer.getBounds().width - 160;
        const width = (defaultWidth * (typeof num === "string" ? parseFloat(num) : num)) / 100;
        this.fillBar.width = width;
        this.text.text = `${num}%`;
        this.text.position.set(
            this.fillBar.getBounds().right + 10,
            (this.barContainer.height - this.text.height) / 2
        );
    }
}	
