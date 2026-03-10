'use strict';

// --- URLs & audio ---
export const BACKGROUND_URL = 'assets/bg2.jpg';
export const LEVEL_START_AUDIO_URL = 'audio/music.mp3';
export const LEVEL_WIN_AUDIO_URL = 'audio/forza eagles.wav';
export const LEVEL_GAMEOVER_AUDIO_URL = 'audio/always look.wav';
export const LEVEL_MUSIC_URL = Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => [l, LEVEL_START_AUDIO_URL])
);
export const SILENT_AUDIO_URL = 'audio/500-milliseconds-of-silence.mp3';
export const UNLOCK_CODE_HASH = 'c2ec7d135a87450d338a774a9714488e29da62ef7e717ad01c4dd97b2d8ed45a';
export const SOUND_EAGLE_URL = 'assets/soundeffects/eagle.mp3';
export const SOUND_POOP_URL = 'assets/soundeffects/schijt1.mp3';
export const SOUND_BOM_URL = 'assets/soundeffects/bom.mp3';
export const SOUND_SPRAY_URL = 'assets/soundeffects/spray.mp3';

export const DEFAULT_VOLUME_MUSIC = 0.16;
export const DEFAULT_VOLUME_SFX = 0.41;
export const VOLUME_STORAGE_KEY_MUSIC = 'harley_vol_music';
export const VOLUME_STORAGE_KEY_SFX = 'harley_vol_sfx';

export function getStoredVolume(key, def) {
    try {
        const v = parseFloat(localStorage.getItem(key));
        if (!Number.isNaN(v)) return Math.max(0, Math.min(1, v));
    } catch (e) {}
    return def;
}

export const VIRTUAL_HEIGHT = 1080;
export const VIRTUAL_WIDTH = 1920;
export const MOBILE_MAX_CANVAS_WIDTH = 1280;
export const MOBILE_MAX_CANVAS_HEIGHT = 720;
export const MAX_DEVICE_PIXEL_RATIO = 2;
export const POINTS_TO_BOSS = 2500;
export const BASE_WORLD_SPEED = 6;
export const HIGH_SCORE_KEY = 'harley_high_score';
export const UNLOCK_ALL_LEVELS_KEY = 'harley_unlock_all_levels';

export function isDebugEnabled() {
    try {
        return localStorage.getItem(UNLOCK_ALL_LEVELS_KEY) === '1';
    } catch (e) {
        return false;
    }
}

// --- Game config ---
export const SNACKS = [
    { name: 'PATAT', weapon: 'POEPBOM', icon: '🍟', type: 'WEAPON' },
    { name: 'HAMBURGER', weapon: 'DIARREE', icon: '🍔', type: 'WEAPON' },
    { name: 'BIER', icon: '🍺', type: 'HEAL_SMALL' },
    { name: 'PIL', icon: '💊', type: 'HEAL_FULL' }
];

export const levelBossConfig = {
    1: ['boss0'],
    2: ['boss1'],
    3: ['boss2'],
    4: ['boss3'],
    5: ['boss4'],
    6: ['boss6', 'boss6', 'boss6'],
    7: ['boss5'],
    8: ['boss7'],
    9: ['boss8'],
    10: ['boss9']
};

export const SUP_NORMAL_BASE_SPEED = 8;
export const SUP_NORMAL_SPEED_RANGE = 4;
export const SUP_A_SPEED_MULT = 0.8;
export const SUP_B_SPEED_MULT = 0.79;
export const SUP_C_SPEED_MULT = 0.8;
export const SUP_D_SPEED_MULT = 1.25;
export const HOOLIGAN_BASE_SPEED = 4;
export const HOOLIGAN_SPEED_RANGE = 2;
export const HOOLIGAN_SPEEDMULT_MIN = 0.65;
export const HOOLIGAN_SPEEDMULT_MAX = 1.35;
export const HOOLIGAN_VX_WORLD_OFFSET = 6;
export const HOOLIGAN_CHANCE_LEVEL1 = 0.2;
export const HOOLIGAN_CHANCE_MAX = 0.85;
export const SUP_A_SPAWN_WEIGHT = 25;
export const SUP_B_SPAWN_WEIGHT = 25;
export const SUP_C_SPAWN_WEIGHT = 25;
export const SUP_D_SPAWN_WEIGHT = 25;

