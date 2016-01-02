var INPUT = {};

INPUT.KEY = {
    SPACE: {n: 0, code: 32},
    LEFT: {n: 1, code: 37},
    UP: {n: 2, code: 38},
    RIGHT: {n: 3, code: 39},
    DOWN: {n: 4, code: 40},
    W: {n: 2, code: 87},
    S: {n: 4, code: 83}
};

INPUT.down = [false, false, false, false, false];

LEVEL.onkey = function(ev, key, down) {
    var KEY = INPUT.KEY;
    var input = INPUT.down;
    switch(key) {
        case KEY.SPACE:
            KEYS[KEY.SPACE.n] = down;
            ev.preventDefault();
            return false;
        case KEY.W:
        case KEY.UP:
            input[KEY.UP.n] = down;
            ev.preventDefault();
            return false;
        case KEY.S:
        case KEY.DOWN:
            input[KEY.DOWN.n] = down;
            ev.preventDefault();
            return false;
        case KEY.LEFT:
            input[KEY.LEFT.n] = down;
            ev.preventDefault();
            return false;
        case KEY.RIGHT:
            input[KEY.RIGHT.n] = down;
            ev.preventDefault();
            return false;
    }
}

document.addEventListener('keydown', function(ev) { return LEVEL.onkey(ev, ev.keyCode, true);  }, false);
document.addEventListener('keyup',   function(ev) { return LEVEL.onkey(ev, ev.keyCode, false); }, false);