class PermissionViewer {
    static directoryRendered(obj, html, data) {
	if (!game.user.isGM) return;
	let collection = obj.constructor.collection;
	for (let li of html.find("li.directory-item")) {
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
		    user_div.attr("data-user-id", id)
		    if (permission == ENTITY_PERMISSIONS.LIMITED) {
			user_div.addClass("permission-viewer-limited")
		    } else if (permission == ENTITY_PERMISSIONS.OBSERVER) {
			user_div.addClass("permission-viewer-observer")
		    } else if (permission == ENTITY_PERMISSIONS.OWNER) {
			user_div.addClass("permission-viewer-owner")
		    }
		    if (id == "default") {
			user_div.addClass("permission-viewer-all")
			max_width += 16;
		    } else {
			user_div.addClass("permission-viewer-user")
			max_width += 12;
		    }
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
}

Hooks.on('renderJournalDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderSceneDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderActorDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderItemDirectory', PermissionViewer.directoryRendered)
Hooks.on('updateUser', PermissionViewer.userUpdated)
