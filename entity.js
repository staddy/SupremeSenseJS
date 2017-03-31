var ENTITY = {};
ENTITY.GROUP = {
    NONE: 0,
    A: 1,
    B: 2,
    C: 4
};
ENTITY.currentId = 0;

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

declareClass(ENTITY, Class, 'Object', {
    init: function(category, lifeTime) {
        this.id = ENTITY.currentId++;
        this.removed = false;
        this.sprite = null;
        this.category = category;
        this.lifeTime = lifeTime;
        this.duration = lifeTime;
        this.group = ENTITY.GROUP.NONE;
        WORLD.entities.push(this);
        switch (this.category) {
            case ENTITY.CATEGORIES.ENEMY:
                this.group |= ENTITY.GROUP.B;
                break;
            case ENTITY.CATEGORIES.PLAYERBULLET:
                this.group |= ENTITY.GROUP.B;
                break;
            case ENTITY.CATEGORIES.ENEMYBULLET:
                this.group |= ENTITY.GROUP.A;
                break;
        }

        this.previous = [];
        this.previousLength = 0;
    },
    tick: function () {
        if (this.lifeTime > 0)
            --this.lifeTime;
        else if (this.lifeTime == 0)
            this.removed = true;
    },
    back: function () {
    }
});

declareClass(ENTITY, 'Object', 'LevelObject', {
    init: function (x, y, scene, width, height, category, lifeTime) {
        this._super(category, lifeTime);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scene = scene;
    },

    tick: function () {
        this._super();
        if (this.selection) {
            this.selection.x = this.x;
            this.selection.y = this.y;
            this.selection.width = this.width;
            this.selection.height = this.height;
        }
        if (this.previousLength >= MAX_REWIND)
            this.previous.shift();
        else
            ++this.previousLength;
        this.previous.push({x: this.x, y: this.y});
    },
    back: function () {
        this._super();
        if (this.previousLength == 0) {
            this.removed = true;
            return;
        }
        var p = this.previous.pop();
        --this.previousLength;
        this.x = p.x;
        this.y = p.y;
    }
});

declareClass(ENTITY, 'LevelObject', 'DamageBox', {
    init: function (x, y, scene, width, height, category, lifeTime, damage) {
        this._super(x, y, scene, width, height, category, lifeTime);
        this.name = "damagebox";
        this.damage = damage;
        this.canHit = true;
    },
    collide: function (e) {
        if (e.hasOwnProperty('health') && this.canHit) {
            e.health -= this.damage;
            this.canHit = false;
            this.removed = true;
        }
    }
});

declareClass(ENTITY, 'LevelObject', 'SpriteObject', {
        init: function (x, y, sprite, scene, category, lifeTime) {
            sprite.scale.x = sprite.scale.y = SCALE;
            this._super(x, y, scene, sprite.width, sprite.height, category, lifeTime);
            this.sprite = sprite;
            this.sprite.x = x;
            this.sprite.y = y;
            scene.addChild(this.sprite);
        },
        tick: function () {
            this._super();
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        },
        back: function () {
            this._super();
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        },
    looksRight: function () {
        return this.sprite.scale.x > 0;
    },
    flip: function () {
        this.sprite.scale.x = -this.sprite.scale.x;
        if (this.looksRight())
            this.sprite.anchor.x = 0;
        else
            this.sprite.anchor.x = 1;
    }
});

declareClass(ENTITY, 'SpriteObject', 'AnimatedObject', {
    init: function (x, y, animation, scene, category, lifeTime) {
        this._super(x, y, new PIXI.Sprite(animation.textures[0]), scene, category, lifeTime);
        this.animation = animation;
    },
    tick: function () {
        this._super();
        this.animation.tick();
    },
    back: function () {
        this._super();
        this.animation.back();
    }
});

