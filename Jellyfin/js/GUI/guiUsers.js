var guiUsers = {
	UserData : null,
	
	selectedUser : 0,
	selectedRow : 0,
	topLeftItem : 0, 
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
}

guiUsers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiUsers.start = function() {
	//Reset Properties
	this.selectedUser = 0;
	this.selectedRow = 0;
	this.topLeftItem = 0; 
	
	pagehistory.destroyURLHistory();
	
	//Load Data
	var url = server.getserverAddr() + '/Users/Public?format=json';
	this.UserData = xmlhttp.getContent(url);
	if (this.UserData == null) { 
		return; 
	}

	//Change Display
	//Must reset bannerMenu as this can be called from users loggin out
	document.getElementById("bannerHamburger").className.baseVal = "bannerHamburger bannerHamburgerHidden";
	document.getElementById('bannerSelection').innerHTML = "";
	document.getElementById("pageBackground").style.backgroundImage = "";
	
	document.getElementById("pageContent").innerHTML = "<div style='padding-top:100px;text-align:center'>" +
			"<div id=guiUsers_allusers></div>" +
	    	"<div id='guiServerUsers-Options' class='guiServerUsers-Options'>" +
	    		"<div id='ManualLogin'>Manual Login</div>" +
	    		"<div id='ChangeServer'>Change Server</div> " +
	    		"<div><br>Available options for each page are shown at the bottom.<br>Once logged in, move left on any page to access the main menu.</div>" +
	    	"</div></div>";
		
	if (this.UserData.length != 0) {
		guiUsers.updateDisplayedUsers();
		guiUsers.updateSelectedUser();
			
			
		remotecontrol.setCurrentPage("guiUsers");
	} else {
		//Probably need some padding here to make it look nice!
		remotecontrol.setCurrentPage("guiUsers");
	}	
}

guiUsers.updateDisplayedUsers = function() {
	
	var htmltoadd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(),this.UserData.length)); index++) {
		if (this.UserData[index].PrimaryImageTag) {			
			var imgsrc = server.getImageURL(this.UserData[index].Id,"UsersPrimary",this.UserData[index].PrimaryImageTag);
			htmltoadd += "<div id=" + this.UserData[index].Id + " style='background-image:url(" +imgsrc+ ");'><div class=displayedItem-TitleContainer>"+ this.UserData[index].Name + "</div></div>";
		} else {
			htmltoadd += "<div id=" + this.UserData[index].Id + " style='background-image:url(images/guiUsersNoImage.png);'><div class=displayedItem-TitleContainer>"+ this.UserData[index].Name + "</div></div>";
		}	
    }
		
	//Set Content to Server Data
	document.getElementById("guiUsers_allusers").innerHTML = htmltoadd;
}

//Function sets CSS Properties so show which user is selected
guiUsers.updateSelectedUser = function () {	
	support.updateSelectedNEW(this.UserData,this.selectedUser,this.topLeftItem,
			Math.min(this.topLeftItem + guiUsers.getMaxDisplay(),this.UserData.length),"User Selected highlightBorder","User","");
}

