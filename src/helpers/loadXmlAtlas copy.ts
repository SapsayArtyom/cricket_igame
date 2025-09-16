/* eslint-disable @typescript-eslint/no-explicit-any */
// atlasLoader.v6.ts
import { Spritesheet, Texture } from 'pixi.js';
import { Assets } from '@pixi/assets';

export type PreloadStep = 'xml' | 'image' | 'parse' | 'done';

export interface ProgressInfo {
  percent: number;              // 0..100
  completedAtlases: number;
  totalAtlases: number;
  step: PreloadStep;
  url: string;                  // абсолютный URL XML
  atlasName?: string;           // имя png без расширения
}

export interface PreloadOptions {
  onProgress?: (p: ProgressInfo) => void;
  weights?: { xml: number; image: number; parse: number };
  /**
   * strict  — доверять пикселям из XML, падать при несоответствиях;
   * autoscale — если есть вылазание, автоматически подобрать scale по экстентам XML.
   * По умолчанию: 'autoscale'
   */
  mode?: 'strict' | 'autoscale';
}

/* ---------------- helpers ---------------- */

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

const flo = (n: number) => Math.floor(n);
const cei = (n: number) => Math.ceil(n);

/** Проверяем, что все фреймы укладываются в PNG */
function validateFramesFit(
    baseWidth: number,
    baseHeight: number,
    frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>
) {
    for (const [name, f] of Object.entries(frames)) {
        if (f.frame.x < 0 || f.frame.y < 0 || f.frame.w < 0 || f.frame.h < 0) {
            return { name, frame: f.frame, baseWidth, baseHeight };
        }
        if (f.frame.x + f.frame.w > baseWidth || f.frame.y + f.frame.h > baseHeight) {
            return { name, frame: f.frame, baseWidth, baseHeight };
        }
    }
    return null;
}

/** Построение frames с учётом rotation и scale, с корректной формой (orig) */
function buildFramesFromRaw(
    raws: { name: string; x: number; y: number; w: number; h: number; rotated: boolean }[],
    scaleX: number,
    scaleY: number
) {
  type FrameRec = {
    frame: { x: number; y: number; w: number; h: number };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  };

  const frames: Record<string, FrameRec> = {};

  for (const r of raws) {
      // v6: если rotated=true, frame.w/h ДОЛЖНЫ быть ПОСЛЕ свапа
      const fw = r.rotated ? r.h : r.w;
      const fh = r.rotated ? r.w : r.h;

      // масштабируем и аккуратно округляем:
      // позиции — вниз, размеры — вверх (чтобы не терять пиксели)
      const fx  = flo(r.x * scaleX);
      const fy  = flo(r.y * scaleY);
      const fwS = cei(fw  * scaleX);
      const fhS = cei(fh  * scaleY);

      // КРИТИЧНО: форма (orig) берётся уже после свапа!
      frames[r.name] = {
          frame: { x: fx, y: fy, w: fwS, h: fhS },
          rotated: r.rotated,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: fwS, h: fhS },
          sourceSize:       { w: fwS, h: fhS },
      };
  }

  return frames;
}

/* ---------------- core ---------------- */

