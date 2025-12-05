export default class Final extends Phaser.Scene {
    constructor() {
        super({ key: 'Final' });
    }

    preload() {
        // Carga assets necesarios para la escena Final (añade según necesites)
    }

    create() {
        // Simple placeholder final scene
        const { width, height } = this.scale;
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0, 0);
        // Texto principal centrado
        this.add.text(width / 2, height / 2 - 20, 'Gracias por jugar', {
            font: '48px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Texto secundario en la siguiente línea, centrado
        this.add.text(width / 2, height / 2 + 30, 'Nos vemos en  RISE 2', {
            font: '24px Arial',
            fill: '#dddddd'
        }).setOrigin(0.5);

        // Crear zona / portal de salida para volver a EscenaDebug
        const zone = this.add.zone(width / 2, height - 120, 200, 80);
        this.physics.world.enable(zone, 0);
        zone.body.setAllowGravity(false);
        zone.setOrigin(0.5);

        // Hacer zona interactiva
        this.input.keyboard.on('keydown-E', () => {
            // Volver a EscenaDebug
            this.scene.start('EscenaDebug');
        });

        console.log('Final: create() ready');
    }

    update() {
        // Lógica de la escena final (si es necesario)
    }
}
