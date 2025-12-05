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
        // Mago - animación de ataque
        this.load.atlas('magoataque', 'assets/Animaciones/Mago/magoataque.png', 'assets/Animaciones/Mago/magoataque_atlas.json');
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

        // Crear animación de ataque del Mago
        if (this.textures.exists('magoataque') && !this.anims.get('magoataque')) {
            const framesMA = this.textures.get('magoataque').getFrameNames();
            this.anims.create({
                key: 'magoataque',
                frames: framesMA.map(f => ({ key: 'magoataque', frame: f })),
                frameRate: 10,
                repeat: 0
            });
            console.log('Animación magoataque creada');
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
        const offsetY = -100;       // altura de la barra respecto al sprite
        const barWidth = 90;       // ancho total de la barra
        const barHeight = 12;      // alto de la barra

        // ======== ALIADOS ========
        this.playerParty.forEach(p => {
            // Crear un contenedor para la barra de vida
            const container = this.add.container(p.sprite.x, p.sprite.y + offsetY);

            // Fondo (gris)
            const bg = this.add.rectangle(-barWidth / 2, 0, barWidth, barHeight, 0x333333).setOrigin(0, 0.5);
            // Foreground (verde) que representará la vida restante
            const fgWidth = Math.max(0, Math.floor((p.hp / p.maxHp) * barWidth));
            const fg = this.add.rectangle(-barWidth / 2, 0, fgWidth, barHeight, 0x00cc00).setOrigin(0, 0.5);

            // Texto pequeño con HP actual
            const hpText = this.add.text(0, -barHeight - 6, `${p.hp}/${p.maxHp}`, { font: '12px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);

            container.add([bg, fg, hpText]);

            // Guardar referencias para futuras actualizaciones y animaciones
            p.hpBar = { container, bg, fg, hpText, width: barWidth, height: barHeight, offsetY };
        });

        // ======== ENEMIGOS ========
        this.enemyParty.forEach(e => {
            const container = this.add.container(e.sprite.x, e.sprite.y + offsetY);

            const bg = this.add.rectangle(-barWidth / 2, 0, barWidth, barHeight, 0x333333).setOrigin(0, 0.5);
            const fgWidth = Math.max(0, Math.floor((e.hp / e.maxHp) * barWidth));
            // Color distinto para enemigos
            const fg = this.add.rectangle(-barWidth / 2, 0, fgWidth, barHeight, 0x9933ff).setOrigin(0, 0.5);

            const hpText = this.add.text(0, -barHeight - 6, `${e.hp}/${e.maxHp}`, { font: '12px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);

            container.add([bg, fg, hpText]);

            e.hpBar = { container, bg, fg, hpText, width: barWidth, height: barHeight, offsetY };
        });
    }

    // === CREAR MENÚ DE ACCIONES (MOUSE-DRIVEN) ===
    // Crea botones interactivos en la esquina inferior derecha del personaje actual
    createMenuUI() {
        // Contenedor para el menú principal y submenús
        this.menuContainer = this.add.container(0, 0);
        this.menuContainer.setDepth(100);

        // Posición relativa a personaje actual (inferior-derecha)
        this.updateMenuPosition();

        // Mostrar menú principal al inicio del turno
        this.showMainMenu();
    }

    updateMenuPosition() {
        const current = this.playerParty[this.gameState.currentCharacter];
        if (current && current.sprite) {
            // Posicionar menú 150px a la derecha y 120px abajo del personaje
            this.menuXOffset = current.sprite.x - 150;
            this.menuYOffset = current.sprite.y + 120;
        }
    }

    // Actualiza el resaltado del menú principal (para compatibilidad con llamadas antiguas)
    updateMenuHighlight() {
        if (!this.menuContainer) return;
        // Asegurar que selectedMenuOption sea un índice válido
        const idx = (typeof this.selectedMenuOption === 'number') ? this.selectedMenuOption : 0;
        const children = this.menuContainer.list || [];
        children.forEach((child, i) => {
            // Aplicar ligero scale para resaltar la opción seleccionada
            if (typeof child.setScale === 'function') {
                this.tweens.add({
                    targets: child,
                    scale: (i === idx) ? 1.05 : 1,
                    duration: 120,
                    ease: 'Linear'
                });
            }
            // Si el child es un container con a text child, cambiar color del texto
            if (child.list && child.list.length) {
                child.list.forEach(inner => {
                    if (inner.type === 'Text') {
                        if (typeof inner.setStyle === 'function') {
                            inner.setStyle({ color: (i === idx) ? '#ffff00' : '#ffffff' });
                        } else if (typeof inner.setColor === 'function') {
                            inner.setColor((i === idx) ? '#ffff00' : '#ffffff');
                        }
                    }
                });
            }
        });
    }

    showMainMenu() {
        // Asegurar que el contenedor esté visible y completamente opaco
        if (this.menuContainer) {
            this.menuContainer.setVisible(true);
            this.menuContainer.setAlpha(1);
            this.menuContainer.removeAll(true);
        }
        this.currentMenu = 'main';
        this.updateMenuPosition();

        const buttonHeight = 50;
        const buttonWidth = 120;
        let yOffset = 0;
        const buttons = [];

        // Botón ATTACK
        const attackBtn = this.createMenuButton('ATTACK', 0, yOffset, buttonWidth, buttonHeight, () => this.showAttackSubmenu());
        attackBtn.setAlpha(0);
        attackBtn.setScale(0.8);
        this.menuContainer.add(attackBtn);
        buttons.push(attackBtn);
        yOffset += buttonHeight + 10;

        // Botón ITEMS
        const itemsBtn = this.createMenuButton('ITEMS', 0, yOffset, buttonWidth, buttonHeight, () => this.showItemsSubmenu());
        itemsBtn.setAlpha(0);
        itemsBtn.setScale(0.8);
        this.menuContainer.add(itemsBtn);
        buttons.push(itemsBtn);
        yOffset += buttonHeight + 10;

        // Botón CHANGE (en línea separada)
        const changeBtn = this.createMenuButton('CHANGE', 0, yOffset, buttonWidth, buttonHeight, () => this.changeCharacter());
        changeBtn.setAlpha(0);
        changeBtn.setScale(0.8);
        this.menuContainer.add(changeBtn);
        buttons.push(changeBtn);

        // Animar entrada de botones con stagger
        buttons.forEach((btn, idx) => {
            this.tweens.add({
                targets: btn,
                alpha: 1,
                scale: 1,
                duration: 300,
                delay: idx * 100,
                ease: 'Back.out'
            });
        });
    }

    showAttackSubmenu() {
        // Animar salida del menú anterior
        this.menuContainer.removeAll(true);
        this.currentMenu = 'attack';

        const current = this.playerParty[this.gameState.currentCharacter];
        const buttonHeight = 50;
        const buttonWidth = 150;
        let yOffset = 0;
        const buttons = [];

        // Definir ataques según el tipo de personaje
        const attacks = current.type === 'knight'
            ? [
                { name: `Normal (${current.normalAttackUses}/${current.maxNormalUses})`, type: 'normal', damage: current.attack },
                { name: `Strong (${current.strongAttackUses}/${current.maxStrongUses})`, type: 'strong', damage: Math.floor(current.attack * 2) }
            ]
            : [
                { name: `Spell (${current.normalAttackUses}/${current.maxNormalUses})`, type: 'spell', damage: current.attack },
                { name: `Heal (${current.healUses}/${current.maxHealUses})`, type: 'heal', healing: 40 }
            ];

        // Crear botones de ataque con animación
        attacks.forEach((attack, idx) => {
            const btn = this.createMenuButton(attack.name, 0, yOffset, buttonWidth, buttonHeight, () => {
                if (attack.type === 'heal') {
                    this.selectCharacterToHeal();
                } else {
                    this.selectEnemyTarget(attack);
                }
            });
            btn.setAlpha(0);
            btn.setScale(0.8);
            this.menuContainer.add(btn);
            buttons.push(btn);
            yOffset += buttonHeight + 10;
        });

        // Botón BACK
        const backBtn = this.createMenuButton('BACK', 0, yOffset, buttonWidth, buttonHeight, () => this.showMainMenu());
        backBtn.setAlpha(0);
        backBtn.setScale(0.8);
        this.menuContainer.add(backBtn);
        buttons.push(backBtn);

        // Animar entrada de botones con stagger
        buttons.forEach((btn, idx) => {
            this.tweens.add({
                targets: btn,
                alpha: 1,
                scale: 1,
                duration: 300,
                delay: idx * 80,
                ease: 'Back.out'
            });
        });
    }

    showItemsSubmenu() {
        this.menuContainer.removeAll(true);
        this.currentMenu = 'items';

        const inventarioScene = this.scene.get('InventarioScene');
        const inventario = inventarioScene ? (inventarioScene.inventario || {}) : {};
        const buttonHeight = 50;
        const buttonWidth = 150;
        let yOffset = 0;
        const buttons = [];

        // Listar items disponibles
        let hasItems = false;
        if (inventario.potion && inventario.potion > 0) {
            hasItems = true;
            const btn = this.createMenuButton(`Poción (${inventario.potion})`, 0, yOffset, buttonWidth, buttonHeight, () => {
                // Usar la poción directamente sobre el personaje actualmente seleccionado
                const current = this.playerParty[this.gameState.currentCharacter];
                if (!current) return;
                // Si no necesita curación, mostrar mensaje y volver al menú
                if (current.hp >= current.maxHp) {
                    this.showMessage('No necesita curación!');
                    this.time.delayedCall(1000, () => this.showMainMenu());
                    return;
                }

                // Cerrar menú con pequeña animación y usar la poción
                this.removeTemporaryMenus();
                if (this.menuContainer) {
                    this.tweens.add({
                        targets: this.menuContainer,
                        alpha: 0,
                        duration: 200,
                        ease: 'Linear',
                        onComplete: () => {
                            this.menuContainer.setVisible(false);
                            this.usePotion(current);
                        }
                    });
                } else {
                    this.usePotion(current);
                }
            });
            btn.setAlpha(0);
            btn.setScale(0.8);
            this.menuContainer.add(btn);
            buttons.push(btn);
            yOffset += buttonHeight + 10;
        }

        // Poción de maná (otorga +3 usos al Mago hasta su máximo)
        if (inventario.manaPotion && inventario.manaPotion > 0) {
            hasItems = true;
            const btnMana = this.createMenuButton(`Maná (${inventario.manaPotion})`, 0, yOffset, buttonWidth, buttonHeight, () => {
                // Encontrar al Mago en la party
                const mage = this.playerParty.find(p => p.type === 'mage' || (p.name && p.name.toLowerCase().includes('mago')));
                if (!mage) {
                    this.showMessage('No hay Mago en el grupo!');
                    this.time.delayedCall(1000, () => this.showMainMenu());
                    return;
                }

                const manaAmount = (this.scene.get('InventarioScene') && this.scene.get('InventarioScene').itemsData.manaPotion && this.scene.get('InventarioScene').itemsData.manaPotion.manaAmount) ? this.scene.get('InventarioScene').itemsData.manaPotion.manaAmount : 3;
                const currentUses = Number.isFinite(mage.normalAttackUses) ? mage.normalAttackUses : 0;
                const maxUses = Number.isFinite(mage.maxNormalUses) ? mage.maxNormalUses : currentUses;
                const possibleGain = Math.max(0, Math.min(manaAmount, maxUses - currentUses));

                if (possibleGain <= 0) {
                    this.showMessage('El Mago ya tiene usos completos');
                    this.time.delayedCall(1000, () => this.showMainMenu());
                    return;
                }

                // Cerrar menú y aplicar el efecto
                this.removeTemporaryMenus();
                if (this.menuContainer) {
                    this.tweens.add({
                        targets: this.menuContainer,
                        alpha: 0,
                        duration: 200,
                        ease: 'Linear',
                        onComplete: () => {
                            this.menuContainer.setVisible(false);
                            // Aplicar en inventario
                            if (inventarioScene && inventarioScene.inventario) {
                                inventarioScene.inventario.manaPotion--;
                            }
                            // Aplicar al Mago en combate
                            mage.normalAttackUses = currentUses + possibleGain;
                            // Sincronizar registry para otras escenas
                            this.registry.set('playerParty', this.playerParty);

                            // Mostrar feedback sobre el Mago
                            this.add.text(mage.sprite.x, mage.sprite.y - 60, `+${possibleGain} usos`, { font: '18px Arial', fill: '#00FF00' }).setOrigin(0.5).setDepth(10).setData('floatingText', true);

                            // Esperar y terminar el turno
                            this.time.delayedCall(1000, () => {
                                this.updateMenuPosition();
                                this.endPlayerTurn();
                            });
                        }
                    });
                } else {
                    if (inventarioScene && inventarioScene.inventario) {
                        inventarioScene.inventario.manaPotion--;
                    }
                    mage.normalAttackUses = currentUses + possibleGain;
                    this.registry.set('playerParty', this.playerParty);
                    this.add.text(mage.sprite.x, mage.sprite.y - 60, `+${possibleGain} usos`, { font: '18px Arial', fill: '#00FF00' }).setOrigin(0.5).setDepth(10).setData('floatingText', true);
                    this.time.delayedCall(1000, () => this.endPlayerTurn());
                }
            });
            btnMana.setAlpha(0);
            btnMana.setScale(0.8);
            this.menuContainer.add(btnMana);
            buttons.push(btnMana);
            yOffset += buttonHeight + 10;
        }

        // Si no hay items
        if (!hasItems) {
            const text = this.add.text(this.menuXOffset, this.menuYOffset + yOffset, '(No items)', {
                font: '14px Arial',
                fill: '#999999'
            }).setOrigin(0.5, 0.5);
            text.setAlpha(0);
            this.menuContainer.add(text);
            this.tweens.add({
                targets: text,
                alpha: 1,
                duration: 300,
                ease: 'Linear'
            });
            yOffset += 50;
        }

        // Botón BACK
        const backBtn = this.createMenuButton('BACK', 0, yOffset, buttonWidth, buttonHeight, () => this.showMainMenu());
        backBtn.setAlpha(0);
        backBtn.setScale(0.8);
        this.menuContainer.add(backBtn);
        buttons.push(backBtn);

        // Animar entrada de botones
        buttons.forEach((btn, idx) => {
            this.tweens.add({
                targets: btn,
                alpha: 1,
                scale: 1,
                duration: 300,
                delay: idx * 80,
                ease: 'Back.out'
            });
        });
    }

    createMenuButton(text, x, y, width, height, onClickCallback) {
        const container = this.add.container(this.menuXOffset + x, this.menuYOffset + y);

        // Fondo del botón
        const bg = this.add.rectangle(0, 0, width, height, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0xcccccc);

        // Texto del botón
        const label = this.add.text(0, 0, text, {
            font: '14px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        container.add([bg, label]);
        container.setSize(width, height);
        container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

        // Hover effect
        container.on('pointerover', () => {
            bg.setFillStyle(0x555555, 0.95);
            label.setFill('#FFFF00');
        });

        container.on('pointerout', () => {
            bg.setFillStyle(0x333333, 0.9);
            label.setFill('#ffffff');
        });

        // Click handler
        container.on('pointerdown', onClickCallback);

        return container;
    }

    // === LOOP PRINCIPAL DE ACTUALIZACIÓN ===
    // Se ejecuta cada frame para procesar entrada del jugador
    update() {
        if (this.gameState.battleOver) return; // Si la batalla terminó, no hacer nada
        // El menú ahora es controlado por mouse, no por teclado
    }

    // showAttackMenu() ahora es showAttackSubmenu() (ver createMenuUI)

    // === SELECCIONAR ENEMIGO OBJETIVO ===
    selectEnemyTarget(attack) {
        // Animar menú hacia afuera
        if (this.menuContainer) {
            this.tweens.add({
                targets: this.menuContainer,
                alpha: 0,
                duration: 200,
                ease: 'Linear',
                onComplete: () => {
                    this.menuContainer.setVisible(false);
                }
            });
        }
        
        // Get alive enemies
        const aliveEnemies = this.enemyParty.filter(e => !e.dead);
        if (aliveEnemies.length === 0) {
            this.endPlayerTurn();
            return;
        }

        this.removeTemporaryMenus();
        this.targetSelectionActive = true;
        this.selectedEnemyIndex = 0; // Índice del enemigo seleccionado

        // Mostrar instrucción
        const instructionText = this.add.text(425, 150, 'Selecciona enemigo: ← → y ENTER', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);

        // Crear Graphics para dibujar un recuadro de selección (contorno)
        const selectionGraphics = this.add.graphics();
        selectionGraphics.setDepth(110);
        selectionGraphics.setData('tempMenu', true);

        // Función para actualizar dibujo del recuadro centrado en el sprite enemigo
        const updateSelectionBox = () => {
            selectionGraphics.clear();
            const enemy = aliveEnemies[this.selectedEnemyIndex];
            if (!enemy || !enemy.sprite) return;
            // Usar displayWidth/Height para respetar el scale del sprite
            const w = enemy.sprite.displayWidth || (enemy.sprite.width * enemy.sprite.scaleX) || 130;
            const h = enemy.sprite.displayHeight || (enemy.sprite.height * enemy.sprite.scaleY) || 130;
            const x = enemy.sprite.x - w / 2;
            const y = enemy.sprite.y - h / 2;
            selectionGraphics.lineStyle(3, 0xFF0000, 1);
            selectionGraphics.strokeRect(x, y, w, h);
        };

        updateSelectionBox();

        // Manejar entrada por teclado
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                this.selectedEnemyIndex = (this.selectedEnemyIndex - 1 + aliveEnemies.length) % aliveEnemies.length;
                updateSelectionBox();
            } else if (event.key === 'ArrowRight') {
                this.selectedEnemyIndex = (this.selectedEnemyIndex + 1) % aliveEnemies.length;
                updateSelectionBox();
            } else if (event.key === 'Enter') {
                this.input.keyboard.off('keydown', handleKeyDown);
                this.removeTemporaryMenus();
                this.targetSelectionActive = false;

                // Execute attack and let performAttack end the turn
                this.performAttack(attack, aliveEnemies[this.selectedEnemyIndex]);
            }
        };

        this.input.keyboard.on('keydown', handleKeyDown);
    }

    // displayEnemyTargets() ya no se usa - reemplazado por selectEnemyTarget con recuadro visual

    // === EJECUTAR EL ATAQUE ===
    // Calcula el daño, lo aplica al objetivo y muestra la animación de daño
    performAttack(attack, target, onComplete = null) {
        // Evitar ataques concurrentes que puedan aplicar daño doble
        if (this._attackInProgress) return;

        const attacker = this.playerParty[this.gameState.currentCharacter];

        // Validar que el ataque tenga usos disponibles
        if (attack.type === 'normal' && attacker.normalAttackUses <= 0) {
            this.showMessage('No uses left!');
            // Ocultar el menú mientras se muestra el mensaje y limpiar elementos temporales
            this.removeTemporaryMenus();
            if (this.menuContainer) this.menuContainer.setVisible(false);
            this.gameState.inMenu = false;
            // Restaurar menú después de que el mensaje desaparezca
            this.time.delayedCall(1600, () => {
                if (this.menuContainer) this.menuContainer.setVisible(true);
                this.gameState.inMenu = true;
            });
            return;
        }

        if (attack.type === 'strong' && attacker.strongAttackUses <= 0) {
            this.showMessage('No uses left!');
            this.removeTemporaryMenus();
            if (this.menuContainer) this.menuContainer.setVisible(false);
            this.gameState.inMenu = false;
            this.time.delayedCall(1600, () => {
                if (this.menuContainer) this.menuContainer.setVisible(true);
                this.gameState.inMenu = true;
            });
            return;
        }

        // Marca que un ataque está en progreso (limpia al terminar el turno)
        this._attackInProgress = true;

        // Si es el Mago, ejecutar ataque sin salto de ida
        if (attacker.type === 'mage' && this.anims.exists('magoataque')) {
            // === COMPORTAMIENTO DEL MAGO: Reproducir animación magoataque SIN salto ===
            console.log('Ejecutando ataque del Mago (sin salto)');
            
            // Guardar sprite original
            const originalSprite = attacker.sprite;
            originalSprite.setVisible(false);
            
            // Crear sprite de animación del Mago en su posición actual
            const animSprite = this.add.sprite(originalSprite.x, originalSprite.y, 'magoataque')
                .setScale(originalSprite.scaleX, originalSprite.scaleY)
                .setOrigin(originalSprite.originX, originalSprite.originY)
                .setDepth(originalSprite.depth);
            
            animSprite.play({ key: 'magoataque', repeat: 0 });
            
            // Obtener duración de la animación
            const anim = this.anims.get('magoataque');
            let durationMs = 700; // fallback
            if (anim && anim.frames && anim.frameRate) {
                durationMs = (anim.frames.length / anim.frameRate) * 1000;
            }
            
            // Aplicar daño al ~50% de la animación
            this.time.delayedCall(Math.floor(durationMs * 0.5), () => {
                let damage;
                if (Number.isFinite(attack.damage)) {
                    damage = attack.damage;
                } else {
                    if (attack.type === 'normal') damage = attacker.attack;
                    else if (attack.type === 'strong') damage = Math.floor(attacker.attack * 2);
                    else if (attack.type === 'spell') damage = attacker.attack;
                    else damage = attacker.attack;
                }
                
                target.hp = Math.max(0, target.hp - damage);
                
                // Decrementar usos según tipo de ataque
                if (attack.type === 'normal') attacker.normalAttackUses--;
                else if (attack.type === 'strong') attacker.strongAttackUses--;
                else if (attack.type === 'spell') attacker.normalAttackUses--;
                
                this.shakeSprite(target.sprite);
                this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
                    font: '20px Arial',
                    fill: '#FF0000'
                }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);
                
                if (target.hp <= 0) target.dead = true;
                this.updateHPDisplay(target);
            });
            
            // Cuando termine la animación, destruir sprite temporal
            animSprite.once('animationcomplete-magoataque', () => {
                animSprite.destroy();
                originalSprite.setVisible(true);
                
                this._attackInProgress = false;
                if (onComplete) {
                    onComplete();
                } else {
                    this.endPlayerTurn();
                }
            });
            return; // Salir de performAttack para el Mago
        }

        // === ANIMAR SALTO PARABÓLICO DEL ATACANTE HACIA EL ENEMIGO (para Caballero y otros) ===
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
        
        // Punto medio entre el atacante y el enemigo (donde enfocarse), desplazado más a la derecha
        const focusX = (originalX + targetX) / 2 + 300; // +150 para mover más a la derecha
        const focusY = (originalY + targetY) / 2 - 150; // -150 para mover más arriba

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
                const targetZoom = initialZoom + (1 * t); // zoom de inicial a inicial+0.3
                
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

                        // Aplicar daño y sonido antes (al ~20% de la animación)
                        this.time.delayedCall(Math.floor(durationMs * 0.2), () => {
                            // Usar `attack.damage` si fue provisto, si no calcular según el tipo
                            let damage;
                            if (Number.isFinite(attack.damage)) {
                                damage = attack.damage;
                            } else {
                                if (attack.type === 'normal') damage = attacker.attack;
                                else if (attack.type === 'strong') damage = Math.floor(attacker.attack * 2);
                                else if (attack.type === 'spell') damage = attacker.attack;
                                else damage = attacker.attack;
                            }

                            target.hp = Math.max(0, target.hp - damage);

                            // Decrementar usos según tipo de ataque
                            if (attack.type === 'normal') attacker.normalAttackUses--;
                            else if (attack.type === 'strong') attacker.strongAttackUses--;
                            else if (attack.type === 'spell') attacker.normalAttackUses--;

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
                                ease: 'Sine.easeInOut',
                                onUpdate: (tween) => {
                                    const t = tween.progress; // Valor de 0 a 1
                                    const heightOffset = 4 * maxHeight * t * (t - 1);
                                    attacker.sprite.x = targetX - distanceX * t;
                                    attacker.sprite.y = targetY - distanceY * t + heightOffset;
                                    
                                    // La cámara regresa gradualmente a la posición y zoom iniciales
                                    const maxZoomReached = initialZoom + 1; // debe coincidir con el zoom máximo del salto de ida
                                    const remainingZoom = maxZoomReached - (1 * t); // regresa suavemente desde maxZoom a initialZoom
                                    
                                    this.cameras.main.setZoom(remainingZoom);
                                    // Interpolar entre el punto de enfoque y la posición inicial
                                    const cameraX = focusX - (focusX - initialCameraX) * t;
                                    const cameraY = focusY - (focusY - initialCameraY) * t;
                                    this.cameras.main.centerOn(cameraX, cameraY);
                                },
                                onComplete: () => {
                                    // Restaurar cámara a su estado original de forma garantizada
                                    this.resetCamera(initialCameraX, initialCameraY, initialZoom);
                                    // Limpiar bandera de ataque antes de terminar el turno
                                    this._attackInProgress = false;
                                    if (onComplete) {
                                        onComplete();
                                    } else {
                                        this.endPlayerTurn();
                                    }
                                }
                            });
                        });
                    } else {
                        // Comportamiento por defecto: aplicar daño inmediatamente y volver
                        // Usar `attack.damage` si fue provisto, si no calcular según el tipo
                        let damage;
                        if (Number.isFinite(attack.damage)) {
                            damage = attack.damage;
                        } else {
                            if (attack.type === 'normal') damage = attacker.attack;
                            else if (attack.type === 'strong') damage = Math.floor(attacker.attack * 2);
                            else if (attack.type === 'spell') damage = attacker.attack;
                            else damage = attacker.attack;
                        }

                        target.hp = Math.max(0, target.hp - damage);

                        // Decrementar usos según tipo de ataque
                        if (attack.type === 'normal') attacker.normalAttackUses--;
                        else if (attack.type === 'strong') attacker.strongAttackUses--;
                        else if (attack.type === 'spell') attacker.normalAttackUses--;

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
                            ease: 'Sine.easeInOut',
                            onUpdate: (tween) => {
                                const t = tween.progress; // Valor de 0 a 1
                                const heightOffset = 4 * maxHeight * t * (t - 1);
                                attacker.sprite.x = targetX - distanceX * t;
                                attacker.sprite.y = targetY - distanceY * t + heightOffset;
                                
                                // La cámara regresa gradualmente a la posición y zoom iniciales
                                const maxZoomReached = initialZoom + 1; // debe coincidir con el zoom máximo del salto de ida
                                const remainingZoom = maxZoomReached - (1 * t); // regresa suavemente desde maxZoom a initialZoom
                                
                                this.cameras.main.setZoom(remainingZoom);
                                // Interpolar entre el punto de enfoque y la posición inicial
                                const cameraX = focusX - (focusX - initialCameraX) * t;
                                const cameraY = focusY - (focusY - initialCameraY) * t;
                                this.cameras.main.centerOn(cameraX, cameraY);
                            },
                            onComplete: () => {
                                // Restaurar cámara a su estado original de forma garantizada
                                this.resetCamera(initialCameraX, initialCameraY, initialZoom);
                                // Limpiar bandera de ataque antes de terminar el turno
                                this._attackInProgress = false;
                                if (onComplete) {
                                    onComplete();
                                } else {
                                    this.endPlayerTurn();
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    selectCharacterToHeal() {
        // Animar menú hacia afuera
        if (this.menuContainer) {
            this.tweens.add({
                targets: this.menuContainer,
                alpha: 0,
                duration: 200,
                ease: 'Linear',
                onComplete: () => {
                    this.menuContainer.setVisible(false);
                }
            });
        }
        
        const aliveAllies = this.playerParty.filter(p => p.hp > 0);
        
        this.removeTemporaryMenus();
        this.targetSelectionActive = true;
        this.selectedAllyIndex = 0;

        this.add.text(425, 150, 'Selecciona aliado a curar: ← → y ENTER', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);

        // Crear recuadro de selección
        const selectionBox = this.add.rectangle(0, 0, 130, 140, 0x00FF00, 0);
        selectionBox.setStrokeStyle(3, 0x00FF00);
        selectionBox.setDepth(102);
        selectionBox.setData('tempMenu', true);

        const updateSelectionBox = () => {
            const ally = aliveAllies[this.selectedAllyIndex];
            selectionBox.setPosition(ally.sprite.x, ally.sprite.y);
        };

        updateSelectionBox();

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                this.selectedAllyIndex = (this.selectedAllyIndex - 1 + aliveAllies.length) % aliveAllies.length;
                updateSelectionBox();
            } else if (event.key === 'ArrowRight') {
                this.selectedAllyIndex = (this.selectedAllyIndex + 1) % aliveAllies.length;
                updateSelectionBox();
            } else if (event.key === 'Enter') {
                this.input.keyboard.off('keydown', handleKeyDown);
                this.removeTemporaryMenus();
                this.targetSelectionActive = false;
                this.performHeal(aliveAllies[this.selectedAllyIndex]);
                // performHeal ya llama a endPlayerTurn() después de 1 segundo
            }
        };

        this.input.keyboard.on('keydown', handleKeyDown);
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
    // Mostrar y permitir uso de ítems (actualmente solo poción)
    showItemsMenu() {
        this.removeTemporaryMenus();

        // Obtener inventario desde la escena InventarioScene
        const inventarioScene = this.scene.get('InventarioScene');
        if (!inventarioScene) {
            this.showMessage('No inventory available!');
            this.time.delayedCall(1500, () => this.endPlayerTurn());
            return;
        }

        // Filtrar solo items que tenemos (cantidad > 0) y que podemos usar en batalla
        const availableItems = [];
        const inventario = inventarioScene.inventario || {};
        
        if (inventario.potion && inventario.potion > 0) {
            availableItems.push({ key: 'potion', cantidad: inventario.potion, nombre: 'Poción de Vida' });
        }

        // Si no hay items disponibles
        if (availableItems.length === 0) {
            this.showMessage('No items available!');
            this.time.delayedCall(1500, () => this.endPlayerTurn());
            return;
        }

        // Mostrar opciones de items disponibles
        this.add.text(425, 150, 'Select Item:', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);

        availableItems.forEach((item, idx) => {
            this.add.text(425, 200 + idx * 40, `${idx + 1}: ${item.nombre} (${item.cantidad})`, {
                font: '14px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);
        });

        // Manejar la selección del item (presionar 1, 2, 3... etc)
        const handleItemSelection = (event) => {
            const choice = parseInt(event.key);
            if (choice >= 1 && choice <= availableItems.length) {
                this.input.keyboard.off('keydown', handleItemSelection);
                this.removeTemporaryMenus();

                const selected = availableItems[choice - 1];
                
                // Para pociones, siempre se usan en el equipo, así que seleccionar aliado a curar
                if (selected.key === 'potion') {
                    const current = this.playerParty[this.gameState.currentCharacter];
                    if (!current) {
                        this.showMessage('No hay objetivo válido!');
                        this.time.delayedCall(1000, () => this.endPlayerTurn());
                        return;
                    }
                    if (current.hp >= current.maxHp) {
                        this.showMessage('No necesita curación!');
                        this.time.delayedCall(1000, () => this.showMainMenu());
                        return;
                    }
                    this.usePotion(current);
                }
            }
        };

        this.input.keyboard.on('keydown', handleItemSelection);
    }

    // === SELECCIONAR ALIADO PARA USAR POCIÓN ===
    selectCharacterToUsePotion() {
        // Animar menú hacia afuera
        if (this.menuContainer) {
            this.tweens.add({
                targets: this.menuContainer,
                alpha: 0,
                duration: 200,
                ease: 'Linear',
                onComplete: () => {
                    this.menuContainer.setVisible(false);
                }
            });
        }
        
        const aliveAllies = this.playerParty.filter(p => p.hp > 0 && p.hp < p.maxHp);
        
        // Si no hay aliados vivos que necesiten curación
        if (aliveAllies.length === 0) {
            this.showMessage('No hay aliados que necesiten curación!');
            this.time.delayedCall(1500, () => this.endPlayerTurn());
            return;
        }

        this.removeTemporaryMenus();
        this.targetSelectionActive = true;
        this.selectedAllyIndex = 0;

        this.add.text(425, 150, 'Selecciona aliado a curar: ← → y ENTER', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('tempMenu', true);

        // Crear recuadro de selección
        const selectionBox = this.add.rectangle(0, 0, 130, 140, 0x00FF00, 0);
        selectionBox.setStrokeStyle(3, 0x00FF00);
        selectionBox.setDepth(102);
        selectionBox.setData('tempMenu', true);

        const updateSelectionBox = () => {
            const ally = aliveAllies[this.selectedAllyIndex];
            selectionBox.setPosition(ally.sprite.x, ally.sprite.y);
        };

        updateSelectionBox();

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                this.selectedAllyIndex = (this.selectedAllyIndex - 1 + aliveAllies.length) % aliveAllies.length;
                updateSelectionBox();
            } else if (event.key === 'ArrowRight') {
                this.selectedAllyIndex = (this.selectedAllyIndex + 1) % aliveAllies.length;
                updateSelectionBox();
            } else if (event.key === 'Enter') {
                this.input.keyboard.off('keydown', handleKeyDown);
                this.removeTemporaryMenus();
                this.targetSelectionActive = false;
                this.usePotion(aliveAllies[this.selectedAllyIndex]);
                // usePotion ya llama a endPlayerTurn() después de 1 segundo
            }
        };

        this.input.keyboard.on('keydown', handleKeyDown);
    }


    usePotion(target) {
        const inventarioScene = this.scene.get('InventarioScene');
        if (!inventarioScene || !inventarioScene.inventario.potion || inventarioScene.inventario.potion <= 0) {
            this.showMessage('Potion not available!');
            this.time.delayedCall(1500, () => this.endPlayerTurn());
            return;
        }

        const healAmount = 50;

        // Restaurar HP (sin exceder maxHp)
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        
        // Decrementar poción del inventario
        inventarioScene.inventario.potion--;

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

    // === CAMBIAR DE PERSONAJE ===
    // Intercambia entre Knight y Mage con una animación de intercambio de posiciones
    changeCharacter() {
        // Hide main menu while animating character swap
        if (this.menuContainer) this.menuContainer.setVisible(false);
        
        this.removeTemporaryMenus();
        // Rotar al siguiente personaje (0→1 o 1→0)
        this.gameState.currentCharacter = (this.gameState.currentCharacter + 1) % this.playerParty.length;

        // Animar intercambio de posiciones (sin rotación, solo movimiento Y)
        const knight = this.playerParty[0].sprite;
        const mage = this.playerParty[1].sprite;
        // Parámetros de la animación parabólica
        const duration = 600;
        const maxHeight = 120; // altura máxima de la parábola

        // Posiciones originales
        const knightPos = { x: knight.x, y: knight.y };
        const magePos = { x: mage.x, y: mage.y };

        // Preparar offsets relativos para las barras de vida (para seguir al sprite durante la animación)
        const knightHpBar = this.playerParty[0].hpBar || null;
        const mageHpBar = this.playerParty[1].hpBar || null;

        const knightHpBarOffset = knightHpBar ? { dx: knightHpBar.container.x - knight.x, dy: knightHpBar.container.y - knight.y } : { dx: 0, dy: 0 };
        const mageHpBarOffset = mageHpBar ? { dx: mageHpBar.container.x - mage.x, dy: mageHpBar.container.y - mage.y } : { dx: 0, dy: 0 };

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

                // actualizar barra de vida del Caballero
                if (knightHpBar && knightHpBar.container) {
                    knightHpBar.container.x = knight.x + knightHpBarOffset.dx;
                    knightHpBar.container.y = knight.y + knightHpBarOffset.dy;
                }
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

                // actualizar barra de vida del Mago
                if (mageHpBar && mageHpBar.container) {
                    mageHpBar.container.x = mage.x + mageHpBarOffset.dx;
                    mageHpBar.container.y = mage.y + mageHpBarOffset.dy;
                }
            }
        });

        // After animation completes, update menu position and show main menu
        this.time.delayedCall(duration + 100, () => {
            this.updateMenuPosition();
            this.showMainMenu();
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
        if (this.turnIndicatorText) this.turnIndicatorText.setText('ENEMY');
        // Ocultar menú
        if (this.menuContainer) this.menuContainer.setVisible(false);
        if (this.turnInfoText) this.turnInfoText.setVisible(false);

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

        // Determinar el tipo específico de este enemigo atacante
        const attackerEnemyKey = attacker.enemyKey || this.enemyKey;
        
        // Verificar si es un ojo murciélago para usar vuelo diferente
        if (attackerEnemyKey === 'ojoMurcielago') {
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
                        const damageMap = { slime: 10, ojoMurcielago: 15, gusano: 35 };
                        const damage = damageMap[attackerEnemyKey] || 10;
                        target.hp = Math.max(0, target.hp - damage);
                        if (attackerEnemyKey === 'gusano' && this.sound) {
                            this.sound.play('GusanoMordida');
                        } else if (this.sound) {
                            this.sound.play('HitJugador');
                        }
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
                                if (this.turnIndicatorText) this.turnIndicatorText.setText('PLAYER');
                                // Reconstruir y mostrar el menú en vez de solo reactivarlo
                                this.updateMenuPosition();
                                this.showMainMenu();
                                if (this.turnInfoText) {
                                    this.turnInfoText.setVisible(true);
                                    this.turnInfoText.setText(`${this.playerParty[this.gameState.currentCharacter].name}'s Turn`);
                                }
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
                        const damageMap = { slime: 10, ojoMurcielago: 15, gusano: 35 };
                        const damage = damageMap[attackerEnemyKey] || 10;
                        target.hp = Math.max(0, target.hp - damage);
                        if (attackerEnemyKey === 'gusano' && this.sound) {
                            this.sound.play('GusanoMordida');
                        } else if (this.sound) {
                            this.sound.play('HitJugador');
                        }
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
                                if (this.turnIndicatorText) this.turnIndicatorText.setText('PLAYER');
                                // Reconstruir y mostrar el menú en vez de solo reactivarlo
                                this.updateMenuPosition();
                                this.showMainMenu();
                                if (this.turnInfoText) {
                                    this.turnInfoText.setVisible(true);
                                    this.turnInfoText.setText(`${this.playerParty[this.gameState.currentCharacter].name}'s Turn`);
                                }
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
        // Actualiza la barra de vida asociada a la entidad (player o enemy)
        if (!entity || !entity.hpBar) return;

        const bar = entity.hpBar;
        const ratio = Phaser.Math.Clamp(entity.hp / entity.maxHp, 0, 1);
        const newWidth = Math.floor(bar.width * ratio);

        // Ajustar tamaño del rectángulo foreground
        if (bar.fg && typeof bar.fg.setSize === 'function') {
            bar.fg.setSize(Math.max(0, newWidth), bar.height);
            // Mantener el anclaje a la izquierda del fondo
            bar.fg.x = -bar.width / 2;
        } else if (bar.fg) {
            bar.fg.width = Math.max(0, newWidth);
            bar.fg.x = -bar.width / 2;
        }

        // Cambiar color según porcentaje (verde -> amarillo -> rojo)
        let color = 0x00cc00;
        if (ratio <= 0.25) color = 0xff3333;
        else if (ratio <= 0.5) color = 0xffcc00;
        if (bar.fg && typeof bar.fg.setFillStyle === 'function') bar.fg.setFillStyle(color);

        // Actualizar texto
        if (bar.hpText) bar.hpText.setText(`${entity.hp}/${entity.maxHp}`);

        // Si está muerto, indicar visualmente
        if (entity.hp <= 0) {
            if (bar.container) bar.container.setAlpha(0.5);
        } else {
            if (bar.container) bar.container.setAlpha(1);
        }
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
        if (this.menuContainer) this.menuContainer.setVisible(false);
        if (this.turnInfoText) this.turnInfoText.setVisible(false);

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
        if (this.menuContainer) this.menuContainer.setVisible(false);
        if (this.turnInfoText) this.turnInfoText.setVisible(false);

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