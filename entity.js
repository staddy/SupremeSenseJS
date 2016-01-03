var ENTITY = {};

ENTITY.tryMove = function(e, xa, ya) {
    e.onGround = false;
    if(WORLD.isFree(e.x + xa, e.y, e.width, e.height)) {
        e.x += xa;
    } else {
        e.hitWall(xa, 0);
        if(xa < 0) {
            var xx = e.x / WORLD.TILE;
            xa = -(xx - Math.floor(xx)) * WORLD.TILE;
        } else {
            var xx = (e.x + e.width) / 10;
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
        e.hitWall(0, ya);
        if(ya < 0) {
            var yy = e.y / WORLD.TILE;
            ya = -(yy - Math.floor(yy)) * WORLD.TILE;
        } else {
            var yy = (e.y + e.height) / WORLD.TILE;
            ya = WORLD.TILE - (yy - Math.floor(yy)) * WORLD.TILE;
        }
        if(level.isFree(e.x, e.y + ya, e.width, e.height)) {
            e.y += ya;
        }
        e.vy *= -e.bounce;
    }
}


