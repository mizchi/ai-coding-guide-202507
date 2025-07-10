import { Enemy, Vector2, Player } from './types';
import { distance, normalize, getRandomEdgePosition } from './utils';

export class EnemyManager {
  private enemies: Enemy[] = [];
  private canvas: { width: number; height: number };
  private spawnTimer: number = 0;
  private spawnInterval: number = 1000; // 1秒間隔
  private wave: number = 1;

  constructor(canvas: { width: number; height: number }) {
    this.canvas = canvas;
  }

  update(deltaTime: number, player: Player, currentWave: number): void {
    this.wave = currentWave;
    this.spawnTimer += deltaTime * 1000;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
      this.spawnInterval = Math.max(300, 1000 - (this.wave * 50));
    }

    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      const direction = normalize({
        x: player.position.x - enemy.position.x,
        y: player.position.y - enemy.position.y
      });

      enemy.velocity.x = direction.x * enemy.speed * deltaTime;
      enemy.velocity.y = direction.y * enemy.speed * deltaTime;

      enemy.position.x += enemy.velocity.x;
      enemy.position.y += enemy.velocity.y;

      if (distance(enemy.position, player.position) < enemy.size + player.size) {
        enemy.active = false;
      }
    });

    this.enemies = this.enemies.filter(enemy => enemy.active);
  }

  private spawnEnemy(): void {
    const position = getRandomEdgePosition(this.canvas.width, this.canvas.height);
    const enemyTypes = ['basic', 'fast', 'strong'];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    let enemy: Enemy;
    
    switch (type) {
      case 'fast':
        enemy = {
          position,
          velocity: { x: 0, y: 0 },
          size: 8,
          active: true,
          health: 30,
          damage: 15,
          speed: 150 + (this.wave * 10),
          type: 'fast'
        };
        break;
      case 'strong':
        enemy = {
          position,
          velocity: { x: 0, y: 0 },
          size: 18,
          active: true,
          health: 100,
          damage: 30,
          speed: 60 + (this.wave * 5),
          type: 'strong'
        };
        break;
      default:
        enemy = {
          position,
          velocity: { x: 0, y: 0 },
          size: 12,
          active: true,
          health: 50,
          damage: 20,
          speed: 80 + (this.wave * 8),
          type: 'basic'
        };
    }

    this.enemies.push(enemy);
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }

  removeEnemy(index: number): void {
    if (index >= 0 && index < this.enemies.length) {
      this.enemies.splice(index, 1);
    }
  }

  render(svg: SVGElement): void {
    const existingEnemies = svg.querySelectorAll('.enemy');
    existingEnemies.forEach(enemy => enemy.remove());

    this.enemies.forEach((enemy, index) => {
      if (!enemy.active) return;

      const enemyElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      enemyElement.setAttribute('class', 'enemy');
      enemyElement.setAttribute('cx', enemy.position.x.toString());
      enemyElement.setAttribute('cy', enemy.position.y.toString());
      enemyElement.setAttribute('r', enemy.size.toString());
      
      switch (enemy.type) {
        case 'fast':
          enemyElement.setAttribute('fill', '#FF5722');
          enemyElement.setAttribute('stroke', '#D32F2F');
          break;
        case 'strong':
          enemyElement.setAttribute('fill', '#9C27B0');
          enemyElement.setAttribute('stroke', '#7B1FA2');
          break;
        default:
          enemyElement.setAttribute('fill', '#F44336');
          enemyElement.setAttribute('stroke', '#C62828');
      }
      
      enemyElement.setAttribute('stroke-width', '2');
      svg.appendChild(enemyElement);
    });
  }
}