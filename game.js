/* --------- Données de base --------- */
const classes = {
    guerrier: { name: 'Guerrier', maxHealth: 60, attack: 10, defense: 8, icon: 'fa-shield-halved', resource: 'rage', maxResource: 100, critRate: 0.05, dodgeRate: 0.05 },
    mage: { name: 'Mage', maxHealth: 40, attack: 14, defense: 4, icon: 'fa-hat-wizard', resource: 'mana', maxResource: 100, critRate: 0.1, dodgeRate: 0.05 },
    voleur: { name: 'Voleur', maxHealth: 45, attack: 12, defense: 6, icon: 'fa-user-ninja', resource: 'energie', maxResource: 100, critRate: 0.1, dodgeRate: 0.15 },
    rodeur: { name: 'Rôdeur', maxHealth: 50, attack: 11, defense: 7, icon: 'fa-bow-arrow', resource: 'energie', maxResource: 100, critRate: 0.1, dodgeRate: 0.1 }
};

const advancedClasses = {
    guerrier: { chevalier: { name: 'Chevalier', attack: 2, defense: 2 } },
    mage: { archimage: { name: 'Archimage', attack: 3, defense: 0 } },
    voleur: { assassin: { name: 'Assassin', attack: 3, defense: 1 } },
    rodeur: { ranger: { name: 'Ranger', attack: 2, defense: 1 } }
};

const jobs = {
    forgeron: { name: 'Forgeron', bonus: { attack: 2 } },
    herboriste: { name: 'Herboriste', bonus: { maxHealth: 5 } },
    alchimiste: { name: 'Alchimiste', bonus: { attack: 1, maxHealth: 5 } }
};

const talents = {
    force: { name: 'Force accrue', bonus: { attack: 2 } },
    protection: { name: 'Protection renforcée', bonus: { defense: 2 } }
};

const enemiesList = [
    { name: "Loup des Ombres", level: 4, health: 35, maxHealth: 35, attackRange: [8,12], defense: 3, nextAttack: "Morsure" },
    { name: "Golem de Pierre", level: 5, health: 50, maxHealth: 50, attackRange: [10,15], defense: 5, nextAttack: "Coup de poing" },
    { name: "Esprit Perdu", level: 3, health: 25, maxHealth: 25, attackRange: [5,10], defense: 2, nextAttack: "Toucher spectral" },
    { name: "Ombre Silencieuse", level: 6, health: 40, maxHealth: 40, attackRange: [9,14], defense: 4, nextAttack: "Lame ténébreuse" },
    { name: "Spectre Glacial", level: 7, health: 45, maxHealth: 45, attackRange: [10,16], defense: 5, nextAttack: "Souffle glacé" },
    { name: "Serpent des Sables", level: 5, health: 30, maxHealth: 30, attackRange: [7,13], defense: 3, nextAttack: "Morsure rapide" }
];

const scenarios = [
    {
        text: 'Après ce combat, que souhaitez-vous faire ?',
        choices: [
            { text: 'Passer à la forge', action: 'forge', next: 0 },
            { text: 'Visiter le magasin', action: 'shop', next: 0 },
            { text: 'Se reposer', action: 'rest', next: 0 },
            { text: 'Continuer la route', action: 'road', next: 0 }
        ]
    }
];

/* --------- Chargement/Sauvegarde --------- */
function saveGame() {
    localStorage.setItem('luminaSave', JSON.stringify(gameState));
}

function loadGame() {
    const data = localStorage.getItem('luminaSave');
    if (!data) return null;
    const obj = JSON.parse(data);
    if (obj.player) obj.player = new Player(obj.player);
    if (obj.enemy) obj.enemy = new Enemy(obj.enemy);
    if (obj.player && !obj.player.statusEffects) obj.player.statusEffects = [];
    if (obj.enemy && !obj.enemy.statusEffects) obj.enemy.statusEffects = [];
    // Always start a new session on the player's turn to avoid being stuck
    obj.isPlayerTurn = true;
    return obj;
}

