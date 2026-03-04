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
    1:['boss1'], 2:['boss2'], 3:['boss3'], 4:['boss4'],
    5:['boss3','boss4'], 6:['boss1','boss2'], 7:['boss1','boss2','boss4'],
    8:['boss1','boss4','boss3'], 9:['boss2','boss3','boss4'], 10:['boss1','boss2','boss3','boss4']
};

const LEVEL_BG_KEYS = { 1: 'bg_level1', 2: 'bg_level2', 3: 'bg_level3', 4: 'bg_level4', 5: 'bg_level5', 6: 'bg_level4', 7: 'bg_level3', 8: 'bg_level2', 9: 'bg_level1', 10: 'background' };

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
    supArent1: { src: 'assets/supA/supArent1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter 1 run 1' },
    supArent2: { src: 'assets/supA/supArent2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter 1 run 2' },
    supArent3: { src: 'assets/supA/supArent3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter 1 run 3' },
    supArent4: { src: 'assets/supA/supArent4.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter 1 run 4' },
    supArent5: { src: 'assets/supA/supArent5.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter 1 run 5' },
    supC1: { src: 'assets/supC/supC1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run 1' },
    supC2: { src: 'assets/supC/supC2.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run 2' },
    supC3: { src: 'assets/supC/supC3.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C run 3' },
    supCDown: { src: 'assets/supC/supC_down.png', canvas: document.createElement('canvas'), loaded: false, label: 'Supporter C geraakt' },
    normalHit: { src: 'assets/pecsup1lig_1.png', canvas: document.createElement('canvas'), loaded: false, label: 'Geraakt 1' },

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
const SUP_ARENT_KEYS = ['supArent1', 'supArent2', 'supArent3', 'supArent4', 'supArent5'];
const SUP_C_KEYS = ['supC1', 'supC2', 'supC3'];

const bossDownMap = { boss1: 'boss1Down', boss2: 'boss2Down', boss3: 'boss3Down', boss4: 'boss4Down' };

