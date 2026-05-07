//=============================================================================
// PICO_InputMapper.js  |  v1.0.0  |  15-04-2026
//=============================================================================

/*:
 * @target MV
 * @plugindesc |v1.0.0| Remap native keys and register custom input symbols with common event triggers.
 * @author DadoCWB
 * @url https://picopicocs.itch.io/
 *
 * @help 
 * ============================================================================
 * PICO_InputMapper  v1.0.0 (MV Version)
 * ============================================================================
 * This plugin allows you to:
 * 1. Remap native keys (OK, Cancel, Shift, etc.) to any keyboard key.
 * 2. Create custom input symbols (e.g., "dash", "hotkey1").
 * 3. Trigger Common Events when a specific key is pressed.
 *
 * KEY CODES:
 * Use standard JavaScript KeyCodes (e.g., 65 for 'A', 83 for 'S').
 * ----------------------------------------------------------------------------
 * * SCRIPT CALLS:
 * ----------------------------------------------------------------------------
 * Input.isPressed('symbol') -> Returns true if the key is being held.
 * Input.isTriggered('symbol') -> Returns true if the key was just pressed.
 *
 * ============================================================================
 *
 * @param --- Native Remaps ---
 * @text ====================================
 *
 * @param NativeRemaps
 * @text Native Key Mapping
 * @parent --- Native Remaps ---
 * @type struct<NativeMap>[]
 * @desc Remap the built-in MV actions to different keys.
 * @default []
 *
 * @param --- Custom Inputs ---
 * @text ====================================
 *
 * @param CustomInputs
 * @text Custom Input List
 * @parent --- Custom Inputs ---
 * @type struct<CustomInput>[]
 * @desc Register new symbols and link them to Common Events.
 * @default []
 *
 * @param --- Debug Settings ---
 * @text ------------------------------------
 *
 * @param DebugMode
 * @text Console Debug
 * @parent --- Debug Settings ---
 * @type boolean
 * @default false
 * @desc Show key codes in the console (F8) when keys are pressed.
 */

/*~struct~NativeMap:
 * @param KeyCode
 * @text Key Code
 * @type number
 * @desc JavaScript KeyCode (e.g., 88 for 'X').
 *
 * @param Action
 * @text Native Action
 * @type select
 * @option ok @option cancel @option shift @option menu @option escape @option pageup @option pagedown @option up @option down @option left @option right
 * @default ok
 */

/*~struct~CustomInput:
 * @param KeyCode
 * @text Key Code
 * @type number
 *
 * @param Symbol
 * @text Input Symbol
 * @desc The string used to check via script (e.g., 'dash').
 * @default custom
 *
 * @param CommonEventId
 * @text Common Event ID
 * @type common_event
 * @desc Trigger this event when the key is pressed.
 * @default 0
 */

(function () {
    "use strict";

    var PLUGIN_NAME = "PICO_InputMapper";
    var _params = PluginManager.parameters(PLUGIN_NAME);

    // --- Helper for Structs ---
    function parseArray(param) {
        try {
            var raw = JSON.parse(param || "[]");
            return raw.map(function(item) { return JSON.parse(item); });
        } catch(e) { return []; }
    }

    var NATIVE_MAPS = parseArray(_params['NativeRemaps']);
    var CUSTOM_MAPS = parseArray(_params['CustomInputs']);
    var DEBUG_MODE = _params['DebugMode'] === 'true';

    // --- Apply Mappings ---
    function applyMappings() {
        // Apply Native
        NATIVE_MAPS.forEach(function(map) {
            var kc = parseInt(map.KeyCode);
            if (kc > 0) Input.keyMapper[kc] = map.Action;
        });

        // Apply Custom
        CUSTOM_MAPS.forEach(function(map) {
            var kc = parseInt(map.KeyCode);
            if (kc > 0) Input.keyMapper[kc] = map.Symbol;
        });
    }

    applyMappings();

    // --- Update Loop for Common Events ---
    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (!$gameMap.isEventRunning()) {
            this.updatePicoCustomInputs();
        }
    };

    Scene_Map.prototype.updatePicoCustomInputs = function() {
        CUSTOM_MAPS.forEach(function(map) {
            var ceId = parseInt(map.CommonEventId);
            if (ceId > 0 && Input.isTriggered(map.Symbol)) {
                $gameTemp.reserveCommonEvent(ceId);
            }
        });
    };

    // --- Debug KeyCodes ---
    if (DEBUG_MODE) {
        var _Input_onKeyDown = Input._onKeyDown;
        Input._onKeyDown = function(event) {
            _Input_onKeyDown.call(this, event);
            console.log("PICO_InputMapper | Pressed KeyCode: " + event.keyCode);
        };
    }

    // --- Public API ---
    window.PICO = window.PICO || {};
    PICO.InputMapper = {
        /** Register a symbol at runtime */
        register: function(keyCode, symbol) {
            Input.keyMapper[keyCode] = symbol;
        }
    };

})();