class Castillo1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Castillo1' });
    }

    preload() {
        // CABALLERO — SPRITES INDIVIDUALES
        this.load.image("Caballero_Front0", "assets/Animaciones/Caballero/Front_0.png");
        this.load.image("Caballero_Front1", "assets/Animaciones/Caballero/Front_1.png");
        this.load.image("Caballero_Front2", "assets/Animaciones/Caballero/Front_2.png");
        this.load.image("Caballero_Back0", "assets/Animaciones/Caballero/Back_0.png");
        this.load.image("Caballero_Back1", "assets/Animaciones/Caballero/Back_1.png");
        this.load.image("Caballero_Back2", "assets/Animaciones/Caballero/Back_2.png");
        this.load.image("Caballero_Left0", "assets/Animaciones/Caballero/Left_0.png");
        this.load.image("Caballero_Left1", "assets/Animaciones/Caballero/Left_1.png");
        this.load.image("Caballero_Left2", "assets/Animaciones/Caballero/Left_2.png");
        this.load.image("Caballero_Right0", "assets/Animaciones/Caballero/Right_0.png");
        this.load.image("Caballero_Right1", "assets/Animaciones/Caballero/Right_1.png");
        this.load.image("Caballero_Right2", "assets/Animaciones/Caballero/Right_2.png");

        // MAGO — SPRITES INDIVIDUALES
        this.load.image("Mago_Front0", "assets/Animaciones/Mago/MFront_0.png");
        this.load.image("Mago_Front1", "assets/Animaciones/Mago/MFront_1.png");
        this.load.image("Mago_Front2", "assets/Animaciones/Mago/MFront_2.png");
        this.load.image("Mago_Back0", "assets/Animaciones/Mago/MBack_0.png");
        this.load.image("Mago_Back1", "assets/Animaciones/Mago/MBack_1.png");
        this.load.image("Mago_Back2", "assets/Animaciones/Mago/MBack_2.png");
        this.load.image("Mago_Left0", "assets/Animaciones/Mago/MLeft_0.png");
        this.load.image("Mago_Left1", "assets/Animaciones/Mago/MLeft_1.png");
        this.load.image("Mago_Left2", "assets/Animaciones/Mago/MLeft_2.png");
        this.load.image("Mago_Right0", "assets/Animaciones/Mago/MRight_0.png");
        this.load.image("Mago_Right1", "assets/Animaciones/Mago/MRight_1.png");
        this.load.image("Mago_Right2", "assets/Animaciones/Mago/MRight_2.png");

        // TILESET PARA CASTILLO
        this.load.image("mainlevbuild", "assets/Tiles/castillo/mainlevbuild.png");
        this.load.image("decorative", "assets/Tiles/castillo/decorative.png");

        // MAPA DE CASTILLO
        this.load.tilemapTiledJSON("MapaCastillo1", "assets/Json/Castillo1.tmj");
    }

    create() {
        // Detener las escenas de UI que pudieran estar activas desde EscenaDebug
        if (this.scene.isActive('InventarioScene')) {
            this.scene.stop('InventarioScene');
        }
        if (this.scene.isActive('Estadisticas')) {
            this.scene.stop('Estadisticas');
        }

        // Pequeña pausa para asegurar que se detienen
        this.time.delayedCall(100, () => {
            // 1. Iniciar la escena del inventario en segundo plano
            this.scene.launch('InventarioScene');
            this.scene.sleep('InventarioScene');
        });

        // CREAR ANIMACIONES
        this.crearAnimacionCaballero();
        this.crearAnimacionMago();

        // MAPA
        const map = this.make.tilemap({ key: 'MapaCastillo1' });

        const EstructurasTS = map.addTilesetImage('estructuras', 'mainlevbuild');
        const DecoracionesTS = map.addTilesetImage('decoraciones', 'decorative');

        // Crear layers del mapa
        const layers = {};
        map.layers.forEach((layer) => {
            if (EstructurasTS) {
                try {
                    layers[layer.name] = map.createLayer(layer.name, EstructurasTS, 0, 0);
                } catch (e) {
                    if (DecoracionesTS) {
                        try {
                            layers[layer.name] = map.createLayer(layer.name, DecoracionesTS, 0, 0);
                        } catch (e2) {
                            console.warn(`No se pudo crear la capa ${layer.name}`);
                        }
                    }
                }
            }
        });

        console.log('=== CAPAS DISPONIBLES EN CASTILLO1 ===');
        map.layers.forEach((layer, index) => {
            console.log(`${index}: "${layer.name}"`);
        });

        // COLISIONES
        const wallColliders = this.physics.add.staticGroup();
        map.layers.forEach((layerData) => {
            const layer = layers[layerData.name];
            if (layer) {
                layer.forEachTile(tile => {
                    if (tile && tile.properties && tile.properties.collides) {
                        const w = tile.properties.collisionWidth || map.tileWidth;
                        const h = tile.properties.collisionHeight || map.tileHeight;
                        const offsetX = tile.properties.collisionOffsetX || 0;
                        const offsetY = tile.properties.collisionOffsetY || 0;
                        const x = tile.pixelX + offsetX + w / 2;
                        const y = tile.pixelY + offsetY + h / 2;
                        const rect = this.add.rectangle(x, y, w, h);
                        rect.visible = false;
                        this.physics.add.existing(rect, true);
                        wallColliders.add(rect);
                    }
                });
            }
        });

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Guardar posición inicial y checkpoint en registry si no existen
        if (!this.registry.get('Castillo1_initialPos')) {
            this.registry.set('Castillo1_initialPos', { x: 350, y: 800 });
            this.registry.set('Castillo1_checkpoint', { x: 350, y: 800 });
        }

        // CREAR PERSONAJES
        const playerParty = this.registry.get('playerParty');
        const spawnX = 350;
        const spawnY = 800;

        const currentCharacter = playerParty[0];
        const playerSprite = this.physics.add.sprite(spawnX, spawnY, `${currentCharacter.name}_Front0`).setScale(1.1).setDepth(5);
        this.player = playerSprite;
        playerSprite.body.setSize(32, 64);
        playerSprite.body.setCollideWorldBounds(true);
        this.physics.add.collider(playerSprite, wallColliders);

        // MAGO SEGUIDOR
        const magoSprite = this.physics.add.sprite(spawnX + 60, spawnY, "Mago_Front0").setScale(1.1).setDepth(5);
        this.mago = magoSprite;
        magoSprite.body.setSize(32, 64);
        magoSprite.body.setCollideWorldBounds(true);
        this.physics.add.collider(magoSprite, wallColliders);

        // CONTROLES
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            i: Phaser.Input.Keyboard.KeyCodes.I,
            q: Phaser.Input.Keyboard.KeyCodes.Q,
            e: Phaser.Input.Keyboard.KeyCodes.E
        });

        this.playerSpeed = 100;
        this.velocidadSeguidor = 100;

        // CÁMARA
        this.cameras.main.startFollow(playerSprite);
        this.cameras.main.setZoom(4);

        this.currentCharacter = currentCharacter;
        this.playerParty = playerParty;

        // === CHECKPOINTS ===
        // Crear zonas de checkpoint con visual visible
        const checkpoints = [
            { x: 500, y: 600, id: 'checkpoint_1' },   // Zona entrada
            { x: 1200, y: 800, id: 'checkpoint_2' },  // Zona media
            { x: 1800, y: 500, id: 'checkpoint_3' }   // Zona salida
        ];

        checkpoints.forEach(cp => {
            const checkpoint = this.add.zone(cp.x, cp.y, 120, 120);
            this.physics.world.enable(checkpoint);
            checkpoint.body.setAllowGravity(false);
            checkpoint.setData('checkpointId', cp.id);
            
            // Visual del checkpoint (círculo azul semitransparente)
            const checkpointVisual = this.add.circle(cp.x, cp.y, 60, 0x0099FF, 0.4);
            checkpointVisual.setDepth(2);
            
            // Texto del checkpoint
            this.add.text(cp.x, cp.y, cp.id, {
                font: '12px Arial',
                fill: '#00CCFF',
                align: 'center'
            }).setOrigin(0.5).setDepth(3);
            
            // Overlap para guardar checkpoint cuando el jugador pase
            this.physics.add.overlap(this.player, checkpoint, () => {
                const lastCheckpoint = this.registry.get('Castillo1_checkpoint');
                if (!lastCheckpoint || lastCheckpoint.id !== cp.id) {
                    this.registry.set('Castillo1_checkpoint', { x: cp.x, y: cp.y, id: cp.id });
                    console.log('Checkpoint guardado en Castillo1:', cp.id);
                    // Cambiar color del círculo a verde cuando se activa
                    checkpointVisual.setFillStyle(0x00FF00, 0.6);
                }
            }, null, this);
        });

        // 2. Tecla 'I' para ABRIR el inventario
        this.input.keyboard.on('keydown-I', () => {
            this.registry.set('sceneQuePauso', 'Castillo1');
            this.scene.pause();
            this.scene.wake('InventarioScene');
            this.scene.bringToTop('InventarioScene');
        });

        // 3. Tecla 'Q' para ABRIR estadísticas
        this.input.keyboard.on('keydown-Q', () => {
            console.log('Castillo1: Q pressed - abrir Estadisticas');
            this.registry.set('sceneQuePauso', 'Castillo1');
            this.scene.pause();
            if (this.scene.isSleeping('Estadisticas')) {
                this.scene.wake('Estadisticas');
            } else if (!this.scene.isActive('Estadisticas')) {
                this.scene.launch('Estadisticas');
            }
            this.scene.bringToTop('Estadisticas');
        });
    }

    showGameOverModal() {
        // Pausar la escena
        this.scene.pause();

        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // Fondo oscuro
        const bg = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.7).setScrollFactor(0).setDepth(1000);

        // Título "Game Over"
        this.add.text(centerX, centerY - 80, 'GAME OVER', {
            font: '48px Arial',
            fill: '#FF0000',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

        // Mensaje
        this.add.text(centerX, centerY - 20, 'Ambos personajes han caído', {
            font: '24px Arial',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

        // Botón Continuar
        const btnContinuar = this.add.rectangle(centerX - 120, centerY + 60, 160, 50, 0x00AA00).setScrollFactor(0).setDepth(1001).setInteractive({ useHandCursor: true });
        const txtContinuar = this.add.text(centerX - 120, centerY + 60, 'Continuar', {
            font: '20px Arial',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

        // Botón Abandonar
        const btnAbandonar = this.add.rectangle(centerX + 120, centerY + 60, 160, 50, 0xAA0000).setScrollFactor(0).setDepth(1001).setInteractive({ useHandCursor: true });
        const txtAbandonar = this.add.text(centerX + 120, centerY + 60, 'Abandonar', {
            font: '20px Arial',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

        // Efectos de hover
        btnContinuar.on('pointerover', () => {
            btnContinuar.setFillStyle(0x00FF00);
        });
        btnContinuar.on('pointerout', () => {
            btnContinuar.setFillStyle(0x00AA00);
        });

        btnAbandonar.on('pointerover', () => {
            btnAbandonar.setFillStyle(0xFF0000);
        });
        btnAbandonar.on('pointerout', () => {
            btnAbandonar.setFillStyle(0xAA0000);
        });

        // Click en Continuar: resurreccionar en checkpoint
        btnContinuar.on('pointerdown', () => {
            // Limpiar modal
            bg.destroy();
            txtContinuar.destroy();
            txtAbandonar.destroy();
            btnContinuar.destroy();
            btnAbandonar.destroy();

            // Obtener checkpoint o posición inicial
            const checkpoint = this.registry.get('Castillo1_checkpoint') || this.registry.get('Castillo1_initialPos');

            // Restaurar vida a personajes
            const playerParty = this.registry.get('playerParty');
            playerParty.forEach(char => {
                char.hp = Math.floor(char.maxHp * 0.5); // Revivir con 50% de vida
            });
            this.registry.set('playerParty', playerParty);

            // Teletransportar jugador y mago al checkpoint
            this.player.setPosition(checkpoint.x, checkpoint.y);
            this.mago.setPosition(checkpoint.x + 60, checkpoint.y);

            // Reanudar la escena
            this.scene.resume();
            console.log('Continuando desde checkpoint en Castillo1:', checkpoint);
        });

        // Click en Abandonar: volver a Bootloader
        btnAbandonar.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('Bootloader');
        });
    }

    update() {
        // === CHEQUEO DE GAME OVER ===
        const playerParty = this.registry.get('playerParty');
        if (playerParty && playerParty[0].hp <= 0 && playerParty[1].hp <= 0) {
            if (!this.gameOverShown) {
                this.gameOverShown = true;
                this.showGameOverModal();
            }
        } else {
            this.gameOverShown = false;
        }

        // Movimiento del jugador
        let vx = 0, vy = 0;

        if (this.keys.left.isDown) vx -= this.playerSpeed;
        if (this.keys.right.isDown) vx += this.playerSpeed;
        if (this.keys.up.isDown) vy -= this.playerSpeed;
        if (this.keys.down.isDown) vy += this.playerSpeed;

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
            vx = (vx / mag) * this.playerSpeed;
            vy = (vy / mag) * this.playerSpeed;
        }

        this.player.setVelocity(vx, vy);

        if (vy > 0) this.player.play("Caballero_Front", true);
        else if (vy < 0) this.player.play("Caballero_Back", true);
        else if (vx < 0) this.player.play("Caballero_Left", true);
        else if (vx > 0) this.player.play("Caballero_Right", true);
        else this.player.anims.stop();

        // MAGO SEGUIDOR
        if (this.mago && this.mago.body) {
            const dx = this.player.x - this.mago.x;
            const dy = this.player.y - this.mago.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = 40;

            if (dist > minDist) {
                const svx = (dx / dist) * this.velocidadSeguidor;
                const svy = (dy / dist) * this.velocidadSeguidor;
                this.mago.setVelocity(svx, svy);

                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) this.mago.play("Mago_Right", true);
                    else this.mago.play("Mago_Left", true);
                } else {
                    if (dy > 0) this.mago.play("Mago_Front", true);
                    else this.mago.play("Mago_Back", true);
                }
            } else {
                this.mago.setVelocity(0, 0);
                this.mago.anims.stop();
            }
        }
    }

    crearAnimacionCaballero() {
        this.anims.create({
            key: 'Caballero_Front',
            frames: [{ key: 'Caballero_Front0' }, { key: 'Caballero_Front1' }, { key: 'Caballero_Front2' }],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Caballero_Back',
            frames: [{ key: 'Caballero_Back0' }, { key: 'Caballero_Back1' }, { key: 'Caballero_Back2' }],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Caballero_Left',
            frames: [{ key: 'Caballero_Left0' }, { key: 'Caballero_Left1' }, { key: 'Caballero_Left2' }],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Caballero_Right',
            frames: [{ key: 'Caballero_Right0' }, { key: 'Caballero_Right1' }, { key: 'Caballero_Right2' }],
            frameRate: 8,
            repeat: -1
        });
    }

    crearAnimacionMago() {
        this.anims.create({
            key: 'Mago_Front',
            frames: [{ key: 'Mago_Front0' }, { key: 'Mago_Front1' }, { key: 'Mago_Front2' }],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Mago_Back',
            frames: [{ key: 'Mago_Back0' }, { key: 'Mago_Back1' }, { key: 'Mago_Back2' }],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Mago_Left',
            frames: [{ key: 'Mago_Left0' }, { key: 'Mago_Left1' }, { key: 'Mago_Left2' }],
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Mago_Right',
            frames: [{ key: 'Mago_Right0' }, { key: 'Mago_Right1' }, { key: 'Mago_Right2' }],
            frameRate: 8,
            repeat: -1
        });
    }
}

export default Castillo1;
