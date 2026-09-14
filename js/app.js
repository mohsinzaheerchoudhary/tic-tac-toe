/* ============================================
   APP.JS - Entry Point & Event Wiring
   Connects game logic, UI, and animations.
   ============================================ */

const App = (() => {
  function init() {
    UI.cacheElements();
    bindEvents();
    startNewGame();
  }

  function bindEvents() {
    document.querySelectorAll('.cell').forEach((cell, index) => {
      cell.addEventListener('click', () => handleCellClick(index));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCellClick(index);
        }
      });
    });

    document.getElementById('btn-restart').addEventListener('click', handleRestart);
  }

  function handleCellClick(index) {
    const result = Game.makeMove(index);

    if (!result.success) return;

    UI.renderCell(index, result.player);

    if (result.gameOver) {
      UI.disableBoard();
      Animations.stopTurnIndicator(document.getElementById('turn-indicator'));

      if (result.winner === 'draw') {
        UI.showDrawMessage();
        UI.triggerDrawEffect();
      } else {
        UI.showWinnerMessage(result.winner);
        UI.highlightWinningCells(result.winningLine, result.winner);
        UI.triggerCelebration();
      }

      UI.updateScores(Game.getScores());
    } else {
      UI.updateTurnIndicator(Game.getState().currentPlayer);
    }
  }

  function handleRestart() {
    UI.resetBoard(() => {
      Game.reset();
      const state = Game.getState();
      UI.updateTurnIndicator(state.currentPlayer);
      UI.updateScores(state.scores);
    });
  }

  function startNewGame() {
    const state = Game.getState();
    UI.updateTurnIndicator(state.currentPlayer);
    UI.updateScores(state.scores);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
