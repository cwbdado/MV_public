//=============================================================================
// PICO_TimeControl.js  |  v1.2.0  |  07-05-2024
//=============================================================================

/*:
 * @target MV
 * @plugindesc |v1.2.0| Sistema de tempo estático com períodos e dias customizáveis.
 * @author DadoCWB
 * @url https://picopicocs.itch.io/
 * @help PICO_TimeControl.js
 *
 * =============================================================================
 * PORTUGUÊS (PT-BR)
 * =============================================================================
 * > Descrição
 * Sistema de relógio estático onde o tempo avança apenas via comandos. 
 * Ideal para RPGs baseados em narrativa onde o tempo passa após eventos.
 *
 * > Comandos de Script
 * $gameSystem.nextTime()          -> Avança 1 período.
 * $gameSystem.addTime(p, d)       -> Adiciona p períodos e d dias.
 *
 * > Notas de Layout
 * - Imagens de período são opcionais (deixe vazio para ocultar).
 * - A HUD possui fade automático ao se aproximar do jogador.
 *
 * =============================================================================
 * ENGLISH (EN)
 * =============================================================================
 * > Description
 * Static time system where time only progresses via manual commands.
 * Perfect for narrative-driven RPGs where time passes after specific events.
 *
 * > Script Calls
 * $gameSystem.nextTime()          -> Advances 1 period.
 * $gameSystem.addTime(p, d)       -> Adds p periods and d days.
 *
 * > Layout Notes
 * - Period images are optional (leave blank to hide).
 * - The HUD features an automatic fade-out when the player is nearby.
 * * -----------------------------------------------------------------------------
 * ////////////////////////////////////////////////////////////////////////////
 * //  ____  _             ____  _                                           //
 * // |  _ \(_) ___ ___   |  _ \(_) ___ ___                                  //
 * // | |_) | |/ __/ _ \  | |_) | |/ __/ _ \                                 //
 * // |  __/| | (_| (_) | |  __/| | (_| (_) |                                //
 * // |_|___|_|\___\___/  |_|   |_|\___\___/  ____  _             _ _        //
 * //  / ___|_ __ ___  __ _| |_(_)_   _____  / ___|| |_ _   _  __| (_) ___   //
 * // | |   | '__/ _ \/ _` | __| \ \ / / _ \ \___ \| __| | | |/ _` | |/ _ \  //
 * // | |___| | |  __/ (_| | |_| |\ V /  __/  ___) | |_| |_| | (_| | | (_) | //
 * //  \____|_|  \___|\__,_|\__|_| \_/ \___| |____/ \__|\__,_|\__,_|_|\___/  //
 * //                                                                        //
 * ////////////////////////////////////////////////////////////////////////////
 *
 * @param periodsList
 * @text Lista de Períodos / Periods List
 * @type struct<PeriodConfig>[]
 * @desc Configure os períodos do dia. Switches padrão: 1 a 4.
 * @default ["{\"name\":\"Madrugada\",\"tone\":\"[-69,-68,20,68]\",\"switchId\":\"1\",\"img\":\"Dawn\"}","{\"name\":\"Manhã\",\"tone\":\"[30,30,30,0]\",\"switchId\":\"2\",\"img\":\"Morning\"}","{\"name\":\"Tarde\",\"tone\":\"[18,-7,-7,0]\",\"switchId\":\"3\",\"img\":\"Afternoon\"}","{\"name\":\"Noite\",\"tone\":\"[-48,-48,-48,0]\",\"switchId\":\"4\",\"img\":\"Night\"}"]
 *
 * @param daysList
 * @text Lista de Dias / Days List
 * @type struct<DayConfig>[]
 * @desc Configure os dias da semana. Switches padrão: 11 a 17.
 * @default ["{\"name\":\"Domingo\",\"switchId\":\"11\"}","{\"name\":\"Segunda\",\"switchId\":\"12\"}","{\"name\":\"Terça\",\"switchId\":\"13\"}","{\"name\":\"Quarta\",\"switchId\":\"14\"}","{\"name\":\"Quinta\",\"switchId\":\"15\"}","{\"name\":\"Sexta\",\"switchId\":\"16\"}","{\"name\":\"Sábado\",\"switchId\":\"17\"}"]
 *
 * @param varPeriod
 * @text Variável Período / Period Var
 * @type variable
 * @default 5
 *
 * @param varDay
 * @text Variável Dia / Day Var
 * @type variable
 * @default 6
 *
 * @param groupHud
 * @text === HUD Customization =============
 * * @param hudConfig
 * @parent groupHud
 * @type struct<HudConfig>
 * @desc Posição e aparência da HUD. / HUD position and looks.
 * @default {"windowMode":"true","windowX":"20","windowY":"20","windowW":"340","windowOpacity":"255","windowBackOpacity":"180"}
 *
 * @param fadeByDistance
 * @parent groupHud
 * @type boolean
 * @text Fade por Distância / Distance Fade
 * @default true
 */

/*~struct~PeriodConfig:
 * @param name
 * @text Nome / Name
 * @param tone
 * @text Tonalidade / Tone [R,G,B,Gray]
 * @default [0,0,0,0]
 * @param switchId
 * @text Switch ID
 * @type switch
 * @param img
 * @text Imagem / Image (img/system/)
 */

/*~struct~DayConfig:
 * @param name
 * @text Nome / Name
 * @param switchId
 * @text Switch ID
 * @type switch
 */

/*~struct~HudConfig:
 * @param windowMode @type boolean @default true
 * @param windowX @type number @default 20
 * @param windowY @type number @default 20
 * @param windowW @type number @default 340
 * @param windowOpacity @type number @default 255
 * @param windowBackOpacity @type number @default 180
 */

