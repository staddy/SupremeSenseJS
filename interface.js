var INTERFACE = {};

INTERFACE.healthBar = {};
INTERFACE.energyBar = {};
INTERFACE.border = 10;
INTERFACE.lineWidth = 2;
INTERFACE.onTell = false;
INTERFACE.frameAnimationTick = 0;
INTERFACE.frameAnimationTicks = 30;
INTERFACE.frameHeight = 120;
INTERFACE.healthBarPosition = 100;
INTERFACE.upFrame = null;
INTERFACE.downFrame = null;
INTERFACE.phrases = [];
INTERFACE.phrase = null;
INTERFACE.skip = true;
INTERFACE.textStyle = null;
INTERFACE.text = null;

INTERFACE.portrait = null;
INTERFACE.right = undefined;

INTERFACE.selection = null;
INTERFACE.selected = null;

INTERFACE.EVENTS = {PHRASE: undefined, PORTRAIT: 0};
INTERFACE.event = function(object, category, right) {
    this.object = object;
    this.category = category;
    this.right = right;
};
INTERFACE.push = function(object, category, right) {
    INTERFACE.phrases.push(new INTERFACE.event(object, category, right));
};

INTERFACE.select = function(e) {
    INTERFACE.removeSelection();
    INTERFACE.selected = e;
    var s = new PIXI.Graphics();
    s.lineStyle(SCALE, 0xFFFF00);
    s.drawRect(0, 0, e.width, e.height);
    e.selection = s;
    INTERFACE.selection = s;
    INTERFACE.interfaceStage.addChild(s);
    s.x = e.x;
    s.y = e.y;
};

INTERFACE.removeSelection = function() {
    if(INTERFACE.selected != null) {
        INTERFACE.selected.selection = null;
        INTERFACE.interfaceStage.removeChild(INTERFACE.selection);
    }
    INTERFACE.selected = null;
    INTERFACE.selection = null;
};

INTERFACE.setup = function() {
    INTERFACE.textStyle = {
        font : '32px Fixedsys'
        //align : 'right'
    };

    var blackRect = new PIXI.Graphics();
    blackRect.beginFill(0x000000, 1);
    blackRect.drawRect(0, 0, WIDTH, INTERFACE.frameHeight);

    INTERFACE.upFrame = new PIXI.Container();
    INTERFACE.upFrame.addChild(blackRect);
    INTERFACE.upFrame.y = -INTERFACE.frameHeight;
    gameScene.addChild(INTERFACE.upFrame);

    INTERFACE.downFrame = new PIXI.Container();
    INTERFACE.downFrame.addChild(blackRect);
    INTERFACE.downFrame.y = HEIGHT;
    gameScene.addChild(INTERFACE.downFrame);

    INTERFACE.interfaceStage = new PIXI.Container();

    INTERFACE.healthBar = new PIXI.Graphics();
    INTERFACE.healthBar.maxValue = 0;
    INTERFACE.healthBar.value = 0;
    INTERFACE.healthBar.position.x = WIDTH - INTERFACE.healthBarPosition * SCALE - INTERFACE.border * SCALE;
    INTERFACE.healthBar.position.y = INTERFACE.border * SCALE;
    INTERFACE.interfaceStage.addChild(INTERFACE.healthBar);

    INTERFACE.energyBar = new PIXI.Graphics();
    INTERFACE.energyBar.maxValue = 0;
    INTERFACE.energyBar.value = 0;
    INTERFACE.energyBar.position.x = WIDTH - INTERFACE.healthBarPosition * SCALE - INTERFACE.border * SCALE;
    INTERFACE.energyBar.position.y = INTERFACE.border * SCALE + 10 + 5;
    INTERFACE.interfaceStage.addChild(INTERFACE.energyBar);

    gameScene.addChild(INTERFACE.interfaceStage);
};

INTERFACE.setHealth = function(value, maxValue) {
    if((value != INTERFACE.healthBar.value) || (maxValue != INTERFACE.healthBar.maxValue)) {
        INTERFACE.healthBar.maxValue = maxValue;
        INTERFACE.healthBar.value = value;
        INTERFACE.healthBar.clear();
        INTERFACE.healthBar.beginFill(Math.round(0xDD * (1 - value / maxValue)) * 0x10000 + Math.round(0xDD * (value / maxValue)) * 0x100 + 0x33, 1);
        INTERFACE.healthBar.drawRect(0, 0, INTERFACE.healthBar.value * SCALE, 10);
        INTERFACE.healthBar.lineStyle(INTERFACE.lineWidth, 0x000000, 1);
        INTERFACE.healthBar.beginFill(0x000000, 0);
        INTERFACE.healthBar.drawRect(0, 0, INTERFACE.healthBar.maxValue * SCALE, 10);
    }
};

