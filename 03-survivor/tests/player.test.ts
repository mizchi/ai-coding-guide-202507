import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerController } from '../src/player';

describe('PlayerController', () => {
  let playerController: PlayerController;
  const canvas = { width: 800, height: 600 };

  beforeEach(() => {
    playerController = new PlayerController(canvas);
  });

  describe('initialization', () => {
    it('should initialize player at center', () => {
      const player = playerController.getPlayer();
      expect(player.position.x).toBe(400);
      expect(player.position.y).toBe(300);
      expect(player.active).toBe(true);
      expect(player.health).toBe(100);
    });
  });

  describe('movement', () => {
    it('should move left when left key is pressed', () => {
      const keys = { 'ArrowLeft': true };
      const initialX = playerController.getPlayer().position.x;
      
      playerController.update(0.1, keys);
      
      expect(playerController.getPlayer().position.x).toBeLessThan(initialX);
    });

    it('should move right when right key is pressed', () => {
      const keys = { 'ArrowRight': true };
      const initialX = playerController.getPlayer().position.x;
      
      playerController.update(0.1, keys);
      
      expect(playerController.getPlayer().position.x).toBeGreaterThan(initialX);
    });

    it('should stay within canvas bounds', () => {
      const keys = { 'ArrowLeft': true };
      
      for (let i = 0; i < 100; i++) {
        playerController.update(0.1, keys);
      }
      
      const player = playerController.getPlayer();
      expect(player.position.x).toBeGreaterThanOrEqual(player.size);
      expect(player.position.x).toBeLessThanOrEqual(canvas.width - player.size);
    });
  });

  describe('damage', () => {
    it('should take damage correctly', () => {
      playerController.takeDamage(30);
      expect(playerController.getPlayer().health).toBe(70);
    });

    it('should become inactive when health reaches 0', () => {
      playerController.takeDamage(100);
      expect(playerController.getPlayer().health).toBe(0);
      expect(playerController.getPlayer().active).toBe(false);
    });
  });
});