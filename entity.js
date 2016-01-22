var ENTITY = {};

ENTITY.tryMove = function(e, xa, ya) {
    e.onGround = false;
    if(WORLD.isFree(xa, 0, e)) {
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
        if (WORLD.isFree(xa, 0, e)) {
            e.x += xa;
        }
        e.vx *= -e.bounce;
    }
    if(WORLD.isFree(0, ya, e)) {
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
        if(WORLD.isFree(0, ya, e)) {
            e.y += ya;
        }
        e.vy *= -e.bounce;
    }
    // to avoid bug
    e.x = Math.round((e.x)*100)/100;
    e.y = Math.round((e.y)*100)/100;
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
};

ENTITY.setPlayer = function(scene, x, y) {
    WORLD.player = new PIXI.Sprite();
    var player = WORLD.player;

    player.weapon = ENTITY.knife(scene, player);

    player.category = ENTITY.CATEGORIES.PLAYER;
    player.down = false;

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
    player.health = 100;
    player.maxHealth = 100;
    player.tick = function(e) {
        e.down = (INPUT.down[INPUT.KEY.DOWN.n] ? player.onGround : false);
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

        if(INPUT.down[INPUT.KEY.DOWN.n] && e.onGround) {
                if (e.height == 40)
                    e.y += 20;
                e.height = 20;
                e.down = true;
        }
        else {
            if(WORLD.isFree(0, -20, e)) {
                if (e.height == 20)
                    e.y -= 20;
                e.height = 40;
                e.down = false;
            }
        }

        if(e.health < e.maxHealth)
            e.health += 0.1;

        if(e.health > e.maxHealth)
            e.health = e.maxHealth;

        e.weapon.tick(e.weapon);
        if(INPUT.down[INPUT.KEY.SPACE.n])
            e.weapon.hit(e.weapon);

        INTERFACE.setHealth(e.health, e.maxHealth);
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

ENTITY.blood = function(scene, x, y) {
    var blood = new PIXI.Sprite(PIXI.Texture.fromFrame('blood.png'));
    blood.scale.x = blood.scale.y = 2;

    blood.lifeTime = 10000;
    blood.category = ENTITY.CATEGORIES.NONE;

    blood.x = x;
    blood.y = y;
    blood.vx = Math.random() * 10 - 5;
    blood.vy = Math.random() * 10 - 5;
    blood.removed = false;
    blood.bounce = 0.5;

    blood.tick = function(e) {
        e.vy += WORLD.GRAVITY;
        ENTITY.tryMove(e, e.vx, e.vy);
        if(e.x < 0 || e.y < 0 || e.x > WORLD.WIDTH|| e.y > WORLD.HEIGHT)
            e.removed = true;
        --e.lifeTime;
        if(e.lifeTime <= 0)
            e.removed = true;
    };

    blood.hitWall = function(e, xa, ya) {
    };

    blood.index = WORLD.entities.length;
    WORLD.entities.push(blood);
    scene.addChild(blood);
};

ENTITY.blade = function(scene, damage, e) {
    var blade = new PIXI.Sprite(PIXI.Texture.fromFrame('blade.png'));
    blade.scale.x = blade.scale.y = SCALE;
    blade.owner = e;
    blade.x = blade.owner.x + blade.owner.width / 2;
    blade.y = blade.owner.y + blade.owner.height / 2 - 4;
    if(ENTITY.looksRight(blade.owner) != ENTITY.looksRight(blade)) {
        ENTITY.flip(blade);
    }
    if(!ENTITY.looksRight(blade))
        blade.x -= blade.width;


    blade.damage = damage;
    blade.hit = false;
    blade.lifeTime = 30;

    blade.removed = false;
    blade.tick = function(e) {
        e.x = e.owner.x + e.owner.width / 2;
        e.y = e.owner.y + e.owner.height / 2 - 4;
        if(ENTITY.looksRight(e.owner) != ENTITY.looksRight(e)) {
            ENTITY.flip(e);
        }
        if(!ENTITY.looksRight(e))
            e.x -= e.width;
        if(e.lifeTime <= 0)
            e.removed = true;
        --e.lifeTime;
    };
    blade.hitWall = function(e, xa, ya) {};
    blade.collide = function(b, e) {
        if(!b.hit) {
            e.health -= damage;
            b.hit = true;
        }
    };
    blade.index = WORLD.entities.length;
    WORLD.entities.push(blade);
    scene.addChild(blade);

    return blade;
};

ENTITY.enemyBlade = function(scene, damage, e) {
    var blade = ENTITY.blade(scene, damage, e);
    blade.category = ENTITY.CATEGORIES.ENEMYBULLET;
    WORLD.enemyBullets.push(blade);
};

ENTITY.playerBlade = function(scene, damage, e) {
    var blade = ENTITY.blade(scene, damage, e);
    blade.category = ENTITY.CATEGORIES.PLAYERBULLET;
    WORLD.playerBullets.push(blade);
};

ENTITY.knife = function(scene, e) {
    var knife = {};
    knife.owner = e;
    knife.cooldown = 120;
    knife.time = 0;
    knife.damage = 10;
    knife.hit = function(k) {
        if(k.time <= 0) {
            if(k.owner.category == ENTITY.CATEGORIES.ENEMY) {
                ENTITY.enemyBlade(scene, k.damage, k.owner);
            } else {
                ENTITY.playerBlade(scene, k.damage, k.owner);
            }
            k.time = k.cooldown;
        }
    };
    knife.tick = function(e) {
        if(e.time > 0)
            --e.time;
    };
    return knife;
};

ENTITY.CATEGORIES = {NONE: 0, PLAYER: 1, ENEMY: 2, PLAYERBULLET: 3, ENEMYBULLET: 4};




