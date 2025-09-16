import { Container } from "pixi.js";
import { spineCache } from "../helpers/loadSpineJSON";
import { Spine } from "pixi-spine";
import { isMobile } from "../helpers/helper";
import { EVENTS } from "../helpers/events";
import globalEventEmitter from "../helpers/GlobalEventEmitters";

export default class Logo extends Container {
    private logo: Spine;
    constructor() {
        super();

        const mobile = isMobile();

        this.logo = spineCache.createSpine('spines', 'logo');
        this.logo.state.setAnimation(0, mobile ? 'logo_portrait' : 'logo_landscape', false);
        this.logo.state.timeScale = 0;
        this.logo.position.set(this.logo.width / 2, this.logo.height / 2);
        this.addChild(this.logo);

        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.WIN, () => this.playAnimation());
        globalEventEmitter.on(EVENTS.LOGO_SHINE, () => this.playAnimation());
    }

    public playAnimation() {
        this.logo.state.timeScale = 1;
        this.logo.state.setAnimation(0, isMobile() ? 'logo_portrait' : 'logo_landscape', false);
    }
}