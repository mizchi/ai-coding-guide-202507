import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Player, Enemy, Bullet, ExperienceOrb } from '../types';
import { distance } from '../utils';

let lastShotTimeRef = { current: 0 };
let lastEnemySpawnRef = { current: 0 };

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    player: {
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      size: 15,
      active: true,
      health: 100,
      maxHealth: 100,
      speed: 200,
      level: 1,
      experience: 0,
      experienceToNext: 10,
      bulletSpeed: 400,
      bulletCount: 3,
      bulletSpread: 0.3
    },
    enemies: [],
    bullets: [],
    experienceOrbs: [],
    score: 0,
    wave: 1,
    gameTime: 0,
    keys: {}
  });

  const [gameRunning, setGameRunning] = useState(false);
  const lastTimeRef = useRef(0);
  const gameLoopRef = useRef<number>();

  const startGame = useCallback(() => {
    setGameRunning(true);
    lastTimeRef.current = performance.now();
    lastShotTimeRef.current = 0;
    lastEnemySpawnRef.current = 0;
  }, []);

  const stopGame = useCallback(() => {
    setGameRunning(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [event.key]: true }
    }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [event.key]: false }
    }));
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const gameLoop = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    setGameState(prev => {
      const newState = { ...prev };
      
      newState.gameTime += deltaTime;
      
      const waveInterval = 30;
      if (newState.gameTime > waveInterval * newState.wave) {
        newState.wave++;
      }

      updatePlayer(newState, deltaTime);
      updateEnemies(newState, deltaTime, currentTime);
      updateBullets(newState, deltaTime, currentTime);
      updateExperienceOrbs(newState, deltaTime);
      checkCollisions(newState);
      checkLevelUp(newState);

      if (newState.player.health <= 0) {
        newState.player.active = false;
        return newState;
      }

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameRunning, gameLoop]);

  return {
    gameState,
    gameRunning,
    startGame,
    stopGame
  };
}

function updatePlayer(state: GameState, deltaTime: number) {
  const { player, keys } = state;
  
  let vx = 0, vy = 0;
  
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) vx = -1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) vx = 1;
  if (keys['ArrowUp'] || keys['w'] || keys['W']) vy = -1;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) vy = 1;

  const magnitude = Math.sqrt(vx * vx + vy * vy);
  if (magnitude > 0) {
    vx = (vx / magnitude) * player.speed * deltaTime;
    vy = (vy / magnitude) * player.speed * deltaTime;
  }

  player.position.x = Math.max(player.size, Math.min(800 - player.size, player.position.x + vx));
  player.position.y = Math.max(player.size, Math.min(600 - player.size, player.position.y + vy));
  
  player.velocity = { x: vx, y: vy };
}

function updateEnemies(state: GameState, deltaTime: number, currentTime: number) {
  const spawnInterval = Math.max(100, 500 - state.wave * 20); // 大幅にスポーン間隔を短縮
  
  if (currentTime - lastEnemySpawnRef.current > spawnInterval) {
    // 複数の敵を同時にスポーン
    const enemyCount = Math.min(5, 1 + Math.floor(state.wave / 2));
    for (let i = 0; i < enemyCount; i++) {
      spawnEnemy(state);
    }
    lastEnemySpawnRef.current = currentTime;
  }

  state.enemies.forEach(enemy => {
    if (!enemy.active) return;

    const dx = state.player.position.x - enemy.position.x;
    const dy = state.player.position.y - enemy.position.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    if (magnitude > 0) {
      enemy.velocity.x = (dx / magnitude) * enemy.speed * deltaTime;
      enemy.velocity.y = (dy / magnitude) * enemy.speed * deltaTime;
    }

    enemy.position.x += enemy.velocity.x;
    enemy.position.y += enemy.velocity.y;
  });

  state.enemies = state.enemies.filter(enemy => enemy.active);
}

function updateBullets(state: GameState, deltaTime: number, currentTime: number) {
  const shootInterval = Math.max(50, 200 - state.player.level * 10); // レベルが上がると発射間隔が短くなる
  
  if (currentTime - lastShotTimeRef.current > shootInterval && state.enemies.length > 0) {
    shootMultipleBullets(state);
    lastShotTimeRef.current = currentTime;
  }

  state.bullets.forEach(bullet => {
    if (!bullet.active) return;

    bullet.position.x += bullet.velocity.x * deltaTime;
    bullet.position.y += bullet.velocity.y * deltaTime;

    bullet.distanceTraveled += Math.sqrt(
      bullet.velocity.x * bullet.velocity.x + bullet.velocity.y * bullet.velocity.y
    ) * deltaTime;

    if (bullet.distanceTraveled > bullet.range) {
      bullet.active = false;
    }
  });

  state.bullets = state.bullets.filter(bullet => bullet.active);
}

function spawnEnemy(state: GameState) {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  
  switch (side) {
    case 0: x = Math.random() * 800; y = -50; break;
    case 1: x = 850; y = Math.random() * 600; break;
    case 2: x = Math.random() * 800; y = 650; break;
    case 3: x = -50; y = Math.random() * 600; break;
    default: x = 0; y = 0;
  }

  // ランダムに敵タイプを選択
  const enemyTypes = ['basic', 'fast', 'strong', 'giant'];
  const weights = [50, 30, 15, 5]; // 出現確率の重み
  let randomWeight = Math.random() * 100;
  let selectedType = 'basic';
  
  for (let i = 0; i < weights.length; i++) {
    if (randomWeight < weights[i]) {
      selectedType = enemyTypes[i];
      break;
    }
    randomWeight -= weights[i];
  }

  let enemy: Enemy;
  
  switch (selectedType) {
    case 'fast':
      enemy = {
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: 8,
        active: true,
        health: 25,
        damage: 15,
        speed: 150 + state.wave * 15,
        type: 'fast'
      };
      break;
    case 'strong':
      enemy = {
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: 15,
        active: true,
        health: 100,
        damage: 30,
        speed: 60 + state.wave * 5,
        type: 'strong'
      };
      break;
    case 'giant':
      enemy = {
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: 25,
        active: true,
        health: 200,
        damage: 50,
        speed: 40 + state.wave * 3,
        type: 'giant'
      };
      break;
    default:
      enemy = {
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: 12,
        active: true,
        health: 50,
        damage: 20,
        speed: 80 + state.wave * 8,
        type: 'basic'
      };
  }

  state.enemies.push(enemy);
}

