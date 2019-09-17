var guiSettingsLog = {
		logArray : null,
		selectedBannerItem : 0,
		topLeftItem : 0,
		
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 20,
		
		bannerItems : ["User Settings","TV Settings","Server Settings","Log","About"],
}

guiSettingsLog.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiSettingsLog.start = function() {	
	//Reset Vars
	this.selectedBannerItem = 3; //match Logs
	
	//Load Data
	this.logArray = JSON.parse(logger.loadfile());
	this.topLeftItem = this.logArray.length - guiSettingsLog.getMaxDisplay();
	this.topLeftItem = (this.topLeftItem < 0) ? 0 : this.topLeftItem;
	
	//Load Settings
	document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='bannerMenu'></div><div id='guiTV_Show_Title' class='guiPage_Settings_Title'>Log</div>\ \
		<div id='guiPage_Settings_Settings' class='guiPage_Settings_Settings'></div>";
	
	//Create Banner Items
	document.getElementById("bannerSelection").innerHTML = "";
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index != this.bannerItems.length-1) {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";			
		} else {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";					
		}
	}
	
	//Update Displayed
	this.updateDisplayedItems();
	this.updateSelectedBannerItems();
	remotecontrol.setCurrentPage("guiSettingsLog");
}

guiSettingsLog.updateDisplayedItems = function() {
	var htmlToAdd = "<table>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.logArray.length); index++) {
		htmlToAdd += "<tr><td style='word-wrap:break-word;word-break:break-all;width:1500px;'>" + this.logArray[index] + "</td></tr>";
	}
	document.getElementById("guiPage_Settings_Settings").innerHTML = htmlToAdd + "</table>";
}

guiSettingsLog.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) { //Don't put padding on the last one.
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlightText";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlightText";
			}		
		} else {
			if (index != this.bannerItems.length-1) { //Don't put padding on the last one.
				if (index == 3) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (index == 3) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
	document.getElementById("Counter").innerHTML = (this.selectedBannerItem + 1) + "/" + (this.bannerItems.length);
}

guiSettingsLog.keyDown = function() {
	var keyCode = event.keyCode;
	
	switch(keyCode) {
		case 38:	
			this.processUpKey();
			break;
		case 40:	
			this.processDownKey();
			break;	
		case 37:
			this.processLeftKey();
			break;
		case 39:
			this.processRightKey();
			break;	
		case 10009:
			event.preventDefault();
			pagehistory.processReturnURLHistory();
			break;	
		case 13:
			this.processSelectedItem();
			break;	
		case 10135:
			event.preventDefault();
			guiMainMenu.requested("guiSettingsLog",null);
			break;	
		case 10182:
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}

guiSettingsLog.processUpKey = function() {
	this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
	if (this.topLeftItem == -1) {
		this.topLeftItem = 0;
	} else {
		this.updateDisplayedItems();
	}	
}

guiSettingsLog.processDownKey = function() {
	this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
	if (this.topLeftItem > this.logArray.length - this.getMaxDisplay()) {
		this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
	} else {
		this.updateDisplayedItems();
	}
}

guiSettingsLog.processLeftKey = function() {
	this.selectedBannerItem--;
	if (this.selectedBannerItem < 0) {
		this.selectedBannerItem = 0;
		this.openMenu();
	} else {
		this.updateSelectedBannerItems();	
	}	
}

guiSettingsLog.openMenu = function() {
	document.getElementById("bannerItem0").className = "bannerItem bannerItemPadding";
	guiMainMenu.requested("guiSettingsLog","bannerItem0","bannerItem bannerItemPadding green");
}

guiSettingsLog.processRightKey = function() {
	this.selectedBannerItem++;
	if (this.selectedBannerItem >= this.bannerItems.length) {
		this.selectedBannerItem--;
	} else {
		this.updateSelectedBannerItems();	
	}
}

guiSettingsLog.processSelectedItem = function() {
	if (this.bannerItems[this.selectedBannerItem] == "About") {
		pagehistory.updateURLHistory("GuiPage_Settings",null,null,null,null,0,0,null);
		guiContributors.start();
	} else if (this.bannerItems[this.selectedBannerItem] != "Log") {
		guiSettings.start(this.bannerItems[this.selectedBannerItem]);
	}
}