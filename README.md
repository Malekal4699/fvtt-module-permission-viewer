# Permission Viewer
* ![](https://img.shields.io/badge/Maintainer-Malekal-green)
My discord server: https://discord.gg/Ee2cmeRsN3

This Foundry VTT module displays colored diamonds/squares/circles to represent the players who have limited/observer/owner permissions on Entities (Actors, Journal entries, Items, etc..).

It makes it very easy to see at a glance which journal, actor or item is shared with your players. The shapes are :

* Diamond : Limited permission
* Square : Observer permission
* Circle : Owner permission

The color of the dots represents the color of the player. In the case of permissions shared with `All Players`, the shape will have the Blue/Yellow/Green/Red colors.


![screenshot](./images/new_permissions_viewer.png)
![screenshot](./images/player-list.png)

# Installation
In the setup page of FVTT, Install the module by entering the following URL : `https://github.com/League-of-Foundry-Developers/fvtt-module-permission-viewer/releases/latest/download/module.json`
As DM go to the `Manage Modules` options menu in your World then enable the `Permission Viewer` module.

# Settings
New option has been added to toggle the current behavior, preventing the opening of the share to player dialog box when default permission is set to limited.

![image](https://user-images.githubusercontent.com/78604153/142787002-599b2da2-5f11-413b-bc19-525924635c20.png)

# Known Issues
Module compatibility issues:
* smol-foundry: resizing Scenes to smaller values will cause PV icons to be offset.

# Changelog
`https://github.com/League-of-Foundry-Developers/fvtt-module-permission-viewer/CHANGELOG.md`

# License
This Foundry VTT module, writen by KaKaRoTo, is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
