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
            xx = (e.x + e.width) / WORLD.TILE;
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

ENTITY.personTick = function(e) {
    if(e.runsRight) {
        if (!ENTITY.looksRight(e))
            ENTITY.flip(e);
    } else if(e.runsLeft) {
        if(ENTITY.looksRight(e))
            ENTITY.flip(e);
    }

    if(e.running && e.onGround)
        ++e.time;
    else if(e.sid != 7)
        e.sid = 3;
    if(e.time > e.dt) {
        ++e.sid;
        if(e.sid >= 7)
            e.sid = 0;
        e.time = 0;
    }
    e.texture = e.sprites[e.sid];
    e.vy += WORLD.GRAVITY;
    if(Math.abs(e.vy) >= WORLD.MAXSPEED) e.vy = Math.sign(e.vy) * WORLD.MAXSPEED;
    if(Math.abs(e.vx) >= WORLD.MAXSPEED) e.vx = Math.sign(e.vx) * WORLD.MAXSPEED;
    ENTITY.tryMove(e, e.vx, e.vy);

    if(e.health < e.maxHealth)
        e.health += e.healthRegeneration;

    if(e.health > e.maxHealth)
        e.health = e.maxHealth;

    e.weapon.tick(e.weapon);
};

ENTITY.person = function(scene, x, y, textures, category) {
    var person = new PIXI.Sprite();

    person.category = category;
    person.weapon = ENTITY.knife(scene, person);

    person.down = false;

    person.sprites = textures;

    person.sid = 3;
    person.texture = person.sprites[person.sid];
    person.running = false;
    person.runsRight = false;
    person.runsLeft = false;
    person.canWalk = true;
    person.time = 0;
    person.dt = 7;

    scene.addChild(person);
    person.scale.x = SCALE;
    person.scale.y = SCALE;
    person.onGround = false;
    person.x = x;
    person.y = y;
    person.vx = 0;
    person.vy = 0;
    person.bounce = 0;
    person.speed = 2.5;
    person.jumpSpeed = 7.6;
    person.health = 100;
    person.maxHealth = 100;
    person.healthRegeneration = 0.1;
    person.tick = function(e) {
        ENTITY.personTick(e);
    };
    person.hitWall = function(e, xa, ya) {

    };
    person.collide = function(e, b) {

    };
    return person;
};

ENTITY.guard = function(scene, x, y) {
    var textures = [];
    for(var i = 1; i <= 8; ++i) {
        textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
    }
    var guard = ENTITY.person(scene, x, y, textures, ENTITY.CATEGORIES.ENEMY);
    guard.AIcycle = 60;
    guard.AIcurrent = guard.AIcycle;
    guard.shouldLeft = false;
    guard.shouldRight = false;
    guard.tick = function(e) {
        if(e.shouldLeft) {
            e.vx = -e.speed;
            e.runsRight = false;
            e.runsLeft = true;
            e.running = true;
            e.AIcurrent = e.AIcycle;
            e.shouldLeft = false;
            e.shouldRight = false;
        } else if(e.shouldRight) {
            e.vx = e.speed;
            e.runsRight = true;
            e.runsLeft = false;
            e.running = true;
            e.AIcurrent = e.AIcycle;
            e.shouldLeft = false;
            e.shouldRight = false;
        }
        if(e.AIcurrent <= 0) {
            if (e.canWalk) {
                if (WORLD.player.x > e.x) {
                    e.shouldLeft = false;
                    e.shouldRight = true;
                }
                else {
                    e.shouldLeft = true;
                    e.shouldRight = false;
                }
            }
            e.AIcurrent = e.AIcycle;
        }
        --e.AIcurrent;
        //if((Math.abs(WORLD.player.x - e.x) < 10) && (Math.abs(WORLD.player.y - e.y) < 10))
            e.weapon.hit(e.weapon);
        if(Math.random() > 0.95)
            if(e.onGround)
                e.vy = -e.jumpSpeed;
        if(WORLD.player.y > e.y)
            e.down = true;
        else
            e.down = false;
        ENTITY.personTick(e);
    };
    guard.collide = function(e, b) {

    };
    guard.hitWall = function(e, xa, ya) {
        if(xa > 0) {
            e.shouldRight  = false;
            e.shouldLeft = true;
        } else if(xa < 0) {
            e.shouldRight  = true;
            e.shouldLeft = false;
        }
    };
    guard.category = ENTITY.CATEGORIES.ENEMY;
    guard.index = WORLD.enemies.length;
    WORLD.entities.push(guard);
    WORLD.enemies.push(guard);
    return guard;
};