declareClass(ENTITY, 'AnimatedObject', 'RoamingAnimatedObject', {
    init: function (x, y, dx, dy, animation, scene, category, lifeTime) {
        this._super(x, y, animation, scene, category, lifeTime);
        this.startX = x;
        this.startY = y;
        this.dX = dx;
        this.dY = dy;
        this.dirRigh = Math.random() > 0.5;
        this.dirDown = Math.random() > 0.5;
    },
    tick: function () {
        this._super();
        if (this.dirRigh && this.x <= (this.startX + this.dX)) {
            if (Math.random() > 0.9)
                ++this.x;
        } else if (!this.dirRigh && this.x >= (this.startX - this.dX)) {
            if (Math.random() > 0.9)
                --this.x;
        } else
            this.dirRigh = !this.dirRigh;

        if (this.dirDown && this.y <= (this.startY + this.dY)) {
            if (Math.random() > 0.9)
                ++this.y;
        } else if (!this.dirDown && this.y >= (this.startY - this.dY)) {
            if (Math.random() > 0.9)
                --this.y;
        } else
            this.dirDown = !this.dirDown;

        if (Math.random() > 0.99)
            this.dirRigh = !this.dirRigh;
        if (Math.random() > 0.99)
            this.dirDown = !this.dirDown;
    }
});

declareClass(ENTITY, 'RoamingAnimatedObject', 'Animation1', {
    init: function (x, y, scene) {
        this.name = "animation1";
        var textures = [];
        for (var i = 1; i <= 4; ++i) {
            textures.push(PIXI.Texture.fromFrame('hornet' + i + '.png'));
        }
        this._super(x, y, 20, 20, new ENTITY.Animation(8, true, textures, this), scene, ENTITY.CATEGORIES.NONE, -1);
    }
});

declareClass(ENTITY, 'AnimatedObject', 'Animation2', {
    init: function(x, y, scene) {
        this.name = "animation2";
        var textures = [];
        for(var i = 1; i <= 5; ++i) {
            textures.push(PIXI.Texture.fromFrame('smoke' + i + '.png'));
        }
        this._super(x, y, new ENTITY.Animation(16, true, textures, this), scene, ENTITY.CATEGORIES.NONE, -1);
    }
});

declareClass(ENTITY, 'SpriteObject', 'PhysicalObject', {
    init: function (x, y, sprite, scene, category, lifeTime) {
        this._super(x, y, sprite, scene, category, lifeTime);
        this.vx = 0;
        this.vy = 0;
        this.bounce = 0;
        this.onGround = false;
        this.gravity = true;
    },
    tryMove: function (xa, ya) {
        this.onGround = false;
        if (WORLD.isFree(xa, 0, this)) {
            this.x += xa;
        } else {
            this.hitWall(xa, 0);
            var xx;
            if (xa < 0) {
                xx = this.x / WORLD.TILE;
                xa = -(xx - Math.floor(xx)) * WORLD.TILE;
            } else {
                xx = (this.x + this.width) / WORLD.TILE;
                xa = WORLD.TILE - (xx - Math.floor(xx)) * WORLD.TILE;
            }
            if (WORLD.isFree(xa, 0, this)) {
                this.x += xa;
            }
        }
        if (WORLD.isFree(0, ya, this)) {
            this.y += ya;
        } else {
            if (ya > 0)
                this.onGround = true;
            this.hitWall(0, ya);
            var yy;
            if (ya < 0) {
                yy = this.y / WORLD.TILE;
                ya = -(yy - Math.floor(yy)) * WORLD.TILE;
            } else {
                yy = (this.y + this.height) / WORLD.TILE;
                ya = WORLD.TILE - (yy - Math.floor(yy)) * WORLD.TILE;
            }
            if (WORLD.isFree(0, ya, this)) {
                this.y += ya;
            }
        }
        // to avoid bug
        this.x = Math.round((this.x) * 100) / 100;
        this.y = Math.round((this.y) * 100) / 100;
    },
    tick: function () {
        this._super();
        if (this.gravity)
            this.vy += WORLD.GRAVITY;
        if (Math.abs(this.vy) >= WORLD.MAXSPEED) this.vy = Math.sign(this.vy) * WORLD.MAXSPEED;
        if (Math.abs(this.vx) >= WORLD.MAXSPEED) this.vx = Math.sign(this.vx) * WORLD.MAXSPEED;
        WORLD.isFree(0, 0, this);   // to accelerate while on ground (blood still doesn't ???)
        this.tryMove(this.vx, this.vy);
    },
    hitWall: function (xa, ya) {
        if (xa != 0)
            this.vx *= -this.bounce;
        else if (ya != 0)
            this.vy *= -this.bounce;
    },
    collide: function (e) {

    }
});

