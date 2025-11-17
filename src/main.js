import Bootloader from "../scenes/Bootloader.js"
import EscenaDebug from "../scenes/EscenaDebug.js"
import PeleaDebug from "../scenes/PeleaDebug.js"



const config = {
    title: "Curso Phaser", //Nombre del juego (opcional)
    url: "http://google.es", //Dirección de la página del juego (opcional)
    version: "0.0.1", //Versión alfanumérica (opcional)
    type: Phaser.AUTO, //Tipo de renderizado (WEBGL, CANVAS, AUTO)
    // AUTO: busca primero WEBGL y si no está disponible
    // eligirá CANVAS
    width: 1720, //Ancho de pantalla del juego
    height: 910, //Alto de pantalla del juego
    parent: "contenedor", //Nombre del id del elemento <div> en el index.html
    // se refiere a dónde se pondrá el canvas o lienzo
    pixelArt: true, //Diseño con pixeles definidos (no borrosos)
    backgroundColor: "#000000ff", //Color de fondo del canvas ()
    scene: [Bootloader, EscenaDebug, PeleaDebug], //Configuración de la escena o mundos de phaser

    physics: {
        default: 'arcade',
        'arcade': {
            'gravity': {
                y: 0
            },
            debug: true
        }
    }
};

const game = new Phaser.Game(config);