import React from 'react';
import { GameState } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  gameRunning: boolean;
  onStart: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, gameRunning, onStart }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#2d2d2d'
    }}>
      <div style={{ 
        border: '2px solid #555', 
        backgroundColor: '#1a1a1a',
        position: 'relative'
      }}>
        <svg width="800" height="600" viewBox="0 0 800 600">
          {!gameRunning && (
            <>
              <text
                x="400"
                y="300"
                textAnchor="middle"
                fontSize="24"
                fill="white"
                style={{ cursor: 'pointer' }}
                onClick={onStart}
              >
                スペースキーでゲーム開始
              </text>
              <text
                x="400"
                y="350"
                textAnchor="middle"
                fontSize="16"
                fill="white"
              >
                WASD or 矢印キーで移動、自動で射撃
              </text>
            </>
          )}
          
          {gameRunning && gameState.player.active && (
            <circle
              cx={gameState.player.position.x}
              cy={gameState.player.position.y}
              r={gameState.player.size}
              fill="#4CAF50"
              stroke="#2E7D32"
              strokeWidth="2"
            />
          )}
          
          {gameRunning && gameState.enemies.map((enemy, index) => {
            let fillColor = "#F44336";
            let strokeColor = "#C62828";
            
            switch (enemy.type) {
              case 'fast':
                fillColor = "#FF5722";
                strokeColor = "#D32F2F";
                break;
              case 'strong':
                fillColor = "#9C27B0";
                strokeColor = "#7B1FA2";
                break;
              case 'giant':
                fillColor = "#3F51B5";
                strokeColor = "#303F9F";
                break;
              default:
                fillColor = "#F44336";
                strokeColor = "#C62828";
            }
            
            return enemy.active ? (
              <circle
                key={index}
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
              />
            ) : null;
          })}
          
          {gameRunning && gameState.bullets.map((bullet, index) => (
            bullet.active && (
              <circle
                key={index}
                cx={bullet.position.x}
                cy={bullet.position.y}
                r={bullet.size}
                fill="#FFEB3B"
                stroke="#FF9800"
                strokeWidth="1"
              />
            )
          ))}
          
          {gameRunning && gameState.experienceOrbs.map((orb, index) => (
            orb.active && (
              <circle
                key={index}
                cx={orb.position.x}
                cy={orb.position.y}
                r={orb.size}
                fill="#00E676"
                stroke="#00C853"
                strokeWidth="1"
              />
            )
          ))}
        </svg>
        
        {gameRunning && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            color: 'white',
            fontSize: '16px',
            zIndex: 100
          }}>
            <div>Score: {gameState.score}</div>
            <div>Wave: {gameState.wave}</div>
            <div>Health: {gameState.player.health}/{gameState.player.maxHealth}</div>
            <div>Level: {gameState.player.level}</div>
            <div>EXP: {gameState.player.experience}/{gameState.player.experienceToNext}</div>
          </div>
        )}
      </div>
    </div>
  );
};