ENTITY.BULLETS = {};
declareClass(ENTITY.BULLETS, ENTITY.SpriteObject, 'Blade', {
    init: function(scene, damage, e, category) {
        //fixme (texture or filename???)
        this._super(0, 0, new PIXI.Sprite(PIXI.Texture.fromFrame('blade.png')), scene, category, 10);
        this.name = "blade";

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
    },
    tick: function() {
        this._super();
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
    },
    collide: function(e) {
        if (!this.hit) {
            e.health -= this.damage;
            //fixme !!!
            new ENTITY.EFFECTS.Slow(e);
            new ENTITY.EFFECTS.KnockBack(e, this);
            this.hit = true;
            for (var i = 0; i < 20; ++i) {
                new ENTITY.Blood(this.x + this.width / 2, this.y + this.height / 2, this.scene);
            }
        }
    }
});

declareClass(ENTITY, 'PhysicalObject', 'Person', {
    init: function (x, y, scene, textures, category, lifeTime) {
        this._super(x, y, new PIXI.Sprite(textures[0]), scene, category, lifeTime);
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
    },
    tick: function () {
        this._super();
        this.runs = ((this.vx != 0) && (this.canRun != false));
        if ((this.runs) &&
            (((this.vx > 0) && !this.looksRight()) ||
            ((this.vx < 0) && this.looksRight()))) {
            this.flip();
        }
        if (this.runs && this.onGround) {
            ++this.time;
        } else if (this.sid != 7) {
            this.sid = 3;
        }
        if (this.time > this.dt) {
            ++this.sid;
            if (this.sid > 7)
                this.sid = 0;
            this.time = 0;
        }
        this.sprite.texture = this.textures[this.sid];

        if (this.health < this.maxHealth)
            this.health += this.healthRegeneration;
        if (this.health > this.maxHealth)
            this.health = this.maxHealth;
        if (this.energy < this.maxEnergy)
            this.energy += this.energyRegeneration;
        if (this.energy > this.maxEnergy)
            this.energy = this.maxEnergy;

        for (var i = 0; i < this.effects.length; ++i) {
            if (this.effects[i].removed)
                this.effects.splice(i--, 1);
        }
    }
});

declareClass(ENTITY, 'Object', 'Skill', {
    init: function (entity, effect, cooldown, cost) {
        this._super(ENTITY.CATEGORIES.SKILL, -1);
        this.entity = entity;
        this.effect = effect;
        this.cooldown = cooldown;
        this.cost = cost;
        this.timer = 0;
    },
    tick: function () {
        if (this.entity.removed)
            this.removed = true;
        if (this.timer > 0)
            --this.timer;
    },
    cast: function () {
        if ((this.timer <= 0) && (this.entity.energy >= this.cost)) {
            if (!(new this.effect(this.entity).removed)) {
                this.timer = this.cooldown;
                this.entity.energy -= this.cost;
            }
        }
    }
});

ENTITY.WEAPONS = {};
declareClass(ENTITY.WEAPONS, ENTITY.Skill, 'Knife', {
    init: function (scene, e, category, damage) {
        this._super(e, ENTITY.BULLETS.Blade, 30, 0);
        this.name = "knife";
        this.scene = scene;
        this.category = category;
        this.damage = damage;
    },
    hit: function () {
        if (this.timer <= 0) {
            if (!(new this.effect(this.scene, this.damage, this.entity, this.category).removed)) {
                this.timer = this.cooldown;
            }
        }
    }
});

// make abstract weapon class
declareClass(ENTITY.WEAPONS, ENTITY.PhysicalObject, 'Gun', {
    init: function (scene, e, category, damage, x, y) {
        this._super(0, 0, new PIXI.Sprite(PIXI.Texture.fromFrame('gun.png')), scene, category, -1);
        this.group = ENTITY.GROUP.NONE;
        this.name = "gun";
        this.damage = damage;
        this.timer = 0;
        this.cooldown = 30;
        if (e != null) {
            this.entity = e;
            this.x = e.x + e.width / 2 + (e.looksRight() ? 0 : -this.width);
            this.y = e.y + e.height / 2 - 4;
            if (this.looksRight() != e.looksRight())
                this.flip();
        } else if (x != undefined && y != undefined) {
            this.x = x;
            this.y = y;
        }
    },
    hit: function () {
        if (this.timer <= 0) {
            new ENTITY.Bullet(this.x + (this.looksRight() ? 7 : -7), this.y + 4, this.looksRight() ? 11 : -11, 0, this.scene, ENTITY.CATEGORIES.PLAYERBULLET);
            this.timer = this.cooldown;
        }
    },
    tick: function () {
        if (this.entity != null) {
            //ENTITY.SpriteObject.tick.call(this);
            var e = this.entity;
            this.x = e.x + e.width / 2 + (e.looksRight() ? 0 : -this.width);
            this.y = e.y + e.height / 2 - 4;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            if (this.looksRight() != e.looksRight())
                this.flip();
        } else {
            this._super();
            if (WORLD.player.weapon == null && WORLD.areCollide(this, WORLD.player)) {
                this.entity = WORLD.player;
                WORLD.player.weapon = this;
            }
        }
        if (this.timer > 0)
            --this.timer;
    }
});

