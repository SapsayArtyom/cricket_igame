import { Container, Sprite } from "pixi.js";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";
import Cell from "./Cell";
import { randomFloat, randomInt } from "../helpers/math";

export default class Board extends Container {
    private board!: Sprite;
    private grid!: Container;

    constructor() {
        super();
        
        this.init();
        this.createGrid();
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.PLAY, this.startGame.bind(this));
    }

	 private init() {
        this.board = Sprite.from('GamePanelLandscape');
        this.addChild(this.board);
    }

    private createGrid() {
        this.grid = new Container();
        this.addChild(this.grid);
        this.grid.position.set(173, 210);

        for (let i = 0; i < config.cells + 1; i++) {
            const cell = new Cell();

            cell.position.set(
                (i % 5) * (cell.width + 20),
                Math.floor(i / 5) * (cell.height + 20)
            );
            cell.onClick(() => this.play(cell as Cell));
            this.grid.addChild(cell);
        }
    }

    private startGame() {
        this.grid.children.forEach((cell) => {
            // (cell as Cell).addPreview();
            (cell as Cell).reset();
        });
    }

    private play(cell: Cell) {
        const chance = randomInt(0, 10);
        if (chance > 3) {
            const amount = (randomFloat(2, 6));
            cell.play(amount);
        } else {
            cell.play(0);
            this.blockBoard();
            globalEventEmitter.emit(EVENTS.LOSS);
        }
    }

    private blockBoard() {
        this.grid.children.forEach((cell) => {
            (cell as Cell).interactive = false;
            (cell as Cell).buttonMode = false;
        });
    }

    private reset() {
        this.grid.children.forEach((cell) => {
            (cell as Cell).reset();
        });
    }
}