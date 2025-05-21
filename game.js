/* --------- Données de base --------- */
const classes = {
    guerrier: { name: 'Guerrier', maxHealth: 60, attack: 10, defense: 8, icon: 'fa-shield-halved', resource: 'rage', maxResource: 100 },
    mage: { name: 'Mage', maxHealth: 40, attack: 14, defense: 4, icon: 'fa-hat-wizard', resource: 'mana', maxResource: 100 },
    voleur: { name: 'Voleur', maxHealth: 45, attack: 12, defense: 6, icon: 'fa-user-ninja', resource: 'energie', maxResource: 100 }
};

const advancedClasses = {
    guerrier: { chevalier: { name: 'Chevalier', attack: 2, defense: 2 } },
    mage: { archimage: { name: 'Archimage', attack: 3, defense: 0 } },
    voleur: { assassin: { name: 'Assassin', attack: 3, defense: 1 } }
};

const jobs = {
    forgeron: { name: 'Forgeron', bonus: { attack: 2 } },
    herboriste: { name: 'Herboriste', bonus: { maxHealth: 5 } }
};

const talents = {
    force: { name: 'Force accrue', bonus: { attack: 2 } },
    protection: { name: 'Protection renforcée', bonus: { defense: 2 } }
};

const enemiesList = [
    { name: "Loup des Ombres", level: 4, health: 35, maxHealth: 35, attack: [8,12], defense: 3, nextAttack: "Morsure" },
    { name: "Golem de Pierre", level: 5, health: 50, maxHealth: 50, attack: [10,15], defense: 5, nextAttack: "Coup de poing" },
    { name: "Esprit Perdu", level: 3, health: 25, maxHealth: 25, attack: [5,10], defense: 2, nextAttack: "Toucher spectral" },
    { name: "Ombre Silencieuse", level: 6, health: 40, maxHealth: 40, attack: [9,14], defense: 4, nextAttack: "Lame ténébreuse" }
];

