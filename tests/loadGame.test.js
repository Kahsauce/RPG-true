const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync(__dirname + '/../game.js', 'utf8');
const start = code.indexOf('function loadGame');
const end = code.indexOf('/* --------- État du jeu --------- */', start);
const loadGameCode = code.slice(start, end);

const sandbox = {
  localStorage: { getItem: () => null },
  Player: function Player(data) { Object.assign(this, data); },
  Enemy: function Enemy(data) { Object.assign(this, data); }
};

vm.createContext(sandbox);
vm.runInContext(loadGameCode, sandbox);

// Test returning null when no data
let result = sandbox.loadGame();
assert.strictEqual(result, null, 'loadGame should return null when there is no data');

// Test resetting turn to player
sandbox.localStorage.getItem = () => JSON.stringify({
  player: null,
  enemy: null,
  isPlayerTurn: false
});
result = sandbox.loadGame();
assert.strictEqual(result.isPlayerTurn, true, 'isPlayerTurn should be true after loading');

console.log('All tests passed.');
