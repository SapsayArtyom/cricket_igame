import {TextStyleOptions} from "pixi.js";

type StyleMap = {
    [key: string]: TextStyleOptions;
};

export const config = {
    isDev: false,
    mute: true,
    appWidth: 1920,
    appHeight: 1080,
    styles: {
        default: {
            fontFamily: "Arial",
            fontSize: 24,
            fill: "#ffffff",
        },
        buttonLabel: {
            fontFamily: "Arial",
            fontSize: 54,
            fill: "#f5de04",
            stroke: { color: '#000000', width: 4, join: 'round' },
        },
        wallet: {
            fontFamily: "Arial",
            fontSize: 34,
            fill: "#ffffff",
        },
        balance: {
            fontFamily: "Arial",
            fontSize: 24,
            fill: "#f5de04",
        },
        loading: {
            fontFamily: "Arial",
            fontSize: 24,
            fontWeight: "bold",
            fill: "#e0f703",
        }
    } as StyleMap
};
