var WORLD = {};

WORLD.entities = [];
WORLD.enemies = [];
WORLD.playerBullets = [];
WORLD.enemyBullets = [];
WORLD.player = {};

WORLD.loadLevel = function() {
    WORLD.X = 80;
    WORLD.Y = 60;
    WORLD.TILE = 10;
    WORLD.GRAVITY = 1.0;
    WORLD.blocks = new Array(WORLD.X);
    for(var i = 0; i < WORLD.X; ++i) {
        WORLD.blocks[i] = new Array(WORLD.Y);
        for(var j = 0; j < WORLD.Y; ++j)
            WORLD.blocks[i][j] = 0;
    }
};

WORLD.isFree = function(x, y, width, height) {
    var x1 = Math.floor(x / WORLD.TILE);
    if(x1 < 0) x1 = 0;

    var y1 = Math.floor(y / WORLD.TILE);
    if(y1 < 0) y1 = 0;

    var mx = (x + width) / WORLD.TILE;
    var x2 = Math.floor(mx);
    if((mx) == Math.floor(mx)) --x2;
    if(x2 >= WORLD.X) x2 = WORLD.X - 1;

    var my = (y + height) / WORLD.TILE;
    var y2 = Math.floor(my);
    if((my) == Math.floor(my)) --y2;
    if(y2 >= WORLD.X) y2 = WORLD.Y - 1;

    for(var i = x1; i < x2; ++i)
        for(var j = y1; j < y2; ++j)
            if(WORLD.blocks[i][j] == 1)
                return false;

    return true;
};

WORLD.areCollide = function(r1, r2) {
    //Define the variables we'll need to calculate
    var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occuring. Check for a collision on the y axis
        hit = Math.abs(vy) < combinedHalfHeights;
    } else {
        //There's no collision on the x axis
        hit = false;
    }
    //`hit` will be either `true` or `false`
    return hit;
};

WORLD.tick = function() {
    WORLD.enemyBullets.forEach(
        function(b) {
            if(WORLD.areCollide(b, WORLD.player)) {
                WORLD.player.collide(WORLD.player, b);
                b.collide(b, WORLD.player);
            }
        }
    );
    WORLD.playerBullets.forEach(
        function(b) {
            WORLD.enemies.forEach(
                function(e) {
                    if(WORLD.areCollide(b, e)) {
                        e.collide(e, b);
                        b.collide(b, e);
                    }
                }
            )
        }
    );
    WORLD.player.tick(WORLD.player);
    for(var i = 0; i < WORLD.entities.length; ++i) {
        var e = ENTITY.entities[i];
        if(!e.removed)
            e.tick(e);
        else {
            WORLD.entities.splice(i--, 1);
            e.category.remove(e);
        }
    }
};