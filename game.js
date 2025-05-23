/* --------- Données de base --------- */
// Réduction de la difficulté globale de 5%
const DIFFICULTY_MULTIPLIER = 0.95;
const CURRENT_SAVE_VERSION = 1;
const CRAFT_COOLDOWN_MS = 3000;
const CARD_DROP_RATE = 0.02;
const cardsList = ['Arcane','Braise','Foudre','Glace','Ombre','Lumière'];

function enemyPlaceholder(name) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='#444'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20'>${name}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function locationPlaceholder(name) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='100%' height='100%' fill='#333'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='24'>${name}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function formatBonus(bonus) {
    const map = { attack: 'ATK', defense: 'DEF', maxHealth: 'PV', maxResource: 'RES', critRate: 'Crit', dodgeRate: 'Esq' };
    return Object.entries(bonus).map(([k,v]) => {
        if ((k === 'critRate' || k === 'dodgeRate') && v < 1) {
            return `${map[k]} +${Math.round(v*100)}%`;
        }
        return `${map[k] || k} +${v}`;
    }).join(' ');
}
const classes = {
    guerrier: { name: "Guerrier", maxHealth: 60, attack: 10, defense: 8, icon: "fa-shield-halved", resource: "rage", maxResource: 100, critRate: 0.05, dodgeRate: 0.05, damageType: "physical", magicResist: 0.1 },
    mage: { name: "Mage", maxHealth: 40, attack: 14, defense: 4, icon: "fa-hat-wizard", resource: "mana", maxResource: 100, critRate: 0.1, dodgeRate: 0.05, damageType: "magic", magicResist: 0.3 },
    voleur: { name: "Voleur", maxHealth: 45, attack: 12, defense: 6, icon: "fa-user-ninja", resource: "energie", maxResource: 100, critRate: 0.1, dodgeRate: 0.15, damageType: "physical", magicResist: 0.05 },
    rodeur: { name: 'Rôdeur', maxHealth: 50, attack: 11, defense: 7, icon: 'fa-person-hiking', resource: 'energie', maxResource: 100, critRate: 0.1, dodgeRate:0.1, damageType: 'physical', magicResist: 0.1 }
};

const advancedClasses = {
    guerrier: {
        chevalier: { name: 'Chevalier', attack: 2, defense: 2 },
        berserker: { name: 'Berserker', attack: 3, defense: 0, critRate: 0.05, effect: 'fury', description: 'Dégâts accrus si blessé' }
    },
    mage: {
        archimage: { name: 'Archimage', attack: 3, defense: 0 },
        enchanteur: { name: 'Enchanteur', attack: 2, defense: 1, maxHealth: 5 }
    },
    voleur: {
        assassin: { name: 'Assassin', attack: 3, defense: 1 },
        duelliste: { name: 'Duelliste', attack: 2, defense: 1, dodgeRate: 0.05 }
    },
    rodeur: {
        ranger: { name: 'Ranger', attack: 2, defense: 1, effect: 'specialCrit', description: 'Spécial critique plus souvent' },
        traqueur: { name: 'Traqueur', attack: 1, defense: 2, critRate: 0.05 }
    }
};

const jobs = {
    forgeron: { name: 'Forgeron', bonus: { attack: 2 } },
    herboriste: { name: 'Herboriste', bonus: { maxHealth: 5 } },
    alchimiste: { name: 'Alchimiste', bonus: { attack: 1, maxHealth: 5 } }
};

const talents = {
    guerrier: {
        frappePuissante: { name: 'Frappe puissante', bonus: { attack: 3 }, description: '+3 ATK' },
        peauDeFer: { name: 'Peau de fer', bonus: { defense: 3 }, description: '+3 DEF' },
        maitriseRage: { name: 'Maîtrise de la rage', bonus: { maxResource: 20 }, description: '+20 Rage' },
        maitriseSpeciale: { name: 'Maîtrise spéciale', bonus: { specialCostReduction: 5 }, description: '-5 coût spécial' }
    },
    mage: {
        puissanceMagique: { name: 'Puissance magique', bonus: { attack: 2, critRate: 0.05 }, description: '+2 ATK, +5% Critique' },
        barriereArcanique: { name: 'Barrière arcanique', bonus: { defense: 1, maxHealth: 5 }, description: '+1 DEF, +5 PV' },
        espritSage: { name: 'Esprit sage', bonus: { maxResource: 20 }, description: '+20 Mana' },
        maitriseSpeciale: { name: 'Maîtrise spéciale', bonus: { specialCostReduction: 5 }, description: '-5 coût spécial' }
    },
    voleur: {
        lameRapide: { name: 'Lame rapide', bonus: { attack: 2, dodgeRate: 0.05 }, description: '+2 ATK, +5% Esquive' },
        ombreFurtive: { name: 'Ombre furtive', bonus: { dodgeRate: 0.1 }, description: '+10% Esquive' },
        maitrePoison: { name: 'Maître du poison', bonus: { critRate: 0.05 }, description: '+5% Critique' },
        maitriseSpeciale: { name: 'Maîtrise spéciale', bonus: { specialCostReduction: 5 }, description: '-5 coût spécial' }
    },
    rodeur: {
        tirPrecis: { name: 'Tir précis', bonus: { attack: 2, critRate: 0.05 }, description: '+2 ATK, +5% Critique' },
        survieNature: { name: 'Survie en nature', bonus: { maxHealth: 5, defense: 1 }, description: '+5 PV, +1 DEF' },
        chasseurEvasif: { name: 'Chasseur évasif', bonus: { dodgeRate: 0.05 }, description: '+5% Esquive' },
        maitriseSpeciale: { name: 'Maîtrise spéciale', bonus: { specialCostReduction: 5 }, description: '-5 coût spécial' }
    }
};

// Équipement spécifique à chaque classe
const equipmentData = {
    guerrier: {
        head: { key: 'casqueGuerrier', name: 'Casque robuste', slot: 'head', bonus: { defense: 2 } },
        shoulders: { key: 'epaulieresGuerrier', name: "Épaulières d'acier", slot: 'shoulders', bonus: { defense: 2 } },
        legs: { key: 'jambieresGuerrier', name: 'Jambières lourdes', slot: 'legs', bonus: { maxHealth: 5 } },
        gloves: { key: 'gantsGuerrier', name: 'Gants de puissance', slot: 'gloves', bonus: { attack: 1 } }
    },
    mage: {
        head: { key: 'casqueMage', name: 'Capuche mystique', slot: 'head', bonus: { maxResource: 10 } },
        shoulders: { key: 'epaulieresMage', name: 'Épaulettes enchantées', slot: 'shoulders', bonus: { defense: 1 } },
        legs: { key: 'jambieresMage', name: 'Bas de robe renforcé', slot: 'legs', bonus: { maxHealth: 5 } },
        gloves: { key: 'gantsMage', name: 'Gants de mana', slot: 'gloves', bonus: { attack: 1 } }
    },
    voleur: {
        head: { key: 'casqueVoleur', name: 'Capuche discrète', slot: 'head', bonus: { dodgeRate: 0.05 } },
        shoulders: { key: 'epaulieresVoleur', name: 'Épaulières légères', slot: 'shoulders', bonus: { defense: 1 } },
        legs: { key: 'jambieresVoleur', name: 'Jambières souples', slot: 'legs', bonus: { dodgeRate: 0.05 } },
        gloves: { key: 'gantsVoleur', name: "Gants d'agilité", slot: 'gloves', bonus: { attack: 1 } }
    },
    rodeur: {
        head: { key: 'casqueRodeur', name: 'Capuche du rôdeur', slot: 'head', bonus: { critRate: 0.05 } },
        shoulders: { key: 'epaulieresRodeur', name: 'Épaules forestières', slot: 'shoulders', bonus: { defense: 1 } },
        legs: { key: 'jambieresRodeur', name: 'Jambières de chasseur', slot: 'legs', bonus: { dodgeRate: 0.05 } },
        gloves: { key: 'gantsRodeur', name: "Gants d'archer", slot: 'gloves', bonus: { attack: 1 } }
    }
};

const allEquipment = {};
Object.values(equipmentData).forEach(cls => {
    Object.values(cls).forEach(eq => {
        allEquipment[eq.key] = eq;
    });
});

const enemiesList = [
    { name: 'Araignée venimeuse', level: 4, health: 32, maxHealth: 32, attackRange: [7,12], defense: 3, nextAttack: 'Morsure', img: enemyPlaceholder('Araignee'), statusEffectOnAttack: { name: 'poison', chance: 0.4, duration: 3, value: 2 } },
    { name: "Loup des Ombres", magicModifier: 1.5, physicalModifier: 1, level: 4, health: 35, maxHealth: 35, attackRange: [8,12], defense: 3, nextAttack: "Morsure", img: enemyPlaceholder('Loup'), preferredTime: 'night' },
    { name: "Golem de Pierre", physicalModifier: 0.8, magicModifier: 1.2, level: 5, health: 50, maxHealth: 50, attackRange: [10,15], defense: 5, nextAttack: "Coup de poing", img: enemyPlaceholder('Golem') },
    { name: "Esprit Perdu", magicModifier: 0.5, physicalModifier: 1.5, level: 3, health: 25, maxHealth: 25, attackRange: [5,10], defense: 2, nextAttack: "Toucher spectral", img: enemyPlaceholder('Esprit'), preferredTime: 'night' },
    { name: "Ombre Silencieuse", magicModifier: 0.5, physicalModifier: 1.5, level: 6, health: 40, maxHealth: 40, attackRange: [9,14], defense: 4, nextAttack: "Lame ténébreuse", img: enemyPlaceholder('Ombre'), preferredTime: 'night' },
    { name: "Spectre Glacial", magicModifier: 0.5, physicalModifier: 1.5, level: 7, health: 45, maxHealth: 45, attackRange: [10,16], defense: 5, nextAttack: "Souffle glacé", img: enemyPlaceholder('Spectre'), preferredTime: 'night' },
    { name: "Serpent des Sables", magicModifier: 1.3, physicalModifier: 1, level: 5, health: 30, maxHealth: 30, attackRange: [7,13], defense: 3, nextAttack: "Morsure rapide", img: enemyPlaceholder('Serpent'), preferredTime: 'day' },
    { name: "Gardien antique", magicModifier: 0.8, physicalModifier: 0.9, level: 8, health: 60, maxHealth: 60, attackRange: [12,18], defense: 6, nextAttack: "Frappe lourde", img: enemyPlaceholder('Gardien'), location: locationPlaceholder('Ruines'), requiredQuest: "artefact", requiredStep: 1 },
    { name: "Spectre du passé", magicModifier: 0.5, physicalModifier: 1.5, level: 9, health: 55, maxHealth: 55, attackRange: [13,19], defense: 5, nextAttack: "Hurlement spectral", img: enemyPlaceholder('Spectre'), unlockQuest: "artefact", preferredTime: 'night' }
];

