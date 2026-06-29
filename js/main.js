const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const HIGH_SCORE_KEY = 'cat-game-high-score';
const TOTAL_FISH_KEY = 'cat-game-total-fish';
const RARE_FISH_KEY = 'cat-game-rare-fish';
const ACHIEVEMENTS_KEY = 'cat-game-achievements';
const BGM_VOLUME_KEY = 'cat-game-bgm-volume';
const SE_VOLUME_KEY = 'cat-game-se-volume';
const BGM_ENABLED_KEY = 'cat-game-bgm-enabled';
const SE_ENABLED_KEY = 'cat-game-se-enabled';
const SELECTED_SKIN_KEY = 'cat-game-selected-skin';
const UNLOCKED_SKINS_KEY = 'cat-game-unlocked-skins';
const SELECTED_MODE_KEY = 'cat-game-selected-mode';
const MISSIONS_KEY = 'cat-game-missions';
const TIMEATTACK_RANKING_KEY = 'cat-game-timeattack-ranking';

const COLOR_CYAN = '#00f6ff';
const COLOR_MAGENTA = '#ff2d95';
const COLOR_PURPLE = '#b14eff';
const COLOR_WHITE = '#f5f5ff';
const COLOR_GOLD = '#ffd24a';
const COLOR_LIGHTBLUE = '#7fdbff';

const ground = {
  x: 0,
  y: 410,
  width: 800,
  height: 40,
  color: '#2e1a47',
};

const player = {
  x: 60,
  y: 358,
  width: 52,
  height: 52,
  vy: 0,
  isJumping: false,
  jumpCount: 0,
};

const obstacle = {
  x: 750,
  y: 370,
  width: 30,
  height: 40,
  color: COLOR_MAGENTA,
  type: 'block',
  speedMultiplier: 1,
  nearMissChecked: false,
};

const fish = {
  active: false,
  x: 0,
  y: 0,
  width: 22,
  height: 14,
  isRare: false,
};

const ITEM_WIDTH = 20;
const ITEM_HEIGHT = 20;
const item = {
  active: false,
  x: 0,
  y: 0,
  width: ITEM_WIDTH,
  height: ITEM_HEIGHT,
  defIndex: -1,
};

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const BASE_OBSTACLE_SPEED = 4;
const MAX_OBSTACLE_SPEED = 10;
const ABSOLUTE_MAX_OBSTACLE_SPEED = 14;
const SPEED_PER_SCORE = 0.005;
const LEVEL_SPEED_BONUS = 0.6;
const OBSTACLE_DEFS = {
  block: { minWidth: 26, maxWidth: 40, minHeight: 34, maxHeight: 46, speedMultiplier: 1 },
  yarn: { minWidth: 18, maxWidth: 26, minHeight: 18, maxHeight: 26, speedMultiplier: 1.15 },
  bone: { minWidth: 30, maxWidth: 44, minHeight: 22, maxHeight: 30, speedMultiplier: 1 },
  vacuum: { minWidth: 50, maxWidth: 62, minHeight: 26, maxHeight: 32, speedMultiplier: 1.2 },
  dog: { minWidth: 44, maxWidth: 56, minHeight: 48, maxHeight: 58, speedMultiplier: 0.85 },
  trashcan: { minWidth: 24, maxWidth: 30, minHeight: 58, maxHeight: 72, speedMultiplier: 1 },
};
const OBSTACLE_TYPES = Object.keys(OBSTACLE_DEFS);
const groundY = ground.y - player.height;

const HORIZON_Y = 250;
const STAR_COLORS = [COLOR_CYAN, COLOR_PURPLE, COLOR_WHITE];
const STAR_COUNT = 50;
const BONUS_STAR_COUNT = 40;
const SHOOTING_STAR_CHANCE = 0.01;
const AMBIENT_STAR_COUNT = 24;
const BUILDING_COUNT = 10;
const GRID_ROWS = 6;
const GRID_COLUMNS = 9;
const TRAIL_MAX = 4;
const PARTICLE_COUNT = 6;
const PARTICLE_LIFETIME = 18;
const LANDING_PARTICLE_COUNT = 5;
const LANDING_PARTICLE_LIFETIME = 12;
const LEVEL_UP_DURATION = 60;
const GAME_OVER_FLASH_DURATION = 10;
const BLINK_MIN_INTERVAL = 180;
const BLINK_MAX_INTERVAL = 300;
const BLINK_DURATION = 6;
const HAPPY_DURATION = 20;

const NEAR_MISS_GAP = 18;
const NEAR_MISS_BASE_BONUS = 50;
const NEAR_MISS_COMBO_STEP = 10;
const NEAR_MISS_BONUS_CAP = 100;
const COMBO_RESET_FRAMES = 150;
const COMBO_POPUP_DURATION = 90;
const MILESTONES = [1000, 3000, 5000, 10000];
const MILESTONE_DURATION = 100;
const RING_MAX_RADIUS = 70;
const RING_PARTICLE_COUNT = 8;

const SQUASH_DURATION = 12;
const HOLOGRAM_TEXTS = ['FISH', 'NEKO', 'CYBER CAT'];
const HOLOGRAM_CHANCE = 0.004;
const HOLOGRAM_SPEED = 1.5;
const HOLOGRAM_DURATION = 220;
const HOLOGRAM_FADE_FRAMES = 40;

const FISH_BASE_WIDTH = 22;
const FISH_BASE_HEIGHT = 14;
const FISH_BONUS = 200;
const RARE_FISH_BONUS = 500;
const FISH_SPAWN_CHANCE = 0.012;
const RARE_FISH_CHANCE = 0.12;
const FISH_SPARKLE_COUNT = 6;
const FISH_SPARKLE_LIFETIME = 16;
const POPUP_TEXT_DURATION = 60;

const ACHIEVEMENTS = [
  { id: 'first_jump', title: 'First Jump' },
  { id: 'combo_master', title: 'Combo Master' },
  { id: 'fish_hunter', title: 'Fish Hunter' },
  { id: 'rare_collector', title: 'Rare Collector' },
  { id: 'cyber_legend', title: 'Cyber Legend' },
];
const ACHIEVEMENT_NOTICE_DURATION = 150;
const ACHIEVEMENT_FADE_FRAMES = 15;

const HIT_STOP_FISH = 3;
const HIT_STOP_RARE_FISH = 5;
const HIT_STOP_LEVEL_UP = 5;
const HIT_STOP_ACHIEVEMENT = 4;

const SHAKE_DURATION = 10;
const SHAKE_RARE_FISH = 3;
const SHAKE_LEVEL_UP = 4;
const SHAKE_GAME_OVER = 6;

const SCORE_POP_DURATION = 10;
const HIGH_SCORE_GLOW_DURATION = 30;

const FISH_RING_DURATION = 24;
const NORMAL_RING_MAX_RADIUS = 26;
const NORMAL_RING_PARTICLE_COUNT = 6;
const RARE_RING_MAX_RADIUS = 46;
const RARE_RING_PARTICLE_COUNT = 10;

const MAX_JUMP_COUNT = 2;
const DOUBLE_JUMP_PARTICLE_COUNT = 10;
const DOUBLE_JUMP_PARTICLE_LIFETIME = 20;
const DOUBLE_JUMP_RING_DURATION = 20;
const DOUBLE_JUMP_RING_MAX_RADIUS = 36;
const DOUBLE_JUMP_RING_PARTICLE_COUNT = 10;
const DOUBLE_JUMP_GLOW_DURATION = 10;

const DEFAULT_VOLUME = 0.5;
const SETTINGS_VOLUME_STEP = 0.1;
const SETTINGS_ROWS = ['bgmVolume', 'seVolume', 'bgmEnabled', 'seEnabled'];

const BGM_SOURCES = {
  title: 'assets/audio/bgm/title.mp3',
  playing: 'assets/audio/bgm/playing.mp3',
  gameover: 'assets/audio/bgm/gameover.mp3',
};

const SE_SOURCES = {
  jump: 'assets/audio/se/jump.mp3',
  doubleJump: 'assets/audio/se/double_jump.mp3',
  fish: 'assets/audio/se/fish.mp3',
  rareFish: 'assets/audio/se/rare_fish.mp3',
  levelUp: 'assets/audio/se/level_up.mp3',
  achievement: 'assets/audio/se/achievement.mp3',
  gameOver: 'assets/audio/se/game_over.mp3',
  select: 'assets/audio/se/select.mp3',
  item: 'assets/audio/se/item.wav',
};

const bgmAudios = {};
Object.keys(BGM_SOURCES).forEach((key) => {
  const audio = new Audio(BGM_SOURCES[key]);
  audio.loop = true;
  bgmAudios[key] = audio;
});

const seAudios = {};
Object.keys(SE_SOURCES).forEach((key) => {
  seAudios[key] = new Audio(SE_SOURCES[key]);
});

function loadVolumeSetting(key) {
  const stored = localStorage.getItem(key);
  return stored === null ? DEFAULT_VOLUME : Number(stored);
}

function loadEnabledSetting(key) {
  const stored = localStorage.getItem(key);
  return stored === null ? true : stored === 'true';
}

let bgmVolume = loadVolumeSetting(BGM_VOLUME_KEY);
let seVolume = loadVolumeSetting(SE_VOLUME_KEY);
let bgmEnabled = loadEnabledSetting(BGM_ENABLED_KEY);
let seEnabled = loadEnabledSetting(SE_ENABLED_KEY);
let currentBgmKey = null;

function playBgm(key) {
  if (currentBgmKey === key) {
    return;
  }
  if (currentBgmKey) {
    bgmAudios[currentBgmKey].pause();
    bgmAudios[currentBgmKey].currentTime = 0;
  }
  currentBgmKey = key;
  if (!bgmEnabled) {
    return;
  }
  const audio = bgmAudios[key];
  audio.volume = bgmVolume;
  audio.play().catch(() => {});
}

