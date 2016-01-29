var ENTITY = {};

ENTITY.Object = function(category, lifeTime) {
    this.removed = false;
    this.sprite = null;
    this.category = category;
    this.lifeTime = lifeTime;
    this.duration = lifeTime;
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
    ENTITY.LevelObject.super.constructor.call(this, category, lifeTime);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};
extend(ENTITY.LevelObject, ENTITY.Object);

ENTITY.SpriteObject = function(x, y, sprite, scene, category, lifeTime) {
    sprite.scale.x = sprite.scale.y = SCALE;
    ENTITY.SpriteObject.super.constructor.call(this, x, y, sprite.width, sprite.height, category, lifeTime);
    this.sprite = sprite;
    this.sprite.x = x;
    this.sprite.y = y;
    scene.addChild(this.sprite);
};
extend(ENTITY.SpriteObject, ENTITY.LevelObject);
ENTITY.SpriteObject.prototype.tick = function() {
    ENTITY.SpriteObject.super.tick.call(this);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
};
ENTITY.SpriteObject.prototype.looksRight = function() {
    return this.sprite.scale.x > 0;
};
ENTITY.SpriteObject.prototype.flip = function() {
    this.sprite.scale.x = -this.sprite.scale.x;
    if(this.looksRight())
        this.sprite.anchor.x = 0;
    else
        this.sprite.anchor.x = 1;
};

ENTITY.PhysicalObject = function(x, y, sprite, scene, category, lifeTime) {
    ENTITY.PhysicalObject.super.constructor.call(this, x, y, sprite, scene, category, lifeTime);
    this.vx = 0;
    this.vy = 0;
    this.bounce = 0;
    this.onGround = false;
    this.gravity = true;
};
extend(ENTITY.PhysicalObject, ENTITY.SpriteObject);
ENTITY.PhysicalObject.prototype.tryMove = function(xa, ya) {
    this.onGround = false;
    if(WORLD.isFree(xa, 0, this)) {
        this.x += xa;
    } else {
        this.hitWall(xa, 0);
        var xx;
        if(xa < 0) {
            xx = this.x / WORLD.TILE;
            xa = -(xx - Math.floor(xx)) * WORLD.TILE;
        } else {
            xx = (this.x + this.width) / WORLD.TILE;
            xa = WORLD.TILE - (xx - Math.floor(xx)) * WORLD.TILE;
        }
        if(WORLD.isFree(xa, 0, this)) {
            this.x += xa;
        }
    }
    if(WORLD.isFree(0, ya, this)) {
        this.y += ya;
    } else {
        if(ya > 0)
            this.onGround = true;
        this.hitWall(0, ya);
        var yy;
        if(ya < 0) {
            yy = this.y / WORLD.TILE;
            ya = -(yy - Math.floor(yy)) * WORLD.TILE;
        } else {
            yy = (this.y + this.height) / WORLD.TILE;
            ya = WORLD.TILE - (yy - Math.floor(yy)) * WORLD.TILE;
        }
        if(WORLD.isFree(0, ya, this)) {
            this.y += ya;
        }
    }
    // to avoid bug
    this.x = Math.round((this.x)*100)/100;
    this.y = Math.round((this.y)*100)/100;
};
ENTITY.PhysicalObject.prototype.tick = function() {
    ENTITY.PhysicalObject.super.tick.call(this);
    if(this.gravity)
        this.vy += WORLD.GRAVITY;
    if(Math.abs(this.vy) >= WORLD.MAXSPEED) this.vy = Math.sign(this.vy) * WORLD.MAXSPEED;
    if(Math.abs(this.vx) >= WORLD.MAXSPEED) this.vx = Math.sign(this.vx) * WORLD.MAXSPEED;
    this.tryMove(this.vx, this.vy);
};
ENTITY.PhysicalObject.prototype.hitWall = function(xa, ya) {
    if(xa != 0)
        this.vx *= -this.bounce;
    else if(ya != 0)
        this.vy *= -this.bounce;
};
ENTITY.PhysicalObject.prototype.collide = function(e) {

};