const locations = [
    { name: 'Forêt enchantée', img: locationPlaceholder('Forêt') },
    { name: 'Caverne sombre', img: locationPlaceholder('Caverne') },
    { name: 'Désert aride', img: locationPlaceholder('Désert') },
    { name: 'Château en ruines', img: locationPlaceholder('Château') }
];

// Ingrédients récoltables pour le futur craft
const ingredientsData = {
    herbeSauvage: { name: 'Herbe sauvage', icon: 'fa-leaf', rarity: 'commun', level: 1 },
    griffeLoup: { name: 'Griffe de loup', icon: 'fa-paw', rarity: 'commun', level: 2 },
    pierreLune: { name: 'Pierre de lune', icon: 'fa-gem', rarity: 'peuCommun', level: 4 },
    crocVenimeux: { name: 'Croc venimeux', icon: 'fa-tooth', rarity: 'peuCommun', level: 4 },
    cendreSpectrale: { name: 'Cendre spectrale', icon: 'fa-ghost', rarity: 'rare', level: 6 },
    essenceOmbre: { name: "Essence d'ombre", icon: 'fa-eye', rarity: 'rare', level: 6 },
    coeurGolem: { name: 'Cœur de golem', icon: 'fa-heart', rarity: 'epique', level: 8 },
    ecailleDragon: { name: 'Écaille de dragon', icon: 'fa-dragon', rarity: 'epique', level: 10 }
    , lingotFer: { name: 'Lingot de fer', icon: 'fa-cubes', rarity: 'commun', level: 2 }
    , cuirSouple: { name: 'Cuir souple', icon: 'fa-feather', rarity: 'commun', level: 2 }
    , tissuMagique: { name: 'Tissu magique', icon: 'fa-scroll', rarity: 'peuCommun', level: 3 }
    , orbeAncien: { name: 'Orbe ancien', icon: 'fa-gem', rarity: 'rare', level: 6 }
};

const ingredientDropRates = { commun: 0.3, peuCommun: 0.2, rare: 0.1, epique: 0.03 };

const craftRecipes = {
    potion: {
        name: 'Potion de soin',
        result: 'potion',
        ingredients: { herbeSauvage: 2 }
    },
    firePotion: {
        name: 'Potion de feu',
        result: 'firePotion',
        ingredients: { pierreLune: 1, crocVenimeux: 1 }
    },
    megaPotion: {
        name: 'Méga potion',
        result: 'megaPotion',
        ingredients: { herbeSauvage: 2, cendreSpectrale: 1 }
    },
    bomb: {
        name: 'Bombe',
        result: 'bomb',
        ingredients: { essenceOmbre: 1, pierreLune: 1 }
    },
    elixir: {
        name: 'Élixir ultime',
        result: 'elixir',
        ingredients: { coeurGolem: 1, ecailleDragon: 1 }
    },
    casqueGuerrier: {
        name: 'Casque robuste',
        result: 'casqueGuerrier',
        ingredients: { lingotFer: 2, cuirSouple: 1 }
    },
    epaulieresGuerrier: {
        name: 'Épaulières d\'acier',
        result: 'epaulieresGuerrier',
        ingredients: { lingotFer: 2, cuirSouple: 1 }
    },
    jambieresGuerrier: {
        name: 'Jambières lourdes',
        result: 'jambieresGuerrier',
        ingredients: { lingotFer: 1, cuirSouple: 2 }
    },
    gantsGuerrier: {
        name: 'Gants de puissance',
        result: 'gantsGuerrier',
        ingredients: { cuirSouple: 2 }
    },
    casqueMage: {
        name: 'Capuche mystique',
        result: 'casqueMage',
        ingredients: { tissuMagique: 2, orbeAncien: 1 }
    },
    epaulieresMage: {
        name: 'Épaulettes enchantées',
        result: 'epaulieresMage',
        ingredients: { tissuMagique: 2 }
    },
    jambieresMage: {
        name: 'Bas de robe renforcé',
        result: 'jambieresMage',
        ingredients: { tissuMagique: 1, cuirSouple: 1 }
    },
    gantsMage: {
        name: 'Gants de mana',
        result: 'gantsMage',
        ingredients: { tissuMagique: 1, orbeAncien: 1 }
    },
    casqueVoleur: {
        name: 'Capuche discrète',
        result: 'casqueVoleur',
        ingredients: { cuirSouple: 2 }
    },
    epaulieresVoleur: {
        name: 'Épaulières légères',
        result: 'epaulieresVoleur',
        ingredients: { cuirSouple: 1, tissuMagique: 1 }
    },
    jambieresVoleur: {
        name: 'Jambières souples',
        result: 'jambieresVoleur',
        ingredients: { cuirSouple: 2 }
    },
    gantsVoleur: {
        name: 'Gants d\'agilité',
        result: 'gantsVoleur',
        ingredients: { cuirSouple: 1 }
    },
    casqueRodeur: {
        name: 'Capuche du rôdeur',
        result: 'casqueRodeur',
        ingredients: { cuirSouple: 1, tissuMagique: 1 }
    },
    epaulieresRodeur: {
        name: 'Épaules forestières',
        result: 'epaulieresRodeur',
        ingredients: { cuirSouple: 1, lingotFer: 1 }
    },
    jambieresRodeur: {
        name: 'Jambières de chasseur',
        result: 'jambieresRodeur',
        ingredients: { cuirSouple: 2 }
    },
    gantsRodeur: {
        name: 'Gants d\'archer',
        result: 'gantsRodeur',
        ingredients: { cuirSouple: 1 }
    }
};

const craftResultInfo = {
    potion: 'Restaure 20 PV',
    firePotion: 'Inflige 20 dégâts + brûlure',
    megaPotion: 'Restaure 50 PV',
    bomb: 'Inflige 35 dégâts',
    elixir: 'Restaure complètement PV et ressource'
};

function generateIngredientLoot(enemyLevel) {
    const drops = [];
    Object.entries(ingredientsData).forEach(([key, ing]) => {
        if (enemyLevel >= ing.level) {
            let rate = ingredientDropRates[ing.rarity] * (enemyLevel / ing.level);
            if (rate > 1) rate = 1;
            if (Math.random() < rate) drops.push(key);
        }
    });
    return drops;
}

function handleCardDrop() {
    if (Math.random() < CARD_DROP_RATE) {
        const card = cardsList[Math.floor(Math.random() * cardsList.length)];
        if (!gameState.cards) gameState.cards = {};
        if (gameState.cards[card]) {
            gameState.cardDust = (gameState.cardDust || 0) + 1;
            addBattleMessage("Vous recevez de la poussière de carte.", 'system');
        } else {
            gameState.cards[card] = 1;
            addBattleMessage(`Vous obtenez la carte “${card}”!`, 'system');
        }
        renderAlbum();
    }
}

const scenarios = [
    {
        text: 'Après ce combat, que souhaitez-vous faire ?',
        choices: [
            { text: 'Passer à la forge', action: 'forge', next: 0 },
            { text: 'Visiter le magasin', action: 'shop', next: 0 },
            { text: "Utiliser l'atelier", action: 'craft', next: 0 },
            { text: 'Se reposer (10 or)', action: 'rest', next: 0 },
            { text: 'Discuter avec le voyageur', action: 'dialogue-voyageur', next: 0 },
            { text: 'Voir le capitaine', action: 'dialogue-capitaine', next: 0 },
            { text: 'Continuer la route', action: 'road', next: 0 }
        ]
    },
    {
        text: "Vous arrivez au village voisin. L'herboriste attend votre courrier.",
        choices: [
            { text: 'Remettre la lettre', action: 'deliver-letter', next: 0 },
            { text: 'Repartir', action: 'road-return', next: 0 }
        ]
    },
    {
        text: "L'herboriste examine vos herbes avec attention.",
        choices: [
            { text: 'Donner les herbes', action: 'give-herbs', next: 0 },
            { text: 'Plus tard', action: 'road-return', next: 0 }
        ]
    },
    {
        text: 'Un vieil homme en toge vous adresse la parole près des ruines.',
        choices: [
            { text: 'Lui parler', action: 'dialogue-sage', next: 0 },
            { text: 'Ignorer', action: 'road-return', next: 0 }
        ]
    },
    {
        text: "Le sage attend votre décision concernant l'orbe.",
        choices: [
            { text: "Remettre l'orbe", action: 'give-orb', next: 0 },
            { text: "Garder l'orbe", action: 'keep-orb', next: 0 }
        ]
    }
];

const randomEvents = [
    {
        text: 'Vous trouvez un coffre abandonné sur le bord de la route.',
        choices: [
            { text: "L'ouvrir", action: 'find-gold', next: 0 },
            { text: 'Continuer son chemin', action: 'road-return', next: 0 }
        ]
    },
    {
        text: 'Un marchand itinérant vous aborde.',
        choices: [
            { text: 'Marchander', action: 'shop', next: 0 },
            { text: 'Ignorer', action: 'road-return', next: 0 }
        ]
    }
];

const dialogues = {
    voyageur: [
        {
            text: 'Salut, aventurier ! Que cherches-tu ?',
            choices: [
                { text: 'Des rumeurs.', next: 1 },
                { text: 'Tu as du travail ?', next: 2 },
                { text: 'Rien pour le moment.', end: true }
            ]
        },
        {
            text: "On raconte qu'une grotte au nord regorge de trésors... mais les monstres y pullulent.",
            choices: [ { text: 'Merci du conseil.', end: true } ]
        },
        {
            text: "Justement, pourrais-tu livrer cette lettre au village voisin ?",
            quest: 'courrier',
            choices: [ { text: 'Je m\'en charge.', end: true } ]
        },
        {
            text: "J'aurais besoin de quatre griffes de loup pour un client.",
            quest: 'collectionGriffes',
            choices: [ { text: 'Je vais chercher ça.', end: true } ]
        }
    ],
    sage: [
        {
            text: "Je recherche un orbe ancien gardé dans ces ruines. Acceptez-vous de me le rapporter ?",
            quest: "artefact",
            choices: [
                { text: "Oui, je vais le trouver.", next: 1 },
                { text: "Non, désolé.", end: true }
            ]
        },
        {
            text: "Revenez avec l'orbe et nous dévoilerons son secret.",
            quest: "artefact",
            questStep: 1,
            choices: [ { text: "À bientôt.", end: true } ]
        }
    ],
    capitaine: [
        {
            text: "Soldat, nous manquons de bras pour sécuriser la région.",
            choices: [
                { text: 'Chasser 3 loups', quest: 'chasseLoups', end: true },
                { text: 'Récupérer 3 lingots', quest: 'mineraiRare', end: true },
                { text: 'Vaincre 2 spectres', quest: 'chasseSpectres', end: true },
                { text: 'Escorter une caravane', quest: 'escorteCaravane', end: true },
                { text: 'Garde de la route', quest: 'gardeRoute', end: true },
                { text: 'Rien pour l\'instant', end: true }
            ]
        }
    ]
};

