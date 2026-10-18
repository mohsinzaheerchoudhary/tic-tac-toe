/* ============================================
   UI.JS - DOM Rendering & Interface Updates
   Bridges game logic (Game) with effects (Animations).
   ============================================ */

const UI = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const elements = {};

  function cellIndexFromElement(cell) {
    return Number(cell.dataset.index);
  }

  function cacheElements() {
    elements.board = document.getElementById('board');
    elements.cells = Array.from(document.querySelectorAll('.cell'));
    elements.turnIndicator = document.getElementById('turn-indicator');
    elements.turnText = document.getElementById('turn-text');
    elements.turnPlayer = document.getElementById('turn-player');
    elements.gameMessage = document.getElementById('game-message');
    elements.scoreX = document.getElementById('score-x');
    elements.scoreO = document.getElementById('score-o');
    elements.scoreDraw = document.getElementById('score-draw');
    elements.celebrationContainer = document.getElementById('celebration-container');
    elements.winLine = document.getElementById('win-line');
  }

  function cellAriaLabel(index, value) {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const state = value ? `contains ${value}` : 'empty';
    return `Row ${row}, Column ${col}, ${state}`;
  }

  function createMarkSVG(player) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add(player === 'X' ? 'mark-x' : 'mark-o');

    if (player === 'X') {
      svg.appendChild(svgLine(20, 20, 80, 80));
      svg.appendChild(svgLine(80, 20, 20, 80));
    } else {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '30');
      svg.appendChild(circle);
    }

    return svg;
  }

  function svgLine(x1, y1, x2, y2) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    return line;
  }

  function renderCell(index, player) {
    const cell = elements.cells[index];
    if (!cell || cell.querySelector('svg')) return;

    const mark = createMarkSVG(player);
    cell.appendChild(mark);
    cell.classList.add('cell-taken');
    cell.setAttribute('aria-label', cellAriaLabel(index, player));

    Animations.animateCellPress(cell);
    Animations.animateMarkAppear(mark, player);
  }

  function updateTurnIndicator(currentPlayer) {
    elements.turnPlayer.textContent = currentPlayer;
    elements.turnPlayer.className = `turn-player player-${currentPlayer.toLowerCase()}`;

    const lower = currentPlayer.toLowerCase();
    elements.turnIndicator.classList.remove('is-x', 'is-o');
    Animations.addClass(elements.turnIndicator, `is-${lower}`);
  }

  function resetTurnIndicator() {
    elements.turnText.textContent = 'Your move, Player';
    elements.turnIndicator.classList.remove('is-x', 'is-o');
  }

  function highlightWinningCells(winningLine, player) {
    const cls = player === 'X' ? 'cell-win-x' : 'cell-win-o';

    winningLine.forEach((index) => {
      const cell = elements.cells[index];
      Animations.addClass(cell, 'cell-win');
      Animations.addClass(cell, cls);
    });

    Animations.animateWinningMarks(
      winningLine.map((i) => elements.cells[i].querySelector('svg'))
    );

    Animations.addClass(elements.board, 'win-state');
    renderWinLine(winningLine, player);
  }

  /**
   * Draw an animated stroke through the three winning cells.
   * Coordinates are measured in pixel space so the line works at any
   * board size, gap width, or padding.
   */
  function renderWinLine(winningLine, player) {
    const svg = elements.winLine;
    const boardRect = elements.board.getBoundingClientRect();
    const isX = player === 'X';

    svg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);

    const points = winningLine.map((index) => {
      const rect = elements.cells[index].getBoundingClientRect();
      return {
        x: rect.left - boardRect.left + rect.width / 2,
        y: rect.top - boardRect.top + rect.height / 2,
      };
    });

    let { x: x1, y: y1 } = points[0];
    let { x: x2, y: y2 } = points[points.length - 1];

    // Extend the stroke slightly past the outer cells for style
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const shoulder = Math.min(len * 0.12, 26);
    x1 -= (dx / len) * shoulder;
    y1 -= (dy / len) * shoulder;
    x2 += (dx / len) * shoulder;
    y2 += (dy / len) * shoulder;

    const line = svgLine(x1, y1, x2, y2);
    const dashLen = Math.hypot(x2 - x1, y2 - y1) + 6;
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    line.style.setProperty('--win-dash', `${dashLen}`);
    line.style.strokeDasharray = `${dashLen}`;
    line.style.strokeDashoffset = `${dashLen}`;

    svg.classList.remove('x', 'o');
    svg.classList.add(isX ? 'x' : 'o');
    svg.replaceChildren(line);
    svg.classList.add('active', 'drawing');
  }

  function clearWinLine() {
    const svg = elements.winLine;
    svg.replaceChildren();
    svg.classList.remove('active', 'drawing', 'x', 'o');
  }

  function showWinnerMessage(player) {
    Animations.showMessage(
      elements.gameMessage,
      `Player ${player} wins this round!`,
      `winner-${player.toLowerCase()}`
    );
  }

  function showDrawMessage() {
    Animations.showMessage(elements.gameMessage, "It's a draw!", 'draw');
  }

  function updateScores(scores, changed) {
    if (changed === 'X' || !changed) {
      elements.scoreX.textContent = scores.X;
      if (changed === 'X') Animations.bumpScore(elements.scoreX);
    }
    if (changed === 'O' || !changed) {
      elements.scoreO.textContent = scores.O;
      if (changed === 'O') Animations.bumpScore(elements.scoreO);
    }
    if (changed === 'draw' || !changed) {
      elements.scoreDraw.textContent = scores.draw;
      if (changed === 'draw') Animations.bumpScore(elements.scoreDraw);
    }
  }

  function disableBoard() {
    elements.cells.forEach((cell) => {
      cell.classList.add('is-disabled');
      cell.setAttribute('aria-disabled', 'true');
    });
  }

  function clearAllCells() {
    elements.cells.forEach((cell, index) => {
      cell.classList.remove(
        'cell-taken',
        'is-disabled',
        'cell-win',
        'cell-win-x',
        'cell-win-o'
      );
      cell.removeAttribute('aria-disabled');
      cell.replaceChildren();
      cell.setAttribute('aria-label', cellAriaLabel(index, null));
    });
  }

  function clearBoardVisualState() {
    Animations.removeClass(elements.board, 'win-state');
    clearAllCells();
    clearWinLine();
  }

  function boardEnter() {
    clearBoardVisualState();
    Animations.boardEnter(elements.board);
    Animations.staggerCellsIn(elements.board);
  }

  function boardRestart(onCollapsed) {
    Animations.animateBoardRestart(elements.board, onCollapsed);
  }

  function triggerCelebration() {
    Animations.spawnConfetti(elements.celebrationContainer);
  }

  function triggerDrawEffect() {
    Animations.animateBoardDraw(elements.board);
  }

  return {
    cacheElements,
    cellIndexFromElement,
    renderCell,
    updateTurnIndicator,
    resetTurnIndicator,
    highlightWinningCells,
    showWinnerMessage,
    showDrawMessage,
    updateScores,
    disableBoard,
    clearBoardVisualState,
    boardEnter,
    boardRestart,
    triggerCelebration,
    triggerDrawEffect,
  };
})();
