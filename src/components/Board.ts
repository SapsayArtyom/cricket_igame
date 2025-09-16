import { Container, Sprite } from "pixi.js";
import { config } from "../configs/config";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS, SOUNDS } from "../helpers/events";
import Cell from "./Cell";
import { randomInt } from "../helpers/math";
import { isMobile } from "../helpers/helper";

export default class Board extends Container {
    private board!: Sprite;
    private grid!: Container;
    private step: number = 0;
    private cells: Cell[] = [];
    private isPlaying: boolean = false;
    private hitterValue: number = config.defaultHitter;
    private mobile: boolean = false;

    constructor() {
        super();

        this.mobile = isMobile();
        
        this.init();
        this.createGrid();
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        globalEventEmitter.on(EVENTS.PLAY, this.startGame.bind(this));
        globalEventEmitter.on(EVENTS.DISABLE_BOARD, () => {
            this.setDisabledBoard();
            this.setRandomDeflect(this.hitterValue - 1);
        });
        globalEventEmitter.on(EVENTS.WIN, () => {
            this.isPlaying = false;
            this.blockBoard();
            this.setDisabledBoard();
            this.setRandomDeflect(this.hitterValue);
        });
        globalEventEmitter.on(EVENTS.END_GAME, () => {
            this.isPlaying = false;
            this.blockBoard();
            this.setDisabledBoard();
            this.setRandomDeflect(this.hitterValue);
        });
    }

	 private init() {
        const boardImage = this.mobile ? 'GamePanelPortrait' : 'GamePanelLandscape';
        this.board = Sprite.from(boardImage);
        this.addChild(this.board);
    }

    private createGrid() {
        this.grid = new Container();
        this.addChild(this.grid);
        if (this.mobile) this.grid.position.set(212, 251);
        else this.grid.position.set(173, 210);

        for (let i = 0; i < config.cells + 1; i++) {
            const cell = new Cell();

            cell.position.set(
                (i % 5) * (cell.width + 20),
                Math.floor(i / 5) * (cell.height + 20)
            );
            cell.onClick(() => this.cellClick(cell as Cell));
            this.grid.addChild(cell);
            this.cells.push(cell);
        }
    }

    private startGame(data: {hitter: number}) {
        this.hitterValue = data.hitter;
        this.step = 0;
        this.cells.forEach((cell) => {
            cell.reset();
        });
        this.isPlaying = true;
    }

    private cellClick(cell: Cell) {
        let endGame = false
        globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.TARGET_CLICKED);
        this.step++;
        globalEventEmitter.emit(EVENTS.SHOOT, {step: this.step});
        const chance = randomInt(0, 10);
        this.hideCellsWinLabel();
        if (this.step - 1 === config.defaultBullets - this.hitterValue) {
            endGame = true;
            this.blockBoard();
            this.isPlaying = false;
        }
        if (chance > 2) {
            cell.play(this.step, endGame);
        } else {
            this.isPlaying = false;
            cell.play(0);
            this.blockBoard();
            globalEventEmitter.emit(EVENTS.LOSS);
        }
    }

    private hideCellsWinLabel() {
        this.cells.forEach((cell) => {
            cell.hideWinLabel();
        });
    }

    private blockBoard() {
        this.cells.forEach((cell) => {
            cell.interactive = false;
            cell.buttonMode = false;
        });
    }

    private setDisabledBoard() {
        if (this.isPlaying) return;
        this.cells.forEach((cell) => {
            if (!cell.isPlayed) cell.disableCell(true);
        });
    }

    private setRandomDeflect(amount: number) {
        const unplayedCells = this.cells.filter(cell => !cell.isPlayed);
        if (unplayedCells.length === 0) return;
        for (let i = 0; i < amount; i++) {
            
            const randomIndex = randomInt(0, unplayedCells.length - 1);
            unplayedCells[randomIndex].disableCell(true, true);
            unplayedCells.splice(randomIndex, 1);
            if (unplayedCells.length === 0) break;
        }
    }
}