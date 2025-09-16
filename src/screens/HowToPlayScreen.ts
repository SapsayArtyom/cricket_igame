import { Container, Graphics, Sprite, Text } from "pixi.js";
import BaseScreen from "./BaseScreen.ts";
import { config } from "../configs/config";
import { Button } from "../components/btn.ts";
import globalEventEmitter from "../helpers/GlobalEventEmitters.ts";
import { EVENTS, SCREENS, SOUNDS } from "../helpers/events.ts";
import { locales } from "../configs/locales.ts";
import { ScrollBox } from "../components/ScrollBox.ts";
import { isMobile } from "../helpers/helper.ts";

export default class HowToPlayScreen extends BaseScreen {
    private sideBarContainer: Container;
    private bottomBarContainer: Container;
    private home!: Button;
    private infoIcon!: Button;
    private historyIcon!: Button;
    private isInfoOpen: boolean = true;
    private mobile: boolean = false;
    private howToPlay!: Button;
    private historyContainer!: Container;
    private rulesContainer!: ScrollBox;
    private exitContainer!: Container;

    constructor() {
        super();

        this.sideBarContainer = new Container();
        this.bottomBarContainer = new Container();
        this.mobile = isMobile();

        this.init();
        this.addBottomBar();
        this.addRulesText();
        this.addHistory();
        this.addSideBar();
        this.addExit();

        const gameTitle = new Text('CRICKET CHAMPION', {
            fontSize: 19,
            fill: '#ffffff',
            fontFamily: "Araboto Light",
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 1,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2,
            letterSpacing: 0.7,
        });
        gameTitle.position.set(40, 8);
        this.addChild(gameTitle);
    }

    private init() {
        const bg = Sprite.from('gradient');
        bg.width = config.appWidth;
        bg.height = config.appHeight;
        this.addChild(bg);

        this.howToPlay = new Button({
            textures: {
                default: 'confirm_button_enabled',
            },
            hoverScale: 1,
            onClick: () => {
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
                globalEventEmitter.emit(EVENTS.OPEN_SCREEN, SCREENS.GAME);
            }
        });

        if (this.mobile) {
            this.howToPlay.position.set(
                config.appWidth / 2,
                1510
            );
        } else {
            this.howToPlay.position.set(
                1783,
                490
            );
        }
        this.addChild(this.howToPlay);
    }

    private addExit() {
        this.exitContainer = new Container();
        this.addChild(this.exitContainer);
        this.exitContainer.visible = false;

        const exitBg = Sprite.from('gradient');
        exitBg.width = config.appWidth;
        exitBg.height = config.appHeight;
        this.exitContainer.addChild(exitBg);

        const container = new Container();
        this.exitContainer.addChild(container);

        const title = new Text('Exit the game?', config.styles.infoTitle);
        title.style.fill = 0xffffff;
        title.style.fontSize = 60;
        container.addChild(title);
        
        const yesBtn = new Text('YES', config.styles.infoTitle);
        yesBtn.style.fill = 0xffffff;
        yesBtn.style.fontSize = 60;
        yesBtn.interactive = true;
        yesBtn.buttonMode = true;
        yesBtn.on('pointerdown', () => {
            globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
        });

        yesBtn.position.set(
            0,
            title.getBounds().bottom + 150
        );

        const noBtn = new Text('NO', config.styles.infoTitle);
        noBtn.style.fill = 0xffffff;
        noBtn.style.fontSize = 60;
        noBtn.interactive = true;
        noBtn.buttonMode = true;
        noBtn.on('pointerdown', () => {
            globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
            globalEventEmitter.emit(EVENTS.OPEN_SCREEN, SCREENS.GAME);
            this.exitContainer.visible = false;
        });

        noBtn.position.set(
            400,
            title.getBounds().bottom + 150
        );

        container.addChild(yesBtn);
        container.addChild(noBtn);

        title.position.set(
            (container.width - title.width) / 2,
            0
        );

        container.position.set(
            (config.appWidth - container.width) / 2,
            (config.appHeight - container.height) / 2
        );
    }

