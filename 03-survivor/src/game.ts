import { GameState } from './types';
import { PlayerController } from './player';
import { EnemyManager } from './enemies';
import { BulletManager } from './bullets';
import { distance } from './utils';

export class Game {
  private gameState: GameState;
  private playerController: PlayerController;
  private enemyManager: EnemyManager;
  private bulletManager: BulletManager;
  private svg: SVGElement;
  private lastTime: number = 0;
  private gameRunning: boolean = false;
  private waveTimer: number = 0;
  private waveInterval: number = 30000; // 30秒でウェーブ更新

  constructor(svgElement: SVGElement) {
    this.svg = svgElement;
    const canvas = { width: 800, height: 600 };
    
    this.playerController = new PlayerController(canvas);
    this.enemyManager = new EnemyManager(canvas);
    this.bulletManager = new BulletManager();
    
    this.gameState = {
      player: this.playerController.getPlayer(),
      enemies: [],
      bullets: [],
      score: 0,
      wave: 1,
      gameTime: 0,
      keys: {}
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.gameState.keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.gameState.keys[e.key] = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && !this.gameRunning) {
        this.start();
      }
    });
  }

  start(): void {
    this.gameRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.gameRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    this.gameState.gameTime += deltaTime;
    this.waveTimer += deltaTime * 1000;

    if (this.waveTimer >= this.waveInterval) {
      this.gameState.wave++;
      this.waveTimer = 0;
    }

    this.playerController.update(deltaTime, this.gameState.keys);
    this.gameState.player = this.playerController.getPlayer();

    this.enemyManager.update(deltaTime, this.gameState.player, this.gameState.wave);
    this.gameState.enemies = this.enemyManager.getEnemies();

    this.bulletManager.update(deltaTime, this.gameState.player, this.gameState.enemies);
    this.gameState.bullets = this.bulletManager.getBullets();

    const scoreGained = this.bulletManager.checkCollisions(this.gameState.enemies);
    this.gameState.score += scoreGained;

    this.checkPlayerCollisions();

    if (!this.gameState.player.active) {
      this.gameOver();
    }
  }

  private checkPlayerCollisions(): void {
    this.gameState.enemies.forEach(enemy => {
      if (!enemy.active) return;

      const dist = distance(enemy.position, this.gameState.player.position);
      if (dist < enemy.size + this.gameState.player.size) {
        this.playerController.takeDamage(enemy.damage);
        enemy.active = false;
      }
    });
  }

  private render(): void {
    this.playerController.render(this.svg);
    this.enemyManager.render(this.svg);
    this.bulletManager.render(this.svg);
    this.updateUI();
  }

  private updateUI(): void {
    const scoreElement = document.getElementById('score');
    const waveElement = document.getElementById('wave');
    const healthElement = document.getElementById('health');

    if (scoreElement) scoreElement.textContent = this.gameState.score.toString();
    if (waveElement) waveElement.textContent = this.gameState.wave.toString();
    if (healthElement) healthElement.textContent = this.gameState.player.health.toString();
  }

  private gameOver(): void {
    this.gameRunning = false;
    alert(`ゲームオーバー！スコア: ${this.gameState.score}`);
  }

  getGameState(): GameState {
    return this.gameState;
  }
}