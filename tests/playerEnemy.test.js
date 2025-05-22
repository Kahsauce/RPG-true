const assert = require('assert');
const Player = require('../player.js');
const Enemy = require('../enemy.js');

const originalRandom = Math.random;
Math.random = () => 0; // make outcomes deterministic

const player = new Player({
  name: 'Tester',
  class: 'mage',
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

player.health = 30;
player.resource = 50;
let skill = player.useAbility();
assert.strictEqual(skill, 'heal', 'ability now heals');
assert.strictEqual(player.resource, 35, 'resource used to heal');
assert.strictEqual(player.health, 50, 'health increased by ability');
let damageTaken = player.takeDamage(10);
assert.strictEqual(damageTaken, 0, 'damage absorbed by mana shield');
assert.strictEqual(player.health, 50, 'health after taking damage');
assert.strictEqual(player.resource, 25, 'mana spent to absorb damage');

player.defend();
damageTaken = player.takeDamage(10);
assert.strictEqual(damageTaken, 5, 'damage should be halved when defending');
assert.strictEqual(player.health, 45, 'player health after defending');

player.resource = 30;
dmg = player.special(enemy);
assert.strictEqual(dmg, 28, 'special attack damage');
assert.strictEqual(player.resource, 5, 'resource deducted after special');
assert.strictEqual(enemy.health, 0, 'enemy health after special');

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
assert.strictEqual(player.resource, 5, 'no mana gained on damage');

Math.random = originalRandom;
console.log('Player and Enemy tests passed.');
