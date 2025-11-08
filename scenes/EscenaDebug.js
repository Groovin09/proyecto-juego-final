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
        this.load.image("CuboR", "assets/sprites/cubo rojo.png");

        //Mapa
        //Tileset
        this.load.image("Suelo", "assets/Tiles/Suelo.png");
        this.load.image("Paredes", "assets/Tiles/Paredes.png");
        this.load.image("Escaleras", "assets/Tiles/Estructuras piedra.png");
        this.load.image("Objetos", "assets/Tiles/Estructuras.png");
        this.load.image("Plantas", "assets/Tiles/Plantas.png");
        this.load.image("Estructuras", "assets/Tiles/Estructuras piedra.png");

        //JSON
        this.load.tilemapTiledJSON("MapaDebug", "assets/Json/Debug.tmj");

    }

    create() {

        //Mapa
        const map = this.make.tilemap({key: "MapaDebug"});
       
        const SueloTS = map.addTilesetImage("Suelo", "Suelo");
        const ParedesTS = map.addTilesetImage("Paredes", "Paredes");
        const EscalerasTS = map.addTilesetImage("Estructuras piedra", "Escaleras");
        const EstructurasTS = map.addTilesetImage("Objetos", "Objetos");
        const PlantasTS = map.addTilesetImage("Naturaleza", "Plantas");
        
        const sueloLayer = map.createLayer('Suelo', SueloTS, 0, 0);
        const paredesLayer = map.createLayer('Paredes', ParedesTS, 0, 0);
        const escalerasLayer = map.createLayer("Estructuras caminables", EscalerasTS, 0, 0);
        const objetosLayer = map.createLayer("interactuables", EstructurasTS, 0, 0);
        const PlantasLayer = map.createLayer("adornos", PlantasTS, 0, 0);
        const EstructurasLayer = map.createLayer("adornos", EstructurasTS, 0, 0);
        
        
        //Crear fisicas del jugador
        this.player = this.physics.add.sprite(1329, 685, "CuboR")
        this.player.setCollideWorldBounds(false);
        
        paredesLayer.setCollisionBetween(17, 17);
        
        this.physics.add.collider(this.player, paredesLayer);
        
        
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

        this.player.setScale(0.7);
    }

    update(time, delta) {

        //Reiniciar velocidad
        this.player.setVelocity(0);

        if(this.keys.A.isDown) {

            this.player.setVelocityX(-this.playerSpeed);

        }
        else if(this.keys.D.isDown) {

            this.player.setVelocityX(this.playerSpeed);

        }

        if(this.keys.W.isDown) {

            this.player.setVelocityY(-this.playerSpeed);

        }
        else if(this.keys.S.isDown) {

            this.player.setVelocityY(this.playerSpeed);

        }

        
    }

}

export default Bootloader;