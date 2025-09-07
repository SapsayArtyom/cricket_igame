import { Application, Container } from "pixi.js";
import 'pixi-spine';
import { assetsBundle, assetsSpines, assetsSplash, assetsSpritesheets } from "./assetsBundle";
import SceneManager from "./managers/SceneManager";
import SoundManager from "./managers/SoundManager";
import { config } from "./configs/config";
import { SCREENS } from "./helpers/events";
import { preloadAtlases } from "./helpers/loadXmlAtlas";
import { Assets } from "@pixi/assets";
import { loadSpineJSONs } from "./helpers/loadSpineJSON";

(async () => {
    const app = new Application({ backgroundColor: 0x1099bb, width: config.appWidth, height: config.appHeight });
    document.getElementById("pixi-container")!.appendChild(app.view);
    (globalThis as any).__PIXI_APP__ = app; // eslint-disable-line
    const container = new Container();
    app.stage.addChild(container);

    await Assets.addBundle("splash", assetsSplash);
    await Assets.loadBundle(["splash"]);
    const sceneManager = new SceneManager(container);

    await preloadAtlases(
        assetsSpritesheets,
        {
            onProgress: ({ percent}) => {
                sceneManager.getScreen(SCREENS.SPLASH).update(percent / 3);
            },
        }
    );

    await loadSpineJSONs(
        'spines', // имя бандла (ключи будут "spines/hero", "spines/enemy")
        assetsSpines,
        (p) => {
            console.log(`progress ${p.percent.toFixed(1)}%`, p.alias ?? '')
            sceneManager.getScreen(SCREENS.SPLASH).update((p.percent / 3 * 2 + 33).toFixed(0));}
    );
    
    await Assets.addBundle("main", assetsBundle);
    // await Assets.loadBundle(["main"]);
    Assets.loadBundle(['main'], (progress) => {
        sceneManager.getScreen(SCREENS.SPLASH).update(((progress * 100) / 3 + 67).toFixed(0));
    }).then(async () => {
        console.log('Assets loaded');
        sceneManager.init();
        sceneManager.changeScreen(SCREENS.GAME);
    });

    new SoundManager();
    
    sceneManager.changeScreen(SCREENS.SPLASH);
})();
