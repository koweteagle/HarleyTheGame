'use strict';

import { BACKGROUND_URL, getLevelAssetKeys, LEVEL_SPECIFIC_KEYS } from './config.js';

export const assets = {
        background: { src: BACKGROUND_URL, canvas: document.createElement('canvas'), loaded: false, label: 'Achtergrond' },
        bg_level1: { src: 'assets/bg_level1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Achtergrond level 1' },
        bg_level2: { src: 'assets/bg_level2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Achtergrond level 2' },
        bg_level3: { src: 'assets/bg_level3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Achtergrond level 3' },
        bg_level4: { src: 'assets/bg_level4.png', canvas: document.createElement('canvas'), loaded: false, label: 'Achtergrond level 4' },
        bg_level5: { src: 'assets/bg_level5.png', canvas: document.createElement('canvas'), loaded: false, label: 'Achtergrond level 5' },
        eagleIntro: { src: 'assets/eagle-intro.png', canvas: document.createElement('canvas'), loaded: false, label: 'Intro Adelaar' },
        eagle: { src: 'assets/eagle.png', canvas: document.createElement('canvas'), loaded: false, label: 'Adelaar' },
        eagleAnim1: { src: 'assets/eagle_animatie_1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Adelaar anim 1' },
        eagleAnim2: { src: 'assets/eagle_animatie_2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Adelaar anim 2' },
        eagleAnim3: { src: 'assets/eagle_animatie_3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Adelaar anim 3' },
        eagleAnim4: { src: 'assets/eagle_animatie_4.png', canvas: document.createElement('canvas'), loaded: false, label: 'Adelaar anim 4' },
        ...Object.fromEntries(Array.from({ length: 72 }, (_, i) => ['supA' + (i + 1), { src: `assets/supA/supA-${i + 1}.png`, canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run ' + (i + 1) }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(n => ['supB' + n, { src: encodeURI('assets/supB/clideo_editor_f51fd73e3cfa47e690fefe457e5e8273-' + n + ' (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Supporter B run ' + n }])),
        supBDown: { src: 'assets/supB/supBdown.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter B geraakt' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10].map(n => ['supC' + n, { src: encodeURI('assets/supC/Persoon_rent_en_is_volledig_in_beeld_zoom_o-' + n + ' (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run ' + n }])),
        supCDown: { src: 'assets/supC/supC_down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C geraakt' },
        normalHit: { src: 'assets/pecsup1lig_1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Geraakt 1' },
        groen1: { src: 'assets/supD/groen-1 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 1' },
        groen2: { src: 'assets/supD/groen-2 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 2' },
        groen3: { src: 'assets/supD/groen-3 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 3' },
        groen4: { src: 'assets/supD/groen-4 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 4' },
        groen5: { src: 'assets/supD/groen-5 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 5' },
        groen6: { src: 'assets/supD/groen-6 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 6' },
        groen7: { src: 'assets/supD/groen-7 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 7' },
        groen8: { src: 'assets/supD/groen-8 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 8' },
        groen9: { src: 'assets/supD/groen-9 (gesleept).png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D run 9' },
        supDDown: { src: 'assets/supD/groen_down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter D geraakt' },
        hooliRun1: { src: 'assets/hooligan/hooli1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan run 1' },
        hooliRun2: { src: 'assets/hooligan/hooli2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan run 2' },
        hooliRun3: { src: 'assets/hooligan/hooli3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan run 3' },
        hooliRun4: { src: 'assets/hooligan/hooli4.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan run 4' },
        hooliRun5: { src: 'assets/hooligan/hooli5.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan run 5' },
        hooliThrow1: { src: 'assets/hooligan/hooli1gooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan gooit 1' },
        hooliThrow2: { src: 'assets/hooligan/hooli2gooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan gooit 2' },
        hooliThrow3: { src: 'assets/hooligan/hooli3gooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan gooit 3' },
        hooliThrow4: { src: 'assets/hooligan/hooli4gooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan gooit 4' },
        hooliThrow5: { src: 'assets/hooligan/hooli5gooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan gooit 5' },
        hooliThrow6: { src: 'assets/hooligan/hooli6gooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Hooligan gooit 6' },
        hooliHit: { src: 'assets/hc_sup_down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Geraakt Hooli' },
        boss0: { src: encodeURI('assets/clown/clownloopt/clownog-58 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, name: 'Clown', label: 'Boss 0 (Clown)' },
        ...Object.fromEntries([58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].map(n => ['clownLoop' + n, { src: encodeURI(`assets/clown/clownloopt/clownog-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Clown loop ' + n }])),
        ...Object.fromEntries([19,20,21,22,23,24,25,26,27,31,32,33,34,40,55,56,57].map(n => ['clownThrow' + n, { src: encodeURI(`assets/clown/clowngooit/clownog-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Clown gooit ' + n }])),
        ...Object.fromEntries([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,27,31,32,33,34,35,36,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,58].map(n => ['clownDown' + n, { src: encodeURI(`assets/clown/clowndown/ezgif-189454d3ff861def-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Clown down ' + n }])),
        clownDown1: { src: encodeURI('assets/clown/clowndown/ezgif-189454d3ff861def-1 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Clown down 1' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12].map(n => ['zwolfRun' + n, { src: encodeURI(`assets/zwolfje/rennen/Laat_hem_bakstenen_omhoog_gooien (1)-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Zwolfje ren ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(n => ['zwolfThrow' + n, { src: encodeURI(`assets/zwolfje/gooien/Laat_hem_bakstenen_omhoog_gooien-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Zwolfje gooit ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33].map(n => ['zwolfDown' + n, { src: encodeURI(`assets/zwolfje/down/Hij_wordt_geraakt_door_vogelpoep_valt_op_de-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Zwolfje down ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12].map(n => ['boerRun' + n, { src: encodeURI(`assets/boer/loopt/boer gif-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Diederik loopt ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => ['boerThrow' + n, { src: encodeURI(`assets/boer/gooit/boer gif-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Diederik gooit ' + n }])),
        boss2: { src: encodeURI('assets/boer/loopt/boer gif-1 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, name: 'Diederik', label: 'Boss 2' },
        boss2Throw: { src: encodeURI('assets/boer/gooit/boer gif-1 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 2 Gooit' },
        boss2Down: { src: encodeURI('assets/boer/down/boer down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 2 Down' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8].map(n => ['bramRun' + n, { src: encodeURI(`assets/bram/rennen/bram gif basis-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Bram rent ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => ['bramShoot' + n, { src: encodeURI(`assets/bram/schieten/bram gif basis-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Bram schiet ' + n }])),
        boss3Down: { src: encodeURI('assets/bram/down/bram down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 3 Down' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12].map(n => ['peperRun' + n, { src: encodeURI(`assets/peperbus/lopen/ezgif-6450bd01d3ccea36-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Peperbus loopt ' + n }])),
        ...Object.fromEntries([13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29].map(n => ['peperThrow' + n, { src: encodeURI(`assets/peperbus/gooien/ezgif-6450bd01d3ccea36-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Peperbus gooit ' + n }])),
        boss4Down: { src: encodeURI('assets/peperbus/down/peperbus down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 4 Down' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(n => ['domRun' + n, { src: encodeURI(`assets/dom/loopt/dom gif-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Dominguez loopt ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n => ['domThrow' + n, { src: encodeURI(`assets/dom/gooit/dom gif-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Dominguez gooit ' + n }])),
        boss5: { src: encodeURI('assets/dom/loopt/dom gif-1 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, name: 'Dominguez', label: 'Boss 5' },
        boss5Throw: { src: encodeURI('assets/dom/gooit/dom gif-1 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 5 Gooit' },
        boss5Eat: { src: encodeURI('assets/dom/gooit/dom gif-10 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 5 Eet' },
        boss5Down: { src: encodeURI('assets/dom/down/dom down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 5 Down' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10].map(n => ['meRun' + n, { src: encodeURI(`assets/ME/lopen/ME basis gif-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'ME loopt ' + n }])),
        ...Object.fromEntries([1,2,3,4,5].map(n => ['meThrow' + n, { src: encodeURI(`assets/ME/gooien/ME basis gif-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'ME gooit ' + n }])),
        boss6Down: { src: encodeURI('assets/ME/down/ME down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 6 Down' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => ['refsRun' + n, { src: encodeURI(`assets/refs/loopt/Laat_ze_de_polonaise_lopen_naar_rechts_na_en-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Refs loopt ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7].map(n => ['refsThrow' + n, { src: encodeURI(`assets/refs/gooit/Laat_ze_de_polonaise_lopen_naar_rechts_na_en-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Refs gooit ' + n }])),
        boss7Down: { src: encodeURI('assets/refs/down/refs down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 7 Down' },
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9].map(n => ['superhoolRun' + n, { src: encodeURI(`assets/superhool/lopen/Laat_de_hooligan_boos_lopen_en_na_enkele_seco-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Super Hooligan loopt ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => ['superhoolThrow' + n, { src: encodeURI(`assets/superhool/gooien/Laat_hem_de_fakkel_met_kracht_naar_boven_gooi-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Super Hooligan gooit ' + n }])),
        boss8Down: { src: encodeURI('assets/superhool/down/superhool down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 8 Down' },
        ...Object.fromEntries([1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => ['eindeindRun' + n, { src: encodeURI(`assets/eindeindbaas/lopen/Laat_hem_naar_links_lopen_voor_5_seconden-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Eindeindbaas loopt ' + n }])),
        ...Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11,12].map(n => ['eindeindThrow' + n, { src: encodeURI(`assets/eindeindbaas/gooien/Laat_het_game_karakter_boos_naar_links_lopen-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Eindeindbaas gooit ' + n }])),
        boss9Down: { src: encodeURI('assets/eindeindbaas/down/eindeindbaas down.png'), canvas: document.createElement('canvas'), loaded: false, label: 'Boss 9 Down' }
};

const CORE_ASSET_KEYS = Object.keys(assets).filter(k => !LEVEL_SPECIFIC_KEYS.has(k));

function loadAsset(assetsObj, key, options, addFailedAsset) {
    const { onProgress, totalForProgress, timeoutMs = 60000, silentFail = false } = options;
    const item = assetsObj[key];
    if (!item || item.loaded) return Promise.resolve();
    return new Promise((resolve) => {
        const img = new Image();
        if (item.src.startsWith('http')) img.crossOrigin = 'anonymous';
        const silent = silentFail || key.startsWith('clownLoop') || key.startsWith('clownThrow') || key.startsWith('clownDown') || key.startsWith('zwolfRun') || key.startsWith('zwolfThrow') || key.startsWith('zwolfDown') || (/^supC\d+$/.test(key));
        const timeout = setTimeout(() => {
            item.loaded = false;
            if (!silent && addFailedAsset) addFailedAsset(item.label);
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        }, timeoutMs);
        img.onload = () => {
            clearTimeout(timeout);
            try {
                const maxSize = 2048;
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    const scale = maxSize / Math.max(w, h);
                    w = Math.round(w * scale);
                    h = Math.round(h * scale);
                }
                item.canvas.width = w;
                item.canvas.height = h;
                const aCtx = item.canvas.getContext('2d');
                aCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
                item.loaded = true;
            } catch (e) {
                item.loaded = false;
                if (!silent && addFailedAsset) addFailedAsset(item.label);
            }
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        };
        img.onerror = () => {
            clearTimeout(timeout);
            item.loaded = false;
            if (!silent && addFailedAsset) addFailedAsset(item.label);
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        };
        img.src = item.src;
    });
}

async function loadAssets(assetsObj, keys, options, addFailedAsset) {
    const toLoad = keys.filter(k => assetsObj[k] && !assetsObj[k].loaded);
    if (toLoad.length === 0) return;
    const { onProgressUpdate, onLevelProgress } = options || {};
    const total = toLoad.length;
    let done = 0;
    const onProgress = (k, t) => {
        done++;
        if (onProgressUpdate) onProgressUpdate(done, total);
        if (onLevelProgress) onLevelProgress(done, total);
    };
    const promises = toLoad.map(k =>
        loadAsset(
            assetsObj,
            k,
            {
                ...options,
                onProgress,
                totalForProgress: total,
                timeoutMs: options?.timeoutMs ?? 60000
            },
            addFailedAsset
        )
    );
    await Promise.all(promises);
}

export async function preloadCore(hooks) {
    const CORE_KEYS = CORE_ASSET_KEYS;
    const total = CORE_KEYS.length;
    const { updateLoadingBar, addFailedAsset, els, bgImg, onComplete } = hooks || {};
    try {
        if (updateLoadingBar) updateLoadingBar(0, total || 1);
        await loadAssets(assets, CORE_KEYS, {
            timeoutMs: 20000,
            silentFail: true,
            onProgressUpdate: (done, _total) => {
                if (updateLoadingBar) updateLoadingBar(done, total || 1);
            }
        }, addFailedAsset);
        const loadedCount = CORE_KEYS.filter(k => assets[k] && assets[k].loaded).length;
        if (updateLoadingBar) updateLoadingBar(loadedCount, total || 1);
    } catch (e) {
        console.error('Fout tijdens preloadCore:', e);
    } finally {
        if (bgImg && assets.background && assets.background.loaded) bgImg.src = assets.background.src;
        if (els && els.loadingText) els.loadingText.style.display = 'none';
        if (els && els.startBtn) els.startBtn.disabled = false;
        if (onComplete) onComplete();
    }
}

export async function loadLevelAssets(level, hooks) {
    const keys = getLevelAssetKeys(level);
    const toLoad = keys.filter(k => assets[k] && !assets[k].loaded);
    if (toLoad.length === 0) return;
    const { els, updateLevelProgress, addFailedAsset } = hooks || {};
    if (els && els.levelLoadingOverlay) {
        els.levelLoadingOverlay.style.display = 'flex';
        if (updateLevelProgress) updateLevelProgress(level, 0, toLoad.length);
    }
    await loadAssets(assets, toLoad, {
        timeoutMs: 30000,
        silentFail: true,
        onLevelProgress: (d, total) => {
            if (updateLevelProgress) updateLevelProgress(level, d, total);
        }
    }, addFailedAsset);
    if (els && els.levelLoadingOverlay) {
        if (updateLevelProgress) updateLevelProgress(level, toLoad.length, toLoad.length);
        els.levelLoadingOverlay.style.display = 'none';
    }
}
