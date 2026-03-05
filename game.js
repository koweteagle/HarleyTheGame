(() => {
'use strict';

// --- 1. CONFIGURATIE ---
const BACKGROUND_URL = 'assets/bg2.jpg';
const LEVEL_START_AUDIO_URL = 'audio/music.mp3';
const LEVEL_WIN_AUDIO_URL = 'audio/forza eagles.wav';
const LEVEL_GAMEOVER_AUDIO_URL = 'audio/always look.wav';
const VIRTUAL_HEIGHT = 1080;
const VIRTUAL_WIDTH = 1920;
const POINTS_TO_BOSS = 2500;
const BASE_WORLD_SPEED = 6;
const HIGH_SCORE_KEY = 'harley_high_score';

const IS_DEBUG = new URLSearchParams(window.location.search).has('debug');

// Cache DOM elements (avoid repeated getElementById in hot paths)
const els = {
    bossHealthBar: document.getElementById('boss-health-bar'),
    bossHealthContainer: document.getElementById('boss-health-container'),
    bossSummaryContainer: document.getElementById('boss-summary-container'),
    closeInfoBtn: document.getElementById('close-info-btn'),
    debugPanel: document.getElementById('debug-panel'),
    failedAssetsContainer: document.getElementById('failed-assets-container'),
    finalScore: document.getElementById('final-score'),
    fireBtn: document.getElementById('fire-btn'),
    gameOverScreen: document.getElementById('game-over-screen'),
    gameContainer: document.getElementById('game-container'),
    healthBar: document.getElementById('health-bar'),
    healthContainer: document.getElementById('health-container'),
    infoBtn: document.getElementById('info-btn'),
    infoModal: document.getElementById('info-modal'),
    iosLaterBtn: document.getElementById('ios-later-btn'),
    iosModal: document.getElementById('ios-modal'),
    joystickContainer: document.getElementById('joystick-container'),
    joystickKnob: document.getElementById('joystick-knob'),
    levelText: document.getElementById('level-text'),
    levelUpScreen: document.getElementById('level-up-screen'),
    levelUpText: document.getElementById('level-up-text'),
    loadingText: document.getElementById('loading-text'),
    restartBtn: document.getElementById('restart-btn'),
    scoreText: document.getElementById('score-text'),
    startBtn: document.getElementById('start-btn'),
    startScreen: document.getElementById('start-screen'),
    continueBtn: document.getElementById('continue-btn'),
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');
const bgImg = new Image(); 
   
const levelAudio = new Audio(LEVEL_START_AUDIO_URL);
levelAudio.loop = true;
const winAudio = new Audio(LEVEL_WIN_AUDIO_URL);
const gameOverAudio = new Audio(LEVEL_GAMEOVER_AUDIO_URL); 

// --- 2. STATE ---
let gameScale = 1;
let lastTime = 0;
let gameActive = false;
let animationFrameId = null;

let joystickActive = false;
const keys = {};

let currentLevel = 1;
let score = 0;
let levelScoreStart = 0;
let worldStep = 0;
let bossActive = false;
   
let poops = [];
let splats = [];
let targets = [];
let powerUps = [];
let beerGlasses = [];
let activeBosses = [];

const player = {
    x: 100, y: 150, width: 240, height: 100, speed: 15, dx: 0, dy: 0,
    hp: 100, hitFlash: 0, isDead: false, fallSpeed: 0, facing: 1,
    activeWeapons: { 'DIARREE': 0, 'POEPBOM': 0 }, shootCooldown: 0
};

const weaponButtons = {
    'DIARREE': document.getElementById('btn-DIARREE'),
    'POEPBOM': document.getElementById('btn-POEPBOM')
};

const SNACKS = [
    { name: 'PATAT', weapon: 'POEPBOM', icon: '🍟', type: 'WEAPON' },
    { name: 'HAMBURGER', weapon: 'DIARREE', icon: '🍔', type: 'WEAPON' },
    { name: 'BIER', icon: '🍺', type: 'HEAL_SMALL' },
    { name: 'PIL', icon: '💊', type: 'HEAL_FULL' }
];

const levelBossConfig = {
    1: ['boss0'],
    2: ['boss1'], 3: ['boss2'], 4: ['boss3'], 5: ['boss4'],
    6: ['boss3','boss4'], 7: ['boss1','boss2'], 8: ['boss1','boss2','boss4'],
    9: ['boss1','boss4','boss3'], 10: ['boss2','boss3','boss4'], 11: ['boss1','boss2','boss3','boss4']
};

// --- Snelheid-instellingen (makkelijk aanpasbaar) ---
// Normale supporters (A, C en D)
const SUP_NORMAL_BASE_SPEED = 8;      // basissnelheid
const SUP_NORMAL_SPEED_RANGE = 4;     // extra random snelheid (0..range)
const SUP_A_SPEED_MULT = 0.8;         // factor voor supporter A (variant 1)
const SUP_C_SPEED_MULT = 1.0;         // factor voor supporter C (variant 3)
const SUP_D_SPEED_MULT = 1.25;        // factor voor supporter D (variant 4) – iets sneller

// Hooligans
const HOOLIGAN_BASE_SPEED = 4;        // basissnelheid
const HOOLIGAN_SPEED_RANGE = 2;       // extra random snelheid (0..range)
const HOOLIGAN_SPEEDMULT_MIN = 0.65;  // minimale individuele multiplier
const HOOLIGAN_SPEEDMULT_MAX = 1.35;  // maximale individuele multiplier
const HOOLIGAN_VX_WORLD_OFFSET = 6;   // extra t.o.v. BASE_WORLD_SPEED voor vx

// Eindbazen: per type alle instellingen op één plek (hoogte, grootte, snelheid, etc.)
const BOSS_CONFIG = {
    boss0: { width: 250, height: 350, scale: 1.7, speed: 2.5, downOffset: 45, mirrorFlip: true },
    boss1: { width: 250, height: 350, scale: 1,   speed: 2.5, downOffset: 45, mirrorFlip: false },
    boss2: { width: 250, height: 350, scale: 1,   speed: 2.5, downOffset: 45, mirrorFlip: false },
    boss3: { width: 250, height: 350, scale: 1,   speed: 2.5, downOffset: 45, mirrorFlip: false },
    boss4: { width: 250, height: 350, scale: 1,   speed: 2.5, downOffset: 45, mirrorFlip: false }
};
function getBossConfig(type) {
    return BOSS_CONFIG[type] || { width: 250, height: 350, scale: 1, speed: 2.5, downOffset: 45, mirrorFlip: false };
}

// --- Spawn-verhoudingen (makkelijk aanpasbaar) ---
// Normaal vs hooligan: L1 = 80% normaal / 20% hooligan; hoger level = meer hooligans
const HOOLIGAN_CHANCE_LEVEL1 = 0.2;   // kans hooligan op level 1 (0.2 = 20% hooligan, 80% normaal)
const HOOLIGAN_CHANCE_MAX = 0.85;     // max kans hooligan op hogere levels
// Verhouding onder normale supporters: gewichten A : C : D (bijv. 80 : 20 : 20 → ~67% A, ~17% C, ~17% D)
const SUP_A_SPAWN_WEIGHT = 33;
const SUP_C_SPAWN_WEIGHT = 34;
const SUP_D_SPAWN_WEIGHT = 33;

const LEVEL_BG_KEYS = { 1: 'bg_level1', 2: 'bg_level2', 3: 'bg_level3', 4: 'bg_level4', 5: 'bg_level5', 6: 'bg_level4', 7: 'bg_level3', 8: 'bg_level2', 9: 'bg_level1', 10: 'background', 11: 'background' };

const assets = {
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
    supA1: { src: 'assets/supA/supA-1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 1' },
    supA2: { src: 'assets/supA/supA-2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 2' },
    supA3: { src: 'assets/supA/supA-3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 3' },
    supA4: { src: 'assets/supA/supA-4.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 4' },
    supA5: { src: 'assets/supA/supA-5.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 5' },
    supA6: { src: 'assets/supA/supA-6.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 6' },
    supA7: { src: 'assets/supA/supA-7.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 7' },
    supA8: { src: 'assets/supA/supA-8.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 8' },
    supA9: { src: 'assets/supA/supA-9.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 9' },
    supA10: { src: 'assets/supA/supA-10.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 10' },
    supA11: { src: 'assets/supA/supA-11.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 11' },
    supA12: { src: 'assets/supA/supA-12.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 12' },
    supA13: { src: 'assets/supA/supA-13.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 13' },
    supA14: { src: 'assets/supA/supA-14.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 14' },
    supA15: { src: 'assets/supA/supA-15.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 15' },
    supA16: { src: 'assets/supA/supA-16.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 16' },
    supA17: { src: 'assets/supA/supA-17.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 17' },
    supA18: { src: 'assets/supA/supA-18.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 18' },
    supA19: { src: 'assets/supA/supA-19.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 19' },
    supA20: { src: 'assets/supA/supA-20.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 20' },
    supA21: { src: 'assets/supA/supA-21.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 21' },
    supA22: { src: 'assets/supA/supA-22.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 22' },
    supA23: { src: 'assets/supA/supA-23.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 23' },
    supA24: { src: 'assets/supA/supA-24.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 24' },
    supA25: { src: 'assets/supA/supA-25.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 25' },
    supA26: { src: 'assets/supA/supA-26.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 26' },
    supA27: { src: 'assets/supA/supA-27.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 27' },
    supA28: { src: 'assets/supA/supA-28.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 28' },
    supA29: { src: 'assets/supA/supA-29.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 29' },
    supA30: { src: 'assets/supA/supA-30.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 30' },
    supA31: { src: 'assets/supA/supA-31.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 31' },
    supA32: { src: 'assets/supA/supA-32.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 32' },
    supA33: { src: 'assets/supA/supA-33.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 33' },
    supA34: { src: 'assets/supA/supA-34.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 34' },
    supA35: { src: 'assets/supA/supA-35.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 35' },
    supA36: { src: 'assets/supA/supA-36.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 36' },
    supA37: { src: 'assets/supA/supA-37.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 37' },
    supA38: { src: 'assets/supA/supA-38.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 38' },
    supA39: { src: 'assets/supA/supA-39.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 39' },
    supA40: { src: 'assets/supA/supA-40.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 40' },
    supA41: { src: 'assets/supA/supA-41.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 41' },
    supA42: { src: 'assets/supA/supA-42.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 42' },
    supA43: { src: 'assets/supA/supA-43.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 43' },
    supA44: { src: 'assets/supA/supA-44.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 44' },
    supA45: { src: 'assets/supA/supA-45.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 45' },
    supA46: { src: 'assets/supA/supA-46.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 46' },
    supA47: { src: 'assets/supA/supA-47.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 47' },
    supA48: { src: 'assets/supA/supA-48.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 48' },
    supA49: { src: 'assets/supA/supA-49.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 49' },
    supA50: { src: 'assets/supA/supA-50.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 50' },
    supA51: { src: 'assets/supA/supA-51.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 51' },
    supA52: { src: 'assets/supA/supA-52.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 52' },
    supA53: { src: 'assets/supA/supA-53.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 53' },
    supA54: { src: 'assets/supA/supA-54.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 54' },
    supA55: { src: 'assets/supA/supA-55.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 55' },
    supA56: { src: 'assets/supA/supA-56.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 56' },
    supA57: { src: 'assets/supA/supA-57.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 57' },
    supA58: { src: 'assets/supA/supA-58.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 58' },
    supA59: { src: 'assets/supA/supA-59.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 59' },
    supA60: { src: 'assets/supA/supA-60.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 60' },
    supA61: { src: 'assets/supA/supA-61.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 61' },
    supA62: { src: 'assets/supA/supA-62.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 62' },
    supA63: { src: 'assets/supA/supA-63.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 63' },
    supA64: { src: 'assets/supA/supA-64.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 64' },
    supA65: { src: 'assets/supA/supA-65.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 65' },
    supA66: { src: 'assets/supA/supA-66.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 66' },
    supA67: { src: 'assets/supA/supA-67.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 67' },
    supA68: { src: 'assets/supA/supA-68.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 68' },
    supA69: { src: 'assets/supA/supA-69.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 69' },
    supA70: { src: 'assets/supA/supA-70.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 70' },
    supA71: { src: 'assets/supA/supA-71.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 71' },
    supA72: { src: 'assets/supA/supA-72.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter A run 72' },
    supC1: { src: 'assets/supC/supC1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run 1' },
    supC2: { src: 'assets/supC/supC2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run 2' },
    supC3: { src: 'assets/supC/supC3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run 3' },
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

    // Hooligan: assets/hooligan — ren hooli1–5, gooi hooli1gooit–hooli6gooit
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
    hooliHit:   { src: 'assets/hc_sup_down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Geraakt Hooli' },

    boss0: { src: encodeURI('assets/clown/clownloopt/clownog-58 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, name: "Clown", label: 'Boss 0 (Clown)' },
    ...Object.fromEntries([58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].map(n => ['clownLoop' + n, { src: encodeURI(`assets/clown/clownloopt/clownog-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Clown loop ' + n }])),
    ...Object.fromEntries([19,20,21,22,23,24,25,26,27,31,32,33,34,40,55,56,57].map(n => ['clownThrow' + n, { src: encodeURI(`assets/clown/clowngooit/clownog-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Clown gooit ' + n }])),
    ...Object.fromEntries([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,27,31,32,33,34,35,36,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,58,59,60].map(n => ['clownDown' + n, { src: encodeURI(`assets/clown/clowndown/ezgif-189454d3ff861def-${n} (gesleept).png`), canvas: document.createElement('canvas'), loaded: false, label: 'Clown down ' + n }])),
    clownDown1: { src: encodeURI('assets/clown/clowndown/ezgif-189454d3ff861def-1 (gesleept).png'), canvas: document.createElement('canvas'), loaded: false, label: 'Clown down 1' },
    boss1: { src: 'assets/masc_rent.png', canvas: document.createElement('canvas'), loaded: false, name: "Zwolfje", label: 'Boss 1' },
    boss1Throw: { src: 'assets/zwolfgooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 1 Gooit' },
    boss1Down: { src: 'assets/zwolfje_down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 1 Down' },
    boss2: { src: 'assets/boer1.png', canvas: document.createElement('canvas'), loaded: false, name: "Diederik", label: 'Boss 2' },
    boss2Throw: { src: 'assets/diedgooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 2 Gooit' },
    boss2Down: { src: 'assets/boer down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 2 Down' },
    boss3: { src: 'assets/bram1.png', canvas: document.createElement('canvas'), loaded: false, name: "Bram", label: 'Boss 3' },
    boss3Throw: { src: 'assets/bram schiet.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 3 Schiet' },
    boss3Down: { src: 'assets/bram2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 3 Down' },
    boss4: { src: 'assets/dom1.png', canvas: document.createElement('canvas'), loaded: false, name: "Dominguez", label: 'Boss 4' },
    boss4Throw: { src: 'assets/domgooit.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 4 Gooit' },
    boss4Eat: { src: 'assets/domeet.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 4 Eet' },
    boss4Down: { src: 'assets/dom2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Boss 4 Down' }
};

const HOOLI_RUN_KEYS = ['hooliRun1', 'hooliRun2', 'hooliRun3', 'hooliRun4', 'hooliRun5'];
const HOOLI_THROW_KEYS = ['hooliThrow1', 'hooliThrow2', 'hooliThrow3', 'hooliThrow4', 'hooliThrow5', 'hooliThrow6'];
const CLOWN_LOOP_KEYS = [58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80].map(n => 'clownLoop' + n);
const CLOWN_THROW_KEYS = [19,20,21,22,23,24,25,26,27,31,32,33,34,40,55,56,57].map(n => 'clownThrow' + n);
const CLOWN_DOWN_KEYS = ['clownDown1'].concat([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,27,31,32,33,34,35,36,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,56,58,59,60].map(n => 'clownDown' + n));
const SUP_ARENT_KEYS = Array.from({ length: 72 }, (_, i) => 'supA' + (i + 1));
const SUP_C_KEYS = ['supC1', 'supC2', 'supC3'];
const SUP_D_KEYS = ['groen1', 'groen2', 'groen3', 'groen4', 'groen5', 'groen6', 'groen7', 'groen8', 'groen9'];

// --- Grootte/schaal per type (1 = standaard, <1 kleiner, >1 groter) ---
const SUP_A_SCALE_X = 4;
const SUP_A_SCALE_Y = 1.9;
const SUP_C_SCALE_X = 1.2;
const SUP_C_SCALE_Y = 1.2;
const SUP_D_SCALE_X = 1.7;
const SUP_D_SCALE_Y = 1.2; 
const HOOLI_SCALE_X = 1.2;
const HOOLI_SCALE_Y = 1.2;

// --- Schaal geraakt-/down-afbeelding (aparte X,Y per type) ---
const SUP_A_HIT_SCALE_X = 1.35;
const SUP_A_HIT_SCALE_Y = 1.35;
const SUP_C_HIT_SCALE_X = 2.0;
const SUP_C_HIT_SCALE_Y = 1.8;
const SUP_D_HIT_SCALE_X = 1.7;
const SUP_D_HIT_SCALE_Y = 1.2;
const HOOLI_HIT_SCALE_X = 1.6;
const HOOLI_HIT_SCALE_Y = 1.2;

const bossDownMap = { boss0: 'clownDown1', boss1: 'boss1Down', boss2: 'boss2Down', boss3: 'boss3Down', boss4: 'boss4Down' };

// Level-specifieke assets: per level de bg + alle bazen van dat level
const BOSS_ASSET_KEYS = {
    boss0: ['boss0', ...CLOWN_LOOP_KEYS, ...CLOWN_THROW_KEYS, ...CLOWN_DOWN_KEYS],
    boss1: ['boss1', 'boss1Throw', 'boss1Down'],
    boss2: ['boss2', 'boss2Throw', 'boss2Down'],
    boss3: ['boss3', 'boss3Throw', 'boss3Down'],
    boss4: ['boss4', 'boss4Throw', 'boss4Eat', 'boss4Down']
};

function getLevelAssetKeys(level) {
    const bgKey = LEVEL_BG_KEYS[level] || 'background';
    const bossTypes = levelBossConfig[level] || ['boss0'];
    const bossKeys = [...new Set(bossTypes.flatMap(t => BOSS_ASSET_KEYS[t] || []))];
    return [bgKey, ...bossKeys];
}

const LEVEL_SPECIFIC_KEYS = new Set();
for (let l = 1; l <= 11; l++) getLevelAssetKeys(l).forEach(k => LEVEL_SPECIFIC_KEYS.add(k));

const CORE_ASSET_KEYS = Object.keys(assets).filter(k => !LEVEL_SPECIFIC_KEYS.has(k));

function loadAsset(key, options = {}) {
    const { onProgress, totalForProgress, timeoutMs = 60000, silentFail = false } = options;
    const item = assets[key];
    if (!item || item.loaded) return Promise.resolve();
    return new Promise((resolve) => {
        const img = new Image();
        if (item.src.startsWith('http')) img.crossOrigin = 'anonymous';
        const silent = silentFail || key.startsWith('clownLoop') || key.startsWith('clownThrow') || key.startsWith('clownDown');
        const timeout = setTimeout(() => {
            item.loaded = false;
            if (!silent) addFailedAsset(item.label);
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
                if (!silent) addFailedAsset(item.label);
            }
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        };
        img.onerror = () => {
            clearTimeout(timeout);
            item.loaded = false;
            if (!silent) addFailedAsset(item.label);
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        };
        img.src = item.src;
    });
}

async function loadAssets(keys, options = {}) {
    const toLoad = keys.filter(k => assets[k] && !assets[k].loaded);
    if (toLoad.length === 0) return;
    const total = toLoad.length;
    let done = 0;
    const onProgress = (k, t) => {
        done++;
        if (options.updateLoadingBar && t != null) updateLoadingBar(done, t);
    };
    const promises = toLoad.map(k => loadAsset(k, { ...options, onProgress, totalForProgress: total, timeoutMs: options.timeoutMs ?? 60000 }));
    await Promise.all(promises);
}

async function preloadCore() {
    const total = CORE_ASSET_KEYS.length;
    let loadedCount = 0;
    updateLoadingBar(0, total);
    await loadAssets(CORE_ASSET_KEYS, {
        updateLoadingBar: true,
        timeoutMs: 15000
    });
    loadedCount = CORE_ASSET_KEYS.filter(k => assets[k] && assets[k].loaded).length;
    updateLoadingBar(loadedCount, total);
    if (assets.background && assets.background.loaded) bgImg.src = assets.background.src;
    if (els.loadingText) els.loadingText.style.display = 'none';
    if (els.startBtn) els.startBtn.disabled = false;
}

async function loadLevelAssets(level) {
    const keys = getLevelAssetKeys(level);
    const toLoad = keys.filter(k => assets[k] && !assets[k].loaded);
    if (toLoad.length === 0) return;
    if (els.loadingText) {
        els.loadingText.style.display = 'block';
        els.loadingText.innerText = `Level ${level} laden...`;
    }
    await loadAssets(keys, { timeoutMs: 60000, silentFail: true });
    if (els.loadingText) els.loadingText.style.display = 'none';
}

async function preload() {
    await preloadCore();
}

function checkIOS() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;
    if (isIOS && !isStandalone && els.iosModal) els.iosModal.style.display = 'flex';
}

function initDebugUI() {
    if (!IS_DEBUG && els.debugPanel) els.debugPanel.style.display = 'none';
}

function openExternalUrl(url) {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function initExternalLinks() {
    document.querySelectorAll('[data-open-url]').forEach((el) => {
        const url = el.getAttribute('data-open-url');
        el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            openExternalUrl(url);
        }, { passive: false });
        el.addEventListener('click', (e) => {
            if (Date.now() - lastTouchTs < 600) return;
            e.preventDefault();
            openExternalUrl(url);
        });
    });
}

function addFailedAsset(label) {
    const container = els.failedAssetsContainer;
    if (container) {
        if (container.innerHTML === "") container.innerHTML = "<strong>Fout bij laden van:</strong><br>";
        const span = document.createElement('span'); 
        span.innerText = "✖ " + label + " "; 
        container.appendChild(span);
    }
}

function updateLoadingBar(current, total) {
    const pct = Math.floor((current / total) * 100);
    if (els.loadingText) els.loadingText.innerText = `Laden... ${pct}%`;
}

function triggerHealVisual() {
    const hb = els.healthContainer;
    if (hb) { hb.classList.remove('heal-animate'); void hb.offsetWidth; hb.classList.add('heal-animate'); }
}

function spawnBoss() {
    bossActive = true;
    const screenRight = (canvas.width / gameScale);
    const cfg = levelBossConfig[currentLevel] || ['boss0'];

    // Bepaal lane-centers binnen het zichtbare gebied
    const visibleWidth = canvas.width / gameScale;
    const leftMargin = 150;                        // beetje van links af blijven
    const rightMargin = 300;                       // ruimte rechts ivm baasbreedte
    const leftX = leftMargin;
    const rightX = visibleWidth - rightMargin;

    const laneCount = cfg.length;
    const laneCenters = cfg.map((_, i) => {
        if (laneCount === 1) {
            // Één baas: midden
            return (leftX + rightX) / 2;
        }
        // Meerdere bazen: gelijkmatig tussen leftX en rightX
        const t = i / (laneCount - 1);             // 0..1
        return leftX + t * (rightX - leftX);
    });

    activeBosses = cfg.map((t, i) => {
        const bc = getBossConfig(t);
        return {
        type: t,
        x: screenRight + 100 + (i * 350),
        y: 680,
        width: bc.width,
        height: bc.height,
        hp: (25 + currentLevel * 5) / (cfg.length * 0.8),
        maxHp: (25 + currentLevel * 5) / (cfg.length * 0.8),
        speed: bc.speed,
        currentVx: -bc.speed,
        vxTimer: 0,
        isHit: false,
        hitFlash: 0,
        throwTimer: 45 + (i * 15),
        throwVisualTimer: 0,
        eatVisualTimer: 0,
        throwFlip: false,
        moveFlip: false,
        moveFlipTimer: 0,

        laneIndex: i,
        targetX: laneCenters[i],
        ...(t === 'boss0' ? { animTime: 0, downAnimTime: 0 } : {})
    };
    });

    if (els.bossHealthContainer) els.bossHealthContainer.style.display = 'block';
    updateBossUI();
}

function showLevelUp() {
    gameActive = false; levelAudio.pause(); levelAudio.currentTime = 0;
    winAudio.play().catch(() => {});
    const cfg = levelBossConfig[currentLevel];
    if (els.levelUpText) els.levelUpText.innerText = cfg.map(c => assets[c].name).join(" en ") + " verslagen.";
    const container = els.bossSummaryContainer;
    if (container) container.innerHTML = '';
    cfg.forEach(c => {
        if (!container) return;
        const img = document.createElement('img');
        img.src = assets[bossDownMap[c]]?.src || assets[c].src;
        img.className = 'boss-summary-img';
        container.appendChild(img);
    });
    if (els.levelUpScreen) els.levelUpScreen.style.display = 'flex';
}

function resize() { 
    canvas.width = window.innerWidth; canvas.height = window.innerHeight; 
    gameScale = Math.max(0.1, canvas.height / VIRTUAL_HEIGHT);
}

async function requestLandscape() {
    try {
        const container = els.gameContainer || document.getElementById('game-container');
        if (container.requestFullscreen) await container.requestFullscreen();
        else if (container.webkitRequestFullscreen) await container.webkitRequestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape').catch(() => {});
    } catch (e) {}
}

function drawTinted(spriteCanvas, x, y, w, h, flash) {
    if(!spriteCanvas || !spriteCanvas.width) return;
    ctx.drawImage(spriteCanvas, x, y, w, h);
    if(flash > 0) {
        tintCanvas.width = spriteCanvas.width; tintCanvas.height = spriteCanvas.height;
        tintCtx.clearRect(0, 0, tintCanvas.width, tintCanvas.height);
        tintCtx.drawImage(spriteCanvas, 0, 0);
        tintCtx.globalCompositeOperation = 'source-in';
        tintCtx.fillStyle = `rgba(255, 0, 0, ${0.4 + (flash/25)})`;
        tintCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height);
        tintCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tintCanvas, x, y, w, h);
    }
}

function createSplat(x, y, radius, type) {
    const particles = type === 'BOMB' ? 40 : 15;
    for (let i = 0; i < particles; i++) {
        splats.push({ x: x, y: y, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 8 - 2, radius: Math.random() * (radius/3) + 2, life: 1.0, decay: 0.025 });
    }
}

function executePoop(type) {
    if(!gameActive || player.isDead) return;
    const px = player.x + 110, py = player.y + 80;
    if(type === 'DIARREE') {
        for(let i=0; i<4; i++) setTimeout(() => poops.push({ x: px, y: py, radius: 8, speedY: 18, speedX: (i-1.5)*4, type:'NORMAL' }), i * 60);
    } else if(type === 'POEPBOM') {
        poops.push({ x: px, y: py, radius: 30, speedY: 9, speedX: 0, type:'BOMB' });
    } else {
        poops.push({ x: px, y: py, radius: 12, speedY: 15, speedX: 0, type:'NORMAL' });
    }
}

window.triggerSpecial = (type) => { if (player.activeWeapons[type] > 0) executePoop(type); };

function updateBossUI() {
    const total = activeBosses.reduce((s, b) => s + Math.max(0, b.hp), 0);
    const max = activeBosses.reduce((s, b) => s + b.maxHp, 0);
    const bar = els.bossHealthBar;
    if (bar) bar.style.width = (total / (max||1) * 100) + '%';
}

function resetGame() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    player.hp = 100; player.x = 100; player.y = 150; player.isDead = false; player.hitFlash = 0; player.shootCooldown = 0;
    player.activeWeapons = { 'DIARREE': 0, 'POEPBOM': 0 };
    poops = []; splats = []; targets = []; powerUps = []; beerGlasses = []; activeBosses = [];
    bossActive = false; worldStep = 0; gameActive = true;
    if (els.healthBar) els.healthBar.style.width = '100%';
    if (els.bossHealthContainer) els.bossHealthContainer.style.display = 'none';
    if (els.gameOverScreen) els.gameOverScreen.style.display = 'none';
    if (els.levelUpScreen) els.levelUpScreen.style.display = 'none';
    ['DIARREE', 'POEPBOM'].forEach(k => {
        const btn = weaponButtons[k];
        if(btn) { btn.classList.remove('active'); btn.querySelector('.timer-overlay').style.height = '0%'; }
    });
    winAudio.pause(); winAudio.currentTime = 0;
    gameOverAudio.pause(); gameOverAudio.currentTime = 0;
    if (levelAudio.paused) levelAudio.play().catch(() => {});
}

function getHighScore() {
    const s = localStorage.getItem(HIGH_SCORE_KEY);
    return s !== null ? Math.max(0, parseInt(s, 10)) : 0;
}
function setHighScore(score) {
    const current = getHighScore();
    if (score > current) {
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
        return score;
    }
    return current;
}

function update(dt) {
    if(!gameActive) return;
    if(player.hitFlash > 0) player.hitFlash--;
    activeBosses.forEach(b => { if (b.hitFlash > 0) b.hitFlash--; });
    if(player.isDead) {
        player.fallSpeed += 0.5; player.y += player.fallSpeed;
        if(player.y > VIRTUAL_HEIGHT) { 
            gameActive = false; 
            levelAudio.pause(); 
            levelAudio.currentTime = 0;
            gameOverAudio.play().catch(() => {});

            if (els.finalScore) els.finalScore.innerText = score;

            const newHigh = setHighScore(score);
            const highEl = document.getElementById('high-score-value');
            if (highEl) highEl.innerText = newHigh;
            // Optioneel: alleen de regel tonen als er ooit een score is opgeslagen
            const lineEl = document.getElementById('high-score-line');
            if (lineEl) lineEl.style.display = 'block';

            if (els.gameOverScreen) els.gameOverScreen.style.display = 'flex';
        }
        return;
    }
    if(!joystickActive) {
        if(keys['KeyW'] || keys['ArrowUp']) player.dy = -player.speed; else if(keys['KeyS'] || keys['ArrowDown']) player.dy = player.speed; else player.dy = 0;
        if(keys['KeyA'] || keys['ArrowLeft']) { player.dx = -player.speed; player.facing = -1; } else if(keys['KeyD'] || keys['ArrowRight']) { player.dx = player.speed; player.facing = 1; } else player.dx = 0;
        if(keys['Space'] && player.shootCooldown <= 0) { executePoop('NORMAL'); player.shootCooldown = 15; }
    }
    if(player.shootCooldown > 0) player.shootCooldown--;
    let worldSpeedFactor = (player.dx < 0) ? 0.3 : 1.0;
    const allBossesDefeated = activeBosses.length > 0 && activeBosses.every(b => b.isHit);
    let currentEffectiveWorldSpeed = (bossActive && !allBossesDefeated) ? 0 : BASE_WORLD_SPEED * worldSpeedFactor;
    worldStep += currentEffectiveWorldSpeed;
    player.x = Math.max(-50, Math.min((canvas.width/gameScale) - 100, player.x + player.dx));
    player.y = Math.max(-20, Math.min(VIRTUAL_HEIGHT / 1.8, player.y + player.dy));
    if (els.scoreText) els.scoreText.innerText = score;
    if (els.levelText) els.levelText.innerText = currentLevel;
    const sec = dt / 1000;
    Object.keys(player.activeWeapons).forEach(k => {
        if(player.activeWeapons[k] > 0) {
            player.activeWeapons[k] -= sec;
            let btn = weaponButtons[k];
            if(btn) { btn.classList.add('active'); btn.querySelector('.timer-overlay').style.height = (player.activeWeapons[k] / 8 * 100) + '%'; if(player.activeWeapons[k] <= 0) btn.classList.remove('active'); }
        }
    });
    if(Math.random() < 0.012 && powerUps.length < 5) {
        let isBossPhase = bossActive && !allBossesDefeated;
        let snackRoll = Math.random();
        let selectedSnack = snackRoll < 0.3? SNACKS[0] : (snackRoll < 0.6? SNACKS[1] : (snackRoll < 0.9? SNACKS[2] : SNACKS[3]));
        if (isBossPhase) powerUps.push({ x: Math.random() * ((canvas.width / gameScale) - 200) + 100, y: 100 + Math.random() * 500, type: selectedSnack, speed: 0, lifespan: 450, floatPhase: Math.random() * Math.PI * 2 });
        else powerUps.push({ x: (canvas.width / gameScale) + 50, y: 100 + Math.random() * 500, type: selectedSnack, speed: 5, floatPhase: Math.random() * Math.PI * 2 });
    }
    for(let i=powerUps.length-1; i>=0; i--) {
        const p = powerUps[i]; p.x -= (p.speed + currentEffectiveWorldSpeed);
        if (p.lifespan !== undefined) { p.lifespan--; if (p.lifespan <= 0) { powerUps.splice(i, 1); continue; } }
        if(Math.sqrt((p.x-(player.x + 120))**2 + (p.y-(player.y+50))**2) < 90) {
            if (p.type.type === 'WEAPON') player.activeWeapons[p.type.weapon] = 8;
            else if (p.type.type === 'HEAL_SMALL') { player.hp = Math.min(100, player.hp + 20); triggerHealVisual(); }
            else if (p.type.type === 'HEAL_FULL') { player.hp = 100; triggerHealVisual(); }
            if (els.healthBar) els.healthBar.style.width = player.hp + '%';
            powerUps.splice(i,1);
        } else if(p.x < -100) powerUps.splice(i,1);
    }
    for(let i=beerGlasses.length-1; i>=0; i--) {
        const bg = beerGlasses[i]; bg.x += bg.vx; bg.y += bg.vy; bg.vy += 0.45; bg.x -= currentEffectiveWorldSpeed;
        if(bg.y > VIRTUAL_HEIGHT) { beerGlasses.splice(i,1); continue; }
        if(bg.x > player.x && bg.x < player.x+player.width && bg.y > player.y && bg.y < player.y+player.height) {
            player.hp -= (5 + (currentLevel-1)*2); player.hitFlash = 15; beerGlasses.splice(i, 1);
            if (els.healthBar) els.healthBar.style.width = Math.max(0, player.hp)+'%';
            if(player.hp <= 0) player.isDead = true;
        }
    }
    for(let i=poops.length-1; i>=0; i--) {
        const p = poops[i]; p.y += p.speedY; p.x += p.speedX;
        if(p.y > VIRTUAL_HEIGHT - 65) {
            createSplat(p.x, VIRTUAL_HEIGHT - 50, p.radius, p.type);
            if(p.type === 'BOMB') {
                targets.forEach(t => { if(!t.isHit && Math.abs(p.x-t.x) < 250) { t.isHit = true; t.hitTime = Date.now(); score += 200; }});
                activeBosses.forEach(b => { if(!b.isHit && Math.abs(p.x-b.x) < 250) { b.hp -= 4; b.hitFlash = 15; updateBossUI(); }});
            }
            poops.splice(i, 1); continue;
        }
        let hit = false;
        for(let t of targets) if(!t.isHit && p.x > t.x && p.x < t.x+130 && p.y > VIRTUAL_HEIGHT-250) { t.isHit = true; t.hitTime = Date.now(); score += 100; hit = true; break; }
        if(!hit) {
            for(let b of activeBosses) {
                if(!b.isHit && p.x > b.x && p.x < b.x+b.width && p.y > b.y && p.y < b.y+b.height) { b.hp -= 1; b.hitFlash = 15; updateBossUI(); hit = true; if(b.hp <= 0) { b.isHit = true; score += 1000; if(activeBosses.every(x=>x.isHit)) setTimeout(showLevelUp, 1500); } break; }
            }
        }
        if(hit) poops.splice(i, 1);
    }
    // Spawn supporters / hooligans: verhouding instelbaar via HOOLIGAN_CHANCE_* en SUP_*_SPAWN_WEIGHT
    if (!bossActive && targets.length < 5 && Math.random() < 0.04) {
        const spawnY = VIRTUAL_HEIGHT - 200;
        const hooliganChance = Math.min(HOOLIGAN_CHANCE_MAX, HOOLIGAN_CHANCE_LEVEL1 + (currentLevel - 1) * ((HOOLIGAN_CHANCE_MAX - HOOLIGAN_CHANCE_LEVEL1) / 10));
        const isHooligan = Math.random() < hooliganChance;

        if (isHooligan) {
            // Hooligans: verschillende ren-snelheden onderling (instelbaar via HOOLIGAN_* constanten)
            const speedMult = HOOLIGAN_SPEEDMULT_MIN + Math.random() * (HOOLIGAN_SPEEDMULT_MAX - HOOLIGAN_SPEEDMULT_MIN);
            targets.push({
                type: 'hooligan',
                x: -160,
                y: spawnY,
                speed: HOOLIGAN_BASE_SPEED + Math.random() * HOOLIGAN_SPEED_RANGE,
                speedMult,
                vx: (BASE_WORLD_SPEED + HOOLIGAN_VX_WORLD_OFFSET) * speedMult,
                wanderTimer: 0,
                isHit: false,
                variant: 1,
                hitTime: 0,
                throwTimer: 0,
                facing: 1,
                turnPhase: 0,
                turning: false,
                animTime: Math.random() * 8,
                animSpeed: (0.08 + Math.random() * 0.06) * speedMult  // ren-animatie in pas met loopsnelheid
            });
        } else {
            // Normale supporters: gewogen keuze A (1), C (3), D (4) via SUP_*_SPAWN_WEIGHT
            const totalWeight = SUP_A_SPAWN_WEIGHT + SUP_C_SPAWN_WEIGHT + SUP_D_SPAWN_WEIGHT;
            const r = Math.random() * totalWeight;
            const variant = r < SUP_A_SPAWN_WEIGHT ? 1 : r < SUP_A_SPAWN_WEIGHT + SUP_C_SPAWN_WEIGHT ? 3 : 4;
            const baseSpeed = SUP_NORMAL_BASE_SPEED + Math.random() * SUP_NORMAL_SPEED_RANGE;
            const speedMult =
                variant === 1 ? SUP_A_SPEED_MULT :
                variant === 3 ? SUP_C_SPEED_MULT :
                SUP_D_SPEED_MULT;
            targets.push({
                type: 'normal',
                x: -160,
                y: spawnY,
                speed: baseSpeed * speedMult,
                isHit: false,
                variant,
                hitTime: 0,
                throwTimer: 0,
                ...((variant === 1 || variant === 3 || variant === 4) && { animTime: Math.random() * (variant === 3 ? 3 : variant === 4 ? 9 : 72), animSpeed: variant === 3 ? 0.08 : variant === 4 ? 0.12 : 0.2 })
            });
        }
    }

    // Beweging supporters / hooligans
    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];

        if (!t.isHit) {
            if (t.type === 'normal') {
                // Normale supporters: lopen links → rechts
                t.x += t.speed;                  // eigen loopsnelheid naar rechts
                t.x -= currentEffectiveWorldSpeed; // wereld schuift naar links
                // Supporter A (1), C (3) en D/groen (4): run-animatie door frames
                if (t.variant === 1 || t.variant === 3 || t.variant === 4) t.animTime = (t.animTime || 0) + (t.animSpeed ?? 0.12);

            } else if (t.type === 'hooligan') {
                // Hooligans: random links/rechts bewegen, plus wereld‑scroll
                t.wanderTimer = (t.wanderTimer || 0) - 1;
                if (t.wanderTimer <= 0) {
                    const base = BASE_WORLD_SPEED + 4;
                    const range = 4;
                    const dir = Math.random() < 0.5 ? -1 : 1;
                    const speedMult = t.speedMult ?? 1;
                    t.vx = dir * (base + Math.random() * range) * speedMult;
                    t.wanderTimer = 40 + Math.random() * 60;
                }
            
                // Richting bepalen o.b.v. vx
                const desiredFacing = (t.vx || 0) >= 0 ? 1 : -1;
            
                // Start draai-animatie wanneer hij van richting wisselt
                if (!t.turning && desiredFacing !== (t.facing || 1)) {
                    t.turning = true;
                    t.turnPhase = 0;        // 0 .. 1
                    t.facing = desiredFacing;
                }
            
                // Draai-animatie updaten
                if (t.turning) {
                    const TURN_FRAMES = 10;                 // duur van de draai
                    t.turnPhase += 1 / TURN_FRAMES;
                    if (t.turnPhase >= 1) {
                        t.turnPhase = 1;
                        t.turning = false;
                    }
                }
            
                // Gooien (jouw bestaande code)
                if (t.throwTimer > 0) t.throwTimer--;
                if (t.throwTimer <= 0 && Math.random() < 0.015) {
                    t.throwTimer = 100;
                    beerGlasses.push({
                        x: t.x + 50,
                        y: VIRTUAL_HEIGHT - 150,
                        vx: (player.x - t.x) * 0.018,
                        vy: -22 - (Math.random() * 5),
                        type: 'STONE'
                    });
                }
            
                // Positie updaten
                t.x += (t.vx || 0);
                t.x -= currentEffectiveWorldSpeed;
            
                // Binnen marge laten stuiteren (zoals je al doet)
                const leftLimit = -200;
                const rightLimit = (canvas.width / gameScale) + 200;
                if (t.x < leftLimit) {
                    t.x = leftLimit;
                    t.vx = Math.abs(t.vx || 0);
                } else if (t.x > rightLimit) {
                    t.x = rightLimit;
                    t.vx = -Math.abs(t.vx || 0);
                }
            t.animTime += t.animSpeed;
            }
        } else {
            // Geraakte targets blijven op de grond en schuiven mee met de wereld
            t.x -= currentEffectiveWorldSpeed;
        }

        // Opruimen
        if (t.isHit && Date.now() - t.hitTime > 3000) {
            targets.splice(i, 1);
        } else if (t.x < -600 || t.x > (canvas.width / gameScale) + 600) {
            targets.splice(i, 1);
        }
    }
    activeBosses.forEach((b) => {
        // Wereld scrollt naar links
        b.x -= currentEffectiveWorldSpeed;
    
        if (!b.isHit) {
            if (b.throwVisualTimer > 0) b.throwVisualTimer--;
            if (b.eatVisualTimer > 0) b.eatVisualTimer--;
    
            // Bepaal horizontale snelheid richting targetX
            const targetX = b.targetX ?? (canvas.width / gameScale) / 2;
            const dx = targetX - b.x;
    
            // Kleine dode zone rond target zodat ze niet zenuwachtig worden
            const deadZone = 40;
    
            b.vxTimer--;
            if (b.vxTimer <= 0) {
                if (Math.abs(dx) > deadZone) {
                    // Loop gericht naar target, met een beetje willekeur
                    const dir = dx > 0 ? 1 : -1;
                    const base = b.speed * 1.5;                // iets sneller dan standaard
                    const jitter = (Math.random() - 0.5) * b.speed;
                    b.currentVx = dir * base + jitter;
                } else {
                    // In de buurt van target: kleine heen-en-weer shuffle
                    b.currentVx = (Math.random() - 0.5) * b.speed;
                }
                b.vxTimer = 40 + Math.random() * 80;
            }
    
            // Horizontale beweging toepassen
            b.x += b.currentVx;
    
            // Binnen de grenzen van het scherm blijven
            const minX = 50;
            const maxX = (canvas.width / gameScale) - 300;
            if (b.x < minX) {
                b.x = minX;
                b.currentVx = Math.abs(b.currentVx);
            } else if (b.x > maxX) {
                b.x = maxX;
                b.currentVx = -Math.abs(b.currentVx);
            }
    
            // Gooilogica blijft hetzelfde
            if (b.throwTimer > 0) b.throwTimer--;
            if (b.throwTimer <= 0) {
                b.throwTimer = 110;
                if (b.type === 'boss4' && Math.random() < 0.3) b.eatVisualTimer = 45;
                else b.throwVisualTimer = 35;
    
                let pt = b.type === 'boss2'
                    ? 'GLOVE'
                    : (b.type === 'boss3'
                        ? 'BALL'
                        : (b.type === 'boss4' ? 'HAMBURGER' : 'STONE'));
    
                if (!b.eatVisualTimer || b.eatVisualTimer <= 0) {
                    beerGlasses.push({
                        x: b.x + 100,
                        y: b.y + 100,
                        vx: (player.x - b.x) * 0.02,
                        vy: -25 - (Math.random() * 5),
                        type: pt
                    });
                }
            }
        }
        // Clown (boss0) animatietijd voor loop / down; eenmaal down blijft op laatste frame liggen
        if (b.type === 'boss0') {
            if (b.isHit) {
                const maxDown = CLOWN_DOWN_KEYS.length;
                b.downAnimTime = Math.min((b.downAnimTime || 0) + 0.6, maxDown);
            } else {
                b.animTime = (b.animTime || 0) + 0.25;
            }
        }
    });
    for(let i=splats.length-1; i>=0; i--) { const s = splats[i]; s.x -= currentEffectiveWorldSpeed; s.y += s.vy; s.vy += 0.5; if(s.y > VIRTUAL_HEIGHT-50) { s.y = VIRTUAL_HEIGHT-50; s.vy = 0; } s.life -= s.decay; if(s.life <= 0) splats.splice(i,1); }
    if(!bossActive && (score - levelScoreStart) >= POINTS_TO_BOSS) spawnBoss();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(gameScale, gameScale);
    const bgKey = LEVEL_BG_KEYS[currentLevel] || 'background';
    const bgAsset = assets[bgKey];
    if (bgAsset && bgAsset.loaded) {
        const dw = VIRTUAL_HEIGHT * (bgAsset.canvas.width / bgAsset.canvas.height);
        const sx = (worldStep * 0.5) % dw;
        ctx.drawImage(bgAsset.canvas, -sx, 0, dw, VIRTUAL_HEIGHT);
        ctx.drawImage(bgAsset.canvas, dw - sx, 0, dw, VIRTUAL_HEIGHT);
    }
    for (let t of targets) {
        const isHooligan = t.type === 'hooligan';
        const halfW = isHooligan ? 75 : 65;
        const fullH = isHooligan ? 200 : 195;
    
        // Basis-facing voor normale supporters: altijd naar rechts kijken
        const baseFacing = isHooligan ? (t.facing || 1) : 1;
    
        // Omdraai-animatie: schaal in X van 1 → 0 → -1
        let scaleX = baseFacing;
        if (isHooligan && t.turning) {
            // 0..1
            const p = t.turnPhase || 0;
            // cos-curve: 1 → 0 → -1 over π rad
            const twist = Math.cos(p * Math.PI);
            scaleX = baseFacing * twist;
            // Let op: rond het midden (p≈0.5) is de sprite heel smal → lijkt alsof hij zijwaarts draait
        }
    
        ctx.save();
    
        // Teken rond het midden van de sprite
        const hitYOffset = (t.isHit && t.variant === 3) ? 125 : (t.isHit && (t.variant === 1 || t.variant === 4)) ? 65 : (t.isHit ? 28 : 0);  // supA/supC/supD op stoep, supC lager
        ctx.translate(t.x + halfW, VIRTUAL_HEIGHT - 50 + hitYOffset);
    
        // Spiegelen
        ctx.scale(scaleX, 1);
    
        let sk;

        if (t.isHit) {
            sk = isHooligan
                ? 'hooliHit'
                : (t.variant === 4 ? 'supDDown' : t.variant === 3 ? 'supCDown' : 'normalHit');
        } else {
            if (isHooligan) {
                if (t.throwTimer > 70) {
                    const throwFrame = Math.min(5, Math.floor((100 - t.throwTimer) / 5));
                    sk = HOOLI_THROW_KEYS[throwFrame];
                } else {
                    const frameIndex = Math.floor(t.animTime || 0) % HOOLI_RUN_KEYS.length;
                    sk = HOOLI_RUN_KEYS[frameIndex];
                }
            } else {
                const runKeys = t.variant === 4 ? SUP_D_KEYS : t.variant === 3 ? SUP_C_KEYS : SUP_ARENT_KEYS;
                sk = runKeys[Math.floor(t.animTime || 0) % runKeys.length];
            }
        }
    
        // Fallback: als gekozen sup A-frame niet geladen is, gebruik een ander geladen sup A-frame
        let drawSk = sk;
        if (!assets[sk].loaded && SUP_ARENT_KEYS.includes(sk)) {
            drawSk = SUP_ARENT_KEYS.find(k => assets[k].loaded) || sk;
        }
        if (assets[drawSk].loaded) {
            let sizeScaleX = 1, sizeScaleY = 1;
            if (drawSk === 'normalHit') {
                sizeScaleX = SUP_A_HIT_SCALE_X; sizeScaleY = SUP_A_HIT_SCALE_Y;
            } else if (drawSk === 'supCDown') {
                sizeScaleX = SUP_C_HIT_SCALE_X; sizeScaleY = SUP_C_HIT_SCALE_Y;
            } else if (drawSk === 'supDDown') {
                sizeScaleX = SUP_D_HIT_SCALE_X; sizeScaleY = SUP_D_HIT_SCALE_Y;
            } else if (drawSk === 'hooliHit') {
                sizeScaleX = HOOLI_HIT_SCALE_X; sizeScaleY = HOOLI_HIT_SCALE_Y;
            } else {
                if (SUP_ARENT_KEYS.includes(drawSk)) {
                    sizeScaleX = SUP_A_SCALE_X; sizeScaleY = SUP_A_SCALE_Y;
                } else if (SUP_C_KEYS.includes(drawSk)) {
                    sizeScaleX = SUP_C_SCALE_X; sizeScaleY = SUP_C_SCALE_Y;
                } else if (SUP_D_KEYS.includes(drawSk)) {
                    sizeScaleX = SUP_D_SCALE_X; sizeScaleY = SUP_D_SCALE_Y;
                } else if (isHooligan) {
                    sizeScaleX = HOOLI_SCALE_X; sizeScaleY = HOOLI_SCALE_Y;
                }
            }
            const drawHalfW = halfW * sizeScaleX;
            const drawFullH = fullH * sizeScaleY;
            ctx.drawImage(
                assets[drawSk].canvas,
                -drawHalfW,
                -drawFullH,
                drawHalfW * 2,
                drawFullH
            );
        }
    
        ctx.restore();
    }
    for (let b of activeBosses) {
        ctx.save();
        const bc = getBossConfig(b.type);
        const drawH = b.height * bc.scale;
        const drawW = b.width * bc.scale;
        const groundY = VIRTUAL_HEIGHT - 15;
        const centerY = b.isHit ? groundY - bc.downOffset : groundY - drawH / 2;
        ctx.translate(b.x + b.width / 2, centerY);
        const movingRight = (b.currentVx || 0) > 0 && !b.isHit;
        const mirror = bc.mirrorFlip ? !movingRight : movingRight;
        if (mirror) ctx.scale(-1, 1);
    
        let sk;
        if (b.type === 'boss0') {
            if (b.isHit) {
                const downFrame = Math.min(Math.floor(b.downAnimTime || 0), CLOWN_DOWN_KEYS.length - 1);
                sk = CLOWN_DOWN_KEYS[downFrame];
            } else if (b.throwVisualTimer > 0) {
                const throwProgress = 1 - (b.throwVisualTimer / 35);
                const throwFrame = Math.min(Math.floor(throwProgress * CLOWN_THROW_KEYS.length), CLOWN_THROW_KEYS.length - 1);
                sk = CLOWN_THROW_KEYS[throwFrame];
            } else {
                const loopFrame = Math.floor(b.animTime || 0) % CLOWN_LOOP_KEYS.length;
                sk = CLOWN_LOOP_KEYS[loopFrame];
            }
            if (!assets[sk] || !assets[sk].loaded) {
                sk = b.isHit ? CLOWN_DOWN_KEYS[0] : (b.throwVisualTimer > 0 ? CLOWN_THROW_KEYS[0] : CLOWN_LOOP_KEYS[0]);
            }
        } else {
            sk = b.isHit
                ? bossDownMap[b.type]
                : (b.throwVisualTimer > 0
                    ? b.type + 'Throw'
                    : (b.eatVisualTimer > 0 ? 'boss4Eat' : b.type));
        }
    
        if (assets[sk] && assets[sk].loaded) {
            drawTinted(
                assets[sk].canvas,
                -drawW / 2,
                -drawH / 2,
                drawW,
                drawH,
                b.hitFlash
            );
        }
    
        ctx.restore();
    }
    for(let bg of beerGlasses) { ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.fillText(bg.type === 'GLOVE' ? '🧤' : (bg.type === 'BALL' ? '⚽' : (bg.type === 'HAMBURGER' ? '🍔' : '🪨')), bg.x, bg.y); }

    const t = Date.now() * 0.001;
    for (const p of powerUps) {
        const floatPhase = p.floatPhase ?? 0;
        const drawY = p.y + Math.sin(t * 0.9 + floatPhase) * 12;
        const bubbleR = 28;
        ctx.beginPath();
        ctx.arc(p.x, drawY, bubbleR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 240, 255, 0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 210, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type.icon, p.x, drawY);
    }
    
    for(let s of splats) { ctx.fillStyle = `rgba(92, 64, 51, ${s.life})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, 7); ctx.fill(); }
    for(let p of poops) { ctx.font = `${p.radius * 2.5}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💩', p.x, p.y); }
    ctx.save();
    
    const hoverY = player.isDead ? 0 : Math.sin(t * 0.8) * 8;
    const hoverX = player.isDead ? 0 : Math.cos(t * 0.5) * 4;
    ctx.translate(player.x + player.width / 2 + hoverX, player.y + player.height / 2 + hoverY);
    const pulse = player.isDead ? 1 : 1 + 0.02 * Math.sin(t * 0.6);
    ctx.scale(pulse, pulse);
    const tilt = player.isDead ? 0 : Math.max(-0.12, Math.min(0.12, player.dx * 0.012 + player.dy * 0.008));
    ctx.rotate(tilt);
    if (player.facing === -1) ctx.scale(-1, 1);
    if (player.isDead) ctx.rotate(Math.PI);
    const eagleAnimKeys = ['eagleAnim1', 'eagleAnim2', 'eagleAnim3', 'eagleAnim4'];
    const isMoving = !player.isDead && (player.dx !== 0 || player.dy !== 0);
    const frameIndex = Math.floor((Date.now() / 100) % 4);
    const eagleAsset = player.isDead ? assets.eagle : (isMoving ? assets[eagleAnimKeys[frameIndex]] : assets.eagle);
    if (eagleAsset && eagleAsset.loaded) drawTinted(eagleAsset.canvas, -player.width/2, -player.height/2, player.width, player.height, player.hitFlash);
    ctx.restore();
    ctx.restore();
    if(gameActive) animationFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(t) {
    if (!lastTime) lastTime = t;
    const dt = Math.min(100, Math.max(0, t - lastTime));
    lastTime = t;
    update(dt);
    render();
}

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
}, { passive: false });
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

const moveJoystick = (input) => {
    if (!els.joystickContainer || !els.joystickKnob) return;
    const r = els.joystickContainer.getBoundingClientRect();
    const dx = input.clientX - (r.left + r.width/2), dy = input.clientY - (r.top + r.height/2);
    const dist = Math.sqrt(dx*dx + dy*dy), m = Math.min(dist, 50), a = Math.atan2(dy, dx);
    els.joystickKnob.style.transform = `translate(${Math.cos(a)*m}px, ${Math.sin(a)*m}px)`;
    player.dx = Math.cos(a) * (m/50) * player.speed; player.dy = Math.sin(a) * (m/50) * player.speed;
    if(player.dx !== 0) player.facing = player.dx > 0 ? 1 : -1;
};
const endJoystick = () => {
    joystickActive = false;
    if (els.joystickKnob) els.joystickKnob.style.transform = 'translate(0,0)';
    player.dx = 0; player.dy = 0;
};

// Pointer Events (prevents double-triggering click+touch)
if (els.joystickContainer) {
    els.joystickContainer.addEventListener('pointerdown', (e) => {
        joystickActive = true;
        els.joystickContainer.setPointerCapture?.(e.pointerId);
        moveJoystick(e);
        e.preventDefault();
    }, { passive: false });
}
window.addEventListener('pointermove', (e) => { if (joystickActive) moveJoystick(e); });
window.addEventListener('pointerup', endJoystick);
window.addEventListener('pointercancel', endJoystick);

let lastTouchTs = 0;
window.addEventListener('touchstart', () => { lastTouchTs = Date.now(); }, { passive: true });

const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(); }, { passive: false });
    el.addEventListener('click', (e) => {
        // Avoid double fire after a touch (mobile browsers)
        if (Date.now() - lastTouchTs < 600) return;
        e.preventDefault();
        fn();
    });
};

