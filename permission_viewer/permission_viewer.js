class PermissionViewer {
    static directoryRendered(obj, html, data) {
	if (!game.user.isGM) return;
	let collection = obj.constructor.collection;
	for (let li of html.find("li.directory-item")) {
	    li = $(li)
	    let entity = collection.get(li.attr("data-entity-id"))
	    let default_permission = entity.data.permission["default"]
	    let classes = ["permission-viewer"]
	    let users = []
	    if (default_permission >= ENTITY_PERMISSIONS.OBSERVER) {
		classes.push("gradient")
		if (default_permission == ENTITY_PERMISSIONS.OWNER) {
		    classes.push("infinity-gradient")
		}
	    } else {
		for (let id in entity.data.permission) {
		    if (id != "default") {
			let user = game.users.get(id)
			if (user) {
			    let user_div = $('<div class="permission-viewer-user"></div>')
			    user_div.attr("data-user-id", id)
			    user_div.css('background', user.data.color)
			    users.push(user_div)
			}
		    }
		}
	    }
	    default_permission = entity.data.permission["default"]
	    let div = $('<div class="' + classes.join(" permission-viewer-") + '"></div>')
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
		$(user_div).css('background', user.data.color)
	    }
	}
    }
}

Hooks.on('renderJournalDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderSceneDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderActorDirectory', PermissionViewer.directoryRendered)
Hooks.on('renderItemDirectory', PermissionViewer.directoryRendered)
Hooks.on('updateUser', PermissionViewer.userUpdated)