async function loadXmlToSpritesheet(
    xmlAbsUrl: string,
    mode: 'strict' | 'autoscale',
    onStep?: (step: PreloadStep, ctx: { url: string; atlasName?: string }) => void
): Promise<{ sheet: Spritesheet; atlasName: string; imgUrl: string }> {
    onStep?.('xml', { url: xmlAbsUrl });

    // 1) XML
    const res = await fetch(xmlAbsUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch XML: ${res.status} ${res.statusText} @ ${xmlAbsUrl}`);
    const xmlText = await res.text();
    if (/<!DOCTYPE html>|<html[\s>]/i.test(xmlText)) {
        throw new Error(`Expected XML, got HTML at ${xmlAbsUrl}. Проверьте путь/BASE_URL/сервер.`);
    }

    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    const parseErr = doc.getElementsByTagName('parsererror')[0];
    if (parseErr) throw new Error('XML parsererror: ' + parseErr.textContent?.trim());

    const atlasEl = doc.getElementsByTagName('TextureAtlas')[0];
    if (!atlasEl) throw new Error('TextureAtlas not found in XML: ' + xmlAbsUrl);

    const imagePathRaw = atlasEl.getAttribute('imagePath') ?? '';
    const imagePath = imagePathRaw.replace(/\\/g, '/');

    // width/height из XML (могут отсутствовать)
    const xmlW = Number(atlasEl.getAttribute('width') ?? 0) || 0;
    const xmlH = Number(atlasEl.getAttribute('height') ?? 0) || 0;

    const imgUrl = new URL(imagePath || '.', xmlAbsUrl).toString();
    const atlasName = fileBaseName(imagePath) || fileBaseName(imgUrl);

    onStep?.('xml', { url: xmlAbsUrl, atlasName });

  // сырые сабтекстуры
  type RawSub = { name: string; x: number; y: number; w: number; h: number; rotated: boolean };
  const raws: RawSub[] = [];
  const subs = atlasEl.getElementsByTagName('SubTexture');
  for (let i = 0; i < subs.length; i++) {
      const st = subs[i];
      raws.push({
          name: st.getAttribute('name')!,
          x: +(st.getAttribute('x') ?? 0),
          y: +(st.getAttribute('y') ?? 0),
          w: +(st.getAttribute('width') ?? 0),
          h: +(st.getAttribute('height') ?? 0),
          rotated: (st.getAttribute('rotated') ?? 'false') === 'true',
      });
  }

  // 2) PNG
  onStep?.('image', { url: xmlAbsUrl, atlasName });
  const tex = (await Assets.load(imgUrl)) as Texture;
  const baseTexture = tex.baseTexture;
  const baseW = baseTexture.width;
  const baseH = baseTexture.height;

  // 3) начальные scaleX/scaleY
  // по умолчанию 1:1 — чаще всего XML и PNG совпадают
  let scaleX = 1;
  let scaleY = 1;

  // если у TextureAtlas есть width/height — используем их как «номинал»
  if (xmlW > 0 && xmlH > 0) {
      scaleX = baseW / xmlW;
      scaleY = baseH / xmlH;
  }

  // 4) соберём frames и проверим
  let frames = buildFramesFromRaw(raws, scaleX, scaleY);

  // кламп к границам (защита от округлений)
  for (const f of Object.values(frames)) {
      if (f.frame.x + f.frame.w > baseW) f.frame.w = Math.max(0, baseW - f.frame.x);
      if (f.frame.y + f.frame.h > baseH) f.frame.h = Math.max(0, baseH - f.frame.y);
  }

  let bad = validateFramesFit(baseW, baseH, frames);

  // 5) если вылезает и режим autoscale — подберём масштаб из экстентов XML
  if (bad && mode === 'autoscale') {
      let maxX = 0;
      let maxY = 0;
      for (const r of raws) {
          const ew = r.rotated ? r.h : r.w;
          const eh = r.rotated ? r.w : r.h;
          maxX = Math.max(maxX, r.x + ew);
          maxY = Math.max(maxY, r.y + eh);
      }
      const denomW = Math.max(xmlW || 0, maxX);
      const denomH = Math.max(xmlH || 0, maxY);
      scaleX = denomW > 0 ? baseW / denomW : 1;
      scaleY = denomH > 0 ? baseH / denomH : 1;

      frames = buildFramesFromRaw(raws, scaleX, scaleY);

      for (const f of Object.values(frames)) {
          if (f.frame.x + f.frame.w > baseW) f.frame.w = Math.max(0, baseW - f.frame.x);
          if (f.frame.y + f.frame.h > baseH) f.frame.h = Math.max(0, baseH - f.frame.y);
      }

      bad = validateFramesFit(baseW, baseH, frames);
  }

  if (bad) {
      const { name, frame, baseWidth, baseHeight } = bad;
      throw new Error(
          `Frame "${name}" не помещается в PNG ${imgUrl}.
frame: x=${frame.x}, y=${frame.y}, w=${frame.w}, h=${frame.h}
image size: ${baseWidth}x${baseHeight}
XML и PNG, возможно, не из одной пары (или требуется переэкспорт).`
      );
  }

  // 6) парсим спрайтшит (в meta у v6 только scale)
  onStep?.('parse', { url: xmlAbsUrl, atlasName });
  const data = { frames, meta: { scale: '1' } };
  const sheet = new Spritesheet(baseTexture, data as any);
  await sheet.parse();

  return { sheet, atlasName, imgUrl };
}

/* ---------------- public API ---------------- */

export async function preloadAtlases(xmlPathsOrUrls: string[], opts: PreloadOptions = {}) {
    const w = { xml: 1, image: 5, parse: 1, ...(opts.weights ?? {}) };
    const totalAtlases = xmlPathsOrUrls.length;
    if (totalAtlases === 0) return;

    const mode: 'strict' | 'autoscale' = opts.mode ?? 'autoscale';
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
            const add = step === 'xml' ? w.xml : step === 'image' ? w.image : step === 'parse' ? w.parse : 0;
            emit(step, ctx.url, currentAtlas, add);
        };

        const { sheet, atlasName } = await loadXmlToSpritesheet(xmlAbsUrl, mode, onStep);

        // регистрируем текстуры для Sprite.from(...)
        for (const [name, tex] of Object.entries(sheet.textures)) {
            Texture.addToCache(tex as Texture, name);
            Texture.addToCache(tex as Texture, `${atlasName}/${name}`);
            Assets.cache?.set?.(name, tex as Texture);
            Assets.cache?.set?.(`${atlasName}/${name}`, tex as Texture);
        }

        completedAtlases++;
        emit('done', xmlAbsUrl, atlasName, 0);
    }
}
