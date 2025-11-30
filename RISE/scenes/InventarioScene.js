export default class InventarioScene extends Phaser.Scene {
    constructor() {
        super("InventarioScene");

        // Inventario con objetos dinámicos
        this.inventario = {};

        // Información de cada ítem
        this.itemsData = {
            totemVida: {
                nombre: "Tótem de Vitalidad",
                descripcion: "Tótem de Vitalidad Ancestral:\nUn artefacto que palpita con energía.\nAumenta tu Salud Máxima un 10%.",
                atlasKey: 'totemVida',
                animKey: 'idle_totemVida',
                scale: 3
            }
            // Puedes añadir más ítems aquí: { nombre, descripcion, atlasKey, animKey, scale }
        };
    }

    preload() {
        // Cargar atlas de cada ítem dinámicamente
        this.load.atlas(
            'totemVida',
            'assets/Animaciones/Mago/totemvidasck.png',
            'assets/Animaciones/Mago/totemvidasck.json'
        );
    }

    create() {
        // Crear animaciones dinámicamente según itemsData
        for (const key in this.itemsData) {
            const item = this.itemsData[key];
            if (!this.anims.get(item.animKey)) {
                this.anims.create({
                    key: item.animKey,
                    frames: this.anims.generateFrameNames(item.atlasKey, {
                        prefix: 'tptemvidasck ',
                        suffix: '.aseprite',
                        start: 0,
                        end: 8
                    }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        }

        // Fondo semitransparente
        this.fondoOscuro = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setOrigin(0, 0);

        // Título
        this.add.text(this.scale.width / 2, 100, "INVENTARIO", {
            font: "40px Arial",
            fill: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Contenedor para items
        this.itemsContainer = this.add.container(0, 0);

        // Evento: recibir objeto
        this.game.events.on("agregarAlInventario", (objeto) => {
            if (!this.inventario[objeto.tipo]) {
                this.inventario[objeto.tipo] = true;
                console.log(`>> Inventario: ${objeto.tipo} añadido.`);
                this.actualizarInterfaz();
            }
        });

        // Evento: despertar escena
        this.events.on('wake', () => {
            this.actualizarInterfaz();
            this.time.delayedCall(100, () => {
                this.input.keyboard.on('keydown-I', this.cerrarInventario, this);
            });
        });
    }

    cerrarInventario() {
        this.input.keyboard.off('keydown-I', this.cerrarInventario, this);
        this.scene.sleep();
        this.scene.resume('EscenaDebug');
    }

    actualizarInterfaz() {
        // Limpiar contenedor antes de dibujar
        this.itemsContainer.removeAll(true);

        let yPos = 200;
        const spacing = 150; // Espacio vertical entre items

        // Si no hay items
        const keysInventario = Object.keys(this.inventario).filter(k => this.inventario[k]);
        if (keysInventario.length === 0) {
            const vacio = this.add.text(this.scale.width / 2, this.scale.height / 2, "Inventario Vacío", {
                font: "24px Arial",
                fill: "#666666"
            }).setOrigin(0.5);
            this.itemsContainer.add(vacio);
        }

        // Dibujar todos los ítems
        keysInventario.forEach((key) => {
            const data = this.itemsData[key];

            const sprite = this.add.sprite(300, yPos, data.atlasKey)
                .setScale(data.scale)
                .setOrigin(0.5);

            if (this.anims.exists(data.animKey)) {
                sprite.play(data.animKey);
            } else {
                console.warn(`Animación '${data.animKey}' no encontrada`);
            }

            const textoNombre = this.add.text(400, yPos - 30, data.nombre, {
                font: "28px Arial",
                fill: "#FFFF00",
                fontStyle: "bold"
            });

            const textoDesc = this.add.text(400, yPos + 10, data.descripcion, {
                font: "18px Arial",
                fill: "#cccccc",
                wordWrap: { width: 600 }
            });

            this.itemsContainer.add([sprite, textoNombre, textoDesc]);
            yPos += spacing;
        });

        // Instrucción para salir
        const salirTxt = this.add.text(this.scale.width / 2, this.scale.height - 50, "Presiona 'I' para cerrar", {
            font: "16px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);
        this.itemsContainer.add(salirTxt);
    }
}
