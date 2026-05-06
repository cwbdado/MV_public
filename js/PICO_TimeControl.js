//=============================================================================
// PICO_TimeControl.js               MV                         by  DadoCWB
//=============================================================================
// Written for RPG MAKER MV
// Version: 0.8
// Category: Time / Lighting
// ----------------------------------------------------------------------------
//

/*:
 * @plugindesc |v.0.8| Relógio Estático que controla os períodos do dia (vers. MV)
 * @author DadoCWB
 * @url https://picopicocs.itch.io/
 * @help PICO_TimeControl.js v.0.8
 *
 * Cria um relógio estático baseado em períodos do dia.
 * O dia é dividido em 6 períodos: Madrugada, Manhã, Meio-dia, Tarde, Anoitecer, Noite.
 *
 * O relógio não avança automaticamente — apenas por comando de script.
 *
 * =========================================================================
 *  COMANDOS DE SCRIPT
 * =========================================================================
 *
 * 1) Avançar o tempo:
 *      $gameSystem.addTime(period, day)
 *      - period : número de períodos a avançar (pode ser negativo)
 *      - day    : número de dias a avançar (pode ser negativo)
 *    
 *      PS: opcionalmente usar $gameSystem.nextTime() para avnçar um único período
 *
 * 2) Setar exatamente o tempo:
 *      $gameSystem.setTime(period, day)
 *      - period : período desejado (0–5)
 *      - day    : dia desejado (0=Dom … 6=Sáb)
 *      Se period ou day forem false, mantém o valor atual.
 *      Nota: alterar day via setTime ajusta countDay pela diferença.
 *
 * 3) Setar o contador absoluto de dias:
 *      $gameSystem.setCountDay(value)
 *
 * 4) Ativar/desativar iluminação em um mapa específico:
 *      $gameSystem.setMapException(mapId, state)
 *      - mapId : ID do mapa
 *      - state : true (desativa iluminação) / false (ativa)
 *
 * 5) Ligar/desligar o sistema de tonalidades globalmente:
 *      $gameSystem.setToneSystem(state)  // true ou false
 *
 * 6) Mostrar/ocultar o HUD:
 *      $gameSystem.setHudVisibility(state)  // true ou false
 *
 * 7) Forçar ocultação do HUD (mesmo durante eventos):
 *      $gameSystem.setHudForcedHidden(true)   → oculta permanentemente
 *      $gameSystem.setHudForcedHidden(false)  → volta ao comportamento padrão
 *      Use para controlar cutscenes sem depender de isEventRunning().
 *
 * =========================================================================
 *  VARIÁVEIS E SWITCHES DO DATABASE
 * =========================================================================
 *  Os IDs abaixo são configuráveis nos parâmetros do plugin.
 *  Defaults:
 *    Variável período     → 102
 *    Variável dia semana  → 104
 *    Variável cont. dias  → 109
 *
 *    Switch período 0–5   → 102–107
 *    Switch dia 0–6       → 111–117
 *    Switch luz           → 124
 *    Switch sombra        → 126
 *
 * =========================================================================
 *  IMAGENS
 * =========================================================================
 *  Coloque os arquivos abaixo em img/system/:
 *    Dawn.png  Morning.png  Noon.png  Afternoon.png  Evening.png  Night.png
 *  Se algum estiver faltando, um aviso aparece no console do desenvolvedor.
 *
 * @param groupInitialState
 * @text === Initial State ================
 * @desc Estado inicial do tempo ao começar um novo jogo.
 *
 * @param initialPeriod
 * @parent groupInitialState
 * @type select
 * @text Starting Period
 * @desc Period of day when a new game starts.
 * @option Dawn
 * @value 0
 * @option Morning
 * @value 1
 * @option Noon
 * @value 2
 * @option Afternoon
 * @value 3
 * @option Evening
 * @value 4
 * @option Night
 * @value 5
 * @default 0
 *
 * @param initialDay
 * @parent groupInitialState
 * @type select
 * @text Starting Day of Week
 * @desc Day of the week when a new game starts.
 * @option Sunday
 * @value 0
 * @option Monday
 * @value 1
 * @option Tuesday
 * @value 2
 * @option Wednesday
 * @value 3
 * @option Thursday
 * @value 4
 * @option Friday
 * @value 5
 * @option Saturday
 * @value 6
 * @default 0
 *
 * @param initialCountDay
 * @parent groupInitialState
 * @type number
 * @text Starting Day Counter
 * @desc Absolute day counter value when a new game starts.
 * @min 0
 * @default 0
 *
 * @param groupVariables
 * @text === Variables ====================
 * @desc IDs de variáveis do database usadas pelo sistema de tempo.
 *
 * @param varPeriod
 * @parent groupVariables
 * @type variable
 * @text Período atual
 * @desc Variável que armazena o período atual (0–5).
 * @default 102
 *
 * @param varDay
 * @parent groupVariables
 * @type variable
 * @text Dia da semana
 * @desc Variável que armazena o dia da semana (0–6).
 * @default 104
 *
 * @param varCountDay
 * @parent groupVariables
 * @type variable
 * @text Contador de dias
 * @desc Variável que armazena o contador absoluto de dias desde o início.
 * @default 109

 * @param groupSwitchesPeriods
 * @text === Switches: Periods ==========
 * @desc Switches ativados conforme o período do dia atual.
 *
 * @param switchPeriod0
 * @parent groupSwitchesPeriods
 * @type switch
 * @text Dawn (Madrugada)
 * @desc Switch ativado quando o período atual é Madrugada.
 * @default 102
 *
 * @param switchPeriod1
 * @parent groupSwitchesPeriods
 * @type switch
 * @text Morning (Manhã)
 * @desc Switch ativado quando o período atual é Manhã.
 * @default 103
 *
 * @param switchPeriod2
 * @parent groupSwitchesPeriods
 * @type switch
 * @text Noon (Meio-dia)
 * @desc Switch ativado quando o período atual é Meio-dia.
 * @default 104
 *
 * @param switchPeriod3
 * @parent groupSwitchesPeriods
 * @type switch
 * @text Afternoon (Tarde)
 * @desc Switch ativado quando o período atual é Tarde.
 * @default 105
 *
 * @param switchPeriod4
 * @parent groupSwitchesPeriods
 * @type switch
 * @text Evening (Anoitecer)
 * @desc Switch ativado quando o período atual é Anoitecer.
 * @default 106
 *
 * @param switchPeriod5
 * @parent groupSwitchesPeriods
 * @type switch
 * @text Night (Noite)
 * @desc Switch ativado quando o período atual é Noite.
 * @default 107

 * @param groupSwitchesDays
 * @text === Switches: Days of Week =====
 * @desc Switches ativados conforme o dia da semana atual.
 *
 * @param switchDay0
 * @parent groupSwitchesDays
 * @type switch
 * @text Sunday (Domingo)
 * @desc Switch ativado quando o dia da semana é Domingo.
 * @default 111
 *
 * @param switchDay1
 * @parent groupSwitchesDays
 * @type switch
 * @text Monday (Segunda)
 * @desc Switch ativado quando o dia da semana é Segunda.
 * @default 112
 *
 * @param switchDay2
 * @parent groupSwitchesDays
 * @type switch
 * @text Tuesday (Terça)
 * @desc Switch ativado quando o dia da semana é Terça.
 * @default 113
 *
 * @param switchDay3
 * @parent groupSwitchesDays
 * @type switch
 * @text Wednesday (Quarta)
 * @desc Switch ativado quando o dia da semana é Quarta.
 * @default 114
 *
 * @param switchDay4
 * @parent groupSwitchesDays
 * @type switch
 * @text Thursday (Quinta)
 * @desc Switch ativado quando o dia da semana é Quinta.
 * @default 115
 *
 * @param switchDay5
 * @parent groupSwitchesDays
 * @type switch
 * @text Friday (Sexta)
 * @desc Switch ativado quando o dia da semana é Sexta.
 * @default 116
 *
 * @param switchDay6
 * @parent groupSwitchesDays
 * @type switch
 * @text Saturday (Sábado)
 * @desc Switch ativado quando o dia da semana é Sábado.
 * @default 117

 * @param groupSwitchesLighting
 * @text === Switches: Lighting =========
 * @desc Switches de luz e sombra usados por layers de iluminação.
 *
 * @param switchLight
 * @parent groupSwitchesLighting
 * @type switch
 * @text Camada de luz
 * @desc Switch ativado durante Manhã (1) e Meio-dia (2).
 * @default 124
 *
 * @param switchShadow
 * @parent groupSwitchesLighting
 * @type switch
 * @text Camada de sombra
 * @desc Switch ativado durante Anoitecer (4) e Noite (5).
 * @default 126

 * @param groupMapExceptions
 * @text === Map Exceptions =============
 * @desc Mapas onde os efeitos de iluminação são desativados.
 *
 * @param mapExceptions
 * @parent groupMapExceptions
 * @type number[]
 * @text Lista de exceções
 * @desc IDs dos mapas que não recebem efeitos de tonalidade/iluminação.

 * @param groupHud
 * @text === HUD =======================
 * @desc Aparência e comportamento do HUD de tempo.
 *
 * @param hudVisibilityMode
 * @parent groupHud
 * @type select
 * @text HUD visibility during events
 * @desc Controls HUD visibility while an event or dialogue is running.
 * @option Always visible
 * @value always
 * @option Always hidden
 * @value never
 * @option Auto-hide during events
 * @value auto
 * @default auto
 *
 * @param hudConfig
 * @parent groupHud
 * @type struct<HudConfig>
 * @text Configuração geral
 * @desc Posição, tamanho, opacidade e comportamento geral da janela do HUD.
 * @default {"windowMode":"true","windowX":"0","windowY":"0","windowW":"420","windowOpacity":"255","windowBackOpacity":"192","hideOnEvent":"true"}
 *
 * @param hudIcon
 * @parent groupHud
 * @type struct<HudElement>
 * @text Ícone do período
 * @desc Imagem do período atual carregada de img/system/. Ignorada silenciosamente se o arquivo não existir.
 * @default {"visible":"true","x":"4","y":"0","w":"96","h":"96"}
 *
 * @param hudPeriodText
 * @parent groupHud
 * @type struct<HudTextElement>
 * @text Texto do período
 * @desc Nome do período atual exibido no HUD (ex.: "Morning").
 * @default {"visible":"true","x":"108","y":"0","w":"140","align":"left","fontSize":"28"}
 *
 * @param hudDayText
 * @parent groupHud
 * @type struct<HudTextElement>
 * @text Texto do dia da semana
 * @desc Nome do dia da semana atual exibido no HUD (ex.: "Monday").
 * @default {"visible":"true","x":"108","y":"36","w":"140","align":"left","fontSize":"28"}
 *
 * @param hudCountDayText
 * @parent groupHud
 * @type struct<HudTextElement>
 * @text Contador de dias
 * @desc Total de dias desde o início exibido no HUD (ex.: "Day 7"). Oculto por padrão.
 * @default {"visible":"false","x":"108","y":"68","w":"140","align":"left","fontSize":"20"}
 *
 * @param fadeByDistance
 * @parent groupHud
 * @type boolean
 * @text Fade by player distance
 * @desc If true, the HUD fades out linearly as the player approaches, based on pixel distance to the nearest HUD edge.
 * @default true
 *
 * @param fadeDistance
 * @parent groupHud
 * @type number
 * @text Fade threshold distance (px)
 * @desc The HUD stays fully opaque while the player is farther than this distance from its nearest edge. Below this threshold, it fades toward minimum opacity.
 * @min 1
 * @default 96
 *
 * @param fadeMinOpacity
 * @parent groupHud
 * @type number
 * @text Minimum opacity (at distance 0)
 * @desc Opacity when the player is touching or inside the HUD edge (0 = fully invisible).
 * @min 0
 * @max 255
 * @default 0
 *
 * @param fadeSpeed
 * @parent groupHud
 * @type number
 * @text Fade speed (opacity per frame)
 * @desc Maximum opacity points changed per frame. Limits how fast the window reacts to player movement.
 * @min 1
 * @max 255
 * @default 15
 */

