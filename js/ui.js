/* ============================================
   UI.JS - DOM Manipulation & Rendering
   Bridges game logic with the visual layer.
   ============================================ */

const UI = (() => {
  const elements = {};

  function cacheElements() {
    elements.board = document.getElementById('board');
    elements.boardContainer = document.getElementById('board-container');
    elements.cells = document.querySelectorAll('.cell');
    elements.turnIndicator = document.getElementById('turn-indicator');
    elements.turnPlayer = document.getElementById('turn-player');
    elements.gameMessage = document.getElementById('game-message');
    elements.messageArea = document.getElementById('message-area');
    elements.btnRestart = document.getElementById('btn-restart');
    elements.scoreX = document.getElementById('score-x');
    elements.scoreO = document.getElementById('score-o');
    elements.scoreDraw = document.getElementById('score-draw');
    elements.celebrationContainer = document.getElementById('celebration-container');
  }

  function createMarkSVG(player) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.classList.add(player === 'X' ? 'mark-x' : 'mark-o');

    if (player === 'X') {
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '20');
      line1.setAttribute('y1', '20');
      line1.setAttribute('x2', '80');
      line1.setAttribute('y2', '80');

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '80');
      line2.setAttribute('y1', '20');
      line2.setAttribute('x2', '20');
      line2.setAttribute('y2', '80');

      svg.appendChild(line1);
      svg.appendChild(line2);
    } else {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '30');
      svg.appendChild(circle);
    }

    return svg;
  }

  function renderCell(index, player) {
    const cell = elements.cells[index];
    if (!cell || cell.querySelector('svg')) return;

    cell.innerHTML = '';
    const mark = createMarkSVG(player);
    cell.appendChild(mark);
    cell.classList.add('cell-taken');

    Animations.animateCellPress(cell);
    Animations.animateMarkAppear(mark, player);
  }

  function updateTurnIndicator(currentPlayer) {
    elements.turnPlayer.textContent = currentPlayer;
    elements.turnPlayer.className = 'turn-player';

    void elements.turnPlayer.offsetWidth;

    Animations.addClass(elements.turnPlayer, `player-${currentPlayer.toLowerCase()}`);
    Animations.animateTurnIndicator(elements.turnIndicator);
  }

  function highlightWinningCells(winningLine, player) {
    winningLine.forEach((index) => {
      const cell = elements.cells[index];
      Animations.addClass(cell, 'cell-win');
      Animations.addClass(cell, player === 'X' ? 'cell-win-x' : 'cell-win-o');
    });

    Animations.animateWinningCells(
      winningLine.map((i) => elements.cells[i]),
      player
    );

    Animations.addClass(elements.board, 'win-state');
  }

  function showWinnerMessage(player) {
    const text = `Player ${player} Wins!`;
    Animations.showMessage(elements.gameMessage, text, `winner-${player.toLowerCase()}`);
  }

  function showDrawMessage() {
    Animations.showMessage(elements.gameMessage, "It's a Draw!", 'draw');
  }

  function updateScores(scores) {
    elements.scoreX.textContent = scores.X;
    elements.scoreO.textContent = scores.O;
    elements.scoreDraw.textContent = scores.draw;
  }

  function disableBoard() {
    elements.cells.forEach((cell) => {
      Animations.addClass(cell, 'cell-disabled');
    });
  }

  function enableBoard() {
    elements.cells.forEach((cell) => {
      Animations.removeClass(cell, 'cell-disabled');
      Animations.removeClass(cell, 'cell-taken');
      Animations.removeClass(cell, 'cell-win');
      Animations.removeClass(cell, 'cell-win-x');
      Animations.removeClass(cell, 'cell-win-o');
      Animations.removeClass(cell, 'animate-win-pulse');
      cell.innerHTML = '';
    });
    Animations.removeClass(elements.board, 'win-state');
  }

  function triggerCelebration() {
    Animations.spawnConfetti(elements.celebrationContainer);
  }

  function triggerDrawEffect() {
    Animations.animateBoardDraw(elements.board);
  }

  function resetBoard(callback) {
    Animations.hideMessage(elements.gameMessage);
    Animations.stopTurnIndicator(elements.turnIndicator);

    Animations.animateBoardRestart(elements.board, () => {
      enableBoard();
      if (callback) callback();
    });
  }

  function getCellElement(index) {
    return elements.cells[index];
  }

  return {
    cacheElements,
    renderCell,
    updateTurnIndicator,
    highlightWinningCells,
    showWinnerMessage,
    showDrawMessage,
    updateScores,
    disableBoard,
    enableBoard,
    triggerCelebration,
    triggerDrawEffect,
    resetBoard,
    getCellElement,
  };
})();
