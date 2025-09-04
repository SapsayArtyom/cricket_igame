import { Application, Assets, Container } from "pixi.js";
import { assetsBundle, assetsSplash, assetsSpritesheets } from "./assetsBundle";
import SceneManager from "./managers/SceneManager";
import SoundManager from "./managers/SoundManager";
import { config } from "./configs/config";
import { SCREENS } from "./helpers/events";
import { preloadAtlases } from "./helpers/loadXmlAtlas";
// import Scene from "./scene";

(async () => {
    const app = new Application();
    await app.init({ background: "#1099bb", width: config.appWidth, height: config.appHeight });
    document.getElementById("pixi-container")!.appendChild(app.canvas);
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
                sceneManager.getScreen(SCREENS.SPLASH).update(percent / 2);
            },
        }
    );
    
    await Assets.addBundle("main", assetsBundle);
    await Assets.loadBundle(["main"]);
    Assets.loadBundle(['main'], (progress) => {
        sceneManager.getScreen(SCREENS.SPLASH).update((progress * 100) / 2 + 50);
    }).then(async () => {
        console.log('Assets loaded');
        sceneManager.init();
        sceneManager.changeScreen(SCREENS.GAME);
    });
    

    // const scene = new Scene(app);
    // app.stage.addChild(scene);


    new SoundManager();
    
    sceneManager.changeScreen(SCREENS.SPLASH);
})();