declareClass(ENTITY.WEAPONS, ENTITY.PhysicalObject, 'ShotGun', {
    init: function (scene, e, category, damage, x, y) {
        this._super(0, 0, new PIXI.Sprite(PIXI.Texture.fromFrame('shotgun.png')), scene, category, -1);
        this.group = ENTITY.GROUP.NONE;
        this.name = "shotgun";
        this.damage = damage;
        this.timer = 0;
        this.cooldown = 30;
        this.bulletSpeed = 9.0;
        this.maxDeviation = 4.0;
        if (e != null) {
            this.entity = e;
            this.x = e.x + e.width / 2 + (e.looksRight() ? 0 : -this.width);
            this.y = e.y + e.height / 2 - 4;
            if (this.looksRight() != e.looksRight())
                this.flip();
        } else if (x != undefined && y != undefined) {
            this.x = x;
            this.y = y;
        }
    },
    hit: function () {
        if (this.timer <= 0) {
            new ENTITY.ShotgunBullet(this.x + (this.looksRight() ? 7 : -7), this.y + 4, this.looksRight() ? this.bulletSpeed : -this.bulletSpeed, Math.random() * this.maxDeviation - this.maxDeviation / 2, this.scene, ENTITY.CATEGORIES.PLAYERBULLET);
            new ENTITY.ShotgunBullet(this.x + (this.looksRight() ? 7 : -7), this.y + 4, this.looksRight() ? this.bulletSpeed : -this.bulletSpeed, Math.random() * this.maxDeviation - this.maxDeviation / 2, this.scene, ENTITY.CATEGORIES.PLAYERBULLET);
            new ENTITY.ShotgunBullet(this.x + (this.looksRight() ? 7 : -7), this.y + 4, this.looksRight() ? this.bulletSpeed : -this.bulletSpeed, Math.random() * this.maxDeviation - this.maxDeviation / 2, this.scene, ENTITY.CATEGORIES.PLAYERBULLET);
            this.timer = this.cooldown;
        }
    },
    tick: function () {
        if (this.entity != null) {
            //ENTITY.SpriteObject.tick.call(this);
            var e = this.entity;
            this.x = e.x + e.width / 2 + (e.looksRight() ? 0 : -this.width);
            this.y = e.y + e.height / 2 - 4;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            if (this.looksRight() != e.looksRight())
                this.flip();
        } else {
            this._super();
            if (WORLD.player.weapon == null && WORLD.areCollide(this, WORLD.player)) {
                this.entity = WORLD.player;
                WORLD.player.weapon = this;
            }
        }
        if (this.timer > 0)
            --this.timer;
    }
});

ENTITY.EFFECTS = {};
declareClass(ENTITY.EFFECTS, ENTITY.Object, 'Dash', {
    init: function (e) {
        this._super(ENTITY.CATEGORIES.EFFECT, 5);
        this.name = "dash";
        if (e.canRun) {
            this.entity = e;
            this.entity.canRun = false;
            this.entity.vx = (this.entity.looksRight() ? 1 : -1) * 9;
            this.entity.effects.push(this);
        } else {
            this.removed = true;
        }
    },
    tick: function () {
        this._super();
        this.canRun = false;
        if (this.removed) {
            this.entity.canRun = true;
        }
    }
});

declareClass(ENTITY.EFFECTS, ENTITY.Object, 'Slow', {
    init: function (e) {
        this._super(ENTITY.CATEGORIES.EFFECT, 60 * 3);
        this.name = "slow";
        this.entity = e;
        this.entity.speed /= 2;
        this.entity.jumpSpeed /= 2;
        this.entity.effects.push(this);
    },
    tick: function () {
        this._super();
        if (this.removed) {
            this.entity.speed *= 2;
            this.entity.jumpSpeed *= 2;
        }
    }
});

