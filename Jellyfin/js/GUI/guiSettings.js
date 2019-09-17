var guiSettings= {
		AllData : null,
		UserData : null,
		serverUserData : null,

		selectedItem : 0,
		currentPage : 0,
		selectedBannerItem : -1,
		selectedSubItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 10,
		
		bannerItems : ["User Settings","TV Settings","Server Settings","Log","About"],
		currentView : null,
		currentViewSettings : null,
		currentViewSettingsName : null,
		currentViewSettingsDefaults : null,
		
		CurrentSubSettings : [],
		CurrentSettingValue : null,	
}

guiSettings.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiSettings.start = function(viewToDisplay) {		
	//Reset Vars
	this.selectedItem = 0;
	this.currentPage = 0;
	this.selectedBannerItem = -1;
	this.selectedSubItem = 0;
	this.topLeftItem = 0;
	
	//Load Data
	this.AllData = filesystem.getConfigJSON();
	this.UserData = this.AllData.Servers[filesystem.getServerEntry()].Users[filesystem.getUserEntry()];
	
	//Load server Data for User
	var userURL = server.getserverAddr() + "/Users/" + server.getUserID() + "?format=json";
	this.serverUserData = xmlhttp.getContent(userURL);
	if (this.serverUserData == null) { return; }
	
	document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='bannerMenu'></div><div id='guiTV_Show_Title' class='guiSettings_Title'></div>" +
		"<div id='guiSettings_Settings' class='guiSettings_Settings'></div>" +
		"<div id='guiSettings_Overview' class='guiSettings_Overview'>" +
			"<div id=guiSettings_Overview_Title></div>" +
			"<div id=guiSettings_Overview_Content></div>" +
		"</div>";
	
	//Create Banner Items
	document.getElementById("bannerSelection").innerHTML = "";
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index != this.bannerItems.length-1) {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";			
		} else {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";					
		}
	}

	//Set default view as the User Settings Page
	if (viewToDisplay == null || viewToDisplay === undefined || viewToDisplay == "User Settings") {
		this.currentView = "User Settings";
		this.currentPage = 0;
		this.currentViewSettings = usersettings.Settings;
		this.currentViewSettingsName = usersettings.SettingsName;
		this.currentViewSettingsDefaults = usersettings.SettingsDefaults;
		document.getElementById("guiTV_Show_Title").innerHTML = "User Settings for "+this.UserData.UserName;
	} else if (viewToDisplay == "TV Settings") {
		this.currentView = "TV Settings";
		this.currentPage = 1;
		this.currentViewSettings = usersettings.TVSettings;
		this.currentViewSettingsName = usersettings.TVSettingsName;
		this.currentViewSettingsDefaults = usersettings.TVSettingsDefaults;
		document.getElementById("guiTV_Show_Title").innerHTML = "TV Settings for " + server.getDevice();
	} else {
		//Set default view as the User Settings Page
		this.currentView = "Server Settings";
		this.currentPage = 2;
		this.currentViewSettings = usersettings.ServerSettings;
		this.currentViewSettingsName = usersettings.ServerSettingsName;
		this.currentViewSettingsDefaults = usersettings.ServerSettingsDefaults;
		document.getElementById("guiTV_Show_Title").innerHTML = "Server Settings for "+this.UserData.UserName;	
	}
	
	//Update Displayed & Updates Settings
	this.updateDisplayedItems();
	this.updateSelectedItems();
	this.updateSelectedBannerItems();
	
	remotecontrol.setCurrentPage("guiSettings");
	
}

