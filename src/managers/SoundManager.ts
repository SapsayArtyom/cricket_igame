import { sound } from "@pixi/sound";
import globalEventEmitter from "../helpers/GlobalEventEmitters";
import { EVENTS } from "../helpers/events";

type ISoundItem = 'music' | 'sound';

export default class SoundManager {
    private static instance: SoundManager;
    protected isMusic: boolean = false;
    protected isSound: boolean = false;

    constructor() {
        this.subscribeToEvents();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public subscribeToEvents() {
        globalEventEmitter.on(EVENTS.PLAY_SOUND, (soundName: string, isLoop: boolean) =>
            this.startSound(soundName, isLoop)
        );
        globalEventEmitter.on(EVENTS.STOP_SOUND, (soundName: string) => this.stopSound(soundName));
    }

    private startSound(soundName: string, isLoop: boolean) {
        sound.play(soundName, { loop: isLoop });
    }

    private stopSound(soundName: string) {
        sound.stop(soundName);
    }

    public setSettings(key: ISoundItem, value: boolean) {
        switch (key) {
            case 'music':
                this.isMusic = value;
                break;
            case 'sound':
                this.isSound = value;
                break;
        }
    }
}