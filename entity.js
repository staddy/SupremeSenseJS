var ENTITY = {};

ENTITY.Animation = function(frameTime, loop, textures, entity, sequence) {
    this.frameTime = frameTime;
    this.loop = loop;
    this.textures = textures;
    if(sequence != undefined)
        this.sequence = sequence;
    else {
        this.sequence = [];
        for(var i = 0; i < textures.length; ++i)
            this.sequence.push(i);
    }
    this.entity = entity;
    this.currentFrame = 0;
    this.currentTick = 0;
    this.play = true;

    this.previous = [];
    this.previousLength = 0;

    this.reset = function() {
        this.currentFrame = 0;
        this.currentTick = 0;
        this.entity.sprite.texture = this.textures[this.sequence[0]];
    };

    this.tick = function() {
        if(play) {
            if (this.currentTick >= this.frameTime) {
                this.currentTick = 0;
                this.currentFrame += 1;
            }
            if (this.currentFrame >= this.sequence.length) {
                if (this.loop)
                    this.currentFrame = 0;
                else
                    this.currentFrame = this.sequence.length - 1;
            }
            entity.sprite.texture = this.textures[this.sequence[this.currentFrame]];
            ++this.currentTick;
        }

        if(this.previousLength >= MAX_REWIND)
            this.previous.shift();
        else
            ++this.previousLength;
        this.previous.push({frameTime: this.frameTime, loop: this.loop, currentFrame: this.currentFrame, currentTick: this.currentTick, play: this.play});
    };

    this.back = function() {
        if(this.previousLength == 0) {
            return;
        }
        var p = this.previous.pop();
        --this.previousLength;
        this.frameTime = p.frameTime;
        this.loop = p.loop;
        this.currentFrame = p.currentFrame;
        this.currentTick = p.currentTick;
        this.play = p.play;
        entity.sprite.texture = this.textures[this.sequence[this.currentFrame]];
    };
};

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

    this.previous = [];
    this.previousLength = 0;
};
ENTITY.Object.prototype.tick = function() {
    if(this.lifeTime > 0)
        --this.lifeTime;
    else if(this.lifeTime == 0)
        this.removed = true;
};
ENTITY.Object.prototype.back = function() {
};

ENTITY.LevelObject = function(x, y, scene, width, height, category, lifeTime) {
    ENTITY.LevelObject.super.constructor.call(this, category, lifeTime);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.scene = scene;
};
extend(ENTITY.LevelObject, ENTITY.Object);
ENTITY.LevelObject.prototype.tick = function() {
    ENTITY.LevelObject.super.tick.call(this);
    if(this.selection) {
        this.selection.x = this.x;
        this.selection.y = this.y;
        this.selection.width = this.width;
        this.selection.height = this.height;
    }
    if(this.previousLength >= MAX_REWIND)
        this.previous.shift();
    else
        ++this.previousLength;
    this.previous.push({x: this.x, y: this.y});
};
ENTITY.LevelObject.prototype.back = function() {
    ENTITY.LevelObject.super.back.call(this);
    if(this.previousLength == 0) {
        this.removed = true;
        return;
    }
    var p = this.previous.pop();
    --this.previousLength;
    this.x = p.x;
    this.y = p.y;
};

ENTITY.DamageBox = function(x, y, scene, width, height, category, lifeTime, damage) {
    ENTITY.DamageBox.super.constructor.call(this, x, y, scene, width, height, category, lifeTime);
    this.damage = damage;
    this.canHit = true;
};
extend(ENTITY.DamageBox, ENTITY.LevelObject);
ENTITY.DamageBox.prototype.collide = function(e) {
    if(e.hasOwnProperty('health') && this.canHit) {
        e.health -= this.damage;
        this.canHit = false;
        this.removed = true;
    }
};