ENTITY.BULLETS = {};
ENTITY.BULLETS.Blade = function(scene, damage, e, category) {
    //fixme (texture or filename???)
    ENTITY.BULLETS.Blade.super.constructor.call(this, 0, 0, new PIXI.Sprite(PIXI.Texture.fromFrame('blade.png')), scene, category, 10);

    this.entity = e;
    this.entity.sid += 4;
    this.entity.sid %= 8;

    this.x = this.entity.x + this.entity.width / 2 + (this.looksRight() ? 1 : -1);
    this.y = this.entity.y + this.entity.height / 2 - 4;
    if(this.entity.looksRight() != this.looksRight()) {
        this.flip();
    }
    if(!this.looksRight())
        this.x -= this.width;

    this.damage = damage;
    this.hit = false;
};
extend(ENTITY.BULLETS.Blade, ENTITY.SpriteObject);
ENTITY.BULLETS.Blade.prototype.tick = function() {
    ENTITY.BULLETS.Blade.super.tick.call(this);
    this.x = this.entity.x + this.entity.width / 2 + (this.looksRight() ? 1 : -1) * (this.lifeTime / this.duration) * 5;
    this.y = this.entity.y + this.entity.height / 2 - 4;
    if(this.entity.looksRight() != this.looksRight()) {
        this.flip();
    }
    if(!this.looksRight())
        this.x -= this.width;
    //fixme (animate???)
    if(this.removed) {
        this.entity.sid += 4;
        this.entity.sid %= 8;
    }
};
ENTITY.BULLETS.Blade.prototype.collide = function(e) {
    if(!this.hit) {
        e.health -= this.damage;
        //fixme !!!
        //e.effects.push(ENTITY.slow(e));
        //e.effects.push(ENTITY.knockback(e, ENTITY.looksRight(b)));
        this.hit = true;
        //for(var i = 0; i < 20; ++i) {
        //    ENTITY.blood(gameScene, b.x + b.width / 2, b.y + b.height / 2);
        //}
    }
};

ENTITY.Person = function(x, y, scene, textures, category, lifeTime) {
    ENTITY.Person.super.constructor.call(this, x, y, new PIXI.Sprite(textures[3]), scene, category, lifeTime);
    this.runs = false;
    this.canRun = true;

    this.speed = 2.5;
    this.jumpSpeed = 7.6;
    this.health = 100;
    this.maxHealth = 100;
    this.energy = 100;
    this.maxEnergy = 100;
    this.healthRegeneration = 0.1;
    this.energyRegeneration = 0.1;

    // animation
    this.time = 0;
    this.dt = 7;
    this.sid = 3;
    this.textures = textures;

    this.weapon = null;
    this.effects = [];
};
extend(ENTITY.Person, ENTITY.PhysicalObject);
ENTITY.Person.prototype.tick = function() {
    ENTITY.Person.super.tick.call(this);
    if((this.vx == 0) || (this.canRun == false)) {
        this.runs = false;
    }
    if((this.runs) &&
        (((this.vx > 0) && !this.looksRight()) ||
        ((this.vx < 0) && this.looksRight()))) {
        this.flip();
    }
    if(this.runs && this.onGround) {
        ++this.time;
    } else if(this.sid != 7) {
        this.sid = 3;
    }
    if(this.time > this.dt) {
        ++this.sid;
        if(this.sid > 7)
            this.sid = 0;
        this.time = 0;
    }
    this.sprite.texture = this.textures[this.sid];

    if(this.health < this.maxHealth)
        this.health += this.healthRegeneration;
    if(this.health > this.maxHealth)
        this.health = this.maxHealth;
    if(this.energy < this.maxEnergy)
        this.energy += this.energyRegeneration;
    if(this.energy > this.maxEnergy)
        this.energy = this.maxEnergy;

    for(var i = 0; i < this.effects.length; ++i) {
        if(this.effects[i].removed)
            this.effects.splice(i--, 1);
    }
};

ENTITY.Skill = function(entity, effect, cooldown, cost) {
    ENTITY.Skill.super.constructor.call(this, ENTITY.CATEGORIES.SKILL, -1);
    this.entity = entity;
    this.effect = effect;
    this.cooldown = cooldown;
    this.cost = cost;
    this.timer = 0;
};
extend(ENTITY.Skill, ENTITY.Object);
ENTITY.Skill.prototype.tick = function() {
    if(this.entity.removed)
        this.removed = true;
    if(this.timer > 0)
        --this.timer;
};
ENTITY.Skill.prototype.cast = function() {
    if((this.timer <= 0) && (this.entity.energy >= this.cost)) {
        if(!(new this.effect(this.entity).removed)) {
            this.timer = this.cooldown;
            this.entity.energy -= this.cost;
        }
    }
};