bind('start-btn', async () => { 
    if(gameActive) return; 
    [levelAudio, winAudio, gameOverAudio].forEach(a => { a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {}); });
    await requestLandscape();
    await loadLevelAssets(1);
    score = 0; levelScoreStart = 0; currentLevel = 1;
    if (els.startScreen) els.startScreen.style.display = 'none';
    resetGame();
    lastTime = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
});
bind('restart-btn', async () => { 
    score = 0; levelScoreStart = 0; currentLevel = 1; 
    await loadLevelAssets(1); 
    resetGame(); lastTime = 0; animationFrameId = requestAnimationFrame(gameLoop); 
});
bind('continue-btn', async () => { 
    currentLevel++; 
    levelScoreStart = score; 
    await loadLevelAssets(currentLevel); 
    resetGame(); lastTime = 0; animationFrameId = requestAnimationFrame(gameLoop); 
});
bind('fire-btn', () => executePoop('NORMAL'));
bind('btn-DIARREE', () => window.triggerSpecial('DIARREE'));
bind('btn-POEPBOM', () => window.triggerSpecial('POEPBOM'));
bind('info-btn', () => { if (els.infoModal) els.infoModal.style.display = 'flex'; });
bind('close-info-btn', () => { if (els.infoModal) els.infoModal.style.display = 'none'; });
bind('ios-later-btn', () => { if (els.iosModal) els.iosModal.style.display = 'none'; });

