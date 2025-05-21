const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync(__dirname + '/../game.js', 'utf8');
const start = code.indexOf('function useItem');
const end = code.indexOf('// Player actions', start);
const useItemCode = code.slice(start, end);

const sandbox = {
  gameState: {
    player: { health: 50, maxHealth: 100, resource: 50, maxResource: 100 },
    enemy: { health: 100 },
    inventory: { megaPotion: 1, bomb: 1 }
  },
  addBattleMessage: () => {},
  renderInventory: () => {},
  updateHealthBars: () => {},
  saveGame: () => {}
};

vm.createContext(sandbox);
vm.runInContext(useItemCode, sandbox);

sandbox.useItem('megaPotion');
assert.strictEqual(sandbox.gameState.player.health, 100, 'megaPotion should heal player');
assert.strictEqual(sandbox.gameState.inventory.megaPotion, 0, 'item count reduced');

sandbox.useItem('bomb');
assert.strictEqual(sandbox.gameState.enemy.health, 65, 'bomb should damage enemy');
assert.strictEqual(sandbox.gameState.inventory.bomb, 0, 'bomb count reduced');

console.log('Inventory tests passed.');