function playSe(key) {
  if (!seEnabled) {
    return;
  }
  const audio = seAudios[key];
  audio.volume = seVolume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function setBgmVolume(value) {
  bgmVolume = Math.max(0, Math.min(1, value));
  localStorage.setItem(BGM_VOLUME_KEY, String(bgmVolume));
  if (currentBgmKey) {
    bgmAudios[currentBgmKey].volume = bgmVolume;
  }
}

function setSeVolume(value) {
  seVolume = Math.max(0, Math.min(1, value));
  localStorage.setItem(SE_VOLUME_KEY, String(seVolume));
}

function setBgmEnabled(enabled) {
  bgmEnabled = enabled;
  localStorage.setItem(BGM_ENABLED_KEY, String(enabled));
  if (!currentBgmKey) {
    return;
  }
  const audio = bgmAudios[currentBgmKey];
  if (enabled) {
    audio.volume = bgmVolume;
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

function setSeEnabled(enabled) {
  seEnabled = enabled;
  localStorage.setItem(SE_ENABLED_KEY, String(enabled));
}

const SKINS = [
  { id: 'cyber_cat', name: 'Cyber Cat', color: '#00f6ff', unlockType: 'initial', unlockValue: null, unlocked: false },
  { id: 'pink_cat', name: 'Pink Cat', color: '#ff4de3', unlockType: 'score', unlockValue: 3000, unlocked: false },
  { id: 'golden_cat', name: 'Golden Cat', color: '#ffd700', unlockType: 'rareFish', unlockValue: 10, unlocked: false },
  { id: 'shadow_cat', name: 'Shadow Cat', color: '#444444', unlockType: 'allAchievements', unlockValue: null, unlocked: false },
];
const SKIN_UNLOCK_NOTICE_DURATION = 150;
const SKIN_UNLOCK_FADE_FRAMES = 15;

let unlockedSkinIds = (localStorage.getItem(UNLOCKED_SKINS_KEY) || '').split(',').filter(Boolean);
SKINS.forEach((skin) => {
  skin.unlocked = skin.unlockType === 'initial' || unlockedSkinIds.includes(skin.id);
});

const storedSkinId = localStorage.getItem(SELECTED_SKIN_KEY);
let currentSkin = SKINS.find((skin) => skin.id === storedSkinId && skin.unlocked) || SKINS[0];
let skinIndex = Math.max(0, SKINS.findIndex((skin) => skin.id === currentSkin.id));
let skinUnlockQueue = [];
let currentSkinUnlockNotice = null;

function selectSkin(skin) {
  currentSkin = skin;
  localStorage.setItem(SELECTED_SKIN_KEY, skin.id);
}

const GAME_MODES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Standard gameplay.',
    obstacleSpeedMultiplier: 1,
    fishSpeedMultiplier: 1,
    itemSpeedMultiplier: 1,
    scoreMultiplier: 1,
    timeLimit: null,
  },
  {
    id: 'hard',
    name: 'Hard',
    description: 'Faster and more challenging.',
    obstacleSpeedMultiplier: 1.25,
    fishSpeedMultiplier: 1.15,
    itemSpeedMultiplier: 1.15,
    scoreMultiplier: 1.5,
    timeLimit: null,
  },
  {
    id: 'timeAttack',
    name: 'Time Attack',
    description: 'Score as much as possible before time runs out.',
    obstacleSpeedMultiplier: 1,
    fishSpeedMultiplier: 1,
    itemSpeedMultiplier: 1,
    scoreMultiplier: 1,
    timeLimit: 60,
  },
];

const storedModeId = localStorage.getItem(SELECTED_MODE_KEY);
let currentMode = GAME_MODES.find((mode) => mode.id === storedModeId) || GAME_MODES[0];
let modeIndex = Math.max(0, GAME_MODES.findIndex((mode) => mode.id === currentMode.id));

function selectMode(mode) {
  currentMode = mode;
  localStorage.setItem(SELECTED_MODE_KEY, mode.id);
}

const TIMEATTACK_RANKING_SIZE = 5;
let timeAttackRanking = JSON.parse(localStorage.getItem(TIMEATTACK_RANKING_KEY) || '[]');

function submitTimeAttackRanking(finalScore) {
  timeAttackRanking.push({ score: finalScore, date: new Date().toISOString().slice(0, 10) });
  timeAttackRanking.sort((a, b) => b.score - a.score);
  timeAttackRanking = timeAttackRanking.slice(0, TIMEATTACK_RANKING_SIZE);
  localStorage.setItem(TIMEATTACK_RANKING_KEY, JSON.stringify(timeAttackRanking));
}

function getSkinUnlockHint(skin) {
  if (skin.unlockType === 'score') {
    return 'SCORE ' + skin.unlockValue + '+';
  }
  if (skin.unlockType === 'rareFish') {
    return 'RARE FISH x' + skin.unlockValue;
  }
  if (skin.unlockType === 'allAchievements') {
    return 'ALL ACHIEVEMENTS';
  }
  return '';
}

function checkSkinUnlocks() {
  const newlyUnlocked = [];
  SKINS.forEach((skin) => {
    if (skin.unlocked) {
      return;
    }
    let shouldUnlock = false;
    if (skin.unlockType === 'score') {
      shouldUnlock = highScore >= skin.unlockValue;
    } else if (skin.unlockType === 'rareFish') {
      shouldUnlock = rareFishCount >= skin.unlockValue;
    } else if (skin.unlockType === 'allAchievements') {
      shouldUnlock = unlockedAchievements.length >= ACHIEVEMENTS.length;
    }
    if (shouldUnlock) {
      skin.unlocked = true;
      newlyUnlocked.push(skin);
    }
  });
  if (newlyUnlocked.length === 0) {
    return;
  }
  unlockedSkinIds.push(...newlyUnlocked.map((skin) => skin.id));
  localStorage.setItem(UNLOCKED_SKINS_KEY, unlockedSkinIds.join(','));
  newlyUnlocked.forEach((skin) => {
    skinUnlockQueue.push(skin.id);
  });
}

const MISSIONS = [
  {
    id: 'fish_collector',
    title: 'Fish Collector',
    description: 'Collect 100 fish (total).',
    type: 'totalFish',
    target: 100,
    rewardType: 'skin',
    rewardValue: 'pink_cat',
    completed: false,
  },
  {
    id: 'hard_challenger',
    title: 'Hard Challenger',
    description: 'Score 5000+ in Hard mode.',
    type: 'hardScore',
    target: 5000,
    rewardType: 'score',
    rewardValue: 500,
    completed: false,
  },
  {
    id: 'rare_hunter',
    title: 'Rare Hunter',
    description: 'Collect 20 rare fish (total).',
    type: 'rareFish',
    target: 20,
    rewardType: 'skin',
    rewardValue: 'golden_cat',
    completed: false,
  },
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Block 5 game-overs with Shield.',
    type: 'shieldSaves',
    target: 5,
    rewardType: 'skin',
    rewardValue: 'shadow_cat',
    completed: false,
  },
];
const MISSION_NOTICE_DURATION = 150;
const MISSION_NOTICE_FADE_FRAMES = 15;

const storedMissionData = JSON.parse(localStorage.getItem(MISSIONS_KEY) || '{}');
const completedMissionIds = storedMissionData.completed || [];
MISSIONS.forEach((mission) => {
  mission.completed = completedMissionIds.includes(mission.id);
});
let bestHardScore = storedMissionData.bestHardScore || 0;
let shieldSaveCount = storedMissionData.shieldSaveCount || 0;
let missionIndex = 0;
let missionQueue = [];
let currentMissionNotice = null;

function saveMissionData() {
  localStorage.setItem(MISSIONS_KEY, JSON.stringify({
    completed: MISSIONS.filter((mission) => mission.completed).map((mission) => mission.id),
    bestHardScore,
    shieldSaveCount,
  }));
}

function getMissionProgress(mission) {
  if (mission.type === 'totalFish') {
    return totalFishCount;
  }
  if (mission.type === 'rareFish') {
    return rareFishCount;
  }
  if (mission.type === 'hardScore') {
    return bestHardScore;
  }
  if (mission.type === 'shieldSaves') {
    return shieldSaveCount;
  }
  return 0;
}

function getMissionRewardLabel(mission) {
  if (mission.rewardType === 'skin') {
    const skin = SKINS.find((s) => s.id === mission.rewardValue);
    return skin ? skin.name : mission.rewardValue;
  }
  if (mission.rewardType === 'score') {
    return '+' + mission.rewardValue + ' Bonus Score';
  }
  return '';
}

function completeMission(mission) {
  mission.completed = true;
  saveMissionData();

  if (mission.rewardType === 'skin') {
    const skin = SKINS.find((s) => s.id === mission.rewardValue);
    if (skin && !skin.unlocked) {
      skin.unlocked = true;
      unlockedSkinIds.push(skin.id);
      localStorage.setItem(UNLOCKED_SKINS_KEY, unlockedSkinIds.join(','));
      skinUnlockQueue.push(skin.id);
    }
  }

  missionQueue.push(mission.id);
  playSe('achievement');
}

function checkMissions() {
  MISSIONS.forEach((mission) => {
    if (mission.completed) {
      return;
    }
    if (getMissionProgress(mission) >= mission.target) {
      completeMission(mission);
    }
  });
}

const ITEM_DEFS = [
  { id: 'shield', name: 'Shield', color: COLOR_CYAN, duration: 300, effect: 'shield', label: 'SHIELD!' },
  { id: 'magnet', name: 'Magnet', color: COLOR_MAGENTA, duration: 480, effect: 'magnet', label: 'MAGNET!' },
  { id: 'scoreBoost', name: 'Score Boost', color: COLOR_GOLD, duration: 600, effect: 'scoreBoost', label: 'SCORE x2!' },
  { id: 'slowTime', name: 'Slow Time', color: COLOR_LIGHTBLUE, duration: 360, effect: 'slowTime', label: 'SLOW TIME!' },
];
const ITEM_SPAWN_INTERVAL = 300;
const ITEM_SPAWN_CHANCE = 0.5;
const MAGNET_RANGE = 220;
const MAGNET_PULL_SPEED = 6;
const SLOW_TIME_FACTOR = 0.7;
const ITEM_SPARKLE_COUNT = 6;
const ITEM_SPARKLE_LIFETIME = 16;
const ITEM_RING_DURATION = 24;
const ITEM_RING_MAX_RADIUS = 26;
const ITEM_RING_PARTICLE_COUNT = 6;

let itemSpawnTimer = ITEM_SPAWN_INTERVAL;
let shieldTimer = 0;
let magnetTimer = 0;
let scoreBoostTimer = 0;
let slowTimeTimer = 0;

function maybeSpawnItem() {
  if (item.active) {
    return;
  }
  itemSpawnTimer -= 1;
  if (itemSpawnTimer > 0) {
    return;
  }
  itemSpawnTimer = ITEM_SPAWN_INTERVAL;
  if (Math.random() >= ITEM_SPAWN_CHANCE) {
    return;
  }
  item.active = true;
  item.defIndex = Math.floor(Math.random() * ITEM_DEFS.length);
  item.x = canvas.width + 20;
  item.y = randomRange(HORIZON_Y + 20, ground.y - item.height - 10);
}

function activateItemEffect(def) {
  if (def.effect === 'shield') {
    shieldTimer = def.duration;
  } else if (def.effect === 'magnet') {
    magnetTimer = def.duration;
  } else if (def.effect === 'scoreBoost') {
    scoreBoostTimer = def.duration;
  } else if (def.effect === 'slowTime') {
    slowTimeTimer = def.duration;
  }
}

function applyMagnetEffect() {
  if (magnetTimer <= 0 || !fish.active) {
    return;
  }
  const dx = (player.x + player.width / 2) - (fish.x + fish.width / 2);
  const dy = (player.y + player.height / 2) - (fish.y + fish.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance <= 0 || distance > MAGNET_RANGE) {
    return;
  }
  fish.x += (dx / distance) * MAGNET_PULL_SPEED;
  fish.y += (dy / distance) * MAGNET_PULL_SPEED;
}

function getItemSpeedFactor() {
  return slowTimeTimer > 0 ? SLOW_TIME_FACTOR : 1;
}

function addScore(amount) {
  const boosted = scoreBoostTimer > 0 ? amount * 2 : amount;
  rawScoreForLevel += boosted;
  const actual = Math.round(boosted * currentMode.scoreMultiplier);
  score += actual;
  return actual;
}

