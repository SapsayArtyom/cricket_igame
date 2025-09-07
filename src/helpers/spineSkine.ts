/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/spineSkin37.ts
import type { Spine } from "pixi-spine";
import type { Skeleton, Skin } from '@pixi-spine/runtime-3.7';

/** Имена всех скинов */
export function getSkinNames(spine: Spine): string[] {
    const sk = spine.skeleton as unknown as Skeleton;
    console.log('getSkinNames sk', spine.skeleton);
	
    // В 3.7 SkeletonData.skins — массив { name, ... }
    return sk.data.skins.map((s: Skin & { name: string }) => s.name);
}

/** Смена скина по имени c сохранением текущей анимации */
export function setSkinByName(spine: Spine, skinName: string, opts?: { resetSlots?: boolean; keepAnimation?: boolean }) {
    const { resetSlots = true, keepAnimation = true } = opts ?? {};
    const sk = spine.skeleton as unknown as Skeleton;

    const tracks = keepAnimation ? snapshotTracks(spine) : null;

    const skin = sk.data.skins.find((s: Skin & { name: string }) => s.name === skinName);
    if (!skin) {
        console.warn(`[Spine 3.7] Skin "${skinName}" not found`);
        return false;
    }
    sk.setSkinByName(skinName);

    if (resetSlots) sk.setSlotsToSetupPose();
    spine.state.apply(sk);
    spine.update(0);

    if (tracks) restoreTracks(spine, tracks);
    return true;
}

/** Комбинированный скин из нескольких скинов (3.7) */
export function setCombinedSkin(spine: Spine, skinNames: string[], combinedName = '__combo__', opts?: { resetSlots?: boolean; keepAnimation?: boolean }) {
    const { resetSlots = true, keepAnimation = true } = opts ?? {};
    const sk = spine.skeleton as unknown as Skeleton;
    const data = sk.data;

    // В 3.7 есть класс Skin и метод addSkin
    const SkinCtor = (data.defaultSkin as unknown as Skin).constructor as new (name: string) => Skin & { addSkin?: (s: Skin) => void };
    const combo = new SkinCtor(combinedName);

    for (const name of skinNames) {
        const part = (data as any).findSkin?.(name) as Skin | undefined;
        if (!part) {
            console.warn(`[Spine 3.7] Skin "${name}" not found, skip`);
            continue;
        }
        if (typeof (combo as any).addSkin === 'function') {
            (combo as any).addSkin(part);
        } else {
            // редкий fallback для сборок без addSkin:
            // перенос всех прикреплений из part в combo
            copySkinAttachments(combo, part, data);
        }
    }

    const tracks = keepAnimation ? snapshotTracks(spine) : null;

    sk.setSkin(null);
    sk.setSkin(combo as unknown as Skin);
    if (resetSlots) sk.setSlotsToSetupPose();

    spine.state.apply(sk);
    spine.update(0);

    if (tracks) restoreTracks(spine, tracks);
}

/** Копирование аттачей, если нет addSkin (редкий случай) */
function copySkinAttachments(target: any, source: any, data: any) {
    const slots = data.slots || [];
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
        const attachments = (source.attachments && source.attachments[slotIndex]) || null;
        if (!attachments) continue;
        for (const name in attachments) {
            const att = attachments[name];
            target.addAttachment?.(slotIndex, name, att);
        }
    }
}

/** Снимок текущих треков */
function snapshotTracks(spine: Spine) {
    const entries: Array<{ index: number; name: string; loop: boolean; trackTime: number; timeScale: number }> = [];
    for (let i = 0; i < 8; i++) {
        const e = spine.state.getCurrent(i as any);
        if (!e?.animation) continue;
        entries.push({
            index: i,
            name: e.animation.name,
            loop: !!e.loop,
            trackTime: e.trackTime ?? 0,
            timeScale: e.timeScale ?? 1,
        });
    }
    return entries;
}

/** Восстановление треков */
function restoreTracks(spine: Spine, entries: ReturnType<typeof snapshotTracks>) {
    spine.state.clearTracks();
    for (const e of entries) {
        const entry = spine.state.setAnimation(e.index as any, e.name, e.loop);
        if (entry) {
            entry.trackTime = e.trackTime;
            entry.timeScale = e.timeScale;
        }
    }
    spine.state.apply(spine.skeleton as any);
    spine.update(0);
}