async function forceLevel(n) {
    if (!IS_DEBUG) return;
    await loadLevelAssets(n);
    currentLevel = n; 
    levelScoreStart = (n - 1) * POINTS_TO_BOSS;
    score = levelScoreStart + POINTS_TO_BOSS; 
    resetGame(); 
    if (els.startScreen) els.startScreen.style.display = 'none';
    lastTime = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Expose only in debug mode (handy in console)
if (IS_DEBUG) window.forceLevel = forceLevel;

window.addEventListener('load', () => {
    preload();
    checkIOS();
    initDebugUI();
    initExternalLinks();

    if (IS_DEBUG) {
        document.querySelectorAll('.debug-level-btn[data-level]').forEach((btn) => {
            const handler = async (e) => {
                e.preventDefault();
                const lvl = Number(btn.getAttribute('data-level'));
                if (Number.isFinite(lvl)) await forceLevel(lvl);
            };

            // Pointer event (where supported)
            btn.addEventListener('pointerdown', handler, { passive: false });

            // Fallback / extra safety for browsers zonder Pointer Events
            btn.addEventListener('click', (e) => {
                if (Date.now() - lastTouchTs < 600) return;
                handler(e);
            });
        });
    }
}, { once: true });
window.addEventListener('resize', resize); resize();

})();