export const BOSS_CONFIG = {
    boss0: { width: 300, height: 350, scale: 1.8, speed: 2.5, downScale: 0.8, downOffset: 0, offset: 25, mirrorFlip: true, throwCount: 1, throwTimeToTarget: 80, throwHitChance: 0.5, throwDamage: 2 },
    boss1: { width: 375, height: 450, scale: 1.3, speed: 2.5, downScale: 1, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 6, throwTimeToTarget: 100, throwHitChance: 0.3, throwDamage: 1 },
    boss2: { width: 300, height: 400, scale: 1.4, speed: 2.5, downScale: 0.7, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 2, throwTimeToTarget: 60, throwHitChance: 0.7, throwDamage: 6 },
    boss3: { width: 350, height: 350, scale: 1.4, speed: 2.5, downScale: 0.7, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 1, throwTimeToTarget: 50, throwHitChance: 0.8, throwDamage: 6 },
    boss4: { width: 260, height: 420, scale: 1.4, speed: 2.5, downScale: 0.75, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 2, throwTimeToTarget: 55, throwHitChance: 0.7, throwDamage: 7 },
    boss5: { width: 250, height: 350, scale: 1.6, speed: 2.5, downScale: 0.8, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 1, throwTimeToTarget: 50, throwHitChance: 0.8, throwDamage: 8 },
    boss6: { width: 275, height: 380, scale: 1.2, speed: 2.5, downScale: 0.8, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 1, throwTimeToTarget: 50, throwHitChance: 0.65, throwDamage: 5 },
    boss7: { width: 320, height: 380, scale: 1.5, speed: 2.5, downScale: 0.85, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 4, throwTimeToTarget: 60, throwHitChance: 0.7, throwDamage: 6 },
    boss8: { width: 320, height: 400, scale: 1.5, speed: 2.5, downScale: 0.85, downOffset: 0, offset: 0, mirrorFlip: true, throwCount: 1, throwTimeToTarget: 55, throwHitChance: 0.75, throwDamage: 7 },
    boss9: { width: 360, height: 420, scale: 1.5, speed: 2.5, downScale: 0.85, downOffset: 0, offset: 0, mirrorFlip: false, throwCount: 3, throwTimeToTarget: 65, throwHitChance: 0.8, throwDamage: 8 }
};

const BOSS_CONFIG_DEFAULT = { width: 250, height: 350, scale: 1, speed: 2.5, downScale: 1, downOffset: 0, offset: 0, mirrorFlip: false, throwCount: 1, throwTimeToTarget: 50, throwHitChance: 0.7, throwDamage: 6 };
export function getBossConfig(type) {
    return BOSS_CONFIG[type] || BOSS_CONFIG_DEFAULT;
}

export const LEVEL_BG_KEYS = { 1: 'bg_level1', 2: 'bg_level2', 3: 'bg_level3', 4: 'bg_level4', 5: 'bg_level5', 6: 'bg_level5', 7: 'bg_level4', 8: 'bg_level3', 9: 'bg_level2', 10: 'bg_level1' };
export const LEVEL_ENDLESS_SCROLL = { 1: true, 2: true, 3: false, 4: false, 5: true, 6: false, 7: false, 8: false, 9: false, 10: true };
export const LEVEL_SCROLL_START_RIGHT = { 6: true, 7: true, 8: true, 9: true, 10: true };
export const LEVEL_ENDLESS_SCROLL_LEFT = { 10: true };
export const LEVEL_SCROLL_WAIT_MS = { 6: 1000 };
export const DEFAULT_SCROLL_WAIT_MS = 2200;