async function preload() {
    const keysList = Object.keys(assets);
    const total = keysList.length;
    let loadedCount = 0;
    updateLoadingBar(0, total);
    const promises = keysList.map(key => {
        return new Promise((resolve) => {
            const item = assets[key];
            const img = new Image();
                
            if (item.src.startsWith('http')) {
                img.crossOrigin = "anonymous";
            }
                
            const timeout = setTimeout(() => {
                item.loaded = false; loadedCount++; addFailedAsset(item.label); updateLoadingBar(loadedCount, total); resolve();
            }, 10000); 

            img.onload = () => {
                clearTimeout(timeout);
                try {
                    item.canvas.width = img.width;
                    item.canvas.height = img.height;
                    const aCtx = item.canvas.getContext('2d');
                    aCtx.drawImage(img, 0, 0);
                    item.loaded = true;
                } catch (e) {
                    item.loaded = false;
                    addFailedAsset(item.label);
                }
                loadedCount++;
                updateLoadingBar(loadedCount, total);
                resolve();
            };
            img.onerror = () => {
                clearTimeout(timeout); item.loaded = false; loadedCount++; addFailedAsset(item.label); updateLoadingBar(loadedCount, total); resolve();
            };
            img.src = item.src;
        });
    });
    await Promise.all(promises);
    if (assets.background.loaded) bgImg.src = assets.background.src;
    if (els.loadingText) els.loadingText.style.display = 'none';
    if (els.startBtn) els.startBtn.disabled = false;
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
    const cfg = levelBossConfig[currentLevel] || ['boss1'];

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

    activeBosses = cfg.map((t, i) => ({
        type: t,
        x: screenRight + 100 + (i * 350),          // spawn blijft gelijk
        y: 680,
        width: 250,
        height: 350,
        hp: (25 + currentLevel * 5) / (cfg.length * 0.8),
        maxHp: (25 + currentLevel * 5) / (cfg.length * 0.8),
        speed: 2.5,
        currentVx: -2.5,
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
        targetX: laneCenters[i]                  // gewenste positie in beeld
    }));

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
    // Spawn supporters / hooligans (level 1: meer normals, hoger level: meer hooligans)
    if (!bossActive && targets.length < 5 && Math.random() < 0.04) {
        const spawnY = VIRTUAL_HEIGHT - 200;
        const hooliganChance = 0.12 + (currentLevel - 1) * 0.045;  // L1 ~12%, L10 ~52%
        const isHooligan = Math.random() < Math.min(0.6, hooliganChance);

        if (isHooligan) {
            // Hooligans: verschillende ren-snelheden onderling (speedMult 0.65–1.35)
            const speedMult = 0.65 + Math.random() * 0.7;
            targets.push({
                type: 'hooligan',
                x: -160,
                y: spawnY,
                speed: 4 + Math.random() * 2,
                speedMult,
                vx: (BASE_WORLD_SPEED + 6) * speedMult,
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
            // Normale supporters: supA (1) of supC (3)
            const variant = Math.random() < 0.5 ? 1 : 3;
            targets.push({
                type: 'normal',
                x: -160,
                y: spawnY,
                speed: 5 + Math.random() * 6,
                isHit: false,
                variant,
                hitTime: 0,
                throwTimer: 0,
                ...((variant === 1 || variant === 3) && { animTime: Math.random() * (variant === 3 ? 3 : 5), animSpeed: variant === 3 ? 0.08 : 0.12 })
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
                // Supporter A (variant 1) en C (variant 3): run-animatie door frames
                if (t.variant === 1 || t.variant === 3) t.animTime = (t.animTime || 0) + (t.animSpeed ?? 0.12);

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
        const hitYOffset = (t.isHit && t.variant === 3) ? 65 : (t.isHit ? 28 : 0);  // supC op de grond op stoep
        ctx.translate(t.x + halfW, VIRTUAL_HEIGHT - 50 + hitYOffset);
    
        // Spiegelen
        ctx.scale(scaleX, 1);
    
        let sk;

        if (t.isHit) {
            sk = isHooligan
                ? 'hooliHit'
                : (t.variant === 3 ? 'supCDown' : 'normalHit');
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
                const runKeys = t.variant === 3 ? SUP_C_KEYS : SUP_ARENT_KEYS;
                sk = runKeys[Math.floor(t.animTime || 0) % runKeys.length];
            }
        }
    
        if (assets[sk].loaded) {
            // supC_down is klein in de bron; schalen voor gelijke visuele grootte
            const isSupCDown = (sk === 'supCDown');
            const drawHalfW = isSupCDown ? halfW * 1.8 : halfW;
            const drawFullH = isSupCDown ? fullH * 1.8 : fullH;
            ctx.drawImage(
                assets[sk].canvas,
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
    
        // Centreer op de baas
        ctx.translate(
            b.x + b.width / 2,
            b.isHit ? VIRTUAL_HEIGHT - 50 - 45 : b.y + b.height / 2 - 35
        );
    
        // Bepaal looprichting op basis van currentVx
        // (negatief = naar links, positief = naar rechts)
        const movingRight = (b.currentVx || 0) > 0 && !b.isHit;
    
        if (movingRight) {
            // Spiegel horizontaal rond het midden
            ctx.scale(-1, 1);
        }
    
        let sk = b.isHit
            ? bossDownMap[b.type]
            : (b.throwVisualTimer > 0
                ? b.type + 'Throw'
                : (b.eatVisualTimer > 0 ? 'boss4Eat' : b.type));
    
        if (assets[sk].loaded) {
            drawTinted(
                assets[sk].canvas,
                -b.width / 2,
                -b.height / 2,
                b.width,
                b.height,
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
    score = 0; levelScoreStart = 0; currentLevel = 1;
    if (els.startScreen) els.startScreen.style.display = 'none';
    resetGame();
    lastTime = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
});
bind('restart-btn', () => { score = 0; levelScoreStart = 0; currentLevel = 1; resetGame(); lastTime = 0; animationFrameId = requestAnimationFrame(gameLoop); });
bind('continue-btn', () => { currentLevel++; levelScoreStart = score; resetGame(); lastTime = 0; animationFrameId = requestAnimationFrame(gameLoop); });
bind('fire-btn', () => executePoop('NORMAL'));
bind('btn-DIARREE', () => window.triggerSpecial('DIARREE'));
bind('btn-POEPBOM', () => window.triggerSpecial('POEPBOM'));
bind('info-btn', () => { if (els.infoModal) els.infoModal.style.display = 'flex'; });
bind('close-info-btn', () => { if (els.infoModal) els.infoModal.style.display = 'none'; });
bind('ios-later-btn', () => { if (els.iosModal) els.iosModal.style.display = 'none'; });

function forceLevel(n) {
    if (!IS_DEBUG) return;
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
            const handler = (e) => {
                e.preventDefault();
                const lvl = Number(btn.getAttribute('data-level'));
                if (Number.isFinite(lvl)) forceLevel(lvl);
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
