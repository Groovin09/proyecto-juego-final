class Bootloader extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaDebug' });
    }

    init() {
        console.log('Escena Bootloader');
    }

   
    preload() {
        // ATLAS DEL SLIME y enemigos
        this.load.atlas('slime', 'assets/Animaciones/Mago/slimea.png', 'assets/Animaciones/Mago/slimea.json');
        this.load.atlas('ojomMurcielago', 'assets/Animaciones/Mago/ojoconcentracionanim.png', 'assets/Animaciones/Mago/ojoconcentracionanim.json');
        this.load.atlas('totemVida', 'assets/Animaciones/Mago/totemvidasck.png', 'assets/Animaciones/Mago/totemvidasck.json');
        this.load.atlas('totemCorazon', '    assets/Animaciones/Mago/totemcorazonanimi-sheet.png','    assets/Animaciones/Mago/totemcorazonanimi.json')
        this.load.atlas('mana','assets/Animaciones/Mago/mana.png','assets/Animaciones/Mago/mana.json')
        this.load.atlas('vidas','assets/Animaciones/Mago/vidasjuego.png','assets/Animaciones/Mago/vidasjuego.json')
    
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

        // MAPA
        this.load.image("Suelo", "assets/Tiles/Suelo.png");
        this.load.image("Paredes", "assets/Tiles/Paredes.png");
        this.load.image("Escaleras", "assets/Tiles/Estructuras piedra.png");
        this.load.image("Objetos", "assets/Tiles/Estructuras.png");
        // Poción de vida (sprite en assets/sprites/objetos/fb278.png)
        this.load.image('potion', 'assets/sprites/objetos/fb278.png');
        // Poción de maná (sprite en assets/sprites/objetos/fb293.png)
        this.load.image('manaPotion', 'assets/sprites/objetos/fb293.png');
        this.load.image("Plantas", "assets/Tiles/Plantas.png");
        this.load.image("Estructuras", "assets/Tiles/Estructuras piedra.png");

        this.load.tilemapTiledJSON("MapaDebug", "assets/Json/DebugColisiones.tmj");
        
        // Audios
        this.load.audio("HollowFFVII", "assets/audio/HollowFFVII.mp3");
        this.load.audio("LivingLegacy", "assets/audio/LivingLegacyFFVIICC.mp3");
    }

    create() {
     
        // === INICIALIZAR DATOS DE PERSONAJES EN REGISTRY ===
        // Si no existen datos previos, crear datos iniciales
        if (!this.registry.get('playerParty')) {
            const initialPlayerData = [
                {
                    name: 'Caballero',
                    type: 'knight',
                    hp: 100,
                    maxHp: 100,
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100,
                    attack: 15,
                    maxNormalUses: 10,
                    maxStrongUses: 5,
                    maxHealUses: 0,
                    normalAttackUses: 10,
                    strongAttackUses: 5,
                    healUses: 0
                },
                {
                    name: 'Mago',
                    type: 'mage',
                    hp: 80,
                    maxHp: 80,
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100,
                    attack: 25,
                    maxNormalUses: 10,
                    maxStrongUses: 0,
                    maxHealUses: 5,
                    normalAttackUses: 10,
                    strongAttackUses: 0,
                    healUses: 5
                }
            ];
            this.registry.set('playerParty', initialPlayerData);
        }

        // Reproducir audio de la escena
        this.hollowMusic = this.sound.add("HollowFFVII", { loop: true, volume: 1 });
        this.hollowMusic.play();
        
        // Fade out del audio después de 35 segundos (35000 ms)
        this.time.delayedCall(35000, () => {
            this.tweens.add({
                targets: this.hollowMusic,
                volume: 0,
                duration: 5000, // 2 segundos para bajar el volumen
                ease: 'Linear',
                onComplete: () => {
                    this.hollowMusic.stop();
                    // Reproducir LivingLegacy después de que termine el fade out
                    this.livingLegacyMusic = this.sound.add("LivingLegacy", { loop: true, volume: 1 });
                    this.livingLegacyMusic.play();
                }
            });
        });
        
        // Declarar lista de tótems ya recogidos (para que no reaparezcan)
    this.collectedTotems = [];
        // this.input.on("pointerdown", (pointer) => {
        //     console.log("Click en:", pointer.worldX, pointer.worldY);
        
        //     this.add.circle(pointer.worldX, pointer.worldY, 5, 0xff0000);
        // });
        
        // ANIMACIONES DE ATLAS
        this.crearAnimacionSlime();
        this.crearAnimacionOjoMurcielago();
        this.crearAnimacionTotemVida();

        // MAPA
        const map = this.make.tilemap({ key: "MapaDebug" });

        const SueloTS = map.addTilesetImage("Suelo", "Suelo");
        const ParedesTS = map.addTilesetImage("Paredes", "Paredes");
        const EscalerasTS = map.addTilesetImage("Estructuras piedra", "Escaleras");
        const EstructurasTS = map.addTilesetImage("Objetos", "Objetos");
        const PlantasTS = map.addTilesetImage("Naturaleza", "Plantas");

        const sueloLayer = map.createLayer('Suelo', SueloTS, 0, 0);
        const paredesLayer = map.createLayer('Paredes', ParedesTS, 0, 0);
        const escalerasLayer = map.createLayer("Estructuras caminables", EscalerasTS, 0, 0);
        const objetosLayer = map.createLayer("interactuables", EstructurasTS, 0, 0);
        const plantasLayer = map.createLayer("adornos", PlantasTS, 0, 0);

        // COLISIONES
        const wallColliders = this.physics.add.staticGroup();
        paredesLayer.forEachTile(tile => {
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

        this.wallColliders = wallColliders;

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // PLAYER
        this.player = this.physics.add.sprite(1329, 685, "Caballero_Front0");
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, wallColliders);

        this.player.setScale(1.1);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(4);

        if (this.player.body) {
            this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.7);
            this.player.body.setOffset(3, 6);
        }

        
       
        // SISTEMA DE ENEMIGOS

        this.enemigos = [];
        this.defeatedEnemies = []; // Lista de IDs de enemigos derrotados.

        this.enemigos.push(
            this.crearEnemigo(350, 1500, "slime", "idle_slime", 75, 150, 6).setData('id', 'slime_1') // ⭐ MODIFICADO: Añadir ID
        );
        // ⭐ NUEVOS SLIMES (400, 450)
        this.enemigos.push(
            this.crearEnemigo(400, 450, "slime", "idle_slime", 75, 150, 6).setData('id', 'slime_2')
        );
        // ⭐ NUEVOS SLIMES (1600, 400)
        this.enemigos.push(
            this.crearEnemigo(1600, 400, "slime", "idle_slime", 75, 150, 6).setData('id', 'slime_3')
        );
        // ⭐ NUEVOS SLIMES (850, 1300)
        this.enemigos.push(
            this.crearEnemigo(850, 1300, "slime", "idle_slime", 75, 150, 6).setData('id', 'slime_4')
        );

        this.enemigos.push(
            this.crearEnemigo(1500, 1089, "ojomMurcielago", "idle_ojoMurcielago", 75, 150, 6).setData('id', 'ojo_1') // ⭐ MODIFICADO: Añadir ID
        );
        // ⭐ NUEVOS OJOS (400, 1100)
        this.enemigos.push(
            this.crearEnemigo(400, 1700, "ojomMurcielago", "idle_ojoMurcielago", 75, 150, 6).setData('id', 'ojo_2')
        );
        // ⭐ NUEVOS OJOS (1700, 1150)
        this.enemigos.push(
            this.crearEnemigo(1700, 1150, "ojomMurcielago", "idle_ojoMurcielago", 75, 150, 6).setData('id', 'ojo_3')
        );


        //  OVERLAP PARA PAUSAR Y RUN EN LUGAR DE START
        this.physics.add.overlap(this.player, this.enemigos, (player, enemigo) => {
            if (this.scene.isActive("PeleaDebug")) return; // Evita doble llamada

            console.log("Jugador chocó con un enemigo → iniciando PeleaDebug");
            
            // Pausar la música de la escena
            if (this.hollowMusic && this.hollowMusic.isPlaying) {
                this.hollowMusic.pause();
            }
            if (this.livingLegacyMusic && this.livingLegacyMusic.isPlaying) {
                this.livingLegacyMusic.pause();
            }
            
            this.scene.pause(); // Pausar EscenaDebug
            this.scene.run("PeleaDebug", { // Lanzar PeleaDebug (se ejecuta encima sin destruir EscenaDebug)
                from: "EscenaDebug", 
                targetEnemy: enemigo // Pasar el sprite del enemigo para obtener su ID
            });
        }, null, this);

        // ESCUCHAR EVENTO DE VICTORIA DESDE PELEADEBUG
        this.events.on("victory", (data) => {
            this.scene.stop("PeleaDebug"); // Detener la escena de batalla
            
            // Reanudar la música que estaba pausada
            if (this.hollowMusic && !this.hollowMusic.isPlaying) {
                this.hollowMusic.resume();
            }
            if (this.livingLegacyMusic && !this.livingLegacyMusic.isPlaying) {
                this.livingLegacyMusic.resume();
            }
            
            this.scene.resume(); // Reanudar EscenaDebug

            // Si se derrotó a un enemigo de exploración, destrúyelo
            if (data && data.targetEnemyId) {
                // Agregar ID del enemigo derrotado a la lista permanente
                if (!this.defeatedEnemies.includes(data.targetEnemyId)) {
                    this.defeatedEnemies.push(data.targetEnemyId); 
                }
            }

            // Destruir todos los sprites de enemigos que estén en la lista defeatedEnemies
            this.enemigos.forEach(enemigo => {
                const id = enemigo.getData('id');
                if (id && this.defeatedEnemies.includes(id) && enemigo.active) {
                    enemigo.destroy();
                }
            });

            // === GUARDAR DATOS DE LOS PERSONAJES EN REGISTRY ===
            // Obtener los datos de PeleaDebug y crear una copia limpia (sin sprites)
            const peleaDebugScene = this.scene.get('PeleaDebug');
            if (peleaDebugScene && peleaDebugScene.playerParty) {
                const cleanData = peleaDebugScene.playerParty.map(c => ({
                    name: c.name,
                    type: c.type,
                    hp: c.hp,
                    maxHp: c.maxHp,
                    level: c.level,
                    xp: c.xp,
                    xpToNextLevel: c.xpToNextLevel,
                    attack: c.attack,
                    // usos actuales
                    normalAttackUses: c.normalAttackUses,
                    strongAttackUses: c.strongAttackUses,
                    healUses: c.healUses,
                    // usos máximos
                    maxNormalUses: c.maxNormalUses,
                    maxStrongUses: c.maxStrongUses,
                    maxHealUses: c.maxHealUses
                }));

                // Guardar la copia limpia en el registry para que Estadisticas.js la lea correctamente
                this.registry.set('playerParty', cleanData);

                // Mostrar notificación de que los datos fueron guardados
                console.log('Character data saved to registry (clean):', cleanData);
            }
        });


        // TOTEM VIDA → INVENTARIO (
        
        this.cuboE = this.physics.add.sprite(1087, 1038, 'totemVida').setScale(1);
        this.cuboE.setData("id", "totemVida_1");
        this.cuboE.setCollideWorldBounds(true);
        this.cuboE.play('idle_totemVida');

        if (this.cuboE.body) {
            this.cuboE.body.setSize(12, 14);
            this.cuboE.body.setOffset(6, 8);
        }
        if (this.collectedTotems.includes("totemVida_1")) {
            this.cuboE.destroy();
        }
        

        this.physics.add.collider(this.cuboE, wallColliders);
        this.physics.add.overlap(this.player, this.cuboE, this.collectCuboE, null, this);

        this.cuboE.speed = 0;
        this.cuboE.minFollowDist = 0;

        // Poción de vida en el mapa (acumulable)
        this.potion = this.physics.add.sprite(1000, 1100, 'potion').setScale(1.2);
        this.potion.setData('id', 'potion_1');
        if (this.potion.body) {
            this.potion.body.setSize(this.potion.width * 0.6, this.potion.height * 0.6);
            this.potion.body.setOffset(4, 4);
        }
        this.physics.add.collider(this.potion, wallColliders);
        this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);

        // Poción de maná en el mapa (acumulable)
        this.manaPotion = this.physics.add.sprite(1040, 1100, 'manaPotion').setScale(1.2);
        this.manaPotion.setData('id', 'manaPotion_1');
        if (this.manaPotion.body) {
            this.manaPotion.body.setSize(this.manaPotion.width * 0.6, this.manaPotion.height * 0.6);
            this.manaPotion.body.setOffset(4, 4);
        }
        this.physics.add.collider(this.manaPotion, wallColliders);
        this.physics.add.overlap(this.player, this.manaPotion, this.collectManaPotion, null, this);

        // MAGO SEGUIDOR 
        this.cuboSeguidor = this.physics.add.sprite(1400, 700, "Mago_Front0");
        this.cuboSeguidor.setScale(1.1);

        this.physics.add.collider(this.cuboSeguidor, wallColliders);
        this.physics.add.overlap(this.player, this.cuboSeguidor);

        this.velocidadSeguidor = 100;

        if (this.cuboSeguidor.body) {
            this.cuboSeguidor.body.setSize(this.cuboSeguidor.width * 0.8, this.cuboSeguidor.height * 0.8);
            this.cuboSeguidor.body.setOffset(2, 6);
        }

        // CONTROLES
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.playerSpeed = 100;
        // ... (código existente del create) ...

        // 1. Iniciar la escena del inventario en segundo plano (paralelo)
        // Esto asegura que escuche el evento de recoger el tótem aunque no la veas.
        if (!this.scene.isActive('InventarioScene')) {
            this.scene.launch('InventarioScene');
            this.scene.sleep('InventarioScene'); // La dormimos inmediatamente para que no estorbe
        }

        // 2. Tecla 'I' para ABRIR el inventario
        this.input.keyboard.on('keydown-I', () => {
            // Pausamos la escena de juego (EscenaDebug)
            this.scene.pause();
            // Despertamos la escena de inventario
            this.scene.wake('InventarioScene');
            // La traemos al frente por si acaso
            this.scene.bringToTop('InventarioScene');
        });

        // 3. Tecla 'Q' para ABRIR estadísticas de personajes
        this.input.keyboard.on('keydown-Q', () => {
            // Pausamos la escena de exploración
            this.scene.pause();
            // Iniciamos la escena de estadísticas
            this.scene.launch('Estadisticas');
        });

        // ANIMACIONES CABALLERO
        this.crearAnimacion("Caballero_Front", ["Caballero_Front0", "Caballero_Front1", "Caballero_Front2"]);
        this.crearAnimacion("Caballero_Back", ["Caballero_Back0", "Caballero_Back1", "Caballero_Back2"]);
        this.crearAnimacion("Caballero_Left", ["Caballero_Left0", "Caballero_Left1", "Caballero_Left2"]);
        this.crearAnimacion("Caballero_Right", ["Caballero_Right0", "Caballero_Right1", "Caballero_Right2"]);

        // ANIMACIONES MAGO
        this.crearAnimacion("Mago_Front", ["Mago_Front0", "Mago_Front1", "Mago_Front2"]);
        this.crearAnimacion("Mago_Back", ["Mago_Back0", "Mago_Back1", "Mago_Back2"]);
        this.crearAnimacion("Mago_Left", ["Mago_Left0", "Mago_Left1", "Mago_Left2"]);
        this.crearAnimacion("Mago_Right", ["Mago_Right0", "Mago_Right1", "Mago_Right2"]);

        // Iniciar el ciclo día/noche
        this.setupDayNightCycle();
    }

 
    // CREAR ENEMIGOS CON RADIO

    crearEnemigo(x, y, spriteKey, animKey, speed = 60, followRadius = 120, minDist = 6) {
        const enemigo = this.physics.add.sprite(x, y, spriteKey);
        enemigo.setScale(1.7);
        enemigo.play(animKey);
        enemigo.setCollideWorldBounds(true);

        enemigo.speed = speed;
        enemigo.followRadius = followRadius;
        enemigo.minFollowDist = minDist;

        enemigo.body.setSize(12, 14);
        enemigo.body.setOffset(6, 8);

        this.physics.add.collider(enemigo, this.wallColliders);

        return enemigo;
    }

    // ANIMACIONES ATLAS
    crearAnimacionSlime() {
        const frames = this.textures.get('slime').getFrameNames();
        this.anims.create({
            key: 'idle_slime',
            frames: frames.map(f => ({ key: 'slime', frame: f })),
            frameRate: 6,
            repeat: -1
        });
    }

    crearAnimacionOjoMurcielago() {
        const frames = this.textures.get('ojomMurcielago').getFrameNames();
        this.anims.create({
            key: 'idle_ojoMurcielago',
            frames: frames.map(f => ({ key: 'ojomMurcielago', frame: f })),
            frameRate: 6,
            repeat: -1
        });
    }

    crearAnimacionTotemVida() {
        const frames = this.textures.get('totemVida').getFrameNames();
        this.anims.create({
            key: 'idle_totemVida',
            frames: frames.map(f => ({ key: 'totemVida', frame: f })),
            frameRate: 6,
            repeat: -1
        });
    }

    // ANIMACIONES PNG
    crearAnimacion(nombre, frames) {
        this.anims.create({
            key: nombre,
            frames: frames.map(f => ({ key: f })),
            frameRate: 8,
            repeat: -1
        });
    }
    update() {

        // IA: TODOS LOS ENEMIGOS SIGUEN AL JUGADOR
      
        for (const enemigo of this.enemigos) {
            // Asegúrate de que el enemigo esté activo antes de moverlo
            if (!enemigo.active) continue; 

            const dx = this.player.x - enemigo.x;
            const dy = this.player.y - enemigo.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist > enemigo.followRadius) {
                enemigo.setVelocity(0, 0);
                continue;
            }

            if (dist <= enemigo.minFollowDist) {
                enemigo.setVelocity(0, 0);
                continue;
            }

            enemigo.setVelocity(
                (dx / dist) * enemigo.speed,
                (dy / dist) * enemigo.speed
            );
        }

        // MOVIMIENTO JUGADOR (igual)
        let vx = 0, vy = 0;

        if (this.keys.A.isDown) vx -= this.playerSpeed;
        if (this.keys.D.isDown) vx += this.playerSpeed;
        if (this.keys.W.isDown) vy -= this.playerSpeed;
        if (this.keys.S.isDown) vy += this.playerSpeed;

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

        // MAGO SEGUIDOR (igual)
        if (this.cuboSeguidor && this.cuboSeguidor.body) {
            const dx = this.player.x - this.cuboSeguidor.x;
            const dy = this.player.y - this.cuboSeguidor.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const minDist = 40;

            if (dist > minDist) {
                const svx = (dx / dist) * this.velocidadSeguidor;
                const svy = (dy / dist) * this.velocidadSeguidor;
                this.cuboSeguidor.setVelocity(svx, svy);

                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) this.cuboSeguidor.play("Mago_Right", true);
                    else this.cuboSeguidor.play("Mago_Left", true);
                } else {
                    if (dy > 0) this.cuboSeguidor.play("Mago_Front", true);
                    else this.cuboSeguidor.play("Mago_Back", true);
                }
            } else {
                this.cuboSeguidor.setVelocity(0, 0);
                this.cuboSeguidor.anims.stop();
            }
        }
    }

    collectCuboR(player, cubo) {
        cubo.disableBody(true, true);
        console.log("Player colisionó con CuboR — iniciando PeleaDebug");
        this.scene.pause();
        this.scene.run("PeleaDebug", { from: "EscenaDebug" });
    }

    // === CICLO DÍA/NOCHE ===
    setupDayNightCycle() {
        console.log('setupDayNightCycle llamado');
        this.isNight = false;
        const CYCLE_DURATION = 60000; // 1 minuto

        // Crear overlay azul para la noche (usando coordenadas fijas en pantalla)
        console.log('Creando overlay. Ancho pantalla:', this.scale.width, 'Alto:', this.scale.height);
        this.nightOverlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x0033AA,
            0
        );
        console.log('Overlay creado:', this.nightOverlay);
        this.nightOverlay.setScrollFactor(0);
        this.nightOverlay.setDepth(50);

        // Texto indicador (debug)
        this.timeOfDayText = this.add.text(20, 20, 'DÍA', {
            font: '16px Arial',
            fill: '#FFFF00'
        }).setScrollFactor(0).setDepth(100);
        console.log('Texto creado:', this.timeOfDayText);

        console.log('🌞 Ciclo día/noche iniciado (primero: DÍA)');

        // Iniciar ciclo cada 1 minuto
        this.time.addEvent({
            delay: CYCLE_DURATION,
            callback: () => this.toggleDayNight(),
            loop: true
        });
    }

    toggleDayNight() {
        console.log('toggleDayNight llamado. isNight antes:', this.isNight);
        this.isNight = !this.isNight;
        console.log('isNight después:', this.isNight);
        if (this.isNight) {
            console.log('Iniciando fade IN a noche');
            // Fade in gradual a noche (3 segundos)
            this.tweens.add({
                targets: this.nightOverlay,
                alpha: 0.3,
                duration: 3000,
                ease: 'Linear',
                onStart: () => {
                    this.timeOfDayText.setText('NOCHE');
                    console.log('🌙 Ha caído la noche');
                }
            });
        } else {
            console.log('Iniciando fade OUT a día');
            // Fade out gradual a día (3 segundos)
            this.tweens.add({
                targets: this.nightOverlay,
                alpha: 0,
                duration: 3000,
                ease: 'Linear',
                onStart: () => {
                    this.timeOfDayText.setText('DÍA');
                    console.log('☀️ Ha amanecido');
                }
            });
        }
    }

    collectCuboA(player, cubo) {
        cubo.disableBody(true, true);
        console.log("Player colisionó con CuboA — iniciando PeleaDebug");
        this.scene.pause();
        this.scene.run("PeleaDebug", { from: "EscenaDebug" });
    }

    // TÓTEM VIDA → INVENTARIO
    collectCuboE(player, cubo) {
        const totemId = cubo.getData("id") || "totemVida_1";
    
        // Evitar recogerlo dos veces
        if (this.collectedTotems.includes(totemId)) return;
    
        console.log("Player obtuvo un Tótem de Vida (ÚNICO)");
    
        this.collectedTotems.push(totemId);
    
        // Destruir tótem del mapa
        cubo.destroy();
    
        // Enviar al inventario (no acumulable)
        this.game.events.emit("agregarAlInventario", {
            tipo: "totemVida"
        });
    
        // APLICAR BENEFICIO PERMANENTE (+10% maxHp para todos los personajes)
        const playerParty = this.registry.get('playerParty') || [];
        playerParty.forEach(character => {
            if (Number.isFinite(character.maxHp)) {
                character.maxHp = Math.max(1, Math.floor(character.maxHp * 1.1));
                // No curar, solo aumentar maxHp
            }
        });

        // Guardar cambios en el registry
        this.registry.set('playerParty', playerParty);

        console.log("Nuevo máximo de vida:", playerParty.map(c => `${c.name}: ${c.maxHp}`));
    }

    // POCIÓN DE VIDA → INVENTARIO (acumulable)
    collectPotion(player, potion) {
        const potionId = potion.getData('id') || 'potion_1';

        console.log('Player recogió una Poción de Vida');

        // Destruir la poción del mapa
        potion.destroy();

        // Enviar al inventario (acumulable, cantidad)
        this.game.events.emit('agregarAlInventario', {
            tipo: 'potion',
            cantidad: 1
        });

        // No efecto inmediato sobre stats; uso desde inventario o en batalla
    }

    // RECOGER POCIÓN DE MANÁ → INVENTARIO (acumulable)
    collectManaPotion(player, manaPotion) {
        const manaId = manaPotion.getData('id') || 'manaPotion_1';
        console.log('Player recogió una Poción de Maná');
        manaPotion.destroy();
        this.game.events.emit('agregarAlInventario', {
            tipo: 'manaPotion',
            cantidad: 1
        });
    }

}

export default Bootloader;