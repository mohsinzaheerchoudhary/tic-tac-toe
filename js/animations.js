/* ============================================
   ANIMATIONS.JS - Animation Triggers & Control
   Handles all animation logic, separate from DOM rendering.
   ============================================ */

const Animations = (() => {
  const CONFETTI_COLORS = [
    '#00d4ff', '#ff6bd5', '#b388ff', '#00e676',
    '#ffd740', '#ff9100', '#ff5252', '#64ffda',
  ];

  const CONFETTI_COUNT = 50;

  function addClass(element, className) {
    if (element) {
      element.classList.add(className);
    }
  }

  function removeClass(element, className) {
    if (element) {
      element.classList.remove(className);
    }
  }

  function toggleClass(element, className, force) {
    if (element) {
      element.classList.toggle(className, force);
    }
  }

  function animateCellPress(cellElement) {
    addClass(cellElement, 'animate-cell-press');
    cellElement.addEventListener('animationend', () => {
      removeClass(cellElement, 'animate-cell-press');
    }, { once: true });
  }

  function animateMarkAppear(cellElement, player) {
    const className = player === 'X' ? 'animate-x' : 'animate-o';
    addClass(cellElement, className);
  }

  function animateWinningCells(cellElements, player) {
    const glowClass = player === 'X' ? 'cell-win-x' : 'cell-win-o';
    cellElements.forEach((el, i) => {
      setTimeout(() => {
        addClass(el, 'cell-win');
        addClass(el, glowClass);
        addClass(el, 'animate-win-pulse');
      }, i * 150);
    });
  }

  function animateBoardDraw(boardElement) {
    addClass(boardElement, 'draw-state');
    boardElement.addEventListener('animationend', () => {
      removeClass(boardElement, 'draw-state');
    }, { once: true });
  }

  function animateBoardRestart(boardElement, callback) {
    addClass(boardElement, 'restarting');
    boardElement.addEventListener('animationend', () => {
      removeClass(boardElement, 'restarting');
      if (callback) callback();
    }, { once: true });
  }

  function animateTurnIndicator(indicatorElement) {
    addClass(indicatorElement, 'animate-turn-pulse');
  }

  function stopTurnIndicator(indicatorElement) {
    removeClass(indicatorElement, 'animate-turn-pulse');
  }

  function showMessage(messageElement, text, type) {
    messageElement.textContent = text;
    messageElement.className = 'game-message';

    void messageElement.offsetWidth;

    addClass(messageElement, 'visible');
    addClass(messageElement, type);
  }

  function hideMessage(messageElement) {
    removeClass(messageElement, 'visible');
  }

  function spawnConfetti(containerElement) {
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';

      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 0.8;
      const duration = 2 + Math.random() * 2;
      const size = 6 + Math.random() * 8;
      const rotation = Math.random() * 360;

      confetti.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        transform: rotate(${rotation}deg);
      `;

      containerElement.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, (delay + duration) * 1000 + 100);
    }
  }

  function clearConfetti(containerElement) {
    containerElement.innerHTML = '';
  }

  return {
    addClass,
    removeClass,
    toggleClass,
    animateCellPress,
    animateMarkAppear,
    animateWinningCells,
    animateBoardDraw,
    animateBoardRestart,
    animateTurnIndicator,
    stopTurnIndicator,
    showMessage,
    hideMessage,
    spawnConfetti,
    clearConfetti,
  };
})();
