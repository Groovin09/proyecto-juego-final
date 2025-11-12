class Bootloader extends Phaser.Scene{
    constructor(){
        super({
            key: 'EscenaDebug'
        });
    }

    init() {

        console.log('Escena Bootloader');
    }

    preload() {

        //Personaje
        this.load.image("Caballero", "assets/Animaciones/Caballero/Front_0.png");
        this.load.image("Mago", "assets/Animaciones/Mago/MFront_0.png");

        //Mapa
        //Tileset
        this.load.image("Suelo", "assets/Tiles/Suelo.png");
        this.load.image("Paredes", "assets/Tiles/Paredes.png");
        this.load.image("Escaleras", "assets/Tiles/Estructuras piedra.png");
        this.load.image("Objetos", "assets/Tiles/Estructuras.png");
        this.load.image("Plantas", "assets/Tiles/Plantas.png");
        this.load.image("Estructuras", "assets/Tiles/Estructuras piedra.png");

        //JSON
        this.load.tilemapTiledJSON("MapaDebug", "assets/Json/DebugColisiones.tmj");

    }

    create() {
 
        //Mapa
        const map = this.make.tilemap({ key: "MapaDebug" });
       
        const SueloTS = map.addTilesetImage("Suelo", "Suelo");
        const ParedesTS = map.addTilesetImage("Paredes", "Paredes");
        const EscalerasTS = map.addTilesetImage("Estructuras piedra", "Escaleras");
        const EstructurasTS = map.addTilesetImage("Objetos", "Objetos");
        const PlantasTS = map.addTilesetImage("Naturaleza", "Plantas");
        
        const sueloLayer = map.createLayer('Suelo', SueloTS, 0, 0);
        // Crear la capa Paredes como StaticLayer para que sea estática
        const paredesLayer = map.createStaticLayer('Paredes', ParedesTS, 0, 0);
        const escalerasLayer = map.createLayer("Estructuras caminables", EscalerasTS, 0, 0);
        const objetosLayer = map.createLayer("interactuables", EstructurasTS, 0, 0);
        const PlantasLayer = map.createLayer("adornos", PlantasTS, 0, 0);
        const EstructurasLayer = map.createLayer("adornos", EstructurasTS, 0, 0);

        // Grupo de colliders estáticos que representarán las áreas de colisión
        const wallColliders = this.physics.add.staticGroup();

        // Recorrer tiles y crear rectángulos estáticos según propiedades de Tiled
        paredesLayer.forEachTile(tile => {
            if (tile && tile.properties && tile.properties.collides) {
                const tileW = map.tileWidth;
                const tileH = map.tileHeight;
                const w = tile.properties.collisionWidth || tileW;
                const h = tile.properties.collisionHeight || tileH;
                const offsetX = tile.properties.collisionOffsetX || 0;
                const offsetY = tile.properties.collisionOffsetY || 0;

                // Calcular posición en píxeles (tile.pixelX / tile.pixelY es la esquina superior izquierda)
                const x = tile.pixelX + offsetX + w / 2;
                const y = tile.pixelY + offsetY + h / 2;

                // Crear rectángulo invisible y añadirle un cuerpo estático de Arcade
                const rect = this.add.rectangle(x, y, w, h);
                rect.setOrigin(0.5);
                rect.visible = false; // oculto en juego
                this.physics.add.existing(rect, true); // true -> static body
                wallColliders.add(rect);
            }
        });

        // Ajustar los bounds del mundo y de la cámara al tamaño del mapa
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        //Crear fisicas del jugador
        this.player = this.physics.add.sprite(1329, 685, "Caballero");
        this.player.setCollideWorldBounds(false);
        this.player.setDepth(5);

        // Añadir colisión entre jugador y los colliders estáticos generados desde Tiled
        this.physics.add.collider(this.player, wallColliders);

        //Camara que sigue al jugador
        this.cameras.main.startFollow(this.player);
        

        this.cameras.main.setZoom(4);

        //Crear controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({

            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,

        });

        //velocidad del jugador
        this.playerSpeed = 100;

        this.player.setScale(1.1);

        // Modificar la colisión del jugador: mitad de altura en el eje Y, posicionada en el borde de abajo
        const playerBody = this.player.body;
        const originalHeight = playerBody.height;
        const newHeight = originalHeight / 2; // mitad de la altura
        const offsetY = 16; // desplazar hacia abajo (desde el centro original)
        
        playerBody.setSize(playerBody.width, newHeight);
        playerBody.setOffset(playerBody.offset.x, offsetY);
        
        //Enemigo
        this.cuboR = this.physics.add.sprite(1500, 900, "CuboR");
        this.cuboR.setImmovable(true);
        this.cuboR.setScale(0.7);

        // Detectar overlap/colisión entre el jugador y el cubo rojo
        this.physics.add.overlap(this.player, this.cuboR, this.collectCuboR, null, this);

        // Segundo cubo que sigue al jugador
        this.cuboSeguidor = this.physics.add.sprite(1329, 670, "Mago");
        this.cuboSeguidor.setScale(1.1);
        this.velocidadSeguidor = 100; // velocidad del cubo seguidor
        // No debe ser empujado por el jugador
        this.cuboSeguidor.setImmovable(true);

        // Modificar la colisión del cubo seguidor (opcional, igual que el jugador)
        const seguidorBody = this.cuboSeguidor.body;
        const seguidorOriginalHeight = seguidorBody.height;
        const seguidorNewHeight = seguidorOriginalHeight; // mitad de la altura
        const seguidorOffsetY = 0; // desplazar hacia abajo
        
        seguidorBody.setSize(seguidorBody.width, seguidorNewHeight);
        seguidorBody.setOffset(seguidorBody.offset.x, seguidorOffsetY);

        // Añadir overlap (no bloqueante) entre el jugador y el cubo seguidor
        // Así el jugador puede pasar a través sin ser empujado
        this.physics.add.overlap(this.player, this.cuboSeguidor);
    }

    update(time, delta) {

        //Reiniciar velocidad
        let velocidadX = 0;
        let velocidadY = 0;

        if(this.keys.A.isDown) {

            velocidadX -= this.playerSpeed;

        }
        if(this.keys.D.isDown) {

            velocidadX += this.playerSpeed;

        }

        if(this.keys.W.isDown) {

            velocidadY -= this.playerSpeed;

        }
        if(this.keys.S.isDown) {

            velocidadY += this.playerSpeed;

        }

        // Normalizar la velocidad para evitar que las diagonales sean más rápidas
        const magnitud = Math.sqrt(velocidadX * velocidadX + velocidadY * velocidadY);
        if (magnitud > 0) {
            velocidadX = (velocidadX / magnitud) * this.playerSpeed;
            velocidadY = (velocidadY / magnitud) * this.playerSpeed;
        }

        this.player.setVelocity(velocidadX, velocidadY);

        // Lógica para que el segundo cubo siga al jugador
        const dx = this.player.x - this.cuboSeguidor.x;
        const dy = this.player.y - this.cuboSeguidor.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        const distanciaMinima = 30; // distancia mínima para detenerse (en píxeles)

        if (distancia > distanciaMinima) {
            const velocidadX = (dx / distancia) * this.velocidadSeguidor;
            const velocidadY = (dy / distancia) * this.velocidadSeguidor;
            this.cuboSeguidor.setVelocity(velocidadX, velocidadY);
        } else {
            this.cuboSeguidor.setVelocity(0, 0);
        }
        
    }

    // Callback llamado cuando player colisiona con el cubo rojo
    collectCuboR(player, cubo) {

        // Desactivar el cubo y lanzar la escena de pelea
        cubo.disableBody(true, true);
        console.log('Player colisionó con CuboR — iniciando escena PeleaDebug');
        // Iniciar la escena de pelea (usa la key definida en PeleaDebug.js)
        // Puedes pasar un objeto con datos si la escena de pelea los necesita
        this.scene.start('PeleaDebug', { from: 'EscenaDebug' });
    }

    
}

export default Bootloader;