guiSettings.updateDisplayedItems = function() {
	var htmlToAdd = "<table class=guiSettingsTable>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.currentViewSettings.length); index++) {
		//Finds the setting in the file and generates the correct current set value
		//Only needs new entries here if they have differing settings (true false is top so works for many settings)
		var Setting = "";
		switch (this.currentViewSettings[index]) {
		case "SkipShow":
		case "AutoPlay":
		case "ShowDisc":	
		case "LargerView":
			for (var index2 = 0; index2 < usersettings.DefaultValues.length; index2++) {
				if (usersettings.DefaultValues[index2] == this.UserData[this.currentViewSettings[index]]) {
					Setting = usersettings.DefaultOptions[index2];
					break;
				}
			}
			break;
		case "View1":
			for (var index2 = 0; index2 < usersettings.View1Values.length; index2++) {				
				if (usersettings.View1Values[index2] == this.UserData.View1) {
					Setting = usersettings.View1Options[index2];
					break;
				}
			}
			break;
		case "View2":
			for (var index2 = 0; index2 < usersettings.View2Values.length; index2++) {
				if (usersettings.View2Values[index2] == this.UserData.View2) {
					Setting = usersettings.View2Options[index2];
					break;
				}
			}
			break;
		case "HighlightColour":
			for (var index2 = 0; index2 < usersettings.HighlightColourValues.length; index2++) {			
				if (usersettings.HighlightColourValues[index2] == this.UserData.HighlightColour) {
					Setting = usersettings.HighlightColourOptions[index2];
					break;
				}
			}
			break;
		case "SubtitleSize":
			for (var index2 = 0; index2 < usersettings.SubtitleSizeValues.length; index2++) {
				if (usersettings.SubtitleSizeValues[index2] == this.UserData.SubtitleSize) {
					Setting = usersettings.SubtitleSizeOptions[index2];
					break;
				}
			}
			break;	
		case "SubtitleColour":
			for (var index2 = 0; index2 < usersettings.SubtitleColourValues.length; index2++) {
				if (usersettings.SubtitleColourValues[index2] == this.UserData.SubtitleColour) {
					Setting = usersettings.SubtitleColourOptions[index2];
					break;
				}
			}
			break;	
		case "ClockOffset":
			for (var index2 = 0; index2 < usersettings.ClockOffsetValues.length; index2++) {
				if (usersettings.ClockOffsetValues[index2] == this.AllData.TV.ClockOffset) {
					Setting = usersettings.ClockOffsetOptions[index2];
					break;
				}
			}
			break;
		case "ItemPaging":	
			for (var index2 = 0; index2 < usersettings.ItemPagingValues.length; index2++) {
				if (usersettings.ItemPagingValues[index2] == this.AllData.TV.ItemPaging) {
					Setting = usersettings.ItemPagingOptions[index2];
					break;
				}
			}
			break;		
		case "Bitrate":
			for (var index2 = 0; index2 < usersettings.TvConnectionValues.length; index2++) {
				if (usersettings.TvConnectionValues[index2] == this.AllData.TV.Bitrate) {
					Setting = usersettings.TvConnectionOptions[index2];
					break;
				}
			}
			break;	
		case "DefaultAudioLang":
			for (var index2 = 0; index2 < usersettings.LanguageValues.length; index2++) {
				if (usersettings.LanguageValues[index2] == this.serverUserData.Configuration.AudioLanguagePreference) {
					Setting = usersettings.LanguageOptions[index2];
					break;
				}
			}
			if (Setting == "") {
				Setting = this.serverUserData.Configuration.AudioLanguagePreference
			}
			break;
		case "PlayDefaultAudioTrack":
			for (var index2 = 0; index2 < usersettings.DefaultValues.length; index2++) {
				if (usersettings.DefaultValues[index2] == this.serverUserData.Configuration.PlayDefaultAudioTrack) {
					Setting = usersettings.DefaultOptions[index2];
					break;
				}
			}
			break;	
		case "DefaultSubtitleLang":
			for (var index2 = 0; index2 < usersettings.LanguageValues.length; index2++) {
				if (usersettings.LanguageValues[index2] == this.serverUserData.Configuration.SubtitleLanguagePreference) {
					Setting = usersettings.LanguageOptions[index2];
					break;
				}
			}
			if (Setting == "") {
				Setting = this.serverUserData.Configuration.SubtitleLanguagePreference
			}
			break;	
		case "SubtitleMode":
			for (var index2 = 0; index2 < usersettings.SubtitleModeValues.length; index2++) {
				if (usersettings.SubtitleModeValues[index2] == this.serverUserData.Configuration.SubtitleMode) {
					Setting = usersettings.SubtitleModeOptions[index2];
					break;
				}
			}
			break;
		case "DisplayMissingEpisodes":
			for (var index2 = 0; index2 < usersettings.DefaultValues.length; index2++) {
				if (usersettings.DefaultValues[index2] == this.serverUserData.Configuration.DisplayMissingEpisodes) {
					Setting = usersettings.DefaultOptions[index2];
					break;
				}
			}
			break;
		case "HidePlayedInLatest":
			for (var index2 = 0; index2 < usersettings.DefaultValues.length; index2++) {
				if (usersettings.DefaultValues[index2] == this.serverUserData.Configuration.HidePlayedInLatest) {
					Setting = usersettings.DefaultOptions[index2];
					break;
				}
			}
			break;			
		}
		htmlToAdd += "<tr class=guiSettingsRow><td id="+index+">" + this.currentViewSettingsName[index] + "</td><td id=Value"+index+" class='guiSettingsTD'>"+Setting+"</td></tr>";
	}
	document.getElementById("guiSettings_Settings").innerHTML = htmlToAdd + "</table>";
}

