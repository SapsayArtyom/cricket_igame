import { Container, Sprite, Text } from "pixi.js";

export default class WinPanel extends Container {
    private winMessages: Text[];

    constructor() {
        super();
        this.winMessages = [];

        this.init();
    }

    private init() {
        for (let i = 0; i < 4; i++) {
            this.addPanel(i === 0);
        }
    }

    private addPanel(first: boolean) {
        const container = new Container();
        const panel = Sprite.from(first ? 'Tile-light-tablet' : 'Tile-disable-tablet');
        panel.y = first ? 0 : 5;
        container.addChild(panel);
        this.addChild(container);

        let text: Text;
        if (first) {
            text = new Text({
                text: 'NEXT\n$ 0',
                style: { fontSize: 24, fill: '#f5de04', align: 'center', stroke: { color: '#00155f', width: 8, join: 'round' }, }
            });
            this.winMessages.push(text);
        } else {
            text = new Text({
                text: '0',
                style: { fontSize: 28, fill: '#f5de04', stroke: { color: '#0039e0', width: 8, join: 'round' }, }
            });
            this.winMessages.push(text);
        }
        text.position.set(
            (container.width - text.width) / 2,
            (container.height - text.height) / 2
        );
        container.addChild(text);
        const length = this.children.length;
        container.x = (container.width + 30) * (length - 1);
    }

    public updateWinMessages(values: number[]) {
        values.forEach((value, index) => {
            if (this.winMessages[index]) {
                this.winMessages[index].text = index === 0 ? `NEXT\n$ ${value}` : `${value}`;
            }
        });
    }
}