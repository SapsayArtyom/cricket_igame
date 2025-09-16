import { Application, Container, utils } from "pixi.js";
import 'pixi-spine';
import { assetsBundle, assetsSounds, assetsSpines, assetsSplash, assetsSpritesheets } from "./assetsBundle";
import SceneManager from "./managers/SceneManager";
import SoundManager from "./managers/SoundManager";
import { config } from "./configs/config";
import { SCREENS } from "./helpers/events";
import { preloadAtlases } from "./helpers/loadXmlAtlas";
import { Assets } from "@pixi/assets";
import { loadSpineJSONs } from "./helpers/loadSpineJSON";
import { hideLogs, isMobile } from "./helpers/helper";

(async () => {
    hideLogs();
    const mobile = isMobile();
    if (mobile) {
        config.appWidth = config.appWidthPortrait;
        config.appHeight = config.appHeightPortrait;
    }
    utils.skipHello();
    const app = new Application({
        backgroundColor: 0x000000,
        width: config.appWidth, 
        height: config.appHeight 
    });
    document.getElementById("pixi-container")!.appendChild(app.view);
    (globalThis as any).__PIXI_APP__ = app; // eslint-disable-line
    const container = new Container();
    app.stage.addChild(container);
    setWindowSize();
    

    await Assets.addBundle("splash", assetsSplash);
    await Assets.loadBundle(["splash"]);
    const sceneManager = new SceneManager(container);
    sceneManager.initSplashScreen();
    
    await preloadAtlases(
        assetsSpritesheets,
        {
            onProgress: ({ percent}) => {
                sceneManager.getScreen(SCREENS.SPLASH).update(percent / 3);
            },
        }
    );

    await loadSpineJSONs(
        'spines',
        assetsSpines,
        (p) => {
            sceneManager.getScreen(SCREENS.SPLASH).update((p.percent / 3 * 2 + 33));}
    );
    await Assets.addBundle("main", assetsBundle);
    Assets.loadBundle(['main'], (progress) => {
        sceneManager.getScreen(SCREENS.SPLASH).update(((progress * 100) / 3 + 67));
    }).then(async () => {
        sceneManager.init();
        sceneManager.changeScreen(SCREENS.GAME);
    });

    const sound = new SoundManager();
    sound.addSounds(assetsSounds);
    
    sceneManager.changeScreen(SCREENS.SPLASH);

    function setWindowSize() {
        const canvas = document.getElementsByTagName('canvas')[0];
        const { innerHeight, innerWidth } = window;
        const ratio = config.appWidth / config.appHeight;
        const clientRatio = innerWidth / innerHeight;
        if (clientRatio < ratio) {
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
        } else {
            canvas.style.width = 'auto';
            canvas.style.height = '100%';
        }
    }
    window.onresize = () => setWindowSize();

    window.addEventListener('resize', setWindowSize);
})();
