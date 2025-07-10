import { describe, it, expect } from 'vitest';
import { distance, normalize, randomRange, clamp, getRandomEdgePosition } from '../src/utils';

describe('Utils', () => {
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });

    it('should return 0 for same points', () => {
      const a = { x: 10, y: 10 };
      const b = { x: 10, y: 10 };
      expect(distance(a, b)).toBe(0);
    });
  });

  describe('normalize', () => {
    it('should normalize a vector', () => {
      const vector = { x: 3, y: 4 };
      const normalized = normalize(vector);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });

    it('should handle zero vector', () => {
      const vector = { x: 0, y: 0 };
      const normalized = normalize(vector);
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });
  });

  describe('randomRange', () => {
    it('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomRange(5, 10);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('getRandomEdgePosition', () => {
    it('should return position outside canvas bounds', () => {
      const width = 800;
      const height = 600;
      
      for (let i = 0; i < 100; i++) {
        const pos = getRandomEdgePosition(width, height);
        const isOutside = pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height;
        expect(isOutside).toBe(true);
      }
    });
  });
});