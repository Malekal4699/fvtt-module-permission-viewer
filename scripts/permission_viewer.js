class PermissionViewer {

    static init() {
        JournalSheet.prototype._onShowPlayers = PermissionViewer.prototype._onShowPlayers
        game.settings.register("permission_viewer", "migrated", {
            name: game.i18n.localize("PERMISSIONVIEWER.SettingName"),
            scope: "world",
            default: 0,
            type: Number
        });
        game.settings.register("permission_viewer", "limitedPrompt", {
            name: "Limited Permission Dialog",
            hint: "If checked, limited permission will prompt option dialog.",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            onChange: value => console.debug(value)
        });

    }
    static ready() {
        if (game.settings.get("permission_viewer", "migrated") === 0) {
            const limnitedJournals = game.journal.entities.filter(j => j.data.permission.default === CONST.ENTITY_PERMISSIONS.LIMITED);
            if (limnitedJournals > 0) {
                new Dialog({
                    "title": game.i18n.localize("PERMISSIONVIEWER.MigrationDialogTitle"),
                    "content": game.i18n.localize("PERMISSIONVIEWER.MigrationDialogTitle"),
                    "buttons": {"migrate": {"label": game.i18n.localize("PERMISSIONVIEWER.MigrationDialogLabel1"),
                                            "callback": () => {
                                                PermissionViewer.migrateLimitedToObserver();
                                                game.settings.set("permission_viewer", "migrated", 1);
                                            }
                                        },
                                "no": {"label": game.i18n.localize("PERMISSIONVIEWER.MigrationDialogLabel2"),
                                        "callback": () => {
                                                game.settings.set("permission_viewer", "migrated", 1);
                                            }
                                        },
                                },
                    "default": "migrate"
                }, {width: 600}).render(true)
            } else {
                game.settings.set("permission_viewer", "migrated", 1);
            }
        }

    }
    static directoryRendered(obj, html, data) {
        if (!game.user.isGM) return;
        const contextOptions = obj._getEntryContextOptions();
        const permissionOption = contextOptions.find(e => e.name === 'PERMISSION.Configure')

        let collection = obj.constructor.collection;
        for (let li of html.find("li.directory-item.document")) {
            li = $(li)
            let document = collection.get(li.attr("data-document-id"))
            let users = []
            for (let id in document.data.permission) {
                let permission = document.data.permission[id]
                if (permission >= CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED) {
                    let bg_color = "transparent"
                    if (id != "default") {
                        const user = game.users.get(id)
                        if (user) {
                            if (user.isGM) continue;
                            bg_color = user.data.color;
                        } else {
                            continue;
                        }
                    }
                    let user_div = $('<div></div>')
                    user_div.attr("data-user-id", id)
                    if (permission === CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED) {
                        user_div.addClass("permission-viewer-limited")
                    } else if (permission === CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER) {
                        user_div.addClass("permission-viewer-observer")
                    } else if (permission === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
                        user_div.addClass("permission-viewer-owner")
                    }
                    if (id == "default") {
                        user_div.addClass("permission-viewer-all")
                    } else {
                        user_div.addClass("permission-viewer-user")
                    }
                    user_div.css({'background-color': bg_color})
                    users.push(user_div)
                }
            }
            let div = $('<div class="permission-viewer"></div>')
            if (permissionOption) {
                if (users.length === 0) 
                    users.push($('<div><i class="fas fa-share-alt" style="color: white;"/></div>'))
                let a = $(`<a href="#"></a>`)
                div.append(a)
                a.append(...users)
            } else {
                div.append(...users)
            }
            li.append(div)
        }
        if (permissionOption)
            html.find(".permission-viewer").click(event => {
                event.preventDefault();
                event.stopPropagation();
                let li = $(event.currentTarget).closest("li")
                if (li)
                    permissionOption.callback(li)
            })
    }
    static userUpdated(user) {
        for (let user_div of $(".permission-viewer-user")) {
            let id = $(user_div).attr("data-user-id")
            if (id == user.id) {
                $(user_div).css('background-color', user.data.color)
            }
        }
    }
    async _onShowPlayers(event) {
        event.preventDefault();
        await this.submit();
        let permissions = this.object.data.permission;

        let default_permission = permissions.default || CONST.DOCUMENT_PERMISSION_LEVELS.NONE;
        if (default_permission >= CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED && !game.settings.get("permission_viewer","limitedPrompt")) {

            return this.object.show(this._sheetMode, true);
        } else {
            let sharedWith = Object.keys(permissions)
                .map(id => id == 'default' ? undefined : game.users.get(id))
                .filter(user => user && permissions[user.id] >= CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED)
            let buttons = {"show": {"label": game.i18n.localize("PERMISSIONVIEWER.ShowAll"),
                                    "callback": () => this.object.show(this._sheetMode, true)},
                            "share": {"label": game.i18n.localize("PERMISSIONVIEWER.ShareAll"),
                                        "callback": () => {
                                            // Need to do a copy of the object, otherwise, the entity itself gets changes
                                            // and the update() doesn't trigger any update on the server.
                                            permissions = duplicate(permissions);
                                            permissions["default"] = CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER;
                                            // Can't use "permission.default" otherwise it doesn't trigger a journal
                                            // directory re-render
                                            this.object.update({permission: permissions})
                                            this.object.show(this._sheetMode, true);
                                        }
                                    }
                           }
            let message = game.i18n.localize("PERMISSIONVIEWER.NotShared1") +
                game.i18n.localize("PERMISSIONVIEWER.NotShared2") +
                game.i18n.localize("PERMISSIONVIEWER.NotShared3") +
                game.i18n.localize("PERMISSIONVIEWER.NotShared4")
            if (sharedWith.length > 0) {
                message = game.i18n.localize("PERMISSIONVIEWER.SharedWith1") +
                    "<p><strong>" + sharedWith.map(u => u.name).join(", ") + "</strong></p>" +
                    game.i18n.localize("PERMISSIONVIEWER.NotShared2") +
                    game.i18n.localize("PERMISSIONVIEWER.NotShared3") +
                    game.i18n.localize("PERMISSIONVIEWER.SharedWith2") +
                    game.i18n.localize("PERMISSIONVIEWER.NotShared4")
                buttons["display"] = {"label": game.i18n.localize("PERMISSIONVIEWER.ShowList"),
                                        "callback": () => this.object.show(this._sheetMode, false)}
            }
            new Dialog({"title": game.i18n.localize("PERMISSIONVIEWER.ShowJournal"),
                        "content": message,
                        "buttons": buttons,
                        "default": "show"
                       }).render(true)
        }
    }

    static ready() {
        if (game.settings.get("permission_viewer", "migrated") === 0) {
            const limnitedJournals = game.journal.contents.filter(j => j.data.permission.default === CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED);
            if (limnitedJournals > 0) {
                new Dialog({
                    "title": "Migrate permissions from Limited to Observer",
                    "content": "<p>When sharing a journal entry with all players, <strong>Permission Viewer</strong> used to set its default permission to Limited.</p>" +
                                "<p>However, that permission does not actually make the journal entry available to players since FVTT 0.4.2</p>" +
                                "<p>Would you like to migrate and change every journal entry's default permission from <strong>Limited to Observer</strong>?</p>" +
                                "<p>If you use Limited permissions on purpose (to show Notes on a scene that cannot be opened), then don't, otherwise, you should do the migration.</p>",
                    "buttons": {"migrate": {"label": "Migrate permissions",
                                            "callback": () => {
                                                PermissionViewer.migrateLimitedToObserver();
                                                game.settings.set("permission_viewer", "migrated", 1);
                                            }
                                        },
                                "no": {"label": "Don't change permissions",
                                        "callback": () => {
                                                game.settings.set("permission_viewer", "migrated", 1);
                                            }
                                        },
                                },
                    "default": "migrate"
                }, {width: 600}).render(true)
            } else {
                game.settings.set("permission_viewer", "migrated", 1);
            }
        }
    }
    static migrateLimitedToObserver() {
        const updateData = game.journal.contents.filter(j => j.data.permission.default === CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED)
                .map(j => {return {_id: j.id, "permission.default": CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER}})
        JournalEntry.update(updateData);
    }
    static playerListRendered(){
        console.log("Permission Viewer | Player List");
        let pvUsers = game.users.contents;
        let pvIdColor = [];
        for (let x of pvUsers){

            let pvMyObject = {};
            pvMyObject.id = x.id;
            pvMyObject.color = x.data.color;
            pvIdColor.push(pvMyObject);
        }
        let pvToReplace = "border: 1px solid #000000";
        let pvReplacee = "border: 1px solid";
        for (let i = 0; i < document.getElementById("player-list").children.length ; i++ ){
            let pvString = document.getElementById("player-list").children[i].innerHTML;
            if (pvString.toString().search("inactive") > 0){
                pvString = pvString.replace(pvToReplace, (pvReplacee + pvIdColor[i].color));
                document.getElementById("player-list").children[i].innerHTML = pvString;
            }
                
        }
    }
}

Hooks.on('renderJournalDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderSceneDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderActorDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderItemDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderMacroDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderRollTableDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderCardsDirectory', PermissionViewer.directoryRendered)
Hooks.on('updateUser', PermissionViewer.userUpdated)
Hooks.on('init', PermissionViewer.init)
Hooks.on('ready', PermissionViewer.ready)
Hooks.on('renderPlayerList', PermissionViewer.playerListRendered)