guiSettings.updateSelectedItems = function() {
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.currentViewSettings.length); index++) {
		if (index == this.selectedItem) {
			document.getElementById(index).className = "guiSettingsTD highlightBackground";
		} else {
			document.getElementById(index).className = "guiSettingsTD";
		}
	}
	
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem + 1) + "/" + (this.bannerItems.length);
	} else {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + (this.currentViewSettingsName.length);
		usersettings.setOverview(this.currentViewSettings[this.selectedItem]);
	}		
}

guiSettings.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) { //Don't put padding on the last one.
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlightText";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlightText";
			}		
		} else {
			if (index != this.bannerItems.length-1) { //Don't put padding on the last one.
				if (index == this.currentPage) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (index == this.currentPage) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
	//Update the counter in the bottom left.
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem + 1) + "/" + (this.bannerItems.length);
	} else {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + (this.currentViewSettingsName.length);
		usersettings.setOverview(this.currentViewSettings[this.selectedItem]);
	}
}

guiSettings.processSelectedItem = function() {	
	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "User Settings":
			this.currentPage = 0;
			this.currentViewSettings = usersettings.Settings;
			this.currentViewSettingsName = usersettings.SettingsName;
			this.currentViewSettingsDefaults = usersettings.SettingsDefaults;
			document.getElementById("guiTV_Show_Title").innerHTML = "User Settings for "+this.UserData.UserName;
			break;
		case "TV Settings":
			this.currentPage = 1;
			this.currentViewSettings = usersettings.TVSettings;
			this.currentViewSettingsName = usersettings.TVSettingsName;
			this.currentViewSettingsDefaults = usersettings.TVSettingsDefaults;
			document.getElementById("guiTV_Show_Title").innerHTML = "TV Settings for " + server.getDevice();
			break;				
		case "Server Settings":
			this.currentPage = 2;
			this.currentViewSettings = usersettings.ServerSettings;
			this.currentViewSettingsName = usersettings.ServerSettingsName;
			this.currentViewSettingsDefaults = usersettings.ServerSettingsDefaults;
			document.getElementById("guiTV_Show_Title").innerHTML = "Server Settings for "+this.UserData.UserName;
			break;
		case "Log":
			guiSettingsLog.start();
			return;
			break;
		case "About":
			pagehistory.updateURLHistory("guiSettings",null,null,0,0,null);
			guiSettingsContrib.start();
			return;
			break;
		}
		//Set Current View - needed to write to file
		this.currentView = this.bannerItems[this.selectedBannerItem];
		
		//Update Displayed & Updates Settings
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateDisplayedItems();
		this.updateSelectedItems();
		this.updateSelectedBannerItems();
	} else {
		document.getElementById(this.selectedItem).className = "guiSettingsTD guiSetting_SubSelected";
		document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD highlightBackground";
		
		switch (this.currentViewSettings[this.selectedItem]) {
		case "SkipShow":	
		case "AutoPlay":
		case "DisplayMissingEpisodes":
		case "PlayDefaultAudioTrack":
		case "ShowDisc":	
		case "LargerView":
		case "HidePlayedInLatest":
			this.CurrentSubSettings = usersettings.DefaultOptions;
			break;
		case "View1":
			this.CurrentSubSettings = usersettings.View1Options;
			break;
		case "View2":
			this.CurrentSubSettings = usersettings.View2Options;
			break;
		case "HighlightColour":
			this.CurrentSubSettings = usersettings.HighlightColourOptions;
			break;
		case "SubtitleSize":
			this.CurrentSubSettings = usersettings.SubtitleSizeOptions;
			break;	
		case "SubtitleColour":
			this.CurrentSubSettings = usersettings.SubtitleColourOptions;
			break;	
		case "ClockOffset":
			this.CurrentSubSettings = usersettings.ClockOffsetOptions;
			break;	
		case "ItemPaging":
			this.CurrentSubSettings = usersettings.ItemPagingOptions;
			break;	
		case "Bitrate":
			this.CurrentSubSettings = usersettings.TvConnectionOptions;
			break;
		case "DefaultAudioLang":
		case "DefaultSubtitleLang":	
			this.CurrentSubSettings = usersettings.LanguageOptions;
			break;	
		case "SubtitleMode":
			this.CurrentSubSettings = usersettings.SubtitleModeOptions;
			break;	
		}
		
		//Set the selectedSubItem to the existing setting
		this.selectedSubItem = 0;
		this.CurrentSettingValue = document.getElementById("Value"+this.selectedItem).innerHTML;
		
		for (var index = 0; index < this.CurrentSubSettings.length; index++) {
			if (this.CurrentSubSettings[index] == this.CurrentSettingValue) {
				this.selectedSubItem = index;
				break;
			}
		}		
		remotecontrol.setCurrentPage("guiSettingsBottom");
	}
};
 

