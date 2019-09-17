var guiServer = {
	ServerData : null,
	
	selectedItem : 0,
	topLeftItem : 0,
	isAddButton : false,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
}

guiServer.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiServer.start = function() {
	//Reset Properties
	this.selectedItem = 0;
	this.topLeftItem = 0; 
	this.isAddButton = false;
	
	//Load Data
	this.ServerData = filesystem.getConfigJSON();
	if (this.ServerData.Servers.length == 0) {
		//Should never happen - Redirect to 
		guiServerNew.start();
	} else {    	
		//Change Display
		document.getElementById("pageContent").innerHTML = "<div style='padding-top:60px;text-align:center'> \
			<div id=guiServer_allusers></div>" +
					"<div style='text-align:center' class='guiServerUsers-Options' >" +
					"<p style='margin-top:50px' id=guiServer_addnew class='guiServer_addnew'>Add a New Server</p>" +
					"<p style='margin-top:15px'>Use the  <span style='color: red'>RED</span> button to set the selected server as the default auto connect server</p>" +
					"<p>Use the <span style='color: #2ad'>BLUE</span> button to delete the selected server</p></div>";
				
		this.updateDisplayedUsers();
		this.updateSelectedUser();
		
		//Set focus to element in Index that defines keydown method! This enables keys to work :D
		remotecontrol.setCurrentPage("guiServer");
	}

}

guiServer.updateDisplayedUsers = function() {
	var htmltoadd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(),this.ServerData.Servers.length)); index++) {
		htmltoadd += "<div id=" + this.ServerData.Servers[index].Id + " style=background-image:url(images/server.png)><div class=menuItem>"+ this.ServerData.Servers[index].Name + "</div></div>";
    }
		
	//Set Content to Server Data
	document.getElementById("guiServer_allusers").innerHTML = htmltoadd;
}

//Function sets CSS Properties so show which user is selected
guiServer.updateSelectedUser = function () {	
	support.updateSelectedNEW(this.ServerData.Servers,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + guiServer.getMaxDisplay(),this.ServerData.Servers.length),"User Selected highlightBorder","User","");
}

//Function executes on the selection of a user - should log user in or generate error message on screen
guiServer.processSelectedUser = function () {
	if (this.isAddButton == true) {
		guiServerNew.start();
	} else {
		filesystem.setServerEntry(this.selectedItem);
		xmlhttp.testConnectionSettings(this.ServerData.Servers[this.selectedItem].Path,true);
	}
}

guiServer.keyDown = function()
{
	var keyCode = event.keyCode;
	switch(keyCode)
	{
		case 10009:
			widgetAPI.sendReturnEvent();
			break;
		case 37:
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = this.ServerData.Servers.length - 1;
				if(this.ServerData.Servers.length > this.MAXCOLUMNCOUNT) {
					this.topLeftItem = (this.selectedItem-2);
					this.updateDisplayedUsers();
				} else {
					this.topLeftItem = 0;
				}
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case 39:
			this.selectedItem++;
			if (this.selectedItem >= this.ServerData.Servers.length) {
				this.selectedItem = 0;
				this.topLeftItem = 0;
				this.updateDisplayedUsers();
			} else {
				if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
					this.topLeftItem++;
					this.updateDisplayedUsers();
				}
			}
			this.updateSelectedUser();
			break;
		case 40:
			this.isAddButton = true;
			document.getElementById(this.ServerData.Servers[this.selectedItem].Id).className = "User";
			document.getElementById("guiServer_addnew").style.color="green";
			break;
		case 38:
			this.isAddButton = false;
			document.getElementById(this.ServerData.Servers[this.selectedItem].Id).className = "User Selected";
			document.getElementById("guiServer_addnew").style.color="#f9f9f9";
			break;	
		case 13:
			guiServer.processSelectedUser();
			break;	
		case 403:
			File.setDefaultServer(this.selectedItem);
			break;
		case 405:
			File.deleteSettingsFile();
			tizen.application.getCurrentApplication().exit();
		case 406:
			File.deleteServer(this.selectedItem);
			break;
		case 10182:
			tizen.application.getCurrentApplication().exit();
			break;
		default:
			break;
	}
};