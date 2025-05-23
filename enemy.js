class Enemy {
    constructor(data) {
        
        Object.assign(this, data);
        this.damageType = this.damageType || "physical";
        this.magicModifier = this.magicModifier === undefined ? 1 : this.magicModifier;
        this.physicalModifier = this.physicalModifier === undefined ? 1 : this.physicalModifier;
        this.magicResist = this.magicResist || 0;
        this.physicalResist = this.physicalResist || 0;
        this.statusEffects = this.statusEffects || [];
    }

    takeDamage(dmg, type="physical") {
        if (type === "magic") {
            dmg = Math.floor(dmg * (this.magicModifier || 1));
            dmg = Math.floor(dmg * (1 - (this.magicResist || 0)));
        } else {
            dmg = Math.floor(dmg * (this.physicalModifier || 1));
            dmg = Math.floor(dmg * (1 - (this.physicalResist || 0)));
        }
        this.health -= dmg;
        if (this.health < 0) this.health = 0;
        return dmg;
    }

    attack(player) {
        let damage = Math.max(
            1,
            this.attackRange[0] + Math.floor(Math.random() * (this.attackRange[1] - this.attackRange[0] + 1)) - player.defense
        );
        player.takeDamage(damage, this.damageType);
        if (this.statusEffectOnAttack && Math.random() < (this.statusEffectOnAttack.chance || 1)) {
            player.statusEffects.push({
                name: this.statusEffectOnAttack.name,
                duration: this.statusEffectOnAttack.duration,
                value: this.statusEffectOnAttack.value
            });
            this.appliedEffectLog = `${player.name} est affecté par ${this.statusEffectOnAttack.name}!`;
        } else {
            this.appliedEffectLog = null;
        }
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
}

if (typeof module !== 'undefined') {
    module.exports = Enemy;
}
