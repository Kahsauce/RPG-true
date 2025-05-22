const assert = require('assert');
const Player = require('../player.js');
const Enemy = require('../enemy.js');

const player = new Player({name:'Test', health:50, maxHealth:50});
player.statusEffects.push({name:'poison', duration:2, value:5});
let logs = player.applyStatusEffects();
assert.strictEqual(player.health, 45);
assert.strictEqual(player.statusEffects[0].duration, 1);
assert.ok(logs[0].includes('poison'));
logs = player.applyStatusEffects();
assert.strictEqual(player.health, 40);
assert.strictEqual(player.statusEffects.length, 0);
console.log('Status effect tests passed.');
