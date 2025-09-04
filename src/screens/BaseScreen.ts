import {Container} from "pixi.js";

export default class BaseScreen extends Container {
    constructor() {
        super();

        this.visible = false;
    }

    public show() {
        if (this.visible === false) {
            this.visible = true;
        }
    }

    public hide() {
        if (this.visible === true) {
            this.visible = false;
        }
    }
}
