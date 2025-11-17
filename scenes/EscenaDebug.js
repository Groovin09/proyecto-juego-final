class Bootloader extends Phaser.Scene {
    constructor() {
        super({ key: 'EscenaDebug' });
    }

    init() {
        console.log('Escena Bootloader');
    }

    preload() {

        // ==========================================================
        // CABALLERO — SPRITES INDIVIDUALES
        // ==========================================================

        // Frente
        this.load.image("Caballero_Front0", "assets/Animaciones/Caballero/Front_0.png");
        this.load.image("Caballero_Front1", "assets/Animaciones/Caballero/Front_1.png");
        this.load.image("Caballero_Front2", "assets/Animaciones/Caballero/Front_2.png");

        // Espalda
        this.load.image("Caballero_Back0", "assets/Animaciones/Caballero/Back_0.png");
        this.load.image("Caballero_Back1", "assets/Animaciones/Caballero/Back_1.png");
        this.load.image("Caballero_Back2", "assets/Animaciones/Caballero/Back_2.png");

        // Izquierda
        this.load.image("Caballero_Left0", "assets/Animaciones/Caballero/Left_0.png");
        this.load.image("Caballero_Left1", "assets/Animaciones/Caballero/Left_1.png");
        this.load.image("Caballero_Left2", "assets/Animaciones/Caballero/Left_2.png");

        // Derecha
        this.load.image("Caballero_Right0", "assets/Animaciones/Caballero/Right_0.png");
        this.load.image("Caballero_Right1", "assets/Animaciones/Caballero/Right_1.png");
        this.load.image("Caballero_Right2", "assets/Animaciones/Caballero/Right_2.png");

        // ==========================================================
        // MAGO — SPRITES INDIVIDUALES (CORREGIDO)
        // ==========================================================

        // Frente
        this.load.image("Mago_Front0", "assets/Animaciones/Mago/MFront_0.png");
        this.load.image("Mago_Front1", "assets/Animaciones/Mago/MFront_1.png");
        this.load.image("Mago_Front2", "assets/Animaciones/Mago/MFront_2.png");

        // Espalda
        this.load.image("Mago_Back0", "assets/Animaciones/Mago/MBack_0.png");
        this.load.image("Mago_Back1", "assets/Animaciones/Mago/MBack_1.png");
        this.load.image("Mago_Back2", "assets/Animaciones/Mago/MBack_2.png");

        // Izquierda
        this.load.image("Mago_Left0", "assets/Animaciones/Mago/MLeft_0.png");
        this.load.image("Mago_Left1", "assets/Animaciones/Mago/MLeft_1.png");
        this.load.image("Mago_Left2", "assets/Animaciones/Mago/MLeft_2.png");

        // Derecha
        this.load.image("Mago_Right0", "assets/Animaciones/Mago/MRight_0.png");
        this.load.image("Mago_Right1", "assets/Animaciones/Mago/MRight_1.png");
        this.load.image("Mago_Right2", "assets/Animaciones/Mago/MRight_2.png");

        // ==========================================================
        // MAPA
        // ==========================================================
        this.load.image("Suelo", "assets/Tiles/Suelo.png");
        this.load.image("Paredes", "assets/Tiles/Paredes.png");
        this.load.image("Escaleras", "assets/Tiles/Estructuras piedra.png");
        this.load.image("Objetos", "assets/Tiles/Estructuras.png");
        this.load.image("Plantas", "assets/Tiles/Plantas.png");
        this.load.image("Estructuras", "assets/Tiles/Estructuras piedra.png");

        this.load.tilemapTiledJSON("MapaDebug", "assets/Json/DebugColisiones.tmj");

        // (opcional) favicon puede dar 404, no crítico
    }

    create() {

        // ==========================================================
        // CREACIÓN DEL MAPA
        // ==========================================================

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

        // ==========================================================
        // COLISIONES DESDE TILED
        // ==========================================================

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

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // ==========================================================
        // JUGADOR — CABALLERO
        // ==========================================================

        this.player = this.physics.add.sprite(1329, 685, "Caballero_Front0");
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, wallColliders);

        this.player.setScale(1.1);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(4);

        // Hitbox corregido
        if (this.player.body) {
            this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.45);
            this.player.body.setOffset(5, 18);
        }

       // ==========================================================
// ENEMIGO — CUBO ROJO (ahora móvil y persigue al jugador)
// ==========================================================
this.cuboR = this.physics.add.sprite(1500, 900, "Caballero_Left0"); // o la textura que quieras
this.cuboR.setScale(0.7);
this.cuboR.setCollideWorldBounds(true);

// IMPORTANTE: NO lo hagas inmovible (quita cualquier setImmovable(true))
// this.cuboR.setImmovable(true); // <- eliminar si existe

// Ajusta hitbox pequeño para que no se "aplane" en colisiones
if (this.cuboR.body) {
    this.cuboR.body.setSize(12, 14);    // valores probados para sprites 16x24
    this.cuboR.body.setOffset(6, 8);
}

// Colisión con paredes (para que NO atraviese muros)
this.physics.add.collider(this.cuboR, wallColliders);

// Si quieres que el jugador sea empujado por el cubo usa collider jugador<->cuboR:
// this.physics.add.collider(this.player, this.cuboR);

