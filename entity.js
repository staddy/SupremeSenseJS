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
        if(WORLD.isFree(xa, 0, e)) {
            e.x += xa;
        }
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

ENTITY.Object = function(category, lifeTime) {
    this.removed = false;
    this.category = category;
    this.lifeTime = lifeTime;
    WORLD.entities.push(this);
    switch(this.category) {
        case ENTITY.CATEGORIES.ENEMY:
            WORLD.enemies.push(this);
            break;
        case ENTITY.CATEGORIES.PLAYERBULLET:
            WORLD.playerBullets.push(this);
            break;
        case ENTITY.CATEGORIES.ENEMYBULLET:
            WORLD.enemyBullets.push(this);
            break;
    }
};
ENTITY.Object.prototype.tick = function() {
    if(this.lifeTime > 0)
        --this.lifeTime;
    else if(this.lifeTime == 0)
        this.removed = true;
};

ENTITY.LevelObject = function(x, y, width, height, category, lifeTime) {
    this.super = ENTITY.LevelObject.super;
    this.super.constructor.call(this, category, lifeTime);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};
extend(ENTITY.LevelObject, ENTITY.Object);

ENTITY.SpriteObject = function(x, y, sprite, scene, category, lifeTime) {
    this.super = ENTITY.SpriteObject.super;
    this.sprite = sprite;
    this.sprite.scale.x = this.sprite.scale.y = SCALE;
    scene.addChild(this.sprite);
    this.super.constructor.call(this, x, y, sprite.width, sprite.height, category, lifeTime);
};
extend(ENTITY.SpriteObject, ENTITY.LevelObject);
ENTITY.SpriteObject.prototype.tick = function() {
    this.super.tick.call(this);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
};

ENTITY.PhysicalObject = function(x, y, sprite, scene, category, lifeTime) {
    this.super = ENTITY.PhysicalObject.super;
    this.super.constructor.call(this, x, y, sprite, scene, category, lifeTime);
    this.vx = 0;
    this.vy = 0;
    this.bounce = 0;
    this.onGround = false;
    this.gravity = true;
};
extend(ENTITY.PhysicalObject, ENTITY.SpriteObject);
ENTITY.PhysicalObject.prototype.tick = function() {
    this.super.tick.call(this);
    if(this.gravity)
        this.vy += WORLD.GRAVITY;
    if(Math.abs(e.vy) >= WORLD.MAXSPEED) e.vy = Math.sign(e.vy) * WORLD.MAXSPEED;
    if(Math.abs(e.vx) >= WORLD.MAXSPEED) e.vx = Math.sign(e.vx) * WORLD.MAXSPEED;
    ENTITY.tryMove(this, this.vx, this.vy);
};
ENTITY.PhysicalObject.prototype.hitWall = function(xa, ya) {
    if(xa != 0)
        this.vx *= -this.bounce;
    else if(ya != 0)
        this.vy *= -this.bounce;
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

    if(e.energy < e.maxEnergy)
        e.energy += e.energyRegeneration;

    if(e.energy > e.maxEnergy)
        e.energy = e.maxEnergy;

    e.weapon.tick(e.weapon);
    for(var i = 0; i < e.effects.length; ++i) {
        var eff = e.effects[i];
        if(eff.removed)
            e.effects.splice(i--, 1);
        else
            eff.tick(eff);
    }
};