const quests = {
    artefact: {
        name: 'Artefact ancien',
        description: "Retrouver l'orbe des ruines pour le sage",
        reward: 80,
        npc: 'sage',
        steps: [
            'Accepter la quête auprès du sage',
            'Vaincre le Gardien antique',
            "Rapporter l'orbe"
        ]
    },
    courrier: {
        name: 'Service postal',
        description: 'Livrer la lettre au village voisin',
        reward: 30,
        npc: 'voyageur',
        steps: [
            'Prendre la lettre',
            'Aller au village',
            'Remettre la lettre'
        ]
    },
    herbes: {
        name: 'Herboriste',
        description: "Apporter 3 herbes à l'herboriste",
        reward: 40,
        npc: 'herboriste',
        steps: [
            'Récolter les herbes',
            'Apporter les herbes',
            'Recevoir la récompense'
        ]
    },
    forge: {
        name: 'Premier équipement',
        description: 'Améliorer votre arme ou votre armure',
        reward: 50,
        npc: 'forgeron',
        steps: [
            'Gagner de l\'or',
            'Aller à la forge',
            'Acheter une amélioration'
        ]
    },
    chasseLoups: {
        name: 'Chasse aux loups',
        description: 'Éliminer 3 Loups des Ombres',
        reward: 30,
        npc: 'capitaine',
        repeatable: true,
        steps: [ 'Tuer 3 loups' ]
    },
    mineraiRare: {
        name: 'Minerai rare',
        description: 'Récupérer 3 lingots de fer',
        reward: 35,
        npc: 'capitaine',
        repeatable: true,
        steps: [ 'Obtenir 3 lingots de fer' ]
    },
    chasseSpectres: {
        name: 'Spectres glacés',
        description: 'Vaincre 2 Spectres Glaciaux',
        reward: 50,
        npc: 'capitaine',
        steps: [ 'Tuer 2 spectres' ]
    },
    explorationDesert: {
        name: 'Exploration du désert',
        description: 'Atteindre le désert aride',
        reward: 60,
        npc: 'voyageur',
        steps: [ 'Découvrir le désert' ]
    },
    recolteHerbes: {
        name: 'Cueillir des herbes',
        description: 'Ramener 5 herbes sauvages',
        reward: 20,
        npc: 'herboriste',
        repeatable: true,
        steps: [ 'Collecter 5 herbes' ]
    },
    escorteCaravane: {
        name: 'Escorte de caravane',
        description: 'Vaincre un Serpent des Sables',
        reward: 40,
        npc: 'capitaine',
        steps: [ 'Protéger la caravane' ]
    },
    gardeRoute: {
        name: 'Garde de la route',
        description: 'Éliminer 5 ennemis',
        reward: 25,
        npc: 'capitaine',
        repeatable: true,
        steps: [ 'Tuer 5 monstres' ]
    },
    chasseOmbre: {
        name: 'Ombre menaçante',
        description: 'Tuer une Ombre Silencieuse',
        reward: 55,
        npc: 'capitaine',
        steps: [ 'Éliminer l\'Ombre' ]
    },
    collectionGriffes: {
        name: 'Griffes recherchées',
        description: 'Rapporter 4 griffes de loup',
        reward: 30,
        npc: 'voyageur',
        repeatable: true,
        steps: [ 'Collecter 4 griffes' ]
    },
    bestiaryEtude: {
        name: 'Étude du bestiaire',
        description: 'Découvrir 5 types d\'ennemis',
        reward: 80,
        npc: 'sage',
        steps: [ 'Ajouter 5 entrées au bestiaire' ]
    }
};

/* --------- Chargement/Sauvegarde --------- */
function saveGame() {
    const SAVE_VERSION = 1;
    gameState.saveVersion = SAVE_VERSION;
    localStorage.setItem('luminaSave', JSON.stringify(gameState));
}

function loadGame() {
    const SAVE_VERSION = 1;
    const data = localStorage.getItem('luminaSave');
    if (!data) return null;
    const obj = JSON.parse(data);
    if (!obj.saveVersion || obj.saveVersion < SAVE_VERSION) {
        obj.saveVersion = SAVE_VERSION;
    }
    if (obj.player) obj.player = new Player(obj.player);
    if (obj.enemy) obj.enemy = new Enemy(obj.enemy);
    if (obj.player && !obj.player.statusEffects) obj.player.statusEffects = [];
    if (obj.enemy && !obj.enemy.statusEffects) obj.enemy.statusEffects = [];
    if (obj.player && !obj.player.equipment) {
        obj.player.equipment = { head: null, shoulders: null, legs: null, gloves: null };
    }
    // Always start a new session on the player's turn to avoid being stuck
    obj.isPlayerTurn = true;
    return obj;
}

/* --------- État du jeu --------- */
let gameState = loadGame();
if (!gameState) {
    gameState = {
        saveVersion: CURRENT_SAVE_VERSION,
        player: null,
        enemy: new Enemy({
            name: 'Loup des Ombres',
            level: 1,
            health: Math.floor(30 * DIFFICULTY_MULTIPLIER),
            maxHealth: Math.floor(30 * DIFFICULTY_MULTIPLIER),
            attackRange: [
                Math.floor(5 * DIFFICULTY_MULTIPLIER),
                Math.floor(8 * DIFFICULTY_MULTIPLIER)
            ],
            defense: 2,
            nextAttack: 'Morsure',
            statusEffects: []
        }),
        inventory: { potion: 3, firePotion: 2, shield: 1, herb: 5, resPotion: 2, megaPotion: 1, bomb: 1 },
        battleLog: ['[Système] Bienvenue dans Lumina. Choisissez votre classe pour commencer.'],
        isPlayerTurn: true,
        scenarioStep: 0,
        gold: 50,
        activeQuests: [],
        completedQuests: [],
        questProgress: {},
        bestiary: {},
        timeOfDay: 0,
        dialogueHistory: [],
        roadStreak: 0,
        prestigeLevel: 0,
        astres: 0,
        cards: {},
        cardDust: 0,
        nextCraftTime: 0
    };
} else {
    // Garantir la présence de l'inventaire pour les anciennes sauvegardes
    if (!gameState.inventory) {
        gameState.inventory = {
            potion: 3,
            firePotion: 2,
            shield: 1,
            herb: 5,
            resPotion: 2,
            megaPotion: 1,
            bomb: 1
        };
    }
    if (gameState.gold === undefined) {
        gameState.gold = 50;
    }
    if (!gameState.activeQuests) gameState.activeQuests = [];
    if (!gameState.completedQuests) gameState.completedQuests = [];
    if (!gameState.questProgress) gameState.questProgress = {};
    if (!gameState.bestiary) gameState.bestiary = {};
    if (gameState.timeOfDay === undefined) gameState.timeOfDay = 0;
    if (!gameState.dialogueHistory) gameState.dialogueHistory = [];
    if (gameState.roadStreak === undefined) gameState.roadStreak = 0;
    if (gameState.prestigeLevel === undefined) gameState.prestigeLevel = 0;
    if (gameState.astres === undefined) gameState.astres = 0;
    if (!gameState.cards) gameState.cards = {};
    if (gameState.cardDust === undefined) gameState.cardDust = 0;
    if (gameState.nextCraftTime === undefined) gameState.nextCraftTime = 0;
    if (!gameState.saveVersion) gameState.saveVersion = CURRENT_SAVE_VERSION;
    if (gameState.player && !gameState.player.equipment) {
        gameState.player.equipment = { head: null, shoulders: null, legs: null, gloves: null };
    }
}

// DOM Elements
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const xpBar = document.getElementById('xp-bar');
const battleLog = document.getElementById('battle-log');
const playerCharacter = document.getElementById('player-character');
const playerIcon = document.getElementById('player-icon');
const enemyCharacter = document.getElementById('enemy-character');
const enemyImage = document.getElementById('enemy-image');
const locationImage = document.getElementById('location-image');
const locationName = document.getElementById('location-name');
const playerName = document.getElementById('player-name');
const playerLevelText = document.getElementById('player-level');
const playerHpText = document.getElementById('player-hp-text');
const playerResourceText = document.getElementById('player-resource-text');
const playerResourceBar = document.getElementById('player-resource-bar');
const resourceIcon = document.getElementById('resource-icon');
const enemyName = document.getElementById('enemy-name');
const enemyLevelText = document.getElementById('enemy-level');
const enemyHpText = document.getElementById('enemy-hp-text');
const xpText = document.getElementById('xp-text');
const playerAttackText = document.getElementById('player-attack-text');
const playerDefenseText = document.getElementById('player-defense-text');
const playerCritText = document.getElementById('player-crit-text');
const playerDodgeText = document.getElementById('player-dodge-text');
const comboPointsText = document.getElementById('combo-points-text');
const comboBar = document.getElementById('combo-bar');
const goldText = document.getElementById('gold-text');
const introModal = document.getElementById('intro-modal');
const classModal = document.getElementById('class-modal');
const advancedModal = document.getElementById('advanced-class-modal');
const advancedButtons = document.getElementById('advanced-buttons');
const jobModal = document.getElementById('job-modal');
const talentModal = document.getElementById('talent-modal');
const talentButtons = document.getElementById('talent-buttons');
const scenarioModal = document.getElementById('scenario-modal');
const scenarioText = document.getElementById('scenario-text');
const scenarioButtons = document.getElementById('scenario-buttons');
const dialogueModal = document.getElementById('dialogue-modal');
const dialogueText = document.getElementById('dialogue-text');
const dialogueButtons = document.getElementById('dialogue-buttons');
const inventoryContainer = document.getElementById('inventory-items');
const shopModal = document.getElementById('shop-modal');
const forgeModal = document.getElementById('forge-modal');
const craftModal = document.getElementById('craft-modal');
const shopGoldText = document.getElementById('shop-gold-text');
const forgeGoldText = document.getElementById('forge-gold-text');
const shopMessage = document.getElementById('shop-message');
const forgeMessage = document.getElementById('forge-message');
const forgeCanvas = document.getElementById('forge-canvas');
const craftButtons = document.getElementById('craft-buttons');
const craftMessage = document.getElementById('craft-message');
const activeQuestList = document.getElementById('active-quests');
const completedQuestList = document.getElementById('completed-quests');
const bestiaryList = document.getElementById('bestiary-list');
const timeDisplay = document.getElementById('time-display');
const questDetailModal = document.getElementById('quest-detail-modal');
const questDetailName = document.getElementById('quest-detail-name');
const questDetailDesc = document.getElementById('quest-detail-desc');
const questDetailSteps = document.getElementById('quest-detail-steps');
const questDetailNpc = document.getElementById('quest-detail-npc');
const questDetailDialogues = document.getElementById('quest-detail-dialogues');
const cardGauge = document.getElementById('card-gauge');
const cardCollection = document.getElementById('card-collection');
const astresCount = document.getElementById('astres-count');
const roadBonusDisplay = document.getElementById('road-bonus-display');
const roadBonusMain = document.getElementById('road-bonus-main');
const musicToggle = document.getElementById('music-toggle');
const sfxToggle = document.getElementById('sfx-toggle');