function checkItemCollision() {
  if (!item.active || !isColliding(player, item)) {
    return;
  }
  const def = ITEM_DEFS[item.defIndex];
  activateItemEffect(def);
  playSe('item');

  for (let i = 0; i < ITEM_SPARKLE_COUNT; i++) {
    particles.push({
      x: item.x + item.width / 2,
      y: item.y + item.height / 2,
      vx: randomRange(-1.5, 1.5),
      vy: randomRange(-1.5, 0.5),
      life: ITEM_SPARKLE_LIFETIME,
      maxLife: ITEM_SPARKLE_LIFETIME,
      color: def.color,
    });
  }

  rings.push({
    x: item.x + item.width / 2,
    y: item.y + item.height / 2,
    timer: ITEM_RING_DURATION,
    maxTimer: ITEM_RING_DURATION,
    color: def.color,
    maxRadius: ITEM_RING_MAX_RADIUS,
    particleCount: ITEM_RING_PARTICLE_COUNT,
  });

  popupTexts.push({
    x: item.x + item.width / 2,
    y: item.y - 6,
    label: def.label,
    color: def.color,
    life: POPUP_TEXT_DURATION,
    maxLife: POPUP_TEXT_DURATION,
  });

  item.active = false;
}

const moon = {
  x: canvas.width - 90,
  y: 70,
  radius: 34,
  color: COLOR_MAGENTA,
};

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function makeStar(visibleFrom) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * (HORIZON_Y - 20),
    radius: Math.random() * 1.5 + 0.5,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    phase: Math.random() * Math.PI * 2,
    visibleFrom,
  };
}

function makeBuilding() {
  return {
    x: Math.random() * canvas.width,
    width: randomRange(30, 70),
    height: randomRange(40, 120),
    color: '#140a26',
    seed: Math.random() * Math.PI * 2,
  };
}

function makeAmbientStar() {
  return {
    x: Math.random() * canvas.width,
    y: randomRange(20, HORIZON_Y - 10),
    radius: randomRange(0.3, 1),
    speed: randomRange(0.3, 0.9),
    alpha: randomRange(0.2, 0.6),
  };
}

const stars = [
  ...Array.from({ length: STAR_COUNT }, () => makeStar(1)),
  ...Array.from({ length: BONUS_STAR_COUNT }, () => makeStar(2)),
];

const ambientStars = Array.from({ length: AMBIENT_STAR_COUNT }, () => makeAmbientStar());

const buildings = Array.from({ length: BUILDING_COUNT }, () => makeBuilding());

let gameState = 'title';
let score = 0;
// レベル・障害物速度カーブはモードのスコア倍率を含まない素点で判定し、
// Hard モードでもレベルアップの実時間ペースをClassicと一致させる
let rawScoreForLevel = 0;
let level = 1;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
let totalFishCount = Number(localStorage.getItem(TOTAL_FISH_KEY)) || 0;
let rareFishCount = Number(localStorage.getItem(RARE_FISH_KEY)) || 0;
let unlockedAchievements = (localStorage.getItem(ACHIEVEMENTS_KEY) || '').split(',').filter(Boolean);
let fishCollectedThisRun = 0;
let rareFishCollectedThisRun = 0;
let timeRemainingFrames = 0;
let isTimeUp = false;
let obstacleSpeed = BASE_OBSTACLE_SPEED;
let trail = [];
let particles = [];
let shootingStars = [];
let levelUpTimer = 0;
let gameOverFlashTimer = 0;
let isBlinking = false;
let blinkTimer = Math.round(randomRange(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
let blinkDuration = 0;
let happyTimer = 0;
let comboCount = 0;
let comboTimer = 0;
let comboPopupTimer = 0;
let popupTexts = [];
let milestoneTimer = 0;
let milestoneScore = 0;
let nextMilestoneIndex = 0;
let squashTimer = 0;
let squashMode = 'none';
let holograms = [];
let achievementQueue = [];
let currentAchievementNotice = null;
let hitStopTimer = 0;
let shakeTimer = 0;
let shakeMagnitude = 0;
let scorePopTimer = 0;
let highScoreGlowTimer = 0;
let rings = [];
let playerGlowTimer = 0;
let isNewRecord = false;
let settingsIndex = 0;

function getAvailableObstacleTypes() {
  if (level < 3) {
    return ['block'];
  }
  if (level < 5) {
    return ['block', 'yarn', 'bone', 'vacuum'];
  }
  return OBSTACLE_TYPES;
}

function randomizeObstacle() {
  const types = getAvailableObstacleTypes();
  obstacle.type = types[Math.floor(Math.random() * types.length)];

  const def = OBSTACLE_DEFS[obstacle.type];
  obstacle.width = Math.round(randomRange(def.minWidth, def.maxWidth));
  obstacle.height = Math.round(randomRange(def.minHeight, def.maxHeight));
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = canvas.width + randomRange(0, 80);
  obstacle.speedMultiplier = def.speedMultiplier;
  obstacle.nearMissChecked = false;
}

function spawnJumpParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      vx: randomRange(-1, 1),
      vy: randomRange(0.5, 1.5),
      life: PARTICLE_LIFETIME,
      maxLife: PARTICLE_LIFETIME,
      color: COLOR_CYAN,
    });
  }
}

function spawnLandingParticles() {
  for (let i = 0; i < LANDING_PARTICLE_COUNT; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      vx: randomRange(-1.5, 1.5),
      vy: randomRange(-0.5, 0),
      life: LANDING_PARTICLE_LIFETIME,
      maxLife: LANDING_PARTICLE_LIFETIME,
      color: COLOR_CYAN,
    });
  }
}

function spawnDoubleJumpParticles() {
  for (let i = 0; i < DOUBLE_JUMP_PARTICLE_COUNT; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      vx: randomRange(-2, 2),
      vy: randomRange(-2, 1),
      life: DOUBLE_JUMP_PARTICLE_LIFETIME,
      maxLife: DOUBLE_JUMP_PARTICLE_LIFETIME,
      color: i % 2 === 0 ? COLOR_CYAN : COLOR_MAGENTA,
    });
  }
}

function maybeSpawnShootingStar() {
  if (level < 3 || Math.random() >= SHOOTING_STAR_CHANCE) {
    return;
  }
  shootingStars.push({
    x: Math.random() * canvas.width * 0.6,
    y: Math.random() * HORIZON_Y * 0.5,
    vx: 6,
    vy: 3,
    life: 30,
  });
}

function maybeSpawnHologram() {
  if (level < 5 || Math.random() >= HOLOGRAM_CHANCE) {
    return;
  }
  holograms.push({
    x: canvas.width + 40,
    y: randomRange(40, HORIZON_Y - 60),
    text: HOLOGRAM_TEXTS[Math.floor(Math.random() * HOLOGRAM_TEXTS.length)],
    life: HOLOGRAM_DURATION,
    maxLife: HOLOGRAM_DURATION,
  });
}

function maybeSpawnFish() {
  if (fish.active || Math.random() >= FISH_SPAWN_CHANCE) {
    return;
  }
  fish.active = true;
  fish.isRare = Math.random() < RARE_FISH_CHANCE;
  fish.width = fish.isRare ? FISH_BASE_WIDTH + 4 : FISH_BASE_WIDTH;
  fish.height = fish.isRare ? FISH_BASE_HEIGHT + 2 : FISH_BASE_HEIGHT;
  fish.x = canvas.width + 20;
  fish.y = randomRange(HORIZON_Y + 20, ground.y - fish.height - 10);
}

function spawnFishSparkles(x, y, color) {
  for (let i = 0; i < FISH_SPARKLE_COUNT; i++) {
    particles.push({
      x,
      y,
      vx: randomRange(-1.5, 1.5),
      vy: randomRange(-1.5, 0.5),
      life: FISH_SPARKLE_LIFETIME,
      maxLife: FISH_SPARKLE_LIFETIME,
      color,
    });
  }
}

function unlockAchievement(id) {
  if (unlockedAchievements.includes(id)) {
    return;
  }
  unlockedAchievements.push(id);
  localStorage.setItem(ACHIEVEMENTS_KEY, unlockedAchievements.join(','));
  achievementQueue.push(id);
  triggerHitStop(HIT_STOP_ACHIEVEMENT);
  playSe('achievement');
}

function checkAchievements() {
  if (comboCount >= 10) {
    unlockAchievement('combo_master');
  }
  if (totalFishCount >= 10) {
    unlockAchievement('fish_hunter');
  }
  if (rareFishCount >= 1) {
    unlockAchievement('rare_collector');
  }
  if (score >= 10000) {
    unlockAchievement('cyber_legend');
  }
}

function checkFishCollision() {
  if (!fish.active || !isColliding(player, fish)) {
    return;
  }
  const baseBonus = fish.isRare ? RARE_FISH_BONUS : FISH_BONUS;
  const color = fish.isRare ? COLOR_GOLD : COLOR_CYAN;

  const bonus = addScore(baseBonus);
  scorePopTimer = SCORE_POP_DURATION;
  fishCollectedThisRun += 1;
  totalFishCount += 1;
  if (fish.isRare) {
    rareFishCount += 1;
    rareFishCollectedThisRun += 1;
  }
  localStorage.setItem(TOTAL_FISH_KEY, String(totalFishCount));
  localStorage.setItem(RARE_FISH_KEY, String(rareFishCount));

  playSe(fish.isRare ? 'rareFish' : 'fish');

  spawnFishSparkles(fish.x + fish.width / 2, fish.y + fish.height / 2, color);

  rings.push({
    x: fish.x + fish.width / 2,
    y: fish.y + fish.height / 2,
    timer: FISH_RING_DURATION,
    maxTimer: FISH_RING_DURATION,
    color,
    maxRadius: fish.isRare ? RARE_RING_MAX_RADIUS : NORMAL_RING_MAX_RADIUS,
    particleCount: fish.isRare ? RARE_RING_PARTICLE_COUNT : NORMAL_RING_PARTICLE_COUNT,
  });

  triggerHitStop(fish.isRare ? HIT_STOP_RARE_FISH : HIT_STOP_FISH);
  if (fish.isRare) {
    triggerShake(SHAKE_DURATION, SHAKE_RARE_FISH);
  }

  popupTexts.push({
    x: fish.x + fish.width / 2,
    y: fish.y - 6,
    label: fish.isRare ? 'RARE FISH!' : 'FISH GET!',
    color,
    bonus,
    life: POPUP_TEXT_DURATION,
    maxLife: POPUP_TEXT_DURATION,
  });

  fish.active = false;
}

// 複数の演出が同時に発生しても短い方で打ち消されないよう、常に大きい値を採用する
function triggerHitStop(duration) {
  hitStopTimer = Math.max(hitStopTimer, duration);
}

function triggerShake(duration, magnitude) {
  shakeTimer = Math.max(shakeTimer, duration);
  shakeMagnitude = Math.max(shakeMagnitude, magnitude);
}

function triggerTimeUp() {
  gameState = 'gameover';
  isTimeUp = true;
  comboCount = 0;
  comboTimer = 0;
  playSe('gameOver');
  playBgm('gameover');
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    highScoreGlowTimer = HIGH_SCORE_GLOW_DURATION;
    isNewRecord = true;
  }
  checkSkinUnlocks();
  checkMissions();
  submitTimeAttackRanking(score);
}

function getComboTier(count) {
  if (count >= 30) {
    return { color: COLOR_WHITE, blur: 28, pulse: true };
  }
  if (count >= 20) {
    return { color: COLOR_GOLD, blur: 22, pulse: false };
  }
  if (count >= 10) {
    return { color: COLOR_PURPLE, blur: 18, pulse: false };
  }
  return { color: COLOR_MAGENTA, blur: 16, pulse: false };
}

