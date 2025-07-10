import { Bullet, Vector2, Player, Enemy } from './types';
import { distance, normalize } from './utils';

export class BulletManager {
  private bullets: Bullet[] = [];
  private shootTimer: number = 0;
  private shootInterval: number = 250; // 0.25秒間隔

  update(deltaTime: number, player: Player, enemies: Enemy[]): void {
    this.shootTimer += deltaTime * 1000;

    if (this.shootTimer >= this.shootInterval && enemies.length > 0) {
      this.shootAtNearestEnemy(player, enemies);
      this.shootTimer = 0;
    }

    this.bullets.forEach(bullet => {
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

    this.bullets = this.bullets.filter(bullet => bullet.active);
  }

  private shootAtNearestEnemy(player: Player, enemies: Enemy[]): void {
    const activeEnemies = enemies.filter(enemy => enemy.active);
    if (activeEnemies.length === 0) return;

    let nearestEnemy = activeEnemies[0];
    let nearestDistance = distance(player.position, nearestEnemy.position);

    for (const enemy of activeEnemies) {
      const dist = distance(player.position, enemy.position);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestEnemy = enemy;
      }
    }

    const direction = normalize({
      x: nearestEnemy.position.x - player.position.x,
      y: nearestEnemy.position.y - player.position.y
    });

    const bulletSpeed = 400;
    const bullet: Bullet = {
      position: { x: player.position.x, y: player.position.y },
      velocity: { x: direction.x * bulletSpeed, y: direction.y * bulletSpeed },
      size: 3,
      active: true,
      damage: 25,
      range: 300,
      distanceTraveled: 0
    };

    this.bullets.push(bullet);
  }

  checkCollisions(enemies: Enemy[]): number {
    let score = 0;
    
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;

      enemies.forEach(enemy => {
        if (!enemy.active) return;

        const dist = distance(bullet.position, enemy.position);
        if (dist < bullet.size + enemy.size) {
          bullet.active = false;
          enemy.health -= bullet.damage;
          
          if (enemy.health <= 0) {
            enemy.active = false;
            score += this.getEnemyScore(enemy.type);
          }
        }
      });
    });

    return score;
  }

  private getEnemyScore(enemyType: string): number {
    switch (enemyType) {
      case 'fast': return 15;
      case 'strong': return 25;
      default: return 10;
    }
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  render(svg: SVGElement): void {
    const existingBullets = svg.querySelectorAll('.bullet');
    existingBullets.forEach(bullet => bullet.remove());

    this.bullets.forEach(bullet => {
      if (!bullet.active) return;

      const bulletElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bulletElement.setAttribute('class', 'bullet');
      bulletElement.setAttribute('cx', bullet.position.x.toString());
      bulletElement.setAttribute('cy', bullet.position.y.toString());
      bulletElement.setAttribute('r', bullet.size.toString());
      bulletElement.setAttribute('fill', '#FFEB3B');
      bulletElement.setAttribute('stroke', '#FF9800');
      bulletElement.setAttribute('stroke-width', '1');

      svg.appendChild(bulletElement);
    });
  }
}