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
        
        this.load.image("CuboR", "assets/sprites/cubo rojo.png");

    }

    create() {

        //crear imagenes
        this.CuboRojo = this.add.image(200, 300, "CuboR");

        //Escala de imagenes
        this.CuboRojo.setScale(4);

    }
    update(time, delta) {
        // ESTA FUNCION CREA UN CICLO INFINITO


    }

}

export default Bootloader;