let musicEnabled = true;
let sfxEnabled = true;

if (musicToggle) {
    musicToggle.addEventListener('change', () => {
        musicEnabled = musicToggle.checked;
        if (musicEnabled) startAmbientMusic(); else stopAmbientMusic();
    });
}

if (sfxToggle) {
    sfxToggle.addEventListener('change', () => {
        sfxEnabled = sfxToggle.checked;
    });
}

let audioCtx = null;
let ambientNodes = null;

function startAmbientMusic() {
    if (!musicEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (ambientNodes) return;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const notes = [261.63, 329.63, 392.0];
        let idx = 0;
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.value = notes[0];
        osc2.frequency.value = notes[1];
        const interval = setInterval(() => {
            idx = (idx + 1) % notes.length;
            osc1.frequency.setValueAtTime(notes[idx], audioCtx.currentTime);
            osc2.frequency.setValueAtTime(notes[(idx + 1) % notes.length], audioCtx.currentTime);
        }, 1000);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.value = 0.05;
        osc1.start();
        osc2.start();
        ambientNodes = { osc1, osc2, gain, interval };
    } catch (e) {}
}

function stopAmbientMusic() {
    if (ambientNodes) {
        try {
            ambientNodes.osc1.stop();
            ambientNodes.osc2.stop();
            clearInterval(ambientNodes.interval);
        } catch (e) {}
        ambientNodes = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAmbientMusic();
    } else {
        startAmbientMusic();
    }
});

function playSound(type) {
    if (!sfxEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        if (type === 'heal') {
            osc.frequency.value = 700;
        } else if (type === 'player') {
            osc.frequency.value = 500;
        } else if (type === 'enemy') {
            osc.frequency.value = 250;
        } else {
            osc.frequency.value = 300;
        }
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
}

// Update health bars
function updateHealthBars() {
    if (!gameState.player) return;
    playerHealthBar.style.width = `${(gameState.player.health / gameState.player.maxHealth) * 100}%`;
    enemyHealthBar.style.width = `${(gameState.enemy.health / gameState.enemy.maxHealth) * 100}%`;
    playerResourceBar.style.width = `${(gameState.player.resource / gameState.player.maxResource) * 100}%`;
    const xpPercent = (gameState.player.xp / gameState.player.nextLevelXp) * 100;
    xpBar.style.width = `${xpPercent}%`;
    xpText.textContent = `${gameState.player.xp}/${gameState.player.nextLevelXp} XP`;
    playerHpText.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
    playerResourceText.textContent = `${gameState.player.resource}/${gameState.player.maxResource}`;
    playerHealthBar.title = `${gameState.player.health}/${gameState.player.maxHealth}`;
    playerResourceBar.title = `${gameState.player.resource}/${gameState.player.maxResource}`;
    enemyHpText.textContent = `${gameState.enemy.health}/${gameState.enemy.maxHealth}`;
    playerLevelText.textContent = `Niv. ${gameState.player.level}`;
    enemyLevelText.textContent = `Niv. ${gameState.enemy.level}`;
    enemyName.textContent = gameState.enemy.name;
    if (gameState.enemy.elite) {
        enemyName.classList.add('text-purple-400');
    } else {
        enemyName.classList.remove('text-purple-400');
    }
    playerName.textContent = gameState.player.name;
    if (enemyImage && gameState.enemy.img) {
        enemyImage.src = gameState.enemy.img;
    }
    playerAttackText.textContent = gameState.player.attack + (gameState.player.roadBonus || 0);
    playerDefenseText.textContent = gameState.player.defense;
    if (playerCritText) {
        playerCritText.textContent = `${Math.round(gameState.player.critRate * 100)}%`;
    }
    if (playerDodgeText) {
        playerDodgeText.textContent = `${Math.round(gameState.player.dodgeRate * 100)}%`;
    }
    if (comboPointsText) {
        comboPointsText.textContent = gameState.player.comboPoints;
    }
    if (comboBar) {
        const comboPercent = Math.min(gameState.player.comboPoints, 5) / 5 * 100;
        comboBar.style.width = `${comboPercent}%`;
        comboBar.title = `${gameState.player.comboPoints}/5`;
    }
    if (goldText) {
        goldText.textContent = gameState.gold;
    }
    if (shopGoldText) {
        shopGoldText.textContent = gameState.gold;
    }
    if (forgeGoldText) {
        forgeGoldText.textContent = gameState.gold;
    }
    if (astresCount) {
        astresCount.textContent = gameState.astres;
    }
    if (playerIcon) {
        const classIcon = classes[gameState.player.class]?.icon || 'fa-user';
        playerIcon.className = `fas ${classIcon} text-5xl text-white`;
    }
    const icons = { mana: 'fa-droplet', energie: 'fa-bolt', rage: 'fa-fire' };
    resourceIcon.className = `fas ${icons[gameState.player.resourceType]} text-purple-400 mr-1`;
    if (typeof updateRoadBonus === 'function') updateRoadBonus();
    if (typeof renderAlbum === 'function') renderAlbum();
}

function updateTimeDisplay() {
    if (!timeDisplay) return;
    const label = gameState.timeOfDay < 0.5 ? 'Jour' : 'Nuit';
    timeDisplay.textContent = label;
}

function updateRoadBonus() {
    if (roadBonusMain) {
        roadBonusMain.textContent = gameState.roadStreak > 0 ? `+${gameState.roadStreak} ATK route` : '';
    }
    if (roadBonusDisplay) {
        roadBonusDisplay.textContent = `Bonus d'attaque actuel : +${gameState.roadStreak} ATK`;
    }
}

function getXpMultiplier() {
    return 1 + (gameState.prestigeLevel || 0) * 0.05;
}

function advanceTime() {
    gameState.timeOfDay += 0.25;
    if (gameState.timeOfDay >= 1) gameState.timeOfDay = 0;
    updateTimeDisplay();
    saveGame();
}

function processStatusEffects() {
    const messages = [
        ...gameState.player.applyStatusEffects(),
        ...gameState.enemy.applyStatusEffects()
    ];
    messages.forEach(m => addBattleMessage(m, 'system'));
    updateHealthBars();
}

// Add message to battle log
function addBattleMessage(message, type = 'system') {
    const colors = {
        system: 'blue-300',
        player: 'yellow-300',
        enemy: 'red-300',
        damage: 'red-400',
        heal: 'green-400'
    };
    
    const messageElement = document.createElement('div');
    messageElement.className = `text-sm p-3 bg-blue-900/30 rounded-lg`;
    const speaker = type === 'player'
        ? (gameState.player ? gameState.player.name : 'Joueur')
        : type === 'enemy'
            ? gameState.enemy.name
            : 'Système';
    messageElement.innerHTML = `<span class="text-${colors[type]}">[${speaker}]</span> ${message}`;

    battleLog.appendChild(messageElement);
    battleLog.scrollTop = battleLog.scrollHeight;
    playSound(type);
    console.log(`[${speaker}] ${message}`);
}

function initialize() {
    if (!gameState.player) {
        if (introModal) introModal.classList.remove('hidden');
        else classModal.classList.remove('hidden');
    } else {
        updateHealthBars();
        renderInventory();
        updateQuestPanel();
        updateTimeDisplay();
        if (enemyImage && gameState.enemy && gameState.enemy.img) {
            enemyImage.src = gameState.enemy.img;
        }
        if (locationImage) {
            const loc = locations[Math.floor(Math.random() * locations.length)];
            locationImage.src = loc.img;
            if (locationName) locationName.textContent = loc.name;
        }
        startAmbientMusic();
    }
}

function selectClass(cl) {
    const info = classes[cl];
    gameState.player = new Player({
        name: 'Aelar',
        class: cl,
        level: 1,
        health: info.maxHealth,
        maxHealth: info.maxHealth,
        attack: info.attack,
        defense: info.defense,
        resourceType: info.resource,
        resource: info.resource === 'rage' ? 0 : info.maxResource,
        maxResource: info.maxResource,
        damageType: info.damageType,
        magicResist: info.magicResist,
        physicalResist: 0,
        critRate: info.critRate,
        dodgeRate: info.dodgeRate,
        statusEffects: [],
        xp: 0,
        nextLevelXp: 100,
        job: null,
        talents: [],
        advancedClass: null,
        equipment: { head: null, shoulders: null, legs: null, gloves: null }
    });
    classModal.classList.add('hidden');
    startAmbientMusic();
    addBattleMessage(`Vous avez choisi la classe ${info.name}.`, 'system');
    updateHealthBars();
    renderInventory();
    updateQuestPanel();
    saveGame();
}

function showAdvancedOptions() {
    const adv = advancedClasses[gameState.player.class];
    advancedButtons.innerHTML = '';
    for (const key in adv) {
        const b = document.createElement('button');
        b.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800';
        const a = adv[key];
        const bonuses = [];
        if (a.attack) bonuses.push(`+${a.attack} ATK`);
        if (a.defense) bonuses.push(`+${a.defense} DEF`);
        if (a.maxHealth) bonuses.push(`+${a.maxHealth} PV`);
        if (a.critRate) bonuses.push(`+${Math.round(a.critRate*100)}% Crit`);
        if (a.dodgeRate) bonuses.push(`+${Math.round(a.dodgeRate*100)}% Esquive`);
        b.textContent = `${a.name} (${bonuses.join(', ')})`;
        b.onclick = () => selectAdvancedClass(key);
        advancedButtons.appendChild(b);
    }
    advancedModal.classList.remove('hidden');
}

function selectAdvancedClass(key) {
    const adv = advancedClasses[gameState.player.class][key];
    gameState.player.advancedClass = adv.name;
    if (adv.effect) gameState.player.advancedEffect = adv.effect;
    const prev = {
        atk: gameState.player.attack,
        def: gameState.player.defense,
        hp: gameState.player.maxHealth,
        crit: gameState.player.critRate,
        dodge: gameState.player.dodgeRate
    };
    if (adv.attack) gameState.player.attack += adv.attack;
    if (adv.defense) gameState.player.defense += adv.defense;
    if (adv.maxHealth) {
        gameState.player.maxHealth += adv.maxHealth;
        gameState.player.health += adv.maxHealth;
    }
    if (adv.critRate) gameState.player.critRate += adv.critRate;
    if (adv.dodgeRate) gameState.player.dodgeRate += adv.dodgeRate;
    advancedModal.classList.add('hidden');
    const changes = [];
    if (adv.attack) changes.push(`ATK ${prev.atk}→${gameState.player.attack}`);
    if (adv.defense) changes.push(`DEF ${prev.def}→${gameState.player.defense}`);
    if (adv.maxHealth) changes.push(`PV ${prev.hp}→${gameState.player.maxHealth}`);
    if (adv.critRate) changes.push(`Crit ${Math.round(prev.crit*100)}%→${Math.round(gameState.player.critRate*100)}%`);
    if (adv.dodgeRate) changes.push(`Esq ${Math.round(prev.dodge*100)}%→${Math.round(gameState.player.dodgeRate*100)}%`);
    addBattleMessage(`Évolution en ${adv.name} ! ${changes.join(', ')}`, 'system');
    updateHealthBars();
    saveGame();
}

function selectJob(jobName) {
    const job = jobs[jobName];
    gameState.player.job = job.name;
    if (job.bonus.attack) gameState.player.attack += job.bonus.attack;
    if (job.bonus.maxHealth) {
        gameState.player.maxHealth += job.bonus.maxHealth;
        gameState.player.health += job.bonus.maxHealth;
    }
    jobModal.classList.add('hidden');
    addBattleMessage(`Vous êtes maintenant ${job.name}.`, 'system');
    updateHealthBars();
    saveGame();
}

function showTalentOptions() {
    const tSet = talents[gameState.player.class];
    talentButtons.innerHTML = '';
    for (const key in tSet) {
        const t = tSet[key];
        const b = document.createElement('button');
        b.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800';
        b.textContent = `${t.name} (${t.description})`;
        b.onclick = () => chooseTalent(key);
        talentButtons.appendChild(b);
    }
    talentModal.classList.remove('hidden');
}

function chooseTalent(key) {
    const talent = talents[gameState.player.class][key];
    gameState.player.talents.push(talent.name);
    if (talent.bonus.attack) gameState.player.attack += talent.bonus.attack;
    if (talent.bonus.defense) gameState.player.defense += talent.bonus.defense;
    if (talent.bonus.maxHealth) {
        gameState.player.maxHealth += talent.bonus.maxHealth;
        gameState.player.health += talent.bonus.maxHealth;
    }
    if (talent.bonus.maxResource) {
        gameState.player.maxResource += talent.bonus.maxResource;
        gameState.player.resource += talent.bonus.maxResource;
    }
    if (talent.bonus.critRate) gameState.player.critRate += talent.bonus.critRate;
    if (talent.bonus.dodgeRate) gameState.player.dodgeRate += talent.bonus.dodgeRate;
    if (talent.bonus.specialCostReduction) {
        if (!gameState.player.specialCostReduction) gameState.player.specialCostReduction = 0;
        gameState.player.specialCostReduction += talent.bonus.specialCostReduction;
    }
    talentModal.classList.add('hidden');
    addBattleMessage(`Nouveau talent : ${talent.name} - ${talent.description}`, 'system');
    updateHealthBars();
    saveGame();
}

function showScenario(step) {
    let sc = scenarios[step];
    if (step === 0 && Math.random() < 0.3) {
        sc = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    }
    // If there is no scenario for this step, simply continue the game by
    // spawning a new enemy. This prevents the game from freezing when the
    // scenario chain ends.
    if (!sc) {
        spawnNewEnemy();
        return;
    }
    scenarioText.textContent = sc.text;
    if (typeof updateRoadBonus === 'function') updateRoadBonus();
    scenarioButtons.innerHTML = '';
    sc.choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800';
        if (c.action === 'road' || c.action === 'road-return') {
            btn.textContent = `${c.text} (+${gameState.roadStreak + 1} ATK)`;
        } else {
            btn.textContent = c.text;
        }
        btn.onclick = () => {
            scenarioModal.classList.add('hidden');
            handleScenarioAction(c.action);
            gameState.scenarioStep = c.next;
            saveGame();
        };
        scenarioButtons.appendChild(btn);
    });
    scenarioModal.classList.remove('hidden');
}

