export interface Vector2 {
  x: number;
  y: number;
}

export interface GameObject {
  position: Vector2;
  velocity: Vector2;
  size: number;
  active: boolean;
}

export interface Player extends GameObject {
  health: number;
  maxHealth: number;
  speed: number;
  level: number;
  experience: number;
  experienceToNext: number;
  bulletSpeed: number;
  bulletCount: number;
  bulletSpread: number;
}

export interface Enemy extends GameObject {
  health: number;
  damage: number;
  speed: number;
  type: string;
}

export interface Bullet extends GameObject {
  damage: number;
  range: number;
  distanceTraveled: number;
}

export interface ExperienceOrb extends GameObject {
  value: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  experienceOrbs: ExperienceOrb[];
  score: number;
  wave: number;
  gameTime: number;
  keys: { [key: string]: boolean };
}