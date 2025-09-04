import { Container, Sprite } from "pixi.js";

export default class Board extends Container {
    private board!: Sprite;

    constructor() {
        super();

        this.init();
    }

	 private init() {
        this.board = Sprite.from('GamePanelLandscape');
        this.addChild(this.board);
        // Initialization logic
    }
}