declareClass(ENTITY.EFFECTS, ENTITY.Object, 'KnockBack', {
    init: function (e, s) {
        this._super(ENTITY.CATEGORIES.EFFECT, 15);
        this.name = "knockback";
        this.entity = e;
        this.entity.canRun = false;
        this.entity.vx = (s.looksRight() ? 1 : -1) * 3;
        this.entity.vy -= 3;
        this.entity.effects.push(this);
    },
    tick: function () {
        this._super();
        if (this.removed) {
            this.entity.canRun = true;
        }
    }
});

declareClass(ENTITY, 'Person', 'Player', {
    init: function (x, y, scene) {
        var textures = [];
        for (var i = 1; i <= 8; ++i) {
            textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
        }
        this.animation = new ENTITY.Animation(4, true, textures, this);
        this._super(x, y, scene, textures, ENTITY.CATEGORIES.PLAYER, -1);
        this.name = "player";
        WORLD.player = this;
        //this.weapon = new ENTITY.WEAPONS.Knife(scene, this, ENTITY.CATEGORIES.PLAYERBULLET, 10);
        //this.weapon = new ENTITY.WEAPONS.Gun(scene, this, ENTITY.CATEGORIES.PLAYERBULLET, 10);
        this.weapon = new ENTITY.WEAPONS.ShotGun(scene, this, ENTITY.CATEGORIES.PLAYERBULLET, 10);
        this.dash = new ENTITY.Skill(this, ENTITY.EFFECTS.Dash, 30, 30);
        this.group |= ENTITY.GROUP.A;
    },
    tick: function () {
        this._super();
        this.animation.tick();
        this.down = (INPUT.down[KEYS.DOWN] ? this.onGround : false);
        if (this.canRun) {
            if (INPUT.down[KEYS.RIGHT]) {
                this.runs = true;
                this.vx = this.speed;
            } else if (INPUT.down[KEYS.LEFT]) {
                this.runs = true;
                this.vx = -this.speed;
            } else {
                this.vx = 0;
                this.runs = false;
            }
            if (this.onGround) {
                if (INPUT.down[KEYS.UP])
                    this.vy = -this.jumpSpeed;
            }
        }
        if (INPUT.down[KEYS.Z]) {
            this.dash.cast();
        }
        if (INPUT.down[KEYS.C]) {
            if (this.weapon != null) {
                this.weapon.vx = this.looksRight() ? 5.0 : -5.0;
                this.weapon.vy = -2.0;
                this.weapon.entity = null;
                this.weapon = null;
            }
        }
        if (INPUT.down[KEYS.DOWN] && this.onGround && this.canRun) {
            if (this.height == 40) {
                this.y += 20;
                this.sprite.y += 20;
            }
            this.height = 20;
            this.sprite.height = 20;
            this.down = true;
        } else {
            if (WORLD.isFree(0, -20, {x: this.x, y: this.y, width: this.width, height: this.height})) {
                if (this.height == 20) {
                    this.y -= 20;
                    this.sprite.y -= 20;
                }
                this.height = 40;
                this.sprite.height = 40;
                this.down = false;
            }
        }
        if (INPUT.down[KEYS.X])
            if (this.weapon != null)
                this.weapon.hit();

        INTERFACE.setHealth(this.health, this.maxHealth);
        INTERFACE.setEnergy(this.energy, this.maxEnergy);
    },
    back: function () {
        this._super();
        this.animation.back();
    }
});

ENTITY.AI = {};
ENTITY.AI.isFloor = function(e) {
    var x = e.x + (e.vx > 0 ? e.width : - 1);
    var y = e.y + e.height;
    var p = {x: x, y: y, width: 1, height: 1, category: ENTITY.CATEGORIES.NONE};
    return !WORLD.isFree(0, 0, p);
};

declareClass(ENTITY, 'Person', 'Guard', {
    init: function(x, y, scene) {
        this.name = "guard";
        var textures = [];
        for(var i = 1; i <= 8; ++i) {
            textures.push(PIXI.Texture.fromFrame('character' + i + '.png'));
        }
        this._super(x, y, scene, textures, ENTITY.CATEGORIES.ENEMY, -1);
        this.weapon = new ENTITY.WEAPONS.Knife(scene, this, ENTITY.CATEGORIES.ENEMYBULLET, 10);
        this.maxHealth = 15;
    },
    tick: function() {
        this._super();
        if(this.canRun && this.onGround && !ENTITY.AI.isFloor(this))
            this.vx = -this.vx;

        if(this.health <= 0) {
            this.removed = true;
            for(var i = 0; i < 40; ++i) {
                new ENTITY.Blood(this.x + this.width / 2, this.y + this.height / 2, gameScene);
            }
        }
    },
    hitWall: function(xa, ya) {
        if (xa != 0 && this.canRun) {
            this.vx = -this.vx;
        } else {
            this._super(xa, ya);
        }
    }
});

