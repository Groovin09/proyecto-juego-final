export default class Creditos extends Phaser.Scene {
    constructor() {
        super({ key: 'Creditos' });
    }

    preload() {
        // No assets required for simple credits
    }

    create() {
        const { width, height } = this.scale;

        // Fondo negro
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0, 0);

        // Líneas de crédito (puedes añadir/quitar líneas aquí)
        const lines = [
            '',
            '',
            'Un juego elaborado por',
            '',
            'Juarez Ortiz Jesus Ramses',
            '',
            'Garcia Vasquez Daniel Valerio',
            '',
            '',
            'Con música de',
            '',
            'Final Fantasy VII',
            '',
            'Final Fantasy XV',
            '',
            '',
            'Con efectos de sonido de',
            '',
            'Undertale',
            '',
            '',
            'Gracias por jugar',
            '',
            '',
            'Presiona E para volver'
        ];

        const titleStyle = { font: '34px Arial', fill: '#ffffff', align: 'center' };
        const nameStyle = { font: '26px Arial', fill: '#ffffff', align: 'center' };
        const footStyle = { font: '18px Arial', fill: '#cccccc', align: 'center' };

        // Crear un contenedor para las líneas y posicionarlo por debajo de la pantalla
        this.creditsContainer = this.add.container(0, height + 20);

        let y = 0;
        lines.forEach((text, idx) => {
            const style = (text === 'Un juego elaborado por' || text === 'Gracias por jugar') ? titleStyle : (text === 'Presiona E para volver' ? footStyle : nameStyle);
            const txt = this.add.text(width / 2, y, text, style).setOrigin(0.5, 0);
            // asegurar que cada línea esté centrada horizontalmente dentro del contenedor
            this.creditsContainer.add(txt);
            y += txt.height + 24; // espacio entre líneas
        });

        const totalHeight = y;

        // Hacer scroll hacia arriba: desde (height + 20) hasta -(totalHeight)
        const startY = height + 20;
        const endY = -totalHeight - 20;

        // Velocidad en píxeles por segundo
        const speed = 40; // ajustar para acelerar/ralentizar
        const distance = startY - endY;
        const duration = (distance / speed) * 1000;

        this.tweens.add({
            targets: this.creditsContainer,
            y: endY,
            duration: Math.max(3000, duration),
            ease: 'Linear',
            onComplete: () => {
                // Al terminar, volver al menú principal (Bootloader)
                this.scene.start('Bootloader');
            }
        });

        // Permitir pulsar E para volver antes de que termine
        this.input.keyboard.on('keydown-E', () => {
            // Detener todo y volver al menú
            this.scene.start('Bootloader');
        });

        // También permitir click o tap para volver
        this.input.on('pointerdown', () => {
            this.scene.start('Bootloader');
        });
    }

    update() {
        // el tween se encarga del movimiento
    }
}
