var WORLD = {};

WORLD.entities = [];
WORLD.enemies = [];
WORLD.playerBullets = [];
WORLD.enemyBullets = [];
WORLD.player = {};

WORLD.loadLevel = function(scene) {
    WORLD.WIDTH = WIDTH;
    WORLD.HEIGHT = HEIGHT;
    WORLD.TILE = 20;
    WORLD.X = WORLD.WIDTH / WORLD.TILE;
    WORLD.Y = WORLD.HEIGHT / WORLD.TILE;
    WORLD.GRAVITY = 0.45;
    WORLD.MAXSPEED = 10;

    // Background
    WORLD.background = new PIXI.Sprite(PIXI.Texture.fromFrame('background.png'));
    WORLD.background.scale.x = WORLD.background.scale.y = SCALE;
    scene.addChild(WORLD.background);

    WORLD.sprites = new Array(WORLD.X);
    WORLD.textures = [
        [null],
        [PIXI.Texture.fromFrame('wall.png')],
        [PIXI.Texture.fromFrame('dirt1.png'), PIXI.Texture.fromFrame('dirt2.png'), PIXI.Texture.fromFrame('dirt3.png'), PIXI.Texture.fromFrame('dirt4.png'), PIXI.Texture.fromFrame('dirt5.png'), PIXI.Texture.fromFrame('dirt6.png'), PIXI.Texture.fromFrame('dirt7.png'), PIXI.Texture.fromFrame('dirt8.png'), PIXI.Texture.fromFrame('dirt9.png'), PIXI.Texture.fromFrame('dirt10.png'), PIXI.Texture.fromFrame('dirt11.png'), PIXI.Texture.fromFrame('dirt12.png')],
        [PIXI.Texture.fromFrame('grass.png')],
        [PIXI.Texture.fromFrame('step.png')]
    ];

    WORLD.blocks = [[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,4,0,0,4,4,0,0,4,0,0,4,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,4,0,0,4,4,0,0,4,0,0,4,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,0,0,0,4,4,0,0,0,0,0,4,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,2,2],[0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]];
    for(var i = 0; i < WORLD.X; ++i) {
        WORLD.sprites[i] = new Array(WORLD.Y);
        for(var j = 0; j < WORLD.Y; ++j) {
            WORLD.sprites[i][j] = new PIXI.Sprite();
            WORLD.sprites[i][j].x = i * WORLD.TILE;
            WORLD.sprites[i][j].y = j * WORLD.TILE;
            WORLD.sprites[i][j].scale.x = WORLD.sprites[i][j].scale.y = SCALE;
            scene.addChild(WORLD.sprites[i][j]);
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

/*
0 - empty
1 - wall
2 - dirt
3 - grass
4 - step
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

    for(var i = x1; i <= x2; ++i) {
        for(var j = y1; j <= y2; ++j) {
            var b = WORLD.blocks[i][j];
            if(((b >= 1) && (b <= 3)) ||
                ((b == 4) && ((e.y + e.height) <= j * WORLD.TILE) && (ya > 0) && ((e.category == ENTITY.CATEGORIES.PLAYER) || (e.category == ENTITY.CATEGORIES.ENEMY)) && (e.down == false))) {
                return false;
            }
        }
    }


    return true;
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
    /*if(time <= 0) {
        for (var i = 0; i < WORLD.X; ++i) {
            for (var j = 0; j < WORLD.Y; ++j) {
                if(WORLD.blocks[i][j] == 2) {
                    if(Math.random() > 0.3) {
                        var t = WORLD.textures[2].indexOf(WORLD.sprites[i][j].texture);
                        ++t;
                        t %= 12;
                        WORLD.sprites[i][j].texture = WORLD.textures[2][t];
                    }
                }
            }
        }
        time = 5;
    }
    --time;*/

    WORLD.enemyBullets.forEach(
        function(b) {
            if(WORLD.areCollide(b, WORLD.player)) {
                WORLD.player.collide(b);
                b.collide(WORLD.player);
            }
        }
    );
    WORLD.playerBullets.forEach(
        function(b) {
            WORLD.enemies.forEach(
                function(e) {
                    if(WORLD.areCollide(b, e)) {
                        e.collide(b);
                        b.collide(e);
                    }
                }
            )
        }
    );
    for(var i = 0; i < WORLD.entities.length; ++i) {
        var e = WORLD.entities[i];
        if(!e.removed)
            e.tick();
        else {
            WORLD.entities.splice(i--, 1);
            switch(e.category) {
                case ENTITY.CATEGORIES.ENEMY:
                    // todo
                    WORLD.enemies.splice(WORLD.enemies.indexOf(e), 1);
                    break;
                case ENTITY.CATEGORIES.PLAYERBULLET:
                    // todo
                    WORLD.playerBullets.splice(WORLD.playerBullets.indexOf(e), 1);
                    break;
                case ENTITY.CATEGORIES.ENEMYBULLET:
                    //todo
                    WORLD.enemyBullets.splice(WORLD.enemyBullets.indexOf(e), 1);
                    break;
            }
            if(e.sprite != null) {
                e.sprite.visible = false;
                gameScene.removeChild(e.sprite);
            }
        }
    }
};