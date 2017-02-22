// fpsmeter
var fpsmeter = new FPSMeter({ decimals: 0, graph: true, theme: 'dark', left: '5px' });

// pixel scaling
PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

var WIDTH = 800, HEIGHT = 600;
var SCALE = 2;

// renderer
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, {/*backgroundColor : 0x1099bb*/});
document.body.appendChild(renderer.view);

// load textures and run setup()
PIXI.loader.add('images/textures.json')
    .add('images/fixedsys.xml')
    .load(setup);

// root of the scene graph
var stage;

// game scenes
var gameScene;

// current game state
var state;

function setup() {
    stage = new PIXI.Container();
    INPUT.initMouseEvents(stage);

    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    WORLD.loadLevel(gameScene);

    new ENTITY.Player(200, 200, gameScene);
    (new ENTITY.Guard(300, 200, gameScene)).vx = -3;
    //(new ENTITY.Guard(300, 200, gameScene)).vx = 5;
    //new ENTITY.Guard(300, 200, gameScene);
    //(new ENTITY.Guard(600, 200, gameScene)).vx = 3;
    //(new ENTITY.Guard(600, 200, gameScene)).vx = 5;
    //new ENTITY.Guard(600, 200, gameScene);
    //new ENTITY.Guard(600, 500, gameScene);
    //new ENTITY.Guard(600, 300, gameScene);
    INTERFACE.setup(stage);

    state = play;

    INTERFACE.phrases.push('розкол зіграв не останню роль, і я відчував,\nщо все здохло.');
    INTERFACE.phrases.push('Я тоді ледь вибрався з серйозної хвороби,\nпро яку зараз говорити не хочеться, досить\nлише сказати, що цей наш жалюгідний і виснажливий');
    INTERFACE.phrases.push('Я вперше зустрів Діна незабаром після того,\nяк ми з дружиною розлучилися.');
    INTERFACE.tell(stage);

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