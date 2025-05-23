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
        this.advancedEffect = this.advancedEffect || null;
        this.roadBonus = this.roadBonus || 0;
        this.damageType = this.damageType || "physical";
        this.magicResist = this.magicResist || 0;
        this.physicalResist = this.physicalResist || 0;
        this.specialCostReduction = this.specialCostReduction || 0;
        this.xpMultiplier = this.xpMultiplier || 1;
    }

    startTurn() {
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.resourceType === 'mana') {
            this.resource = Math.min(this.maxResource, this.resource + 5);
        }
    }

    attackTarget(target) {
        this.startTurn();
        let damage = Math.max(
            1,
            this.attack + (this.roadBonus || 0) - target.defense + Math.floor(Math.random() * 3)
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
        target.takeDamage(damage, this.damageType);
        this.comboPoints++;
        if (crit) this.comboPoints++;
        if (this.resourceType === 'energie') {
            this.resource = Math.min(this.maxResource, this.resource + 5);
        }
        return damage;
    }

    useAbility() {
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
        } else if (this.class === 'mage') {
            const heal = 20;
            this.health = Math.min(this.maxHealth, this.health + heal);
            this.manaShieldActive = true;
            this.comboPoints++;
            return 'heal';
        } else {
            // rodeur
            const heal = 10;
            this.health = Math.min(this.maxHealth, this.health + heal);
            this.comboPoints++;
            return 'heal';
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
        let cost = costs[this.resourceType] + this.specialUses * 5 - this.specialCostReduction;
        if (cost < 0) cost = 0;
        let damage = 0;
        if (this.class === 'guerrier') {
            if (this.resource <= 0) return null;
            damage = this.attack + this.resource;
            this.resource = 0;
            cost = 0;
        } else {
            if (this.resource < cost) return null;
            this.resource -= cost;
            if (this.class === 'mage') {
                damage = Math.floor(this.attack * 1.8) + 5;
                target.statusEffects.push({ name: 'brulure', duration: 3, value: 4 });
            } else if (this.class === 'voleur') {
                damage = Math.floor(this.attack * 0.5) * 3;
                this.dodgeNext = true;
            } else if (this.class === 'rodeur') {
                damage = Math.floor(this.attack * 1.2);
                target.statusEffects.push({ name: 'ralentissement', duration: 2, value: 2 });
            } else {
                damage = Math.floor(this.attack * 1.5) + 5;
            }
            damage -= Math.floor(target.defense * 0.5);
            if (damage < 1) damage = 1;
        }

        // Combo multiplier
        damage = Math.floor(damage * (1 + this.comboPoints / 10));
        this.comboPoints = 0;

        // Status synergy: explode poison
        const poisonIndex = target.statusEffects.findIndex(e => e.name === 'poison');
        if (poisonIndex !== -1) {
            damage += 10;
            target.statusEffects.splice(poisonIndex, 1);
        }

        target.takeDamage(damage, this.damageType);

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

        if (this.advancedEffect === 'specialCrit' && this.class === 'rodeur') {
            if (Math.random() < 0.25) damage = Math.floor(damage * 1.5);
        }

        if (this.advancedEffect === 'fury' && this.health < this.maxHealth / 2) {
            damage = Math.floor(damage * 1.2);
        }

        this.specialCooldown = 2;
        this.specialUses++;
        this.attackPenaltyTurns = 1;
        return damage;
    }

    finisher(target) {
        if (this.comboPoints < 5) return null;
        this.startTurn();
        this.comboPoints -= 5;
        let damage = this.attack * 2;
        if (this.class === 'mage') {
            damage = Math.floor(this.attack * 2.2);
        } else if (this.class === 'voleur') {
            damage = Math.floor(this.attack * 1.8) + 5;
        } else if (this.class === 'rodeur') {
            damage = Math.floor(this.attack * 1.9);
        } else {
            damage = Math.floor(this.attack * 2);
        }
        target.takeDamage(damage, this.damageType);
        return damage;
    }

    tryFlee(enemy) {
        this.startTurn();
        const chance = 0.3 + (this.dodgeRate || 0);
        if (Math.random() < chance) {
            return true;
        }
        enemy.attack(this);
        return false;
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

    takeDamage(dmg, type="physical") {
        if (this.dodgeNext) {
            this.dodgeNext = false;
            this.comboPoints++;
            if (this.resourceType === 'energie') {
                this.resource = Math.min(this.maxResource, this.resource + 5);
            }
            return 0;
        }
        if (Math.random() < (this.dodgeRate || 0)) {
            this.comboPoints++;
            if (this.resourceType === 'energie') {
                this.resource = Math.min(this.maxResource, this.resource + 5);
            }
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
        if (type === "magic") {
            dmg = Math.floor(dmg * (1 - (this.magicResist || 0)));
        } else {
            dmg = Math.floor(dmg * (1 - (this.physicalResist || 0)));
        }
        this.health -= dmg;
        if (this.resourceType === 'rage') {
            this.resource = Math.min(this.maxResource, this.resource + 15);
        } else if (this.resourceType === 'energie' && dmg === 0) {
            this.resource = Math.min(this.maxResource, this.resource + 5);
        }
        if (this.health < 0) this.health = 0;
        return dmg;
    }

    gainXp(xp, multiplier = 1) {
        xp = Math.floor(xp * multiplier * this.xpMultiplier);
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