function handleScenarioAction(action) {
    if (action === 'road' || action === 'road-return') {
        gameState.roadStreak++;
        if (gameState.player) gameState.player.roadBonus = gameState.roadStreak;
    } else {
        gameState.roadStreak = 0;
        if (gameState.player) gameState.player.roadBonus = 0;
    }
    if (typeof updateRoadBonus === 'function') updateRoadBonus();
    if (action === 'forge') {
        if (!gameState.activeQuests.includes('forge') && !gameState.completedQuests.includes('forge')) {
            startQuest('forge');
        }
        showForge();
        return;
    } else if (action === 'shop') {
        showShop();
        return;
    } else if (action === 'craft') {
        showCraft();
        return;
    } else if (action.startsWith('dialogue-')) {
        const id = action.split('-')[1];
        startDialogue(id);
        return;
    } else if (action === 'rest') {
        const price = 10;
        if (gameState.gold < price) {
            addBattleMessage("Vous n'avez pas assez d'or pour vous reposer.", 'system');
        } else {
            gameState.gold -= price;
            const heal = Math.floor(gameState.player.maxHealth / 2);
            gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
            addBattleMessage(`Vous payez ${price} or pour vous reposer et récupérez ${heal} PV.`, 'system');
        }
        spawnNewEnemy();
    } else if (action === 'find-gold') {
        const gain = 10 + Math.floor(Math.random() * 11);
        gameState.gold += gain;
        addBattleMessage(`Vous trouvez ${gain} pièces d'or dans le coffre.`, 'system');
        spawnNewEnemy();
    } else if (action === 'road') {
        if (gameState.activeQuests.includes('courrier')) {
            showScenario(1);
            return;
        } else if (gameState.activeQuests.includes('herbes') && (gameState.inventory.herb || 0) >= 3) {
            showScenario(2);
            return;
        } else if (gameState.activeQuests.includes('artefact') && gameState.questProgress['artefact'] === 0) {
            showScenario(3);
            return;
        } else if (gameState.activeQuests.includes('artefact') && gameState.questProgress['artefact'] === 2 && (gameState.inventory.orbeAncien || 0) > 0) {
            showScenario(4);
            return;
        }
        spawnNewEnemy();
    } else if (action === 'deliver-letter') {
        completeQuest('courrier');
        startQuest('herbes');
        spawnNewEnemy();
    } else if (action === 'give-herbs') {
        if ((gameState.inventory.herb || 0) >= 3) {
            gameState.inventory.herb -= 3;
            completeQuest('herbes');
            renderInventory();
        } else {
            addBattleMessage("Il vous manque des herbes.", 'system');
        }
        spawnNewEnemy();
    } else if (action === 'give-orb') {
        if ((gameState.inventory.orbeAncien || 0) > 0) {
            gameState.inventory.orbeAncien--;
            completeQuest('artefact');
            renderInventory();
        }
        spawnNewEnemy();
    } else if (action === 'keep-orb') {
        completeQuest('artefact');
        spawnNewEnemy();
    } else if (action === 'road-return') {
        spawnNewEnemy();
    } else {
        spawnNewEnemy();
    }
    updateHealthBars();
    saveGame();
}

function showShop() {
    if (shopMessage) shopMessage.textContent = '';
    shopModal.classList.remove('hidden');
    updateHealthBars();
}

function closeShop() {
    shopModal.classList.add('hidden');
    spawnNewEnemy();
    updateHealthBars();
    saveGame();
}

function buyItem(item) {
    const prices = { potion: 20, megaPotion: 50, resPotion: 30 };
    const names = {
        potion: 'une potion',
        megaPotion: 'une méga potion',
        resPotion: 'une potion de ressource'
    };
    const price = prices[item];
    let message;
    if (gameState.gold >= price) {
        gameState.gold -= price;
        if (!gameState.inventory[item]) gameState.inventory[item] = 0;
        gameState.inventory[item]++;
        message = `Vous achetez ${names[item]} pour ${price} or.`;
    } else {
        message = "Vous n'avez pas assez d'or.";
    }
    if (shopMessage) shopMessage.textContent = message;
    addBattleMessage(message, 'system');
    renderInventory();
    updateHealthBars();
    saveGame();
}

function showForge() {
    if (forgeMessage) forgeMessage.textContent = '';
    forgeModal.classList.remove('hidden');
    updateHealthBars();
}

function closeForge() {
    forgeModal.classList.add('hidden');
    spawnNewEnemy();
    updateHealthBars();
    saveGame();
}

function showCraft() {
    if (craftMessage) craftMessage.textContent = '';
    renderCraftOptions();
    craftModal.classList.remove('hidden');
    updateHealthBars();
}

function closeCraft() {
    craftModal.classList.add('hidden');
    spawnNewEnemy();
    updateHealthBars();
    saveGame();
}

function renderCraftOptions() {
    if (!craftButtons) return;
    craftButtons.innerHTML = '';
    const itemIcons = { potion:'fa-flask', firePotion:'fa-fire', megaPotion:'fa-flask-vial', bomb:'fa-bomb', elixir:'fa-star' };
    const slotIcons = { head: 'fa-helmet-safety', shoulders: 'fa-shirt', legs: 'fa-socks', gloves: 'fa-hand-back-fist' };
    Object.entries(craftRecipes).forEach(([key, r]) => {
        const b = document.createElement('button');
        b.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800 text-left';
        const list = Object.entries(r.ingredients)
            .map(([ing, qty]) => {
                const have = gameState.inventory[ing] || 0;
                const color = have >= qty ? 'text-green-300' : 'text-red-300';
                return `<span class="${color}">${ingredientsData[ing].name} ${have}/${qty}</span>`;
            })
            .join(', ');
        let bonusText = '';
        if (allEquipment[r.result]) {
            bonusText = `<div class="text-xs text-blue-200">${formatBonus(allEquipment[r.result].bonus)}</div>`;
        } else if (craftResultInfo[r.result]) {
            bonusText = `<div class="text-xs text-blue-200">${craftResultInfo[r.result]}</div>`;
        }
        let icon = '';
        if (allEquipment[r.result]) {
            icon = `<i class="fas ${slotIcons[allEquipment[r.result].slot]} mr-1"></i>`;
        } else if (itemIcons[r.result]) {
            icon = `<i class="fas ${itemIcons[r.result]} mr-1"></i>`;
        }
        b.innerHTML = `<div>${icon}${r.name}</div>${bonusText}<div class="text-xs">${list}</div>`;
        b.onclick = () => craftItem(key);
        craftButtons.appendChild(b);
    });
}

