const assert = require('assert');
const Player = require('../player.js');
const Enemy = require('../enemy.js');

const originalRandom = Math.random;

// Test critical hit
Math.random = () => 0; // ensures crit and no bonus damage variation
const playerCrit = new Player({
  name: 'CritTest',
  attack: 10,
  defense: 2,
  critRate: 0.5,
  dodgeRate: 0.5,
  resourceType: 'mana',
  resource: 0,
  maxResource: 100,
  health: 50,
  maxHealth: 50
});
const enemyCrit = new Enemy({
  name: 'Dummy',
  level: 1,
  health: 20,
  maxHealth: 20,
  attackRange: [5,5],
  defense: 2,
  nextAttack: 'Coup'
});
let dmg = playerCrit.attackTarget(enemyCrit);
assert.strictEqual(dmg, 12, 'critical damage expected');
assert.strictEqual(enemyCrit.health, 8, 'enemy health after crit');

// Test dodge
Math.random = () => 0;
const playerDodge = new Player({
  name: 'DodgeTest',
  attack: 5,
  defense: 0,
  critRate: 0,
  dodgeRate: 0.5,
  resourceType: 'mana',
  resource: 0,
  maxResource: 100,
  health: 30,
  maxHealth: 30
});
let taken = playerDodge.takeDamage(10);
assert.strictEqual(taken, 0, 'damage should be dodged');
assert.strictEqual(playerDodge.health, 30, 'health unchanged after dodge');

Math.random = () => 0.9;
taken = playerDodge.takeDamage(10);
assert.strictEqual(taken, 10, 'damage taken when dodge fails');
assert.strictEqual(playerDodge.health, 20, 'health reduced after hit');

Math.random = originalRandom;
console.log('Crit and dodge tests passed.');
