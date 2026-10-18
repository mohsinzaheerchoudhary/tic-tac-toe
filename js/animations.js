/* ============================================
   ANIMATIONS.JS - Visual Effects & Animation Control
   Bridges CSS keyframes with game events.
   ============================================ */

const Animations = (() => {
  const CONFETTI_COLORS = [
    '#22e7ff', '#ff5fd0', '#a78bff', '#3dffab',
    '#ffd166', '#ff9e5e', '#7b5cff', '#b14aff',
  ];

  const CONFETTI_COUNT = 60;

  const reduceMotionQuery =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return !!(reduceMotionQuery && reduceMotionQuery.matches);
  }

  function addClass(element, className) {
    if (element) element.classList.add(className);
  }

  function removeClass(element, className) {
    if (element) element.classList.remove(className);
  }

  /**
   * Play a one-shot CSS animation class on an element and run the
   * callback when THAT element's animation ends. Child animationend
   * events bubbling up to the element are ignored via the target check.
   */
  function runOneShotAnimation(element, className, onDone) {
    if (!element) {
      if (onDone) onDone();
      return;
    }

    if (prefersReducedMotion()) {
      if (onDone) onDone();
      return;
    }

    const finish = () => {
      removeClass(element, className);
      if (onDone) onDone();
    };

    const handler = (event) => {
      if (event.target !== element) return;
      element.removeEventListener('animationend', handler);
      finish();
    };

    element.addEventListener('animationend', handler);
    addClass(element, className);
  }

  function animateCellPress(cellElement) {
    if (!cellElement) return;

    if (prefersReducedMotion()) return;

    addClass(cellElement, 'animate-cell-press');
    cellElement.addEventListener(
      'animationend',
      () => {
        removeClass(cellElement, 'animate-cell-press');
      },
      { once: true }
    );
  }

  function animateMarkAppear(markElement, player) {
    addClass(markElement, player === 'X' ? 'animate-x' : 'animate-o');
  }

  function animateWinningMarks(markElements) {
    markElements.forEach((el) => addClass(el, 'animate-win-pulse'));
  }

  /**
   * Trigger the shake effect on the board for a draw round.
   * The shake runs on the cells (not the board), so a timeout is used
   * instead of an animationend listener.
   */
  function animateBoardDraw(boardElement) {
    if (!boardElement) return;

    addClass(boardElement, 'draw-state');

    window.setTimeout(() => {
      removeClass(boardElement, 'draw-state');
    }, 480);
  }

  /**
   * Board restart: shrink to half opacity, then run the callback
   * (clearing cells happens between the two phases).
   */
  function animateBoardRestart(boardElement, onCollapsed) {
    if (!boardElement) {
      if (onCollapsed) onCollapsed();
      return;
    }

    runOneShotAnimation(boardElement, 'restarting', onCollapsed);
  }

  function boardEnter(boardElement) {
    runOneShotAnimation(boardElement, 'entering');
  }

  /**
   * Staggered cell entrance: applies the stagger class and cleans it
   * up once all nine ripple-in animations have finished.
   */
  function staggerCellsIn(boardElement) {
    if (!boardElement) return;

    addClass(boardElement, 'cells-enter');

    window.setTimeout(() => {
      removeClass(boardElement, 'cells-enter');
    }, 950);
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

  function bumpScore(scoreElement) {
    if (!scoreElement || prefersReducedMotion()) return;

    addClass(scoreElement, 'score-bump');
    scoreElement.addEventListener(
      'animationend',
      () => {
        removeClass(scoreElement, 'score-bump');
      },
      { once: true }
    );
  }

  function spawnConfetti(containerElement) {
    if (prefersReducedMotion()) return;

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';

      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 0.6;
      const duration = 2.1 + Math.random() * 1.8;
      const size = 5 + Math.random() * 8;
      const drift = `${(Math.random() * 160 - 80).toFixed(0)}px`;
      const borderRadius = Math.random() > 0.6 ? '50%' : '2px';

      confetti.style.cssText = `
        left: ${left}%;
        width: ${size}px;
        height: ${size + 2}px;
        background: ${color};
        border-radius: ${borderRadius};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        --drift: ${drift};
      `;

      containerElement.appendChild(confetti);

      window.setTimeout(
        () => confetti.remove(),
        (delay + duration) * 1000 + 150
      );
    }
  }

  return {
    addClass,
    removeClass,
    prefersReducedMotion,
    animateCellPress,
    animateMarkAppear,
    animateWinningMarks,
    animateBoardDraw,
    animateBoardRestart,
    boardEnter,
    staggerCellsIn,
    bumpScore,
    showMessage,
    hideMessage,
    spawnConfetti,
  };
})();