/* --------- État du jeu --------- */
let gameState = loadGame();
if (!gameState) {
    gameState = {
        player: null,
        enemy: new Enemy({
            name: 'Loup des Ombres',
            level: 1,
            health: 30,
            maxHealth: 30,
            attackRange: [5, 8],
            defense: 2,
            nextAttack: 'Morsure',
            statusEffects: []
        }),
        inventory: { potion: 3, firePotion: 2, shield: 1, herb: 5, resPotion: 2, megaPotion: 1, bomb: 1 },
        battleLog: ['[Système] Bienvenue dans Lumina. Choisissez votre classe pour commencer.'],
        isPlayerTurn: true,
        scenarioStep: 0,
        gold: 50
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
}

// DOM Elements
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const xpBar = document.getElementById('xp-bar');
const battleLog = document.getElementById('battle-log');
const playerCharacter = document.getElementById('player-character');
const playerIcon = document.getElementById('player-icon');
const enemyCharacter = document.getElementById('enemy-character');
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
const goldText = document.getElementById('gold-text');
const classModal = document.getElementById('class-modal');
const advancedModal = document.getElementById('advanced-class-modal');
const advancedButtons = document.getElementById('advanced-buttons');
const jobModal = document.getElementById('job-modal');
const talentModal = document.getElementById('talent-modal');
const scenarioModal = document.getElementById('scenario-modal');
const scenarioText = document.getElementById('scenario-text');
const scenarioButtons = document.getElementById('scenario-buttons');
const inventoryContainer = document.getElementById('inventory-items');
const shopModal = document.getElementById('shop-modal');
const forgeModal = document.getElementById('forge-modal');
const shopGoldText = document.getElementById('shop-gold-text');
const forgeGoldText = document.getElementById('forge-gold-text');
const shopMessage = document.getElementById('shop-message');
const forgeMessage = document.getElementById('forge-message');

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = type === 'heal' ? 600 : type === 'player' ? 400 : 200;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
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
    enemyHpText.textContent = `${gameState.enemy.health}/${gameState.enemy.maxHealth}`;
    playerLevelText.textContent = `Niv. ${gameState.player.level}`;
    enemyLevelText.textContent = `Niv. ${gameState.enemy.level}`;
    enemyName.textContent = gameState.enemy.name;
    playerName.textContent = gameState.player.name;
    playerAttackText.textContent = gameState.player.attack;
    playerDefenseText.textContent = gameState.player.defense;
    if (goldText) {
        goldText.textContent = gameState.gold;
    }
    if (shopGoldText) {
        shopGoldText.textContent = gameState.gold;
    }
    if (forgeGoldText) {
        forgeGoldText.textContent = gameState.gold;
    }
    if (playerIcon) {
        const classIcon = classes[gameState.player.class]?.icon || 'fa-user';
        playerIcon.className = `fas ${classIcon} text-5xl text-white`;
    }
    const icons = { mana: 'fa-droplet', energie: 'fa-bolt', rage: 'fa-fire' };
    resourceIcon.className = `fas ${icons[gameState.player.resourceType]} text-purple-400 mr-1`;
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
        classModal.classList.remove('hidden');
    } else {
        updateHealthBars();
        renderInventory();
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
        critRate: info.critRate,
        dodgeRate: info.dodgeRate,
        statusEffects: [],
        xp: 0,
        nextLevelXp: 100,
        job: null,
        talents: [],
        advancedClass: null
    });
    classModal.classList.add('hidden');
    addBattleMessage(`Vous avez choisi la classe ${info.name}.`, 'system');
    updateHealthBars();
    renderInventory();
    saveGame();
}

function showAdvancedOptions() {
    const adv = advancedClasses[gameState.player.class];
    advancedButtons.innerHTML = '';
    for (const key in adv) {
        const b = document.createElement('button');
        b.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800';
        b.textContent = adv[key].name;
        b.onclick = () => selectAdvancedClass(key);
        advancedButtons.appendChild(b);
    }
    advancedModal.classList.remove('hidden');
}

