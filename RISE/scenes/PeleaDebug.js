class PeleaDebug extends Phaser.Scene {

    constructor() {
        super({ key: 'PeleaDebug' });
    }

    preload() {
        this.load.image("ColinasF", "assets/sprites/pelea/fondo1/colinas.png");
        this.load.image("FondoF", "assets/sprites/pelea/fondo1/fondoruinas.png");
        this.load.image("RuinasF", "assets/sprites/pelea/fondo1/ruinas2.png");
        this.load.image("EstatuaF", "assets/sprites/pelea/fondo1/estatua.png");
        this.load.image("RuinasFF", "assets/sprites/pelea/fondo1/ruinas.png");
        this.load.image("PastoF", "assets/sprites/pelea/fondo1/pasto.png");
        this.load.image("CieloF", "assets/sprites/pelea/fondo1/cielo.png");

        this.load.atlas('slime', 'assets/Animaciones/Mago/slimea.png', 'assets/Animaciones/Mago/slimea.json');
        this.load.atlas('ojoMurcielago', 'assets/Animaciones/Mago/ojoconcentracionanim.png', 'assets/Animaciones/Mago/ojoconcentracionanim.json'); // Asegurar precarga
        this.load.image("Mago_Right0", "assets/Animaciones/Mago/MRight_0.png");
        this.load.image("Caballero_Right0", "assets/Animaciones/Caballero/Right_0.png");
            // Caballero - animaciones de golpes (atlas + animation JSON)
            this.load.atlas('golpe_debil', 'assets/Animaciones/CaballeroGolpes/golpe_debil.png', 'assets/Animaciones/CaballeroGolpes/golpe_debil_atlas.json');
            this.load.animation('caballeroGolpesAnim', 'assets/Animaciones/CaballeroGolpes/golpe_debil_anim.json');
        this.load.atlas('corazon','assets/Animaciones/Mago/vidasjuego.png','assets/Animaciones/Mago/vidasjuego.json') 
        //Audios
        this.load.audio("PeleaTutorial", "assets/audio/FFVIIPeleaTutorial.mp3");
        this.load.audio("HitJugador", "assets/audio/HitJugador.mp3");
        this.load.audio("GolpeDebil", "assets/audio/GolpeDebil.mp3");
        this.load.audio("VictoriaFFVII", "assets/audio/VictoriaFFVII.mp3");

    }

    // Inicializar la escena de batalla con todos los personajes, enemigos y UI
    create(data) { 
       
        // === FONDO DE BATALLA ===
        this.ColinasFondo = this.add.image(860, 525, 'ColinasF');
        this.ColinasFondo.setOrigin(0.5, 0.5);
        this.ColinasFondo.setScale(1);
        this.ColinasFondo.setDepth(-11); // Fondo detrás de todo

        this.RuinasFondo = this.add.image(860, 525, 'FondoF');
        this.RuinasFondo.setOrigin(0.5, 0.5);
        this.RuinasFondo.setScale(1);
        this.RuinasFondo.setDepth(-12); // Fondo detrás de todo

        this.Ruinas2Fondo = this.add.image(860, 525, 'RuinasF');
        this.Ruinas2Fondo.setOrigin(0.5, 0.5);
        this.Ruinas2Fondo.setScale(1);
        this.Ruinas2Fondo.setDepth(-9); // Fondo detrás de todo

        this.EstatuaFondo = this.add.image(860, 525, 'EstatuaF');
        this.EstatuaFondo.setOrigin(0.5, 0.5);
        this.EstatuaFondo.setScale(1);
        this.EstatuaFondo.setDepth(-8); // Fondo detrás de todo

        this.RuinasFFondo = this.add.image(860, 525, 'RuinasFF');
        this.RuinasFFondo.setOrigin(0.5, 0.5);
        this.RuinasFFondo.setScale(1);
        this.RuinasFFondo.setDepth(-7); // Fondo detrás de todo

        this.PastoFondo = this.add.image(860, 525, 'PastoF');
        this.PastoFondo.setOrigin(0.5, 0.5);
        this.PastoFondo.setScale(1);
        this.PastoFondo.setDepth(-6); // Fondo detrás de todo

        this.CieloFondo = this.add.image(860, 525, 'CieloF');
        this.CieloFondo.setOrigin(0.5, 0.5);
        this.CieloFondo.setScale(1);
        this.CieloFondo.setDepth(-13); // Fondo detrás de todo
        
        //  Determinar el tipo de enemigo de la batalla
        this.targetEnemyId = data && data.targetEnemy ? data.targetEnemy.getData('id') : null;
        this.enemyType = 'slime'; 
        
        if (this.targetEnemyId) {
            if (this.targetEnemyId.includes('ojo')) {
                this.enemyType = 'ojoMurcielago';
            } else if (this.targetEnemyId.includes('slime')) {
                this.enemyType = 'slime';
            }
        }
        

        // === ESTADO DEL JUEGO ===

        //Reproducir musica 
        this.PeleaTuto = this.sound.add("PeleaTutorial", { loop: true, volume: 1 });
        this.PeleaTuto.play();

        // Controla el flujo general de la batalla (turnos, menús, etc.)
        this.gameState = {
            currentTurn: 'player', // Indica si es turno del jugador o enemigos
            currentCharacter: 0, // 0 = Knight, 1 = Mage (el personaje actualmente controlado)
            inMenu: true, // Si está en el menú principal
            battleOver: false // Indica si la batalla terminó (victoria o derrota)
        };

        // Escala y offsets de la animación de ataque (puedes cambiarla manualmente)
        // Valor aumentado para que la animación sea más grande (aprox. como antes)
        this.attackAnimScale = 3; // ajusta este número para hacerlo más/menos grande
        // Offsets por defecto para la animación respecto al sprite atacante
        this.attackAnimOffsetX = 40; // a la derecha
        this.attackAnimOffsetY = -120; // hacia arriba

        // === DEFINIR PERSONAJES DEL JUGADOR (PARTY) ===
     
        //  Definir enemigos genéricamente
        const baseHp = this.enemyType === 'slime' ? 30 : 40; // Ojo Murciélago tiene más HP
        const enemyName = this.enemyType === 'slime' ? 'Slime' : 'Ojo Murciélago';

        this.enemyParty = [
            { name: `${enemyName} 1`, hp: baseHp, maxHp: baseHp, sprite: null, dead: false },
            { name: `${enemyName} 2`, hp: baseHp, maxHp: baseHp, sprite: null, dead: false },
            { name: `${enemyName} 3`, hp: baseHp, maxHp: baseHp, sprite: null, dead: false }
        ];

        // === CREAR SPRITES DE PERSONAJES DEL JUGADOR ===
        // === DEFINIR PERSONAJES DEL JUGADOR (PARTY) ===
        // Si hay datos guardados en el registry (vienen de EscenaDebug tras victorias), úsalos.
        const savedPlayers = this.registry.get('playerParty');
        if (savedPlayers && Array.isArray(savedPlayers) && savedPlayers.length >= 2) {
            this.playerParty = savedPlayers.map(p => ({
                name: p.name || 'Unknown',
                type: p.type || 'knight',
                hp: Number.isFinite(p.hp) ? p.hp : (p.type === 'mage' ? 80 : 100),
                maxHp: Number.isFinite(p.maxHp) ? p.maxHp : (p.type === 'mage' ? 80 : 100),
                sprite: null,
                dead: !!p.dead,
                attack: Number.isFinite(p.attack) ? p.attack : (p.type === 'mage' ? 25 : 15),
                maxNormalUses: Number.isFinite(p.maxNormalUses) ? p.maxNormalUses : 10,
                maxStrongUses: Number.isFinite(p.maxStrongUses) ? p.maxStrongUses : (p.type === 'knight' ? 5 : 0),
                maxHealUses: Number.isFinite(p.maxHealUses) ? p.maxHealUses : (p.type === 'mage' ? 5 : 0),
                normalAttackUses: Number.isFinite(p.normalAttackUses) ? p.normalAttackUses : (Number.isFinite(p.maxNormalUses) ? p.maxNormalUses : 10),
                strongAttackUses: Number.isFinite(p.strongAttackUses) ? p.strongAttackUses : (Number.isFinite(p.maxStrongUses) ? p.maxStrongUses : (p.type === 'knight' ? 5 : 0)),
                healUses: Number.isFinite(p.healUses) ? p.healUses : (Number.isFinite(p.maxHealUses) ? p.maxHealUses : (p.type === 'mage' ? 5 : 0)),
                xp: Number.isFinite(p.xp) ? p.xp : 0,
                xpToNextLevel: Number.isFinite(p.xpToNextLevel) ? p.xpToNextLevel : 100,
                level: Number.isFinite(p.level) ? p.level : 1
            }));
        } else {
            // Valores por defecto (primera vez)
            this.playerParty = [
                {
                    name: 'Caballero',
                    type: 'knight',
                    hp: 100,
                    maxHp: 100,
                    sprite: null,
                    dead: false,
                    attack: 15,
                    maxNormalUses: 10,
                    maxStrongUses: 5,
                    maxHealUses: 0,
                    normalAttackUses: 10,
                    strongAttackUses: 5,
                    healUses: 0,
                    xp: 0,
                    xpToNextLevel: 100,
                    level: 1
                },
                {
                    name: 'Mago',
                    type: 'mage',
                    hp: 80,
                    maxHp: 80,
                    sprite: null,
                    dead: false,
                    attack: 25,
                    maxNormalUses: 10,
                    maxStrongUses: 0,
                    maxHealUses: 5,
                    normalAttackUses: 10,
                    strongAttackUses: 0,
                    healUses: 5,
                    xp: 0,
                    xpToNextLevel: 100,
                    level: 1
                }
            ];
        }

        // Lado izquierdo en dos filas (Knight en Y=300, Mage en Y=450)
        this.playerParty[1].sprite = this.add.sprite(327, 500, 'Mago_Right0').setScale(7);
        this.playerParty[0].sprite = this.add.sprite(600, 600, 'Caballero_Right0').setScale(7)

        // === CREAR SPRITES DE ENEMIGOS ===
        //  Crear animaciones genéricas (si no existen)
        if (!this.anims.get('idle_slime')) {
            this.anims.create({
                key: 'idle_slime',
                frames: this.anims.generateFrameNames('slime', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.get('idle_ojoMurcielago')) {
            this.anims.create({
                key: 'idle_ojoMurcielago',
                frames: this.anims.generateFrameNames('ojoMurcielago', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Crear animación de golpe normal del Caballero (no en loop)
        if (!this.anims.get('golpenormal')) {
            this.anims.create({
                key: 'golpenormal',
                frames: this.anims.generateFrameNames('golpe_debil', { frames: ['golpedebil1','golpedebil2','golpedebil3','golpedebil4','golpedebil5','golpedebil6','golpedebil7'] }),
                frameRate: 10,
                repeat: 0
            });
        }
      
        // === CREAR ANIMACIÓN DEL CORAZÓN ===
        if (!this.anims.get('corazonLatirAnim')) {
            this.anims.create({
                key: 'corazonLatirAnim', // 🟢 CLAVE DE LA ANIMACIÓN
                // Usamos 'corazon', la clave que definiste en preload
                frames: this.anims.generateFrameNames('corazon', { 
                    // Nombres de los frames según tu JSON
                    frames: [
                        "cprarz 0.aseprite", 
                        "cprarz 1.aseprite", 
                        "cprarz 2.aseprite", 
                        "cprarz 3.aseprite"
                    ]
                }),
                frameRate: 8, // Velocidad de reproducción
                repeat: -1 // Bucle infinito
            });
        }
      
        const animKey = this.enemyType === 'slime' ? 'idle_slime' : 'idle_ojoMurcielago';

        

        // Generación de sprites de enemigos usando this.enemyType
        // Posiciones según tipo de enemigo
        const enemyPositions = this.enemyType === 'slime'
            ? [
                { x: 1200, y: 500 }, // Slime más abajo
                { x: 1335, y: 600 },
                { x: 1533, y: 700 }
            ]
            : [
                { x: 1200, y: 250 }, // Ojo Murciélago más arriba
                { x: 1335, y: 200 },
                { x: 1533, y: 300 }
            ];

        // Enemigo 1
        this.enemyParty[0].sprite = this.add.sprite(enemyPositions[0].x, enemyPositions[0].y, this.enemyType)
            .setScale(5)
            .setTint(0xDDDDFF)
            .play(animKey);
    
        // Enemigo 2
        this.enemyParty[1].sprite = this.add.sprite(enemyPositions[1].x, enemyPositions[1].y, this.enemyType)
            .setScale(7)
            .play(animKey);
    
        // Enemigo 3
        this.enemyParty[2].sprite = this.add.sprite(enemyPositions[2].x, enemyPositions[2].y, this.enemyType)
            .setScale(8)
            .setTint(0xFF9999)
            .play(animKey);

        // === CREAR BARRAS DE VIDA ===
        // Función que genera las barras de HP para jugador y enemigos
        this.createHPBars();

        // === INDICADOR DE TURNO (ARRIBA) ===
        // Cubo rojo/azul que muestra de quién es el turno
        this.turnIndicator = this.add.rectangle(850, 50, 80, 80, 0xFF0000); // Rojo = turno jugador
        this.turnIndicatorText = this.add.text(850, 50, 'PLAYER', { font: '16px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);

        // === CREAR MENÚ DE ACCIONES ===
        // Función que genera el menú principal (ATTACK, ITEMS, CHANGE)
        this.createMenuUI();

        // === CONFIGURAR CONTROLES ===
        // Mapeo de teclas para controlar el menú y acciones
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W, // Navegar arriba
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S, // Navegar abajo
            D: Phaser.Input.Keyboard.KeyCodes.D,
            Enter: Phaser.Input.Keyboard.KeyCodes.ENTER, // Confirmar selección
            Esc: Phaser.Input.Keyboard.KeyCodes.ESC // Cancelar (no implementado aún)
        });

        // === VARIABLES DE SELECCIÓN ===
        this.selectedMenuOption = 0; // Opción resaltada del menú (0=ATTACK, 1=ITEMS, 2=CHANGE)
        this.selectedEnemyTarget = 0; // Enemigo seleccionado como objetivo
    }




    createHPBars() {

        // --- CONFIGURACIÓN GENERAL ---
        const heartSpacing = 22;   // separación horizontal
        const offsetY = -80;       // altura de los corazones
        const HEART_VALUE = 10;    // cada corazón = 10 hp
    
        // ======== ALIADOS ========
        this.playerParty.forEach(p => {
            p.hearts = [];
    
            const totalHearts = Math.ceil(p.maxHp / HEART_VALUE);
    
            for (let i = 0; i < totalHearts; i++) {
                const heart = this.add.sprite(
                    p.sprite.x - 40 + i * heartSpacing,
                    p.sprite.y + offsetY,
                    "corazon"
                )
                .setScale(2)
                .play('corazonLatirAnim');
    
                p.hearts.push(heart);
            }
        });
    
        // ======== ENEMIGOS ========
        this.enemyParty.forEach(e => {
            e.hearts = [];
    
            const totalHearts = Math.ceil(e.maxHp / HEART_VALUE);
    
            for (let i = 0; i < totalHearts; i++) {
                const heart = this.add.sprite(
                    e.sprite.x - 40 + i * heartSpacing,
                    e.sprite.y + offsetY,
                    "corazon"
                )
                .setScale(2)
                .setTint(0x9933ff)   // ❤️‍🔥 MORADO PARA ENEMIGOS
                .play('corazonLatirAnim');
    
                e.hearts.push(heart);
            }
        });
    }

    // === CREAR MENÚ DE ACCIONES ===
    // Genera el menú principal con las opciones: ATTACK, ITEMS, CHANGE
    createMenuUI() {
        // Define las 3 opciones disponibles en cada turno
        this.menuOptions = [
            { text: 'ATTACK', action: 'attack' }, // Atacar al enemigo
            { text: 'ITEMS', action: 'items' },   // Usar objetos
            { text: 'CHANGE', action: 'change' }  // Cambiar de personaje
        ];

        this.menuTexts = []; // Array para guardar referencias a los textos del menú
        const menuStartY = 150; // Posición Y del primer elemento
        const menuSpacing = 50; // Espaciado vertical entre opciones

        // Crear cada opción del menú
        for (let i = 0; i < this.menuOptions.length; i++) {
            const text = this.add.text(425, menuStartY + i * menuSpacing, this.menuOptions[i].text, {
                font: '20px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5, 0.5).setDepth(10);
            text.setData('menuIndex', i); // Guardar el índice para identificarlo después
            this.menuTexts.push(text);
        }

        // Destacar la primera opción del menú
        this.updateMenuHighlight();

        // Texto que muestra de quién es el turno (ej: "Knight's Turn")
        this.turnInfoText = this.add.text(425, 120, `${this.playerParty[this.gameState.currentCharacter].name}'s Turn`, {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5).setDepth(10);
    }

    // === ACTUALIZAR RESALTADO DEL MENÚ ===
    // Cambia el color y tamaño del texto según cuál está seleccionado
    updateMenuHighlight() {
        this.menuTexts.forEach((text, index) => {
            if (index === this.selectedMenuOption) {
                text.setFill('#FFFF00'); // Amarillo para la selección
                text.setFontSize(24); // Más grande
            } else {
                text.setFill('#ffffff'); // Blanco normal
                text.setFontSize(20);
            }
        });
    }

    // === LOOP PRINCIPAL DE ACTUALIZACIÓN ===
    // Se ejecuta cada frame para procesar entrada del jugador
    update() {
        if (this.gameState.battleOver) return; // Si la batalla terminó, no hacer nada

        // Procesar turno del jugador (menú y acciones)
        if (this.gameState.currentTurn === 'player') {
            this.handlePlayerTurn();
        }
    }

    // === MANEJAR TURNO DEL JUGADOR ===
    // Procesa la entrada del teclado para navegar y ejecutar acciones
    handlePlayerTurn() {
        // Navegación arriba (W) - mover selección hacia arriba
        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.selectedMenuOption = (this.selectedMenuOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.updateMenuHighlight();
        }
        // Navegación abajo (S) - mover selección hacia abajo
        if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
            this.selectedMenuOption = (this.selectedMenuOption + 1) % this.menuOptions.length;
            this.updateMenuHighlight();
        }

        // Confirmar selección (ENTER)
        if (Phaser.Input.Keyboard.JustDown(this.keys.Enter)) {
            const action = this.menuOptions[this.selectedMenuOption].action;

            // Ejecutar la acción seleccionada
            if (action === 'attack') {
                this.showAttackMenu(); // Mostrar opciones de ataque
            } else if (action === 'items') {
                this.showItemsMenu(); // Mostrar items disponibles
            } else if (action === 'change') {
                this.changeCharacter(); // Cambiar de personaje
            }
        }
    }

    showAttackMenu() {
        const current = this.playerParty[this.gameState.currentCharacter];

        // Ocultar menú principal mientras se muestran opciones de ataque
        this.menuTexts.forEach(t => t.setVisible(false));
        this.turnInfoText.setVisible(false);

        // Mostrar instrucciones para seleccionar ataque
        this.add.text(425, 200, 'Select Attack: Press 1 or 2', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);

        // Definir ataques según el tipo de personaje activo
        const attacks = current.type === 'knight'
            ? [
                { name: `Normal (${current.normalAttackUses}/${current.maxNormalUses})`, type: 'normal', damage: current.attack },
                { name: `Strong (${current.strongAttackUses}/${current.maxStrongUses})`, type: 'strong', damage: Math.floor(current.attack * 2) }
            ]
            : [
                { name: `Spell (${current.normalAttackUses}/${current.maxNormalUses})`, type: 'spell', damage: current.attack },
                { name: `Heal (${current.healUses}/${current.maxHealUses})`, type: 'heal', healing: 40 }
            ];

        // Mostrar cada opción de ataque con su número para seleccionarla
        for (let i = 0; i < attacks.length; i++) {
            this.add.text(425, 240 + i * 40, `${i + 1}: ${attacks[i].name}`, {
                font: '14px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);
        }

        // Manejar la selección del ataque (presionar 1 o 2)
        const handleAttackSelection = (event) => {
            const choice = parseInt(event.key);
            if (choice === 1 || choice === 2) {
                this.input.keyboard.off('keydown', handleAttackSelection);
                this.removeTemporaryMenus();

                // Si es curación, permite seleccionar aliado a curar
                if (attacks[choice - 1].type === 'heal') {
                    this.selectCharacterToHeal();
                } else {
                    // Si es ataque, permite seleccionar enemigo objetivo
                    this.selectEnemyTarget(attacks[choice - 1]);
                }
            }
        };

        this.input.keyboard.on('keydown', handleAttackSelection);
    }

    // === SELECCIONAR ENEMIGO OBJETIVO ===
    selectEnemyTarget(attack) {
        // Obtener lista de enemigos que aún viven
        const aliveEnemies = this.enemyParty.filter(e => !e.dead);
        if (aliveEnemies.length === 0) {
            this.endPlayerTurn();
            return;
        }

        this.selectedEnemyTarget = 0;
        this.displayEnemyTargets(aliveEnemies, attack);

        // Manejar navegación y selección del objetivo
        const handleTargetSelection = (event) => {
            if (event.key === 'ArrowUp') {
                this.selectedEnemyTarget = (this.selectedEnemyTarget - 1 + aliveEnemies.length) % aliveEnemies.length;
                this.displayEnemyTargets(aliveEnemies, attack);
            } else if (event.key === 'ArrowDown') {
                this.selectedEnemyTarget = (this.selectedEnemyTarget + 1) % aliveEnemies.length;
                this.displayEnemyTargets(aliveEnemies, attack);
            } else if (event.key === 'Enter') {
                this.input.keyboard.off('keydown', handleTargetSelection);
                this.removeTemporaryMenus();
                this.performAttack(attack, aliveEnemies[this.selectedEnemyTarget]);
            }
        };

        this.input.keyboard.on('keydown', handleTargetSelection);
    }

    // === MOSTRAR LISTA DE ENEMIGOS DISPONIBLES ===
    // Dibuja la lista de enemigos con el actual resaltado en amarillo
    displayEnemyTargets(enemies, attack) {
        this.removeTemporaryMenus();

        this.add.text(425, 200, 'Select Target: Arrow Keys', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('targetSelector', true);

        // Mostrar cada enemigo disponible
        enemies.forEach((enemy, index) => {
            const marker = index === this.selectedEnemyTarget ? '> ' : '  '; // Indicador visual del seleccionado
            this.add.text(425, 240 + index * 40, `${marker}${enemy.name} (${enemy.hp}/${enemy.maxHp})`, {
                font: '14px Arial',
                fill: index === this.selectedEnemyTarget ? '#FFFF00' : '#ffffff'
            }).setOrigin(0.5, 0.5).setDepth(10).setData('targetSelector', true);
        });
    }

    // === EJECUTAR EL ATAQUE ===
    // Calcula el daño, lo aplica al objetivo y muestra la animación de daño
    performAttack(attack, target) {
        const attacker = this.playerParty[this.gameState.currentCharacter];

        // Validar que el ataque tenga usos disponibles
        if (attack.type === 'normal' && attacker.normalAttackUses <= 0) {
            this.showMessage('No uses left!');
            return;
        }
        if (attack.type === 'strong' && attacker.strongAttackUses <= 0) {
            this.showMessage('No uses left!');
            return;
        }

        // === ANIMAR SALTO PARABÓLICO DEL ATACANTE HACIA EL ENEMIGO ===
        // Guardar posición original del atacante y cámara
        const originalX = attacker.sprite.x;
        const originalY = attacker.sprite.y;
        
        // Calcular posición junto al enemigo (más cerca pero sin superposición)
        const targetX = target.sprite.x - 150; // Posicionarse a la izquierda del enemigo
        const targetY = target.sprite.y; // Misma altura
        
        // Altura máxima del arco parabólico (peak del salto)
        const maxHeight = 150;
        
        // Distancia total horizontal del salto
        const distanceX = targetX - originalX;
        const distanceY = targetY - originalY;
        
        // Duración del salto de ida (400ms)
        const jumpDuration = 400;
        
        // Guardar posición inicial de la cámara y zoom para restaurar
        const initialCameraX = this.cameras.main.centerX;
        const initialCameraY = this.cameras.main.centerY;
        const initialZoom = this.cameras.main.zoom;
        
        // Punto medio entre el atacante y el enemigo (donde enfocarse)
        const focusX = (originalX + targetX) / 2;
        const focusY = (originalY + targetY) / 2;

        // === SALTO DE IDA CON PARÁBOLA Y CÁMARA ===
        this.tweens.add({
            targets: { progress: 0 },
            progress: 1,
            duration: jumpDuration,
            ease: 'Linear',
            onUpdate: (tween) => {
                const t = tween.progress; // Valor de 0 a 1
                
                // Ecuación parabólica para altura: -4 * maxHeight * t * (t - 1)
                const heightOffset = 4 * maxHeight * t * (t - 1);
                
                // Movimiento lineal horizontal y vertical del atacante
                attacker.sprite.x = originalX + distanceX * t;
                attacker.sprite.y = originalY + distanceY * t + heightOffset;
                
                // La cámara se enfoca en el punto medio y va haciendo zoom gradualmente
                const targetZoom = initialZoom + (0.3 * t); // zoom de inicial a inicial+0.3
                
                this.cameras.main.setZoom(targetZoom);
                // Interpolar entre la posición inicial y el punto de enfoque
                const cameraX = initialCameraX + (focusX - initialCameraX) * t;
                const cameraY = initialCameraY + (focusY - initialCameraY) * t;
                this.cameras.main.centerOn(cameraX, cameraY);
            },
            onComplete: () => {
                // Esperar un momento breve antes de ejecutar la animación/daño
                this.time.delayedCall(100, () => {
                    // Si es el Caballero y ataque normal, reproducir animación y aplicar daño a mitad
                    if (attacker.type === 'knight' && attack.type === 'normal' && this.anims.exists('golpenormal')) {
                        // Reproducir animación de golpe en un sprite temporal para no cambiar la textura del atacante
                        // Escala de la animación: usa la configuración `this.attackAnimScale` (por defecto 1)
                        const animScale = (typeof this.attackAnimScale === 'number') ? this.attackAnimScale : (attacker.sprite.scaleX * 0.5);

                        // Permitir posición manual para la animación si fue configurada
                        let animX = attacker.sprite.x;
                        let animY = attacker.sprite.y;
                        if (this.attackAnimPos) {
                            if (this.attackAnimPos.relative) {
                                animX = attacker.sprite.x + (this.attackAnimPos.x || 0);
                                animY = attacker.sprite.y + (this.attackAnimPos.y || 0);
                            } else {
                                animX = (typeof this.attackAnimPos.x === 'number') ? this.attackAnimPos.x : animX;
                                animY = (typeof this.attackAnimPos.y === 'number') ? this.attackAnimPos.y : animY;
                            }
                        } else if (attacker.type === 'knight') {
                            // Por defecto, mostrar la animación ligeramente a la derecha y arriba del Caballero
                            animX = attacker.sprite.x + (this.attackAnimOffsetX || 40);
                            animY = attacker.sprite.y + (typeof this.attackAnimOffsetY === 'number' ? this.attackAnimOffsetY : -30);
                        }

                        const animSprite = this.add.sprite(animX, animY, 'golpe_debil')
                            .setScale(animScale)
                            .setOrigin(attacker.sprite.originX || 0.5, attacker.sprite.originY || 0.5)
                            .setDepth(attacker.sprite.depth + 1);
                        animSprite.play({ key: 'golpenormal', repeat: 0 });

                        // Obtener duración estimada de la animación (ms)
                        const anim = this.anims.get('golpenormal');
                        let durationMs = 700; // fallback
                        if (anim && anim.frames && anim.frameRate) {
                            durationMs = (anim.frames.length / anim.frameRate) * 1000;
                        }

                        // Aplicar daño y sonido antes (al 30% de la animación)
                        this.time.delayedCall(Math.floor(durationMs * 0.2), () => {
                            // Calcular daño según el atacante
                            let damage = 0;
                            if (attack.type === 'normal') damage = attacker.attack;
                            else if (attack.type === 'strong') damage = Math.floor(attacker.attack * 2);
                            else if (attack.type === 'spell') damage = attacker.attack;

                            target.hp = Math.max(0, target.hp - damage);

                            // Decrementar usos
                            if (attack.type === 'normal') attacker.normalAttackUses--;

                            // Reproducir sonido del golpe débil
                            this.sound.play('GolpeDebil');

                            // Aplicar efecto de sacudida en X al enemigo
                            this.shakeSprite(target.sprite);

                            // Mostrar daño encima del enemigo
                            this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
                                font: '20px Arial',
                                fill: '#FF0000'
                            }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

                            if (target.hp <= 0) target.dead = true;
                            this.updateHPDisplay(target);
                        });

                        // Cuando termine la animación temporal, destruirla y hacer el salto de regreso
                        animSprite.once('animationcomplete-golpenormal', () => {
                            animSprite.destroy();

                            // SALTO DE REGRESO CON CÁMARA QUE REGRESA AL ZOOM NORMAL (TRANSICIÓN SUAVE)
                            this.tweens.add({
                                targets: { progress: 0 },
                                progress: 1,
                                duration: jumpDuration,
                                ease: 'Linear',
                                onUpdate: (tween) => {
                                    const t = tween.progress; // Valor de 0 a 1
                                    const heightOffset = 4 * maxHeight * t * (t - 1);
                                    attacker.sprite.x = targetX - distanceX * t;
                                    attacker.sprite.y = targetY - distanceY * t + heightOffset;
                                    
                                    // La cámara regresa gradualmente a la posición y zoom iniciales
                                    const remainingZoom = (initialZoom + 0.3) - (0.3 * t);
                                    
                                    this.cameras.main.setZoom(remainingZoom);
                                    // Interpolar entre el punto de enfoque y la posición inicial
                                    const cameraX = focusX - (focusX - initialCameraX) * t;
                                    const cameraY = focusY - (focusY - initialCameraY) * t;
                                    this.cameras.main.centerOn(cameraX, cameraY);
                                },
                                onComplete: () => {
                                    // Restaurar cámara a su estado original de forma garantizada
                                    this.resetCamera(initialCameraX, initialCameraY, initialZoom);
                                    this.endPlayerTurn();
                                }
                            });
                        });
                    } else {
                        // Comportamiento por defecto: aplicar daño inmediatamente y volver
                        // Calcular daño usando stats del atacante
                        let damage = 0;
                        if (attack.type === 'normal') damage = attacker.attack;
                        else if (attack.type === 'strong') damage = Math.floor(attacker.attack * 2);
                        else if (attack.type === 'spell') damage = attacker.attack;

                        target.hp = Math.max(0, target.hp - damage);

                        if (attack.type === 'normal') attacker.normalAttackUses--;
                        else if (attack.type === 'strong') attacker.strongAttackUses--;

                        // Aplicar efecto de sacudida en X al enemigo
                        this.shakeSprite(target.sprite);

                        this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
                            font: '20px Arial',
                            fill: '#FF0000'
                        }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

                        if (target.hp <= 0) target.dead = true;
                        this.updateHPDisplay(target);

                        // SALTO DE REGRESO
                        this.tweens.add({
                            targets: { progress: 0 },
                            progress: 1,
                            duration: jumpDuration,
                            ease: 'Linear',
                            onUpdate: (tween) => {
                                const t = tween.progress; // Valor de 0 a 1
                                const heightOffset = 4 * maxHeight * t * (t - 1);
                                attacker.sprite.x = targetX - distanceX * t;
                                attacker.sprite.y = targetY - distanceY * t + heightOffset;
                                
                                // La cámara regresa gradualmente a la posición y zoom iniciales
                                const remainingZoom = (initialZoom + 0.3) - (0.3 * t);
                                
                                this.cameras.main.setZoom(remainingZoom);
                                // Interpolar entre el punto de enfoque y la posición inicial
                                const cameraX = focusX - (focusX - initialCameraX) * t;
                                const cameraY = focusY - (focusY - initialCameraY) * t;
                                this.cameras.main.centerOn(cameraX, cameraY);
                            },
                            onComplete: () => {
                                // Restaurar cámara a su estado original de forma garantizada
                                this.resetCamera(initialCameraX, initialCameraY, initialZoom);
                                this.endPlayerTurn();
                            }
                        });
                    }
                });
            }
        });
    }

    selectCharacterToHeal() {
        const aliveAllies = this.playerParty.filter(p => p.hp > 0);
        let selectedAlly = 0;

        this.displayHealTargets(aliveAllies, selectedAlly);

        const handleHealSelection = (event) => {
            if (event.key === 'ArrowUp') {
                selectedAlly = (selectedAlly - 1 + aliveAllies.length) % aliveAllies.length;
                this.displayHealTargets(aliveAllies, selectedAlly);
            } else if (event.key === 'ArrowDown') {
                selectedAlly = (selectedAlly + 1) % aliveAllies.length;
                this.displayHealTargets(aliveAllies, selectedAlly);
            } else if (event.key === 'Enter') {
                this.input.keyboard.off('keydown', handleHealSelection);
                this.removeTemporaryMenus();
                this.performHeal(aliveAllies[selectedAlly]);
            }
        };

        this.input.keyboard.on('keydown', handleHealSelection);
    }

    displayHealTargets(allies, selected) {
        this.removeTemporaryMenus();

        this.add.text(425, 200, 'Select to Heal: Arrow Keys', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('healSelector', true);

        allies.forEach((ally, index) => {
            const marker = index === selected ? '> ' : '  ';
            this.add.text(425, 240 + index * 40, `${marker}${ally.name} (${ally.hp}/${ally.maxHp})`, {
                font: '14px Arial',
                fill: index === selected ? '#FFFF00' : '#ffffff'
            }).setOrigin(0.5, 0.5).setDepth(10).setData('healSelector', true);
        });
    }

    // === REALIZAR CURACIÓN ===
    // El Mago cura a un aliado seleccionado restaurando HP
    performHeal(target) {
        const healer = this.playerParty[this.gameState.currentCharacter];
        const healAmount = 40;

        // Validar que tenga usos de curación disponibles
        if (healer.healUses <= 0) {
            this.showMessage('No healing left!');
            return;
        }

        // Restaurar HP (sin exceder maxHp)
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        // Decrementar usos de curación
        healer.healUses--;

        // Mostrar número de curación en verde sobre el aliado
        this.add.text(target.sprite.x, target.sprite.y - 40, `+${healAmount}`, {
            font: '20px Arial',
            fill: '#00FF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

        // Actualizar barras de vida
        this.updateHPDisplay(target);

        // Esperar 1 segundo y terminar turno
        this.time.delayedCall(1000, () => {
            this.endPlayerTurn();
        });
    }

    // === MOSTRAR MENÚ DE OBJETOS ===
    // Actualmente no hay items, pero aquí se mostrarían las opciones
    showItemsMenu() {
        this.removeTemporaryMenus();
        this.showMessage('No items available yet!');

        this.time.delayedCall(1500, () => {
            this.endPlayerTurn();
        });
    }

    // === CAMBIAR DE PERSONAJE ===
    // Intercambia entre Knight y Mage con una animación de intercambio de posiciones
    changeCharacter() {
        this.removeTemporaryMenus();
        // Rotar al siguiente personaje (0→1 o 1→0)
        this.gameState.currentCharacter = (this.gameState.currentCharacter + 1) % this.playerParty.length;
        // Actualizar texto de turno
        this.turnInfoText.setText(`${this.playerParty[this.gameState.currentCharacter].name}'s Turn`);

        // Animar intercambio de posiciones (sin rotación, solo movimiento Y)
        const knight = this.playerParty[0].sprite;
        const mage = this.playerParty[1].sprite;
        // Parámetros de la animación parabólica
        const duration = 600;
        const maxHeight = 120; // altura máxima de la parábola

        // Posiciones originales
        const knightPos = { x: knight.x, y: knight.y };
        const magePos = { x: mage.x, y: mage.y };

        // Preparar offsets relativos para corazones (para seguir al sprite durante la animación)
        const knightHearts = this.playerParty[0].hearts || [];
        const mageHearts = this.playerParty[1].hearts || [];

        const knightHeartOffsets = knightHearts.map(h => ({ dx: h.x - knight.x, dy: h.y - knight.y }));
        const mageHeartOffsets = mageHearts.map(h => ({ dx: h.x - mage.x, dy: h.y - mage.y }));

        // Tween parabólico para el Caballero (va hacia la posición del Mago, con arco hacia abajo)
        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration,
            ease: 'Linear',
            onUpdate: (tween) => {
                const t = tween.getValue();
                // movimiento lineal
                knight.x = Phaser.Math.Interpolation.Linear([knightPos.x, magePos.x], t);
                knight.y = Phaser.Math.Interpolation.Linear([knightPos.y, magePos.y], t) + (4 * maxHeight * t * (t - 1)); // parábola hacia abajo

                // actualizar corazones del Caballero
                knightHearts.forEach((h, idx) => {
                    const off = knightHeartOffsets[idx];
                    h.x = knight.x + off.dx;
                    h.y = knight.y + off.dy;
                });
            }
        });

        // Tween parabólico para el Mago (va hacia la posición del Caballero, con arco hacia arriba)
        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration,
            ease: 'Linear',
            onUpdate: (tween) => {
                const t = tween.getValue();
                // movimiento lineal
                mage.x = Phaser.Math.Interpolation.Linear([magePos.x, knightPos.x], t);
                // parábola invertida (hacia arriba) -> invertimos el signo del offset
                mage.y = Phaser.Math.Interpolation.Linear([magePos.y, knightPos.y], t) - (4 * maxHeight * t * (t - 1));

                // actualizar corazones del Mago
                mageHearts.forEach((h, idx) => {
                    const off = mageHeartOffsets[idx];
                    h.x = mage.x + off.dx;
                    h.y = mage.y + off.dy;
                });
            }
        });

        // Esperar a que termine la animación y terminar turno
        this.time.delayedCall(duration + 100, () => {
            this.endPlayerTurn();
        });
    }

    // === TERMINAR TURNO DEL JUGADOR ===
    // Limpia el menú y cambia a turno de enemigos
    endPlayerTurn() {
        // Limpiar todos los elementos temporales de UI
        this.removeTemporaryMenus();

        // Verificar si todos los enemigos fueron derrotados
        if (this.enemyParty.every(e => e.dead)) {
            this.handleVictory();
            return;
        }

        // Cambiar a turno de enemigos
        this.gameState.currentTurn = 'enemy';
        this.turnIndicator.setFillStyle(0x0000FF); // Cambiar indicador a azul
        this.turnIndicatorText.setText('ENEMY');
        // Ocultar menú
        this.menuTexts.forEach(t => t.setVisible(false));
        this.turnInfoText.setVisible(false);

        // Esperar y luego ejecutar turno de enemigos
        this.time.delayedCall(1500, () => {
            this.handleEnemyTurn();
        });
    }

    // === TURNO DE ENEMIGOS ===
    // Un enemigo aleatorio ataca al personaje controlado del jugador
    handleEnemyTurn() {
        // Obtener lista de enemigos vivos
        const aliveEnemies = this.enemyParty.filter(e => !e.dead);

        // Si no hay enemigos vivos, el jugador ganó
        if (aliveEnemies.length === 0) {
            this.handleVictory();
            return;
        }

        // Seleccionar un enemigo aleatorio para atacar
        const attacker = Phaser.Utils.Array.GetRandom(aliveEnemies);
        
        // El objetivo es siempre el personaje controlado actualmente por el jugador
        const target = this.playerParty[this.gameState.currentCharacter];
        
        // Guardar posición original del atacante
        const originalX = attacker.sprite.x;
        const originalY = attacker.sprite.y;
        
        // Marcar este enemigo como el atacante actual
        attacker.isAttacking = true;
        
        // Verificar si es un ojo murciélago para usar vuelo diferente
        if (this.enemyType === 'ojoMurcielago') {
            // === MOVIMIENTO DE VUELO PARA OJO MURCIÉLAGO (arriba hacia abajo) ===
            const targetX = target.sprite.x + 150; // Más a la derecha, no encima
            const targetY = target.sprite.y;
            const movementDuration = 600; // 600ms de ida, ataque, 600ms de regreso
            
            // Fase 1: Bajar desde posición inicial hacia el objetivo
            this.tweens.add({
                targets: attacker.sprite,
                x: targetX,
                y: targetY,
                duration: movementDuration,
                ease: 'Linear',
                onComplete: () => {
                    // Esperar 1 segundo antes de atacar
                    this.time.delayedCall(1000, () => {
                        const damage = this.enemyType === 'slime' ? 10 : 15;
                        target.hp = Math.max(0, target.hp - damage);
                        this.sound.play('HitJugador');
                        this.shakeSprite(target.sprite);

                        this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
                            font: '20px Arial',
                            fill: '#FF0000'
                        }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

                        this.updateHPDisplay(target);

                        if (target.hp <= 0) {
                            target.dead = true;
                            if (this.playerParty.every(p => p.dead)) {
                                this.handleDefeat();
                                return;
                            }
                        }

                        // Fase 2: Volar hacia arriba y regresar a posición original
                        this.tweens.add({
                            targets: attacker.sprite,
                            x: originalX,
                            y: originalY,
                            duration: movementDuration,
                            ease: 'Linear',
                            onComplete: () => {
                                attacker.isAttacking = false;
                                this.gameState.currentTurn = 'player';
                                this.turnIndicator.setFillStyle(0xFF0000);
                                this.turnIndicatorText.setText('PLAYER');
                                this.menuTexts.forEach(t => t.setVisible(true));
                                this.turnInfoText.setVisible(true);
                                this.turnInfoText.setText(`${this.playerParty[this.gameState.currentCharacter].name}'s Turn`);
                                this.selectedMenuOption = 0;
                                this.updateMenuHighlight();

                                this.time.delayedCall(1500, () => {
                                    this.children.list.forEach(child => {
                                        if (child.getData('floatingText')) child.destroy();
                                    });
                                });
                            }
                        });
                    });
                }
            });
        } else {
            // === SALTO PARABÓLICO PARA SLIME (comportamiento original) ===
            const targetX = target.sprite.x + 150;
            const targetY = target.sprite.y;
            const maxHeight = 150;
            const distanceX = targetX - originalX;
            const distanceY = targetY - originalY;
            const jumpDuration = 400;

            this.tweens.add({
                targets: { progress: 0 },
                progress: 1,
                duration: jumpDuration,
                ease: 'Linear',
                onUpdate: (tween) => {
                    const t = tween.progress;
                    const heightOffset = 4 * maxHeight * t * (t - 1);
                    
                    attacker.sprite.x = originalX + distanceX * t;
                    attacker.sprite.y = originalY + distanceY * t + heightOffset;
                },
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        const damage = this.enemyType === 'slime' ? 10 : 15;
                        target.hp = Math.max(0, target.hp - damage);
                        this.sound.play('HitJugador');
                        this.shakeSprite(target.sprite);

                        this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
                            font: '20px Arial',
                            fill: '#FF0000'
                        }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

                        this.updateHPDisplay(target);

                        if (target.hp <= 0) {
                            target.dead = true;
                            if (this.playerParty.every(p => p.dead)) {
                                this.handleDefeat();
                                return;
                            }
                        }

                        this.tweens.add({
                            targets: { progress: 0 },
                            progress: 1,
                            duration: jumpDuration,
                            ease: 'Linear',
                            onUpdate: (tween) => {
                                const t = tween.progress;
                                const heightOffset = 4 * maxHeight * t * (t - 1);
                                
                                attacker.sprite.x = targetX - distanceX * t;
                                attacker.sprite.y = targetY - distanceY * t + heightOffset;
                            },
                            onComplete: () => {
                                attacker.isAttacking = false;
                                this.gameState.currentTurn = 'player';
                                this.turnIndicator.setFillStyle(0xFF0000);
                                this.turnIndicatorText.setText('PLAYER');
                                this.menuTexts.forEach(t => t.setVisible(true));
                                this.turnInfoText.setVisible(true);
                                this.turnInfoText.setText(`${this.playerParty[this.gameState.currentCharacter].name}'s Turn`);
                                this.selectedMenuOption = 0;
                                this.updateMenuHighlight();

                                this.time.delayedCall(1500, () => {
                                    this.children.list.forEach(child => {
                                        if (child.getData('floatingText')) child.destroy();
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
    }

    // === ACTUALIZAR BARRAS DE VIDA ===
    // Sincroniza todas las barras de vida visual con los datos de HP actuales
    // Escala las barras según (hp/maxHp) y actualiza el texto de HP mostrado
    updateHPDisplay(entity) {

        const HEART_VALUE = 10;
    
        const totalHearts = Math.ceil(entity.maxHp / HEART_VALUE);
        const heartsToShow = Math.ceil(entity.hp / HEART_VALUE);
    
        entity.hearts.forEach((heart, index) => {
    
            const hpForThisHeart = entity.hp - (index * HEART_VALUE);
    
            if (hpForThisHeart >= HEART_VALUE) {
                heart.setAlpha(1); // lleno
            } 
            else if (hpForThisHeart <= 0) {
                heart.setAlpha(0); // desaparece
            }
            else {
                // corazón incompleto → transparencia proporcional
                const percent = hpForThisHeart / HEART_VALUE;
                heart.setAlpha(percent);
            }
        });
    }
    

    // === MOSTRAR MENSAJE TEMPORAL ===
    // Muestra un mensaje de error o información durante 1.5 segundos
    // Útil para feedback al usuario (ej: "No healing left!", "No items available")
    showMessage(text) {
        // Crear texto rojo en la posición superior central
        const msg = this.add.text(425, 200, text, {
            font: '16px Arial',
            fill: '#FF0000'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('message', true);

        // Destruir automáticamente después de 1.5 segundos
        this.time.delayedCall(1500, () => msg.destroy());
    }

    // === LIMPIAR MENÚS TEMPORALES ===
    // Destruye todos los elementos de UI temporal creados durante batalla
    // Identifica y elimina elementos marcados con banderas de datos específicas
    removeTemporaryMenus() {
        this.children.list.forEach(child => {
            // Buscar elementos marcados como temporales con setData()
            if (child.getData('tempMenu') || 
                child.getData('targetSelector') || 
                child.getData('healSelector') || 
                child.getData('message') || 
                child.getData('floatingText')) {
                // Destruir el elemento
                child.destroy();
            }
        });
    }

    // === MANEJAR VICTORIA ===
    // Condición de victoria: todos los enemigos fueron derrotados (hp <= 0)
    // Otorga experiencia (50 XP), verifica subida de nivel, muestra pantalla de victoria
    handleVictory() {
        // Evitar ejecutar la lógica de victoria más de una vez
        if (this.gameState.battleOver) return;

        // Marcar batalla como finalizada
        this.gameState.battleOver = true;
        // Detener audio de batalla
        if (this.PeleaTuto) {
            this.PeleaTuto.stop();
        }
        // Reproducir audio de victoria
        this.sound.play('VictoriaFFVII');
        // Ocultar menú de batalla
        this.menuTexts.forEach(t => t.setVisible(false));
        this.turnInfoText.setVisible(false);

        // Calcular EXP ganada según tipo y cantidad de enemigos derrotados
        const enemyCount = this.enemyParty.length || 1;
        let xpPerEnemy = 50; // por defecto (comportamiento previo)
        if (this.enemyType === 'slime') xpPerEnemy = 15; // cada slime da 15 XP
        else if (this.enemyType === 'ojoMurcielago') xpPerEnemy = 20; // ojoMurcielago da 20 XP

        const totalXpGain = xpPerEnemy * enemyCount;

        // Otorgar experiencia a todos los aliados
        this.playerParty.forEach(char => {
            // Registrar estado previo para depuración
            console.log(`Before XP add - ${char.name}: xp=${char.xp}, xpToNextLevel=${char.xpToNextLevel}, level=${char.level}`);

            // Sumar XP calculada
            char.xp += totalXpGain;

            // Registrar estado posterior a la suma
            console.log(`After XP add - ${char.name}: xp=${char.xp}, xpToNextLevel=${char.xpToNextLevel}, level=${char.level}`);

            // Verificar que xpToNextLevel sea válido antes de comparar
            if (typeof char.xpToNextLevel === 'number' && char.xpToNextLevel > 0) {
                if (char.xp >= char.xpToNextLevel) {
                    console.log(`Level up triggered for ${char.name} (xp=${char.xp} >= ${char.xpToNextLevel})`);
                    this.levelUpCharacter(char);
                }
            } else {
                console.warn(`Invalid xpToNextLevel for ${char.name}:`, char.xpToNextLevel);
            }
        });

        // Mostrar pantalla de victoria con textos decorativos
        this.add.text(425, 250, 'VICTORY!', {
            font: '48px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10);

        this.add.text(425, 330, `You gained ${totalXpGain} XP!`, {
            font: '24px Arial',
            fill: '#00FF00'
        }).setOrigin(0.5, 0.5).setDepth(10);

        this.add.text(425, 400, 'Press ENTER to return', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5).setDepth(10);

        // Esperar a que el jugador presione ENTER para volver
        this.input.keyboard.once('keydown-ENTER', () => {
             // ⭐ MODIFICADO: Notificar a EscenaDebug y pasar el ID del enemigo derrotado
            this.scene.get('EscenaDebug').events.emit('victory', {
                targetEnemyId: this.targetEnemyId
            });
        });
    }

    // === SUBIDA DE NIVEL ===
    // Incrementa las estadísticas del personaje cuando alcanza suficiente experiencia
    // +20 maxHp, +1 level, XP requerido para siguiente nivel ×1.5, XP se resetea a 0
    levelUpCharacter(char) {
        // Incrementar nivel
        char.level++;

        // Aumentar maxHp en 5% y redondear hacia abajo
        char.maxHp = Math.max(1, Math.floor(char.maxHp * 1.05));

        // Aumentar ataque en 5% si existe
        if (typeof char.attack === 'number') {
            char.attack = Math.max(1, Math.floor(char.attack * 1.05));
        }

        // Restaurar HP completo al subir de nivel
        char.hp = char.maxHp;

        // Reiniciar usos a sus máximos configurados
        if (typeof char.maxNormalUses === 'number') char.normalAttackUses = char.maxNormalUses;
        if (typeof char.maxStrongUses === 'number') char.strongAttackUses = char.maxStrongUses;
        if (typeof char.maxHealUses === 'number') char.healUses = char.maxHealUses;

        // Aumentar XP requerido para siguiente nivel multiplicado por 1.5
        char.xpToNextLevel = Math.floor(char.xpToNextLevel * 1.5);

        // Resetear XP actual a 0 para empezar a acumular para siguiente nivel
        char.xp = 0;
    }

    // === MANEJAR DERROTA ===
    // Condición de derrota: ambos aliados fueron derrotados (hp <= 0)
    // Muestra pantalla de derrota y regresa a la escena de exploración (EscenaDebug)
    handleDefeat() {
        // Marcar batalla como finalizada
        this.gameState.battleOver = true;
        // Detener audio de batalla
        if (this.PeleaTuto) {
            this.PeleaTuto.stop();
        }
        // Ocultar menú de batalla
        this.menuTexts.forEach(t => t.setVisible(false));
        this.turnInfoText.setVisible(false);

        // Mostrar pantalla de derrota con textos
        this.add.text(425, 250, 'DEFEAT!', {
            font: '48px Arial',
            fill: '#FF0000'
        }).setOrigin(0.5, 0.5).setDepth(10);

        this.add.text(425, 330, 'You have been defeated...', {
            font: '24px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10);

        this.add.text(425, 400, 'Press ENTER to return', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5).setDepth(10);

        // Esperar a que el jugador presione ENTER para volver
        this.input.keyboard.once('keydown-ENTER', () => {
             //  Notificar a EscenaDebug, sin pasar ID de enemigo para destruir (Derrota)
            this.scene.get('EscenaDebug').events.emit('victory', {
                targetEnemyId: null 
            });
        });
    }

    // === RESETEAR CÁMARA ===
    // Asegura que la cámara vuelva a su estado inicial (zoom y posición)
    resetCamera(x, y, zoom) {
        this.cameras.main.setZoom(zoom);
        this.cameras.main.centerOn(x, y);
    }

    // === SACUDIDA LIGERA EN X ===
    // Efecto visual cuando un sprite recibe daño
    shakeSprite(sprite, distance = 10, duration = 150) {
        if (!sprite) return;
        const originalX = sprite.x;
        
        // Primera oscilación a la derecha
        this.tweens.add({
            targets: sprite,
            x: originalX + distance,
            duration: duration / 4,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Segunda oscilación a la izquierda
                this.tweens.add({
                    targets: sprite,
                    x: originalX - distance,
                    duration: duration / 2,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        // Tercera oscilación de regreso al centro
                        this.tweens.add({
                            targets: sprite,
                            x: originalX,
                            duration: duration / 4,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
            }
        });
    }

    // === POSICIONAR ANIMACIÓN DE ATAQUE MANUALMENTE ===
    // Usa: this.setAttackAnimPosition(x, y, relative = false)
    // Si relative=true, x/y serán offsets relativos al sprite atacante.
    setAttackAnimPosition(x, y, relative = false) {
        this.attackAnimPos = { x, y, relative };
    }

    // Quita la posición manual y vuelve al comportamiento por defecto (centrado en el atacante)
    clearAttackAnimPosition() {
        this.attackAnimPos = null;
    }

    // === AJUSTAR ESCALA DE LA ANIMACIÓN DE ATAQUE EN TIEMPO DE EJECUCIÓN ===
    // Llama: this.setAttackAnimScale(1.2) para aumentar, 0.8 para reducir, etc.
    setAttackAnimScale(scale) {
        if (typeof scale !== 'number' || !isFinite(scale) || scale <= 0) return;
        this.attackAnimScale = scale;
    }

    // Obtener la escala actual
    getAttackAnimScale() {
        return this.attackAnimScale;
    }


    
}

export default PeleaDebug;