function checkNearMiss() {
  if (!player.isJumping || obstacle.nearMissChecked) {
    return;
  }
  const horizontalOverlap = player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x;
  if (!horizontalOverlap) {
    return;
  }
  const gap = obstacle.y - (player.y + player.height);
  if (gap > NEAR_MISS_GAP) {
    return;
  }
  obstacle.nearMissChecked = true;
  triggerNearMiss();
}

function triggerNearMiss() {
  comboCount += 1;
  comboTimer = COMBO_RESET_FRAMES;
  comboPopupTimer = COMBO_POPUP_DURATION;

  const baseBonus = Math.min(NEAR_MISS_BASE_BONUS + (comboCount - 1) * NEAR_MISS_COMBO_STEP, NEAR_MISS_BONUS_CAP);
  const bonus = addScore(baseBonus);
  scorePopTimer = SCORE_POP_DURATION;

  popupTexts.push({
    x: obstacle.x + obstacle.width / 2,
    y: obstacle.y - 10,
    label: 'NICE!',
    color: COLOR_CYAN,
    bonus,
    life: POPUP_TEXT_DURATION,
    maxLife: POPUP_TEXT_DURATION,
  });
}

function startGame() {
  player.y = groundY;
  player.vy = 0;
  player.isJumping = false;

  obstacle.width = 30;
  obstacle.height = 40;
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = 750;
  obstacle.type = 'block';
  obstacle.speedMultiplier = OBSTACLE_DEFS.block.speedMultiplier;
  obstacle.nearMissChecked = false;

  obstacleSpeed = BASE_OBSTACLE_SPEED;
  score = 0;
  rawScoreForLevel = 0;
  level = 1;
  trail.length = 0;
  particles.length = 0;
  shootingStars.length = 0;
  levelUpTimer = 0;
  gameOverFlashTimer = 0;
  isBlinking = false;
  blinkDuration = 0;
  blinkTimer = Math.round(randomRange(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
  happyTimer = 0;
  comboCount = 0;
  comboTimer = 0;
  comboPopupTimer = 0;
  popupTexts.length = 0;
  milestoneTimer = 0;
  milestoneScore = 0;
  nextMilestoneIndex = 0;
  squashTimer = 0;
  squashMode = 'none';
  holograms.length = 0;
  fish.active = false;
  fishCollectedThisRun = 0;
  rareFishCollectedThisRun = 0;
  isTimeUp = false;
  timeRemainingFrames = currentMode.timeLimit ? currentMode.timeLimit * 60 : 0;
  item.active = false;
  itemSpawnTimer = ITEM_SPAWN_INTERVAL;
  shieldTimer = 0;
  magnetTimer = 0;
  scoreBoostTimer = 0;
  slowTimeTimer = 0;
  hitStopTimer = 0;
  shakeTimer = 0;
  shakeMagnitude = 0;
  scorePopTimer = 0;
  highScoreGlowTimer = 0;
  rings.length = 0;
  playerGlowTimer = 0;
  isNewRecord = false;
  player.jumpCount = 0;
  gameState = 'playing';
  playBgm('playing');
}

function jumpAction() {
  if (player.jumpCount >= MAX_JUMP_COUNT) {
    return;
  }
  player.vy = JUMP_STRENGTH;
  player.isJumping = true;
  player.jumpCount += 1;
  squashTimer = SQUASH_DURATION;
  squashMode = 'jump';
  unlockAchievement('first_jump');

  if (player.jumpCount >= MAX_JUMP_COUNT) {
    spawnDoubleJumpParticles();
    playerGlowTimer = DOUBLE_JUMP_GLOW_DURATION;
    rings.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      timer: DOUBLE_JUMP_RING_DURATION,
      maxTimer: DOUBLE_JUMP_RING_DURATION,
      colors: [COLOR_CYAN, COLOR_MAGENTA],
      maxRadius: DOUBLE_JUMP_RING_MAX_RADIUS,
      particleCount: DOUBLE_JUMP_RING_PARTICLE_COUNT,
    });
    playSe('doubleJump');
  } else {
    spawnJumpParticles();
    playSe('jump');
  }
}

function handlePrimaryAction() {
  if (gameState === 'title' || gameState === 'gameover') {
    playSe('select');
    startGame();
    return;
  }
  if (gameState !== 'playing') {
    return;
  }
  jumpAction();
}

function goToTitle() {
  gameState = 'title';
  checkSkinUnlocks();
}

function handleModeSelectKey(code) {
  if (code === 'ArrowUp') {
    modeIndex = (modeIndex - 1 + GAME_MODES.length) % GAME_MODES.length;
    return;
  }
  if (code === 'ArrowDown') {
    modeIndex = (modeIndex + 1) % GAME_MODES.length;
    return;
  }
  if (code !== 'Space') {
    return;
  }
  selectMode(GAME_MODES[modeIndex]);
  playSe('select');
}

function handleMissionsKey(code) {
  if (code === 'ArrowUp') {
    missionIndex = (missionIndex - 1 + MISSIONS.length) % MISSIONS.length;
    return;
  }
  if (code === 'ArrowDown') {
    missionIndex = (missionIndex + 1) % MISSIONS.length;
  }
}

function handleSkinsKey(code) {
  if (code === 'ArrowLeft') {
    skinIndex = (skinIndex - 1 + SKINS.length) % SKINS.length;
    return;
  }
  if (code === 'ArrowRight') {
    skinIndex = (skinIndex + 1) % SKINS.length;
    return;
  }
  if (code !== 'Space') {
    return;
  }
  const skin = SKINS[skinIndex];
  if (!skin.unlocked) {
    return;
  }
  selectSkin(skin);
  playSe('select');
}

function handleSettingsKey(code) {
  if (code === 'ArrowUp') {
    settingsIndex = (settingsIndex - 1 + SETTINGS_ROWS.length) % SETTINGS_ROWS.length;
    return;
  }
  if (code === 'ArrowDown') {
    settingsIndex = (settingsIndex + 1) % SETTINGS_ROWS.length;
    return;
  }
  if (code !== 'ArrowLeft' && code !== 'ArrowRight') {
    return;
  }
  const row = SETTINGS_ROWS[settingsIndex];
  const direction = code === 'ArrowLeft' ? -1 : 1;
  if (row === 'bgmVolume') {
    setBgmVolume(bgmVolume + direction * SETTINGS_VOLUME_STEP);
  } else if (row === 'seVolume') {
    setSeVolume(seVolume + direction * SETTINGS_VOLUME_STEP);
  } else if (row === 'bgmEnabled') {
    setBgmEnabled(!bgmEnabled);
  } else if (row === 'seEnabled') {
    setSeEnabled(!seEnabled);
  }
  playSe('select');
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    if (gameState === 'achievements' || gameState === 'settings' || gameState === 'skins' || gameState === 'modeSelect' || gameState === 'missions' || gameState === 'ranking') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyA') {
    if (gameState === 'title') {
      gameState = 'achievements';
    } else if (gameState === 'achievements') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyS') {
    if (gameState === 'title') {
      gameState = 'settings';
      playSe('select');
    } else if (gameState === 'settings') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyK') {
    if (gameState === 'title') {
      gameState = 'skins';
      playSe('select');
    } else if (gameState === 'skins') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyM') {
    if (gameState === 'title') {
      gameState = 'modeSelect';
      playSe('select');
    } else if (gameState === 'modeSelect') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyC') {
    if (gameState === 'title') {
      gameState = 'missions';
      playSe('select');
    } else if (gameState === 'missions') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyR') {
    if (gameState === 'title') {
      gameState = 'ranking';
      playSe('select');
    } else if (gameState === 'ranking') {
      goToTitle();
    }
    return;
  }

  if (e.code === 'KeyP') {
    if (gameState === 'playing') {
      gameState = 'paused';
    } else if (gameState === 'paused') {
      gameState = 'playing';
    }
    return;
  }

  if (gameState === 'settings') {
    handleSettingsKey(e.code);
    return;
  }

  if (gameState === 'skins') {
    if (e.code === 'Space') {
      e.preventDefault();
    }
    handleSkinsKey(e.code);
    return;
  }

  if (gameState === 'modeSelect') {
    if (e.code === 'Space') {
      e.preventDefault();
    }
    handleModeSelectKey(e.code);
    return;
  }

  if (gameState === 'missions') {
    handleMissionsKey(e.code);
    return;
  }

  if (e.code !== 'Space') {
    return;
  }
  e.preventDefault();
  handlePrimaryAction();
});

canvas.addEventListener('click', () => {
  handlePrimaryAction();
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handlePrimaryAction();
});

