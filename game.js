var LEVEL_EDITOR_MODE = false;

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

    WORLD.init();
    WORLD.loadLevel(JSON.parse('{"blocks":[[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,4,0,0,4,4,0,0,4,0,0,4,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,4,0,0,4,4,0,0,4,0,0,4,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,0,0,0,4,4,0,0,0,0,0,4,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]],"objects":[{"name":"guard","x":271.4,"y":220,"properties":[]},{"name":"guard","x":265,"y":220,"properties":[]},{"name":"guard","x":300,"y":220,"properties":[]},{"name":"guard","x":620,"y":200,"properties":[]},{"name":"guard","x":620,"y":200,"properties":[]},{"name":"guard","x":600,"y":220,"properties":[]}],"spawn":{"x":435,"y":20.15},"background":"background.png","gravity":0.45,"maxSpeed":10}'));

    INTERFACE.setup();

    state = play;

    var portrait = new PIXI.Sprite(PIXI.Texture.fromFrame('face.png'));
    portrait.scale.x = portrait.scale.y = 5;

    /*INTERFACE.push(portrait, INTERFACE.EVENTS.PORTRAIT, true);
    INTERFACE.push('Я вперше зустрів Діна незабаром після того,\nяк ми з дружиною розлучилися.');
    INTERFACE.push('Я тоді ледь вибрався з серйозної хвороби,\nпро яку зараз говорити не хочеться, досить \nлише сказати, що цей наш жалюгідний');
    INTERFACE.push('і виснажливий розкол зіграв не останню \nроль, і я відчував, що все здохло.');
    INTERFACE.push(portrait, INTERFACE.EVENTS.PORTRAIT);
    INTERFACE.push('Не розумiю по-украински.');
    INTERFACE.push(portrait, INTERFACE.EVENTS.PORTRAIT, true);
    INTERFACE.push('Не зрозумів останнє слово.');
    INTERFACE.push(portrait, INTERFACE.EVENTS.PORTRAIT);
    INTERFACE.push('...');
    INTERFACE.push(null, INTERFACE.EVENTS.PORTRAIT);
    INTERFACE.push('Не давайте святыни псам и не бросайте жемчуга\nвашего перед свиньями, чтобы они не попрали его\nногами своими и, обратившись, не растерзали вас.');

    INTERFACE.tell();*/

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
    INPUT.tick();
}

function play() {
    if(INPUT.pressed(KEYS.Q)) {
        state = levelEditor;
        return;
    }
    WORLD.tick();
}

function end() {

}

function levelEditor() {
    if(INPUT.pressed(KEYS.Q)) {
        state = play;
        return;
    }
    if(INPUT.pressed(KEYS.W)) {
        var l = window.prompt("Current blocks:", JSON.stringify(WORLD.dumpLevel()));
        //if(l != null)
        //    WORLD.blocks = JSON.parse(l);
        //WORLD.updateTextures();
    }
}