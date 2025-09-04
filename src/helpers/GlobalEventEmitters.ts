import {EventEmitter} from "eventemitter3";

class GlobalEventEmitter extends EventEmitter {
    private static instance: GlobalEventEmitter;

    private constructor() {
        super();
    }

    public static getInstance(): GlobalEventEmitter {
        if (!GlobalEventEmitter.instance) {
            GlobalEventEmitter.instance = new GlobalEventEmitter();
        }
        return GlobalEventEmitter.instance;
    }
}

const globalEventEmitter = GlobalEventEmitter.getInstance();

export default globalEventEmitter;