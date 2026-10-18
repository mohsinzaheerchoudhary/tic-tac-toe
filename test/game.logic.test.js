/* ============================================================
   GAME LOGIC TESTS - Node test runner (no dependencies)

   Runs Game.makeMove/reset through every rule scenario:
   wins in all 8 lines, draws, occupied cells, turn order,
   score persistence, and rapid repeated clicks.

   Run with:  node test/game.logic.test.js
   ============================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'game.js'),
  'utf8'
);

const sandbox = { globalCapture: null };
vm.runInNewContext(
  `${source};\n;globalCapture = Game;`,
  sandbox,
  { filename: 'game.js' }
);
const Game = sandbox.globalCapture;

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}`);
  }
}

function playSequence(moves) {
  // Fresh module state is created per sandbox load, so use reset() here.
  Game.resetAll();
  const results = moves.map((i) => Game.makeMove(i));
  return results;
}

/* --- 1. X wins horizontally (top row) --- */
let r;
const seqXRow = playSequence([0, 3, 1, 4, 2]);
r = seqXRow[4];
assert(r.success && r.gameOver && r.winner === 'X', 'X wins horizontal top row');
assert(JSON.stringify(r.winningLine) === '[0,1,2]', 'X winning line [0,1,2] reported');

/* --- 2. O wins vertically (middle column) --- */
const seqOCol = playSequence([0, 3, 1, 4, 6, 5]);
r = seqOCol[5];
assert(r.success && r.gameOver && r.winner === 'O', 'O wins vertical middle column');
assert(JSON.stringify(r.winningLine) === '[3,4,5]', 'O winning line [3,4,5] reported');

/* --- 3. O wins vertical first column --- */
const seqOCol2 = playSequence([1, 0, 2, 3, 7, 6]);
r = seqOCol2[5];
assert(r.winner === 'O' && JSON.stringify(r.winningLine) === '[0,3,6]', 'O wins vertical first column [0,3,6]');

/* --- 4. X wins vertical last column --- */
const seqXCol = playSequence([2, 0, 5, 1, 8]);
r = seqXCol[4];
assert(r.winner === 'X' && JSON.stringify(r.winningLine) === '[2,5,8]', 'X wins vertical last column [2,5,8]');

/* --- 5. X wins main diagonal (duplicate move rejected WITHOUT consuming a turn) --- */
const seqXDiag = playSequence([0, 1, 1, 4, 3, 8]);
const xDiag = seqXDiag.filter((x) => x.success);
r = seqXDiag[5];
assert(xDiag.length === 5, 'X diagonal sequence: duplicate move rejected without consuming turn');
assert(r.gameOver && r.winner === 'X', 'X wins diagonal [0,4,8]');
assert(JSON.stringify(r.winningLine) === '[0,4,8]', 'X diagonal winning line [0,4,8]');

/* --- 6. O wins anti-diagonal --- */
const seqODiag = playSequence([0, 2, 1, 4, 3, 6]);
r = seqODiag[5];
assert(r.gameOver && r.winner === 'O', 'O wins anti-diagonal [2,4,6]');
assert(JSON.stringify(r.winningLine) === '[2,4,6]', 'O anti-diagonal winning line [2,4,6]');

/* --- 7. Row 2 and Row 3 wins --- */
const seq2 = playSequence([3, 0, 4, 1, 5]);
assert(seq2[4].winner === 'X', 'X wins horizontal middle row [3,4,5]');
const seq3 = playSequence([6, 0, 7, 1, 8]);
assert(seq3[4].winner === 'X', 'X wins horizontal bottom row [6,7,8]');
const seqC0 = playSequence([0, 1, 3, 4, 6]);
assert(seqC0[4].winner === 'X', 'X wins first column [0,3,6]');
const seqC1 = playSequence([1, 0, 4, 3, 7]);
assert(seqC1[4].winner === 'X', 'X wins middle column [1,4,7]');

/* --- 8. Draw detection --- */
const seqDraw = playSequence([0, 1, 2, 4, 3, 5, 7, 6, 8]);
r = seqDraw[8];
assert(r.success && r.gameOver && r.winner === 'draw' && r.winningLine === null, 'draw detected when board full');

/* --- 9. Draw scores and winner scores --- */
playSequence([0, 3, 1, 4, 2]);
const afterXWin = Game.getScores();
assert(afterXWin.X === 1 && afterXWin.O === 0, 'X win increments X score');
playSequence([0, 1, 2, 4, 3, 5, 7, 6, 8]);
const afterDraw = Game.getScores();
assert(afterDraw.X === 0 && afterDraw.O === 0 && afterDraw.draw === 1, 'draw increments draw score only');

/* --- 10. Occupied cell rejection --- */
playSequence([0, 4]);
const reject = Game.makeMove(0);
assert(!reject.success && reject.reason === 'cell-taken', 'occupied cell rejected');

/* --- 11. Turn alternation (fresh sequences) --- */
playSequence([0]);
assert(Game.getState().currentPlayer === 'O', 'turn alternates X -> O');
playSequence([]);
assert(Game.getState().currentPlayer === 'X', 'fresh game starts with X');
playSequence([0, 4]);
assert(Game.getState().currentPlayer === 'X', 'turn returns to X after two moves');

/* --- 12. No moves after game over --- */
playSequence([0, 3, 1, 4, 2]); // X wins
const blocked1 = Game.makeMove(5);
const blocked2 = Game.makeMove(2);
const blocked3 = Game.makeMove(1 * 0 + 8);
assert(!blocked1.success && blocked1.reason === 'game-over', 'move rejected after win (empty cell)');
assert(!blocked2.success, 'move rejected after win (occupied cell)');
assert(!blocked3.success, 'move rejected after win (third attempt)');

/* --- 13. Rapid repeated clicks (double-submit guard) --- */
playSequence([0]);
const r1 = Game.makeMove(0);
const r2 = Game.makeMove(0);
assert(!r1.success && r1.reason === 'cell-taken', 'rapid duplicate click #1 rejected');
assert(!r2.success && r2.reason === 'cell-taken', 'rapid duplicate click #2 rejected');

/* --- 14. New Game keeps scores; Reset Scores clears them --- */
Game.makeMove(0);
Game.makeMove(3);
Game.makeMove(1);
Game.makeMove(4);
Game.makeMove(2); // X wins, scores X=2 after previous tests
let scoresBefore = Game.getScores();
Game.reset();
assert(Game.getScores().X === scoresBefore.X, 'New Game preserves scores');
const stateAfterReset = Game.getState();
assert(
  stateAfterReset.currentPlayer === 'X' &&
    stateAfterReset.moveCount === 0 &&
    !stateAfterReset.gameOver &&
    stateAfterReset.board.every((v) => v === null),
  'New Game clears board and turn'
);
Game.resetAll();
const cleared = Game.getScores();
assert(cleared.X === 0 && cleared.O === 0 && cleared.draw === 0, 'Reset Scores clears all scores');

/* --- 15. Invalid input robustness --- */
assert(!Game.makeMove(-1).success, 'negative index rejected');
assert(!Game.makeMove(9).success, 'out-of-range index rejected');
assert(!Game.makeMove(9.5).success, 'fractional index rejected');

/* --- 16. Win takes priority over draw when board fills --- */
playSequence([0, 1, 3, 4, 6]); // X wins with move 9th slot still open? X rows col= [0,3,6] on moves 1,3,5 -> win at move 5
r = Game.getState();
assert(r.winner === 'X' && r.gameOver, 'win registered before board full');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
