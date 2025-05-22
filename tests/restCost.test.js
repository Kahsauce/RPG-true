const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync(__dirname + '/../game.js', 'utf8');
const start = code.indexOf('function handleScenarioAction');
const end = code.indexOf('function showShop', start);
const fnCode = code.slice(start, end);

const sandbox = {
  gameState: {
    player: { maxHealth: 100, health: 50 },
    gold: 20
  },
  addBattleMessage: () => {},
  spawnNewEnemy: () => {},
  updateHealthBars: () => {},
  saveGame: () => {}
};

vm.createContext(sandbox);
vm.runInContext(fnCode, sandbox);

sandbox.handleScenarioAction('rest');
assert.strictEqual(sandbox.gameState.gold, 10, 'gold should decrease when resting');
assert.ok(sandbox.gameState.player.health > 50, 'health should be restored');

console.log('Rest cost test passed.');