guiSettings.keyDown = function() {
	var keyCode = event.keyCode;
	
	switch(keyCode) {
		//Need Logout Key
		case 38:
			logger.log("UP");	
			this.processUpKey();
			break;
		case 40:
			logger.log("DOWN");	
			this.processDownKey();
			break;	
		case 37:
			logger.log("LEFT");	
			this.processLeftKey();
			break;
		case 39:
			logger.log("RIGHT");	
			this.processRightKey();
			break;	
		case 10009:
			logger.log("RETURN");
			event.preventDefault();
			pagehistory.processReturnURLHistory();
			break;	
		case 13:
			logger.log("ENTER");
			this.processSelectedItem();
			break;	
		case 10135:
			event.preventDefault();
			this.openMenu();
			break;	
		case 10182:
			logger.log ("EXIT KEY");
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}

guiSettings.openMenu = function() {
	if (this.selectedItem == -1) {
		if (this.currentPage == 0){
			document.getElementById("bannerItem0").className = "bannerItem bannerItemPadding offWhite";
		} else {
			document.getElementById("bannerItem0").className = "bannerItem bannerItemPadding";
		}
		guiMainMenu.requested("guiSettings","bannerItem0","bannerItem bannerItemPadding highlightText");
	} else {
		document.getElementById(this.selectedItem).className = "guiSettingsTD guiSetting_UnSelected";
		guiMainMenu.requested("guiSettings",this.selectedItem,"guiSettingsTD highlightBackground");
	}
}

guiSettings.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem == -2) {
		this.selectedItem = -1;
	} else if (this.selectedItem == -1) {
		this.selectedBannerItem = 0;
		this.updateSelectedItems();
		this.updateSelectedBannerItems();
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}	
}

guiSettings.processDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.currentViewSettings.length) {
			this.selectedItem = (this.currentViewSettings.length-1);
			if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
				this.updateDisplayedItems();
			}
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}
	}
	this.updateSelectedItems();
}

guiSettings.processLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem == -1) {
			this.selectedBannerItem = 0;
			this.openMenu();
		} else {
			this.updateSelectedBannerItems();	
		}	
	} else {
		this.openMenu();
	}
}

guiSettings.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		} else {
			this.updateSelectedBannerItems();	
		}
	} else {
		this.processSelectedItem();
	}
}

//------------------------------------------------------------------------------------------------------------------------

