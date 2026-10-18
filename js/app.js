/* ============================================
   APP.JS - Initialization & Event Wiring
   Connects Game (logic), UI (rendering) and Animations.
   ============================================ */

const App = (() => {
  const RESET_CONFIRM_TIMEOUT_MS = 4000;

  let isRoundTransitioning = false;
  let isResetConfirmationArmed = false;
  let resetConfirmationTimer = null;

  function init() {
    UI.cacheElements();
    bindEvents();
    UI.updateScores(Game.getScores());
    UI.boardEnter();
    UI.updateTurnIndicator(Game.getState().currentPlayer);
  }

  function bindEvents() {
    document.querySelectorAll('.cell').forEach((cell) => {
      const index = UI.cellIndexFromElement(cell);
      cell.addEventListener('click', () => handleCellClick(index));
      cell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCellClick(index);
        }
      });
    });

    document.getElementById('btn-restart').addEventListener('click', handleNewGame);
    document.getElementById('btn-reset-scores').addEventListener('click', handleResetScoresClick);
  }

  function handleCellClick(index) {
    if (isRoundTransitioning) return;

    const result = Game.makeMove(index);
    if (!result.success) return;

    UI.renderCell(index, result.player);

    if (result.gameOver) {
      UI.disableBoard();
      UI.resetTurnIndicator();
      UI.updateScores(Game.getScores(), result.winner);

      if (result.winner === 'draw') {
        UI.showDrawMessage();
        UI.triggerDrawEffect();
      } else {
        UI.showWinnerMessage(result.winner);
        UI.highlightWinningCells(result.winningLine, result.winner);
        UI.triggerCelebration();
      }
    } else {
      UI.updateTurnIndicator(Game.getState().currentPlayer);
    }
  }

  function handleNewGame() {
    if (isRoundTransitioning) return;
    isRoundTransitioning = true;

    UI.boardRestart(() => {
      Game.reset();
      UI.boardEnter();
      UI.updateTurnIndicator(Game.getState().currentPlayer);
      UI.updateScores(Game.getScores());
      isRoundTransitioning = false;
    });
  }

  /* Two-step inline confirmation: first click arms the button,
     second click within the timeout actually erases the scores. */
  function handleResetScoresClick() {
    if (!isResetConfirmationArmed) {
      armResetConfirmation();
      return;
    }

    disarmResetConfirmation();
    Game.resetAll();
    UI.updateScores(Game.getState().scores);
    UI.resetTurnIndicator();
  }

  function armResetConfirmation() {
    isResetConfirmationArmed = true;

    const btn = document.getElementById('btn-reset-scores');
    btn.classList.add('confirming');
    btn.setAttribute('aria-label', 'Click again to permanently erase all scores');
    document.getElementById('btn-reset-scores-text').textContent = 'Sure?';

    resetConfirmationTimer = window.setTimeout(
      disarmResetConfirmation,
      RESET_CONFIRM_TIMEOUT_MS
    );
  }

  function disarmResetConfirmation() {
    isResetConfirmationArmed = false;
    window.clearTimeout(resetConfirmationTimer);
    resetConfirmationTimer = null;

    const btn = document.getElementById('btn-reset-scores');
    btn.classList.remove('confirming');
    btn.removeAttribute('aria-label');
    document.getElementById('btn-reset-scores-text').textContent = 'Reset Scores';
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