function update() {
  // ヒットストップ中はUIタイマーも含めて1フレーム全体を停止させる
  if (hitStopTimer > 0) {
    hitStopTimer -= 1;
    return;
  }

  // ゲームオーバー・一時停止中も最後まで再生したい演出は、playing判定より前で更新する
  if (gameOverFlashTimer > 0) {
    gameOverFlashTimer -= 1;
  }
  if (scorePopTimer > 0) {
    scorePopTimer -= 1;
  }
  if (highScoreGlowTimer > 0) {
    highScoreGlowTimer -= 1;
  }
  if (shakeTimer > 0) {
    shakeTimer -= 1;
  }
  if (playerGlowTimer > 0) {
    playerGlowTimer -= 1;
  }
  rings.forEach((r) => {
    r.timer -= 1;
  });
  rings = rings.filter((r) => r.timer > 0);

  if (currentAchievementNotice) {
    currentAchievementNotice.timer -= 1;
    if (currentAchievementNotice.timer <= 0) {
      currentAchievementNotice = null;
    }
  }
  if (!currentAchievementNotice && achievementQueue.length > 0) {
    const id = achievementQueue.shift();
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    currentAchievementNotice = { title: def.title, timer: ACHIEVEMENT_NOTICE_DURATION };
  }

  if (currentSkinUnlockNotice) {
    currentSkinUnlockNotice.timer -= 1;
    if (currentSkinUnlockNotice.timer <= 0) {
      currentSkinUnlockNotice = null;
    }
  }
  if (!currentSkinUnlockNotice && skinUnlockQueue.length > 0) {
    const id = skinUnlockQueue.shift();
    const skin = SKINS.find((s) => s.id === id);
    currentSkinUnlockNotice = { name: skin.name, timer: SKIN_UNLOCK_NOTICE_DURATION };
  }

  if (currentMissionNotice) {
    currentMissionNotice.timer -= 1;
    if (currentMissionNotice.timer <= 0) {
      currentMissionNotice = null;
    }
  }
  if (!currentMissionNotice && missionQueue.length > 0) {
    const id = missionQueue.shift();
    const mission = MISSIONS.find((m) => m.id === id);
    currentMissionNotice = { title: mission.title, timer: MISSION_NOTICE_DURATION };
  }

  if (gameState !== 'playing') {
    return;
  }

  ambientStars.forEach((s) => {
    s.x -= s.speed;
    if (s.x < 0) {
      s.x = canvas.width;
      s.y = randomRange(20, HORIZON_Y - 10);
    }
  });

  if (currentMode.timeLimit) {
    timeRemainingFrames -= 1;
    if (timeRemainingFrames <= 0) {
      timeRemainingFrames = 0;
      triggerTimeUp();
      return;
    }
  }

  if (levelUpTimer > 0) {
    levelUpTimer -= 1;
  }

  const wasJumping = player.isJumping;

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.isJumping = false;
    player.jumpCount = 0;
    if (wasJumping) {
      spawnLandingParticles();
      happyTimer = HAPPY_DURATION;
      squashTimer = SQUASH_DURATION;
      squashMode = 'land';
    }
  }

  if (happyTimer > 0) {
    happyTimer -= 1;
  }

  if (squashTimer > 0) {
    squashTimer -= 1;
  }

  if (shieldTimer > 0) {
    shieldTimer -= 1;
  }
  if (magnetTimer > 0) {
    magnetTimer -= 1;
  }
  if (scoreBoostTimer > 0) {
    scoreBoostTimer -= 1;
  }
  if (slowTimeTimer > 0) {
    slowTimeTimer -= 1;
  }

  if (comboTimer > 0) {
    comboTimer -= 1;
    if (comboTimer <= 0) {
      comboCount = 0;
    }
  }
  if (comboPopupTimer > 0) {
    comboPopupTimer -= 1;
  }
  if (milestoneTimer > 0) {
    milestoneTimer -= 1;
  }
  popupTexts.forEach((t) => {
    t.life -= 1;
  });
  popupTexts = popupTexts.filter((t) => t.life > 0);

  blinkTimer -= 1;
  if (blinkTimer <= 0) {
    isBlinking = true;
    blinkDuration = BLINK_DURATION;
    blinkTimer = Math.round(randomRange(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
  }
  if (isBlinking) {
    blinkDuration -= 1;
    if (blinkDuration <= 0) {
      isBlinking = false;
    }
  }

  if (player.isJumping) {
    trail.push({ x: player.x, y: player.y });
    if (trail.length > TRAIL_MAX) {
      trail.shift();
    }
  } else {
    trail.length = 0;
  }

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
  });
  particles = particles.filter((p) => p.life > 0);

  maybeSpawnShootingStar();
  shootingStars.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 1;
  });
  shootingStars = shootingStars.filter((s) => s.life > 0 && s.x < canvas.width);

  maybeSpawnHologram();
  holograms.forEach((h) => {
    h.x -= HOLOGRAM_SPEED;
    h.life -= 1;
  });
  holograms = holograms.filter((h) => h.life > 0 && h.x > -150);

  const itemSpeedFactor = getItemSpeedFactor();

  maybeSpawnFish();
  if (fish.active) {
    fish.x -= obstacleSpeed * itemSpeedFactor * currentMode.fishSpeedMultiplier;
    if (fish.x + fish.width < 0) {
      fish.active = false;
    }
  }
  applyMagnetEffect();
  checkFishCollision();

  maybeSpawnItem();
  if (item.active) {
    item.x -= obstacleSpeed * itemSpeedFactor * currentMode.itemSpeedMultiplier;
    if (item.x + item.width < 0) {
      item.active = false;
    }
  }
  checkItemCollision();

  // speedMultiplierは障害物ごとの見た目の速度差のみに使い、難易度カーブ(obstacleSpeed)には影響させない
  obstacle.x -= obstacleSpeed * obstacle.speedMultiplier * itemSpeedFactor * currentMode.obstacleSpeedMultiplier;
  if (obstacle.x + obstacle.width < 0) {
    randomizeObstacle();
  }

  if (isColliding(player, obstacle)) {
    if (shieldTimer > 0) {
      shieldTimer = 0;
      shieldSaveCount += 1;
      saveMissionData();
      spawnFishSparkles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, COLOR_CYAN);
      randomizeObstacle();
    } else {
      gameState = 'gameover';
      gameOverFlashTimer = GAME_OVER_FLASH_DURATION;
      comboCount = 0;
      comboTimer = 0;
      triggerShake(SHAKE_DURATION, SHAKE_GAME_OVER);
      playSe('gameOver');
      playBgm('gameover');
      if (score > highScore) {
        highScore = score;
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
        highScoreGlowTimer = HIGH_SCORE_GLOW_DURATION;
        isNewRecord = true;
      }
      if (currentMode.id === 'hard' && score > bestHardScore) {
        bestHardScore = score;
      }
      if (currentMode.id === 'timeAttack') {
        submitTimeAttackRanking(score);
      }
      checkSkinUnlocks();
      checkMissions();
      return;
    }
  }

  checkNearMiss();

  addScore(1);

  const previousLevel = level;
  level = Math.floor(rawScoreForLevel / 1000) + 1;
  if (level !== previousLevel) {
    levelUpTimer = LEVEL_UP_DURATION;
    triggerHitStop(HIT_STOP_LEVEL_UP);
    triggerShake(SHAKE_DURATION, SHAKE_LEVEL_UP);
    playSe('levelUp');
  }

  if (nextMilestoneIndex < MILESTONES.length && score >= MILESTONES[nextMilestoneIndex]) {
    milestoneScore = MILESTONES[nextMilestoneIndex];
    milestoneTimer = MILESTONE_DURATION;
    nextMilestoneIndex += 1;
  }

  checkAchievements();

  const maxSpeedForLevel = Math.min(ABSOLUTE_MAX_OBSTACLE_SPEED, MAX_OBSTACLE_SPEED + (level - 1) * LEVEL_SPEED_BONUS);
  obstacleSpeed = Math.min(maxSpeedForLevel, BASE_OBSTACLE_SPEED + rawScoreForLevel * SPEED_PER_SCORE);
}

function getSkyColors() {
  if (level < 6) {
    return ['#05050f', '#1a0a33'];
  }
  const hue = 220 + Math.sin(level * 0.4) * 35;
  return [`hsl(${hue}, 55%, 6%)`, `hsl(${hue}, 65%, 15%)`];
}

function drawBackground() {
  const [topColor, bottomColor] = getSkyColors();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLevelUpGlow() {
  if (levelUpTimer <= 0) {
    return;
  }
  const progress = levelUpTimer / LEVEL_UP_DURATION;
  ctx.fillStyle = `rgba(180, 220, 255, ${progress * 0.25})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  const time = performance.now();
  stars.forEach((star) => {
    if (star.visibleFrom > level) {
      return;
    }
    ctx.globalAlpha = level >= 3 ? 0.5 + Math.sin(time / 600 + star.phase) * 0.5 : 1;
    ctx.beginPath();
    ctx.fillStyle = star.color;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawAmbientStars() {
  ctx.save();
  ctx.fillStyle = COLOR_WHITE;
  ambientStars.forEach((s) => {
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawShootingStars() {
  shootingStars.forEach((s) => {
    ctx.save();
    ctx.strokeStyle = `rgba(245, 245, 255, ${s.life / 30})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
    ctx.stroke();
    ctx.restore();
  });
}

function drawMoon() {
  const baseBlur = level >= 8 ? 46 : level >= 5 ? 38 : 25;
  const pulse = Math.sin(performance.now() / 500) * 4;
  ctx.save();
  ctx.shadowColor = moon.color;
  ctx.shadowBlur = baseBlur + pulse;
  ctx.fillStyle = moon.color;
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
  ctx.fill();

  if (level >= 5) {
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(20, 5, 20, 0.55)';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      const y = moon.y + i * (moon.radius / 2.5);
      ctx.beginPath();
      ctx.moveTo(moon.x - moon.radius, y);
      ctx.lineTo(moon.x + moon.radius, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCity() {
  if (level < 4) {
    return;
  }
  const time = performance.now();
  buildings.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, HORIZON_Y - b.height, b.width, b.height);

    ctx.fillStyle = 'rgba(0, 246, 255, 0.5)';
    const windowRows = Math.floor(b.height / 18);
    for (let row = 0; row < windowRows; row++) {
      const y = HORIZON_Y - b.height + 8 + row * 18;
      if (Math.sin(time / 600 + b.seed + row) > 0.1) {
        ctx.fillRect(b.x + 6, y, 4, 4);
      }
      if (Math.sin(time / 600 + b.seed + row * 1.7 + 1) > 0.1) {
        ctx.fillRect(b.x + b.width - 10, y, 4, 4);
      }
    }
  });
}

function drawHolograms() {
  const time = performance.now();
  holograms.forEach((h) => {
    const fadeIn = (h.maxLife - h.life) / HOLOGRAM_FADE_FRAMES;
    const fadeOut = h.life / HOLOGRAM_FADE_FRAMES;
    const fade = Math.max(0, Math.min(1, fadeIn, fadeOut));
    const flicker = 0.6 + Math.sin(time / 90 + h.x) * 0.4;

    ctx.save();
    ctx.globalAlpha = fade * flicker;
    ctx.textAlign = 'center';
    ctx.shadowColor = COLOR_PURPLE;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COLOR_PURPLE;
    ctx.font = '20px Orbitron, sans-serif';
    ctx.fillText(h.text, h.x, h.y);
    ctx.restore();
  });
}

function drawHorizon() {
  ctx.save();
  ctx.shadowColor = COLOR_MAGENTA;
  ctx.shadowBlur = level >= 8 ? 16 : 8;
  ctx.strokeStyle = 'rgba(255, 45, 149, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON_Y);
  ctx.lineTo(canvas.width, HORIZON_Y);
  ctx.stroke();
  ctx.restore();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 246, 255, 0.35)';
  ctx.lineWidth = 1;
  if (level >= 8) {
    ctx.shadowColor = COLOR_CYAN;
    ctx.shadowBlur = 6;
  }

  const vanishX = canvas.width / 2;

  for (let i = 0; i <= GRID_COLUMNS; i++) {
    const xBottom = (canvas.width / GRID_COLUMNS) * i;
    ctx.beginPath();
    ctx.moveTo(vanishX, HORIZON_Y);
    ctx.lineTo(xBottom, ground.y);
    ctx.stroke();
  }

  for (let i = 1; i <= GRID_ROWS; i++) {
    const t = i / GRID_ROWS;
    const y = HORIZON_Y + (ground.y - HORIZON_Y) * (t * t);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = ground.color;
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawBlockObstacle() {
  ctx.fillStyle = '#3a0d2e';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(obstacle.x + 1.5, obstacle.y + 1.5, obstacle.width - 3, obstacle.height - 3);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, 4);
  ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 10, obstacle.width, 4);

  ctx.strokeStyle = 'rgba(245, 245, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(obstacle.x + 4, obstacle.y + 4);
  ctx.lineTo(obstacle.x + obstacle.width - 4, obstacle.y + obstacle.height - 4);
  ctx.moveTo(obstacle.x + obstacle.width - 4, obstacle.y + 4);
  ctx.lineTo(obstacle.x + 4, obstacle.y + obstacle.height - 4);
  ctx.stroke();
}

