const assert = require('assert');
const Player = require('../player.js');
const Enemy = require('../enemy.js');

const thief = new Player({
  name: 'VoleurTest',
  class: 'voleur',
  maxHealth: 40,
  health: 40,
  attack: 8,
  defense: 2,
  resourceType: 'energie',
  resource: 0,
  maxResource: 100,
  level: 1,
  xp: 0,
  nextLevelXp: 10
});

const enemy = new Enemy({
  name: 'Goblin',
  level: 1,
  health: 30,
  maxHealth: 30,
  attackRange: [5,5],
  defense: 0,
  nextAttack: 'Coup'
});

let dmg = thief.attackTarget(enemy);
assert.strictEqual(thief.resource, 5, 'energy generated on attack');

thief.dodgeNext = true;
dmg = thief.takeDamage(10);
assert.strictEqual(dmg, 0, 'damage dodged');
assert.strictEqual(thief.resource, 10, 'energy generated on dodge');

console.log('Energy generation tests passed.');
