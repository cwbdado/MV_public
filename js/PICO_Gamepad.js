//=============================================================================
// PICO_Gamepad.js  |  v1.0.0  |  07-05-2026
//=============================================================================

/*:
 * @target MV
 * @plugindesc |v1.0.0| Advanced Gamepad Manager: button mapping, rumble, and axis variables.
 * @author DadoCWB
 * @url https://picopicocs.itch.io/
 *
 * @help 
 * ============================================================================
 * PICO_Gamepad  v1.0.0 (MV Version)
 * ============================================================================
 * This plugin provides full gamepad support for RPG Maker MV:
 * 1. Map physical buttons to native actions (ok, cancel, etc.).
 * 2. Trigger controller vibration (Rumble) via script calls.
 * 3. Mirror analog stick positions to Database Variables (-100 to 100).
 * 4. Smooth analog movement on maps.
 *
 * STANDARD INDICES (Xbox / PlayStation):
 * 0  A / Cross          8  Select / Share
 * 1  B / Circle         9  Start / Options
 * 2  X / Square        10  L3 (Analog Click)
 * 3  Y / Triangle      11  R3 (Analog Click)
 * 4  LB / L1           12  D-Pad Up
 * 5  RB / R1           13  D-Pad Down
 * 6  LT / L2           14  D-Pad Left
 * 7  RT / R2           15  D-Pad Right
 *
 * SCRIPT CALLS:
 * ----------------------------------------------------------------------------
 * PICO.Gamepad.vibrate(intensity, duration)
 * -> Intensity: 0.0 to 1.0 | Duration: milliseconds.
 * Example: PICO.Gamepad.vibrate(0.8, 500);
 *
 * PICO.Gamepad.setDeadzone(value)
 * -> Changes the deadzone (0.01 to 0.99). Default: 0.20.
 *
 * ============================================================================
 *
 * @param --- General Settings ---
 * @text ====================================
 *
 * @param EnableAnalogMove
 * @text Analog Movement
 * @parent --- General Settings ---
 * @type boolean
 * @default true
 * @desc Allows the left stick to move the player on the map.
 *
 * @param Deadzone
 * @text Deadzone
 * @parent --- General Settings ---
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 0.99
 * @default 0.20
 * @desc Inputs below this value are ignored (prevents drift).
 *
 * @param --- Rumble Settings ---
 * @text ------------------------------------
 *
 * @param EnableRumble
 * @text Enable Vibration
 * @parent --- Rumble Settings ---
 * @type boolean
 * @default true
 *
 * @param RumbleOnDamage
 * @text Rumble on Damage
 * @parent --- Rumble Settings ---
 * @type boolean
 * @default true
 * @desc Controller vibrates when an actor takes damage in battle.
 *
 * @param --- Button Mapping ---
 * @text ------------------------------------
 *
 * @param ButtonMappings
 * @text Mapping List
 * @parent --- Button Mapping ---
 * @type struct<ButtonMap>[]
 * @default ["{\"ButtonIndex\":\"0\",\"Label\":\"A / Cross\",\"NativeAction\":\"ok\"}","{\"ButtonIndex\":\"1\",\"Label\":\"B / Circle\",\"NativeAction\":\"cancel\"}","{\"ButtonIndex\":\"2\",\"Label\":\"X / Square\",\"NativeAction\":\"shift\"}","{\"ButtonIndex\":\"3\",\"RLabel\":\"Y / Triangle\",\"NativeAction\":\"menu\"}","{\"ButtonIndex\":\"9\",\"Label\":\"Start / Options\",\"NativeAction\":\"escape\"}","{\"ButtonIndex\":\"12\",\"Label\":\"D-Pad Up\",\"NativeAction\":\"up\"}","{\"ButtonIndex\":\"13\",\"Label\":\"D-Pad Down\",\"NativeAction\":\"down\"}","{\"ButtonIndex\":\"14\",\"Label\":\"D-Pad Left\",\"NativeAction\":\"left\"}","{\"ButtonIndex\":\"15\",\"Label\":\"D-Pad Right\",\"NativeAction\":\"right\"}"]
 *
 * @param --- Axis Variables ---
 * @text ====================================
 * @desc Variables that will receive axis values (-100 to 100).
 *
 * @param AxisLeftXVar
 * @text Variable: Left Stick X
 * @parent --- Axis Variables ---
 * @type variable
 * @default 5
 *
 * @param AxisLeftYVar
 * @text Variable: Left Stick Y
 * @parent --- Axis Variables ---
 * @type variable
 * @default 6
 *
 * @param AxisRightXVar
 * @text Variable: Right Stick X
 * @parent --- Axis Variables ---
 * @type variable
 * @default 7
 *
 * @param AxisRightYVar
 * @text Variable: Right Stick Y
 * @parent --- Axis Variables ---
 * @type variable
 * @default 8
 */