ENTITY.person = function(scene, x, y, textures, category) {
    var person = new PIXI.Sprite();

    person.effects = [];

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
    person.energy = 100;
    person.maxEnergy = 100;
    person.healthRegeneration = 0.1;
    person.energyRegeneration = 0.1;
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
    guard.randomness = 0.01;

    guard.maxHealth = 10;
    guard.tick = function(e) {
        var r = Math.random()
        if(r > (1 - e.randomness)) {
            e.shouldRight = true;
            e.shouldLeft = false;
        } else if(r < e.randomness) {
            e.shouldRight = false;
            e.shouldLeft = true;
        }
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
        if((Math.abs(WORLD.player.x - e.x) < 20) && (Math.abs(WORLD.player.y - e.y) < 40))
            e.weapon.hit(e.weapon);
        if(Math.random() < e.randomness)
            if(e.onGround)
                e.vy = -e.jumpSpeed;
        if(WORLD.player.y > e.y)
            e.down = true;
        else
            e.down = false;
        ENTITY.personTick(e);

        if(e.health <= 0) {
            e.removed = true;
            for(var i = 0; i < 40; ++i) {
                ENTITY.blood(gameScene, e.x + e.width / 2, e.y + e.height / 2);
            }
        }
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

    player.dashcd = 30;
    player.dashcost = 10;
    player.dashtimer = 0;

    player.tick = function(e) {
        if(e.dashtimer > 0)
            --e.dashtimer;

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
        if(INPUT.down[INPUT.KEY.SHIFT.n] && e.onGround && e.canWalk && !e.down && (e.energy >= e.dashcost) && (e.dashtimer <= 0)) {
            e.effects.push(ENTITY.dash(e, ENTITY.looksRight(e)));
            e.energy -= e.dashcost;
            e.dashtimer = e.dashcd;
        }
        if(INPUT.down[INPUT.KEY.DOWN.n] && e.onGround && e.canWalk) {
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
        INTERFACE.setEnergy(e.energy, e.maxEnergy);
    };
    player.hitWall = function(e, xa, ya) {

    };
    player.collide = function(e, b) {

    };
};

ENTITY.bullet = function(scene, x1, y1, x2, y2) {
    var bulletSpeed = 17.0;
    var bya, bxa;
    if((y2 - y1) != 0) {
        var k = ((x2 - x1) / (y2 - y1));
        bya = bulletSpeed * Math.sqrt(1 / (1 + k * k)) * ((y2 - y1) > 0 ? 1 : -1);
        bxa = bya * k;
    } else {
        bya = 0;
        bxa = bulletSpeed * Math.sign(x2 - x1);
    }
    var bullet = new PIXI.Sprite(PIXI.Texture.fromFrame('bullet.png'));
    bullet.scale.x = bullet.scale.y = SCALE;
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
    bullet.collide = function(b, e) {b.removed = true;e.health -= 10;};
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
            e.effects.push(ENTITY.slow(e));
            e.effects.push(ENTITY.knockback(e, ENTITY.looksRight(b)));
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

ENTITY.slow = function(e) {
    var slow = {};
    slow.duration = 120;
    slow.oldSpeed = e.speed;
    slow.target = e;
    slow.removed = false;
    e.speed /= 2;
    e.jumpSpeed /= 2;
    slow.tick = function(e) {
        --e.duration;
        if(e.duration <= 0) {
            e.target.speed *= 2;
            e.target.jumpSpeed *= 2;
            e.removed = true;
        }
    };
    return slow;
};

ENTITY.knockback = function(e, right) {
    var knockback = {};
    knockback.duration = 15;
    knockback.target = e;
    knockback.removed = false;
    e.canWalk = false;
    e.vx = (right ? 1 : -1) * 3;
    e.vy -= 4;
    knockback.tick = function(e) {
        --e.duration;
        if(e.duration <= 0) {
            e.target.canWalk = true;
            e.removed = true;
        }
    };
    return knockback;
};

ENTITY.dash = function(e, right) {
    var dash = {};
    dash.duration = 5;
    dash.target = e;
    dash.removed = false;
    e.canWalk = false;
    e.vx = (right ? 1 : -1) * 9;
    dash.tick = function(e) {
        --e.duration;
        if(e.duration <= 0) {
            e.target.canWalk = true;
            e.removed = true;
        }
    };
    return dash;
};

ENTITY.gun = function(scene, e) {
    var gun = new PIXI.Sprite(PIXI.Texture.fromFrame('gun.png'));
    gun.owner = e;
    gun.tick = function(e) {
        e.x = e.owner.x + e.owner.width / 2 + (ENTITY.looksRight(e) ? 1 : -1) * 5;
        e.y = e.owner.y + e.owner.height / 2 - 4;
    };
    scene.addChild(gun);
};

ENTITY.CATEGORIES = {NONE: 0, PLAYER: 1, ENEMY: 2, PLAYERBULLET: 3, ENEMYBULLET: 4};