/*~struct~HudConfig:
 * @param windowMode
 * @type boolean
 * @text Modo janela
 * @desc true = exibe com moldura de janela. false = somente os elementos, sem fundo.
 * @default true
 *
 * @param windowX
 * @type number
 * @text Posição X da janela
 * @default 0
 *
 * @param windowY
 * @type number
 * @text Posição Y da janela
 * @default 0
 *
 * @param windowW
 * @type number
 * @text Largura da janela
 * @default 420
 *
 * @param windowOpacity
 * @type number
 * @text Opacidade da janela (0–255)
 * @desc Opacidade geral da janela. Ignorado no modo sem janela.
 * @min 0
 * @max 255
 * @default 255
 *
 * @param windowBackOpacity
 * @type number
 * @text Opacidade do fundo (0–255)
 * @desc Opacidade do painel de fundo da janela. Ignorado no modo sem janela.
 * @min 0
 * @max 255
 * @default 192
 */

/*~struct~HudElement:
 * @param visible
 * @type boolean
 * @text Visível
 * @default true
 *
 * @param x
 * @type number
 * @text X
 * @min -9999
 * @default 4
 *
 * @param y
 * @type number
 * @text Y
 * @min -9999
 * @default 0
 *
 * @param w
 * @type number
 * @text Largura (px)
 * @default 96
 *
 * @param h
 * @type number
 * @text Altura (px)
 * @default 96
 */