(function () {
    var parameters = PluginManager.parameters('PICO_TimeControl');

    function parseArray(param) {
        try {
            var raw = JSON.parse(param || "[]");
            return raw.map(function(item) { return JSON.parse(item); });
        } catch(e) { return []; }
    }

    var PERIODS_DATA = parseArray(parameters['periodsList']).map(function(p) {
        return { 
            name: p.name, 
            tone: JSON.parse(p.tone || "[0,0,0,0]"), 
            switchId: parseInt(p.switchId) || 0, 
            img: p.img || "" 
        };
    });

    var DAYS_DATA = parseArray(parameters['daysList']).map(function(d) {
        return { name: d.name, switchId: parseInt(d.switchId) || 0 };
    });

    var VAR_PERIOD = parseInt(parameters['varPeriod']) || 5;
    var VAR_DAY = parseInt(parameters['varDay']) || 6;
    var HUD_PARAMS = JSON.parse(parameters['hudConfig'] || "{}");
    var FADE_ENABLED = parameters['fadeByDistance'] === 'true';

    //=========================================================================
    // Game_System
    //=========================================================================
    var _ptc_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function () {
        _ptc_Game_System_initialize.call(this);
        this._period = 0;
        this._dayIndex = 0;
        this._hudVisibility = true;
    };

    Game_System.prototype.nextTime = function() { this.addTime(1, 0); };

    Game_System.prototype.addTime = function (p, d) {
        this._period += (p || 0);
        this._dayIndex += (d || 0);
        this.refreshTimeControl();
    };

    Game_System.prototype.refreshTimeControl = function () {
        var maxP = PERIODS_DATA.length || 1;
        var maxD = DAYS_DATA.length || 1;
        
        var extraDays = Math.floor(this._period / maxP);
        if (extraDays !== 0) this._dayIndex += extraDays;

        this._period = ((this._period % maxP) + maxP) % maxP;
        this._dayIndex = ((this._dayIndex % maxD) + maxD) % maxD;
        
        this.updateDatabase();
        this.applyTone();
    };

    Game_System.prototype.updateDatabase = function () {
        $gameVariables.setValue(VAR_PERIOD, this._period);
        $gameVariables.setValue(VAR_DAY, this._dayIndex);

        PERIODS_DATA.forEach(function(data, i) {
            if (data.switchId > 0) $gameSwitches.setValue(data.switchId, i === this._period);
        }, this);
        DAYS_DATA.forEach(function(data, i) {
            if (data.switchId > 0) $gameSwitches.setValue(data.switchId, i === this._dayIndex);
        }, this);
    };

    Game_System.prototype.applyTone = function () {
        if (!$gameScreen) return;
        var data = PERIODS_DATA[this._period];
        if (data) $gameScreen.startTint(data.tone, 60);
    };

    //=========================================================================
    // Window_VNSC (HUD)
    //=========================================================================
    function Window_VNSC() { this.initialize.apply(this, arguments); }
    Window_VNSC.prototype = Object.create(Window_Base.prototype);
    Window_VNSC.prototype.constructor = Window_VNSC;

    Window_VNSC.prototype.initialize = function () {
        var w = parseInt(HUD_PARAMS.windowW) || 340;
        Window_Base.prototype.initialize.call(this, parseInt(HUD_PARAMS.windowX), parseInt(HUD_PARAMS.windowY), w, 125);
        this.opacity = HUD_PARAMS.windowMode === 'true' ? parseInt(HUD_PARAMS.windowOpacity) : 0;
        this.backOpacity = HUD_PARAMS.windowMode === 'true' ? parseInt(HUD_PARAMS.windowBackOpacity) : 0;
        this.refresh();
    };

    Window_VNSC.prototype.refresh = function () {
        this.contents.clear();
        var pData = PERIODS_DATA[$gameSystem._period];
        var dData = DAYS_DATA[$gameSystem._dayIndex];
        if (!pData || !dData) return;

        var hasImage = pData.img && pData.img.trim() !== "";
        var textX = hasImage ? 100 : 10;
        var textWidth = this.contentsWidth() - textX - 10;

        this.changeTextColor(this.systemColor());
        this.drawText(pData.name, textX, 12, textWidth);

        this.changeTextColor(this.normalColor());
        this.drawText(dData.name, textX, 48, textWidth);

        if (hasImage) {
            var bitmap = ImageManager.loadSystem(pData.img);
            var self = this;
            bitmap.addLoadListener(function() {
                self.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 5, 85, 85);
            });
        }
    };

    Window_VNSC.prototype.update = function () {
        Window_Base.prototype.update.call(this);
        if (FADE_ENABLED) this.updateFade();
    };

    Window_VNSC.prototype.updateFade = function () {
        var px = $gamePlayer.screenX();
        var py = $gamePlayer.screenY();
        var d = Math.sqrt(Math.pow(px - (this.x + this.width/2), 2) + Math.pow(py - (this.y + this.height/2), 2));
        var targetOpacity = d < 160 ? 100 : 255;
        
        if (this.contentsOpacity !== targetOpacity) {
            var speed = 10;
            if (this.contentsOpacity < targetOpacity) this.contentsOpacity += speed;
            else this.contentsOpacity -= speed;
        }

        if (HUD_PARAMS.windowMode === 'true') this.opacity = this.contentsOpacity;
    };

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        this._timeWindow = new Window_VNSC();
        this.addWindow(this._timeWindow);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (this._timeWindow && ($gameSystem._period !== this._lastP || $gameSystem._dayIndex !== this._lastD)) {
            this._timeWindow.refresh();
            this._lastP = $gameSystem._period;
            this._lastD = $gameSystem._dayIndex;
        }
    };

})();