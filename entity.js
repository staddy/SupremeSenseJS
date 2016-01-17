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

ENTITY.flip = function(e) {
    e.scale.x = -e.scale.x;
    if(ENTITY.looksRight(e))
        e.anchor.x = 0;
    else
        e.anchor.x = 1;
};

ENTITY.looksRight = function(e) {
    return e.scale.x > 0;
}

ENTITY.setPlayer = function(scene, x, y) {
    WORLD.player = new PIXI.Sprite();
    var player = WORLD.player;

    player.sprites = [];
    for(var i = 1; i <= 8; ++i) {
        player.sprites.push(PIXI.Texture.fromFrame('character' + i + '.png'));
    }

    player.sid = 3;
    player.texture = player.sprites[player.sid];
    player.running = false;
    player.time = 0;
    player.dt = 10;

    scene.addChild(WORLD.player);
    player.scale.x = 2;
    player.scale.y = 2;
    player.onGround = false;
    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
    player.bounce = 0;
    player.speed = 4;
    player.jumpSpeed = 8;
    player.health = 100.0;
    player.tick = function(e) {
        if(e.running)
            ++e.time;
        if(e.time > e.dt) {
            ++player.sid;
            if(player.sid >= 7)
                player.sid = 0;
            player.texture = player.sprites[player.sid];
            e.time = 0;
        }
        if(INPUT.down[INPUT.KEY.RIGHT.n]) {
            if(!ENTITY.looksRight(this))
                ENTITY.flip(this);
            e.vx = e.speed;
            player.running = true;
        }
        else if(INPUT.down[INPUT.KEY.LEFT.n]) {
            if(ENTITY.looksRight(this))
                ENTITY.flip(this);
            e.vx = -e.speed;
            player.running = true;
        }
        else {
            e.vx = 0;
            player.running = false;
        }
        if(e.onGround) {
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

ENTITY.bullet = function(scene, x1, y1, x2, y2) {
    var bulletSpeed = 11.0;
    var bya, bxa;
    if((y2 - y1) != 0) {
        var k = ((x2 - x1) / (y2 - y1));
        bya = bulletSpeed * Math.sqrt(1 / (1 + k * k)) * ((y2 - y1) > 0 ? 1 : -1);
        bxa = bya * k;
    } else {
        bya = 0;
        bxa = bulletSpeed * Math.sign(x2 - x1);
    }
    var bullet = new PIXI.Graphics();
    bullet.lineStyle(2, 0xFFFFFF, 1);
    bullet.moveTo(0, 0);
    bullet.lineTo(5, 0);
    bullet.x = x1;
    bullet.y = y1;
    bullet.rotation = (k != 0) ? Math.atan(1/k) : (Math.PI / 2 * Math.sign(y2 - y1));
    bullet.vx = bxa;
    bullet.vy = bya;

    bullet.removed = false;
    bullet.tick = function(e) {
        ENTITY.tryMove(e, e.vx, e.vy);
        if(e.x < 0 || e.y < 0 || e.x > WORLD.WIDTH|| e.y > WORLD.HEIGHT)
            e.removed = true;
    };
    bullet.hitWall = function(e, xa, ya) {
        e.removed = true;
    };
    bullet.collide = function(b, e) {b.removed = true;};
    bullet.index = WORLD.entities.length;
    WORLD.entities.push(bullet);
    scene.addChild(bullet);
    return bullet;
};

ENTITY.playerBullet = function(scene, x1, y1, x2, y2) {
    var bullet = ENTITY.bullet(scene, x1, y1, x2, y2);
    WORLD.playerBullets.push(bullet);
    bullet.category = ENTITY.CATEGORIES.PLAYERBULLET;
};

ENTITY.enemyBullet = function(scene, x1, y1, x2, y2) {
    var bullet = ENTITY.bullet(scene, x1, y1, x2, y2);
    WORLD.enemyBullets.push(bullet);
    bullet.category = ENTITY.CATEGORIES.ENEMYBULLET;
};

ENTITY.CATEGORIES = {NONE: 0, ENEMY: 1, PLAYERBULLET: 2, ENEMYBULLET: 3};




