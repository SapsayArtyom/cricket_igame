/* eslint-disable @typescript-eslint/no-explicit-any */
// loader/spineLoader.ts
// Pixi v6 + pixi-spine 3.x
import * as PIXI from 'pixi.js';
import { Spine as SpineCtor } from 'pixi-spine';  // берём конструктор явно
import type { Spine } from 'pixi-spine';

// (опционально, но полезно: гарантируем, что .atlas читается как текст)
PIXI.LoaderResource.setExtensionXhrType(
    'atlas',
    PIXI.LoaderResource.XHR_RESPONSE_TYPE.TEXT
);

export type SpineEntry = { alias: string; json: string };
export type Progress = { percent: number; loaded: number; total: number; alias?: string };

class SpineCache {
    private _spineData = new Map<string, any>();

    private k(bundle: string | undefined, alias: string) {
        return bundle ? `${bundle}/${alias}` : alias;
    }

    set(bundle: string | undefined, alias: string, data: any) {
        this._spineData.set(this.k(bundle, alias), data);
    }

    getSpineData(bundleOrKey: string, alias?: string) {
        const key = alias ? this.k(bundleOrKey, alias) : bundleOrKey;
        return this._spineData.get(key) ?? null;
    }

    /** Возвращаем именно Spine, не Container */
    createSpine(bundleOrKey: string, alias?: string): Spine {
        const key = alias ? this.k(bundleOrKey, alias) : bundleOrKey;
        const data = this._spineData.get(key);
        if (!data) {
            throw new Error(`Spine data not found in cache for "${key}"`);
        }
        return new SpineCtor(data) as Spine;
    }
}

export const spineCache = new SpineCache();

/**
 * Загружает ТОЛЬКО spine .json файлы.
 * Плагин pixi-spine сам подтянет .atlas и страницы.
 *
 * @param bundleName  префикс ключа в кеше (опционально)
 * @param list        [{ alias, json }, ...]
 * @param onProgress  колбэк прогресса (0..100)
 */
export function loadSpineJSONs(
    bundleName: string | undefined,
    list: SpineEntry[],
    onProgress?: (p: Progress) => void
): Promise<void> {
    const loader = new PIXI.Loader();
    list.forEach(({ alias, json }) => loader.add(alias, json));

    const total = list.length;
    let loaded = 0;

    return new Promise<void>((resolve, reject) => {
        loader.onProgress.add((ldr) => {
            onProgress?.({ percent: ldr.progress, loaded, total });
        });

        loader.onLoad.add((_ldr, res) => {
            loaded++;
            // если pixi-spine подмешан — тут уже будет res.spineData (SkeletonData)
            const data = (res as any).spineData;
            if (data) spineCache.set(bundleName, res.name, data);

            onProgress?.({
                percent: Math.min(100, _ldr.progress ?? (loaded / total) * 100),
                loaded,
                total,
                alias: res.name,
            });
        });

        loader.onError.add((err, _ldr, res) => {
            reject(new Error(`Loader error for "${res?.name ?? 'unknown'}": ${err?.message || err}`));
        });

        loader.load((_, res) => {
            if (!(res.skeleton as any)?.spineData) {
                throw new Error('spineData is missing. Did you import "pixi-spine" BEFORE loading?');
            }
            onProgress?.({ percent: 100, loaded: total, total });
            resolve();
        });
    });
}
