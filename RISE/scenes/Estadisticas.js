export default class Estadisticas extends Phaser.Scene {
    constructor() {
        super({ key: 'Estadisticas' });
    }

    preload() {
        // Cargar assets si es necesario
    }

    create() {
        console.log('Estadisticas: create() start');
        // === OBTENER DATOS DE LOS PERSONAJES ===
        // Los datos se pasan a través del registry (almacenamiento global de Phaser)
        let playerData = this.registry.get('playerParty') || [];

        // Si no hay datos disponibles, usar datos por defecto
        if (!playerData || playerData.length === 0) {
            playerData = [
                {
                    name: 'Caballero',
                    type: 'knight',
                    hp: 100,
                    maxHp: 100,
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100,
                    attack: 15,
                    maxNormalUses: 10,
                    maxStrongUses: 5,
                    maxHealUses: 0,
                    normalAttackUses: 10,
                    strongAttackUses: 5,
                    healUses: 0
                },
                {
                    name: 'Mago',
                    type: 'mage',
                    hp: 80,
                    maxHp: 80,
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100,
                    attack: 25,
                    maxNormalUses: 10,
                    maxStrongUses: 0,
                    maxHealUses: 5,
                    normalAttackUses: 10,
                    strongAttackUses: 0,
                    healUses: 5
                }
            ];
        }

        // === FONDO ===
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a2e).setOrigin(0.5, 0.5).setDepth(-1);

        // === TÍTULO ===
        this.add.text(512, 40, 'CHARACTER STATISTICS', {
            font: 'bold 32px Arial',
            fill: '#FFFF00'
        }).setOrigin(0.5, 0.5);

        // === MOSTRAR DATOS DE CADA PERSONAJE ===
        const characterDisplayYStart = 120;
        const characterSpacing = 300; // Espacio vertical entre personajes

        playerData.forEach((character, index) => {
            const yPosition = characterDisplayYStart + index * characterSpacing;
            this.displayCharacterStats(character, yPosition);
        });

        // === INSTRUCCIONES ===
        this.add.text(512, 750, 'Press ENTER to return', {
            font: '16px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5);

        // === CONTROLES ===
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.stop(); // Detener la escena
            const sceneQuePauso = this.registry.get('sceneQuePauso') || 'EscenaDebug';
            this.scene.resume(sceneQuePauso);
        });
    }

    // === MOSTRAR ESTADÍSTICAS DE UN PERSONAJE ===
    displayCharacterStats(character, yPosition) {
        const startX = 150;
        const lineHeight = 35;

        // Nombre y nivel en la parte superior (destacado)
        this.add.text(startX, yPosition, `${character.name.toUpperCase()}`, {
            font: 'bold 28px Arial',
            fill: '#00FF00'
        }).setOrigin(0, 0.5);

        this.add.text(startX + 400, yPosition, `Level ${character.level}`, {
            font: 'bold 24px Arial',
            fill: '#FFD700'
        }).setOrigin(0, 0.5);

        // Mostrar stat de ataque
        if (typeof character.attack === 'number') {
            this.add.text(startX + 540, yPosition, `ATK: ${character.attack}`, {
                font: '18px Arial',
                fill: '#FFFFFF'
            }).setOrigin(0, 0.5);
        }

        // HP
        this.add.text(startX, yPosition + lineHeight, `HP:`, {
            font: 'bold 18px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0, 0.5);

        this.add.text(startX + 120, yPosition + lineHeight, `${character.hp} / ${character.maxHp}`, {
            font: '18px Arial',
            fill: '#FF6B6B'
        }).setOrigin(0, 0.5);

        // Barra de HP visual
        const barWidth = 200;
        const barHeight = 20;
        const hpPercent = Math.max(0, character.hp / character.maxHp);

        // Fondo de la barra (gris)
        this.add.rectangle(startX + 350, yPosition + lineHeight, barWidth, barHeight, 0x444444)
            .setOrigin(0, 0.5);

        // Barra de HP (rojo/verde según salud)
        const barColor = hpPercent > 0.5 ? 0x00FF00 : hpPercent > 0.25 ? 0xFFFF00 : 0xFF0000;
        this.add.rectangle(startX + 350, yPosition + lineHeight, barWidth * hpPercent, barHeight, barColor)
            .setOrigin(0, 0.5);

        // XP / Experiencia
        this.add.text(startX, yPosition + lineHeight * 2, `XP:`, {
            font: 'bold 18px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0, 0.5);

        this.add.text(startX + 120, yPosition + lineHeight * 2, `${character.xp} / ${character.xpToNextLevel}`, {
            font: '18px Arial',
            fill: '#00BFFF'
        }).setOrigin(0, 0.5);

        // Barra de XP visual
        const xpPercent = Math.max(0, Math.min(1, character.xp / character.xpToNextLevel));

        // Fondo de la barra XP (gris)
        this.add.rectangle(startX + 350, yPosition + lineHeight * 2, barWidth, barHeight, 0x444444)
            .setOrigin(0, 0.5);

        // Barra de XP (azul)
        this.add.rectangle(startX + 350, yPosition + lineHeight * 2, barWidth * xpPercent, barHeight, 0x00BFFF)
            .setOrigin(0, 0.5);

        // Ataque Normal
        this.add.text(startX, yPosition + lineHeight * 3, `Normal Attacks:`, {
            font: '16px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0, 0.5);

        this.add.text(startX + 250, yPosition + lineHeight * 3, `${character.normalAttackUses}`, {
            font: '16px Arial',
            fill: '#FFAA00'
        }).setOrigin(0, 0.5);

        // Ataque Fuerte
        this.add.text(startX, yPosition + lineHeight * 3.6, `Strong Attacks:`, {
            font: '16px Arial',
            fill: '#FFFFFF'
        }).setOrigin(0, 0.5);

        this.add.text(startX + 250, yPosition + lineHeight * 3.6, `${character.strongAttackUses}`, {
            font: '16px Arial',
            fill: '#FF4500'
        }).setOrigin(0, 0.5);

        // Curación (solo para Mago)
        if (character.type === 'mage') {
            this.add.text(startX, yPosition + lineHeight * 4.2, `Healing Uses:`, {
                font: '16px Arial',
                fill: '#FFFFFF'
            }).setOrigin(0, 0.5);

            this.add.text(startX + 250, yPosition + lineHeight * 4.2, `${character.healUses}`, {
                font: '16px Arial',
                fill: '#00FF00'
            }).setOrigin(0, 0.5);
        }

        // Separador visual
        this.add.line(0, yPosition + lineHeight * 5.2, 100, 0, 900, 0, 0x666666);
    }

    update() {
        // El update no es necesario para esta escena estática
    }
}