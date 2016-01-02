// fpsmeter
var fpsmeter = new FPSMeter({ decimals: 0, graph: true, theme: 'dark', left: '5px' });

// pixel scaling
PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

var WIDTH = 800, HEIGHT = 600;

// renderer
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, {backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// root of the scene graph
var stage;

// game scenes
var gameScene;

// current game state
var state;

function setup() {
    stage = new PIXI.Container();

    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    state = play;

    // start fps-meter
    fpsmeter.tickStart();

    // start the game loop
    gameLoop();
}

function gameLoop() {
    fpsmeter.tick();
    requestAnimationFrame(gameLoop);

    // update
    state();

    // render the root container
    renderer.render(stage);
}

function play() {

}

function end() {

}

setup();