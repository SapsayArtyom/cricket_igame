import { Sprite } from "pixi.js";
import BaseScreen from "./BaseScreen.ts";
import Controls from "../components/Controls.ts";
import Board from "../components/Board.ts";
import WinPanel from "../components/WinPanel.ts";
import BottomBar from "../components/BottomBar.ts";

export default class GameScreen extends BaseScreen {
    private board!: Board;
    private bottomBar!: BottomBar;

    constructor() {
        super();

        this.init();
        this.addBoard();
        this.addBetPanel();
        this.addBetBar();
        this.addBottomBar();
    }

    private init() {
        // const bg = Spine.from({
        //     skeleton: "skeleton",
        //     atlas: "skeletonAtlas"
        // });
        // bg.state.setAnimation(0, "Horizontal", true);
        // this.addChild(bg);

        const bg = Sprite.from('BGLoadLand');
        this.addChild(bg);
    }

    private addBoard() {
        this.board = new Board();
        this.board.position.set(
            this.width / 2 - this.board.width / 2 - 50,
            -12
        );
        this.addChild(this.board);
    }

    private addBetPanel() {
        const panel = new WinPanel();
        panel.position.set(
            (this.board.width / 2 - panel.width / 2) + this.board.x,
            30
        );
        this.addChild(panel);	
    }

    private addBetBar() {
        const betControls = new Controls();
        betControls.position.set(
            this.width - betControls.width - 30, 
            120
        );
        this.addChild(betControls);
    }
	
    private addBottomBar() {
        const bottomBar = new BottomBar();
        bottomBar.position.set(
            this.width / 2 - bottomBar.width / 2,
            this.height - bottomBar.height
        );
        this.addChild(bottomBar);
    }
}	
