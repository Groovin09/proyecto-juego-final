export default class InventarioScene extends Phaser.Scene {
    constructor() {
        super("InventarioScene");

        // Inventario del jugador
        this.inventario = {
            totemVida: 0
        };
    }

    create() {
        console.log("InventarioScene lista.");

        // OBJETOS RECOGIDOS
        this.game.events.on("agregarAlInventario", (objeto) => {
            console.log("Objeto recibido:", objeto);

            if (objeto.tipo === "totemVida") {
                this.inventario.totemVida += objeto.cantidad || 1;
            }

            console.log("Inventario actualizado:", this.inventario);
        });
    }
}