import { Player, Vector2 } from './types';
import { clamp } from './utils';

export class PlayerController {
  private player: Player;
  private canvas: { width: number; height: number };

  constructor(canvas: { width: number; height: number }) {
    this.canvas = canvas;
    this.player = {
      position: { x: canvas.width / 2, y: canvas.height / 2 },
      velocity: { x: 0, y: 0 },
      size: 15,
      active: true,
      health: 100,
      maxHealth: 100,
      speed: 200
    };
  }

  update(deltaTime: number, keys: { [key: string]: boolean }): void {
    this.velocity.x = 0;
    this.velocity.y = 0;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      this.velocity.x = -1;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      this.velocity.x = 1;
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      this.velocity.y = -1;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      this.velocity.y = 1;
    }

    const magnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (magnitude > 0) {
      this.velocity.x = (this.velocity.x / magnitude) * this.player.speed * deltaTime;
      this.velocity.y = (this.velocity.y / magnitude) * this.player.speed * deltaTime;
    }

    this.player.position.x += this.velocity.x;
    this.player.position.y += this.velocity.y;

    this.player.position.x = clamp(this.player.position.x, this.player.size, this.canvas.width - this.player.size);
    this.player.position.y = clamp(this.player.position.y, this.player.size, this.canvas.height - this.player.size);

    this.player.velocity = this.velocity;
  }

  get velocity(): Vector2 {
    return this.player.velocity;
  }

  getPlayer(): Player {
    return this.player;
  }

  takeDamage(damage: number): void {
    this.player.health = Math.max(0, this.player.health - damage);
    if (this.player.health <= 0) {
      this.player.active = false;
    }
  }

  render(svg: SVGElement): void {
    const existingPlayer = svg.querySelector('#player');
    if (existingPlayer) {
      existingPlayer.remove();
    }

    const playerElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    playerElement.setAttribute('id', 'player');
    playerElement.setAttribute('cx', this.player.position.x.toString());
    playerElement.setAttribute('cy', this.player.position.y.toString());
    playerElement.setAttribute('r', this.player.size.toString());
    playerElement.setAttribute('fill', '#4CAF50');
    playerElement.setAttribute('stroke', '#2E7D32');
    playerElement.setAttribute('stroke-width', '2');

    svg.appendChild(playerElement);
  }
}