function craftItem(key) {
    if (Date.now() < (gameState.nextCraftTime || 0)) {
        const msg = "L'atelier doit refroidir.";
        if (craftMessage) {
            craftMessage.classList.remove('text-green-400');
            craftMessage.classList.add('text-red-400');
            craftMessage.textContent = msg;
        }
        addBattleMessage(msg, 'system');
        return;
    }
    const recipe = craftRecipes[key];
    let can = true;
    Object.entries(recipe.ingredients).forEach(([ing, qty]) => {
        if ((gameState.inventory[ing] || 0) < qty) can = false;
    });
    let msg;
    if (!can) {
        msg = "Ingrédients insuffisants.";
        if (craftMessage) {
            craftMessage.classList.remove('text-green-400');
            craftMessage.classList.add('text-red-400');
        }
    } else {
        Object.entries(recipe.ingredients).forEach(([ing, qty]) => {
            gameState.inventory[ing] -= qty;
        });
        if (!gameState.inventory[recipe.result]) gameState.inventory[recipe.result] = 0;
        gameState.inventory[recipe.result]++;
        msg = `Vous créez ${recipe.name}!`;
        if (craftMessage) {
            craftMessage.classList.remove('text-red-400');
            craftMessage.classList.add('text-green-400');
        }
    }
    if (craftMessage) craftMessage.textContent = msg;
    addBattleMessage(msg, 'system');
    renderInventory();
    if (typeof renderCraftOptions === 'function') renderCraftOptions();
    gameState.nextCraftTime = Date.now() + CRAFT_COOLDOWN_MS;
    saveGame();
}

let forgeGame = null;

function buyForge(type) {
    const price = 50;
    if (gameState.gold < price) {
        const msg = "Pas assez d'or pour la forge.";
        if (forgeMessage) forgeMessage.textContent = msg;
        addBattleMessage(msg, 'system');
        updateHealthBars();
        saveGame();
        return;
    }
    gameState.gold -= price;
    startForgeGame(type);
}

function startForgeGame(type) {
    if (!forgeCanvas) {
        applyForgeResult(type, false);
        return;
    }
    forgeCanvas.classList.remove('hidden');
    const ctx = forgeCanvas.getContext('2d');
    const w = forgeCanvas.width;
    const h = forgeCanvas.height;
    const barStart = 10;
    const barWidth = w - 20;
    const zoneStart = Math.floor(barWidth * 0.45);
    const zoneEnd = Math.floor(barWidth * 0.55);
    forgeGame = { type, pos: 0, dir: 2, zoneStart, zoneEnd, timer: null };

    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#555';
        ctx.fillRect(barStart, h / 2 - 5, barWidth, 10);
        ctx.fillStyle = '#0a0';
        ctx.fillRect(barStart + zoneStart, h / 2 - 5, zoneEnd - zoneStart, 10);
        ctx.fillStyle = '#fff';
        ctx.fillRect(barStart + forgeGame.pos - 2, h / 2 - 8, 4, 16);
    }

    function update() {
        forgeGame.pos += forgeGame.dir;
        if (forgeGame.pos > barWidth || forgeGame.pos < 0) {
            forgeGame.dir *= -1;
            forgeGame.pos += forgeGame.dir;
        }
        draw();
    }

    forgeGame.timer = setInterval(update, 16);

    forgeCanvas.onclick = () => {
        clearInterval(forgeGame.timer);
        forgeCanvas.onclick = null;
        forgeCanvas.classList.add('hidden');
        const perfect = forgeGame.pos >= zoneStart && forgeGame.pos <= zoneEnd;
        applyForgeResult(forgeGame.type, perfect);
        forgeGame = null;
    };
}

function applyForgeResult(type, perfect) {
    let msg;
    if (type === 'weapon') {
        let bonus = 3;
        if (perfect) bonus += 1;
        gameState.player.attack += bonus;
        msg = perfect ? 'Forge parfaite ! ATK +' + bonus : 'Votre arme est améliorée (+3 attaque).';
    } else if (type === 'armor') {
        gameState.player.defense += 3;
        msg = 'Vous achetez une armure (+3 défense).';
    } else if (type === 'crit') {
        gameState.player.critRate += 0.05;
        msg = 'Des runes augmentent vos chances de critique (+5%).';
    } else {
        gameState.player.dodgeRate += 0.05;
        msg = 'Votre équipement est équilibré (+5% esquive).';
    }
    if (forgeMessage) forgeMessage.textContent = msg;
    addBattleMessage(msg, 'system');
    if (gameState.activeQuests.includes('forge')) {
        completeQuest('forge');
    }
    updateHealthBars();
    saveGame();
}

function renderInventory() {
    inventoryContainer.innerHTML = '';
    const equipDisplay = document.getElementById('equipment-display');
    if (equipDisplay) equipDisplay.innerHTML = '';
    const items = {
        potion: { name: 'Potion de soin', icon: 'fa-flask' },
        firePotion: { name: 'Potion de feu', icon: 'fa-fire' },
        shield: { name: 'Bouclier', icon: 'fa-shield-alt' },
        herb: { name: 'Herbe curative', icon: 'fa-leaf' },
        resPotion: { name: 'Potion de ressource', icon: 'fa-bolt' },
        megaPotion: { name: 'Méga potion', icon: 'fa-flask-vial' },
        bomb: { name: 'Bombe', icon: 'fa-bomb' },
        elixir: { name: 'Élixir ultime', icon: 'fa-star' }
    };
    Object.entries(ingredientsData).forEach(([k,v]) => {
        items[k] = { name: v.name, icon: v.icon };
    });
    const slotIcons = { head: 'fa-helmet-safety', shoulders: 'fa-shirt', legs: 'fa-socks', gloves: 'fa-hand-back-fist' };
    Object.values(allEquipment).forEach(eq => {
        items[eq.key] = { name: eq.name, icon: slotIcons[eq.slot], bonus: eq.bonus };
    });
    const usable = ['potion','firePotion','shield','herb','resPotion','megaPotion','bomb','elixir'];
    if (!gameState.inventory) {
        gameState.inventory = {};
    }
    // Affichage de l'équipement porté
    if (equipDisplay && gameState.player && gameState.player.equipment) {
        ['head','shoulders','legs','gloves'].forEach(slot => {
            const key = gameState.player.equipment[slot];
            const div = document.createElement('div');
            div.className = 'bg-gray-800/50 rounded-lg p-3 flex items-center';
            if (key) {
                div.innerHTML = `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mr-3"><i class="fas ${slotIcons[slot]} text-white"></i></div><div><div class="font-medium">${items[key].name}</div><div class="text-xs text-blue-200">${formatBonus(allEquipment[key].bonus)}</div></div>`;
            } else {
                div.innerHTML = `<div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3"><i class="fas ${slotIcons[slot]} text-white"></i></div><div><div class="font-medium">Aucun</div></div>`;
            }
            equipDisplay.appendChild(div);
        });
    }
    Object.keys(gameState.inventory).forEach(key => {
        const count = gameState.inventory[key];
        if (count <= 0) return;
        const div = document.createElement('div');
        const consumable = usable.includes(key);
        const equipmentItem = allEquipment[key];
        let classes = 'bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/50';
        if (consumable) {
            classes = 'bg-green-900/30 border-green-800/50 hover:bg-green-800/50 cursor-pointer';
        } else if (equipmentItem) {
            classes += ' cursor-pointer';
        }
        div.className = `${classes} rounded-lg p-3 flex items-center transition`;
        let bonusText = '';
        if (equipmentItem) bonusText = `<div class="text-xs text-blue-200">${formatBonus(equipmentItem.bonus)}</div>`;
        div.innerHTML = `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mr-3"><i class="fas ${items[key].icon} text-white"></i></div><div><div class="font-medium">${items[key].name}</div>${bonusText}<div class="text-xs text-blue-200">x${count}</div></div>`;
        if (consumable) {
            div.onclick = () => useItem(key);
        } else if (equipmentItem) {
            div.onclick = () => equipItem(key);
        }
        inventoryContainer.appendChild(div);
    });
}

function renderQuests() {
    if (!activeQuestList || !completedQuestList) return;
    activeQuestList.innerHTML = '';
    completedQuestList.innerHTML = '';

    if (gameState.activeQuests.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aucune quête en cours';
        li.className = 'text-gray-400';
        activeQuestList.appendChild(li);
    } else {
        gameState.activeQuests.forEach(id => {
            const li = document.createElement('li');
            li.textContent = `${quests[id].name} - ${quests[id].description} (\u00a0${quests[id].reward} or)`;
            li.className = 'cursor-pointer hover:text-blue-300';
            li.onclick = () => showQuestDetail(id);
            activeQuestList.appendChild(li);
        });
    }

    if (gameState.completedQuests.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aucune quête terminée';
        li.className = 'text-gray-400';
        completedQuestList.appendChild(li);
    } else {
        gameState.completedQuests.forEach(id => {
            const li = document.createElement('li');
            li.textContent = quests[id].name;
            li.className = 'cursor-pointer hover:text-blue-300';
            li.onclick = () => showQuestDetail(id);
            completedQuestList.appendChild(li);
        });
    }
}

function renderBestiary() {
    if (!bestiaryList) return;
    bestiaryList.innerHTML = '';
    const names = Object.keys(gameState.bestiary);
    if (names.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aucune entrée';
        li.className = 'text-gray-400';
        bestiaryList.appendChild(li);
        return;
    }
    names.forEach(name => {
        const info = gameState.bestiary[name];
        const li = document.createElement('li');
        li.textContent = `${name} (Niv. ${info.level}) ATK ${info.attackRange[0]}-${info.attackRange[1]} DEF ${info.defense}`;
        bestiaryList.appendChild(li);
    });
}

function renderAlbum() {
    if (!cardGauge) return;
    const owned = gameState.cards ? Object.keys(gameState.cards).length : 0;
    const percent = Math.floor((owned / cardsList.length) * 100);
    cardGauge.textContent = percent + '%';
    if (cardCollection) {
        cardCollection.innerHTML = '';
        cardsList.forEach(c => {
            const div = document.createElement('div');
            div.textContent = c;
            div.className = gameState.cards && gameState.cards[c] ? 'text-yellow-300' : 'text-gray-600';
            cardCollection.appendChild(div);
        });
    }
}