function drawYarnObstacle() {
  const cx = obstacle.x + obstacle.width / 2;
  const cy = obstacle.y + obstacle.height / 2;
  const r = Math.min(obstacle.width, obstacle.height) / 2;

  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a0d2e';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.4, (Math.PI / 3) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBoneObstacle() {
  ctx.fillStyle = obstacle.color;
  const shaftHeight = obstacle.height * 0.35;
  const shaftY = obstacle.y + (obstacle.height - shaftHeight) / 2;
  ctx.fillRect(obstacle.x + 4, shaftY, obstacle.width - 8, shaftHeight);

  const r = obstacle.height * 0.28;
  [0.3, 0.7].forEach((t) => {
    ctx.beginPath();
    ctx.arc(obstacle.x + 4, obstacle.y + obstacle.height * t, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(obstacle.x + obstacle.width - 4, obstacle.y + obstacle.height * t, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawVacuumObstacle() {
  const bodyHeight = obstacle.height * 0.7;
  const bodyY = obstacle.y + (obstacle.height - bodyHeight);

  ctx.fillStyle = '#3a0d2e';
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, bodyHeight / 2);
  ctx.fill();

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, bodyHeight / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width * 0.2, bodyY);
  ctx.quadraticCurveTo(
    obstacle.x + obstacle.width * 0.1, obstacle.y - 6,
    obstacle.x + obstacle.width * 0.32, obstacle.y - 2
  );
  ctx.stroke();

  ctx.fillStyle = obstacle.color;
  const wheelR = 3.5;
  ctx.beginPath();
  ctx.arc(obstacle.x + obstacle.width * 0.25, obstacle.y + obstacle.height - 2, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(obstacle.x + obstacle.width * 0.75, obstacle.y + obstacle.height - 2, wheelR, 0, Math.PI * 2);
  ctx.fill();
}

function drawDogObstacle() {
  const bodyY = obstacle.y + obstacle.height * 0.25;
  const bodyHeight = obstacle.height * 0.75;

  ctx.fillStyle = '#3a0d2e';
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, 10);
  ctx.fill();

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, 10);
  ctx.stroke();

  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width * 0.15, bodyY);
  ctx.lineTo(obstacle.x + obstacle.width * 0.05, obstacle.y);
  ctx.lineTo(obstacle.x + obstacle.width * 0.3, bodyY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width * 0.7, bodyY);
  ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y);
  ctx.lineTo(obstacle.x + obstacle.width * 0.95, bodyY - 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width, bodyY + bodyHeight * 0.4);
  ctx.quadraticCurveTo(
    obstacle.x + obstacle.width + 10, bodyY + bodyHeight * 0.1,
    obstacle.x + obstacle.width + 4, bodyY - 6
  );
  ctx.stroke();
}

function drawTrashcanObstacle() {
  ctx.fillStyle = '#3a0d2e';
  ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, obstacle.height - 6);

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(obstacle.x + 1, obstacle.y + 7, obstacle.width - 2, obstacle.height - 8);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x - 2, obstacle.y, obstacle.width + 4, 6);

  ctx.strokeStyle = 'rgba(245, 245, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    const y = obstacle.y + 6 + ((obstacle.height - 6) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 2, y);
    ctx.lineTo(obstacle.x + obstacle.width - 2, y);
    ctx.stroke();
  }
}

function drawObstacle() {
  ctx.save();
  ctx.shadowColor = obstacle.color;
  ctx.shadowBlur = 14;

  if (obstacle.type === 'yarn') {
    drawYarnObstacle();
  } else if (obstacle.type === 'bone') {
    drawBoneObstacle();
  } else if (obstacle.type === 'vacuum') {
    drawVacuumObstacle();
  } else if (obstacle.type === 'dog') {
    drawDogObstacle();
  } else if (obstacle.type === 'trashcan') {
    drawTrashcanObstacle();
  } else {
    drawBlockObstacle();
  }

  ctx.restore();
}

function drawTrail() {
  trail.forEach((pos, index) => {
    ctx.globalAlpha = ((index + 1) / trail.length) * 0.25;
    ctx.fillStyle = currentSkin.color;
    ctx.fillRect(pos.x, pos.y, player.width, player.height);
  });
  ctx.globalAlpha = 1;
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;
}

function getExpression() {
  if (isBlinking) {
    return 'blink';
  }
  if (happyTimer > 0) {
    return 'happy';
  }
  if (player.isJumping) {
    return 'jumping';
  }
  return 'normal';
}

function drawTail() {
  const tailSway = Math.sin(performance.now() / 280) * (player.isJumping ? 8 : 4);
  ctx.save();
  ctx.shadowColor = currentSkin.color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = currentSkin.color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const tailBaseX = player.x + 4;
  const tailBaseY = player.y + player.height * 0.55;
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(
    tailBaseX - 22 + tailSway, tailBaseY + 6,
    tailBaseX - 30 + tailSway * 1.3, tailBaseY - 28
  );
  ctx.stroke();
  ctx.restore();
}

function drawPaws() {
  if (player.isJumping) {
    return;
  }
  const runFrame = Math.floor(performance.now() / 150) % 2;
  const legOffset = runFrame === 0 ? 0 : 4;
  ctx.fillStyle = currentSkin.color;
  ctx.beginPath();
  ctx.roundRect(player.x + 6 + legOffset, player.y + player.height - 4, 7, 5, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(player.x + player.width - 13 - legOffset, player.y + player.height - 4, 7, 5, 2);
  ctx.fill();
}

function drawBody() {
  const earSize = 13;

  const glowBoost = playerGlowTimer > 0 ? (playerGlowTimer / DOUBLE_JUMP_GLOW_DURATION) * 26 : 0;

  ctx.save();
  ctx.shadowColor = currentSkin.color;
  ctx.shadowBlur = 18 + glowBoost;
  ctx.fillStyle = currentSkin.color;
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.width, player.height, player.width * 0.4);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(player.x + 4, player.y);
  ctx.lineTo(player.x + 4 + earSize / 2, player.y - earSize);
  ctx.lineTo(player.x + 4 + earSize, player.y);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(player.x + player.width - 4 - earSize, player.y);
  ctx.lineTo(player.x + player.width - 4 - earSize / 2, player.y - earSize);
  ctx.lineTo(player.x + player.width - 4, player.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWhiskers() {
  const whiskerY = player.y + player.height * 0.5;
  const leftBaseX = player.x + player.width * 0.05;
  const rightBaseX = player.x + player.width * 0.95;

  ctx.strokeStyle = 'rgba(245, 245, 255, 0.6)';
  ctx.lineWidth = 0.8;

  [-4, 0, 4].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(leftBaseX, whiskerY + offset * 0.5);
    ctx.lineTo(leftBaseX - 11, whiskerY + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightBaseX, whiskerY + offset * 0.5);
    ctx.lineTo(rightBaseX + 11, whiskerY + offset);
    ctx.stroke();
  });
}

function drawFace() {
  ctx.fillStyle = 'rgba(255, 170, 200, 0.6)';
  const cheekY = player.y + player.height * 0.62;
  ctx.beginPath();
  ctx.arc(player.x + player.width * 0.14, cheekY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.x + player.width * 0.86, cheekY, 5, 0, Math.PI * 2);
  ctx.fill();

  const expression = getExpression();
  const eyeY = player.y + player.height * 0.36;
  const eyeSize = 9;
  const leftEyeX = player.x + player.width * 0.14;
  const rightEyeX = player.x + player.width * 0.68;

  ctx.fillStyle = '#0b0b1a';
  ctx.strokeStyle = '#0b0b1a';
  ctx.lineWidth = 2;

  if (expression === 'blink') {
    ctx.beginPath();
    ctx.moveTo(leftEyeX, eyeY + eyeSize / 2);
    ctx.lineTo(leftEyeX + eyeSize, eyeY + eyeSize / 2);
    ctx.moveTo(rightEyeX, eyeY + eyeSize / 2);
    ctx.lineTo(rightEyeX + eyeSize, eyeY + eyeSize / 2);
    ctx.stroke();
  } else if (expression === 'happy') {
    ctx.beginPath();
    ctx.arc(leftEyeX + eyeSize / 2, eyeY + eyeSize / 2, eyeSize / 2, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightEyeX + eyeSize / 2, eyeY + eyeSize / 2, eyeSize / 2, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if (expression === 'jumping') {
    ctx.fillRect(leftEyeX, eyeY + 2, eyeSize, eyeSize - 4);
    ctx.fillRect(rightEyeX, eyeY + 2, eyeSize, eyeSize - 4);
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 1, eyeY - 2);
    ctx.lineTo(leftEyeX + eyeSize + 1, eyeY - 4);
    ctx.moveTo(rightEyeX - 1, eyeY - 4);
    ctx.lineTo(rightEyeX + eyeSize + 1, eyeY - 2);
    ctx.stroke();
  } else {
    ctx.fillRect(leftEyeX, eyeY, eyeSize, eyeSize);
    ctx.fillRect(rightEyeX, eyeY, eyeSize, eyeSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftEyeX + 1, eyeY + 1, 2, 2);
    ctx.fillRect(rightEyeX + 1, eyeY + 1, 2, 2);
  }

  ctx.fillStyle = COLOR_MAGENTA;
  ctx.fillRect(player.x + player.width * 0.47, player.y + player.height * 0.53, 4, 3);

  drawMouth(expression);
}

function drawMouth(expression) {
  const mouthX = player.x + player.width / 2;
  const mouthY = player.y + player.height * 0.78;

  ctx.strokeStyle = '#0b0b1a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  if (expression === 'jumping') {
    ctx.beginPath();
    ctx.moveTo(mouthX - 2, mouthY);
    ctx.lineTo(mouthX + 2, mouthY);
    ctx.stroke();
    return;
  }

  const mouthRadius = expression === 'happy' ? 6 : 4;
  ctx.beginPath();
  ctx.arc(mouthX, mouthY, mouthRadius, 0, Math.PI);
  ctx.stroke();
}

function drawPlayer() {
  const t = squashTimer > 0 ? 1 - squashTimer / SQUASH_DURATION : 0;
  const amount = squashTimer > 0 ? Math.sin(t * Math.PI) : 0;
  const scaleY = squashMode === 'land' ? 1 - amount * 0.18 : 1 + amount * 0.15;
  const scaleX = squashMode === 'land' ? 1 + amount * 0.12 : 1 - amount * 0.1;
  const pivotX = player.x + player.width / 2;
  const pivotY = player.y + player.height;

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-pivotX, -pivotY);

  drawTail();
  drawPaws();
  drawBody();
  drawWhiskers();
  drawFace();

  ctx.restore();
}

function drawHud() {
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText('LEVEL ' + level, 20, 28);

  if (scorePopTimer > 0) {
    const scale = 1 + (scorePopTimer / SCORE_POP_DURATION) * 0.3;
    ctx.save();
    ctx.translate(20, 52);
    ctx.scale(scale, scale);
    ctx.translate(-20, -52);
    ctx.fillText('SCORE: ' + score, 20, 52);
    ctx.restore();
  } else {
    ctx.fillText('SCORE: ' + score, 20, 52);
  }

  ctx.save();
  if (highScoreGlowTimer > 0) {
    ctx.shadowColor = COLOR_WHITE;
    ctx.shadowBlur = 20;
  }
  ctx.fillText('HIGH SCORE: ' + highScore, 20, 76);
  ctx.restore();

  ctx.fillText('FISH: ' + fishCollectedThisRun, 20, 100);

  ctx.fillStyle = COLOR_CYAN;
  ctx.fillText('MODE: ' + currentMode.name.toUpperCase(), 20, 124);

  let nextLineY = 148;
  if (currentMode.timeLimit) {
    ctx.fillStyle = COLOR_CYAN;
    ctx.fillText('TIME: ' + Math.ceil(timeRemainingFrames / 60), 20, nextLineY);
    nextLineY += 24;
  }

  if (comboCount > 0) {
    ctx.fillStyle = getComboTier(comboCount).color;
    ctx.fillText('COMBO x' + comboCount, 20, nextLineY);
  }
}

