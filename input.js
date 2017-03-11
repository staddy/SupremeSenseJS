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
    D: 9,
    Q: 10,
    W: 11,
    R: 12,
    B: 13,
    E: 14,
    F: 15
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
    68: KEYS.D,
    81: KEYS.Q,
    87: KEYS.W,
    82: KEYS.R,
    66: KEYS.B,
    69: KEYS.E,
    70: KEYS.F
};

INPUT.down = [];
INPUT.previous = [];

INPUT.tick = function() {
    INPUT.previous = INPUT.down.slice();
};

INPUT.pressed = function(key) {
    if(INPUT.down[key] && !INPUT.previous[key])
        return true;
    else
        return false;
};

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

};