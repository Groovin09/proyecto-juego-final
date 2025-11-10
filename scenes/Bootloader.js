class Bootloader extends Phaser.Scene{
    constructor(){
        super({
            key: "Bootloader" //Nombre interno o clave de referencia
        });
    }

    init() {
        
        console.log("Soy init");
    }

    preload() {

        //Cargar imagenes
        this.load.image("CuboR", "assets/sprites/cubo rojo.png");
        this.load.image("PantallaG", "assets/sprites/pantalla1.png");

        //Titulo
        this.load.image("Titulo", "assets/sprites/Titulo/Titulo sin enredaderas.png");
        this.load.image("Espada", "assets/sprites/Titulo/Espada sin enredaderas.png");

        //Letras titulo

        this.load.image("BotonJugar", "assets/sprites/Titulo/Jugar.png");
        this.load.image("BotonConfig", "assets/sprites/Titulo/Opciones.png");
        this.load.image("BotonCreditos", "assets/sprites/Titulo/Creditos.png");
        this.load.image("BotonSalir", "assets/sprites/Titulo/Salir del juego.png");

        //Cielos
        this.load.image("CieloAzul1", "assets/sprites/Cielos/Cielo 1/1.png");
        this.load.image("CieloAzul2", "assets/sprites/Cielos/Cielo 1/2.png");
        this.load.image("CieloAzul3", "assets/sprites/Cielos/Cielo 1/3.png");
        this.load.image("CieloAzul4", "assets/sprites/Cielos/Cielo 1/4.png");

        this.load.image("CieloNoche1", "assets/sprites/Cielos/Cielo 2/1.png");
        this.load.image("CieloNoche2", "assets/sprites/Cielos/Cielo 2/2.png");
        this.load.image("CieloNoche3", "assets/sprites/Cielos/Cielo 2/3.png");
        this.load.image("CieloNoche4", "assets/sprites/Cielos/Cielo 2/4.png");

        //Cargar audio
        this.load.audio("Prelude", "assets/audio/PreludeFF7.mp3");

        
        
    }

    create() {

        //Crear audio
        this.MusicaMenu = this.sound.add("Prelude", { loop: true, volume: 1 });

        //Configurar audio
        this.MusicaMenu.play();

        //Eventos
        const eventos = Phaser.Input.Events;

        //Crear imagenes
        this.BotonInicio = this.add.image(150, 900, "BotonJugar");
        this.BotonConfig = this.add.image(200, 900, "BotonConfig");
        this.BotonCreditos = this.add.image(200, 900, "BotonCreditos");
        this.BotonSalir = this.add.image(325, 900, "BotonSalir");

        this.PantallaGuardado1 = this.add.image(700, -100, "CuboR");
        this.PantallaGuardado2 = this.add.image(1000, -100, "CuboR");

        this.PantallaSecundaria = this.add.image(850, 1300, "PantallaG");
        this.BotonSalirConfig = this.add.image(1400, 1300, "CuboR");

        //Titulo===============================================================================================================

        this.TituloJuego = this.add.image(450, 200, "Titulo");
        this.EspadaTitulo = this.add.image(450, 200, "Espada");

        // Fondos: escoger aleatoriamente entre Cielo 1 (día) y Cielo 2 (noche)
        const skyChoice = Phaser.Math.Between(1, 2); // 1 => Cielo 1, 2 => Cielo 2

        if (skyChoice === 1) {

            // Cielo 1 (día)
            this.Cielo1Fondo = this.add.image(600, 300, "CieloAzul1");
            this.Cielo2Fondo = this.add.image(860, 400, "CieloAzul2");
            this.Cielo3Fondo = this.add.image(860, 440, "CieloAzul3");
            this.Cielo4Fondo = this.add.image(860, -40, "CieloAzul4");
            // marcar grupo actual para lógica posterior
            this.activeSkyGroup = 'day';

        } else {

            // Cielo 2 (noche)
            this.Cielo1Fondo = this.add.image(600, 300, "CieloNoche1");
            this.Cielo2Fondo = this.add.image(860, 400, "CieloNoche2");
            this.Cielo3Fondo = this.add.image(860, 440, "CieloNoche3");
            this.Cielo4Fondo = this.add.image(860, 350, "CieloNoche4");
            this.activeSkyGroup = 'night';

        }

        //Cielo 3
        

        //Botones config

        const Botones = [this.BotonInicio, this.BotonConfig, this.BotonCreditos, this.BotonSalir];

        //Configurar imagenes Escala
        this.BotonInicio.setScale(7);
        this.BotonConfig.setScale(7);
        this.BotonCreditos.setScale(7);
        this.BotonSalir.setScale(7);

        this.PantallaGuardado1.setScale(6);
        this.PantallaGuardado2.setScale(6);

        this.PantallaSecundaria.setScale(35);
        this.BotonSalirConfig.setScale(3);

        this.TituloJuego.setScale(10);
        this.EspadaTitulo.setScale(10);

        // Escalar los 4 elementos del cielo activo
        this.Cielo1Fondo.setScale(4);
        this.Cielo2Fondo.setScale(3.2);
        this.Cielo3Fondo.setScale(3.5);
        this.Cielo4Fondo.setScale(3.2);

        //Configurar capas

        //Titulo

        this.TituloJuego.setDepth(10);
        this.EspadaTitulo.setDepth(9);

        // Profundidad (depth) para las 4 capas del cielo activo
        this.Cielo1Fondo.setDepth(1);
        this.Cielo2Fondo.setDepth(2);
        this.Cielo3Fondo.setDepth(3);
        this.Cielo4Fondo.setDepth(2);

        //Contenido
        //Botones

        this.BotonInicio.setDepth(10);
        this.BotonConfig.setDepth(10);
        this.BotonCreditos.setDepth(10);
        this.BotonSalir.setDepth(10);

        this.PantallaGuardado1.setDepth(10);
        this.PantallaGuardado2.setDepth(10);

        this.PantallaSecundaria.setDepth(10);
        this.BotonSalirConfig.setDepth(10);

        //Configurar imagenes Opacidad
        this.PantallaSecundaria.setAlpha(0.9);

        //interactivos
        this.BotonInicio.setInteractive();
        this.BotonConfig.setInteractive();
        this.BotonCreditos.setInteractive();
        this.BotonSalir.setInteractive();
        this.BotonSalirConfig.setInteractive();

        this.PantallaGuardado1.setInteractive();

        this.pantallaArriba = false;
        this.BotonSalirConfigArriba = false;

        //Tweens

        //Fondo
        //Cielo1

        this.tweens.add({

            targets: this.Cielo2Fondo,
            x: "+= 50",
            duration: 10000,
            ease: "Power3",
            yoyo: true,
            repeat: -1,
            hold: 3000

        });

        this.tweens.add({

            targets: this.Cielo3Fondo,
            x: 1000,
            duration: 10000,
            ease: "Power3",
            yoyo: true,
            repeat: -1,
            hold: 3000

        });

        this.tweens.add({

            targets: this.Cielo4Fondo,
            x: "-= 50",
            duration: 10000,
            ease: "Power3",
            yoyo: true,
            repeat: -1,
            hold: 3000

        });

        //botones
        this.tweens.add({

            targets: this.BotonInicio,
            y: 480,
            duration: 1000,
            ease: "Power2"

        });

        this.tweens.add({

            delay: 100,
            targets: this.BotonConfig,
            y: 600,
            duration: 1000,
            ease: "Power2"

        });

        this.tweens.add({

            delay: 100,
            targets: this.BotonCreditos,
            y: 720,
            duration: 1000,
            ease: "Power2"

        });

        this.tweens.add({

            delay: 100,
            targets: this.BotonSalir,
            y: 840,
            duration: 1000,
            ease: "Power2"

        });

        //Movimiento de botones sobre ellos
       
        Botones.forEach(obj => {
            obj.originalX = obj.x;

            obj.on('pointerover', () => {
                this.tweens.add({
                    targets: obj,
                    x: obj.originalX + 30,
                    duration: 150,
                    ease: 'Power2'
                });
            });

            obj.on('pointerout', () => {
                this.tweens.add({
                    targets: obj,
                    x: obj.originalX,
                    duration: 150,
                    ease: 'Power2'
                });
            });
        });

        //Boton inicio

        this.BotonInicio.on('pointerdown', this.moverPantallaSeleccion, this);
        this.BotonInicio.on('pointerdown', this.manejarToggle, this);
        this.originalY = this.PantallaGuardado1.y;
        this.objetosAbajo = false;
        this.descenso = 550;

        //pantallaCarga

        this.PantallaGuardado1.on('pointerdown', this.cargarSiguienteEscena, this);


        //Boton Config
        this.BotonConfig.on('pointerdown', () => {
            if (!this.pantallaArriba) {

                this.tweens.add({
                    targets: this.PantallaSecundaria,
                    y: this.PantallaSecundaria.y - 850,
                    duration: 600,
                    ease: 'Power2'
                });

                this.pantallaArriba = true;
            }

            if (!this.BotonSalirConfigArriba) {

                this.tweens.add({
                    targets: this.BotonSalirConfig,
                    y: this.PantallaSecundaria.y - 1200,
                    duration: 555,
                    ease: 'Power2'
                });

                this.BotonSalirConfigArriba = true;
            }
        });

        this.BotonSalirConfig.on('pointerdown', () => {
            
            if (this.pantallaArriba) {

                this.tweens.add({

                    targets: this.PantallaSecundaria,
                    y: this.PantallaSecundaria.y + 850,
                    duration: 600,
                    ease: 'Power2'

                });

                this.pantallaArriba = false;
            }

            if (this.BotonSalirConfigArriba) {

                this.tweens.add({

                    targets: this.BotonSalirConfig,
                    y: this.BotonSalirConfig.y + 860,
                    duration: 600,
                    ease: 'Power2'

                });

                this.BotonSalirConfigArriba = false;
            }
        });

        
    }

    moverPantallaSeleccion() {
        
        this.tweens.add({

            targets: [this.BotonConfig, this.BotonCreditos, this.BotonSalir],
            x: - 300,
            duration: 500,
            ease: "Power2"

        });
        
    }

    manejarToggle() {
        let targetY;

        // **Estructura IF/ELSE para decidir la dirección:**
        if (this.objetosAbajo) {
            // Si el estado es TRUE (están ABAJO), el objetivo es SUBIR.
            targetY = this.originalY; 
            this.objetosAbajo = false; // Cambiamos el estado para el siguiente clic

           this.tweens.add({

            targets: [this.BotonConfig, this.BotonCreditos, this.BotonSalir],
            x: - 300,
            duration: 500,
            ease: "Power2"

        });
            
        } else {
            // Si el estado es FALSE (están ARRIBA), el objetivo es BAJAR.
            targetY = this.originalY + this.descenso; 
            this.objetosAbajo = true; // Cambiamos el estado para el siguiente clic

            
        }

        // Ejecutar el movimiento suave (Tween) con el destino (targetY) calculado
        this.tweens.add({
            targets: [this.PantallaGuardado1, this.PantallaGuardado2],
            y: targetY,
            duration: 1000,
            ease: 'Power3'
        });

    }    

    cargarSiguienteEscena() {
       
        this.scene.start('EscenaDebug'); 
        
        this.MusicaMenu.stop();
        
    }

    update(time, delta) {

        

    }
}

export default Bootloader;