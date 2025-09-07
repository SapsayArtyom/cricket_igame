import {ITextStyle} from "pixi.js";

// type StyleMap = {
//     [key: string]: TextStyle;
// };
type StyleMap = Record<string, Partial<ITextStyle>>;

export const config = {
    isDev: false,
    mute: true,
    appWidth: 1920,
    appHeight: 1080,
    cells: 24,
    defaultBet: 10,
    defaultHitter: 1,
    styles: {
        default: {
            fontFamily: "Roboto Bold",
            fontSize: 26, 
            fill: 0xffffff,
            stroke: '#0039e2',
            strokeThickness: 6,
            align: 'center',
        },
        winLabel: {
            fontFamily: "Roboto Bold",
            fontSize: 38,
            fill: 0xffffff,
            stroke: '#0039e2',
            strokeThickness: 6,
        },
        betBtn: {
            fontFamily: "Roboto Bold",
            fontSize: 42,
            fill: "#701b11",
        },
        buttonLabel: {
            fontFamily: "Roboto Bold",
            fontSize: 54,
            fill: "#f5de04",
            stroke: '#000000',
            strokeThickness: 4,
            // stroke: { color: '#000000', width: 4, join: 'round' },
        },
        wallet: {
            fontFamily: "Roboto Bold",
            fontSize: 40,
            fill: "#ffffff",
        },
        balance: {
            fontFamily: "Roboto Regular",
            fontSize: 28,
            fill: "#f5de04",
        },
        loading: {
            fontFamily: "Roboto Bold",
            fontSize: 24,
            fontWeight: "bold",
            fill: "#e0f703",
        },
        winLabelCell: {
            fontFamily: "Roboto Bold",
            fontSize: 36,
            fill: '#720403',
        }
    } as StyleMap
};