// Pero si quieres solo detectar contacto para iniciar pelea, usa overlap:
this.physics.add.overlap(this.player, this.cuboR, this.collectCuboR, null, this);

// Parámetros de IA
this.cuboR.speed = 75;          // velocidad de persecución
this.cuboR.minFollowDist = 6;   // distancia a la que se detiene (pixeles)


        // ==========================================================
        // — MAGO SEGUIDOR
        // ==========================================================

        this.cuboSeguidor = this.physics.add.sprite(1400, 700, "Mago_Front0");

        this.cuboSeguidor.setScale(1.1);
        this.physics.add.collider(this.cuboSeguidor, wallColliders);

        this.velocidadSeguidor = 100;

        // hitbox del mago
        if (this.cuboSeguidor.body) {
            this.cuboSeguidor.body.setSize(this.cuboSeguidor.width * 0.8, this.cuboSeguidor.height * 0.8);
            this.cuboSeguidor.body.setOffset(5, 5);
        }

        // overlap (no empuja al jugador)
        this.physics.add.overlap(this.player, this.cuboSeguidor);

        // ==========================================================
        // CONTROLES
        // ==========================================================
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.playerSpeed = 100;

        // ==========================================================
        // ANIMACIONES CABALLERO
        // ==========================================================

        this.crearAnimacion("Caballero_Front", ["Caballero_Front0", "Caballero_Front1", "Caballero_Front2"]);
        this.crearAnimacion("Caballero_Back", ["Caballero_Back0", "Caballero_Back1", "Caballero_Back2"]);
        this.crearAnimacion("Caballero_Left", ["Caballero_Left0", "Caballero_Left1", "Caballero_Left2"]);
        this.crearAnimacion("Caballero_Right", ["Caballero_Right0", "Caballero_Right1", "Caballero_Right2"]);

        // ==========================================================
        // ANIMACIONES MAGO
        // ==========================================================

        this.crearAnimacion("Mago_Front", ["Mago_Front0", "Mago_Front1", "Mago_Front2"]);
        this.crearAnimacion("Mago_Back", ["Mago_Back0", "Mago_Back1", "Mago_Back2"]);
        this.crearAnimacion("Mago_Left", ["Mago_Left0", "Mago_Left1", "Mago_Left2"]);
        this.crearAnimacion("Mago_Right", ["Mago_Right0", "Mago_Right1", "Mago_Right2"]);
    }

    // ==============================================================
    // FUNCIÓN PARA CREAR ANIMACIONES
    // ==============================================================
    crearAnimacion(nombre, frames) {
        this.anims.create({
            key: nombre,
            frames: frames.map(f => ({ key: f })),
            frameRate: 8,
            repeat: -1
        });
    }

    update() {

// === MOVIMIENTO DEL ENEMIGO cuboR (seguir al jugador) ===
if (this.cuboR && this.cuboR.body) {
    const dxR = this.player.x - this.cuboR.x;
    const dyR = this.player.y - this.cuboR.y;
    const distR = Math.sqrt(dxR * dxR + dyR * dyR);

    if (distR > this.cuboR.minFollowDist) {
        // Normalizar y aplicar velocidad
        const vxR = (dxR / distR) * this.cuboR.speed;
        const vyR = (dyR / distR) * this.cuboR.speed;
        this.cuboR.setVelocity(vxR, vyR);

        // (Opcional) cambiar textura según dirección dominante
        if (Math.abs(dxR) > Math.abs(dyR)) {
            if (dxR > 0) this.cuboR.setTexture("Caballero_Right0");
            else this.cuboR.setTexture("Caballero_Left0");
        } else {
            if (dyR > 0) this.cuboR.setTexture("Caballero_Front0");
            else this.cuboR.setTexture("Caballero_Back0");
        }

    } else {
        this.cuboR.setVelocity(0, 0);
    }
}


        // ==========================================================
        // MOVIMIENTO DEL JUGADOR
        // ==========================================================

        let vx = 0;
        let vy = 0;

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

        // Animaciones del jugador
        if (vy > 0) this.player.play("Caballero_Front", true);
        else if (vy < 0) this.player.play("Caballero_Back", true);
        else if (vx < 0) this.player.play("Caballero_Left", true);
        else if (vx > 0) this.player.play("Caballero_Right", true);
        else this.player.anims.stop();

        // ==========================================================
        // MOVIMIENTO DEL MAGO SEGUIDOR
        // ==========================================================

        const dx = this.player.x - this.cuboSeguidor.x;
        const dy = this.player.y - this.cuboSeguidor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const minDist = 40;

        if (dist > minDist) {
            const svx = (dx / dist) * this.velocidadSeguidor;
            const svy = (dy / dist) * this.velocidadSeguidor;
            this.cuboSeguidor.setVelocity(svx, svy);

            // Animación del mago según dirección dominante
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


    

    collectCuboR(player, cubo) {
        // ejemplo: desactivar y saltar a la escena de pelea
        cubo.disableBody(true, true);
        console.log("Player colisionó con CuboR — iniciando PeleaDebug");
        this.scene.start("PeleaDebug", { from: "EscenaDebug" });
    }
}

export default Bootloader;
