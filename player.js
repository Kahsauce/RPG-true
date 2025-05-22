class Player {
    constructor(data) {
        Object.assign(this, data);
        this.isDefending = false;
        this.shieldActive = false;
        this.dodgeNext = false;
        this.manaShieldActive = false;
        this.statusEffects = this.statusEffects || [];
        this.critRate = this.critRate || 0;
        this.dodgeRate = this.dodgeRate || 0;
    }

    attackTarget(target) {
        let damage = Math.max(
            1,
            this.attack - target.defense + Math.floor(Math.random() * 3)
        );
        if (Math.random() < (this.critRate || 0)) {
            damage = Math.floor(damage * 1.5);
        }
        target.takeDamage(damage);
        if (this.resourceType === 'rage') {
            this.resource = Math.min(this.maxResource, this.resource + 10);
        }
        return damage;
    }

    heal() {
        const cost = 20;
        if (this.resource < cost) return null;
        this.resource -= cost;
        if (this.class === 'guerrier') {
            this.shieldActive = true;
            return 'shield';
        } else if (this.class === 'voleur') {
            this.dodgeNext = true;
            return 'dodge';
        } else {
            // mage
            this.manaShieldActive = true;
            return 'manaShield';
        }
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

    applyStatusEffects() {
        const logs = [];
        this.statusEffects = this.statusEffects.filter(e => {
            if (e.name === 'poison' || e.name === 'brulure') {
                this.health -= e.value;
                logs.push(`${this.name} subit ${e.value} dégâts de ${e.name}.`);
            }
            e.duration--;
            return e.duration > 0;
        });
        if (this.health < 0) this.health = 0;
        return logs;
    }

    takeDamage(dmg) {
        if (this.dodgeNext) {
            this.dodgeNext = false;
            return 0;
        }
        if (Math.random() < (this.dodgeRate || 0)) {
            return 0;
        }
        if (this.shieldActive) {
            dmg = Math.floor(dmg / 2);
            this.shieldActive = false;
        }
        if (this.manaShieldActive) {
            const absorbed = Math.min(this.resource, dmg);
            this.resource -= absorbed;
            dmg -= absorbed;
            this.manaShieldActive = false;
        }
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
