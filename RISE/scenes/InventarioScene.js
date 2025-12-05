export default class InventarioScene extends Phaser.Scene {
    constructor() {
        super("InventarioScene");

        // Inventario con objetos dinámicos (almacena cantidades)
        this.inventario = {}; // ej: { potion: 2, totemVida: 1 }

        // Información de cada ítem
        this.itemsData = {
            totemVida: {
                nombre: "Tótem de Vitalidad",
                descripcion: "Tótem de Vitalidad Ancestral:\nUn artefacto que palpita con energía.\nAumenta tu Salud Máxima un 10%.",
                atlasKey: 'totemVida',
                animKey: 'idle_totemVida',
                scale: 3,
                stackable: false
            },
            potion: {
                nombre: "Poción de Vida",
                descripcion: "Restaura 50 puntos de vida al personaje seleccionado.",
                imageKey: 'potion',
                scale: 1.5,
                stackable: true,
                healAmount: 50
            },
            manaPotion: {
                nombre: "Poción de Maná",
                descripcion: "Restaura energía mágica: otorga hasta +3 usos a los ataques del Mago (no excede el máximo).",
                imageKey: 'manaPotion',
                scale: 1.5,
                stackable: true,
                manaAmount: 3
            },
            phoenixTail: {
                nombre: "Pluma de Fénix",
                descripcion: "Revive a un personaje sin vida, restaurándole el 50% de su salud máxima.",
                imageKey: 'phoenixTail',
                scale: 1.5,
                stackable: true,
                reviveHpPercent: 0.5
            }
        };
    }

    preload() {
        // Cargar atlas de cada ítem dinámicamente
        this.load.atlas(
            'totemVida',
            'assets/Animaciones/Mago/totemvidasck.png',
            'assets/Animaciones/Mago/totemvidasck.json'
        );
        // Cargar sprite de poción (duplicado si ya se cargó en otra escena)
        this.load.image('potion', 'assets/sprites/objetos/fb278.png');
        // Cargar sprite de poción de maná (puede haber sido cargada por otra escena)
        this.load.image('manaPotion', 'assets/sprites/objetos/fb293.png');
        // Cargar sprite de Cola de Fénix
        this.load.image('phoenixTail', 'assets/sprites/objetos/fa259.png');
    }

    create() {
        // Crear animaciones dinámicamente según itemsData
        for (const key in this.itemsData) {
            const item = this.itemsData[key];
            if (item.atlasKey && !this.anims.get(item.animKey)) {
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

        // Variables de navegación del inventario
        this.selectedItemIndex = 0;
        this.inventoryItems = []; // Array con las keys del inventario (items disponibles)
        
        // Variables para controlar input
        this.arrowUpPressed = false;
        this.arrowDownPressed = false;
        this.ePressed = false;
        this.iPressed = false;

        // Evento: recibir objeto (soporta cantidades / acumulable)
        this.game.events.on("agregarAlInventario", (objeto) => {
            const tipo = objeto.tipo;
            const cantidad = Number.isFinite(objeto.cantidad) ? objeto.cantidad : 1;
            if (!this.inventario[tipo]) this.inventario[tipo] = 0;
            this.inventario[tipo] += cantidad;
            console.log(`>> Inventario: ${tipo} +${cantidad} (ahora ${this.inventario[tipo]})`);
            this.actualizarInterfaz();
        });

        // Registrar teclas con listeners genéricos
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'Up') {
                this.selectPreviousItem();
            } else if (event.key === 'ArrowDown' || event.key === 'Down') {
                this.selectNextItem();
            } else if (event.key === 'e' || event.key === 'E') {
                this.useSelectedItem();
            } else if (event.key === 'i' || event.key === 'I') {
                this.cerrarInventario();
            }
        });

        // Evento: despertar escena (cuando se vuelve a abrir después de cerrar)
        this.events.on('wake', () => {
            this.selectedItemIndex = 0;
            this.actualizarInterfaz();
        });
    }

    update() {
        // El input ahora se maneja en el listener 'keydown' genérico
    }

    cerrarInventario() {
        // Dormir la escena (será despertada cuando se presione I de nuevo)
        this.scene.sleep();
        // Reanudar la escena que pausó
        const sceneQuePauso = this.registry.get('sceneQuePauso') || 'EscenaDebug';
        this.scene.resume(sceneQuePauso);
    }

    selectPreviousItem() {
        if (this.inventoryItems.length === 0) return;
        this.selectedItemIndex = (this.selectedItemIndex - 1 + this.inventoryItems.length) % this.inventoryItems.length;
        console.log(`Selected item index: ${this.selectedItemIndex}, Item: ${this.inventoryItems[this.selectedItemIndex]}`);
        this.actualizarInterfaz();
    }

    selectNextItem() {
        if (this.inventoryItems.length === 0) return;
        this.selectedItemIndex = (this.selectedItemIndex + 1) % this.inventoryItems.length;
        console.log(`Selected item index: ${this.selectedItemIndex}, Item: ${this.inventoryItems[this.selectedItemIndex]}`);
        this.actualizarInterfaz();
    }

    useSelectedItem() {
        if (this.inventoryItems.length === 0) return;
        if (this.selectedItemIndex >= this.inventoryItems.length) return;
        
        const selectedKey = this.inventoryItems[this.selectedItemIndex];
        if (!selectedKey) return;
        
        if (selectedKey === 'potion') {
            this.usePotionFromInventory();
        } else if (selectedKey === 'manaPotion') {
            this.useManaPotionFromInventory();
        }
    }

    actualizarInterfaz() {
        // Limpiar contenedor antes de dibujar
        this.itemsContainer.removeAll(true);

        let yPos = 200;
        const spacing = 150; // Espacio vertical entre items
        // Separar items en no-consumibles (izquierda) y consumibles (derecha)
        const allKeys = Object.keys(this.inventario).filter(k => this.inventario[k] > 0);
        const nonConsumables = allKeys.filter(k => !this.itemsData[k].stackable);
        const consumables = allKeys.filter(k => this.itemsData[k].stackable);

        // Guardar lista de consumibles para la navegación con flechas (panel derecho)
        this.inventoryItems = consumables;
        
        // Validar índice seleccionado
        if (this.inventoryItems.length === 0) this.selectedItemIndex = 0;
        if (this.selectedItemIndex >= this.inventoryItems.length) this.selectedItemIndex = this.inventoryItems.length - 1;
        
        console.log(`actualizarInterfaz: inventoryItems=${this.inventoryItems.length}, selectedIdx=${this.selectedItemIndex}`);

        // Dibujar columna izquierda: no-consumibles (información solamente)
        // Usamos más espacio vertical y mayor ancho de wrap para evitar textos solapados
        let leftY = 180;
        const leftSpacing = 180;
        nonConsumables.forEach((key) => {
            const data = this.itemsData[key];
            const cantidad = this.inventario[key];

            // Sprite o animación del totem a la izquierda
            if (data.atlasKey) {
                const sprite = this.add.sprite(160, leftY, data.atlasKey).setScale(data.scale).setOrigin(0.5, 0.5);
                if (this.anims.exists(data.animKey)) sprite.play(data.animKey);
                this.itemsContainer.add(sprite);
            }

            const textoNombre = this.add.text(260, leftY - 18, data.nombre, { font: "20px Arial", fill: "#FFFF00" }).setOrigin(0, 0.5);
            const textoDesc = this.add.text(260, leftY + 10, data.descripcion, { font: "14px Arial", fill: "#cccccc", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
            this.itemsContainer.add([textoNombre, textoDesc]);
            leftY += leftSpacing;
        });

        // Dibujar columna derecha: consumibles (navegable)
        let rightY = 180;
        const rightSpacing = 160;
        if (consumables.length === 0) {
            const noConsum = this.add.text(this.scale.width - 360, rightY, "(No hay consumibles)", { font: "18px Arial", fill: "#cccccc" }).setOrigin(0.5);
            this.itemsContainer.add(noConsum);
        }

        consumables.forEach((key, idx) => {
            const data = this.itemsData[key];
            if (!data) {
                console.warn(`Item data not found for key: ${key}`);
                return; // Saltar este item si no existe
            }
            const cantidad = this.inventario[key];
            const isSelected = (idx === this.selectedItemIndex);
            
            console.log(`Item ${idx}: ${key}, isSelected=${isSelected}, selectedIdx=${this.selectedItemIndex}`);

            // Fondo y highlight si seleccionado
            if (isSelected) {
                const bgRect = this.add.rectangle(this.scale.width - 360, rightY, 520, 100, 0x44aa44, 0.25);
                bgRect.setStrokeStyle(3, 0x44FF44);
                this.itemsContainer.add(bgRect);
            }

            // Sprite en la columna derecha
            let sprite;
            const spriteX = this.scale.width - 520;
            if (data.atlasKey) {
                sprite = this.add.sprite(spriteX, rightY, data.atlasKey).setScale(data.scale).setOrigin(0.5, 0.5);
                if (this.anims.exists(data.animKey)) sprite.play(data.animKey);
            } else if (data.imageKey) {
                sprite = this.add.image(spriteX, rightY, data.imageKey).setScale(data.scale).setOrigin(0.5, 0.5);
            }

            if (isSelected && sprite) sprite.setTint(0xFFFF00);

            const nombreX = this.scale.width - 360;
            const textoNombre = this.add.text(nombreX, rightY - 20, data.nombre, { font: "20px Arial", fill: isSelected ? "#FFFF00" : "#FFFF00" }).setOrigin(0, 0.5);
            let descripcion = data.descripcion;
            if (data.stackable) descripcion += `\nStock: ${cantidad}`;
            const textoDesc = this.add.text(nombreX, rightY + 10, descripcion, { font: "14px Arial", fill: isSelected ? "#FFFF00" : "#cccccc", wordWrap: { width: 380 } }).setOrigin(0, 0.5);

            this.itemsContainer.add([sprite, textoNombre, textoDesc]);
            rightY += rightSpacing;
        });

        // Instrucción para controles (navegación solo panel derecho)
        const instruccion = this.add.text(this.scale.width / 2, this.scale.height - 80, "← Izq: No consumibles | → Der: Consumibles (↑↓ Navegar | E Usar) | I Cerrar", {
            font: "14px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5);
        this.itemsContainer.add(instruccion);

        // Mostrar item seleccionado (derecha)
        if (this.inventoryItems.length > 0 && this.selectedItemIndex < this.inventoryItems.length) {
            const selectedKey = this.inventoryItems[this.selectedItemIndex];
            const selectedData = this.itemsData[selectedKey];
            if (selectedData && selectedData.nombre) {
                const selectedInfo = this.add.text(this.scale.width / 2, this.scale.height - 30, `Seleccionado: ${selectedData.nombre}`, {
                    font: "16px Arial",
                    fill: "#44FF44"
                }).setOrigin(0.5);
                this.itemsContainer.add(selectedInfo);
            }
        }
    }

    // Usar poción desde el inventario - mostrar selección de personaje
    usePotionFromInventory() {
        if (!this.inventario.potion || this.inventario.potion <= 0) {
            console.log("No hay pociones disponibles");
            return;
        }

        const playerParty = this.registry.get('playerParty') || [];
        const aliveAllies = playerParty.filter(p => p.hp > 0 && p.hp < p.maxHp);

        // Si no hay aliados vivos que necesiten curación
        if (aliveAllies.length === 0) {
            this.add.text(this.scale.width / 2, 150, "Nadie necesita curación", {
                font: "20px Arial",
                fill: "#FF6666"
            }).setOrigin(0.5).setDepth(1000);
            this.time.delayedCall(2000, () => this.actualizarInterfaz());
            return;
        }

        // Desactivar listeners de inventario mientras se selecciona aliado
        this.input.keyboard.off('keydown-I');
        this.input.keyboard.off('keydown-ArrowUp');
        this.input.keyboard.off('keydown-ArrowDown');
        this.input.keyboard.off('keydown-E');

        // Mostrar instrucción para seleccionar aliado
        this.itemsContainer.removeAll(true);
        this.add.text(this.scale.width / 2, 100, "Selecciona a quién curar (↑↓) - E para aplicar", {
            font: "24px Arial",
            fill: "#FFFF00"
        }).setOrigin(0.5).setDepth(1000);

        this.selectedAllyIndex = 0;
        this.showAllySelection(aliveAllies);

        // Capturar input del usuario
        const handleAllySelection = (event) => {
            if (event.key === 'ArrowUp') {
                this.selectedAllyIndex = (this.selectedAllyIndex - 1 + aliveAllies.length) % aliveAllies.length;
                this.showAllySelection(aliveAllies);
            } else if (event.key === 'ArrowDown') {
                this.selectedAllyIndex = (this.selectedAllyIndex + 1) % aliveAllies.length;
                this.showAllySelection(aliveAllies);
            } else if (event.key === 'e' || event.key === 'E') {
                // Pedir confirmación antes de aplicar la poción
                this.input.keyboard.off('keydown', handleAllySelection);
                const chosen = aliveAllies[this.selectedAllyIndex];
                this.showConfirmHeal(chosen,
                    // onConfirm
                    () => {
                        this.applyPotionToAlly(chosen);
                    },
                    // onCancel -> volver a la selección de aliados
                    () => {
                        // Reactivar el listener de selección de aliados
                        this.time.delayedCall(50, () => {
                            this.input.keyboard.on('keydown', handleAllySelection);
                        });
                        this.showAllySelection(aliveAllies);
                    }
                );
            } else if (event.key === 'i' || event.key === 'I') {
                this.input.keyboard.off('keydown', handleAllySelection);
                // Reactivar listeners de inventario
                this.time.delayedCall(50, () => {
                    this.input.keyboard.on('keydown-I', () => this.cerrarInventario());
                    this.input.keyboard.on('keydown-ArrowUp', () => this.selectPreviousItem());
                    this.input.keyboard.on('keydown-ArrowDown', () => this.selectNextItem());
                    this.input.keyboard.on('keydown-E', () => this.useSelectedItem());
                });
                this.actualizarInterfaz();
            }
        };

        this.input.keyboard.on('keydown', handleAllySelection);
    }

    // Mostrar selección visual de aliados
    showAllySelection(aliveAllies) {
        this.itemsContainer.removeAll(true);

        this.add.text(this.scale.width / 2, 100, "Selecciona a quién curar (↑↓) - E para aplicar", {
            font: "24px Arial",
            fill: "#FFFF00"
        }).setOrigin(0.5).setDepth(1000);

        let yPos = 220;
        aliveAllies.forEach((ally, idx) => {
            const isSelected = (idx === this.selectedAllyIndex);

            // Fondo de selección
            if (isSelected) {
                const bg = this.add.rectangle(this.scale.width / 2, yPos, 500, 50, 0x44aa44, 0.3);
                bg.setStrokeStyle(3, 0x44FF44);
                this.itemsContainer.add(bg);
            }

            const allyText = this.add.text(this.scale.width / 2, yPos, `${ally.name}: ${ally.hp}/${ally.maxHp} HP`, {
                font: isSelected ? "24px Arial" : "20px Arial",
                fill: isSelected ? "#FFFF00" : "#cccccc",
                fontStyle: isSelected ? "bold" : ""
            }).setOrigin(0.5).setDepth(1001);

            this.itemsContainer.add(allyText);
            yPos += 70;
        });

        // Mostrar instrucción de cancelar
        this.add.text(this.scale.width / 2, this.scale.height - 50, "I para cancelar", {
            font: "16px Arial",
            fill: "#ffffff"
        }).setOrigin(0.5).setDepth(1000);
    }

    // Mostrar diálogo de confirmación antes de aplicar curación
    showConfirmHeal(ally, onConfirm, onCancel) {
        // Crear overlay simple
        const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 500, 180, 0x000000, 0.85).setDepth(2000);
        const box = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 460, 140, 0x222222, 1).setStrokeStyle(2, 0xffffff).setDepth(2001);
        const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 20, `Confirmar curar a ${ally.name}?`, { font: "20px Arial", fill: "#FFFF00" }).setOrigin(0.5).setDepth(2002);
        const hint = this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "E = Confirmar | I = Cancelar", { font: "16px Arial", fill: "#cccccc" }).setOrigin(0.5).setDepth(2002);

        const cleanup = () => {
            bg.destroy(); box.destroy(); msg.destroy(); hint.destroy();
        };

        const keyHandler = (event) => {
            if (event.key === 'e' || event.key === 'E') {
                this.input.keyboard.off('keydown', keyHandler);
                cleanup();
                if (typeof onConfirm === 'function') onConfirm();
            } else if (event.key === 'i' || event.key === 'I') {
                this.input.keyboard.off('keydown', keyHandler);
                cleanup();
                if (typeof onCancel === 'function') onCancel();
            }
        };

        this.input.keyboard.on('keydown', keyHandler);
    }

    // Aplicar poción a un aliado y actualizar inventario
    applyPotionToAlly(ally) {
        const healAmount = this.itemsData.potion.healAmount || 50;

        // Curar al aliado
        ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);

        // Decrementar poción del inventario
        this.inventario.potion--;

        // Guardar cambios
        this.registry.set('playerParty', this.registry.get('playerParty'));

        // Mostrar mensaje de curación
        this.add.text(this.scale.width / 2, 150, `${ally.name} fue curado +${healAmount} HP`, {
            font: "20px Arial",
            fill: "#00FF00"
        }).setOrigin(0.5).setDepth(1000);

        // Volver a la interfaz de inventario después de un tiempo
        this.time.delayedCall(1500, () => {
            // Reactivar listeners de inventario
            this.input.keyboard.on('keydown-I', () => this.cerrarInventario());
            this.input.keyboard.on('keydown-ArrowUp', () => this.selectPreviousItem());
            this.input.keyboard.on('keydown-ArrowDown', () => this.selectNextItem());
            this.input.keyboard.on('keydown-E', () => this.useSelectedItem());
            this.actualizarInterfaz();
        });
    }

    // Usar poción de maná desde el inventario
    useManaPotionFromInventory() {
        if (!this.inventario.manaPotion || this.inventario.manaPotion <= 0) {
            console.log("No hay pociones de maná disponibles");
            return;
        }

        // Obtener party guardada
        const playerParty = this.registry.get('playerParty') || [];
        // Buscar al Mago en la party
        const mage = playerParty.find(p => p.type === 'mage' || p.name.toLowerCase().includes('mago'));
        if (!mage) {
            // Mostrar mensaje temporal
            this.add.text(this.scale.width / 2, 150, "No hay Mago en el grupo", { font: "20px Arial", fill: "#FF6666" }).setOrigin(0.5).setDepth(1000);
            this.time.delayedCall(1500, () => this.actualizarInterfaz());
            return;
        }

        // Calcular cuánto puede recibir sin exceder su máximo
        const manaAmount = this.itemsData.manaPotion.manaAmount || 3;
        const currentUses = Number.isFinite(mage.normalAttackUses) ? mage.normalAttackUses : 0;
        const maxUses = Number.isFinite(mage.maxNormalUses) ? mage.maxNormalUses : currentUses;
        const possibleGain = Math.max(0, Math.min(manaAmount, maxUses - currentUses));

        if (possibleGain <= 0) {
            // Mago ya tiene usos completos
            this.add.text(this.scale.width / 2, 150, "El Mago ya tiene usos completos", { font: "20px Arial", fill: "#FF6666" }).setOrigin(0.5).setDepth(1000);
            this.time.delayedCall(1500, () => this.actualizarInterfaz());
            return;
        }

        // Pedir confirmación
        this.input.keyboard.off('keydown-I');
        this.input.keyboard.off('keydown-ArrowUp');
        this.input.keyboard.off('keydown-ArrowDown');
        this.input.keyboard.off('keydown-E');

        const confirmApply = () => {
            // Aplicar el incremento
            mage.normalAttackUses = currentUses + possibleGain;

            // Decrementar inventario
            this.inventario.manaPotion--;

            // Actualizar registry para que otras escenas lo vean (por ejemplo PeleaDebug si está activo)
            this.registry.set('playerParty', playerParty);

            // Si la escena de pelea está activa, sincronizar los datos ahí también
            const pelea = this.scene.get('PeleaDebug');
            if (pelea && pelea.playerParty) {
                const mageInBattle = pelea.playerParty.find(p => p.type === 'mage' || p.name.toLowerCase().includes('mago'));
                if (mageInBattle) {
                    mageInBattle.normalAttackUses = mage.normalAttackUses;
                }
            }

            // Mensaje y volver
            this.add.text(this.scale.width / 2, 150, `Mago: +${possibleGain} usos`, { font: "20px Arial", fill: "#00FF00" }).setOrigin(0.5).setDepth(1000);
            this.time.delayedCall(1400, () => {
                // Reactivar listeners
                this.input.keyboard.on('keydown-I', () => this.cerrarInventario());
                this.input.keyboard.on('keydown-ArrowUp', () => this.selectPreviousItem());
                this.input.keyboard.on('keydown-ArrowDown', () => this.selectNextItem());
                this.input.keyboard.on('keydown-E', () => this.useSelectedItem());
                this.actualizarInterfaz();
            });
        };

        const cancelApply = () => {
            // Reactivar listeners y volver a interfaz
            this.input.keyboard.on('keydown-I', () => this.cerrarInventario());
            this.input.keyboard.on('keydown-ArrowUp', () => this.selectPreviousItem());
            this.input.keyboard.on('keydown-ArrowDown', () => this.selectNextItem());
            this.input.keyboard.on('keydown-E', () => this.useSelectedItem());
            this.actualizarInterfaz();
        };

        // Mostrar confirmación simple
        const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 460, 140, 0x000000, 0.85).setDepth(2000);
        const box = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 420, 120, 0x222222, 1).setStrokeStyle(2, 0xffffff).setDepth(2001);
        const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 10, `Usar Poción de Maná para dar +${possibleGain} usos al Mago?`, { font: "18px Arial", fill: "#FFFF00" }).setOrigin(0.5).setDepth(2002);
        const hint = this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "E = Confirmar | I = Cancelar", { font: "14px Arial", fill: "#cccccc" }).setOrigin(0.5).setDepth(2002);

        const keyHandler = (event) => {
            if (event.key === 'e' || event.key === 'E') {
                this.input.keyboard.off('keydown', keyHandler);
                bg.destroy(); box.destroy(); msg.destroy(); hint.destroy();
                confirmApply();
            } else if (event.key === 'i' || event.key === 'I') {
                this.input.keyboard.off('keydown', keyHandler);
                bg.destroy(); box.destroy(); msg.destroy(); hint.destroy();
                cancelApply();
            }
        };
        this.input.keyboard.on('keydown', keyHandler);
    }

    // Mostrar diálogo de confirmación antes de aplicar curación
    showConfirmHeal(ally, onConfirm, onCancel) {
        // Crear overlay simple
        const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 500, 180, 0x000000, 0.85).setDepth(2000);
        const box = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 460, 140, 0x222222, 1).setStrokeStyle(2, 0xffffff).setDepth(2001);
        const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 20, `Confirmar curar a ${ally.name}?`, { font: "20px Arial", fill: "#FFFF00" }).setOrigin(0.5).setDepth(2002);
        const hint = this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "E = Confirmar | I = Cancelar", { font: "16px Arial", fill: "#cccccc" }).setOrigin(0.5).setDepth(2002);

        const cleanup = () => {
            bg.destroy(); box.destroy(); msg.destroy(); hint.destroy();
        };

        const keyHandler = (event) => {
            if (event.key === 'e' || event.key === 'E') {
                this.input.keyboard.off('keydown', keyHandler);
                cleanup();
                if (typeof onConfirm === 'function') onConfirm();
            } else if (event.key === 'i' || event.key === 'I') {
                this.input.keyboard.off('keydown', keyHandler);
                cleanup();
                if (typeof onCancel === 'function') onCancel();
            }
        };

        this.input.keyboard.on('keydown', keyHandler);
    }

    // Aplicar poción a un aliado y actualizar inventario
    applyPotionToAlly(ally) {
        const healAmount = this.itemsData.potion.healAmount || 50;

        // Curar al aliado
        ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);

        // Decrementar poción del inventario
        this.inventario.potion--;

        // Guardar cambios
        this.registry.set('playerParty', this.registry.get('playerParty'));

        // Mostrar mensaje de curación
        this.add.text(this.scale.width / 2, 150, `${ally.name} fue curado +${healAmount} HP`, {
            font: "20px Arial",
            fill: "#00FF00"
        }).setOrigin(0.5).setDepth(1000);

        // Volver a la interfaz de inventario después de un tiempo
        this.time.delayedCall(1500, () => {
            // Reactivar listeners de inventario
            this.input.keyboard.on('keydown-I', () => this.cerrarInventario());
            this.input.keyboard.on('keydown-ArrowUp', () => this.selectPreviousItem());
            this.input.keyboard.on('keydown-ArrowDown', () => this.selectNextItem());
            this.input.keyboard.on('keydown-E', () => this.useSelectedItem());
            this.actualizarInterfaz();
        });
    }
}
