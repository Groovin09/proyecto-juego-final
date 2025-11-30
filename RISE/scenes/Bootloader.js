class Bootloader extends Phaser.Scene{
    constructor(){
        super({
            key: "Bootloader" //Nombre interno o clave de referencia
        });
    }

    showGameOptions() {
        // Si ya están abiertas, no hacemos nada (o las cerramos)
        if (this.optionsOpen) return;
        this.optionsOpen = true;
    // objetivos finales: se extienden hacia la derecha desde BotonInicio
    // Nueva Partida irá arriba, Continuar irá abajo para evitar tapar el botón Opciones
    const offsetXContinuar = 305; // más hacia la derecha
    const offsetX = 360; // más hacia la derecha
    const targetX = this.BotonInicio.x + offsetX;
    const targetXContinuar = this.BotonInicio.x + offsetXContinuar;
    const targetY1 = this.BotonInicio.y - 40; // Nueva Partida (arriba, menos separación)
    const targetY2 = this.BotonInicio.y + 40;  // Continuar (abajo, menos separación)
    const targetScale = 5; // un poco más pequeños

        // tween: escalar y mover los botones desde la posición del BotonInicio hacia la derecha
        this.tweens.add({
            targets: this.BotonNuevaPartida,
            x: targetX,
            y: targetY1,
            scale: targetScale,
            alpha: { from: 0, to: 1 },
            duration: 400,
            ease: 'Back',
        });

        this.tweens.add({
            targets: this.BotonContinuar,
            delay: 80,
            x: targetXContinuar,
            y: targetY2,
            scale: targetScale,
            alpha: { from: 0, to: 1 },
            duration: 450,
            ease: 'Back',
        });
    }

    hideGameOptions() {
        if (!this.optionsOpen) return;
        this.optionsOpen = false;

        // retraer los botones hacia BotonInicio
        this.tweens.add({
            targets: [this.BotonNuevaPartida, this.BotonContinuar],
            x: this.BotonInicio.x,
            y: this.BotonInicio.y,
            scale: 0,
            duration: 300,
            ease: 'Power2'
        });
    }

    toggleGameOptions() {
        // Alterna la visibilidad de las opciones: si están abiertas las cierra, si no, las abre
        if (this.optionsOpen) {
            this.hideGameOptions();
        } else {
            this.showGameOptions();
        }
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

        this.load.image("BotonNuevaPartida", "assets/sprites/Titulo/Nueva Partida.png");
        this.load.image("BotonContinuar", "assets/sprites/Titulo/Continuar.png");

        //Cielos
        this.load.image("CieloAzul1", "assets/sprites/Cielos/Cielo 1/1.png");
        this.load.image("CieloAzul2", "assets/sprites/Cielos/Cielo 1/2.png");
        this.load.image("CieloAzul3", "assets/sprites/Cielos/Cielo 1/3.png");
        this.load.image("CieloAzul4", "assets/sprites/Cielos/Cielo 1/4.png");

        this.load.image("CieloNoche1", "assets/sprites/Cielos/Cielo 2/1.png");
        this.load.image("CieloNoche2", "assets/sprites/Cielos/Cielo 2/2.png");
        this.load.image("CieloNoche3", "assets/sprites/Cielos/Cielo 2/3.png");
        this.load.image("CieloNoche4", "assets/sprites/Cielos/Cielo 2/4.png");

        this.load.image("CieloAtardecer1", "assets/sprites/Cielos/Cielo 3/1.png");
        this.load.image("CieloAtardecer2", "assets/sprites/Cielos/Cielo 3/2.png");
        this.load.image("CieloAtardecer3", "assets/sprites/Cielos/Cielo 3/3.png");
        this.load.image("CieloAtardecer4", "assets/sprites/Cielos/Cielo 3/4.png");

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

        // Fondos: escoger según la hora del día
        const currentHour = new Date().getHours();
        let skyChoice;

        // 8:00 - 16:59 => Día
        // 17:00 - 18:59 => Atardecer
        // 19:00 - 5:59 => Noche
        // 6:00 - 7:59 => Amanecer (atardecer)

        if (currentHour >= 8 && currentHour < 17) {
            skyChoice = 1; // Día
        } else if (currentHour >= 17 && currentHour < 19) {
            skyChoice = 3; // Atardecer
        } else if (currentHour >= 19 || currentHour < 6) {
            skyChoice = 2; // Noche
        } else if (currentHour >= 6 && currentHour < 8) {
            skyChoice = 3; // Amanecer (atardecer)
        }

        if (skyChoice === 1) {
            // Cielo 1 (día)
            this.Cielo1Fondo = this.add.image(600, 300, "CieloAzul1");
            this.Cielo2Fondo = this.add.image(860, 400, "CieloAzul2");
            this.Cielo3Fondo = this.add.image(860, 440, "CieloAzul3");
            this.Cielo4Fondo = this.add.image(860, -40, "CieloAzul4");
            
            // marcar grupo actual para lógica posterior
            this.activeSkyGroup = 'day';

        } else if (skyChoice === 2) {
            // Cielo 2 (noche)
            this.Cielo1Fondo = this.add.image(600, 300, "CieloNoche1");
            this.Cielo2Fondo = this.add.image(860, 400, "CieloNoche2");
            this.Cielo3Fondo = this.add.image(860, 440, "CieloNoche3");
            this.Cielo4Fondo = this.add.image(860, 350, "CieloNoche4");
            this.activeSkyGroup = 'night';

        } else {
            // Cielo 3 (atardecer)
            this.Cielo1Fondo = this.add.image(600, 300, "CieloAtardecer1");
            this.Cielo2Fondo = this.add.image(860, 400, "CieloAtardecer2");
            this.Cielo3Fondo = this.add.image(860, 440, "CieloAtardecer3");
            this.Cielo4Fondo = this.add.image(860, 400, "CieloAtardecer4");
            this.activeSkyGroup = 'sunset';
        }

        //Botones config
        

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
        // Si es el grupo de atardecer, Cielo4 va por encima de Cielo3
        if (this.activeSkyGroup === 'sunset') {
            this.Cielo4Fondo.setDepth(4);
        } else {
            this.Cielo4Fondo.setDepth(2);
        }

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

        //Boton inicio: ahora mostrará opciones (Nueva Partida / Continuar) con tweens
        this.optionsOpen = false; // estado de las opciones de juego
        // crear los botones de opción pero manteniéndolos sobre el BotonInicio (serán animados)
        this.BotonNuevaPartida = this.add.image(this.BotonInicio.x, this.BotonInicio.y, 'BotonNuevaPartida');
        this.BotonContinuar = this.add.image(this.BotonInicio.x, this.BotonInicio.y, 'BotonContinuar');
        // mismo escalado inicial que el resto pero empezamos con scale 0 para 'extender'
        this.BotonNuevaPartida.setScale(0);
        this.BotonContinuar.setScale(0);
        this.BotonNuevaPartida.setAlpha(0);
        this.BotonContinuar.setAlpha(0);
        this.BotonNuevaPartida.setDepth(11);
        this.BotonContinuar.setDepth(11);
        this.BotonNuevaPartida.setInteractive();
        this.BotonContinuar.setInteractive();
        // eventos: click en Nuevo inicia escena EscenaDebug
        this.BotonNuevaPartida.on('pointerdown', () => {
            this.scene.start('EscenaDebug');
            this.MusicaMenu.stop();
        });
        // click en continuar simplemente cerrará las opciones (puedes cambiarlo para cargar partida)
        this.BotonContinuar.on('pointerdown', () => {
            this.hideGameOptions();
        });

    // binding del boton jugar para alternar (abrir/cerrar) las opciones
    this.BotonInicio.on('pointerdown', this.toggleGameOptions, this);
        this.originalY = this.PantallaGuardado1.y;
        this.objetosAbajo = false;
        this.descenso = 550;

        //pantallaCarga

        this.PantallaGuardado1.on('pointerdown', this.cargarSiguienteEscena, this);


        //Boton Config
        this.BotonConfig.on('pointerdown', () => {
            // Lanzar la escena de configuración
            this.scene.pause();
            this.scene.launch('ConfigScene');
        });

        //Boton Salir (Exit Game)
        this.BotonSalir.on('pointerdown', () => {
            // Cerrar el juego
            this.game.destroy(true);
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