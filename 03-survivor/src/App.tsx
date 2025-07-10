import React, { useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { useGame } from './hooks/useGame';

function App() {
  const { gameState, gameRunning, startGame, stopGame } = useGame();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ' && !gameRunning) {
        startGame();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameRunning, startGame]);

  useEffect(() => {
    if (!gameState.player.active && gameRunning) {
      alert(`ゲームオーバー！スコア: ${gameState.score}`);
      stopGame();
    }
  }, [gameState.player.active, gameRunning, gameState.score, stopGame]);

  return (
    <GameCanvas
      gameState={gameState}
      gameRunning={gameRunning}
      onStart={startGame}
    />
  );
}

export default App;