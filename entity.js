var ENTITY = {};

ENTITY.tryMove = function(e, xa, ya) {
    e.onGround = false;
    if(WORLD.isFree(e.x + xa, e.y, e.width, e.height)) {
        e.x += xa;
    } else {
        e.hitWall(e, xa, 0);
        var xx;
        if(xa < 0) {
            xx = e.x / WORLD.TILE;
            xa = -(xx - Math.floor(xx)) * WORLD.TILE;
        } else {
            xx = (e.x + e.width) / 10;
            xa = WORLD.TILE - (xx - Math.floor(xx)) * WORLD.TILE;
        }
        if (WORLD.isFree(e.x + xa, e.y, e.width, e.height)) {
            e.x += xa;
        }
        e.vx *= -e.bounce;
    }
    if(WORLD.isFree(e.x, e.y + ya, e.width, e.height)) {
        e.y += ya;
    } else {
        if(ya > 0) e.onGround = true;
        e.hitWall(e, 0, ya);
        var yy;
        if(ya < 0) {
            yy = e.y / WORLD.TILE;
            ya = -(yy - Math.floor(yy)) * WORLD.TILE;
        } else {
            yy = (e.y + e.height) / WORLD.TILE;
            ya = WORLD.TILE - (yy - Math.floor(yy)) * WORLD.TILE;
        }
        if(WORLD.isFree(e.x, e.y + ya, e.width, e.height)) {
            e.y += ya;
        }
        e.vy *= -e.bounce;
    }
};

ENTITY.setPlayer = function(player, x, y) {
    player.onGround = false;
    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
    player.bounce = 0;
    player.speed = 4;
    player.jumpSpeed = 8;
    player.tick = function(e) {
        if(/*e.onGround*/true) {
            if(INPUT.down[INPUT.KEY.RIGHT.n])
                e.vx = e.speed;
            else if(INPUT.down[INPUT.KEY.LEFT.n])
                e.vx = -e.speed;
            else
                e.vx = 0;
            if(INPUT.down[INPUT.KEY.UP.n])
                e.vy = -e.jumpSpeed;
        }
        e.vy += WORLD.GRAVITY;
        if(Math.abs(e.vy) >= WORLD.MAXSPEED) e.vy = Math.sign(e.vy) * WORLD.MAXSPEED;
        if(Math.abs(e.vx) >= WORLD.MAXSPEED) e.vx = Math.sign(e.vx) * WORLD.MAXSPEED;
        ENTITY.tryMove(e, e.vx, e.vy);
    };
    player.hitWall = function(e, xa, ya) {

    };
    player.collide = function(e, b) {

    };
};


