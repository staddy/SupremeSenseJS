var WORLD = {};

WORLD.entities = [];
WORLD.player = {};
WORLD.backgroundName = null;
WORLD.cellSize = 100;

WORLD.Level = function(blocks, objects, spawn, background, gravity, maxSpeed) {
    this.blocks = blocks;
    this.objects = objects;
    this.spawn = spawn || {x: 0, y: 0};
    this.background = background || 'background.png';
    this.gravity = gravity || 0.45;
    this.maxSpeed = maxSpeed || 10;
};

WORLD.dumpLevel = function() {
    return new WORLD.Level(WORLD.blocks, WORLD.dumpObjects(), {x: WORLD.player.x, y: WORLD.player.y}, WORLD.backgroundName, WORLD.GRAVITY, WORLD.MAXSPEED);
};

WORLD.loadLevel = function(level) {
    gameScene.removeChildren();

    WORLD.entities = [];
    WORLD.player = {};
    WORLD.backgroundName = null;

    WORLD.blocks = level.blocks;
    WORLD.setBackground(level.background);
    WORLD.GRAVITY = level.gravity;
    WORLD.MAXSPEED = level.maxSpeed;
    WORLD.createBlocksSprites();
    WORLD.loadObjects(level.objects);
    WORLD.player = new ENTITY.Player(level.spawn.x, level.spawn.y, gameScene);
};

WORLD.dumpObjects = function() {
    var objects = [];
    WORLD.entities.forEach(
        function(e) {
            if(e.name) {
                switch (e.name) {
                case 'guard':
                    objects.push({name: e.name, x: e.x, y: e.y, properties: []});
                    break;
                }
            }
        }
    );
    return objects;
};

WORLD.loadObjects = function(objects) {
    objects.forEach(
        function(o) {
            var e;
            switch(o.name) {
            case 'guard':
                e = new ENTITY.Guard(o.x, o.y, gameScene);
                break;
            }
            o.properties.forEach(
                function(p, v) {
                    e[p] = v;
                }
            );
        }
    );
};

WORLD.setBackground = function(b) {
    // Background
    gameScene.removeChild(WORLD.background);
    WORLD.backgroundName = b;
    WORLD.background = new PIXI.Sprite(PIXI.Texture.fromFrame(b));
    WORLD.background.scale.x = WORLD.background.scale.y = SCALE;
    gameScene.addChild(WORLD.background);
};