ENTITY.SpriteObject = function(x, y, sprite, scene, category, lifeTime) {
    sprite.scale.x = sprite.scale.y = SCALE;
    ENTITY.SpriteObject.super.constructor.call(this, x, y, scene, sprite.width, sprite.height, category, lifeTime);
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
ENTITY.SpriteObject.prototype.back = function() {
    ENTITY.SpriteObject.super.back.call(this);
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

ENTITY.AnimatedObject = function(x, y, animation, scene, category, lifeTime) {
    ENTITY.AnimatedObject.super.constructor.call(this, x, y, new PIXI.Sprite(animation.textures[0]), scene, category, lifeTime);
    this.animation = animation;
};
extend(ENTITY.AnimatedObject, ENTITY.SpriteObject);
ENTITY.AnimatedObject.prototype.tick = function() {
    ENTITY.AnimatedObject.super.tick.call(this);
    this.animation.tick();
};
ENTITY.AnimatedObject.prototype.back = function() {
    ENTITY.AnimatedObject.super.back.call(this);
    this.animation.back();
};

ENTITY.RoamingAnimatedObject = function(x, y, dx, dy, animation, scene, category, lifeTime) {
    ENTITY.RoamingAnimatedObject.super.constructor.call(this, x, y, animation, scene, category, lifeTime);
    this.startX = x;
    this.startY = y;
    this.dX = dx;
    this.dY = dy;
    this.dirRigh = Math.random() > 0.5;
    this.dirDown = Math.random() > 0.5;
};
extend(ENTITY.RoamingAnimatedObject, ENTITY.AnimatedObject);
ENTITY.RoamingAnimatedObject.prototype.tick = function() {
    ENTITY.RoamingAnimatedObject.super.tick.call(this);
    if(this.dirRigh && this.x <= (this.startX + this.dX)) {
        if (Math.random() > 0.9)
            ++this.x;
    } else if(!this.dirRigh && this.x >= (this.startX - this.dX)) {
        if (Math.random() > 0.9)
            --this.x;
    } else
        this.dirRigh = !this.dirRigh;

    if(this.dirDown && this.y <= (this.startY + this.dY)) {
        if (Math.random() > 0.9)
            ++this.y;
    } else if(!this.dirDown && this.y >= (this.startY - this.dY)) {
        if (Math.random() > 0.9)
            --this.y;
    } else
        this.dirDown = !this.dirDown;

    if(Math.random() > 0.99)
        this.dirRigh = !this.dirRigh;
    if(Math.random() > 0.99)
        this.dirDown = !this.dirDown;
};

ENTITY.Animation1 = function(x, y, scene) {
    this.name = "animation1";
    var textures = [];
    for(var i = 1; i <= 4; ++i) {
        textures.push(PIXI.Texture.fromFrame('hornet' + i + '.png'));
    }
    ENTITY.Animation1.super.constructor.call(this, x, y, 20, 20, new ENTITY.Animation(8, true, textures, this), scene, ENTITY.CATEGORIES.NONE, -1);
};
extend(ENTITY.Animation1, ENTITY.RoamingAnimatedObject);

ENTITY.Animation2 = function(x, y, scene) {
    this.name = "animation2";
    var textures = [];
    for(var i = 1; i <= 5; ++i) {
        textures.push(PIXI.Texture.fromFrame('smoke' + i + '.png'));
    }
    ENTITY.Animation2.super.constructor.call(this, x, y, new ENTITY.Animation(16, true, textures, this), scene, ENTITY.CATEGORIES.NONE, -1);
};
extend(ENTITY.Animation2, ENTITY.AnimatedObject);

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
        new ENTITY.EFFECTS.Slow(e);
        new ENTITY.EFFECTS.KnockBack(e, this);
        this.hit = true;
        for(var i = 0; i < 20; ++i) {
            new ENTITY.Blood(this.x + this.width / 2, this.y + this.height / 2, this.scene);
        }
    }
};