ENTITY.WEAPONS = {};
ENTITY.WEAPONS.Knife = function(scene, e, category, damage) {
    ENTITY.WEAPONS.Knife.super.constructor.call(this, e, ENTITY.BULLETS.Blade, 30, 0);
    this.scene = scene;
    this.category = category;
    this.damage = damage;
};
extend(ENTITY.WEAPONS.Knife, ENTITY.Skill);
ENTITY.WEAPONS.Knife.prototype.hit = function(k) {
    if(this.timer <= 0) {
        if(!(new this.effect(this.scene, this.damage, this.entity, this.category).removed)) {
            this.timer = this.cooldown;
        }
    }
};

ENTITY.EFFECTS = {};
ENTITY.EFFECTS.Dash = function(e) {
    ENTITY.EFFECTS.Dash.super.constructor.call(this, ENTITY.CATEGORIES.EFFECT, 5);
    if(e.canRun) {
        this.entity = e;
        this.entity.canRun = false;
        this.entity.vx = (this.entity.looksRight() ? 1 : -1) * 9;
        this.entity.effects.push(this);
    } else {
        this.removed = true;
    }
};
extend(ENTITY.EFFECTS.Dash, ENTITY.Object);
ENTITY.EFFECTS.Dash.prototype.tick = function() {
    ENTITY.EFFECTS.Dash.super.tick.call(this);
    this.canRun = false;
    if(this.removed) {
        this.entity.canRun = true;
    }
};

ENTITY.Player = function(x, y, scene) {
    var textures = [];
    for(var i = 1; i <= 8; ++i) {
        textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
    }
    ENTITY.Player.super.constructor.call(this, x, y, scene, textures, ENTITY.CATEGORIES.PLAYER, -1);
    WORLD.player = this;
    this.weapon = new ENTITY.WEAPONS.Knife(scene, this, ENTITY.CATEGORIES.PLAYERBULLET, 10);
    this.dash = new ENTITY.Skill(this, ENTITY.EFFECTS.Dash, 30, 30);
};
extend(ENTITY.Player, ENTITY.Person);
ENTITY.Player.prototype.tick = function() {
    ENTITY.Player.super.tick.call(this);
    this.down = (INPUT.down[INPUT.KEY.DOWN.n] ? this.onGround : false);
    if(this.canRun) {
        if(INPUT.down[INPUT.KEY.RIGHT.n]) {
            this.runs = true;
            this.vx = this.speed;
        } else if (INPUT.down[INPUT.KEY.LEFT.n]) {
            this.runs = true;
            this.vx = -this.speed;
        } else {
            this.vx = 0;
            this.runs = false;
        }
        if(this.onGround) {
            if(INPUT.down[INPUT.KEY.UP.n])
                this.vy = -this.jumpSpeed;
        }
    }
    if(INPUT.down[INPUT.KEY.SHIFT.n]) {
        this.dash.cast();
    }
    if(INPUT.down[INPUT.KEY.DOWN.n] && this.onGround && this.canRun) {
        if(this.height == 40) {
            this.y += 20;
        }
        this.height = 20;
        this.sprite.height = 20;
        this.down = true;
    }
    else {
        if(WORLD.isFree(0, -20, this)) {
            if(this.height == 20) {
                this.y -= 20;
            }
            this.height = 40;
            this.sprite.height = 40;
            this.down = false;
        }
    }
    if(INPUT.down[INPUT.KEY.SPACE.n])
        if(this.weapon != null)
            this.weapon.hit();

    INTERFACE.setHealth(this.health, this.maxHealth);
    INTERFACE.setEnergy(this.energy, this.maxEnergy);
};

/*
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
        var r = Math.random();
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
            if (e.canRun) {
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
        e.down = (WORLD.player.y > e.y);
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
    e.canRun = false;
    e.vx = (right ? 1 : -1) * 3;
    e.vy -= 4;
    knockback.tick = function(e) {
        --e.duration;
        if(e.duration <= 0) {
            e.target.canRun = true;
            e.removed = true;
        }
    };
    return knockback;
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
*/

ENTITY.CATEGORIES = {NONE: 0, PLAYER: 1, ENEMY: 2, PLAYERBULLET: 3, ENEMYBULLET: 4, SKILL: 5, EFFECT: 6, WEAPON: 7};