ENTITY.setPlayer = function(scene, x, y) {
    var textures = [];
    for(var i = 1; i <= 8; ++i) {
        textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
    }
    var player = ENTITY.person(scene, x, y, textures, ENTITY.CATEGORIES.PLAYER);
    WORLD.player = player;

    player.tick = function(e) {
        e.down = (INPUT.down[INPUT.KEY.DOWN.n] ? e.onGround : false);
        if(e.canWalk) {
            if (INPUT.down[INPUT.KEY.RIGHT.n]) {
                e.runsRight = true;
                e.runsLeft = false;
                e.vx = e.speed;
                e.running = true;
            }
            else if (INPUT.down[INPUT.KEY.LEFT.n]) {
                e.runsLeft = true;
                e.runsRight = false;
                e.vx = -e.speed;
                e.running = true;
            }
            else {
                e.vx = 0;
                e.runsRight = false;
                e.runsLeft = false;
                e.running = false;
            }
            if (e.onGround) {
                if (INPUT.down[INPUT.KEY.UP.n])
                    e.vy = -e.jumpSpeed;
            }
        }
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
        if(INPUT.down[INPUT.KEY.SPACE.n])
            e.weapon.hit(e.weapon);

        ENTITY.personTick(e);

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
    WORLD.entities.push(bullet);
    scene.addChild(bullet);
    return bullet;
};

ENTITY.playerBullet = function(scene, x1, y1, x2, y2) {
    var bullet = ENTITY.bullet(scene, x1, y1, x2, y2);
    bullet.index = WORLD.playerBullets.length;
    WORLD.playerBullets.push(bullet);
    bullet.category = ENTITY.CATEGORIES.PLAYERBULLET;
};

ENTITY.enemyBullet = function(scene, x1, y1, x2, y2) {
    var bullet = ENTITY.bullet(scene, x1, y1, x2, y2);
    bullet.index = WORLD.enemyBullets.length;
    WORLD.enemyBullets.push(bullet);
    bullet.category = ENTITY.CATEGORIES.ENEMYBULLET;
};

ENTITY.blood = function(scene, x, y) {
    var blood = new PIXI.Sprite(PIXI.Texture.fromFrame('blood.png'));
    blood.scale.x = blood.scale.y = SCALE;

    blood.lifeTime = 60 * 3;
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

    WORLD.entities.push(blood);
    scene.addChild(blood);
};

ENTITY.blade = function(scene, damage, e) {
    var blade = new PIXI.Sprite(PIXI.Texture.fromFrame('blade.png'));

    blade.scale.x = blade.scale.y = SCALE;
    blade.owner = e;
    blade.owner.sid += 4;
    blade.owner.sid %= 8;
    blade.maxLifeTime = 10;
    blade.lifeTime = blade.maxLifeTime;
    blade.x = blade.owner.x + blade.owner.width / 2 + (ENTITY.looksRight(blade) ? 1 : -1) * (blade.lifeTime / blade.maxLifeTime) * 5;
    blade.y = blade.owner.y + blade.owner.height / 2 - 4;
    if(ENTITY.looksRight(blade.owner) != ENTITY.looksRight(blade)) {
        ENTITY.flip(blade);
    }
    if(!ENTITY.looksRight(blade))
        blade.x -= blade.width;


    blade.damage = damage;
    blade.hit = false;

    blade.removed = false;
    blade.tick = function(e) {
        e.x = e.owner.x + e.owner.width / 2 + (ENTITY.looksRight(e) ? 1 : -1) * (e.lifeTime / e.maxLifeTime) * 5;
        e.y = e.owner.y + e.owner.height / 2 - 4;
        if(ENTITY.looksRight(e.owner) != ENTITY.looksRight(e)) {
            ENTITY.flip(e);
        }
        if(!ENTITY.looksRight(e))
            e.x -= e.width;
        if(e.lifeTime <= 0) {
            e.removed = true;
            blade.owner.sid += 4;
            blade.owner.sid %= 8;
        }
        --e.lifeTime;
    };
    blade.hitWall = function(e, xa, ya) {};
    blade.collide = function(b, e) {
        if(!b.hit) {
            e.health -= damage;
            b.hit = true;
            for(var i = 0; i < 20; ++i) {
                ENTITY.blood(gameScene, b.x + b.width / 2, b.y + b.height / 2);
            }
        }
    };
    WORLD.entities.push(blade);
    scene.addChild(blade);

    return blade;
};

ENTITY.enemyBlade = function(scene, damage, e) {
    var blade = ENTITY.blade(scene, damage, e);
    blade.category = ENTITY.CATEGORIES.ENEMYBULLET;
    blade.index = WORLD.enemyBullets.length;
    WORLD.enemyBullets.push(blade);
};

ENTITY.playerBlade = function(scene, damage, e) {
    var blade = ENTITY.blade(scene, damage, e);
    blade.category = ENTITY.CATEGORIES.PLAYERBULLET;
    blade.index = WORLD.playerBullets.length;
    WORLD.playerBullets.push(blade);
};

ENTITY.knife = function(scene, e) {
    var knife = {};
    knife.owner = e;
    knife.cooldown = 30;
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