INTERFACE.setEnergy = function(value, maxValue) {
    if((value != INTERFACE.energyBar.value) || (maxValue != INTERFACE.energyBar.maxValue)) {
        INTERFACE.energyBar.maxValue = maxValue;
        INTERFACE.energyBar.value = value;
        INTERFACE.energyBar.clear();
        INTERFACE.energyBar.beginFill(0x0000FF, 1);
        INTERFACE.energyBar.drawRect(0, 0, INTERFACE.energyBar.value * SCALE, 10);
        INTERFACE.energyBar.lineStyle(INTERFACE.lineWidth, 0x000000, 1);
        INTERFACE.energyBar.beginFill(0x000000, 0);
        INTERFACE.energyBar.drawRect(0, 0, INTERFACE.energyBar.maxValue * SCALE, 10);
    }
};

INTERFACE.tell = function() {
    INTERFACE.interfaceStage.visible = false;
    INTERFACE.frameAnimationTick = INTERFACE.frameAnimationTicks;

    state = INTERFACE.telling;
};

INTERFACE.telling = function() {
    if(INTERFACE.frameAnimationTick != 0) {
        var dy = HEIGHT / 2 - WORLD.player.y;
        var d = (Math.abs(dy) > INTERFACE.frameHeight ? Math.sign(dy) * INTERFACE.frameHeight : dy) / INTERFACE.frameAnimationTicks;
        INTERFACE.upFrame.y += (INTERFACE.frameHeight / INTERFACE.frameAnimationTicks - d);
        INTERFACE.downFrame.y -= (INTERFACE.frameHeight / INTERFACE.frameAnimationTicks + d);

        gameScene.y += d;
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
        if(INTERFACE.phrase != null) {
            INTERFACE.downFrame.removeChild(INTERFACE.phrase);
        } if(INTERFACE.phrases.length != 0) {
            var current = INTERFACE.phrases.shift();
            switch(current.category) {
            case INTERFACE.EVENTS.PHRASE:
                INTERFACE.text = current.object;
                INTERFACE.phrase = new PIXI.BitmapText('', INTERFACE.textStyle);
                INTERFACE.phrase.x = INTERFACE.border + (INTERFACE.portrait && (INTERFACE.right === undefined) ? INTERFACE.portrait.width + INTERFACE.border : 0);
                INTERFACE.phrase.y = INTERFACE.border;

                INTERFACE.downFrame.addChild(INTERFACE.phrase);
                INTERFACE.skip = false;
                break;
            case INTERFACE.EVENTS.PORTRAIT:
                if(INTERFACE.portrait) {
                    INTERFACE.downFrame.removeChild(INTERFACE.portrait);
                    if(INTERFACE.right) {
                        INTERFACE.portrait.scale.x = -INTERFACE.portrait.scale.x;
                        INTERFACE.portrait.anchor.x = 0;
                    }
                }
                INTERFACE.portrait = current.object;
                INTERFACE.right = current.right;
                INTERFACE.portrait.x = (INTERFACE.right === undefined ? INTERFACE.border : WIDTH - INTERFACE.portrait.width - INTERFACE.border);
                INTERFACE.portrait.y = INTERFACE.border;
                if(INTERFACE.right) {
                    INTERFACE.portrait.scale.x = -INTERFACE.portrait.scale.x;
                    INTERFACE.portrait.anchor.x = 1;
                }
                INTERFACE.downFrame.addChild(INTERFACE.portrait);
                INTERFACE.skip = true;
                break;
            }
        } else {
            INTERFACE.upFrame.y = -INTERFACE.frameHeight;
            INTERFACE.downFrame.y = HEIGHT;
            INTERFACE.interfaceStage.visible = true;
            INTERFACE.skip = true;
            gameScene.y = 0;
            if(INTERFACE.portrait) {
                INTERFACE.downFrame.removeChild(INTERFACE.portrait);
                if(INTERFACE.right) {
                    INTERFACE.portrait.scale.x = -INTERFACE.portrait.scale.x;
                    INTERFACE.portrait.anchor.x = 0;
                }
                INTERFACE.portrait = null;
            }
            state = play;
        }
    }
};