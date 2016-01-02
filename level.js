var LEVEL = {};

LEVEL.loadLevel = function() {
    LEVEL.X = 80;
    LEVEL.Y = 60;
    LEVEL.BLOCKS = new Array(LEVEL.Y);
    for(var i = 0; i < LEVEL.Y; ++i) {
        LEVEL.BLOCKS[i] = new Array(LEVEL.X);
        for(var j = 0; j < LEVEL.X; ++j)
            LEVEL.BLOCKS[i][j] = 0;
    }
}