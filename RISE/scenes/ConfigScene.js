class ConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConfigScene' });
    }

    preload() {
        // Cargar assets si es necesario
    }

    create() {
        // === OBTENER VOLUMEN ACTUAL ===
        // Si no hay volumen guardado en registry, usar 1.0 (100%)
        let currentVolume = this.registry.get('globalVolume') || 1.0;
        this.volumeLevel = currentVolume;
        this.panelOpen = true; // Panel comienza abierto (está animando hacia dentro)

        // === OBTENER DIMENSIONES DEL CANVAS ===
        const canvasWidth = this.game.config.width;
        const canvasHeight = this.game.config.height;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Guardar coordenadas para usarlas después
        this.centerX = centerX;
        this.centerY = centerY;
        this.barWidth = 300;

        // === FONDO SEMITRANSPARENTE ===
        this.panelBackground = this.add.rectangle(centerX, centerY - 1000, 600, 550, 0x1a1a1a, 0.95)
            .setOrigin(0.5, 0.5)
            .setDepth(100)
            .setStrokeStyle(3, 0xFFFF00);

        // === TÍTULO ===
        this.titleText = this.add.text(centerX, centerY - 950, 'CONFIGURACION', {
            font: 'bold 40px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5)
            .setDepth(101);

        // === SECCIÓN DE VOLUMEN ===
        this.volumeLabel = this.add.text(centerX, centerY - 880, 'VOLUMEN', {
            font: 'bold 32px Arial',
            fill: '#00FF00'
        }).setOrigin(0.5, 0.5)
            .setDepth(101);

        // === INDICADOR NUMÉRICO DE VOLUMEN ===
        const volumePercent = Math.round(this.volumeLevel * 100);
        this.volumeText = this.add.text(centerX, centerY - 800, `${volumePercent}%`, {
            font: 'bold 48px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5)
            .setDepth(101);

        // === BOTÓN BAJAR VOLUMEN ===
        const btnDownX = centerX - 150;
        const btnDownY = centerY - 720;
        const btnSize = 60;

        this.btnDown = this.add.rectangle(btnDownX, btnDownY, btnSize, btnSize, 0xFF0000)
            .setOrigin(0.5, 0.5)
            .setDepth(101);
        this.btnDown.setInteractive();
        this.btnDown.setStrokeStyle(2, 0xFFFFFF);

        this.add.text(btnDownX, btnDownY, '-', {
            font: 'bold 40px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5)
            .setDepth(102);

        // === BOTÓN SUBIR VOLUMEN ===
        const btnUpX = centerX + 150;
        const btnUpY = centerY - 720;

        this.btnUp = this.add.rectangle(btnUpX, btnUpY, btnSize, btnSize, 0x00FF00)
            .setOrigin(0.5, 0.5)
            .setDepth(101);
        this.btnUp.setInteractive();
        this.btnUp.setStrokeStyle(2, 0xFFFFFF);

        this.add.text(btnUpX, btnUpY, '+', {
            font: 'bold 40px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5)
            .setDepth(102);

        // === BARRA DE VOLUMEN VISUAL ===
        const barX = centerX;
        const barY = centerY - 620;
        const barWidth = 300;
        const barHeight = 30;

        // Fondo de la barra (gris)
        this.add.rectangle(barX, barY, barWidth, barHeight, 0x444444)
            .setOrigin(0.5, 0.5)
            .setDepth(101);

        // Barra de volumen (dinámica) - origen en el centro para que crezca correctamente
        this.volumeBar = this.add.rectangle(barX, barY, barWidth * this.volumeLevel, barHeight, 0x00FF00)
            .setOrigin(0.5, 0.5)
            .setDepth(101);
        
        // Guardar la posición X original de la barra para actualizaciones
        this.volumeBarX = barX;
        this.volumeBarY = barY;
        this.volumeBarHeight = barHeight;

        // === EVENTOS DE LOS BOTONES ===
        this.btnDown.on('pointerdown', () => {
            this.changeVolume(-0.1);
        });

        this.btnUp.on('pointerdown', () => {
            this.changeVolume(0.1);
        });

        // Hover effects
        this.btnDown.on('pointerover', () => {
            this.btnDown.setScale(1.1);
        });

        this.btnDown.on('pointerout', () => {
            this.btnDown.setScale(1);
        });

        this.btnUp.on('pointerover', () => {
            this.btnUp.setScale(1.1);
        });

        this.btnUp.on('pointerout', () => {
            this.btnUp.setScale(1);
        });

        // === BOTÓN CERRAR / SALIR ===
        this.closeText = this.add.text(centerX, centerY - 500, 'Press ESC to close', {
            font: '18px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5)
            .setDepth(101);

        // === CONTROLES DE TECLADO ===
        this.input.keyboard.on('keydown-ESC', () => {
            this.toggleConfig();
        });

        // Acceso rápido con teclas +/- del teclado
        this.input.keyboard.on('keydown-PLUS', () => {
            this.changeVolume(0.1);
        });

        this.input.keyboard.on('keydown-MINUS', () => {
            this.changeVolume(-0.1);
        });

        // === ANIMAR PANEL ENTRANDO ===
        this.tweens.add({
            targets: [this.panelBackground, this.titleText, this.volumeLabel, this.volumeText, 
                      this.btnDown, this.btnUp, this.volumeBar, this.closeText],
            y: (target) => {
                // Cada elemento sube hacia su posición final (se le suma 1000)
                return target.y + 1000;
            },
            duration: 600,
            ease: 'Power2.out'
        });
        
        this.panelOpen = true; // El panel comienza abierto
    }

    changeVolume(delta) {
        // Cambiar volumen en incrementos de 10%
        this.volumeLevel = Math.max(0, Math.min(1, this.volumeLevel + delta));

        // Aplicar volumen global a todos los sonidos del juego
        this.sound.volume = this.volumeLevel;

        // Guardar en registry
        this.registry.set('globalVolume', this.volumeLevel);

        // Actualizar UI
        this.actualizarUI();

        console.log(`Volume changed to: ${Math.round(this.volumeLevel * 100)}%`);
    }

    actualizarUI() {
        // Actualizar texto del porcentaje
        const volumePercent = Math.round(this.volumeLevel * 100);
        this.volumeText.setText(`${volumePercent}%`);

        // Actualizar barra visual - usar las coordenadas guardadas
        this.volumeBar.setDisplayOrigin(0, 0);
        this.volumeBar.setOrigin(0.5, 0.5);
        this.volumeBar.width = this.barWidth * this.volumeLevel;
        this.volumeBar.x = this.volumeBarX;
    }

    toggleConfig() {
        // Solo permitir cerrar (bajar el panel)
        if (this.panelOpen) {
            // Panel está abierto, cerrarlo
            this.tweens.add({
                targets: [this.panelBackground, this.titleText, this.volumeLabel, this.volumeText, 
                          this.btnDown, this.btnUp, this.volumeBar, this.closeText],
                y: (target) => {
                    return target.y - 1000;
                },
                duration: 600,
                ease: 'Power2.out',
                onComplete: () => {
                    // Cuando la animación termine, volver a Bootloader
                    this.scene.stop('ConfigScene');
                    this.scene.resume('Bootloader');
                }
            });
            this.panelOpen = false;
        }
    }

    update() {
        // El update no es necesario para esta escena estática
    }
}

export default ConfigScene;
