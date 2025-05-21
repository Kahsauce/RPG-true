class Enemy {
    constructor(data) {
        Object.assign(this, data);
    }

    takeDamage(dmg) {
        this.health -= dmg;
        if (this.health < 0) this.health = 0;
        return dmg;
    }

    attack(player) {
        let damage = Math.max(
            1,
            this.attackRange[0] + Math.floor(Math.random() * (this.attackRange[1] - this.attackRange[0] + 1)) - player.defense
        );
        player.takeDamage(damage);
        return damage;
    }
}

if (typeof module !== 'undefined') {
    module.exports = Enemy;
}
