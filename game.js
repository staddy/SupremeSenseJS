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
PIXI.loader.add('images/textures.json').add('images/fixedsys.xml').load(setup);

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
    (new ENTITY.Guard(300, 200, gameScene)).vx = 3;
    //ENTITY.guard(gameScene, 300, 200);
    //ENTITY.guard(gameScene, 300, 200);
    //ENTITY.guard(gameScene, 300, 200);
    INTERFACE.setup(stage);

    state = play;

    INTERFACE.phrases.push('раскол сыграл не последнюю роль, и я чувствовал,\nчто все сдохло.');
    INTERFACE.phrases.push('Я тогда едва выкарабкался из серьезной болезни,\nо которой сейчас говорить неохота, достаточно\nлишь сказать, что этот наш жалкий и утомительный');
    INTERFACE.phrases.push('Я впервые встретил Дина вскоре после того,\nкак мы с женой расстались.');
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