guiSettings.processSelectedSubItem = function() {
	switch (this.currentViewSettings[this.selectedItem]) {
	case "SkipShow":
	case "AutoPlay":
	case "ShowDisc":	
	case "LargerView":
		this.UserData[this.currentViewSettings[this.selectedItem]] = usersettings.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.DefaultOptions[this.selectedSubItem];
		break;
	case "View1":
		this.UserData.View1 = usersettings.View1Values[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.View1Options[this.selectedSubItem];	
		break;
	case "View2":
		this.UserData.View2 = usersettings.View2Values[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.View2Options[this.selectedSubItem];
		break;
	case "HighlightColour":
		this.UserData.HighlightColour = usersettings.HighlightColourValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.HighlightColourOptions[this.selectedSubItem];
		support.unloadHighlightCSS();
		support.loadHighlightCSS(this.UserData.HighlightColour);
		break;
	case "SubtitleSize":
		this.UserData.SubtitleSize = usersettings.SubtitleSizeValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.SubtitleSizeOptions[this.selectedSubItem];
		break;
	case "SubtitleColour":
		this.UserData.SubtitleColour = usersettings.SubtitleColourValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.SubtitleColourOptions[this.selectedSubItem];
		break;	
	case "ClockOffset":
		this.AllData.TV.ClockOffset = usersettings.ClockOffsetValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.ClockOffsetOptions[this.selectedSubItem];
		break;
	case "Bitrate":
		this.AllData.TV.Bitrate = usersettings.TvConnectionValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.TvConnectionOptions[this.selectedSubItem];
		break;
	case "ItemPaging":
		this.AllData.TV.ItemPaging = usersettings.ItemPagingValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.ItemPagingOptions[this.selectedSubItem];
		break;	
	case "DefaultAudioLang":
		this.serverUserData.Configuration.AudioLanguagePreference = usersettings.LanguageValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.LanguageOptions[this.selectedSubItem];
		
		//Update server	
		server.updateUserConfiguration(JSON.stringify(this.serverUserData.Configuration));
		break;	
	case "PlayDefaultAudioTrack":
		this.serverUserData.Configuration.PlayDefaultAudioTrack = usersettings.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.DefaultOptions[this.selectedSubItem];
		
		//Update server	
		server.updateUserConfiguration(JSON.stringify(this.serverUserData.Configuration));
		break;	
	case "DefaultSubtitleLang":
		this.serverUserData.Configuration.SubtitleLanguagePreference = usersettings.LanguageValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.LanguageOptions[this.selectedSubItem];
		
		//Update server	
		server.updateUserConfiguration(JSON.stringify(this.serverUserData.Configuration));
		break;		
	case "SubtitleMode":
		this.serverUserData.Configuration.SubtitleMode = usersettings.SubtitleModeValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.SubtitleModeOptions[this.selectedSubItem];
		
		//Update server	
		server.updateUserConfiguration(JSON.stringify(this.serverUserData.Configuration));
		break;	
	case "DisplayMissingEpisodes":
		this.serverUserData.Configuration.DisplayMissingEpisodes = usersettings.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.DefaultOptions[this.selectedSubItem];
			
		//Update server	
		server.updateUserConfiguration(JSON.stringify(this.serverUserData.Configuration));
		break;	
	case "HidePlayedInLatest":
		this.serverUserData.Configuration.HidePlayedInLatest = usersettings.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = usersettings.DefaultOptions[this.selectedSubItem];
				
		//Update server	
		server.updateUserConfiguration(JSON.stringify(this.serverUserData.Configuration));
		break;
	}
	
	//Rejoin User to Alldata and save 
	var newConfig = this.AllData;
	newConfig.Servers[filesystem.getServerEntry()].Users[filesystem.getUserEntry()] = this.UserData;
	filesystem.saveSettings(newConfig);
	
	document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSettingValue;
	document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD guiSetting_UnSelected";
	document.getElementById(this.selectedItem).className = "guiSettingsTD highlightBackground";
	remotecontrol.setCurrentPage("guiSettings");
	
}


guiSettings.bottomKeyDown = function() {
	var keyCode = event.keyCode;
	
	switch(keyCode) {
		case 38:
			logger.log("UP");	
			this.selectedSubItem--;
			if (this.selectedSubItem < 0) {
				this.selectedSubItem = this.CurrentSubSettings.length-1;
			} 
			document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSubSettings[this.selectedSubItem];
			break;
		case 40:
			logger.log("DOWN");	
			this.selectedSubItem++;
			if (this.selectedSubItem > this.CurrentSubSettings.length-1) {
				this.selectedSubItem = 0;;
			}
			document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSubSettings[this.selectedSubItem];
			break;
		case 37:	
		case 10009:
			logger.log("RETURN");
			event.preventDefault();
			document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSettingValue;		
			document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD guiSetting_UnSelected";
			document.getElementById(this.selectedItem).className = "guiSettingsTD highlightBackground";

			remotecontrol.setCurrentPage("guiSettings");
			break;	
		case 13:
			logger.log("ENTER");
			this.processSelectedSubItem();
			break;	
		case 10182:
			logger.log ("EXIT KEY");
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}

