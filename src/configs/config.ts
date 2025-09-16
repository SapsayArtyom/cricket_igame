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
    appWidthPortrait: 1080,
    appHeightPortrait: 1920,
    minWidth: 800,
    cells: 24,
    defaultBet: 10,
    defaultHitter: 1,
    defaultBullets: 24,
    balance: 500,
    currencyCoeff: 10,
    currentBet: 0,
    bets: [1, 2, 3, 5, 10, 15, 30, 60, 100, 250, 500, 1000],
    maxWins: [3, 33, 99.9, 99.9, 99.9, 99.9, 99.9, 99.9, 2.50],
    defaultMultipliers: [1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2.0, 2.2, 2.5, 2.8, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 9.0, 10.0, 15.0, 30.0],
    multipliers: [1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 2.0, 2.2, 2.5, 2.8, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 8.0, 9.0, 10.0, 15.0, 30.0],
    firstNextPicks: {
        "1": [
            1.1,
            1.2,    
            1.3,
            1.4
        ],
        "2": [
            1.2,
            1.4,
            1.6,
            1.8
        ],
        "3": [
            1.3,
            1.6,
            1.9,
            2.2
        ],
        "5": [
            1.4,
            1.8,
            2.2,
            2.6
        ],
        "7": [
            1.5,
            2,
            2.5,
            3
        ],
        "10": [
            2,
            3,
            4,
            5
        ],
        "17": [
            3,
            5,
            10,
            15
        ],
        "20": [
            5,
            10,
            30,
            90
        ],
        "24": [
            25,
            0,
            0,
            0
        ]
    },
    styles: {
        default: {
            fontFamily: "Roboto Bold",
            fontSize: 27, 
            fill: 0xffffff,
            stroke: '#0031c3',
            strokeThickness: 6,
            align: 'center',
            lineHeight: 28
        },
        winLabel: {
            fontFamily: "Roboto Bold",
            fontSize: 44,
            fill: 0xffffff,
            stroke: '#0031c3',
            strokeThickness: 6,
        },
        betBtn: {
            fontFamily: "Roboto Bold",
            fontSize: 45,
            fill: "#701b11",
        },
        betBtnCashout: {
            fontFamily: "Roboto Bold",
            fontSize: 34,
            fill: "#701b11",
            lineHeight: 36,
        },
        buttonLabel: {
            fontFamily: "Roboto Bold",
            fontSize: 53,
            fill: "#fbd129",
            stroke: '#000000',
            strokeThickness: 4,
            letterSpacing: -0.3,
        },
        wallet: {
            fontFamily: "Roboto Bold",
            fontSize: 44,
            fill: "#ffffff",
        },
        balance: {
            fontFamily: "Araboto Normal",
            fontSize: 28,
            fill: "#fbc817",
        },
        loading: {
            fontFamily: "Roboto Bold",
            fontSize: 34,
            fontWeight: "bold",
            fill: "#e0f703",
        },
        winLabelCell: {
            fontFamily: "Roboto Condensed Bold",
            fontSize: 36,
            fill: '#720403',
        },
        winPopup: {
            fontFamily: "Roboto Bold",
            fontSize: 176,
            fill: '#f5de04',
            stroke: '#720403',
            strokeThickness: 8,
        },
        winPopupValue: {
            fontFamily: "Roboto Bold",
            fontSize: 106,
            fill: '#f5de04',
            stroke: '#720403',
            strokeThickness: 6,
        },
        infoTitle: {
            fontFamily: "Roboto Bold",
            fontSize: 50,
            fill: '#ffae00',
        },
        infoSubtitle: {
            fontFamily: "Roboto Bold",
            fontSize: 40,
            fill: '#fbb62b',
        },
        infoSubtitleWhite: {
            fontFamily: "Roboto Bold",
            fontSize: 40,
            fill: '#ffffff',
        },
        infoText: {
            fontFamily: "Araboto Medium",
            fontSize: 30,
            fill: '#ffffff',
            wordWrap: true,
            wordWrapWidth: 1200,
            align: 'center',
            lineHeight: 31,
            // letterSpacing: 0.3,
        },
        infoTextRegular: {
            fontFamily: "Roboto Regular",
            fontSize: 28,
            fill: '#ffffff',
            wordWrap: true,
            wordWrapWidth: 1200,
            align: 'center',
            lineHeight: 32
        },
    } as StyleMap
};
