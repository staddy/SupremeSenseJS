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

    WORLD.loadLevel();

    WORLD.player = new PIXI.Graphics();
    // set a fill and a line style again and draw a rectangle
    WORLD.player.lineStyle(2, 0x0000FF, 1);
    WORLD.player.beginFill(0xFF700B, 1);
    WORLD.player.drawRect(0, 0, 20, 10);
    WORLD.player.x = 200;
    WORLD.player.y = 200;
    ENTITY.setPlayer(WORLD.player, 200, 200);
    gameScene.addChild(WORLD.player);

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
    WORLD.tick();
}

function end() {

}

setup();