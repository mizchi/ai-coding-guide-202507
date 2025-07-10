import { describe, it, expect } from 'vitest';
import { distance } from '../src/distance';

describe('distance function', () => {
  it('should calculate distance between two points at origin', () => {
    expect(distance(0, 0, 0, 0)).toBe(0);
  });

  it('should calculate distance on horizontal line', () => {
    expect(distance(0, 0, 3, 0)).toBe(3);
    expect(distance(3, 0, 0, 0)).toBe(3);
  });

  it('should calculate distance on vertical line', () => {
    expect(distance(0, 0, 0, 4)).toBe(4);
    expect(distance(0, 4, 0, 0)).toBe(4);
  });

  it('should calculate distance for 3-4-5 triangle', () => {
    expect(distance(0, 0, 3, 4)).toBeCloseTo(5);
    expect(distance(3, 4, 0, 0)).toBeCloseTo(5);
  });

  it('should calculate distance with negative coordinates', () => {
    expect(distance(-3, -4, 0, 0)).toBeCloseTo(5);
    expect(distance(0, 0, -3, -4)).toBeCloseTo(5);
  });

  it('should handle decimal coordinates', () => {
    expect(distance(1.5, 2.5, 4.5, 6.5)).toBeCloseTo(5);
  });
});