const scenarios = [
    {
        text: 'Après ce combat, vous trouvez un village. Où allez-vous ?',
        choices: [
            { text: 'Aller à la forge', action: 'forgeron', next: 1 },
            { text: 'Chercher des herbes', action: 'herboriste', next: 1 }
        ]
    },
    {
        text: 'Le village est animé. Voulez-vous visiter le marché ou partir ?',
        choices: [
            { text: 'Visiter le marché', action: 'market', next: 2 },
            { text: 'Continuer la route', action: 'road', next: 2 }
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
    try {
        return JSON.parse(data);
    } catch (e) {
        console.warn('Sauvegarde corromp\u00e9e : r\u00e9initialisation n\u00e9cessaire.', e);
        return null;
    }
}

/* --------- État du jeu --------- */
let gameState = loadGame();
if (!gameState) {
    gameState = {
        player: null,
        enemy: {
            name: 'Loup des Ombres',
            level: 1,
            health: 30,
            maxHealth: 30,
            attack: [5, 8],
            defense: 2,
            nextAttack: 'Morsure'
        },
        inventory: { potion: 3, firePotion: 2, shield: 1, herb: 5, resPotion: 2 },
        battleLog: ['[Système] Bienvenue dans Lumina. Choisissez votre classe pour commencer.'],
        isPlayerTurn: true,
        scenarioStep: 0,
        defending: false
    };
} else {
    // Garantir la présence de l'inventaire pour les anciennes sauvegardes
    if (!gameState.inventory) {
        gameState.inventory = {
            potion: 3,
            firePotion: 2,
            shield: 1,
            herb: 5,
            resPotion: 2
        };
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
const classModal = document.getElementById('class-modal');
const advancedModal = document.getElementById('advanced-class-modal');
const advancedButtons = document.getElementById('advanced-buttons');
const jobModal = document.getElementById('job-modal');
const talentModal = document.getElementById('talent-modal');
const scenarioModal = document.getElementById('scenario-modal');
const scenarioText = document.getElementById('scenario-text');
const scenarioButtons = document.getElementById('scenario-buttons');
const inventoryContainer = document.getElementById('inventory-items');

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
    if (playerIcon) {
        const classIcon = classes[gameState.player.class]?.icon || 'fa-user';
        playerIcon.className = `fas ${classIcon} text-5xl text-white`;
    }
    const icons = { mana: 'fa-droplet', energie: 'fa-bolt', rage: 'fa-fire' };
    resourceIcon.className = `fas ${icons[gameState.player.resourceType]} text-purple-400 mr-1`;
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
    gameState.player = {
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
        xp: 0,
        nextLevelXp: 100,
        job: null,
        talents: [],
        advancedClass: null
    };
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
    if (!sc) return;
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
    if (action === 'forgeron' || action === 'herboriste') {
        selectJob(action);
        spawnNewEnemy();
    } else {
        addBattleMessage('Vous décidez de ' + action + '.', 'system');
        spawnNewEnemy();
    }
}

function renderInventory() {
    inventoryContainer.innerHTML = '';
    const items = {
        potion: { name: 'Potion de soin', icon: 'fa-flask' },
        firePotion: { name: 'Potion de feu', icon: 'fa-fire' },
        shield: { name: 'Bouclier', icon: 'fa-shield-alt' },
        herb: { name: 'Herbe curative', icon: 'fa-leaf' },
        resPotion: { name: 'Potion de ressource', icon: 'fa-bolt' }
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
        addBattleMessage(`Lance une potion de feu et inflige ${dmg} dégâts!`, 'player');
    } else if (item === 'shield') {
        gameState.player.defense += 2;
        addBattleMessage('Vous équipez un bouclier, défense +2.', 'system');
    } else if (item === 'herb') {
        const heal = 5;
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
        addBattleMessage(`Utilise une herbe curative pour ${heal} PV.`, 'heal');
    } else if (item === 'resPotion') {
        const restore = 30;
        gameState.player.resource = Math.min(gameState.player.maxResource, gameState.player.resource + restore);
        addBattleMessage(`Récupère ${restore} ${gameState.player.resourceType}.`, 'system');
    }
    gameState.inventory[item]--;
    renderInventory();
    updateHealthBars();
    saveGame();
}

// Player actions
function playerAttack() {
    if (!gameState.isPlayerTurn) return;

    const damage = Math.max(1, gameState.player.attack - gameState.enemy.defense + Math.floor(Math.random() * 3));
    gameState.enemy.health -= damage;

    if (gameState.player.resourceType === 'rage') {
        gameState.player.resource = Math.min(gameState.player.maxResource, gameState.player.resource + 10);
    }

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
    
    const healAmount = 10 + Math.floor(Math.random() * 5);
    gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);
    
    // Animation
    playerCharacter.classList.add('heal-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('heal-animation');
    }, 1000);
    
    addBattleMessage(`Récupère ${healAmount} points de vie.`, 'heal');
    updateHealthBars();
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

function playerDefend() {
    if (!gameState.isPlayerTurn) return;

    addBattleMessage(`Se met en position défensive. La prochaine attaque sera réduite.`, 'player');
    gameState.defending = true;
    gameState.isPlayerTurn = false;
    setTimeout(enemyTurn, 1500);
}

function playerSpecial() {
    if (!gameState.isPlayerTurn) return;

    const costs = { mana: 30, energie: 20, rage: 50 };
    const type = gameState.player.resourceType;
    const cost = costs[type];
    if (gameState.player.resource < cost) {
        addBattleMessage(`Pas assez de ${type} pour l'attaque spéciale.`, 'system');
        return;
    }
    gameState.player.resource -= cost;

    const damage = 15 + Math.floor(Math.random() * 5);
    gameState.enemy.health -= damage;
    
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
    
    let damage = Math.max(1,
        gameState.enemy.attack[0] + Math.floor(Math.random() * (gameState.enemy.attack[1] - gameState.enemy.attack[0] + 1)) -
        gameState.player.defense
    );
    if (gameState.defending) {
        damage = Math.floor(damage / 2);
        gameState.defending = false;
    }
    
    gameState.player.health -= damage;

    if (gameState.player.resourceType === 'rage') {
        gameState.player.resource = Math.min(gameState.player.maxResource, gameState.player.resource + 5);
    }

    // Animation
    playerCharacter.classList.add('damage-animation');
    setTimeout(() => {
        playerCharacter.classList.remove('damage-animation');
    }, 300);
    
    addBattleMessage(`${gameState.enemy.name} utilise ${gameState.enemy.nextAttack} et inflige ${damage} points de dégâts!`, 'enemy');
    
    if (gameState.player.health <= 0) {
        gameState.player.health = 0;
        addBattleMessage(`${gameState.player.name} a été vaincu!`, 'system');
    }

    const regen = { mana: 5, energie: 3 };
    if (regen[gameState.player.resourceType]) {
        gameState.player.resource = Math.min(gameState.player.maxResource, gameState.player.resource + regen[gameState.player.resourceType]);
    }

    updateHealthBars();
    gameState.isPlayerTurn = true;
}

// Enemy defeated
function enemyDefeated() {
    const xpGained = 15 + Math.floor(Math.random() * 10);
    gameState.player.xp += xpGained;

    addBattleMessage(`Gagne ${xpGained} points d'expérience!`, 'system');

    while (gameState.player.xp >= gameState.player.nextLevelXp) {
        gameState.player.xp -= gameState.player.nextLevelXp;
        gameState.player.level++;
        gameState.player.maxHealth += 10;
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.attack += 2;
        gameState.player.defense += 1;
        gameState.player.nextLevelXp = Math.floor(gameState.player.nextLevelXp * 1.2);

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
    gameState.enemy = {...enemiesList[Math.floor(Math.random() * enemiesList.length)]};
    gameState.enemy.maxHealth = gameState.enemy.health;
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

// Initialize game
initialize();