function drawItemHud() {
  const lines = [];
  if (shieldTimer > 0) {
    lines.push({ text: 'SHIELD ' + Math.ceil(shieldTimer / 60) + 's', color: COLOR_CYAN });
  }
  if (magnetTimer > 0) {
    lines.push({ text: 'MAGNET ' + Math.ceil(magnetTimer / 60) + 's', color: COLOR_MAGENTA });
  }
  if (scoreBoostTimer > 0) {
    lines.push({ text: 'SCORE x2 ' + Math.ceil(scoreBoostTimer / 60) + 's', color: COLOR_GOLD });
  }
  if (slowTimeTimer > 0) {
    lines.push({ text: 'SLOW TIME ' + Math.ceil(slowTimeTimer / 60) + 's', color: COLOR_LIGHTBLUE });
  }
  if (lines.length === 0) {
    return;
  }

  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = '14px Orbitron, sans-serif';
  lines.forEach((line, i) => {
    ctx.shadowColor = line.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, canvas.width - 20, 160 + i * 20);
  });
  ctx.restore();
}

function drawPopupTexts() {
  popupTexts.forEach((t) => {
    const progress = 1 - t.life / t.maxLife;
    const alpha = t.life / t.maxLife;
    const y = t.y - progress * 20;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = t.color;
    ctx.font = '16px Orbitron, sans-serif';
    ctx.fillText(t.label, t.x, y);
    if (t.bonus) {
      ctx.fillText('+' + t.bonus, t.x, y + 16);
    }
    ctx.restore();
  });
}