/*~struct~HudTextElement:
 * @param visible
 * @type boolean
 * @text Visível
 * @default true
 *
 * @param x
 * @type number
 * @text X
 * @min -9999
 * @default 108
 *
 * @param y
 * @type number
 * @text Y
 * @min -9999
 * @default 0
 *
 * @param w
 * @type number
 * @text Largura (px)
 * @default 140
 *
 * @param align
 * @type select
 * @text Alinhamento
 * @option left
 * @option center
 * @option right
 * @default left
 *
 * @param fontSize
 * @type number
 * @text Tamanho da fonte
 * @min 8
 * @default 28
 */

(function () {

    var parameters    = PluginManager.parameters('PICO_TimeControl');
    var mapExceptions = parameters['mapExceptions'];

    // Estado inicial
    var paramInitialPeriod   = parseInt(parameters['initialPeriod'])   || 0;
    var paramInitialDay      = parseInt(parameters['initialDay'])      || 0;
    var paramInitialCountDay = parseInt(parameters['initialCountDay']) || 0;

    // Variáveis e Switches
    var paramVarPeriod   = parseInt(parameters['varPeriod'])   || 102;
    var paramVarDay      = parseInt(parameters['varDay'])      || 104;
    var paramVarCountDay = parseInt(parameters['varCountDay']) || 109;

    var paramSwitchPeriods = [
        parseInt(parameters['switchPeriod0']) || 102,
        parseInt(parameters['switchPeriod1']) || 103,
        parseInt(parameters['switchPeriod2']) || 104,
        parseInt(parameters['switchPeriod3']) || 105,
        parseInt(parameters['switchPeriod4']) || 106,
        parseInt(parameters['switchPeriod5']) || 107,
    ];

    var paramSwitchDays = [
        parseInt(parameters['switchDay0']) || 111,
        parseInt(parameters['switchDay1']) || 112,
        parseInt(parameters['switchDay2']) || 113,
        parseInt(parameters['switchDay3']) || 114,
        parseInt(parameters['switchDay4']) || 115,
        parseInt(parameters['switchDay5']) || 116,
        parseInt(parameters['switchDay6']) || 117,
    ];

    var paramSwitchLight  = parseInt(parameters['switchLight'])  || 124;
    var paramSwitchShadow = parseInt(parameters['switchShadow']) || 126;

    // HUD Visibility Mode
    var paramHudVisibilityMode = parameters['hudVisibilityMode'] || 'auto';

    function parseStruct(raw) {
        try { return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; }
    }

    var _hudCfgRaw  = parseStruct(parameters['hudConfig']);
    var _hudIconRaw = parseStruct(parameters['hudIcon']);
    var _hudPeriRaw = parseStruct(parameters['hudPeriodText']);
    var _hudDayRaw  = parseStruct(parameters['hudDayText']);
    var _hudCntRaw  = parseStruct(parameters['hudCountDayText']);

    var HUD_CFG = {
        windowMode:      _hudCfgRaw.windowMode  !== 'false',
        x:               parseInt(_hudCfgRaw.windowX)         || 0,
        y:               parseInt(_hudCfgRaw.windowY)         || 0,
        w:               parseInt(_hudCfgRaw.windowW)         || 420,
        opacity:         parseInt(_hudCfgRaw.windowOpacity)   !== undefined ? (parseInt(_hudCfgRaw.windowOpacity) || 255) : 255,
        backOpacity:     parseInt(_hudCfgRaw.windowBackOpacity) !== undefined ? (parseInt(_hudCfgRaw.windowBackOpacity) || 192) : 192,
        visibilityMode:  paramHudVisibilityMode,
    };

    var HUD_FADE = {
        enabled:    parameters['fadeByDistance'] !== 'false',
        distance:   parseInt(parameters['fadeDistance'])   || 96,
        minOpacity: parseInt(parameters['fadeMinOpacity']) >= 0 ? parseInt(parameters['fadeMinOpacity']) : 0,
        speed:      parseInt(parameters['fadeSpeed']) || 15,
    };

    function _elementBottom(raw, defaultY, defaultH) {
        var s = parseStruct(raw && typeof raw === 'object' ? JSON.stringify(raw) : '{}');
        if (s.visible === 'false') return 0;
        return (parseInt(s.y) || defaultY) + (parseInt(s.h || s.fontSize || 28) || 28);
    }

    var _WP = (typeof Window_Base !== 'undefined' && Window_Base.prototype.standardPadding) ? Window_Base.prototype.standardPadding() : 18;
    var _autoH = Math.max(
        _elementBottom(_hudIconRaw, 0, 96),
        _elementBottom(_hudPeriRaw, 0, 28),
        _elementBottom(_hudDayRaw,  36, 28),
        _elementBottom(_hudCntRaw,  68, 20),
        48
    ) + _WP * 2;

    var HUD_ICON = {
        visible: _hudIconRaw.visible !== 'false',
        x: parseInt(_hudIconRaw.x) || 4,
        y: parseInt(_hudIconRaw.y) || 0,
        w: parseInt(_hudIconRaw.w) || 96,
        h: parseInt(_hudIconRaw.h) || 96,
    };

    var HUD_PERIOD_TEXT = {
        visible:  _hudPeriRaw.visible  !== 'false',
        x:        parseInt(_hudPeriRaw.x)        || 108,
        y:        parseInt(_hudPeriRaw.y)        || 0,
        w:        parseInt(_hudPeriRaw.w)        || 140,
        align:    _hudPeriRaw.align              || 'left',
        fontSize: parseInt(_hudPeriRaw.fontSize) || 28,
    };

    var HUD_DAY_TEXT = {
        visible:  _hudDayRaw.visible  !== 'false',
        x:        parseInt(_hudDayRaw.x)        || 108,
        y:        parseInt(_hudDayRaw.y)        || 36,
        w:        parseInt(_hudDayRaw.w)        || 140,
        align:    _hudDayRaw.align              || 'left',
        fontSize: parseInt(_hudDayRaw.fontSize) || 28,
    };

    var HUD_COUNTDAY_TEXT = {
        visible:  _hudCntRaw.visible  !== 'false',
        x:        parseInt(_hudCntRaw.x)        || 108,
        y:        parseInt(_hudCntRaw.y)        || 68,
        w:        parseInt(_hudCntRaw.w)        || 140,
        align:    _hudCntRaw.align              || 'left',
        fontSize: parseInt(_hudCntRaw.fontSize) || 20,
    };

    var PERIODS   = ["Dawn", "Morning", "Noon", "Afternoon", "Evening", "Night"];
    var WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    //=========================================================================
    // Game_System
    //=========================================================================
    var _ptc_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function () {
        _ptc_Game_System_initialize.call(this);

        this._countDay = paramInitialCountDay;
        this._period   = paramInitialPeriod;
        this._day      = paramInitialDay;

        this._varIdPeriod   = paramVarPeriod;
        this._varIdDay      = paramVarDay;
        this._varIdCountDay = paramVarCountDay;

        this._periods  = PERIODS;
        this._weekDays = WEEK_DAYS;
        this._switchPeriods = paramSwitchPeriods;
        this._switchDays    = paramSwitchDays;
        this._switchLight  = paramSwitchLight;
        this._switchShadow = paramSwitchShadow;

        this._tonePeriods = [
            [-69, -68,  20, 68],
            [ 30,  30,  30,  0],
            [  0,   0,   0,  0],
            [ 18,  -7,  -7,  0],
            [-28, -28, -28,  0],
            [-48, -48, -48,  0],
        ];

        this._hudVisibility = true;
        this._toneSystem    = true;
        this._mapExceptions = {};

        this.makeMapExceptions();
    };

    // ====================== NOVA FUNÇÃO ======================
    Game_System.prototype.nextTime = function () {
        this.addTime(1, 0);
    };

    Game_System.prototype.setToneSystem = function (state) {
        this._toneSystem = state;
        this.refresh_tones();
    };

    Game_System.prototype.makeMapExceptions = function () {
        if (!mapExceptions) return;
        var list = JSON.parse(mapExceptions);
        for (var i = 0; i < list.length; i++) {
            var mapId = parseInt(list[i]);
            if (!isNaN(mapId) && mapId > 0) {
                this._mapExceptions[mapId] = true;
            }
        }
    };

    Game_System.prototype.isMapException = function (mapId) {
        return this._mapExceptions[mapId] === true;
    };

    Game_System.prototype.setMapException = function (mapId, state) {
        this._mapExceptions[mapId] = !!state;
    };

    Game_System.prototype.hudVisibility = function () { return this._hudVisibility; };
    Game_System.prototype.setHudVisibility = function (state) { this._hudVisibility = state; };
    Game_System.prototype.setHudForcedHidden = function (state) { this._hudForcedHidden = !!state; };
    Game_System.prototype.hudForcedHidden = function () { return !!this._hudForcedHidden; };

    Game_System.prototype.periodName = function () { return this._periods[this._period]; };
    Game_System.prototype.weekDayName = function () { return this._weekDays[this._day]; };
    Game_System.prototype.countDay = function () { return this._countDay; };
    Game_System.prototype.periodOfDay = function () { return this._period; };
    Game_System.prototype.dayOfWeek = function () { return this._day; };

    Game_System.prototype.setTime = function (period, day) {
        if (period !== false && period !== undefined) this._period = period;
        if (day !== false && day !== undefined) {
            this._countDay += day - this._day;
            this._day = day;
        }
        this.refreshTimeControl();
    };

    Game_System.prototype.addTime = function (period, day) {
        if (period === undefined) period = 1;
        if (day    === undefined) day    = 0;
        this._period   += period;
        this._day      += day;
        this._countDay = Math.max(0, this._countDay + day);
        this.refreshTimeControl();
    };

    Game_System.prototype.setCountDay = function (value) {
        this._countDay = value;
        this.refresh_GameVariables();
    };

    Game_System.prototype.refreshTimeControl = function () {
        this.refresh_times();
        this.refresh_switches(this._period, this._switchPeriods);
        this.refresh_switches(this._day,    this._switchDays);
        this.refresh_lighting();
        this.refresh_GameVariables();
        this.refresh_tones();
        if (SceneManager._scene && SceneManager._scene._windowVNSC) {
            SceneManager._scene._windowVNSC.markDirty();
        }
    };

    Game_System.prototype.refresh_times = function () {
        var plen = this._periods.length;
        var wlen = this._weekDays.length;
        var extraDays = Math.floor(this._period / plen);
        if (extraDays !== 0) {
            this._day      += extraDays;
            this._countDay += extraDays;
        }
        this._period = ((this._period % plen) + plen) % plen;
        this._day    = ((this._day    % wlen) + wlen) % wlen;
    };

    Game_System.prototype.refresh_switches = function (value, array) {
        array.forEach(function (switchId, index) {
            $gameSwitches.setValue(switchId, index === value);
        });
    };

    Game_System.prototype.refresh_lighting = function () {
        var lightOn  = (this._period === 1 || this._period === 2);
        var shadowOn = (this._period === 4 || this._period === 5);
        $gameSwitches.setValue(this._switchLight,  lightOn);
        $gameSwitches.setValue(this._switchShadow, shadowOn);
    };

    Game_System.prototype.refresh_GameVariables = function () {
        $gameVariables.setValue(this._varIdPeriod,   this._period);
        $gameVariables.setValue(this._varIdDay,      this._day);
        $gameVariables.setValue(this._varIdCountDay, this._countDay);
    };

    Game_System.prototype.refresh_tones = function () {
        if (!$gameMap || !$gameScreen) return;
        var mapId    = $gameMap.mapId();
        var inactive = this.isMapException(mapId) || !this._toneSystem;
        var tone     = inactive ? [0, 0, 0, 0] : this._tonePeriods[this._period];
        $gameScreen.startTint(tone, 6);
    };

    //=========================================================================
    // Window_VNSC
    //=========================================================================
    function Window_VNSC() { this.initialize.apply(this, arguments); }
    Window_VNSC.prototype = Object.create(Window_Base.prototype);
    Window_VNSC.prototype.constructor = Window_VNSC;

    Window_VNSC.prototype.initialize = function () {
        Window_Base.prototype.initialize.call(this, HUD_CFG.x, HUD_CFG.y, HUD_CFG.w, _autoH);
        if (!HUD_CFG.windowMode) {
            this.opacity = this.backOpacity = 0;
        } else {
            this.opacity = HUD_CFG.opacity;
            this.backOpacity = HUD_CFG.backOpacity;
        }
        this._dirty = true;
        this.refresh();
    };

    Window_VNSC.prototype.markDirty = function () { this._dirty = true; };
    Window_VNSC.prototype.needsRefresh = function () { return this._dirty; };
    Window_VNSC.prototype.refresh = function () {
        this._dirty = false;
        this.contents.clear();
        this._drawContent();
    };

    Window_VNSC.prototype._drawContent = function () {
        var period  = $gameSystem.periodName();
        var weekDay = $gameSystem.weekDayName();

        if (HUD_ICON.visible) this._drawTimePicture(period, HUD_ICON.x, HUD_ICON.y, HUD_ICON.w, HUD_ICON.h);
        if (HUD_PERIOD_TEXT.visible) this._drawHudText(period, HUD_PERIOD_TEXT);
        if (HUD_DAY_TEXT.visible) this._drawHudText(weekDay, HUD_DAY_TEXT);
        if (HUD_COUNTDAY_TEXT.visible) this._drawHudText('Day ' + $gameSystem.countDay(), HUD_COUNTDAY_TEXT);
    };

    Window_VNSC.prototype._drawHudText = function (text, cfg) {
        var prevSize = this.contents.fontSize;
        this.contents.fontSize = cfg.fontSize;
        this.drawText(text, cfg.x, cfg.y, cfg.w, cfg.align);
        this.contents.fontSize = prevSize;
    };

    Window_VNSC.prototype._drawTimePicture = function (fileName, x, y, w, h) {
        var bitmap = ImageManager.LoadTimePicture(fileName);
        var self = this;
        bitmap.addLoadListener(function () {
            if (bitmap.width === 0 || bitmap.height === 0) {
                console.warn(`[PICO_TimeControl] Imagem não encontrada: img/system/${fileName}.png`);
                return;
            }
            self.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x, y, w, h);
        });
    };

    Window_VNSC.prototype._calcTargetOpacity = function () {
        if (!HUD_FADE.enabled) return HUD_CFG.opacity;
        var player = $gamePlayer;
        if (!player) return HUD_CFG.opacity;

        var th  = $gameMap.tileHeight() || 48;
        var pcx = player.screenX();
        var pcy = player.screenY() - th / 2;

        var hx1 = HUD_CFG.x;
        var hy1 = HUD_CFG.y;
        var hx2 = hx1 + HUD_CFG.w;
        var hy2 = hy1 + _autoH;

        var dx   = Math.max(hx1 - pcx, 0, pcx - hx2);
        var dy   = Math.max(hy1 - pcy, 0, pcy - hy2);
        var dist = Math.sqrt(dx * dx + dy * dy);

        var threshold  = HUD_FADE.distance;
        var maxOpacity = HUD_CFG.opacity;
        var minOpacity = HUD_FADE.minOpacity;

        if (dist >= threshold) return maxOpacity;
        if (dist <= 0) return minOpacity;

        var t = dist / threshold;
        return Math.round(minOpacity + t * (maxOpacity - minOpacity));
    };

    Window_VNSC.prototype._applyFade = function (targetOpacity) {
        var speed   = HUD_FADE.speed;
        var current = this.contentsOpacity;

        if (current < targetOpacity) current = Math.min(current + speed, targetOpacity);
        else if (current > targetOpacity) current = Math.max(current - speed, targetOpacity);

        this.contentsOpacity = current;

        if (HUD_CFG.windowMode) {
            var ratio = (HUD_CFG.opacity > 0) ? current / HUD_CFG.opacity : 0;
            this.opacity     = Math.round(HUD_CFG.opacity     * ratio);
            this.backOpacity = Math.round(HUD_CFG.backOpacity * ratio);
        }
    };

    //=========================================================================
    // Scene_Map & DataManager
    //=========================================================================
    var _ptc_DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function () {
        _ptc_DataManager_setupNewGame.call(this);
        $gameSystem.refreshTimeControl();
    };

    var _ptc_DataManager_loadGame = DataManager.loadGame;
    DataManager.loadGame = function (savefileId) {
        var result = _ptc_DataManager_loadGame.call(this, savefileId);
        if ($gameSystem) $gameSystem.refreshTimeControl();
        return result;
    };

    var _ptc_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _ptc_Scene_Map_start.call(this);
        this._windowVNSC = new Window_VNSC();
        this.addWindow(this._windowVNSC);
        $gameSystem.refreshTimeControl();
    };

    var _ptc_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _ptc_Scene_Map_update.call(this);

        var eventRunning    = $gameMap.isEventRunning();
        var hudVisible      = $gameSystem.hudVisibility();
        var hudForcedHidden = $gameSystem.hudForcedHidden();

        var hiddenByMode = (HUD_CFG.visibilityMode === 'never') ||
                          (HUD_CFG.visibilityMode === 'auto' && eventRunning);

        var shouldHide = hudForcedHidden || !hudVisible || hiddenByMode;

        if (shouldHide) {
            this._windowVNSC.hide();
        } else {
            this._windowVNSC.show();
            if (this._windowVNSC.needsRefresh()) {
                this._windowVNSC.refresh();
            }
            var target = this._windowVNSC._calcTargetOpacity();
            this._windowVNSC._applyFade(target);
        }
    };

    ImageManager.LoadTimePicture = function (filename) {
        return this.loadBitmap('img/system/', filename, 0, true);
    };

})();