function selectAdvancedClass(key) {
    const adv = advancedClasses[gameState.player.class][key];
    gameState.player.advancedClass = adv.name;
    gameState.player.attack += adv.attack;
    gameState.player.defense += adv.defense;
    advancedModal.classList.add('hidden');
    addBattleMessage(`Évolution en ${adv.name}!`, 'system');
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

function chooseTalent(t) {
    const talent = talents[t];
    gameState.player.talents.push(talent.name);
    if (talent.bonus.attack) gameState.player.attack += talent.bonus.attack;
    if (talent.bonus.defense) gameState.player.defense += talent.bonus.defense;
    talentModal.classList.add('hidden');
    addBattleMessage(`Nouveau talent : ${talent.name}`, 'system');
    updateHealthBars();
    saveGame();
}

function showScenario(step) {
    const sc = scenarios[step];
    // If there is no scenario for this step, simply continue the game by
    // spawning a new enemy. This prevents the game from freezing when the
    // scenario chain ends.
    if (!sc) {
        spawnNewEnemy();
        return;
    }
    scenarioText.textContent = sc.text;
    scenarioButtons.innerHTML = '';
    sc.choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'px-3 py-2 bg-blue-700 rounded hover:bg-blue-800';
        btn.textContent = c.text;
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
    if (action === 'forge') {
        showForge();
        return;
    } else if (action === 'shop') {
        showShop();
        return;
    } else if (action === 'rest') {
        const heal = Math.floor(gameState.player.maxHealth / 2);
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
        addBattleMessage(`Vous vous reposez et récupérez ${heal} PV.`, 'system');
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
    if (type === 'weapon') {
        gameState.player.attack += 3;
        const msg = 'Votre arme est améliorée (+3 attaque).';
        if (forgeMessage) forgeMessage.textContent = msg;
        addBattleMessage(msg, 'system');
    } else {
        gameState.player.defense += 3;
        const msg = 'Vous achetez une armure (+3 défense).';
        if (forgeMessage) forgeMessage.textContent = msg;
        addBattleMessage(msg, 'system');
    }
    updateHealthBars();
    saveGame();
}

function renderInventory() {
    inventoryContainer.innerHTML = '';
    const items = {
        potion: { name: 'Potion de soin', icon: 'fa-flask' },
        firePotion: { name: 'Potion de feu', icon: 'fa-fire' },
        shield: { name: 'Bouclier', icon: 'fa-shield-alt' },
        herb: { name: 'Herbe curative', icon: 'fa-leaf' },
        resPotion: { name: 'Potion de ressource', icon: 'fa-bolt' },
        megaPotion: { name: 'Méga potion', icon: 'fa-flask-vial' },
        bomb: { name: 'Bombe', icon: 'fa-bomb' }
    };
    if (!gameState.inventory) {
        gameState.inventory = {};
    }
    Object.keys(gameState.inventory).forEach(key => {
        const count = gameState.inventory[key];
        if (count <= 0) return;
        const div = document.createElement('div');
        div.className = 'bg-blue-900/30 rounded-lg p-3 flex items-center border border-blue-800/50 hover:bg-blue-800/50 transition cursor-pointer';
        div.innerHTML = `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mr-3"><i class="fas ${items[key].icon} text-white"></i></div><div><div class="font-medium">${items[key].name}</div><div class="text-xs text-blue-200">x${count}</div></div>`;
        div.onclick = () => useItem(key);
        inventoryContainer.appendChild(div);
    });
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
    }
    gameState.inventory[item]--;
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

function playerHeal() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();

    const result = gameState.player.heal();
    if (!result) {
        addBattleMessage(`Pas assez de ${gameState.player.resourceType}...`, 'system');
        return;
    }

    const messages = {
        shield: 'Bouclier levé! Dégâts réduits au prochain coup.',
        dodge: 'En garde! Vous esquiverez la prochaine attaque.',
        manaShield: 'Bouclier magique actif!'
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

function playerSpecial() {
    if (!gameState.isPlayerTurn) return;
    processStatusEffects();

    const damage = gameState.player.special(gameState.enemy);
    if (damage === null) {
        addBattleMessage(`Pas assez de ${gameState.player.resourceType} pour l'attaque spéciale.`, 'system');
        return;
    }
    
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
    addBattleMessage('Fin de la partie. Rechargez la page pour recommencer.', 'system');
    saveGame();
}

// Enemy defeated
function enemyDefeated() {
    const xpGained = 15 + Math.floor(Math.random() * 10);
    const levels = gameState.player.gainXp(xpGained);

    addBattleMessage(`Gagne ${xpGained} points d'expérience!`, 'system');

    if (levels > 0) {
        addBattleMessage(`Niveau augmenté à ${gameState.player.level}! Statistiques améliorées.`, 'system');
        if (!gameState.player.advancedClass && gameState.player.level >= 3) {
            showAdvancedOptions();
        } else {
            talentModal.classList.remove('hidden');
        }
    }

    updateHealthBars();
    saveGame();

    showScenario(gameState.scenarioStep);
}

// Spawn new enemy
function spawnNewEnemy() {
    const base = { ...enemiesList[Math.floor(Math.random() * enemiesList.length)] };
    const levelBoost = Math.floor(Math.random() * 3);
    base.level = gameState.player.level + levelBoost;
    base.maxHealth += gameState.player.level * 5 + levelBoost * 10;
    base.health = base.maxHealth;
    base.attackRange = [
        base.attackRange[0] + levelBoost * 2,
        base.attackRange[1] + levelBoost * 2
    ];
    base.defense += Math.floor(gameState.player.level / 2);
    base.statusEffects = [];
    gameState.enemy = new Enemy(base);
    gameState.isPlayerTurn = true;

    addBattleMessage(`Un ${gameState.enemy.name} apparaît!`, 'system');
    updateHealthBars();
    saveGame();
}

// Expose actions globally for HTML onclick handlers
window.playerAttack = playerAttack;
window.playerHeal = playerHeal;
window.playerDefend = playerDefend;
window.playerSpecial = playerSpecial;
window.selectClass = selectClass;
window.selectJob = selectJob;
window.chooseTalent = chooseTalent;
window.buyItem = buyItem;
window.closeShop = closeShop;
window.buyForge = buyForge;
window.closeForge = closeForge;

// Initialize game
initialize();