function updateQuestPanel() {
    renderQuests();
    renderBestiary();
}

function useItem(item) {
    if (!gameState.inventory[item]) return;
    if (item === 'potion') {
        const heal = 20;
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
        addBattleMessage(`Utilise une potion et récupère ${heal} PV.`, 'heal');
    } else if (item === 'firePotion') {
        const dmg = 20;
        gameState.enemy.health -= dmg;
        gameState.enemy.statusEffects.push({ name: 'brulure', duration: 3, value: 5 });
        addBattleMessage(`Lance une potion de feu et inflige ${dmg} dégâts!`, 'player');
    } else if (item === 'shield') {
        gameState.player.defense += 2;
        addBattleMessage('Vous équipez un bouclier, défense +2.', 'system');
    } else if (item === 'herb') {
        const heal = 5;
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
        gameState.player.statusEffects = [];
        addBattleMessage(`Utilise une herbe curative pour ${heal} PV.`, 'heal');
    } else if (item === 'resPotion') {
        const restore = 30;
        gameState.player.resource = Math.min(gameState.player.maxResource, gameState.player.resource + restore);
        addBattleMessage(`Récupère ${restore} ${gameState.player.resourceType}.`, 'system');
    } else if (item === 'megaPotion') {
        const heal = 50;
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
        addBattleMessage(`La méga potion rend ${heal} PV!`, 'heal');
    } else if (item === 'bomb') {
        const dmg = 35;
        gameState.enemy.health -= dmg;
        addBattleMessage(`La bombe explose et inflige ${dmg} dégâts!`, 'player');
    } else if (item === 'elixir') {
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.resource = gameState.player.maxResource;
        addBattleMessage("L'élixir restaure entièrement vos forces!", 'heal');
    }
    gameState.inventory[item]--;
    renderInventory();
    if (typeof renderCraftOptions === 'function') renderCraftOptions();
    updateHealthBars();
    saveGame();
}

function equipItem(key) {
    const eq = allEquipment[key];
    if (!eq) return;
    if (eq.class && eq.class !== gameState.player.class) {
        addBattleMessage("Cet équipement ne convient pas à votre classe.", 'system');
        return;
    }
    const slot = eq.slot;
    const currentKey = gameState.player.equipment[slot];
    const preview = formatBonus(eq.bonus);
    const currentName = currentKey ? allEquipment[currentKey].name : null;
    let msg = `Équiper ${eq.name}`;
    if (preview) msg += ` (${preview})`;
    if (currentName) msg += ` à la place de ${currentName}`;
    if (!confirm(msg + ' ?')) return;
    if (currentKey) {
        const curEq = allEquipment[currentKey];
        Object.entries(curEq.bonus).forEach(([stat,val]) => {
            gameState.player[stat] -= val;
        });
        gameState.inventory[currentKey] = (gameState.inventory[currentKey] || 0) + 1;
    }
    Object.entries(eq.bonus).forEach(([stat,val]) => {
        if (gameState.player[stat] === undefined) gameState.player[stat] = 0;
        gameState.player[stat] += val;
    });
    gameState.player.equipment[slot] = key;
    gameState.inventory[key]--;
    renderInventory();
    updateHealthBars();
    saveGame();
}

// Player actions
function playerAttack() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();

    const damage = gameState.player.attackTarget(gameState.enemy);

    // Animation
    enemyCharacter.classList.add('damage-animation');
    setTimeout(() => {
        enemyCharacter.classList.remove('damage-animation');
    }, 300);
    
    addBattleMessage(`Inflige ${damage} points de dégâts avec une attaque!`, 'player');
    
    if (gameState.enemy.health <= 0) {
        gameState.enemy.health = 0;
        addBattleMessage(`${gameState.enemy.name} a été vaincu!`, 'system');
        setTimeout(enemyDefeated, 1000);
    }
    
    updateHealthBars();
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

function playerAbility() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();

    const result = gameState.player.useAbility();
    if (!result) {
        addBattleMessage(`Pas assez de ${gameState.player.resourceType}...`, 'system');
        return;
    }

    const messages = {
        shield: 'Bouclier levé! Dégâts réduits au prochain coup.',
        dodge: 'En garde! Vous esquiverez la prochaine attaque.',
        heal: 'Vous récupérez quelques points de vie!'
    };

    playerCharacter.classList.add('heal-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('heal-animation');
    }, 1000);

    addBattleMessage(messages[result], 'player');
    updateHealthBars();
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

function playerDefend() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();

    addBattleMessage(`Se met en position défensive. La prochaine attaque sera réduite.`, 'player');
    gameState.player.defend();
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

function playerFlee() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();
    const result = gameState.player.tryFlee(gameState.enemy);
    if (result) {
        addBattleMessage('Vous prenez la fuite!', 'player');
        spawnNewEnemy();
    } else {
        addBattleMessage("La fuite échoue!", 'system');
        updateHealthBars();
        gameState.isPlayerTurn = false;
        setTimeout(enemyTurn, 500);
    }
}

function getSpecialRestriction(player) {
    if (player.specialCooldown > 0) {
        return 'Compétence spéciale en récupération.';
    }
    if (player.advancedClass === 'Berserker' && player.health > player.maxHealth * 0.3) {
        return 'Le berserker doit être blessé pour utiliser cette compétence.';
    }
    const baseCosts = { mana: 30, energie: 20, rage: 50 };
    let cost = baseCosts[player.resourceType] + player.specialUses * 5 - (player.specialCostReduction || 0);
    if (cost < 0) cost = 0;
    if (player.class === 'guerrier') {
        if (player.resource <= 0) return 'Pas assez de rage.';
    } else {
        if (player.resource < cost) return `Pas assez de ${player.resourceType}.`;
    }
    return null;
}

function playerSpecial() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();

    const reason = getSpecialRestriction(gameState.player);
    if (reason) {
        addBattleMessage(reason, 'system');
        return;
    }

    const damage = gameState.player.special(gameState.enemy);
    
    // Animation
    enemyCharacter.classList.add('damage-animation');
    playerCharacter.style.animation = 'none';
    setTimeout(() => {
        playerCharacter.style.animation = 'float 3s ease-in-out infinite';
    }, 10);
    
    addBattleMessage(`Lance un sort puissant pour ${damage} points de dégâts!`, 'player');
    
    if (gameState.enemy.health <= 0) {
        gameState.enemy.health = 0;
        addBattleMessage(`${gameState.enemy.name} a été vaincu!`, 'system');
        setTimeout(enemyDefeated, 1000);
    }
    
    updateHealthBars();
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

function playerFinisher() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();
    const damage = gameState.player.finisher(gameState.enemy);
    if (!damage) {
        addBattleMessage('Pas assez de points de combo.', 'system');
        return;
    }

    enemyCharacter.classList.add('damage-animation');
    setTimeout(() => {
        enemyCharacter.classList.remove('damage-animation');
    }, 300);

    addBattleMessage(`Finisher inflige ${damage} dégâts!`, 'player');
    if (gameState.enemy.health <= 0) {
        gameState.enemy.health = 0;
        addBattleMessage(`${gameState.enemy.name} a été vaincu!`, 'system');
        setTimeout(enemyDefeated, 1000);
    }
    updateHealthBars();
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

// Enemy turn
function enemyTurn() {
    if (gameState.enemy.health <= 0) return;
    processStatusEffects();

    const damage = gameState.enemy.attack(gameState.player);

    // Animation
    playerCharacter.classList.add('damage-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('damage-animation');
    }, 300);
    
    addBattleMessage(`${gameState.enemy.name} utilise ${gameState.enemy.nextAttack} et inflige ${damage} points de dégâts!`, 'enemy');
    if (gameState.enemy.appliedEffectLog) {
        addBattleMessage(gameState.enemy.appliedEffectLog, 'system');
    }

    if (gameState.player.health <= 0) {
        gameState.player.health = 0;
        addBattleMessage(`${gameState.player.name} a été vaincu!`, 'system');
        gameOver();
    }

    updateHealthBars();
    gameState.isPlayerTurn = true;
}

function gameOver() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });
    playerCharacter.classList.add('death-animation');
    stopAmbientMusic();
    addBattleMessage('Fin de la partie. Rechargez la page pour recommencer.', 'system');
    saveGame();
}

// Enemy defeated
function enemyDefeated() {
    const xpGained = 15 + Math.floor(Math.random() * 10);
    const xpFinal = Math.floor(xpGained * getXpMultiplier());
    const prevStats = {
        hp: gameState.player.maxHealth,
        atk: gameState.player.attack,
        def: gameState.player.defense
    };
    const levels = gameState.player.gainXp(xpGained, getXpMultiplier());

    addBattleMessage(`Gagne ${xpFinal} points d'expérience!`, 'system');

    if (levels > 0) {
        const hpDiff = gameState.player.maxHealth - prevStats.hp;
        const atkDiff = gameState.player.attack - prevStats.atk;
        const defDiff = gameState.player.defense - prevStats.def;
        const parts = [];
        if (hpDiff) parts.push(`+${hpDiff} PV`);
        if (atkDiff) parts.push(`+${atkDiff} ATK`);
        if (defDiff) parts.push(`+${defDiff} DEF`);
        addBattleMessage(`Niveau augmenté à ${gameState.player.level}! ${parts.join(', ')}`, 'system');
        if (!gameState.player.advancedClass && gameState.player.level >= 3) {
            showAdvancedOptions();
        } else {
            showTalentOptions();
        }
    }

    const goldEarned = 10 + Math.floor(Math.random() * 6);
    gameState.gold += goldEarned;
    addBattleMessage(`Vous récupérez ${goldEarned} or.`, 'system');

    const ingredientsLooted = generateIngredientLoot(gameState.enemy.level);
    ingredientsLooted.forEach(key => {
        if (!gameState.inventory[key]) gameState.inventory[key] = 0;
        gameState.inventory[key]++;
        addBattleMessage(`Vous obtenez ${ingredientsData[key].name}.`, 'system');
    });
    if (gameState.enemy.elite) {
        const rare = Object.keys(ingredientsData).filter(k => ['rare','epique'].includes(ingredientsData[k].rarity));
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const key = rare[Math.floor(Math.random() * rare.length)];
            if (!gameState.inventory[key]) gameState.inventory[key] = 0;
            gameState.inventory[key]++;
            addBattleMessage(`Butin élite: ${ingredientsData[key].name}.`, 'system');
        }
    }
    checkQuestLoot(ingredientsLooted);
    if (gameState.activeQuests.includes('artefact') && gameState.questProgress && gameState.questProgress['artefact'] === 1 && gameState.enemy.name === 'Gardien antique') {
        if (!gameState.inventory.orbeAncien) gameState.inventory.orbeAncien = 0;
        gameState.inventory.orbeAncien++;
        gameState.questProgress['artefact'] = 2;
        addBattleMessage("Vous récupérez l'orbe ancien.", 'system');
        renderInventory();
    }
    if (ingredientsLooted.length) renderInventory();

    // Mise à jour du bestiaire
    gameState.bestiary[gameState.enemy.name] = {
        level: gameState.enemy.level,
        attackRange: gameState.enemy.attackRange,
        defense: gameState.enemy.defense
    };
    checkQuestKill(gameState.enemy.name);

    handleCardDrop();

    renderBestiary();

    updateHealthBars();
    saveGame();

    showScenario(gameState.scenarioStep);
}