//Function executes on the selection of a user - should log user in or generate error message on screen
guiUsers.processSelectedUser = function () {
	var selectedUserId = this.UserData[this.selectedUser].Id;

	//Remove Focus & Display Loading
	remotecontrol.setCurrentPage("NoItems");

	//Load JSON File
	var userInFile = false;
	var serverEntry = filesystem.getServerEntry();
	var configJSON = filesystem.getConfigJSON();
    if (configJSON.Servers[serverEntry].Users.length > 0) {	
    	for (var index = 0; index < configJSON.Servers[serverEntry].Users.length; index++) {
    		var UserId = configJSON.Servers[serverEntry].Users[index].UserId;
    		if (UserId == selectedUserId){
    			userInFile = true;
    			var User = configJSON.Servers[serverEntry].Users[index].UserName;
    			var Password = configJSON.Servers[serverEntry].Users[index].Password;
    					
    			//Authenticate with MB3 - if fail somehow bail?					
				var authenticateSuccess = xmlhttp.Authenticate(UserId, User, Password);		
				if (authenticateSuccess) {
					//Set File User Entry
					filesystem.setUserEntry(index);
					//Change Focus and call function in guiMain to initiate the page!
					guiMainMenu.start();
				} else {
					//What needs to happen here?
					guiUsersManual.start(configJSON.Servers[serverEntry].Users[index].UserName,configJSON.Servers[serverEntry].Users[index].RememberPassword);
				}
				break;
    		}  		
    	}		
    }
	if (userInFile == false){
		if (this.UserData[this.selectedUser].HasPassword) {
			//Sadly HasPassword Returns true even if password is blank
			//May as well try blank password to save user time!	
			var authenticateSuccess = xmlhttp.Authenticate(null, this.UserData[this.selectedUser].Name, "");		
			//Hide loading
			if (authenticateSuccess) {
				//Add Username & Password to DB
				filesystem.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,"",true);
				//Change Focus and call function in guiMain to initiate the page!
				guiMainMenu.start();
			} else {
				//Pass off to guiusers manual
				guiUsersManual.start(this.UserData[this.selectedUser].Name,false);
			}
		} else {
			var authenticateSuccess = xmlhttp.Authenticate(this.UserData[this.selectedUser].Id, this.UserData[this.selectedUser].Name, "");		
			//Hide loading
			if (authenticateSuccess) {
				//Add Username & Password to DB
				filesystem.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,"",true);
				//Change Focus and call function in guiMain to initiate the page!
				guiMainMenu.start();
			} else {
				alert ("failed");
				remotecontrol.setCurrentPage("guiUsers");
				//Div to display Network Failure - No password therefore no password error
				//This event should be impossible under normal circumstances
			}
		}
	}
	

}

guiUsers.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode)
	{
		case 38: //Up
			this.selectedRow--;
			if (this.selectedRow < 1) {
				this.selectedRow = 0;
				document.getElementById("ManualLogin").className = "offWhite";
				guiUsers.updateSelectedUser();
			} else if (this.selectedRow == 1) {
				document.getElementById("ManualLogin").className = "highlightText";
				document.getElementById("ChangeServer").className = "offWhite";
				document.getElementById(this.UserData[this.selectedUser].Id).className = "User"; 
			} else if (this.selectedRow == 2) {
				document.getElementById("ManualLogin").className = "offWhite";
				document.getElementById("ChangeServer").className = "highlightText";
			}
			break;
		case 40: //Down
			this.selectedRow++;
			if (this.selectedRow == 1) {
				document.getElementById("ManualLogin").className = "highlightText";
				document.getElementById("ChangeServer").className = "offWhite";
				document.getElementById(this.UserData[this.selectedUser].Id).className = "User"; 
			} else if (this.selectedRow > 1) {
				this.selectedRow = 2;
				document.getElementById("ManualLogin").className = "offWhite";
				document.getElementById("ChangeServer").className = "highlightText";
			}
			break;
		case 37: //Left
			if (this.selectedRow == 0) {
				this.selectedUser--;
				if (this.selectedUser < 0) {
					this.selectedUser = this.UserData.length - 1;
					if(this.UserData.length > this.MAXCOLUMNCOUNT) {
						this.topLeftItem = (this.selectedUser-2);
						guiUsers.updateDisplayedUsers();
					} else {
						this.topLeftItem = 0;
					}
				} else {
					if (this.selectedUser < this.topLeftItem) {
						this.topLeftItem--;
						if (this.topLeftItem < 0) {
							this.topLeftItem = 0;
						}
						guiUsers.updateDisplayedUsers();
					}
				}
				guiUsers.updateSelectedUser();
			}
			break;
		case 39: //Right
			if (this.selectedRow == 0) {
				this.selectedUser++;
				if (this.selectedUser >= this.UserData.length) {
					this.selectedUser = 0;
					this.topLeftItem = 0;
					guiUsers.updateDisplayedUsers();
				} else {
					if (this.selectedUser >= this.topLeftItem+this.getMaxDisplay() ) {
						this.topLeftItem++;
						guiUsers.updateDisplayedUsers();
					}
				}
				guiUsers.updateSelectedUser();
			}
			break;
		case 13: //Enter
			if (this.selectedRow == 0) {
				guiUsers.processSelectedUser();
			} else if (this.selectedRow == 1) {
				guiUsersManual.start();
			} else if (this.selectedRow == 2) {
				guiServer.start();
			}
			break;	
		case 10009:
			logger.log ("RETURN KEY",1);
			event.preventDefault()
        	guiUsers.start();
			break;
		case 10182:
			logger.log ("EXIT KEY",1);
			tizen.application.getCurrentApplication().exit()
			break;
	}
};