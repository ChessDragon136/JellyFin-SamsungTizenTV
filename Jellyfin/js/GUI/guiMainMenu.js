var guiMainMenu = {	
		menuItems : [],
		menuItemsHomePages : [],

		pageSelected : "",
		selectedDivId : 0,
		selectedDivClass : "",
		
		selectedMainMenuItem : 0	
}

guiMainMenu.getSelectedMainMenuItem = function() {
	return this.selectedMainMenuItem;
}

//Entry Point from User Menu - ONLY RUN ONCE PER USER LOGIN
guiMainMenu.start = function() {	
	//Load user set highlight colour css
	support.loadHighlightCSS();
	
	//Unhide Hamburger Icon
	document.getElementById("bannerHamburger").className.baseVal = "bannerHamburger";

	//Generate Menu based on whether there is any of (Folders, TV, Movies, .....)
	this.menuItems.length = 0;
	this.menuItemsHomePages.length = 0;
	
	this.menuItems = guiMainMenuSupport.generateMainMenu();

	//Generate main menu items
	this.menuItemsHomePages = guiMainMenuSupport.generateTopMenu(); 
	
	//Get user details.
	document.getElementById("menuUserName").innerHTML = "<br>"+server.getUserName()+"<br><br>";
	var userURL = server.getUserURL();
	var UserData = xmlhttp.getContent(userURL);
	if (UserData == null) { return; }
	
	//User Image
	if (UserData.PrimaryImageTag) {
		var imgsrc = server.getImageURL(UserData.Id,"UsersPrimary");
		document.getElementById("menuUserImage").style.backgroundImage = "url(" + imgsrc + ")";	
	} else {
		document.getElementById("menuUserImage").style.backgroundImage = "url(images/menu/User-70x70.png)";
	}
	
	//Add menu entries
	var htmlToAdd = "";
	for (var index = 0; index < this.menuItems.length;index++) {
		htmlToAdd += "<div id='" + this.menuItems[index] + "' class='menu-item'><div id='menu-Icon' class='menu-icon' style='background-image:url(images/menu/" + this.menuItems[index] + "-46x37.png)'></div>" + this.menuItems[index].replace(/_/g, ' ')+ "</div>";	
	}	
	document.getElementById("menuItems").innerHTML = htmlToAdd;
	
	//Load Home Page
	guiHome.processHomePageMenu("Home");
}

//Entry Point when called from any page displaying the menu
guiMainMenu.requested = function(pageSelected, selectedDivId, selectedDivClass) {
	//Reset Menus
	this.selectedMainMenuItem = 0;
	
	//Save Page, ID & Class so re can reset on menu close
	this.pageSelected = pageSelected;
	this.selectedDivId = selectedDivId;
	this.selectedDivClass = selectedDivClass;
		
	//Show Menu
	document.getElementById("menu").style.visibility = "";

	//Show submenu dependant on selectedMainMenuItem
	this.updateSelectedItems();
	
	//Set Focus
	remotecontrol.setCurrentPage("guiMainMenu");
}

guiMainMenu.updateSelectedItems = function () {		
	for (var index = 0; index < this.menuItems.length; index++){	
		if (index == this.selectedMainMenuItem) {
			document.getElementById(this.menuItems[index]).className = "menu-item highlightBackground";		
		} else {
			document.getElementById(this.menuItems[index]).className = "menu-item";
		}	
    }
}

guiMainMenu.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode)
	{	
		case 38: //Up
			this.processUpKey();
			break;	
		case 40: //Down
			this.processDownKey();
			break;		
		case 13: //Enter
			this.processSelectedItems();
			break;
		case 39:  //Right
		case 10009: //Return
			event.preventDefault()
			//Allows blocking of return from menu if page has no selectable items
			this.processReturnKey();
			break;
		case 10182: //Exit
			tizen.application.getCurrentApplication().exit();
			break;
	}
}

guiMainMenu.processSelectedItems = function() {
	
	//Selecting home when you came from home just closes the menu.
	if 	(this.menuItems[this.selectedMainMenuItem] == "Home" &&
		(this.pageSelected == "guiHomeOneItem" || this.pageSelected == "guiHomeTwoItems")) {
			this.processReturnKey();
			return;
	}

    //Close the menu
	document.getElementById("menu").style.visibility = "hidden";
	
	setTimeout(function(){
		guiHome.processHomePageMenu(guiMainMenu.menuItems[guiMainMenu.selectedMainMenuItem]);
	}, 200);
}


guiMainMenu.processReturnKey = function() {
	if (this.pageSelected != null) {
		//As I don't want the settings page in the URL History I need to prevent popping it here (as its not added on leaving the settings page
		if (this.pageSelected != "guiSettings") {
			pagehistory.removeLatestURL();
		}
		
		//Cheap way to unhighlight all items!
		this.selectedMainMenuItem = -1;
		this.updateSelectedItems();
		this.selectedMainMenuItem = 0;
		
		//Close the menu
		document.getElementById("menu").style.visibility = "hidden";
		
		//Setup selected item on page
		document.getElementById(this.selectedDivId).className = this.selectedDivClass;
		remotecontrol.setCurrentPage(this.pageSelected);
	}
}

guiMainMenu.processUpKey = function() {
	this.selectedMainMenuItem--;
	if (this.selectedMainMenuItem < 0) {
		this.selectedMainMenuItem = this.menuItems.length-1;
	}
	this.updateSelectedItems();
}

guiMainMenu.processDownKey = function() {
	this.selectedMainMenuItem++;
	if (this.selectedMainMenuItem >= this.menuItems.length) {
		this.selectedMainMenuItem = 0;
	}	
	this.updateSelectedItems();
}