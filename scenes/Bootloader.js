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

        //Cargar audio
        this.load.audio("Prelude", "assets/audio/PreludeFF7.mp3");

        
        
    }

    create() {

        //Eventos
        const eventos = Phaser.Input.Events;

        //Crear imagenes
        this.BotonInicio = this.add.image(100, 900, "CuboR");
        this.BotonConfig = this.add.image(100, 900, "CuboR");
        this.BotonCreditos = this.add.image(100, 900, "CuboR");
        this.BotonSalir = this.add.image(100, 900, "CuboR");

        this.PantallaGuardado1 = this.add.image(700, -100, "CuboR");
        this.PantallaGuardado2 = this.add.image(1000, -100, "CuboR");

        this.PantallaSecundaria = this.add.image(850, 1300, "PantallaG");
        this.BotonSalirConfig = this.add.image(1400, 1300, "CuboR");

        const Botones = [this.BotonInicio, this.BotonConfig, this.BotonCreditos, this.BotonSalir];

        //Configurar imagenes Escala
        this.BotonInicio.setScale(3);
        this.BotonConfig.setScale(3);
        this.BotonCreditos.setScale(3);
        this.BotonSalir.setScale(3);

        this.PantallaGuardado1.setScale(6);
        this.PantallaGuardado2.setScale(6);

        this.PantallaSecundaria.setScale(35);
        this.BotonSalirConfig.setScale(3);

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
    
        //Crear audio
        this.MusicaMenu = this.sound.add("Prelude", { loop: true, volume: 1 });

        //Configurar audio
        this.MusicaMenu.play();

        //Tweens
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
        
        
    }

    update(time, delta) {

        

    }
}

export default Bootloader;