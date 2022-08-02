class OwnershipViewer {

    // Creates and applies the OwnershipViewer div to each document in a directory - called when each directory renders.
    static directoryRendered(obj, html, data) {
        // If user isn't a GM, don't continue
        if (!game.user.isGM) return;                                                        

        // Get the current directory's right-click context options, then tore the ownership config option
        const contextOptions = obj._getEntryContextOptions();                               
        const ownershipOption = contextOptions.find(e => e.name === 'OWNERSHIP.Configure')

        // Gather all documents in the current directory
        let collection = obj.constructor.collection;

        // Interate through each directory list item.
        for (let li of html.find("li.directory-item.document")) {                           
            
            // Match it to the corresponding document
            li = $(li)
            let document = collection.get(li.attr("data-document-id"))     
            let users = []
            
            // Iterate through each ownership definition on the document
            for (let id in document.ownership) {
                let ownership = document.ownership[id]   
                
                // If the ownership definition isn't 'None'...
                if (ownership >= CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) {
                    let bg_color = "transparent"
                    
                    // And if the ownership definition isn't 'All Players' (default) or a GM, set 'bg_color' to the user's color
                    if (id != "default") {
                        const user = game.users.get(id)
                        if (user) {
                            if (user.isGM) continue;
                            bg_color = user.color;
                        } else {
                            continue;
                        }
                    }
                    // Create the div for this ownership definition, with the appropriate class based on the ownership level
                    let user_div = $('<div></div>')
                    user_div.attr("data-user-id", id)
                    
                    if (ownership === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) {
                        user_div.addClass("ownership-viewer-limited")
                    } else if (ownership === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
                        user_div.addClass("ownership-viewer-observer")
                    } else if (ownership === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
                        user_div.addClass("ownership-viewer-owner")
                    }
                    
                    if (id == "default") {
                        user_div.addClass("ownership-viewer-all")
                    } else {
                        user_div.addClass("ownership-viewer-user")
                    }
                    
                    user_div.css({'background-color': bg_color})
                    
                    // Store the resulting div and keep iterating through the other ownership definitions on the document
                    users.push(user_div)
                }
            }

            let div = $('<div class="ownership-viewer"></div>')
            
            // Append the collection of divs to the document's list item, or add the 'none set' icon if empty
            if (ownershipOption) {
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
        
        // Ensure any clicks on the OwnershipViewer div open the ownership config for that document
        if (ownershipOption)
            html.find(".ownership-viewer").click(event => {
                event.preventDefault();
                event.stopPropagation();
                let li = $(event.currentTarget).closest("li")
                if (li)
                    ownershipOption.callback(li)
            })
    }

    // Update the user color in OwnershipViewer divs if the user is edited
    static userUpdated(user) {
        for (let user_div of $(".ownership-viewer-user")) {
            let id = $(user_div).attr("data-user-id")
            if (id == user.id) {
                $(user_div).css('background-color', user.color)
            }
        }
    }

    // Makes the color assigned to each player clearer in the player list if they are inactive.
    static playerListRendered(){
        console.log("Ownership Viewer | Player List");
        let pvUsers = game.users.contents;
        let pvIdColor = [];
        for (let x of pvUsers){

            let pvMyObject = {};
            pvMyObject.id = x.id;
            pvMyObject.color = x.color;
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

Hooks.on('renderJournalDirectory', OwnershipViewer.directoryRendered)
Hooks.on('renderSceneDirectory', OwnershipViewer.directoryRendered)
Hooks.on('renderActorDirectory', OwnershipViewer.directoryRendered)
Hooks.on('renderItemDirectory', OwnershipViewer.directoryRendered)
Hooks.on('renderMacroDirectory', OwnershipViewer.directoryRendered)
Hooks.on('renderRollTableDirectory', OwnershipViewer.directoryRendered)
Hooks.on('renderCardsDirectory', OwnershipViewer.directoryRendered)
Hooks.on('updateUser', OwnershipViewer.userUpdated)
Hooks.on('renderPlayerList', OwnershipViewer.playerListRendered)