ENTITY.Person = function(x, y, scene, textures, category, lifeTime) {
    ENTITY.Person.super.constructor.call(this, x, y, new PIXI.Sprite(textures[0]), scene, category, lifeTime);
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
    this.runs = ((this.vx != 0) && (this.canRun != false));
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
ENTITY.WEAPONS.Knife.prototype.hit = function() {
    if(this.timer <= 0) {
        if(!(new this.effect(this.scene, this.damage, this.entity, this.category).removed)) {
            this.timer = this.cooldown;
        }
    }
};

ENTITY.WEAPONS.Gun = function(scene, e, category, damage) {
    ENTITY.WEAPONS.Gun.super.constructor.call(this, 0, 0, new PIXI.Sprite(PIXI.Texture.fromFrame('gun.png')), scene, category, -1);
    this.damage = damage;
    this.timer = 0;
    this.cooldown = 30;
    this.entity = e;
    this.x = e.x + e.width / 2 + (e.looksRight() ? 0 : -this.width);
    this.y = e.y + e.height / 2 - 4;
    if(this.looksRight() != e.looksRight())
        this.flip();
};
extend(ENTITY.WEAPONS.Gun, ENTITY.PhysicalObject);
ENTITY.WEAPONS.Gun.prototype.hit = function() {
    if(this.timer <= 0) {
        new ENTITY.Bullet(this.x + (this.looksRight() ? 7 : -7), this.y + 4, this.looksRight() ? 11 : -11, 0, this.scene, ENTITY.CATEGORIES.PLAYERBULLET);
        this.timer = this.cooldown;
    }
};
ENTITY.WEAPONS.Gun.prototype.tick = function() {
    if(this.entity != null) {
        ENTITY.SpriteObject.prototype.tick.call(this);
        var e = this.entity;
        this.x = e.x + e.width / 2 + (e.looksRight() ? 0 : -this.width);
        this.y = e.y + e.height / 2 - 4;
        if(this.looksRight() != e.looksRight())
            this.flip();
    }
    if(this.timer > 0)
        --this.timer;
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

ENTITY.EFFECTS.Slow = function(e) {
    ENTITY.EFFECTS.Dash.super.constructor.call(this, ENTITY.CATEGORIES.EFFECT, 60 * 3);
    this.entity = e;
    this.entity.speed /= 2;
    this.entity.jumpSpeed /= 2;
    this.entity.effects.push(this);
};
extend(ENTITY.EFFECTS.Slow, ENTITY.Object);
ENTITY.EFFECTS.Slow.prototype.tick = function() {
    ENTITY.EFFECTS.Slow.super.tick.call(this);
    if(this.removed) {
        this.entity.speed *= 2;
        this.entity.jumpSpeed *= 2;
    }
};

ENTITY.EFFECTS.KnockBack = function(e, s) {
    ENTITY.EFFECTS.KnockBack.super.constructor.call(this, ENTITY.CATEGORIES.EFFECT, 15);
    this.entity = e;
    this.entity.canRun = false;
    this.entity.vx = (s.looksRight() ? 1 : -1) * 3;
    this.entity.vy -= 10;
    this.entity.effects.push(this);
};
extend(ENTITY.EFFECTS.KnockBack, ENTITY.Object);
ENTITY.EFFECTS.KnockBack.prototype.tick = function() {
    ENTITY.EFFECTS.KnockBack.super.tick.call(this);
    if(this.removed) {
        this.entity.canRun = true;
    }
};

ENTITY.Player = function(x, y, scene) {
    var textures = [];
    for(var i = 1; i <= 8; ++i) {
        textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
    }
    this.animation = new ENTITY.Animation(4, true, textures, this);
    ENTITY.Player.super.constructor.call(this, x, y, scene, textures, ENTITY.CATEGORIES.PLAYER, -1);
    WORLD.player = this;
    this.weapon = new ENTITY.WEAPONS.Knife(scene, this, ENTITY.CATEGORIES.PLAYERBULLET, 10);
    //this.weapon = new ENTITY.WEAPONS.Gun(scene, this, ENTITY.CATEGORIES.PLAYERBULLET, 10);
    this.dash = new ENTITY.Skill(this, ENTITY.EFFECTS.Dash, 30, 30);
};
extend(ENTITY.Player, ENTITY.Person);
ENTITY.Player.prototype.tick = function() {
    ENTITY.Player.super.tick.call(this);
    this.animation.tick();
    this.down = (INPUT.down[KEYS.DOWN] ? this.onGround : false);
    if(this.canRun) {
        if(INPUT.down[KEYS.RIGHT]) {
            this.runs = true;
            this.vx = this.speed;
        } else if (INPUT.down[KEYS.LEFT]) {
            this.runs = true;
            this.vx = -this.speed;
        } else {
            this.vx = 0;
            this.runs = false;
        }
        if(this.onGround) {
            if(INPUT.down[KEYS.UP])
                this.vy = -this.jumpSpeed;
        }
    }
    if(INPUT.down[KEYS.Z]) {
        this.dash.cast();
    }
    if(INPUT.down[KEYS.DOWN] && this.onGround && this.canRun) {
        if(this.height == 40) {
            this.y += 20;
            this.sprite.y += 20;
        }
        this.height = 20;
        this.sprite.height = 20;
        this.down = true;
    }
    else {
        if(WORLD.isFree(0, -20, {x: this.x, y: this.y, width: this.width, height: this.height})) {
            if(this.height == 20) {
                this.y -= 20;
                this.sprite.y -= 20;
            }
            this.height = 40;
            this.sprite.height = 40;
            this.down = false;
        }
    }
    if(INPUT.down[KEYS.X])
        if(this.weapon != null)
            this.weapon.hit();

    INTERFACE.setHealth(this.health, this.maxHealth);
    INTERFACE.setEnergy(this.energy, this.maxEnergy);
};
ENTITY.Player.prototype.back = function() {
    ENTITY.Player.super.back.call(this);
    this.animation.back();
};

ENTITY.AI = {};
ENTITY.AI.isFloor = function(e) {
    var x = e.x + (e.vx > 0 ? e.width : - 1);
    var y = e.y + e.height;
    var p = {x: x, y: y, width: 1, height: 1, category: ENTITY.CATEGORIES.NONE};
    return !WORLD.isFree(0, 0, p);
};

ENTITY.Guard = function(x, y, scene) {
    this.name = "guard";
    var textures = [];
    for(var i = 1; i <= 8; ++i) {
        textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
    }
    ENTITY.Guard.super.constructor.call(this, x, y, scene, textures, ENTITY.CATEGORIES.ENEMY, -1);
    this.weapon = new ENTITY.WEAPONS.Knife(scene, this, ENTITY.CATEGORIES.ENEMYBULLET, 10);
    this.maxHealth = 15;
};
extend(ENTITY.Guard, ENTITY.Person);
ENTITY.Guard.prototype.tick = function() {
    ENTITY.Guard.super.tick.call(this);
    if(this.canRun && this.onGround && !ENTITY.AI.isFloor(this))
        this.vx = -this.vx;

    if(this.health <= 0) {
        this.removed = true;
        for(var i = 0; i < 40; ++i) {
            new ENTITY.Blood(this.x + this.width / 2, this.y + this.height / 2, gameScene);
        }
    }
};
ENTITY.Guard.prototype.hitWall = function(xa, ya) {
    if(xa != 0 && this.canRun) {
        this.vx = -this.vx;
    } else {
        ENTITY.Guard.super.hitWall.call(this, xa, ya);
    }
};

ENTITY.Slime = function(x, y, scene) {
    var textures = [];
    for(var i = 1; i <= 3; ++i) {
        textures.push(PIXI.Texture.fromFrame('slime' + i + '.png'));
    }
    this.animation = new ENTITY.Animation(8, true, textures, this);
    ENTITY.Slime.super.constructor.call(this, x, y, scene, textures, ENTITY.CATEGORIES.ENEMY, -1);
    this.jumpTimer = 0;
    this.damageTimer = 0;
    this.jumpCooldown = 60;
    this.damageCooldown = 30;
    this.jumpSpeed = 10;
};
extend(ENTITY.Slime, ENTITY.Person);
ENTITY.Slime.prototype.tick = function() {
    ENTITY.Slime.super.tick.call(this);
    this.animation.tick();
    this.width = this.sprite.width;
    this.y += (this.height - this.sprite.height);
    this.sprite.y = this.y;
    this.height = this.sprite.height;

    if(this.jumpTimer < this.jumpCooldown)
        ++this.jumpTimer;
    if(this.damageTimer < this.damageCooldown)
        ++this.damageTimer;

    if(this.canRun) {
        if(this.onGround) {
            if(this.jumpTimer >= this.jumpCooldown)
                if(Math.random() > 0.9) {
                    this.vx += Math.random() * 3 * Math.sign(WORLD.player.x - this.x);
                    this.vy = -this.jumpSpeed * (0.5 + 0.5 * Math.random());
                    this.jumpTimer = 0;
                }
        }
    }
    if(this.damageTimer >= this.damageCooldown)
        if(WORLD.areCollide(this, WORLD.player)) {
            new ENTITY.DamageBox(this.x, this.y, this.scene, this.width, this.height, ENTITY.CATEGORIES.ENEMYBULLET, 1, 20);
            this.damageTimer = 0;
        }
};
ENTITY.Slime.prototype.back = function() {
    ENTITY.Slime.super.back.call(this);
    this.animation.back();
};

ENTITY.Blood = function(x, y, scene) {
    ENTITY.Blood.super.constructor.call(this, x, y, new PIXI.Sprite(PIXI.Texture.fromFrame('blood.png')), scene, ENTITY.CATEGORIES.NONE, 60 * 3);
    this.vx = Math.random() * 10 - 5;
    this.vy = Math.random() * 10 - 5;
    this.bounce = 0.5;
};
extend(ENTITY.Blood, ENTITY.PhysicalObject);

ENTITY.Bullet = function(x1, y1, bxa, bya, scene, category) {
    ENTITY.Bullet.super.constructor.call(this, x1, y1, new PIXI.Sprite(PIXI.Texture.fromFrame('bullet.png')), scene, category, 600);
    /*var bulletSpeed = 11.0;
    var bya, bxa;
    if((y2 - y1) != 0) {
        var k = ((x2 - x1) / (y2 - y1));
        bya = bulletSpeed * Math.sqrt(1 / (1 + k * k)) * ((y2 - y1) > 0 ? 1 : -1);
        bxa = bya * k;
    } else {
        bya = 0;
        bxa = bulletSpeed * Math.sign(x2 - x1);
    }
    this.sprite.rotation = (k != 0) ? Math.atan(1/k) : (Math.PI / 2 * Math.sign(y2 - y1)) + Math.PI;*/
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.vx = bxa;
    this.vy = bya;
    this.gravity = false;
};
extend(ENTITY.Bullet, ENTITY.PhysicalObject);
ENTITY.Bullet.prototype.hitWall = function(xa, ya) {
    this.removed = true;
};
ENTITY.Bullet.prototype.collide = function(e){
    this.removed = true;
    e.health -= 10;
};

ENTITY.CATEGORIES = {NONE: 0, PLAYER: 1, ENEMY: 2, PLAYERBULLET: 3, ENEMYBULLET: 4, SKILL: 5, EFFECT: 6, WEAPON: 7};