function drawFish() {
  if (!fish.active) {
    return;
  }
  const color = fish.isRare ? COLOR_GOLD : COLOR_CYAN;
  const cx = fish.x + fish.width / 2;
  const cy = fish.y + fish.height / 2;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = fish.isRare ? 20 : 12;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.ellipse(cx, cy, fish.width / 2, fish.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(fish.x, cy);
  ctx.lineTo(fish.x - fish.width * 0.3, cy - fish.height * 0.4);
  ctx.lineTo(fish.x - fish.width * 0.3, cy + fish.height * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0b0b1a';
  ctx.beginPath();
  ctx.arc(fish.x + fish.width * 0.68, cy - fish.height * 0.1, 1.6, 0, Math.PI * 2);
  ctx.fill();

  if (fish.isRare) {
    const pulse = 0.5 + Math.sin(performance.now() / 150) * 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3 + pulse * 0.3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, fish.width / 1.4, fish.height / 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawItem() {
  if (!item.active) {
    return;
  }
  const def = ITEM_DEFS[item.defIndex];
  const pulse = 0.5 + Math.sin(performance.now() / 150) * 0.5;

  ctx.save();
  ctx.shadowColor = def.color;
  ctx.shadowBlur = 16 + pulse * 6;
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.roundRect(item.x, item.y, item.width, item.height, 6);
  ctx.fill();

  ctx.strokeStyle = COLOR_WHITE;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(item.x + 3, item.y + 3, item.width - 6, item.height - 6);
  ctx.restore();
}

function drawShieldRing() {
  if (shieldTimer <= 0) {
    return;
  }
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const pulse = Math.sin(performance.now() / 150) * 3;

  ctx.save();
  ctx.shadowColor = COLOR_CYAN;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = COLOR_CYAN;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.7 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMagnetAura() {
  if (magnetTimer <= 0) {
    return;
  }
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const pulse = 0.25 + Math.sin(performance.now() / 200) * 0.12;

  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLOR_MAGENTA;
  ctx.shadowColor = COLOR_MAGENTA;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawScoreBoostGlow() {
  if (scoreBoostTimer <= 0) {
    return;
  }
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const pulse = Math.sin(performance.now() / 150) * 3;

  ctx.save();
  ctx.shadowColor = COLOR_GOLD;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = COLOR_GOLD;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.7 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSlowTimeAura() {
  if (slowTimeTimer <= 0) {
    return;
  }
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const pulse = 0.25 + Math.sin(performance.now() / 200) * 0.12;

  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLOR_LIGHTBLUE;
  ctx.shadowColor = COLOR_LIGHTBLUE;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, player.width * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRings() {
  rings.forEach((r) => {
    const progress = 1 - r.timer / r.maxTimer;
    const radius = progress * r.maxRadius;
    const alpha = r.timer / r.maxTimer;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 10;
    for (let i = 0; i < r.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / r.particleCount;
      const px = r.x + Math.cos(angle) * radius;
      const py = r.y + Math.sin(angle) * radius;
      const color = r.colors ? r.colors[i % r.colors.length] : r.color;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

const NOTICE_SLIDE_DISTANCE = 60;

// 通知の演出を「右からスライドイン → 表示 → フェードアウト」に統一するための共通ヘルパー。
// イン側は位置(offsetX)のみで表現し、アウト側はalphaのみで表現する。
function getNoticeAnimation(timer, duration, fadeFrames) {
  const introProgress = Math.min(1, (duration - timer) / fadeFrames);
  const outroProgress = Math.min(1, timer / fadeFrames);
  return {
    offsetX: (1 - introProgress) * NOTICE_SLIDE_DISTANCE,
    alpha: outroProgress,
  };
}

function drawAchievementNotice() {
  if (!currentAchievementNotice) {
    return;
  }
  const anim = getNoticeAnimation(currentAchievementNotice.timer, ACHIEVEMENT_NOTICE_DURATION, ACHIEVEMENT_FADE_FRAMES);
  const x = canvas.width - 20 + anim.offsetX;

  ctx.save();
  ctx.globalAlpha = anim.alpha;
  ctx.textAlign = 'right';
  ctx.shadowColor = COLOR_GOLD;
  ctx.shadowBlur = 14;
  ctx.fillStyle = COLOR_GOLD;
  ctx.font = '14px Orbitron, sans-serif';
  ctx.fillText('ACHIEVEMENT UNLOCKED', x, 28);
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText(currentAchievementNotice.title, x, 50);
  ctx.restore();
}

function drawSkinUnlockNotice() {
  if (!currentSkinUnlockNotice) {
    return;
  }
  const anim = getNoticeAnimation(currentSkinUnlockNotice.timer, SKIN_UNLOCK_NOTICE_DURATION, SKIN_UNLOCK_FADE_FRAMES);
  const baseY = currentAchievementNotice ? 86 : 28;
  const x = canvas.width - 20 + anim.offsetX;

  ctx.save();
  ctx.globalAlpha = anim.alpha;
  ctx.textAlign = 'right';
  ctx.shadowColor = COLOR_GOLD;
  ctx.shadowBlur = 14;
  ctx.fillStyle = COLOR_GOLD;
  ctx.font = '14px Orbitron, sans-serif';
  ctx.fillText('NEW SKIN!', x, baseY);
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText(currentSkinUnlockNotice.name, x, baseY + 22);
  ctx.fillStyle = COLOR_WHITE;
  ctx.font = '14px Orbitron, sans-serif';
  ctx.fillText('UNLOCKED!', x, baseY + 40);
  ctx.restore();
}

function drawMissionNotice() {
  if (!currentMissionNotice) {
    return;
  }
  const anim = getNoticeAnimation(currentMissionNotice.timer, MISSION_NOTICE_DURATION, MISSION_NOTICE_FADE_FRAMES);
  const baseY = 28 + (currentAchievementNotice ? 58 : 0) + (currentSkinUnlockNotice ? 58 : 0);
  const x = canvas.width - 20 + anim.offsetX;

  ctx.save();
  ctx.globalAlpha = anim.alpha;
  ctx.textAlign = 'right';
  ctx.shadowColor = COLOR_GOLD;
  ctx.shadowBlur = 14;
  ctx.fillStyle = COLOR_GOLD;
  ctx.font = '14px Orbitron, sans-serif';
  ctx.fillText('MISSION COMPLETE!', x, baseY);
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText(currentMissionNotice.title, x, baseY + 22);
  ctx.restore();
}

function drawComboPopup() {
  if (comboPopupTimer <= 0 || comboCount < 2) {
    return;
  }
  const alpha = Math.min(1, comboPopupTimer / 30);
  const tier = getComboTier(comboCount);
  const blur = tier.pulse ? tier.blur + Math.sin(performance.now() / 80) * 6 : tier.blur;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.shadowColor = tier.color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = tier.color;
  ctx.font = '26px Orbitron, sans-serif';
  ctx.fillText('COMBO x' + comboCount, canvas.width / 2, 70);
  ctx.restore();
}

function drawLevelUpRing() {
  if (levelUpTimer <= 0) {
    return;
  }
  const progress = 1 - levelUpTimer / LEVEL_UP_DURATION;
  const radius = progress * RING_MAX_RADIUS;
  const alpha = 1 - progress;
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLOR_PURPLE;
  ctx.shadowColor = COLOR_PURPLE;
  ctx.shadowBlur = 10;
  for (let i = 0; i < RING_PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / RING_PARTICLE_COUNT;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLevelUpText() {
  // MILESTONE表示と重なる場合はMILESTONEを優先し、演出が重ならないようにする
  if (levelUpTimer <= 0 || milestoneTimer > 0) {
    return;
  }
  const alpha = levelUpTimer / LEVEL_UP_DURATION;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = COLOR_GOLD;
  ctx.shadowBlur = 24;
  drawCenteredText('LEVEL UP!', canvas.height / 2 - 24, 28, COLOR_GOLD);
  ctx.shadowBlur = 30;
  drawCenteredText('LEVEL ' + level, canvas.height / 2 + 16, 34, COLOR_GOLD);
  ctx.restore();
}

function drawMilestone() {
  if (milestoneTimer <= 0) {
    return;
  }
  const alpha = Math.min(1, milestoneTimer / 20);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = COLOR_CYAN;
  ctx.shadowBlur = 22;
  drawCenteredText('MILESTONE!', canvas.height / 2 - 20, 32);
  drawCenteredText(milestoneScore + ' SCORE', canvas.height / 2 + 16, 22);
  ctx.restore();
}

function drawCenteredText(text, y, size, color) {
  ctx.textAlign = 'center';
  ctx.fillStyle = color || COLOR_CYAN;
  ctx.font = size + 'px Orbitron, sans-serif';
  ctx.fillText(text, canvas.width / 2, y);
}

// キーボード操作で「今どこを選択しているか」を一目で分かるようにするための
// 控えめなパルス拡大（選択中の項目にのみ適用する）
function drawPulsingCenteredText(text, y, size, color) {
  const scale = 1 + Math.sin(performance.now() / 200) * 0.05;
  const cx = canvas.width / 2;
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -y);
  drawCenteredText(text, y, size, color);
  ctx.restore();
}

function render() {
  ctx.save();
  if (shakeTimer > 0) {
    const amp = shakeMagnitude * (shakeTimer / SHAKE_DURATION);
    ctx.translate(randomRange(-amp, amp), randomRange(-amp, amp));
  }

  drawBackground();
  drawLevelUpGlow();
  drawStars();
  if (gameState === 'playing') {
    drawAmbientStars();
  }
  drawShootingStars();
  drawMoon();
  drawCity();
  drawHolograms();
  drawHorizon();
  drawGrid();
  drawGround();
  drawObstacle();
  drawFish();
  drawItem();
  drawTrail();
  drawParticles();
  drawPopupTexts();
  drawMagnetAura();
  drawSlowTimeAura();
  drawPlayer();
  drawShieldRing();
  drawScoreBoostGlow();
  drawLevelUpRing();
  drawRings();

  ctx.restore();

  if (gameState === 'playing') {
    drawHud();
    drawItemHud();
    drawComboPopup();
  }

  if (gameState === 'title') {
    const titleFloat = Math.sin(performance.now() / 600) * 6;

    ctx.save();
    ctx.shadowColor = COLOR_CYAN;
    ctx.shadowBlur = 20;
    drawCenteredText('NEON NEKO RUNNER', canvas.height / 2 - 150 + titleFloat, 38);
    ctx.restore();

    drawCenteredText('COLLECT FISH', canvas.height / 2 - 110, 14, COLOR_WHITE);
    drawCenteredText('AVOID OBSTACLES', canvas.height / 2 - 93, 14, COLOR_WHITE);

    drawCenteredText('BEST SCORE: ' + highScore, canvas.height / 2 - 64, 16);
    drawCenteredText('TOTAL FISH: ' + totalFishCount, canvas.height / 2 - 46, 16);
    drawCenteredText('ACHIEVEMENTS ' + unlockedAchievements.length + ' / ' + ACHIEVEMENTS.length + ' UNLOCKED', canvas.height / 2 - 28, 16);
    drawCenteredText('MODE : ' + currentMode.name.toUpperCase(), canvas.height / 2 - 8, 16, COLOR_GOLD);
    drawCenteredText('SKIN : ' + currentSkin.name.toUpperCase(), canvas.height / 2 + 10, 16, currentSkin.color);

    drawPulsingCenteredText('SPACE : START', canvas.height / 2 + 36, 16, COLOR_CYAN);
    drawCenteredText('M : MODE', canvas.height / 2 + 54, 14, COLOR_PURPLE);
    drawCenteredText('K : SKINS', canvas.height / 2 + 70, 14, COLOR_PURPLE);
    drawCenteredText('C : MISSIONS', canvas.height / 2 + 86, 14, COLOR_PURPLE);
    drawCenteredText('S : SETTINGS', canvas.height / 2 + 102, 14, COLOR_PURPLE);
    drawCenteredText('A : ACHIEVEMENTS', canvas.height / 2 + 118, 14, COLOR_PURPLE);
    drawCenteredText('R : RANKING', canvas.height / 2 + 134, 14, COLOR_PURPLE);
  } else if (gameState === 'achievements') {
    drawCenteredText('ACHIEVEMENTS', canvas.height / 2 - 160, 26);
    ACHIEVEMENTS.forEach((a, i) => {
      const unlocked = unlockedAchievements.includes(a.id);
      const mark = unlocked ? '✓' : '□';
      const color = unlocked ? COLOR_GOLD : COLOR_WHITE;
      drawCenteredText(mark + ' ' + a.title, canvas.height / 2 - 100 + i * 36, 20, color);
    });
    drawCenteredText('ESC / A : BACK', canvas.height / 2 + 130, 16);
  } else if (gameState === 'settings') {
    drawCenteredText('SETTINGS', canvas.height / 2 - 150, 26);

    const rows = [
      { label: 'BGM VOLUME', value: Math.round(bgmVolume * 100) + '%' },
      { label: 'SE VOLUME', value: Math.round(seVolume * 100) + '%' },
      { label: 'BGM', value: bgmEnabled ? 'ON' : 'OFF' },
      { label: 'SE', value: seEnabled ? 'ON' : 'OFF' },
    ];
    rows.forEach((row, i) => {
      const selected = i === settingsIndex;
      const color = selected ? COLOR_GOLD : COLOR_WHITE;
      const prefix = selected ? '> ' : '  ';
      const text = prefix + row.label + ' : ' + row.value;
      const y = canvas.height / 2 - 80 + i * 36;
      if (selected) {
        drawPulsingCenteredText(text, y, 18, color);
      } else {
        drawCenteredText(text, y, 18, color);
      }
    });
    drawCenteredText('ARROWS : SELECT / CHANGE', canvas.height / 2 + 110, 14, COLOR_PURPLE);
    drawCenteredText('ESC / S : BACK', canvas.height / 2 + 132, 14, COLOR_PURPLE);
  } else if (gameState === 'skins') {
    const skin = SKINS[skinIndex];
    const isEquipped = currentSkin.id === skin.id;

    drawCenteredText('SKINS', canvas.height / 2 - 150, 26);

    ctx.save();
    ctx.shadowColor = skin.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = skin.color;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 30, canvas.height / 2 - 110, 60, 60, 20);
    ctx.fill();
    ctx.restore();

    drawPulsingCenteredText(skin.name, canvas.height / 2 - 28, 22, skin.unlocked ? COLOR_WHITE : COLOR_PURPLE);

    if (isEquipped) {
      drawCenteredText('EQUIPPED', canvas.height / 2 - 4, 14, COLOR_GOLD);
    } else if (skin.unlocked) {
      drawCenteredText('UNLOCKED', canvas.height / 2 - 4, 14, COLOR_CYAN);
    } else {
      drawCenteredText('LOCKED : ' + getSkinUnlockHint(skin), canvas.height / 2 - 4, 14, COLOR_MAGENTA);
    }

    drawCenteredText('< ' + (skinIndex + 1) + ' / ' + SKINS.length + ' >', canvas.height / 2 + 30, 16, COLOR_WHITE);
    drawCenteredText('ARROWS : SWITCH   SPACE : EQUIP', canvas.height / 2 + 110, 14, COLOR_PURPLE);
    drawCenteredText('ESC / K : BACK', canvas.height / 2 + 132, 14, COLOR_PURPLE);
  } else if (gameState === 'modeSelect') {
    const mode = GAME_MODES[modeIndex];
    const isSelected = currentMode.id === mode.id;

    drawCenteredText('MODE SELECT', canvas.height / 2 - 150, 26);

    drawPulsingCenteredText(mode.name.toUpperCase(), canvas.height / 2 - 40, 24, COLOR_WHITE);
    drawCenteredText(mode.description, canvas.height / 2 - 10, 14, COLOR_WHITE);

    if (isSelected) {
      drawCenteredText('SELECTED', canvas.height / 2 + 20, 14, COLOR_GOLD);
    }

    drawCenteredText('< ' + (modeIndex + 1) + ' / ' + GAME_MODES.length + ' >', canvas.height / 2 + 50, 16, COLOR_WHITE);
    drawCenteredText('ARROWS : SWITCH   SPACE : SELECT', canvas.height / 2 + 110, 14, COLOR_PURPLE);
    drawCenteredText('ESC / M : BACK', canvas.height / 2 + 132, 14, COLOR_PURPLE);
  } else if (gameState === 'missions') {
    const mission = MISSIONS[missionIndex];
    const progress = Math.min(getMissionProgress(mission), mission.target);

    drawCenteredText('MISSIONS', canvas.height / 2 - 150, 26);
    drawPulsingCenteredText(mission.title, canvas.height / 2 - 104, 22, mission.completed ? COLOR_GOLD : COLOR_WHITE);
    drawCenteredText(mission.description, canvas.height / 2 - 76, 14, COLOR_WHITE);

    drawCenteredText('PROGRESS: ' + progress + ' / ' + mission.target, canvas.height / 2 - 44, 16, COLOR_CYAN);
    drawCenteredText(mission.completed ? 'COMPLETED' : 'INCOMPLETE', canvas.height / 2 - 20, 14, mission.completed ? COLOR_GOLD : COLOR_MAGENTA);
    drawCenteredText('REWARD: ' + getMissionRewardLabel(mission), canvas.height / 2 + 6, 14, COLOR_WHITE);

    drawCenteredText('< ' + (missionIndex + 1) + ' / ' + MISSIONS.length + ' >', canvas.height / 2 + 36, 16, COLOR_WHITE);
    drawCenteredText('ARROWS : SELECT', canvas.height / 2 + 110, 14, COLOR_PURPLE);
    drawCenteredText('ESC / C : BACK', canvas.height / 2 + 132, 14, COLOR_PURPLE);
  } else if (gameState === 'ranking') {
    drawCenteredText('TIME ATTACK RANKING', canvas.height / 2 - 150, 24);

    for (let i = 0; i < TIMEATTACK_RANKING_SIZE; i++) {
      const entry = timeAttackRanking[i];
      const y = canvas.height / 2 - 96 + i * 32;
      if (entry) {
        drawCenteredText((i + 1) + '.  ' + entry.score + '  ' + entry.date, y, 18, COLOR_WHITE);
      } else {
        drawCenteredText((i + 1) + '.  ---', y, 18, COLOR_PURPLE);
      }
    }

    drawCenteredText('ESC / R : BACK', canvas.height / 2 + 132, 14, COLOR_PURPLE);
  } else if (gameState === 'paused') {
    drawCenteredText('PAUSED', canvas.height / 2 - 40, 32);
    drawCenteredText('MODE : ' + currentMode.name.toUpperCase(), canvas.height / 2 - 4, 16, COLOR_GOLD);
    drawCenteredText('SKIN : ' + currentSkin.name.toUpperCase(), canvas.height / 2 + 16, 16, currentSkin.color);
    drawCenteredText('PRESS P TO RESUME', canvas.height / 2 + 44, 18);
  } else if (gameState === 'gameover' && currentMode.id === 'timeAttack') {
    const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
    if (blinkOn) {
      drawCenteredText(isTimeUp ? 'TIME UP!' : 'GAME OVER', canvas.height / 2 - 70, 34);
    }
    if (isNewRecord) {
      const pulse = 22 + Math.sin(performance.now() / 120) * 6;
      ctx.save();
      ctx.shadowColor = COLOR_GOLD;
      ctx.shadowBlur = pulse;
      drawCenteredText('NEW RECORD!', canvas.height / 2 - 40, 22, COLOR_GOLD);
      ctx.restore();
    }
    drawCenteredText('SCORE: ' + score, canvas.height / 2 - 14, 18);
    drawCenteredText('HIGH SCORE: ' + highScore, canvas.height / 2 + 6, 16);
    drawCenteredText('FISH: ' + fishCollectedThisRun, canvas.height / 2 + 26, 16);
    drawCenteredText('RARE FISH: ' + rareFishCollectedThisRun, canvas.height / 2 + 44, 16);
    drawCenteredText('MODE: ' + currentMode.name.toUpperCase(), canvas.height / 2 + 62, 16, COLOR_GOLD);
    drawCenteredText('SPACE TO RESTART', canvas.height / 2 + 88, 18);
  } else if (gameState === 'gameover') {
    const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
    if (blinkOn) {
      drawCenteredText('GAME OVER', canvas.height / 2 - 46, 34);
    }
    if (isNewRecord) {
      const pulse = 22 + Math.sin(performance.now() / 120) * 6;
      ctx.save();
      ctx.shadowColor = COLOR_GOLD;
      ctx.shadowBlur = pulse;
      drawCenteredText('NEW RECORD!', canvas.height / 2 - 14, 24, COLOR_GOLD);
      ctx.restore();
    }
    drawCenteredText('SCORE ' + score, canvas.height / 2 + 10, 20);
    drawCenteredText('FISH ' + fishCollectedThisRun, canvas.height / 2 + 32, 18);
    drawCenteredText('SPACE TO RESTART', canvas.height / 2 + 62, 20);
  }

  drawLevelUpText();
  drawMilestone();

  if (gameOverFlashTimer > 0) {
    ctx.fillStyle = `rgba(255, 30, 30, ${(gameOverFlashTimer / GAME_OVER_FLASH_DURATION) * 0.35})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawAchievementNotice();
  drawSkinUnlockNotice();
  drawMissionNotice();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

playBgm('title');
requestAnimationFrame(loop);
