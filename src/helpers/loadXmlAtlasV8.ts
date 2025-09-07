/* eslint-disable @typescript-eslint/no-explicit-any */
import { Assets, Spritesheet, Texture } from 'pixi.js';

export type PreloadStep = 'xml' | 'image' | 'parse' | 'done';
export interface ProgressInfo {
  percent: number;
  completedAtlases: number;
  totalAtlases: number;
  step: PreloadStep;
  url: string;
  atlasName?: string;
}
export interface PreloadOptions {
  onProgress?: (p: ProgressInfo) => void;
  weights?: { xml: number; image: number; parse: number };
}

/* ------------ helpers ------------ */

const fileBaseName = (url: string) =>
    (url.split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '');

const isAbsoluteUrl = (u: string) => /^[a-z]+:\/\//i.test(u);

const toAbsoluteWithBase = (pathOrUrl: string): string => {
    if (isAbsoluteUrl(pathOrUrl)) return pathOrUrl;

    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const baseClean = base.endsWith('/') ? base : base + '/';
    const relClean = pathOrUrl.replace(/^\/+/, '');
    const baseAbs = new URL(baseClean, window.location.href);
    return new URL(relClean, baseAbs).toString();
};

async function loadXmlToSpritesheet(
    xmlAbsUrl: string,
    onStep?: (step: PreloadStep, ctx: { url: string; atlasName?: string }) => void
): Promise<{ sheet: Spritesheet; atlasName: string }> {
    onStep?.('xml', { url: xmlAbsUrl });

    const res = await fetch(xmlAbsUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch XML: ${res.status} ${res.statusText} @ ${xmlAbsUrl}`);
    const xmlText = await res.text();

    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    const parseErr = doc.getElementsByTagName('parsererror')[0];
    if (parseErr) throw new Error('XML parsererror: ' + parseErr.textContent?.trim());

    const atlasEl = doc.getElementsByTagName('TextureAtlas')[0];
    if (!atlasEl) throw new Error('TextureAtlas not found in XML: ' + xmlAbsUrl);

    const imagePathRaw = atlasEl.getAttribute('imagePath') ?? '';
    const imagePath = imagePathRaw.replace(/\\/g, '/');

    const imgUrl = new URL(imagePath || '.', xmlAbsUrl).toString();
    const atlasName = fileBaseName(imagePath) || fileBaseName(imgUrl);

    onStep?.('xml', { url: xmlAbsUrl, atlasName });

    const frames: Record<string, any> = {};
    const subs = atlasEl.getElementsByTagName('SubTexture');
    for (let i = 0; i < subs.length; i++) {
        const st = subs[i];
        const name = st.getAttribute('name')!;
        const x = +(st.getAttribute('x') ?? 0);
        const y = +(st.getAttribute('y') ?? 0);
        const w = +(st.getAttribute('width') ?? 0);
        const h = +(st.getAttribute('height') ?? 0);
        const rotated = (st.getAttribute('rotated') ?? 'false') === 'true';

        frames[name] = {
            frame: { x, y, w, h },
            rotated,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w, h },
            sourceSize: { w, h },
            pivot: { x: 0, y: 0 },
        };
    }

    const json = { frames, meta: { image: imgUrl, scale: '1' } };

    onStep?.('image', { url: xmlAbsUrl, atlasName });
    const baseTexture = await Assets.load(imgUrl);

    onStep?.('parse', { url: xmlAbsUrl, atlasName });
    const sheet = new Spritesheet(baseTexture, json);
    await sheet.parse();

    return { sheet, atlasName };
}

export async function preloadAtlases(xmlPathsOrUrls: string[], opts: PreloadOptions = {}) {
    const w = { xml: 1, image: 5, parse: 1, ...(opts.weights ?? {}) };
    const totalAtlases = xmlPathsOrUrls.length;
    const unitsPerAtlas = w.xml + w.image + w.parse;

    const absoluteXmlUrls = xmlPathsOrUrls.map(toAbsoluteWithBase);

    let doneUnits = 0;
    let completedAtlases = 0;

    const emit = (step: PreloadStep, url: string, atlasName?: string, addUnits = 0) => {
        doneUnits += addUnits;
        const percent = Math.min(100, Math.round((doneUnits / (unitsPerAtlas * totalAtlases)) * 100));
        opts.onProgress?.({ percent, completedAtlases, totalAtlases, step, url, atlasName });
    };

    for (const xmlAbsUrl of absoluteXmlUrls) {
        let currentAtlas: string | undefined;

        const onStep = (step: PreloadStep, ctx: { url: string; atlasName?: string }) => {
            if (ctx.atlasName) currentAtlas = ctx.atlasName;
            const add =
        step === 'xml' ? w.xml :
            step === 'image' ? w.image :
                step === 'parse' ? w.parse : 0;
            emit(step, ctx.url, currentAtlas, add);
        };

        const { sheet, atlasName } = await loadXmlToSpritesheet(xmlAbsUrl, onStep);

        for (const [name, tex] of Object.entries(sheet.textures)) {
            Assets.cache.set(name, tex);
            Assets.cache.set(`${atlasName}/${name}`, tex);
            if (typeof (Texture as any).addToCache === 'function') {
                (Texture as any).addToCache(tex, name);
                (Texture as any).addToCache(tex, `${atlasName}/${name}`);
            }
        }

        completedAtlases++;
        emit('done', xmlAbsUrl, atlasName, 0);
    }
}
