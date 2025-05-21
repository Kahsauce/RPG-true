class Player {
    constructor(data) {
        Object.assign(this, data);
        this.isDefending = false;
    }

    attackTarget(target) {
        const damage = Math.max(
            1,
            this.attack - target.defense + Math.floor(Math.random() * 3)
        );
        target.takeDamage(damage);
        if (this.resourceType === 'rage') {
            this.resource = Math.min(this.maxResource, this.resource + 10);
        }
        return damage;
    }

    heal() {
        const healAmount = 10 + Math.floor(Math.random() * 5);
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return healAmount;
    }

    defend() {
        this.isDefending = true;
    }

    special(target) {
        const costs = { mana: 30, energie: 20, rage: 50 };
        const cost = costs[this.resourceType];
        if (this.resource < cost) return null;
        this.resource -= cost;
        const damage = 15 + Math.floor(Math.random() * 5);
        target.takeDamage(damage);
        return damage;
    }

    takeDamage(dmg) {
        if (this.isDefending) {
            dmg = Math.floor(dmg / 2);
            this.isDefending = false;
        }
        this.health -= dmg;
        const regen = { mana: 5, energie: 3 };
        if (this.resourceType === 'rage') {
            this.resource = Math.min(this.maxResource, this.resource + 5);
        } else if (regen[this.resourceType]) {
            this.resource = Math.min(this.maxResource, this.resource + regen[this.resourceType]);
        }
        if (this.health < 0) this.health = 0;
        return dmg;
    }

    gainXp(xp) {
        this.xp += xp;
        let levels = 0;
        while (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.maxHealth += 10;
            this.health = this.maxHealth;
            this.attack += 2;
            this.defense += 1;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.2);
            levels++;
        }
        return levels;
    }
}

if (typeof module !== 'undefined') {
    module.exports = Player;
}