function shootMultipleBullets(state: GameState) {
  const activeEnemies = state.enemies.filter(enemy => enemy.active);
  if (activeEnemies.length === 0) return;

  let nearestEnemy = activeEnemies[0];
  let nearestDistance = distance(state.player.position, nearestEnemy.position);

  for (const enemy of activeEnemies) {
    const dist = distance(state.player.position, enemy.position);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestEnemy = enemy;
    }
  }

  const dx = nearestEnemy.position.x - state.player.position.x;
  const dy = nearestEnemy.position.y - state.player.position.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  if (magnitude > 0) {
    const baseAngle = Math.atan2(dy, dx);
    const bulletCount = state.player.bulletCount;
    const spread = state.player.bulletSpread;
    
    // 複数の弾を扇状に撃つ
    for (let i = 0; i < bulletCount; i++) {
      const angleOffset = (i - (bulletCount - 1) / 2) * spread;
      const angle = baseAngle + angleOffset;
      
      const bullet: Bullet = {
        position: { x: state.player.position.x, y: state.player.position.y },
        velocity: { 
          x: Math.cos(angle) * state.player.bulletSpeed, 
          y: Math.sin(angle) * state.player.bulletSpeed 
        },
        size: 3,
        active: true,
        damage: 25,
        range: 300,
        distanceTraveled: 0
      };

      state.bullets.push(bullet);
    }
  }
}

function checkCollisions(state: GameState) {
  state.bullets.forEach(bullet => {
    if (!bullet.active) return;

    state.enemies.forEach(enemy => {
      if (!enemy.active) return;

      const dist = distance(bullet.position, enemy.position);
      if (dist < bullet.size + enemy.size) {
        bullet.active = false;
        enemy.health -= bullet.damage;
        
        if (enemy.health <= 0) {
          enemy.active = false;
          
          // 敵タイプに応じたスコアと経験値
          let scoreValue = 10;
          let expValue = 5;
          
          switch (enemy.type) {
            case 'fast':
              scoreValue = 15;
              expValue = 3;
              break;
            case 'strong':
              scoreValue = 25;
              expValue = 8;
              break;
            case 'giant':
              scoreValue = 50;
              expValue = 15;
              break;
            default:
              scoreValue = 10;
              expValue = 5;
          }
          
          state.score += scoreValue;
          
          // 経験値オーブをドロップ
          const expOrb: ExperienceOrb = {
            position: { x: enemy.position.x, y: enemy.position.y },
            velocity: { x: 0, y: 0 },
            size: 4,
            active: true,
            value: expValue
          };
          state.experienceOrbs.push(expOrb);
        }
      }
    });
  });

  state.enemies.forEach(enemy => {
    if (!enemy.active) return;

    const dist = distance(enemy.position, state.player.position);
    if (dist < enemy.size + state.player.size) {
      state.player.health = Math.max(0, state.player.health - 1);
      enemy.active = false;
    }
  });

  // プレイヤーと経験値オーブの衝突判定
  state.experienceOrbs.forEach(orb => {
    if (!orb.active) return;

    const dist = distance(orb.position, state.player.position);
    if (dist < orb.size + state.player.size) {
      orb.active = false;
      state.player.experience += orb.value;
    }
  });

  // 非アクティブなオーブを削除
  state.experienceOrbs = state.experienceOrbs.filter(orb => orb.active);
}

function updateExperienceOrbs(state: GameState, deltaTime: number) {
  state.experienceOrbs.forEach(orb => {
    if (!orb.active) return;

    // プレイヤーの方向に少し引き寄せる
    const dx = state.player.position.x - orb.position.x;
    const dy = state.player.position.y - orb.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) { // 50ピクセル以内なら引き寄せる
      const pullStrength = 100;
      orb.velocity.x = (dx / distance) * pullStrength * deltaTime;
      orb.velocity.y = (dy / distance) * pullStrength * deltaTime;
      
      orb.position.x += orb.velocity.x;
      orb.position.y += orb.velocity.y;
    }
  });
}

function checkLevelUp(state: GameState) {
  if (state.player.experience >= state.player.experienceToNext) {
    state.player.level++;
    state.player.experience -= state.player.experienceToNext;
    state.player.experienceToNext = Math.floor(state.player.experienceToNext * 1.5);
    
    // レベルアップ時の能力向上
    state.player.bulletSpeed += 50; // 弾速アップ
    state.player.maxHealth += 10; // 最大体力アップ
    state.player.health = Math.min(state.player.health + 20, state.player.maxHealth); // 体力回復
    
    // 弾数とスプレッドの増加
    if (state.player.level % 2 === 0) { // 2レベルごとに弾数増加
      state.player.bulletCount += 1;
    }
    if (state.player.level % 3 === 0) { // 3レベルごとにスプレッド増加
      state.player.bulletSpread += 0.1;
    }
  }
}