// --- Asset key arrays (for level loading & boss animations) ---
export const HOOLI_RUN_KEYS = ['hooliRun1', 'hooliRun2', 'hooliRun3', 'hooliRun4', 'hooliRun5'];
export const HOOLI_THROW_KEYS = ['hooliThrow1', 'hooliThrow2', 'hooliThrow3', 'hooliThrow4', 'hooliThrow5', 'hooliThrow6'];
export const CLOWN_LOOP_KEYS = [58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].map(n => 'clownLoop' + n);
export const CLOWN_THROW_KEYS = [19,20,21,22,23,24,25,26,27,31,32,33,34,40,55,56,57].map(n => 'clownThrow' + n);
export const CLOWN_DOWN_KEYS = ['clownDown1'].concat([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,27,31,32,33,34,35,36,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,58].map(n => 'clownDown' + n));
export const ZWOLF_RUN_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12].map(n => 'zwolfRun' + n);
export const ZWOLF_THROW_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(n => 'zwolfThrow' + n);
export const ZWOLF_DOWN_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33].map(n => 'zwolfDown' + n);
export const BOER_RUN_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12].map(n => 'boerRun' + n);
export const BOER_THROW_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => 'boerThrow' + n);
export const DOM_RUN_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(n => 'domRun' + n);
export const DOM_THROW_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n => 'domThrow' + n);
export const BRAM_RUN_KEYS = [1,2,3,4,5,6,7,8].map(n => 'bramRun' + n);
export const BRAM_SHOOT_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => 'bramShoot' + n);
export const PEPER_RUN_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12].map(n => 'peperRun' + n);
export const PEPER_THROW_KEYS = [13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29].map(n => 'peperThrow' + n);
export const ME_RUN_KEYS = [1,2,3,4,5,6,7,8,9,10].map(n => 'meRun' + n);
export const ME_THROW_KEYS = [1,2,3,4,5].map(n => 'meThrow' + n);
export const REFS_RUN_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => 'refsRun' + n);
export const REFS_THROW_KEYS = [1,2,3,4,5,6,7].map(n => 'refsThrow' + n);
export const SUPERHOOL_RUN_KEYS = [1,2,3,4,5,6,7,8,9].map(n => 'superhoolRun' + n);
export const SUPERHOOL_THROW_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => 'superhoolThrow' + n);
const EINDEIND_RUN_KEYS = [1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => 'eindeindRun' + n);
const EINDEIND_THROW_KEYS = [1,2,3,4,5,6,7,8,9,10,11,12].map(n => 'eindeindThrow' + n);

export const BOSS_ASSET_KEYS = {
    boss0: ['boss0', ...CLOWN_LOOP_KEYS, ...CLOWN_THROW_KEYS, ...CLOWN_DOWN_KEYS],
    boss1: [...ZWOLF_RUN_KEYS, ...ZWOLF_THROW_KEYS, ...ZWOLF_DOWN_KEYS],
    boss2: [...BOER_RUN_KEYS, ...BOER_THROW_KEYS, 'boss2Down'],
    boss3: [...BRAM_RUN_KEYS, ...BRAM_SHOOT_KEYS, 'boss3Down'],
    boss4: [...PEPER_RUN_KEYS, ...PEPER_THROW_KEYS, 'boss4Down'],
    boss5: [...DOM_RUN_KEYS, ...DOM_THROW_KEYS, 'boss5Eat', 'boss5Down'],
    boss6: [...ME_RUN_KEYS, ...ME_THROW_KEYS, 'boss6Down'],
    boss7: [...REFS_RUN_KEYS, ...REFS_THROW_KEYS, 'boss7Down'],
    boss8: [...SUPERHOOL_RUN_KEYS, ...SUPERHOOL_THROW_KEYS, 'boss8Down'],
    boss9: [...EINDEIND_RUN_KEYS, ...EINDEIND_THROW_KEYS, 'boss9Down']
};

export function getLevelAssetKeys(level) {
    const bgKey = LEVEL_BG_KEYS[level] || 'background';
    const bossTypes = levelBossConfig[level] || ['boss0'];
    const bossKeys = [...new Set(bossTypes.flatMap(t => BOSS_ASSET_KEYS[t] || []))];
    return [bgKey, ...bossKeys];
}

const _levelSpecificKeys = new Set();
for (let l = 1; l <= 10; l++) getLevelAssetKeys(l).forEach(k => _levelSpecificKeys.add(k));
export const LEVEL_SPECIFIC_KEYS = _levelSpecificKeys;

export const SUP_ARENT_KEYS = Array.from({ length: 72 }, (_, i) => 'supA' + (i + 1));
export const SUP_B_KEYS = Array.from({ length: 28 }, (_, i) => 'supB' + (i + 1));
export const SUP_C_KEYS = Array.from({ length: 10 }, (_, i) => 'supC' + (i + 1));
export const SUP_D_KEYS = ['groen1', 'groen2', 'groen3', 'groen4', 'groen5', 'groen6', 'groen7', 'groen8', 'groen9'];