// Spawn new enemy
function spawnNewEnemy() {
    advanceTime();
    let available = enemiesList.filter(e => {
        if (e.requiredQuest) {
            const step = gameState.questProgress && gameState.questProgress[e.requiredQuest];
            if (!gameState.activeQuests.includes(e.requiredQuest) || step !== e.requiredStep) {
                return false;
            }
        }
        if (e.unlockQuest && !gameState.completedQuests.includes(e.unlockQuest)) {
            return false;
        }
        return true;
    });
    if (available.length === 0) {
        available = enemiesList.filter(e => !e.requiredQuest && !e.unlockQuest);
    }
    let weighted = [];
    available.forEach(e => {
        weighted.push(e);
        if (e.preferredTime === 'night' && gameState.timeOfDay >= 0.5) weighted.push(e);
        if (e.preferredTime === 'day' && gameState.timeOfDay < 0.5) weighted.push(e);
    });
    const base = { ...weighted[Math.floor(Math.random() * weighted.length)] };
    const levelBoost = Math.floor(Math.random() * 3);
    base.level = gameState.player.level + levelBoost;
    base.maxHealth += gameState.player.level * 5 + levelBoost * 10;
    base.maxHealth = Math.floor(base.maxHealth * DIFFICULTY_MULTIPLIER);
    base.health = base.maxHealth;
    base.attackRange = [
        Math.floor((base.attackRange[0] + levelBoost * 2) * DIFFICULTY_MULTIPLIER),
        Math.floor((base.attackRange[1] + levelBoost * 2) * DIFFICULTY_MULTIPLIER)
    ];
    base.defense += Math.floor(gameState.player.level / 2);
    if (gameState.timeOfDay >= 0.5 && base.preferredTime === 'night') {
        base.attackRange = base.attackRange.map(v => Math.floor(v * 1.1));
    }
    if (Math.random() < 0.05) {
        base.name = `Élite ${base.name}`;
        base.maxHealth = Math.floor(base.maxHealth * 1.3);
        base.health = base.maxHealth;
        base.attackRange = base.attackRange.map(v => Math.floor(v * 1.3));
        base.elite = true;
    }
    base.statusEffects = [];
    gameState.enemy = new Enemy(base);
    if (enemyImage) enemyImage.src = base.img || '';
    if (locationImage) {
        let locObj;
        if (base.location) {
            locationImage.src = base.location;
            locObj = locations.find(l => l.img === base.location);
        } else {
            locObj = locations[Math.floor(Math.random() * locations.length)];
            locationImage.src = locObj.img;
        }
        if (locationName && locObj) locationName.textContent = locObj.name;
        if (gameState.activeQuests.includes('explorationDesert') && locObj && locObj.name.includes('Désert')) {
            completeQuest('explorationDesert');
        }
    }
    gameState.isPlayerTurn = true;

    addBattleMessage(`Un ${gameState.enemy.name} apparaît!`, 'system');
    updateHealthBars();
    updateQuestPanel();
    saveGame();
}

function startQuest(id) {
    if (!gameState.activeQuests.includes(id)) {
        gameState.activeQuests.push(id);
        addBattleMessage(`Nouvelle quête : ${quests[id].name} (Récompense: ${quests[id].reward} or)`, 'system');
        if (!gameState.questProgress) gameState.questProgress = {};
        gameState.questProgress[id] = 0;
    }
    updateQuestPanel();
    saveGame();
}

function completeQuest(id) {
    const idx = gameState.activeQuests.indexOf(id);
    if (idx !== -1) {
        gameState.activeQuests.splice(idx, 1);
        gameState.completedQuests.push(id);
        gameState.gold += quests[id].reward;
        addBattleMessage(`Quête terminée : ${quests[id].name} (+${quests[id].reward} or)`, 'system');
        if (gameState.questProgress) delete gameState.questProgress[id];
        updateHealthBars();
        updateQuestPanel();
        saveGame();
    }
}

function checkQuestKill(name) {
    if (gameState.activeQuests.includes('chasseLoups') && name === 'Loup des Ombres') {
        gameState.questProgress.chasseLoups++;
        if (gameState.questProgress.chasseLoups >= 3) completeQuest('chasseLoups');
    }
    if (gameState.activeQuests.includes('chasseSpectres') && name === 'Spectre Glacial') {
        gameState.questProgress.chasseSpectres++;
        if (gameState.questProgress.chasseSpectres >= 2) completeQuest('chasseSpectres');
    }
    if (gameState.activeQuests.includes('escorteCaravane') && name === 'Serpent des Sables') {
        completeQuest('escorteCaravane');
    }
    if (gameState.activeQuests.includes('gardeRoute')) {
        gameState.questProgress.gardeRoute++;
        if (gameState.questProgress.gardeRoute >= 5) completeQuest('gardeRoute');
    }
    if (gameState.activeQuests.includes('chasseOmbre') && name === 'Ombre Silencieuse') {
        completeQuest('chasseOmbre');
    }
    if (gameState.activeQuests.includes('bestiaryEtude')) {
        const discovered = Object.keys(gameState.bestiary).length;
        if (discovered >= 5) completeQuest('bestiaryEtude');
    }
}

function checkQuestLoot(itemsLooted) {
    if (gameState.activeQuests.includes('mineraiRare')) {
        itemsLooted.forEach(i => {
            if (i === 'lingotFer') {
                gameState.questProgress.mineraiRare++;
            }
        });
        if (gameState.questProgress.mineraiRare >= 3) completeQuest('mineraiRare');
    }
    if (gameState.activeQuests.includes('recolteHerbes')) {
        itemsLooted.forEach(i => {
            if (i === 'herbeSauvage') {
                gameState.questProgress.recolteHerbes++;
            }
        });
        if (gameState.questProgress.recolteHerbes >= 5) completeQuest('recolteHerbes');
    }
    if (gameState.activeQuests.includes('collectionGriffes')) {
        itemsLooted.forEach(i => {
            if (i === 'griffeLoup') {
                gameState.questProgress.collectionGriffes++;
            }
        });
        if (gameState.questProgress.collectionGriffes >= 4) completeQuest('collectionGriffes');
    }
}

function startDialogue(id, step = 0) {
    const dlg = dialogues[id];
    if (dlg) {
        while (dlg[step] && dlg[step].quest && dlg[step].questStep === undefined && gameState.activeQuests.includes(dlg[step].quest)) {
            step++;
        }
        while (dlg[step] && dlg[step].questStep !== undefined && gameState.questProgress[dlg[step].quest] !== dlg[step].questStep) {
            step++;
        }
    }
    gameState.currentDialogue = { id, step };
    showDialogueStep();
}

function showDialogueStep() {
    const d = dialogues[gameState.currentDialogue.id][gameState.currentDialogue.step];
    dialogueText.textContent = d.text;
    // L'historique du dialogue sera ajouté lors du clic sur la réponse
    dialogueButtons.innerHTML = '';
    d.choices.forEach(c => {
        const b = document.createElement('button');
        b.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800';
        b.textContent = c.text;
        b.onclick = () => {
            const questId = c.quest || d.quest;
            if (questId) {
                startQuest(questId);
                gameState.dialogueHistory.push({ quest: questId, text: d.text });
                if (d.questStep !== undefined) {
                    if (!gameState.questProgress) gameState.questProgress = {};
                    gameState.questProgress[questId] = d.questStep;
                }
            }
            if (c.end) {
                dialogueModal.classList.add('hidden');
                spawnNewEnemy();
            } else {
                gameState.currentDialogue.step = c.next;
                showDialogueStep();
            }
        };
        dialogueButtons.appendChild(b);
    });
    dialogueModal.classList.remove('hidden');
}

function showQuestDetail(id) {
    const q = quests[id];
    if (!q) return;
    questDetailName.textContent = q.name;
    questDetailDesc.textContent = q.description + ` (Récompense: ${q.reward} or)`;
    questDetailSteps.innerHTML = '';
    q.steps.forEach((s, idx) => {
        const li = document.createElement('li');
        const done = (gameState.completedQuests.includes(id)) || (gameState.questProgress[id] || 0) > idx;
        li.textContent = s;
        if (done) li.className = 'text-green-300';
        questDetailSteps.appendChild(li);
    });
    questDetailNpc.textContent = `PNJ: ${q.npc}`;
    questDetailDialogues.innerHTML = '';
    gameState.dialogueHistory.filter(d => d.quest === id).forEach(d => {
        const div = document.createElement('div');
        div.textContent = d.text;
        questDetailDialogues.appendChild(div);
    });
    questDetailModal.classList.remove('hidden');
}

function closeQuestDetail() {
    questDetailModal.classList.add('hidden');
}

function prestigeReset() {
    gameState.prestigeLevel++;
    gameState.astres++;
    if (gameState.player) {
        gameState.player.level = 1;
        gameState.player.xp = 0;
        gameState.player.nextLevelXp = 100;
        gameState.player.health = gameState.player.maxHealth;
    }
    addBattleMessage('Vous repartez plus expérimenté.', 'system');
    updateHealthBars();
    saveGame();
}

function startGame() {
    if (introModal) introModal.classList.add('hidden');
    if (classModal) classModal.classList.remove('hidden');
}

// Expose actions globally for HTML onclick handlers
window.playerAttack = playerAttack;
window.playerAbility = playerAbility;
window.playerDefend = playerDefend;
window.playerSpecial = playerSpecial;
window.playerFinisher = playerFinisher;
window.playerFlee = playerFlee;
window.selectClass = selectClass;
window.selectJob = selectJob;
window.chooseTalent = chooseTalent;
window.buyItem = buyItem;
window.closeShop = closeShop;
window.buyForge = buyForge;
window.closeForge = closeForge;
window.craftItem = craftItem;
window.closeCraft = closeCraft;
window.equipItem = equipItem;
window.startDialogue = startDialogue;
window.showQuestDetail = showQuestDetail;
window.closeQuestDetail = closeQuestDetail;
window.prestigeReset = prestigeReset;
window.startGame = startGame;

// Initialize game
initialize();
