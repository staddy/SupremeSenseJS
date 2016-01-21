var INTERFACE = {};

INTERFACE.healthBar = {};
INTERFACE.border = 10;
INTERFACE.lineWidth = 2;
INTERFACE.onTell = false;
INTERFACE.frameAnimationTick = 0;
INTERFACE.frameAnimationTicks = 30;
INTERFACE.frameHeight = 120;
INTERFACE.upFrame = null;
INTERFACE.downFrame = null;
INTERFACE.phrases = [];
INTERFACE.phrase = null;
INTERFACE.skip = true;
INTERFACE.textStyle = null;
INTERFACE.text = null;

INTERFACE.setup = function(stage) {
    INTERFACE.textStyle = {
        font : '32px Fixedsys'
        //align : 'right'
    };

    INTERFACE.upFrame = new PIXI.Graphics();
    INTERFACE.upFrame.beginFill(0x000000, 1);
    INTERFACE.upFrame.drawRect(0, 0, WIDTH, INTERFACE.frameHeight);
    INTERFACE.upFrame.y = -INTERFACE.frameHeight;
    stage.addChild(INTERFACE.upFrame);

    INTERFACE.downFrame = new PIXI.Graphics();
    INTERFACE.downFrame.beginFill(0x000000, 1);
    INTERFACE.downFrame.drawRect(0, 0, WIDTH, INTERFACE.frameHeight);
    INTERFACE.downFrame.y = HEIGHT;
    stage.addChild(INTERFACE.downFrame);

    INTERFACE.interfaceStage = new PIXI.Container();
    INTERFACE.healthBar = new PIXI.Graphics();
    INTERFACE.healthBar.maxValue = 100;
    INTERFACE.healthBar.position.x = WIDTH - INTERFACE.healthBar.maxValue * SCALE - INTERFACE.border * SCALE;
    INTERFACE.healthBar.position.y = INTERFACE.border * SCALE;
    INTERFACE.interfaceStage.addChild(INTERFACE.healthBar);
    stage.addChild(INTERFACE.interfaceStage);
    INTERFACE.setHealth(10);
};

INTERFACE.setHealth = function(health) {
    INTERFACE.healthBar.clear();
    INTERFACE.healthBar.lineStyle(INTERFACE.lineWidth, 0x000000, 1);
    INTERFACE.healthBar.beginFill(0xFF0000, 1);
    INTERFACE.healthBar.drawRect(0, 0, health * SCALE, 10);
};

INTERFACE.tell = function() {
    INTERFACE.interfaceStage.visible = false;
    INTERFACE.frameAnimationTick = INTERFACE.frameAnimationTicks;
    state = INTERFACE.telling;
};

INTERFACE.telling = function() {
    if(INTERFACE.frameAnimationTick != 0) {
        INTERFACE.upFrame.y += INTERFACE.upFrame.height / INTERFACE.frameAnimationTicks;
        INTERFACE.downFrame.y -= INTERFACE.downFrame.height / INTERFACE.frameAnimationTicks;
        var dy = HEIGHT / 2 - WORLD.player.y;
        gameScene.y += (Math.abs(dy) > INTERFACE.frameHeight ? Math.sign(dy) * INTERFACE.frameHeight : dy) / INTERFACE.frameAnimationTicks;
        --INTERFACE.frameAnimationTick;
        return;
    }
    if((INTERFACE.phrase != null) && (INTERFACE.text != null) && (INTERFACE.text.length != 0)) {
        if(!INTERFACE.skip) {
            INTERFACE.phrase.text += INTERFACE.text.charAt(0);
            INTERFACE.text = INTERFACE.text.substring(1, INTERFACE.text.length);
        } else {
            INTERFACE.phrase.text += INTERFACE.text;
            INTERFACE.text = null;
            INTERFACE.skip = false;
        }
    }
    if(INTERFACE.skip) {
        if(INTERFACE.phrase != null)
            stage.removeChild(INTERFACE.phrase);
        if(INTERFACE.phrases.length != 0) {
            INTERFACE.text = INTERFACE.phrases.pop();
            INTERFACE.phrase = new PIXI.BitmapText('', INTERFACE.textStyle);
            INTERFACE.phrase.x = 10;
            INTERFACE.phrase.y = HEIGHT - INTERFACE.frameHeight + 10;

            stage.addChild(INTERFACE.phrase);
            INTERFACE.skip = false;
        } else {
            INTERFACE.upFrame.y = -INTERFACE.upFrame.height;
            INTERFACE.downFrame.y = HEIGHT;
            INTERFACE.interfaceStage.visible = true;
            INTERFACE.skip = true;
            gameScene.y = 0;
            state = play;
        }
    }
};