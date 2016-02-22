var INPUT = {};

KEYS = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3,
    Z: 4,
    X: 5,
    C: 6,
    A: 7,
    S: 8,
    D: 9
};

CODES = {
    37: KEYS.LEFT,
    38: KEYS.UP,
    39: KEYS.RIGHT,
    40: KEYS.DOWN,
    90: KEYS.Z,
    88: KEYS.X,
    67: KEYS.C,
    65: KEYS.A,
    83: KEYS.S,
    68: KEYS.D
};

INPUT.down = [];

INPUT.onKey = function(ev, key, down) {
    ev.preventDefault();

    if((state == INTERFACE.telling) && down) {
        INTERFACE.skip = true;
        ev.preventDefault();
        return false;
    }

    INPUT.down[CODES[key]] = down;
    return false;
};

document.addEventListener('keydown', function(ev) { return INPUT.onKey(ev, ev.keyCode, true);  }, false);
document.addEventListener('keyup',   function(ev) { return INPUT.onKey(ev, ev.keyCode, false); }, false);

INPUT.initMouseEvents = function(stage) {
    stage.interactive = true;
    stage.hitArea = new PIXI.Rectangle(0, 0, WIDTH, HEIGHT);
    stage.mousedown = INPUT.onMouseDown;
    stage.touchstart = INPUT.onTouch;
};

INPUT.onMouseDown = function(eventData) {
    //eventData.preventDefault();

    if(state == INTERFACE.telling) {
        INTERFACE.skip = true;
        return;
    }

    var ex = eventData.data.originalEvent.offsetX;
    var ey = eventData.data.originalEvent.offsetY;
    INPUT.onDown(ex, ey);
};

INPUT.onTouch = function(eventData) {
    //eventData.preventDefault();

    if(state == INTERFACE.telling) {
        INTERFACE.skip = true;
        return;
    }

    var ex = eventData.data.originalEvent.touches[0].pageX;
    var ey = eventData.data.originalEvent.touches[0].pageY;
    INPUT.onDown(ex, ey);
};

INPUT.onDown = function(ex, ey) {
    //WORLD.player.health -= 10;
    //new ENTITY.Bullet(WORLD.player.x, WORLD.player.y, ex, ey, gameScene, ENTITY.CATEGORIES.PLAYERBULLET);
    //for(var i = 0; i < 20; ++i) {
    //    ENTITY.blood(gameScene, WORLD.player.x, WORLD.player.y);
    //}
};