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
        this.specialUses = this.specialUses || 0;
        this.specialCooldown = this.specialCooldown || 0;
        this.comboPoints = this.comboPoints || 0;
        this.attackPenaltyTurns = this.attackPenaltyTurns || 0;
        this.tempCritBonus = this.tempCritBonus || 0;
    }

    startTurn() {
        if (this.specialCooldown > 0) this.specialCooldown--;
    }

    attackTarget(target) {
        this.startTurn();
        let damage = Math.max(
            1,
            this.attack - target.defense + Math.floor(Math.random() * 3)
        );
        if (this.attackPenaltyTurns > 0) {
            damage = Math.floor(damage / 2);
            this.attackPenaltyTurns--;
        }
        let crit = false;
        const critChance = (this.critRate || 0) + (this.tempCritBonus || 0);
        if (Math.random() < critChance) {
            damage = Math.floor(damage * 1.5);
            crit = true;
        }
        this.tempCritBonus = 0;
        target.takeDamage(damage);
        this.comboPoints++;
        if (crit) this.comboPoints++;
        if (this.resourceType === 'rage') {
            this.resource = Math.min(this.maxResource, this.resource + 10);
        } else if (this.resourceType === 'energie') {
            this.resource = Math.min(this.maxResource, this.resource + 5);
        }
        return damage;
    }

    heal() {
        this.startTurn();
        const cost = 20;
        if (this.resource < cost) return null;
        this.resource -= cost;
        if (this.class === 'guerrier') {
            this.shieldActive = true;
            this.comboPoints++;
            return 'shield';
        } else if (this.class === 'voleur') {
            this.dodgeNext = true;
            this.comboPoints++;
            return 'dodge';
        } else {
            // mage
            this.manaShieldActive = true;
            this.comboPoints++;
            return 'manaShield';
        }
    }

    defend() {
        this.startTurn();
        this.isDefending = true;
        this.comboPoints++;
    }

    special(target) {
        this.startTurn();
        if (this.specialCooldown > 0) return null;
        if (this.advancedClass === 'Berserker' && this.health > this.maxHealth * 0.3) {
            return null;
        }
        const costs = { mana: 30, energie: 20, rage: 50 };
        const cost = costs[this.resourceType] + this.specialUses * 10;
        if (this.resource < cost) return null;
        this.resource -= cost;
        let damage = Math.floor(this.attack * 1.5) + 5;
        damage -= Math.floor(target.defense * 0.5);
        if (damage < 1) damage = 1;

        // Combo multiplier
        damage = Math.floor(damage * (1 + this.comboPoints / 10));
        this.comboPoints = 0;

        // Status synergy: explode poison
        const poisonIndex = target.statusEffects.findIndex(e => e.name === 'poison');
        if (poisonIndex !== -1) {
            damage += 10;
            target.statusEffects.splice(poisonIndex, 1);
        }

        target.takeDamage(damage);

        // Dynamic talents triggered by special
        if (this.talents && this.talents.includes('Folie du combat')) {
            this.tempCritBonus = 0.1;
        }
        if (this.talents && this.talents.includes('Second souffle')) {
            this.health = Math.min(this.maxHealth, this.health + 10);
        }
        if (this.talents && this.talents.includes('Canalisation rapide')) {
            this.resource = Math.min(this.maxResource, this.resource + 15);
        }

        this.specialCooldown = 2;
        this.specialUses++;
        this.attackPenaltyTurns = 1;
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
            this.comboPoints++;
            return 0;
        }
        if (Math.random() < (this.dodgeRate || 0)) {
            this.comboPoints++;
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
        const regen = { mana: 5, energie: 5 };
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
