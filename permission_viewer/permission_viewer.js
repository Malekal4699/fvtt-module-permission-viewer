class PermissionViewer {
    static directoryRendered(obj, html, data) {
        if (!game.user.isGM) return;
        let collection = obj.constructor.collection;
        for (let li of html.find("li.directory-item.entity")) {
            li = $(li)
            let entity = collection.get(li.attr("data-entity-id"))
            let max_width = 0;
            let users = []
            for (let id in entity.data.permission) {
                let permission = entity.data.permission[id]
                if (permission >= ENTITY_PERMISSIONS.LIMITED) {
                    let bg_color = "transparent"
                    if (id != "default") {
                        let user = game.users.get(id)
                        if (user) {
                            bg_color = user.data.color;
                        } else {
                            continue;
                        }
                    }
                    let user_div = $('<div></div>')
                    let width = 8;
                    let hyp = false;
                    user_div.attr("data-user-id", id)
                    if (permission == ENTITY_PERMISSIONS.LIMITED) {
                        user_div.addClass("permission-viewer-limited")
                        hyp = true;
                    } else if (permission == ENTITY_PERMISSIONS.OBSERVER) {
                        user_div.addClass("permission-viewer-observer")
                    } else if (permission == ENTITY_PERMISSIONS.OWNER) {
                        user_div.addClass("permission-viewer-owner")
                    }
                    if (id == "default") {
                        user_div.addClass("permission-viewer-all")
                        width = 12;
                    } else {
                        user_div.addClass("permission-viewer-user")
                    }
                    if (hyp)
                        max_width += Math.ceil(Math.sqrt(2 * width * width)) + 4;
                    else
                        max_width += width + 4;
                    user_div.css({'background-color': bg_color})
                    users.push(user_div)
                }
            }
            let div = $('<div class="permission-viewer"></div>')
            div.css("max-width", max_width)
            for (let user_div of users) {
                div.append(user_div)
            }
            li.append(div)
        }
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
        let default_permission = permissions.default || ENTITY_PERMISSIONS.NONE;
        if (default_permission >= ENTITY_PERMISSIONS.LIMITED) {
            return this.object.show(this._sheetMode, true);
        } else {
            let sharedWith = Object.keys(permissions)
                .map(id => id == 'default' ? undefined : game.users.get(id))
                .filter(user => user && permissions[user.id] >= ENTITY_PERMISSIONS.LIMITED)
            let buttons = {"show": {"label": "Show to All",
                                    "callback": () => this.object.show(this._sheetMode, true)},
                           "share": {"label": "Share with All",
                                     "callback": () => {
                                         // Need to do a copy of the object, otherwise, the entity itself gets changes
                                         // and the update() doesn't trigger any update on the server.
                                         permissions = duplicate(permissions);
                                         permissions["default"] = ENTITY_PERMISSIONS.LIMITED;
                                         // Can't use "permission.default" otherwise it doesn't trigger a journal
                                         // directory re-render
                                         this.object.update({permission: permissions})
                                         this.object.show(this._sheetMode, true);
                                     }
                                    }
                          }
            let message = "<h3>This Journal Entry is not shared with anyone.</h3>" +
                "<p>Do you want to share it with all players before showing it,</p>" +
                "<p>or do you want to show it to all players without sharing it.</p>" +
                "<p>If you decide to share it, its default permissions will be set as Limited</p>"
            if (sharedWith.length > 0) {
                message = "<h3>This Journal Entry is shared with the following players.</h3>" +
                    "<p><strong>" + sharedWith.map(u => u.name).join(", ") + "</strong></p>" +
                    "<p>Do you want to share it with all players before showing it,</p>" +
                    "<p>or do you want to show it to all players without sharing it,</p>" +
                    "<p>or do you want to show it only to the players that it is already shared with?</p>" +
                    "<p>If you decide to share it, its default permissions will be set as Limited</p>"
                buttons["display"] = {"label": "Show to list",
                                      "callback": () => this.object.show(this._sheetMode, false)}
            }
            new Dialog({"title": "Show Journal Entry to Players",
                        "content": message,
                        "buttons": buttons,
                        "default": "show"
                       }).render(true)
        }
    }

    static init() {
        JournalSheet.prototype._onShowPlayers = PermissionViewer.prototype._onShowPlayers
    }
}

Hooks.on('renderJournalDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderSceneDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderActorDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderItemDirectory', PermissionViewer.directoryRendered)
Hooks.on('updateUser', PermissionViewer.userUpdated)
Hooks.on('init', PermissionViewer.init)
