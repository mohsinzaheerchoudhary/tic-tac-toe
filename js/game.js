/* ============================================
   GAME.JS - Pure Game Logic
   No DOM manipulation. Pure state management.
   ============================================ */

const Game = (() => {
  const WINNING_LINES = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // columns
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  let state = createInitialState();

  function createInitialState() {
    return {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      gameOver: false,
      winner: null,
      winningLine: null,
      scores: { X: 0, O: 0, draw: 0 },
      moveCount: 0,
    };
  }

  function getState() {
    return { ...state, board: [...state.board], scores: { ...state.scores } };
  }

  function makeMove(index) {
    if (state.gameOver) {
      return { success: false, reason: 'game-over' };
    }

    if (index < 0 || index > 8) {
      return { success: false, reason: 'invalid-index' };
    }

    if (state.board[index] !== null) {
      return { success: false, reason: 'cell-taken' };
    }

    const player = state.currentPlayer;
    state.board[index] = player;
    state.moveCount++;

    const result = checkGameEnd();

    return {
      success: true,
      player,
      index,
      ...result,
    };
  }

  function checkGameEnd() {
    const winResult = checkWin();
    if (winResult) {
      state.gameOver = true;
      state.winner = winResult.winner;
      state.winningLine = winResult.line;
      state.scores[winResult.winner]++;
      return { gameOver: true, winner: winResult.winner, winningLine: winResult.line };
    }

    if (state.moveCount === 9) {
      state.gameOver = true;
      state.winner = 'draw';
      state.scores.draw++;
      return { gameOver: true, winner: 'draw', winningLine: null };
    }

    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    return { gameOver: false };
  }

  function checkWin() {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (
        state.board[a] !== null &&
        state.board[a] === state.board[b] &&
        state.board[a] === state.board[c]
      ) {
        return { winner: state.board[a], line };
      }
    }
    return null;
  }

  function reset() {
    const previousScores = { ...state.scores };
    state = createInitialState();
    state.scores = previousScores;
    return getState();
  }

  function resetAll() {
    state = createInitialState();
    return getState();
  }

  function isWinningCell(index) {
    return state.winningLine !== null && state.winningLine.includes(index);
  }

  function getWinningPlayer() {
    return state.winner;
  }

  function getScores() {
    return { ...state.scores };
  }

  return {
    makeMove,
    reset,
    resetAll,
    getState,
    isWinningCell,
    getWinningPlayer,
    getScores,
  };
})();