    private addRulesText() {
        const paddingTop = 40;
        const paddingLeft = 60;
        const rightSidebarGap = 30; // уже используете для боковой панели
        const sideBarWidth = 200;   // приблизительно под ваши иконки, скорректируйте при желании
        // const bottomBarTotal = 120 + 50; // высота bg + смещение в вашем коде
        const bottomBarTotal = (config.appHeight - this.bottomBarContainer.getBounds().y); // высота bg + смещение в вашем коде

        let viewportWidth;
        let viewportHeight;

        if (this.mobile) {
            viewportWidth = Math.min(1300, config.appWidth - 50);
            config.styles.infoText.wordWrapWidth = config.appWidth - 50
        } else {
            viewportWidth = Math.min(1300, config.appWidth - sideBarWidth - rightSidebarGap - paddingLeft - 20);
            config.styles.infoText.wordWrapWidth = 1260;
        }

        if (this.mobile) {
            viewportHeight = Math.max(100, config.appHeight - bottomBarTotal - paddingTop - 365);
        } else {
            viewportHeight = Math.max(100, config.appHeight - bottomBarTotal - paddingTop + 40);
        }

        this.rulesContainer = new ScrollBox({
            width: viewportWidth,
            height: viewportHeight,
            scrollbar: true,
            wheel: true,
            wheelStep: 80,
            drag: true,
        });

        this.rulesContainer.position.set(paddingLeft, paddingTop);
        this.addChild(this.rulesContainer);

        const infoContainer = this.rulesContainer.content;

        const gameName = new Text(locales.INFOPAGES_GAME_NAME, config.styles.infoTitle);
        gameName.y = 70;
        gameName.x = (viewportWidth - gameName.width) / 2;
        infoContainer.addChild(gameName);

        const aboutTitle = new Text(locales.INFOPAGES_ABOUT_TITLE, config.styles.infoSubtitle);
        aboutTitle.position.set((viewportWidth - aboutTitle.width) / 2, gameName.y + gameName.getLocalBounds().bottom + 75);
        infoContainer.addChild(aboutTitle);

        const aboutDesc = new Text(locales.INFOPAGES_ABOUT_DESCR, config.styles.infoText);
        aboutDesc.position.set((viewportWidth - aboutDesc.width) / 2, aboutTitle.y + aboutTitle.getLocalBounds().bottom + 13);
        infoContainer.addChild(aboutDesc);

        const howToPlayTitle = new Text(locales.INFOPAGES_HOW_TO_PLAY, config.styles.infoTitle);
        howToPlayTitle.position.set((viewportWidth - howToPlayTitle.width) / 2, aboutDesc.y + aboutDesc.getLocalBounds().bottom + 50);
        infoContainer.addChild(howToPlayTitle);

        const startTitle = new Text(locales.INFOPAGES_START_TITLE, config.styles.infoSubtitle);
        startTitle.position.set((viewportWidth - startTitle.width) / 2, howToPlayTitle.y + howToPlayTitle.getLocalBounds().bottom + 65);
        infoContainer.addChild(startTitle);
        const startDesc = new Text(locales.INFOPAGES_START_DESCR, config.styles.infoText);
        startDesc.position.set((viewportWidth - startDesc.width) / 2, startTitle.y + startTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(startDesc);

        const shootTitle = new Text(locales.INFOPAGES_SHOOT_TITLE, config.styles.infoSubtitle);
        shootTitle.position.set((viewportWidth - shootTitle.width) / 2, startDesc.y + startDesc.getLocalBounds().bottom + 50);
        infoContainer.addChild(shootTitle);
        const shootDesc = new Text(locales.INFOPAGES_SHOOT_DESCR, config.styles.infoText);
        shootDesc.position.set((viewportWidth - shootDesc.width) / 2, shootTitle.y + shootTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(shootDesc);

        const cashoutTitle = new Text(locales.INFOPAGES_CASHOUT_TITLE, config.styles.infoSubtitle);
        cashoutTitle.position.set((viewportWidth - cashoutTitle.width) / 2, shootDesc.y + shootDesc.getLocalBounds().bottom + 50);
        infoContainer.addChild(cashoutTitle);
        const cashoutDesc = new Text(locales.INFOPAGES_CASHOUT_DESCR, config.styles.infoText);
        cashoutDesc.position.set((viewportWidth - cashoutDesc.width) / 2, cashoutTitle.y + cashoutTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(cashoutDesc);

        const tntTitle = new Text(locales.INFOPAGES_TNT_TITLE, config.styles.infoSubtitle);
        tntTitle.position.set((viewportWidth - tntTitle.width) / 2, cashoutDesc.y + cashoutDesc.getLocalBounds().bottom + 50);
        infoContainer.addChild(tntTitle);
        const tntDesc = new Text(locales.INFOPAGES_TNT_DESCR, config.styles.infoText);
        tntDesc.position.set((viewportWidth - tntDesc.width) / 2, tntTitle.y + tntTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(tntDesc);

        const tipsTitle = new Text(locales.INFOPAGES_TIPS_TITLE, config.styles.infoSubtitle);
        tipsTitle.position.set((viewportWidth - tipsTitle.width) / 2, tntDesc.y + tntDesc.getLocalBounds().bottom + 50);
        infoContainer.addChild(tipsTitle);
        const tipsDescOne = new Text(locales.INFOPAGES_TIPS_DESCR_ONE, config.styles.infoText);
        tipsDescOne.position.set((viewportWidth - tipsDescOne.width) / 2, tipsTitle.y + tipsTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(tipsDescOne);
        const tipsDescTwo = new Text(locales.INFOPAGES_TIPS_DESCR_TWO, config.styles.infoText);
        tipsDescTwo.position.set((viewportWidth - tipsDescTwo.width) / 2, tipsDescOne.y + tipsDescOne.getLocalBounds().bottom);
        infoContainer.addChild(tipsDescTwo);
        const tipsDescThree = new Text(locales.INFOPAGES_TIPS_DESCR_THREE, config.styles.infoText);
        tipsDescThree.position.set((viewportWidth - tipsDescThree.width) / 2, tipsDescTwo.y + tipsDescTwo.getLocalBounds().bottom);
        infoContainer.addChild(tipsDescThree);

        const paytableTitle = new Text(locales.INFOPAGES_PAYTABLE_TITLE, config.styles.infoSubtitle);
        paytableTitle.position.set((viewportWidth - paytableTitle.width) / 2, tipsDescThree.y + tipsDescThree.getLocalBounds().bottom + 50);
        infoContainer.addChild(paytableTitle);
        const paytableDescOne = new Text(locales.INFOPAGES_PAYTABLE_DESCR_1, config.styles.infoText);
        paytableDescOne.position.set((viewportWidth - paytableDescOne.width) / 2, paytableTitle.y + paytableTitle.getLocalBounds().bottom + 13);
        infoContainer.addChild(paytableDescOne);
        const paytableDescTwo = new Text(locales.INFOPAGES_PAYTABLE_DESCR_2, config.styles.infoText);
        paytableDescTwo.position.set((viewportWidth - paytableDescTwo.width) / 2, paytableDescOne.y + paytableDescOne.getLocalBounds().bottom - 3);
        infoContainer.addChild(paytableDescTwo);

        const payoutTitle = new Text(locales.INFOPAGES_PAYOUT_TITLE, config.styles.infoSubtitle);
        payoutTitle.position.set((viewportWidth - payoutTitle.width) / 2, paytableDescTwo.y + paytableDescTwo.getLocalBounds().bottom + 50);
        infoContainer.addChild(payoutTitle);
        const payoutFactorOne = new Text(locales.INFOPAGES_PAYOUT_FACTOR_1, config.styles.infoText);
        payoutFactorOne.position.set((viewportWidth - payoutFactorOne.width) / 2, payoutTitle.y + payoutTitle.getLocalBounds().bottom + 13);
        infoContainer.addChild(payoutFactorOne);
        const payoutFactorTwo = new Text(locales.INFOPAGES_PAYOUT_FACTOR_2, config.styles.infoText);
        payoutFactorTwo.position.set((viewportWidth - payoutFactorTwo.width) / 2, payoutFactorOne.y + payoutFactorOne.getLocalBounds().bottom - 2);
        infoContainer.addChild(payoutFactorTwo);

        const rtpTitle = new Text(locales.INFOPAGES_RTP, config.styles.infoSubtitleWhite);
        rtpTitle.position.set((viewportWidth - rtpTitle.width) / 2, payoutFactorTwo.y + payoutFactorTwo.getLocalBounds().bottom + 60);
        infoContainer.addChild(rtpTitle);
        const rtpDesc = new Text(locales.INFOPAGES_RTP_DESC, config.styles.infoText);
        rtpDesc.position.set((viewportWidth - rtpDesc.width) / 2, rtpTitle.y + rtpTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(rtpDesc);

        const paysDesc = new Text(locales.INFOPAGES_PAYS, config.styles.infoText);
        paysDesc.position.set((viewportWidth - paysDesc.width) / 2, rtpDesc.y + rtpDesc.getLocalBounds().bottom + 160);
        infoContainer.addChild(paysDesc);

        const versionTitle = new Text(locales.INFOPAGES_VERSION, config.styles.infoSubtitleWhite);
        versionTitle.position.set((viewportWidth - versionTitle.width) / 2, paysDesc.y + paysDesc.getLocalBounds().bottom + 90);
        infoContainer.addChild(versionTitle);

        const gameVersion = new Text(`${locales.INFOPAGES_GAME}`, config.styles.infoText);
        gameVersion.position.set((viewportWidth - gameVersion.width) / 2, versionTitle.y + versionTitle.getLocalBounds().bottom + 15);
        infoContainer.addChild(gameVersion);
        const gameVersionDesc = new Text(`${locales.INFOPAGES_GAME_DESC}`, config.styles.infoTextRegular);
        gameVersionDesc.position.set((viewportWidth - gameVersionDesc.width) / 2, gameVersion.y + gameVersion.getLocalBounds().bottom + 10);
        infoContainer.addChild(gameVersionDesc);
        const coreVersion = new Text(`${locales.INFOPAGES_CORE}`, config.styles.infoText);
        coreVersion.position.set((viewportWidth - coreVersion.width) / 2, gameVersionDesc.y + gameVersionDesc.getLocalBounds().bottom + 10);
        infoContainer.addChild(coreVersion);
        const coreVersionDesc = new Text(`${locales.INFOPAGES_CORE_DESC}`, config.styles.infoTextRegular);
        coreVersionDesc.position.set((viewportWidth - coreVersionDesc.width) / 2, coreVersion.y + coreVersion.getLocalBounds().bottom + 10);
        infoContainer.addChild(coreVersionDesc);
        const serverVersion = new Text(`${locales.INFOPAGES_SERVER}`, config.styles.infoText);
        serverVersion.position.set((viewportWidth - serverVersion.width) / 2, coreVersionDesc.y + coreVersionDesc.getLocalBounds().bottom + 10);
        infoContainer.addChild(serverVersion);
        const serverVersionDesc = new Text(`${locales.INFOPAGES_SERVER_DESC}`, config.styles.infoTextRegular);
        serverVersionDesc.position.set((viewportWidth - serverVersionDesc.width) / 2, serverVersion.y + serverVersion.getLocalBounds().bottom + 10);
        infoContainer.addChild(serverVersionDesc);

        const hiddenText = new Text('', config.styles.infoText);
        hiddenText.position.set((viewportWidth - hiddenText.width) / 2, serverVersionDesc.y + serverVersionDesc.getLocalBounds().bottom + 340);
        infoContainer.addChild(hiddenText);

        this.rulesContainer.position.set(
            (config.appWidth - viewportWidth) / 2, 
            0
        );
    }

    private addHistory() {
        this.historyContainer = new Container();
        this.addChild(this.historyContainer);
        this.historyContainer.visible = false;

        const title = new Text('HISTORY', config.styles.infoTitle);
        title.style.fill = 0xffca17;
        title.y = 45;
        title.x = (config.appWidth - title.width) / 2;
        this.historyContainer.addChild(title);

        const historyDesc = new Text('No history data...', config.styles.infoText);
        historyDesc.position.set((config.appWidth - historyDesc.width) / 2, title.y + title.getLocalBounds().bottom + 20);
        this.historyContainer.addChild(historyDesc);
    }

    private addSideBar() {
        this.addChild(this.sideBarContainer);

        this.home = new Button({
            textures: {
                default: 'Mobile_Home_Icon',
            },
            swipeSize: true,
            hoverScale: 1,
            onClick: () => {
                this.exitContainer.visible = true;
                globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
            }
        });
        this.home.position.set(
            this.home.width / 2,
            this.home.height / 2
        );
        this.sideBarContainer.addChild(this.home);

        this.sideBarContainer.position.set(
            config.appWidth - this.sideBarContainer.width - 37, 
            32
        );
    }
	
    private addBottomBar() {
        this.addChild(this.bottomBarContainer);
        const tintColor = 0xffca17;
        const tintColorDef = 0xffffff;

        const bg = new Graphics();
        bg.beginFill(0x343434, 1);
        bg.drawRect(0, 0, config.appWidth, this.mobile ? 172 : 131);
        bg.endFill();
        this.bottomBarContainer.addChild(bg);

        this.infoIcon = new Button({
            textures: {
                default: 'Mobile_Info',
            },
            hoverScale: 1,
            onClick: () => {
                if (!this.isInfoOpen) {
                    this.infoIcon.setTint(tintColor);
                    this.historyIcon.setTint(tintColorDef);
                    this.isInfoOpen = true;
                    this.toggleView();
                }
                else globalEventEmitter.emit(EVENTS.OPEN_SCREEN, SCREENS.GAME);
            }
        });
        if (this.mobile) {
            this.infoIcon.position.set(
                bg.width / 2 - 274,
                bg.height / 2
            );
        } else {
            this.infoIcon.position.set(
                bg.width / 2 - 497,
                bg.height / 2
            );
        }
        this.infoIcon.setTint(tintColor);
        
        this.historyIcon = new Button({
            textures: {
                default: 'Mobile_History',
            },
            hoverScale: 1,
            onClick: () => {
                if (this.isInfoOpen) {
                    this.historyIcon.setTint(tintColor);
                    this.infoIcon.setTint(tintColorDef);
                    this.isInfoOpen = false;
                    this.toggleView();
                }
                else globalEventEmitter.emit(EVENTS.OPEN_SCREEN, SCREENS.GAME);
            }
        });

        if (this.mobile) {
            this.historyIcon.position.set(
                bg.width / 2 + 272,
                bg.height / 2
            );
        } else {
            this.historyIcon.position.set(
                bg.width / 2 + 495,
                bg.height / 2
            );
        }

        this.bottomBarContainer.addChild(this.infoIcon, this.historyIcon);
        if (this.mobile) {
            this.bottomBarContainer.position.set(0, 1696);
        } else {
            this.bottomBarContainer.position.set(0, 893);
        }
    }

    private toggleView() {
        globalEventEmitter.emit(EVENTS.PLAY_SOUND, SOUNDS.BUTTON_CLICK);
        if (this.isInfoOpen) {
            this.rulesContainer.visible = true;
            this.historyContainer.visible = false;
            this.home.visible = true;
        } else {
            this.rulesContainer.visible = false;
            this.historyContainer.visible = true;
            this.home.visible = false;
        }
        this.rulesContainer.scrollTo(0);
    }
}
