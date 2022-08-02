# Ownership Viewer
(Formerly known as 'Permission Viewer')

![](https://img.shields.io/badge/Maintainer-Malekal-green)
[![](https://img.shields.io/badge/-Discord-blue)](https://discord.gg/Ee2cmeRsN3)
![](https://img.shields.io/badge/Foundry-v10-informational)
![GitHub Latest Version](https://img.shields.io/github/v/release/Malekal4699/fvtt-module-permission-viewer?sort=semver)

![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fpermission_viewer&colorB=4aa94a)
![Latest Release Download Count](https://img.shields.io/github/downloads/Malekal4699/fvtt-module-permission-viewer/latest/module.zip)

This Foundry VTT module displays colored diamonds/squares/circles to represent the players who have limited/observer/owner permissions on Entities (Actors, Journal entries, Items, etc..).

It makes it very easy to see at a glance which journal, actor or item is shared with your players. The shapes are :

* Diamond : Limited permission
* Square : Observer permission
* Circle : Owner permission

The color of the dots represents the color of the player. In the case of permissions shared with `All Players`, the shape will have the Blue/Yellow/Green/Red colors.


![screenshot](./images/new_permissions_viewer.png)
![screenshot](./images/player-list.png)

# Known Issues
Module compatibility issues:
* smol-foundry: resizing Scenes to smaller values will cause PV icons to be offset.

# Changelog
`https://github.com/League-of-Foundry-Developers/fvtt-module-permission-viewer/CHANGELOG.md`

# License
This Foundry VTT module, writen by KaKaRoTo, is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
