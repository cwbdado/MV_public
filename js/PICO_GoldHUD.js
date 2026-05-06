//=============================================================================
// PICO_GoldHUD.js
//=============================================================================
// Inspired by PICO_TimeControl
// Version: 1.2
// Category: HUD
// ----------------------------------------------------------------------------

/*:
 * @plugindesc |v.1.2| HUD simples que exibe o Gold do jogador
 * @author DadoCWB
 * @help PICO_GoldHUD.js
 *
 * Mostra o ouro do jogador na tela.
 *
 * @param groupPosition
 * @text === Posição e Aparência ===
 *
 * @param windowX
 * @parent groupPosition
 * @type number
 * @text Posição X da Janela
 * @default 0
 *
 * @param windowY
 * @parent groupPosition
 * @type number
 * @text Posição Y da Janela
 * @default 540
 *
 * @param windowWidth
 * @parent groupPosition
 * @type number
 * @text Largura da Janela
 * @default 260
 *
 * @param windowMode
 * @parent groupPosition
 * @type boolean
 * @text Modo Janela
 * @desc true = com moldura | false = só conteúdo
 * @default true
 *
 * @param textOffsetX
 * @parent groupPosition
 * @type number
 * @text Recuo do Texto (X)
 * @desc Quanto mais à esquerda o número do ouro aparece dentro da janela. Recomendado: 40~80
 * @default 48
 * @min 0
 *
 * @param groupIcon
 * @text === Ícone / Imagem ===
 *
 * @param showIcon
 * @parent groupIcon
 * @type boolean
 * @text Mostrar Ícone/Imagem
 * @default true
 *
 * @param iconId
 * @parent groupIcon
 * @type number
 * @text ID do Ícone
 * @desc Ícone padrão (204 = moeda dourada)
 * @default 204
 * @min 0
 *
 * @param customImage
 * @parent groupIcon
 * @type file
 * @dir img/system/
 * @text Imagem Customizada
 * @desc Se preenchido, usa esta imagem (ex: Gold.png)
 */

(function() {

    var parameters = PluginManager.parameters('PICO_GoldHUD');

    var HUD_X         = parseInt(parameters['windowX']) || 0;
    var HUD_Y         = parseInt(parameters['windowY']) || 540;
    var HUD_W         = parseInt(parameters['windowWidth']) || 260;
    var TEXT_OFFSET_X = parseInt(parameters['textOffsetX']) || 48;
    var WINDOW_MODE   = parameters['windowMode'] !== 'false';

    var SHOW_ICON     = parameters['showIcon'] !== 'false';
    var ICON_ID       = parseInt(parameters['iconId']) || 204;
    var CUSTOM_IMAGE  = parameters['customImage'] || '';

    var VISIBILITY_MODE = parameters['visibilityMode'] || 'auto';
    var FADE_ENABLED    = parameters['fadeByDistance'] !== 'false';
    var FADE_DISTANCE   = parseInt(parameters['fadeDistance']) || 120;

    //=========================================================================
    // Window_GoldHUD
    //=========================================================================
    function Window_GoldHUD() {
        this.initialize.apply(this, arguments);
    }

    Window_GoldHUD.prototype = Object.create(Window_Base.prototype);
    Window_GoldHUD.prototype.constructor = Window_GoldHUD;

    Window_GoldHUD.prototype.initialize = function() {
        Window_Base.prototype.initialize.call(this, HUD_X, HUD_Y, HUD_W, 72);
        
        if (!WINDOW_MODE) {
            this.opacity = 0;
            this.backOpacity = 0;
        }
        this.refresh();
    };

    Window_GoldHUD.prototype.refresh = function() {
        this.contents.clear();
        var gold = $gameParty.gold();
        var iconOffset = 0;

        // Desenha Ícone ou Imagem
        if (SHOW_ICON) {
            if (CUSTOM_IMAGE) {
                var bitmap = ImageManager.loadSystem(CUSTOM_IMAGE);
                var self = this;
                bitmap.addLoadListener(function() {
                    if (bitmap.width > 0) {
                        self.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 6, 6, 36, 36);
                    }
                });
                iconOffset = 48;
            } else {
                this.drawIcon(ICON_ID, 6, 6);
                iconOffset = 48;
            }
        }

        // Texto do Gold - agora mais controlável
        this.resetFontSettings();
        this.contents.fontSize = 26;
        this.drawText(gold, TEXT_OFFSET_X + iconOffset, 8, HUD_W - TEXT_OFFSET_X - iconOffset - 40, 'right');

        // Letra "G"
        this.contents.fontSize = 22;
        this.drawText("G", HUD_W - 34, 10, 30, 'left');
    };

    //=========================================================================
    // Scene_Map
    //=========================================================================
    var _PGH_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _PGH_Scene_Map_start.call(this);
        this._goldHUD = new Window_GoldHUD();
        this.addWindow(this._goldHUD);
    };

    var _PGH_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _PGH_Scene_Map_update.call(this);

        if (!this._goldHUD) return;

        var eventRunning = $gameMap.isEventRunning();
        var shouldHide = (VISIBILITY_MODE === 'never') ||
                        (VISIBILITY_MODE === 'auto' && eventRunning);

        if (shouldHide) {
            this._goldHUD.hide();
        } else {
            this._goldHUD.show();
            
            if (this._lastGold !== $gameParty.gold()) {
                this._goldHUD.refresh();
                this._lastGold = $gameParty.gold();
            }

            if (FADE_ENABLED) {
                this._PGH_applyGoldHUDFade();
            }
        }
    };

    Scene_Map.prototype._PGH_applyGoldHUDFade = function() {
        var win = this._goldHUD;
        if (!win) return;

        var player = $gamePlayer;
        var th = $gameMap.tileHeight() || 48;
        var px = player.screenX();
        var py = player.screenY() - th / 2;

        var dx = Math.max(HUD_X - px, 0, px - (HUD_X + HUD_W));
        var dy = Math.max(HUD_Y - py, 0, py - (HUD_Y + 72));
        var dist = Math.sqrt(dx * dx + dy * dy);

        var opacity = 255;
        if (dist < FADE_DISTANCE) {
            opacity = Math.max(60, Math.round(255 * (dist / FADE_DISTANCE)));
        }
        
        win.contentsOpacity = opacity;
        if (WINDOW_MODE) win.opacity = Math.round(opacity * 0.8);
    };

})();