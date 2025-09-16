// import { Sprite } from 'pixi.js';
import BaseScreen from "./BaseScreen.ts";
import Controls from "../components/Controls.ts";
import Board from "../components/Board.ts";
import WinPanel from "../components/WinPanel.ts";
import BottomBar from "../components/BottomBar.ts";
import { spineCache } from '../helpers/loadSpineJSON.ts';
import { config } from "../configs/config.ts";
import LeftBar from "../components/LeftBar.ts";
import { WinPopUp } from "../components/Win.ts";
import InfoPanel from "../components/InfoPanel.ts";
import { isMobile } from "../helpers/helper.ts";
import Logo from "../components/Logo.ts";
import Wallet from "../components/Wallet.ts";
import { Text } from "pixi.js";

export default class GameScreen extends BaseScreen {
    private board!: Board;
    private logo!: Logo;
    private bottomBar!: BottomBar;
    private mobile: boolean;
    private betControls!: Controls;

    constructor() {
        super();

        this.mobile = isMobile();

        this.init();
    }

    private init() {
        const bg = spineCache.createSpine('spines', 'skeleton');
        bg.state.setAnimation(0, this.mobile ? 'Vertical' : 'Horizontal', true);
        bg.position.set(config.appWidth / 2, config.appHeight / 2);
        this.addChild(bg);

        const gameTitle = new Text('CRICKET CHAMPION', {
            fontSize: 21,
            fill: '#ffffff',
            fontFamily: "RobotoCondensed Light",
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 1,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2,
            letterSpacing: 0.7,
        });
        gameTitle.position.set(41, 7);
        this.addChild(gameTitle);

        this.addBoard();
        this.addLogo();
        this.addBetPanel();
        this.addLeftBar();
        this.addRightBar();
        this.addBottomBar();
        this.addWallet();
        this.addInfoPanel();
        this.addWinPopUp();
        this.betControls.updatedBetsAndHitters();

        this.sortChildren();
    }

    addLogo() {
        this.logo = new Logo();
        this.addChild(this.logo);
        if (this.mobile) {
            this.logo.position.set(
                (config.appWidth - this.logo.width) / 2,
                0
            );
        } else {
            this.logo.position.set(20, 45);
        }
        // logo.position.set(
        //     config.appWidth - logo.width / 2 - 20,
        //     config.appHeight - logo.height / 2 - 20
        // );
        // this.addChild(logo);
    }

    private addBoard() {
        this.board = new Board();
        this.board.scale.set(this.mobile ? 1.01 : 0.952);
        if (this.mobile) {
            this.board.position.set(
                (config.appWidth - this.board.width) / 2,
                62
            );
        } else {
            this.board.position.set(
                (config.appWidth - this.board.width) / 2 - 10,
                -12
            );
        }
        this.addChild(this.board);
    }

    private addWinPopUp() {
        const winPopUp = new WinPopUp();
        winPopUp.position.set(
            config.appWidth / 2,
            config.appHeight / 2
        );
        winPopUp.zIndex = 100;
        this.addChild(winPopUp);
    }

    private addBetPanel() {
        const panel = new WinPanel();
        if (this.mobile) {
            panel.position.set(
                83,
                154
            );
        } else {
            panel.scale.set(0.955);
            panel.position.set(
                (this.board.width / 2 - panel.width / 2) + this.board.x + 7,
                27
            );
        }
        this.addChild(panel);	
    }

    private addRightBar() {
        this.betControls = new Controls();

        if (this.mobile) {
            this.betControls.position.set(
                75,
                this.board.getBounds().bottom + 5
            );
        } else {
            this.betControls.position.set(
                config.appWidth - this.betControls.width - 25,
                115
            );
        }
        this.betControls.zIndex = 10;
        this.addChild(this.betControls);
    }

    private addLeftBar() {
        const leftBar = new LeftBar();
        leftBar.zIndex = 11;
        if (this.mobile) {
            leftBar.position.set(
                75,
                this.board.getBounds().bottom + 234
            );
        } else {
            leftBar.position.set(20, this.logo.getBounds().bottom + 5);
        }
        this.addChild(leftBar);
    }
	
    private addBottomBar() {
        this.bottomBar = new BottomBar();

        if (this.mobile) {
            this.bottomBar.position.set(
                0,
                config.appHeight - this.bottomBar.height + 5
            );
        } else {
            this.bottomBar.position.set(
                0,
                this.board.getBounds().bottom
            );
        }
        this.addChild(this.bottomBar);
    }

    private addWallet() {
        const wallet = new Wallet();

        if (this.mobile) {
            wallet.position.set(
                150,
                this.bottomBar.getBounds().bottom - 90
            );
        } else {
            wallet.position.set(
                200,
                ((this.bottomBar.height - wallet.height) / 2) + this.bottomBar.y - 53
            );
        }
        this.addChild(wallet);
    }

    private addInfoPanel() {
        const infoPanel = new InfoPanel();
        if (this.mobile) {
            infoPanel.position.set(
                33,
                ((this.bottomBar.height - infoPanel.height) / 2) + this.bottomBar.y - 44
            );
        } else {
            infoPanel.position.set(
                35,
                this.board.getBounds().bottom - infoPanel.height - 17
            );
        }
        this.addChild(infoPanel);
    }
}
