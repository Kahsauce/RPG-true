const assert = require('assert');
const Player = require('../player.js');
const Enemy = require('../enemy.js');

const originalRandom = Math.random;
Math.random = () => 0; // make outcomes deterministic

const player = new Player({
  name: 'Tester',
  maxHealth: 50,
  health: 50,
  attack: 10,
  defense: 3,
  resourceType: 'mana',
  resource: 50,
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
  attackRange: [5, 5],
  defense: 2,
  nextAttack: 'Coup'
});

let dmg = player.attackTarget(enemy);
assert.strictEqual(dmg, 8, 'attackTarget should deal expected damage');
assert.strictEqual(enemy.health, 22, 'enemy health should decrease');

player.health = 40;
const healed = player.heal();
assert.strictEqual(healed, 10, 'heal should be deterministic');
assert.strictEqual(player.health, 50, 'heal should not exceed maxHealth');

player.defend();
const taken = player.takeDamage(10);
assert.strictEqual(taken, 5, 'damage should be halved when defending');
assert.strictEqual(player.health, 45, 'player health after defending');

player.resource = 30;
dmg = player.special(enemy);
assert.strictEqual(dmg, 15, 'special attack damage');
assert.strictEqual(player.resource, 0, 'resource deducted after special');
assert.strictEqual(enemy.health, 7, 'enemy health after special');

const levels = player.gainXp(15);
assert.strictEqual(levels, 1, 'should level up once');
assert.strictEqual(player.level, 2, 'level increased');
assert.strictEqual(player.xp, 5, 'remaining xp stored');
assert.strictEqual(player.health, 60, 'health reset to new max after level up');
assert.strictEqual(player.maxHealth, 60, 'maxHealth increased');
assert.strictEqual(player.attack, 12, 'attack increased');
assert.strictEqual(player.defense, 4, 'defense increased');

const enemyDamage = enemy.attack(player);
assert.strictEqual(enemyDamage, 1, 'enemy attack damage');
assert.strictEqual(player.health, 59, 'player health after enemy attack');
assert.strictEqual(player.resource, 5, 'resource regenerated on damage');

Math.random = originalRandom;
console.log('Player and Enemy tests passed.');
