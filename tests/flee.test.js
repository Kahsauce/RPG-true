const assert = require('assert');
const Player = require('../player.js');
const Enemy = require('../enemy.js');

const originalRandom = Math.random;

let player = new Player({name:'RunTester', health:50, maxHealth:50, dodgeRate:0, defense:0});
let enemy = new Enemy({name:'Slime', health:30, maxHealth:30, attackRange:[5,5], defense:0});

Math.random = () => 0; // force success
let res = player.tryFlee(enemy);
assert.strictEqual(res, true, 'flee should succeed');
assert.strictEqual(player.health, 50, 'no damage on success');

player = new Player({name:'RunTester', health:50, maxHealth:50, dodgeRate:0, defense:0});
enemy = new Enemy({name:'Slime', health:30, maxHealth:30, attackRange:[5,5], defense:0});
Math.random = () => 0.99; // force fail
res = player.tryFlee(enemy);
assert.strictEqual(res, false, 'flee should fail');
assert.strictEqual(player.health, 45, 'enemy attacks on failed flee');

Math.random = originalRandom;
console.log('Flee tests passed.');
