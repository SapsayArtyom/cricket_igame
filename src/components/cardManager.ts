import { Container } from "pixi.js";
import Card from "./card";

export type ICardValue = '4_s' | '8_d' | '8_h' | '10_s' | 'a_h' | 'q_s';

export default class CardManager extends Container {
    protected cards: Card[] = [];
    protected cardsValues: ICardValue[] = [
        "4_s", "8_d", "8_h", "10_s", "a_h", "q_s"
    ];

    constructor() {
        super();
        this.init();

        this.pivot.set(
            -this.width / 2 + this.cards[0].width / 2, 
            this.height / 2 - this.cards[0].height / 2
        );
    }

    private init() {
        for (let i = 0; i < 5; i++) {
            const card = new Card(this.getCardValue());
            card.position.set(0 - 25 * i, 0 + 25 * i);
            this.cards.push(card);
            this.addChild(card);
        }
    }

    protected getCardValue(): ICardValue {
        return this.cardsValues[Math.floor(Math.random() * this.cardsValues.length)];
    };

    public async revealNext() {
        if (this.cards.length > 0) {
            const card = this.cards.pop();
            if (card) {
                await card!.flipCard();
                await card!.hide();
                this.removeChild(card);
            }
        }
    }

    public getCardLength(): number {
        return this.cards.length;
    }
}