/*~struct~ButtonMap:
 * @param ButtonIndex
 * @text Button Index (0-19)
 * @type number
 * @default 0
 *
 * @param Label
 * @text Label
 * @default Button
 *
 * @param NativeAction
 * @text Native Action
 * @type select
 * @option (None) @value
 * @option ok @option cancel @option shift @option menu @option escape @option pageup @option pagedown @option up @option down @option left @option right
 * @default ok
 */

(function () {
    "use strict";

    var PLUGIN_NAME = "PICO_Gamepad";
    var _params = PluginManager.parameters(PLUGIN_NAME);

    var Config = {
        enableAnalogMove: _params["EnableAnalogMove"] === "true",
        deadzone: parseFloat(_params["Deadzone"]) || 0.20,
        enableRumble: _params["EnableRumble"] === "true",
        rumbleOnDamage: _params["RumbleOnDamage"] === "true",
        axisVars: {
            leftX:  parseInt(_params["AxisLeftXVar"])  || 0,
            leftY:  parseInt(_params["AxisLeftYVar"])  || 0,
            rightX: parseInt(_params["AxisRightXVar"]) || 0,
            rightY: parseInt(_params["AxisRightYVar"]) || 0
        }
    };

    function parseMappings() {
        try {
            var raw = JSON.parse(_params["ButtonMappings"] || "[]");
            var mapper = {};
            raw.forEach(function(s) {
                var item = JSON.parse(s);
                if (item.NativeAction) {
                    mapper[parseInt(item.ButtonIndex)] = item.NativeAction;
                }
            });
            return mapper;
        } catch (e) { return {}; }
    }
    
    Input.gamepadMapper = parseMappings();

    var GamepadManager = {
        _activeIndex: 0,

        getActive: function() {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            return gamepads[this._activeIndex] || null;
        },

        getAxis: function(index) {
            var gp = this.getActive();
            if (!gp || gp.axes[index] === undefined) return 0;
            var val = gp.axes[index];
            return Math.abs(val) < Config.deadzone ? 0 : val;
        },

        vibrate: function(intensity, duration) {
            if (!Config.enableRumble) return;
            var gp = this.getActive();
            if (!gp || !gp.vibrationActuator) return;
            
            var i = intensity || 0.7;
            var d = duration || 300;

            try {
                if (gp.vibrationActuator.type === "dual-rumble") {
                    gp.vibrationActuator.playEffect("dual-rumble", {
                        startDelay: 0, duration: d,
                        weakMagnitude: i * 0.5, strongMagnitude: i
                    });
                } else {
                    gp.vibrationActuator.pulse(i, d);
                }
            } catch (e) { }
        },

        updateVariables: function() {
            if (!$gameVariables) return;
            var v = Config.axisVars;
            if (v.leftX > 0)  $gameVariables.setValue(v.leftX,  Math.round(this.getAxis(0) * 100));
            if (v.leftY > 0)  $gameVariables.setValue(v.leftY,  Math.round(this.getAxis(1) * 100));
            if (v.rightX > 0) $gameVariables.setValue(v.rightX, Math.round(this.getAxis(2) * 100));
            if (v.rightY > 0) $gameVariables.setValue(v.rightY, Math.round(this.getAxis(3) * 100));
        }
    };

    var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if (Config.enableAnalogMove && !this.isMoving() && this.canMove()) {
            var ax = GamepadManager.getAxis(0);
            var ay = GamepadManager.getAxis(1);
            var threshold = 0.5;

            if (Math.abs(ax) > threshold || Math.abs(ay) > threshold) {
                var direction = 0;
                if (Math.abs(ay) > Math.abs(ax)) {
                    direction = ay > 0 ? 2 : 8;
                } else {
                    direction = ax > 0 ? 6 : 4;
                }
                this.moveStraight(direction);
                return;
            }
        }
        _Game_Player_moveByInput.call(this);
    };

    var _Scene_Base_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        _Scene_Base_update.call(this);
        if (this instanceof Scene_Map || this instanceof Scene_Battle) {
            GamepadManager.updateVariables();
        }
    };

    if (Config.rumbleOnDamage) {
        var _Game_Battler_gainHp = Game_Battler.prototype.gainHp;
        Game_Battler.prototype.gainHp = function(value) {
            _Game_Battler_gainHp.call(this, value);
            if (value < 0 && this.isActor() && $gameParty.inBattle()) {
                GamepadManager.vibrate(0.6, 200);
            }
        };
    }

    window.PICO = window.PICO || {};
    PICO.Gamepad = {
        vibrate: function(i, d) { GamepadManager.vibrate(i, d); },
        setDeadzone: function(v) { Config.deadzone = v; },
        getAxis: function(idx) { return GamepadManager.getAxis(idx); }
    };

})();