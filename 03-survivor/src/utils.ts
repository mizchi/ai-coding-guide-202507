import { Vector2 } from './types';

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(vector: Vector2): Vector2 {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getRandomEdgePosition(width: number, height: number): Vector2 {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: // top
      return { x: randomRange(0, width), y: -50 };
    case 1: // right
      return { x: width + 50, y: randomRange(0, height) };
    case 2: // bottom
      return { x: randomRange(0, width), y: height + 50 };
    case 3: // left
      return { x: -50, y: randomRange(0, height) };
    default:
      return { x: 0, y: 0 };
  }
}