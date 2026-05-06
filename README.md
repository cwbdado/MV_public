# MV_Public — Plugins for RPG Maker MV

A collection of plugins for RPG Maker MV developed with a focus on performance, flexibility, and ease of integration.

This repository provides ready-to-use solutions to accelerate game development, reduce rework, and expand the engine's capabilities.

---

## Available Plugins

| Plugin         | Version | Description                                                      | Status |
|----------------|---------|------------------------------------------------------------------|--------|
| AdvancedMenu   | 1.2.0   | Highly customizable and modular main menu                       | Active |
| BattleSystemX  | 1.1.3   | Flexible battle system (ATB / CTB / Action)                     | Active |
| SkillTreePro   | 1.0.8   | Advanced skill tree system                                      | Active |
| SaveSystemPlus | 1.3.1   | Save system with thumbnails, autosave, and multiple slots       | Active |

This table should be updated as new plugins are added.

---

## Installation

1. Download the desired plugin `.js` file  
2. Copy the file into your project's `js/plugins` folder  
3. Open the Plugin Manager in RPG Maker MV  
4. Enable the plugin and configure its parameters as needed  
5. Save the project and run tests  

It is recommended to test plugins in a separate project before applying them to your main project.

---

## Compatibility

- RPG Maker MV (version 1.6.x recommended)  
- Some plugins may work in RPG Maker MZ with adjustments  
- Compatibility with other plugins may vary and should be checked in individual documentation  

---

## Repository Structure

```text
MV_public/
├── js/
│   └── plugins/     # Main plugin files (.js)
├── img/             # Graphic assets used by plugins
├── fonts/           # Custom fonts (when required)
├── demo/            # Demo projects (when available)
├── README.md
├── LICENSE
└── changelog.md