export const SUP_A_SCALE_X = 4;
export const SUP_A_SCALE_Y = 1.9;
export const SUP_B_SCALE_X = 3.5;
export const SUP_B_SCALE_Y = 1.7;
export const SUP_C_SCALE_X = 3.6;
export const SUP_C_SCALE_Y = 1.8;
export const SUP_C_RUN_Y_OFFSET = 85;
export const SUP_D_SCALE_X = 1.7;
export const SUP_D_SCALE_Y = 1.2;
export const HOOLI_SCALE_X = 1.2;
export const HOOLI_SCALE_Y = 1.2;
export const SUP_A_HIT_SCALE_X = 1.35;
export const SUP_A_HIT_SCALE_Y = 1.35;
export const SUP_B_HIT_SCALE_X = 2.1;
export const SUP_B_HIT_SCALE_Y = 1.35;
export const SUP_C_HIT_SCALE_X = 2.0;
export const SUP_C_HIT_SCALE_Y = 1.8;
export const SUP_D_HIT_SCALE_X = 1.7;
export const SUP_D_HIT_SCALE_Y = 1.2;
export const HOOLI_HIT_SCALE_X = 1.6;
export const HOOLI_HIT_SCALE_Y = 1.2;

export const PROJECTILE_FONT_SIZE = {
    GLOVE: 56, BALL: 40, HAMBURGER: 52, FRIES: 60, BRICK: 44, STONE: 28, STICK: 36, DIAMOND: 40, TORCH: 44
};
export const BOSS_PROJECTILE_TYPE = {
    boss2: 'GLOVE', boss3: 'BALL', boss5: 'FRIES', boss6: 'STICK', boss7: 'DIAMOND', boss8: 'TORCH', boss9: 'FRIES',
    boss1: 'BRICK', boss4: 'BRICK'
};

export const GENERIC_BOSS_ANIM_KEYS = {
    boss2: { run: BOER_RUN_KEYS, throw: BOER_THROW_KEYS, down: 'boss2Down' },
    boss3: { run: BRAM_RUN_KEYS, throw: BRAM_SHOOT_KEYS, down: 'boss3Down' },
    boss4: { run: PEPER_RUN_KEYS, throw: PEPER_THROW_KEYS, down: 'boss4Down' },
    boss6: { run: ME_RUN_KEYS, throw: ME_THROW_KEYS, down: 'boss6Down' },
    boss7: { run: REFS_RUN_KEYS, throw: REFS_THROW_KEYS, down: 'boss7Down' },
    boss8: { run: SUPERHOOL_RUN_KEYS, throw: SUPERHOOL_THROW_KEYS, down: 'boss8Down' },
    boss9: { run: EINDEIND_RUN_KEYS, throw: EINDEIND_THROW_KEYS, down: 'boss9Down' }
};
export const SIMPLE_ANIM_BOSSES = new Set(['boss2','boss3','boss4','boss5','boss6','boss7','boss8','boss9']);

export const bossDownMap = { boss0: 'clownDown1', boss1: 'zwolfDown1', boss2: 'boss2Down', boss3: 'boss3Down', boss4: 'boss4Down', boss5: 'boss5Down', boss6: 'boss6Down', boss7: 'boss7Down', boss8: 'boss8Down', boss9: 'boss9Down' };
export const BOSS_NAMES = { boss0: 'Clown', boss1: 'Zwolfje', boss2: 'Diederik', boss3: 'Bram', boss4: 'Peperbus', boss5: 'Dominguez', boss6: 'ME', boss7: 'Refs', boss8: 'Super Hooligan', boss9: 'Eindeindbaas' };

export const FPS_HISTORY_LEN = 30;
export const FPS_LOW_THRESHOLD = 25;
export const FPS_RECOVER_THRESHOLD = 35;
export const LOW_FPS_FRAMES_TO_REDUCE = 10;
export const HIGH_FPS_FRAMES_TO_RECOVER = 30;
export const MAX_SPLATS_WHEN_REDUCED = 15;
