var INPUT = {};

INPUT.KEY = {
    SPACE: {n: 0, code: 32},
    LEFT: {n: 1, code: 37},
    UP: {n: 2, code: 38},
    RIGHT: {n: 3, code: 39},
    DOWN: {n: 4, code: 40},
    A: {n: 1, code: 65},
    W: {n: 2, code: 87},
    D: {n: 3, code: 68},
    S: {n: 4, code: 83}
};

INPUT.down = [false, false, false, false, false];

INPUT.onKey = function(ev, key, down) {
    var KEY = INPUT.KEY;
    var input = INPUT.down;
    switch(key) {
        case KEY.SPACE.code:
            input[KEY.SPACE.n] = down;
            ev.preventDefault();
            return false;
        case KEY.W.code:
        case KEY.UP.code:
            input[KEY.UP.n] = down;
            ev.preventDefault();
            return false;
        case KEY.S.code:
        case KEY.DOWN.code:
            input[KEY.DOWN.n] = down;
            ev.preventDefault();
            return false;
        case KEY.A.code:
        case KEY.LEFT.code:
            input[KEY.LEFT.n] = down;
            ev.preventDefault();
            return false;
        case KEY.D.code:
        case KEY.RIGHT.code:
            input[KEY.RIGHT.n] = down;
            ev.preventDefault();
            return false;
    }
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

    var ex = eventData.data.originalEvent.offsetX;
    var ey = eventData.data.originalEvent.offsetY;
    INPUT.onDown(ex, ey);
};

INPUT.onTouch = function(eventData) {
    //eventData.preventDefault();

    var ex = eventData.data.originalEvent.touches[0].pageX;
    var ey = eventData.data.originalEvent.touches[0].pageY;
    INPUT.onDown(ex, ey);
};

INPUT.onDown = function(ex, ey) {
    ENTITY.playerBullet(gameScene, WORLD.player.x, WORLD.player.y, ex, ey);
};