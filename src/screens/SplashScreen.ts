import { Container, Sprite, Text } from "pixi.js";
import BaseScreen from "./BaseScreen";
import { config } from "../configs/config";
import { getGradientTexture, isMobile } from "../helpers/helper";

export default class SplashScreen extends BaseScreen {
    private barContainer: Container;
    private fillBar: Sprite;
    private text: Text;
    private mobile: boolean = false;

    constructor() {
        super();

        this.mobile = isMobile();

        this.barContainer = new Container();
        this.fillBar = Sprite.from('loading_bar_middle');
        
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
        const bg = Sprite.from(this.mobile ? 'BGLoadPort' : 'BGLoadLand');
        this.addChild(bg);
    }

    private addBar() {
        this.addChild(this.barContainer);
        const paddingLeft = this.mobile ? 100 : 190;
        const paddingBottom = this.mobile ? 250 : 175;
        this.barContainer.y = config.appHeight - paddingBottom;

        const barEmptyStart = Sprite.from('loading_bar_empty_end');
        barEmptyStart.x = paddingLeft;
        this.barContainer.addChild(barEmptyStart);
        const barEmptyEnd = Sprite.from('loading_bar_empty_end');
        barEmptyEnd.x = this.width - paddingLeft;
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

    public update(num: number) {
        const upgradeBackColor = getGradientTexture([{ percent: 0, color: 'rgba(255, 255, 255, 1)' },
            { percent: 1, color: 'rgba(224, 247, 3, 1)' }]);
        const ww = num;
        const defaultWidth = this.barContainer.getBounds().width - 160;
        const width = (defaultWidth * ww) / 100;
        this.fillBar.width = width;
        this.fillBar.height = 48;
        this.fillBar.texture = upgradeBackColor;
        this.text.text = `${num.toFixed(0)}%`;
        this.text.position.set(
            this.fillBar.getBounds().right + 20,
            (this.barContainer.height - this.text.height) / 2
        );
    }
}	