declareClass(ENTITY, 'Person', 'Slime', {
    init: function (x, y, scene) {
        var textures = [];
        for (var i = 1; i <= 3; ++i) {
            textures.push(PIXI.Texture.fromFrame('slime' + i + '.png'));
        }
        this.animation = new ENTITY.Animation(8, true, textures, this);
        this._super(x, y, scene, textures, ENTITY.CATEGORIES.ENEMY, -1);
        this.name = "slime";
        this.jumpTimer = 0;
        this.damageTimer = 0;
        this.jumpCooldown = 60;
        this.damageCooldown = 30;
        this.jumpSpeed = 10;
    },
    tick: function () {
        this._super();
        this.animation.tick();
        this.width = this.sprite.width;
        this.y += (this.height - this.sprite.height);
        this.sprite.y = this.y;
        this.height = this.sprite.height;

        if (this.jumpTimer < this.jumpCooldown)
            ++this.jumpTimer;
        if (this.damageTimer < this.damageCooldown)
            ++this.damageTimer;

        if (this.canRun) {
            if (this.onGround) {
                this.vx *= 0.9;
                if (this.jumpTimer >= this.jumpCooldown)
                    if (Math.random() > 0.9) {
                        this.vx += Math.random() * 3 * Math.sign(WORLD.player.x - this.x);
                        this.vy = -this.jumpSpeed * (0.5 + 0.5 * Math.random());
                        this.jumpTimer = 0;
                    }
            }
        }
        if (this.damageTimer >= this.damageCooldown)
            if (WORLD.areCollide(this, WORLD.player)) {
                new ENTITY.DamageBox(this.x, this.y, this.scene, this.width, this.height, ENTITY.CATEGORIES.ENEMYBULLET, 1, 20);
                this.damageTimer = 0;
            }

        if (this.health <= 0) {
            this.removed = true;
            for (var i = 0; i < 40; ++i) {
                new ENTITY.Blood(this.x + this.width / 2, this.y + this.height / 2, gameScene);
            }
        }
    },
    back: function () {
        this._super();
        this.animation.back();
    }
});



declareClass(ENTITY, 'PhysicalObject', 'Blood', {
    init: function(x, y, scene) {
        this._super(x, y, new PIXI.Sprite(PIXI.Texture.fromFrame('blood.png')), scene, ENTITY.CATEGORIES.NONE, 60 * 3);
        this.name = "blood";
        this.vx = Math.random() * 10 - 5;
        this.vy = Math.random() * 10 - 5;
        this.bounce = 0.5;
    }
});

declareClass(ENTITY, 'PhysicalObject', 'Bullet', {
    init: function (x1, y1, bxa, bya, scene, category) {
        this._super(x1, y1, new PIXI.Sprite(PIXI.Texture.fromFrame('bullet.png')), scene, category, 600);
        this.name = "bullet";
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
    },
    hitWall: function (xa, ya) {
        this.removed = true;
    },
    collide: function (e) {
        this.removed = true;
        e.health -= 50;
    }
});

declareClass(ENTITY, 'PhysicalObject', 'ShotgunBullet', {
    init: function (x1, y1, bxa, bya, scene, category) {
        this._super(x1, y1, new PIXI.Sprite(PIXI.Texture.fromFrame('shotgunbullet.png')), scene, category, 600);
        this.name = "shotgunbullet";
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        this.vx = bxa;
        this.vy = bya;
        this.gravity = false;
    },
    hitWall: function (xa, ya) {
        this.removed = true;
    },
    collide: function (e) {
        this.removed = true;
        new ENTITY.EFFECTS.Slow(e);
        new ENTITY.EFFECTS.KnockBack(e, this);
        e.health -= 5;
    }
});

ENTITY.CATEGORIES = {NONE: 0, PLAYER: 1, ENEMY: 2, PLAYERBULLET: 3, ENEMYBULLET: 4, SKILL: 5, EFFECT: 6, WEAPON: 7};




