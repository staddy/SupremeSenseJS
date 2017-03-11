var LEVEL_EDITOR_MODE = false;
var MAX_REWIND = 300;
var rewindTime = 0;

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
PIXI.loader.add('images/textures.json?v=' + VERSION)
    .add('images/fixedsys.xml?v=' + VERSION)
    .load(setup);

// root of the scene graph
var stage;

// game scenes
var gameScene;

// current game state
var state;

var portrait;

function setup() {
    portrait = new PIXI.Sprite(PIXI.Texture.fromFrame('face.png'));
    portrait.scale.x = portrait.scale.y = 5;

    stage = new PIXI.Container();
    INPUT.initMouseEvents(stage);

    gameScene = new PIXI.Container();
    stage.addChild(gameScene);

    WORLD.init();
    WORLD.loadLevel(JSON.parse('{"blocks":[[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,41,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,42,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,42,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,41,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,42,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,42,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,42,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,0,0,0,21,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,21,0,0,21,21,0,0,21,0,0,21,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,21,0,0,21,21,0,0,21,0,0,21,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,0,0,21,21,0,0,0,0,0,21,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,22,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,22,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,22,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]],"objects":[{"name":"guard","x":271.4,"y":220,"properties":[]},{"name":"guard","x":265,"y":220,"properties":[]},{"name":"guard","x":300,"y":220,"properties":[]},{"name":"guard","x":620,"y":200,"properties":[]},{"name":"guard","x":620,"y":200,"properties":[]},{"name":"guard","x":600,"y":179.95,"properties":[]}],"spawn":{"x":347.5,"y":220},"background":"city.png","gravity":0.45,"maxSpeed":10}'));


    INTERFACE.setup();
    INTERFACE.initBlockEditor();

    new ENTITY.Animation1(150, 50, gameScene);
    new ENTITY.Animation1(200, 30, gameScene);

    state = play;

    // start fps-meter
    fpsmeter.tickStart();
    fpsmeter.hide();

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
    INTERFACE.push(portrait, INTERFACE.EVENTS.PORTRAIT, true);
    INTERFACE.push('Квантовая запущенность');
    INTERFACE.tell();

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
    } else if(INPUT.down[KEYS.R] && rewindTime < MAX_REWIND) {
        WORLD.back();
        ++rewindTime;
    } else if(INPUT.pressed(KEYS.B)) {
        INTERFACE.switchEditor();
    } else if(INPUT.pressed(KEYS.E)) {
        INTERFACE.editBlocks = !INTERFACE.editBlocks;
    } else {
        if(rewindTime > 0)
            --rewindTime;
        WORLD.tick();
    }
}

function end() {

}

function levelEditor() {
    if(INPUT.pressed(KEYS.Q)) {
        state = play;
    } else if(INPUT.pressed(KEYS.D)) {
        if(INTERFACE.selected != null) {
            var s = INTERFACE.selected;
            INTERFACE.removeSelection();
            WORLD.remove(s);
        }
    } else if(INPUT.pressed(KEYS.W)) {
        var l = window.prompt("Current blocks:", JSON.stringify(WORLD.dumpLevel()));
        if(l != null)
            WORLD.loadLevel(JSON.parse(l));
        INPUT.down[KEYS.W] = false;
    }
}