var INTERFACE = {};

INTERFACE.healthBar = {};
INTERFACE.border = 10;
INTERFACE.lineWidth = 2;

INTERFACE.setup = function(stage) {
    INTERFACE.healthBar = new PIXI.Graphics();
    INTERFACE.healthBar.maxValue = 100;
    INTERFACE.healthBar.position.x = WIDTH - INTERFACE.healthBar.maxValue * SCALE - INTERFACE.border * SCALE;
    INTERFACE.healthBar.position.y = INTERFACE.border * SCALE;
    stage.addChild(INTERFACE.healthBar);
    INTERFACE.setHealth(10);
};

INTERFACE.setHealth = function(health) {
    INTERFACE.healthBar.clear();
    INTERFACE.healthBar.lineStyle(INTERFACE.lineWidth, 0x000000, 1);
    INTERFACE.healthBar.beginFill(0xFF0000, 1);
    INTERFACE.healthBar.drawRect(0, 0, health * SCALE, 10);
};