WORLD.initTextures = function() {
    WORLD.textures = [
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('wall.png')],
        [PIXI.Texture.fromFrame('dirt1.png'), PIXI.Texture.fromFrame('dirt2.png'), PIXI.Texture.fromFrame('dirt3.png'), PIXI.Texture.fromFrame('dirt4.png'), PIXI.Texture.fromFrame('dirt5.png'), PIXI.Texture.fromFrame('dirt6.png'), PIXI.Texture.fromFrame('dirt7.png'), PIXI.Texture.fromFrame('dirt8.png'), PIXI.Texture.fromFrame('dirt9.png'), PIXI.Texture.fromFrame('dirt10.png'), PIXI.Texture.fromFrame('dirt11.png'), PIXI.Texture.fromFrame('dirt12.png')],
        [PIXI.Texture.fromFrame('grass.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('black.png')],
        [PIXI.Texture.fromFrame('step.png')],
        [PIXI.Texture.fromFrame('up1.png'), PIXI.Texture.fromFrame('up2.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('null.png')],
        [PIXI.Texture.fromFrame('turret1.png'), PIXI.Texture.fromFrame('turret2.png'), PIXI.Texture.fromFrame('turret3.png')],
        [PIXI.Texture.fromFrame('insects1.png'), PIXI.Texture.fromFrame('insects2.png'), PIXI.Texture.fromFrame('insects3.png'), PIXI.Texture.fromFrame('insects4.png'), PIXI.Texture.fromFrame('insects5.png')]
    ];
};

WORLD.init = function() {
    WORLD.WIDTH = WIDTH;
    WORLD.HEIGHT = HEIGHT;
    WORLD.TILE = 10 * SCALE;
    WORLD.X = WORLD.WIDTH / WORLD.TILE;
    WORLD.Y = WORLD.HEIGHT / WORLD.TILE;
    WORLD.initTextures();
};

WORLD.createBlocksSprites = function() {
    WORLD.sprites = new Array(WORLD.X);
    for(var i = 0; i < WORLD.X; ++i) {
        WORLD.sprites[i] = new Array(WORLD.Y);
        for(var j = 0; j < WORLD.Y; ++j) {
            WORLD.sprites[i][j] = new PIXI.Sprite();
            WORLD.sprites[i][j].x = i * WORLD.TILE;
            WORLD.sprites[i][j].y = j * WORLD.TILE;
            WORLD.sprites[i][j].scale.x = WORLD.sprites[i][j].scale.y = SCALE;
            gameScene.addChild(WORLD.sprites[i][j]);
            WORLD.setBlock(i, j, WORLD.blocks[i][j]);
        }
    }
};

WORLD.setBlock = function(x, y, b) {
    WORLD.blocks[x][y] = b;
    var t = Math.floor(WORLD.textures[b].length * Math.random());
    WORLD.sprites[x][y].texture = WORLD.textures[b][t];
    WORLD.sprites[x][y].visible = (b != 0);
};

WORLD.updateTextures = function() {
    for(var i = 0; i < WORLD.X; ++i) {
        for(var j = 0; j < WORLD.Y; ++j) {
            var b = WORLD.blocks[i][j];
            var t = Math.floor(WORLD.textures[b].length * Math.random());
            WORLD.sprites[i][j].texture = WORLD.textures[b][t];
            WORLD.sprites[i][j].visible = (b != 0);
        }
    }
};

/*
0 - empty
1 - wall
2 - dirt
3 - grass
4 - 20 - reserved
21 - step
22 - stream
23 - 40 - reserved
41 - turret
42 - insects
 */

WORLD.isFree = function(xa, ya, e) {
    var x = e.x + xa;
    var y = e.y + ya;
    var width = e.width;
    var height = e.height;
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
    if(y2 >= WORLD.Y) y2 = WORLD.Y - 1;

    var retVal = true;
    for(var i = x1; i <= x2; ++i) {
        for(var j = y1; j <= y2; ++j) {
            var b = WORLD.blocks[i][j];
            if(((b >= 1) && (b <= 20)) ||
                ((b == 21) && ((e.y + e.height) <= j * WORLD.TILE) && (ya > 0) && ((e.category == ENTITY.CATEGORIES.PLAYER) || (e.category == ENTITY.CATEGORIES.ENEMY)) && (e.down == false))) {
                retVal = false;
            } else if(b == 22) {
                if(e.hasOwnProperty('vy'))
                    e.vy -= WORLD.GRAVITY;
            }
        }
    }


    return retVal;
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
        //A collision might be occurring. Check for a collision on the y axis
        hit = Math.abs(vy) < combinedHalfHeights;
    } else {
        //There's no collision on the x axis
        hit = false;
    }
    //`hit` will be either `true` or `false`
    return hit;
};

var time = 8;
WORLD.tick = function() {
    var i;
    if(time <= 0) {
        for (i = 0; i < WORLD.X; ++i) {
            for (var j = 0; j < WORLD.Y; ++j) {
                var b = WORLD.blocks[i][j];
                    if(Math.random() > 0.3) {
                        var t = WORLD.textures[b].indexOf(WORLD.sprites[i][j].texture);
                        ++t;
                        t %= WORLD.textures[b].length;
                        WORLD.sprites[i][j].texture = WORLD.textures[b][t];
                    }
                //}
            }
        }
        time = 5;
    }
    --time;

    //WORLD.enemyBullets.forEach(
    //    function(b) {
    //        if(WORLD.areCollide(b, WORLD.player)) {
    //            WORLD.player.collide(b);
    //            b.collide(WORLD.player);
    //        }
    //    }
    //);
    //WORLD.playerBullets.forEach(
    //    function(b) {
    //        WORLD.enemies.forEach(
    //            function(e) {
    //                if(WORLD.areCollide(b, e)) {
    //                    e.collide(b);
    //                    b.collide(e);
    //                }
    //            }
    //        )
    //    }
    //);
    for(i = 0; i < WORLD.entities.length; ++i) {
        var e = WORLD.entities[i];
        if(!e.removed)
            e.tick();
        else
            WORLD.remove(e);
    }

    var hash = {};
    for(var e = 0; e < WORLD.entities.length; e++) {
        var entity = WORLD.entities[e];

        // Skip entities that don't check, don't get checked and don't collide
        if(entity.group == ENTITY.GROUP.NONE) {
            continue;
        }

        var checked = {},
            xmin = Math.floor( entity.x/WORLD.cellSize ),
            ymin = Math.floor( entity.y/WORLD.cellSize ),
            xmax = Math.floor( (entity.x+entity.width)/WORLD.cellSize ) + 1,
            ymax = Math.floor( (entity.y+entity.height)/WORLD.cellSize ) + 1;

        for( var x = xmin; x < xmax; x++ ) {
            for( var y = ymin; y < ymax; y++ ) {

                // Current cell is empty - create it and insert!
                if( !hash[x] ) {
                    hash[x] = {};
                    hash[x][y] = [entity];
                }
                else if( !hash[x][y] ) {
                    hash[x][y] = [entity];
                }

                // Check against each entity in this cell, then insert
                else {
                    var cell = hash[x][y];
                    for( var c = 0; c < cell.length; c++ ) {

                        // Intersects and wasn't already checkd?
                        if( (entity.group & cell[c].group) && WORLD.areCollide(entity, cell[c]) && !checked[cell[c].id] ) {
                            checked[cell[c].id] = true;
                            entity.collide(cell[c]);
                            cell[c].collide(entity);
                        }
                    }
                    cell.push(entity);
                }
            } // end for y size
        } // end for x size
    } // end for entities
};

WORLD.back = function() {
    for(i = 0; i < WORLD.entities.length; ++i) {
        var e = WORLD.entities[i];
        if(!e.removed)
            e.back();
        else
            WORLD.remove(e);
    }
};

WORLD.remove = function(e) {
    e.removed = true;
    WORLD.entities.splice(WORLD.entities.indexOf(e), 1);
    if(e.sprite != null) {
        e.sprite.visible = false;
        gameScene.removeChild(e.sprite);
    }
};