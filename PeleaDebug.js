class PeleaDebug extends Phaser.Scene {

    constructor() {
        super({ key: 'PeleaDebug' });
    }

    preload() {
        this.load.image("FondoPeleaUno", "assets/fondoPeleaUnuouoo.png");
        this.load.atlas('slime', 'assets/Animaciones/Mago/slimea.png', 'assets/Animaciones/Mago/slimea.json');
        this.load.atlas('ojomMurcielago', 'assets/Animaciones/Mago/ojoconcentracionanim.png', 'assets/Animaciones/Mago/ojoconcentracionanim.json'); // Asegurar precarga
        this.load.image("Mago_Right0", "assets/Animaciones/Mago/MRight_0.png");
        this.load.image("Caballero_Right0", "assets/Animaciones/Caballero/Right_0.png");
        this.load.atlas('corazon','assets/Animaciones/Mago/vidasjuego.png','assets/Animaciones/Mago/vidasjuego.json') 
        //Audios
        this.load.audio("PeleaTutorial", "assets/audio/FFVIIPeleaTutorial.mp3");

    }

    // Inicializar la escena de batalla con todos los personajes, enemigos y UI
    create(data) { 
       
        // === FONDO DE BATALLA ===
        this.add.image(0, 0, "FondoPeleaUno").setOrigin(0, 0).setDepth(-10);
        
        //  Determinar el tipo de enemigo de la batalla
        this.targetEnemyId = data && data.targetEnemy ? data.targetEnemy.getData('id') : null;
        this.enemyType = 'slime'; 
        
        if (this.targetEnemyId) {
            if (this.targetEnemyId.includes('ojo')) {
                this.enemyType = 'ojomMurcielago';
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
        this.playerParty = [
            { name: 'Caballero', hp: 100, maxHp: 100, sprite: null, dead: false },
            { name: 'Mago', hp: 80, maxHp: 80, sprite: null, dead: false }
        ];

        // Lado izquierdo en dos filas (Knight en Y=300, Mage en Y=450)
        this.playerParty[1].sprite = this.add.sprite(327, 458, 'Mago_Right0').setScale(7.5);
        this.playerParty[0].sprite = this.add.sprite(442, 628, 'Caballero_Right0').setScale(8.5)

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
                frames: this.anims.generateFrameNames('ojomMurcielago', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
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
        // Enemigo 1
        this.enemyParty[0].sprite = this.add.sprite(955, 254, this.enemyType)
            .setScale(5)
            .setTint(0xDDDDFF)
            .play(animKey);
    
        // Enemigo 2
        this.enemyParty[1].sprite = this.add.sprite(1135, 376, this.enemyType)
            .setScale(7)
            .play(animKey);
    
        // Enemigo 3
        this.enemyParty[2].sprite = this.add.sprite(1333, 544, this.enemyType)
            .setScale(8)
            .setTint(0xFF9999)
            .play(animKey);

        // === CREAR BARRAS DE VIDA ===
        // Función que genera las barras de HP para jugador y enemigos
        this.createHPBars();

        // === INDICADOR DE TURNO (ARRIBA) ===
        // Cubo rojo/azul que muestra de quién es el turno
        this.turnIndicator = this.add.rectangle(425, 50, 80, 80, 0xFF0000); // Rojo = turno jugador
        this.turnIndicatorText = this.add.text(425, 50, 'PLAYER', { font: '16px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);

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
                { name: `Normal (${current.normalAttackUses}/10)`, type: 'normal', damage: 15 },
                { name: `Strong (${current.strongAttackUses}/5)`, type: 'strong', damage: 30 }
            ]
            : [
                { name: `Spell (${current.normalAttackUses}/10)`, type: 'spell', damage: 25 },
                { name: `Heal (${current.healUses}/5)`, type: 'heal', healing: 40 }
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
                
            },
            onComplete: () => {
                // === ESPERAR 1 SEGUNDO ===
                this.time.delayedCall(1000, () => {
                    // === EJECUTAR ATAQUE ===
                    // Calcular daño según el tipo de ataque
                    const damage = attack.type === 'strong' ? 30 : 15;
                    target.hp = Math.max(0, target.hp - damage); // Asegurar HP no sea negativo

                    // Decrementar el contador de usos del ataque
                    if (attack.type === 'normal') attacker.normalAttackUses--;
                    else if (attack.type === 'strong') attacker.strongAttackUses--;

                    // Mostrar número de daño encima del enemigo
                    this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
                        font: '20px Arial',
                        fill: '#FF0000'
                    }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

                    // Marcar enemigo como muerto si su HP llegó a 0
                    if (target.hp <= 0) target.dead = true;

                    // Actualizar visualización de barras de vida
                    this.updateHPDisplay(target);

                    // === SALTO DE REGRESO CON PARÁBOLA Y CÁMARA ===
                    this.tweens.add({
                        targets: { progress: 0 },
                        progress: 1,
                        duration: jumpDuration,
                        ease: 'Linear',
                        onUpdate: (tween) => {
                            const t = tween.progress; // Valor de 0 a 1
                            
                            // Ecuación parabólica para altura
                            const heightOffset = 4 * maxHeight * t * (t - 1);
                            
                            // Movimiento lineal de regreso
                            attacker.sprite.x = targetX - distanceX * t;
                            attacker.sprite.y = targetY - distanceY * t + heightOffset;
                            
                        },
                        onComplete: () => {
                            
                            // Terminar turno después de regresar
                            this.endPlayerTurn();
                        }
                    });
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

        // Knight se mueve a la posición del Mago
        this.tweens.add({
            targets: knight,
            y: mage.y,
            duration: 400,
            ease: 'Power2.inOut'
        });

        // Mago se mueve a la posición del Knight
        this.tweens.add({
            targets: mage,
            y: knight.y,
            duration: 400,
            ease: 'Power2.inOut'
        });

        // Esperar a que termine la animación y terminar turno
        this.time.delayedCall(500, () => {
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
        //  Daño del enemigo basado en el tipo
        const damage = this.enemyType === 'slime' ? 10 : 15; 
        
        // El objetivo es siempre el personaje controlado actualmente por el jugador
        const target = this.playerParty[this.gameState.currentCharacter];
        target.hp = Math.max(0, target.hp - damage);

        // Mostrar animación de daño
        this.add.text(target.sprite.x, target.sprite.y - 40, `-${damage}`, {
            font: '20px Arial',
            fill: '#FF0000'
        }).setOrigin(0.5, 0.5).setDepth(10).setData('floatingText', true);

        // Actualizar barras de vida
        this.updateHPDisplay(target);

        // Verificar si el personaje del jugador fue derrotado
        if (target.hp <= 0) {
            target.dead = true;

            // Verificar si ambos personajes del jugador están derrotados
            if (this.playerParty.every(p => p.dead)) {
                this.handleDefeat();
                return;
            }
        }

        // Cambiar de vuelta a turno del jugador
        this.gameState.currentTurn = 'player';
        this.turnIndicator.setFillStyle(0xFF0000); // Cambiar indicador a rojo
        this.turnIndicatorText.setText('PLAYER');
        // Mostrar menú de nuevo
        this.menuTexts.forEach(t => t.setVisible(true));
        this.turnInfoText.setVisible(true);
        this.turnInfoText.setText(`${this.playerParty[this.gameState.currentCharacter].name}'s Turn`);
        // Resetear selección de menú
        this.selectedMenuOption = 0;
        this.updateMenuHighlight();

        // Limpiar efectos de daño flotante
        this.time.delayedCall(1500, () => {
            this.children.list.forEach(child => {
                if (child.getData('floatingText')) child.destroy();
            });
        });
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
        // Marcar batalla como finalizada
        this.gameState.battleOver = true;
        // Ocultar menú de batalla
        this.menuTexts.forEach(t => t.setVisible(false));
        this.turnInfoText.setVisible(false);

        // Otorgar 50 puntos de experiencia a todos los aliados
        this.playerParty.forEach(char => {
            // Sumar XP
            char.xp += 50;
            // Verificar si hay suficiente para subir de nivel
            if (char.xp >= char.xpToNextLevel) {
                this.levelUpCharacter(char);
            }
        });

        // Mostrar pantalla de victoria con textos decorativos
        this.add.text(425, 250, 'VICTORY!', {
            font: '48px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5).setDepth(10);

        this.add.text(425, 330, 'You gained 50 XP!', {
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
        // Aumentar maxHp en 20 puntos
        char.maxHp += 20;
        // Restaurar HP completo al subir de nivel
        char.hp = char.maxHp;
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


    
}

export default PeleaDebug;