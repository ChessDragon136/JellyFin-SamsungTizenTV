var guiSettingsContrib = {
		MainDevs : ["ChessDragon136","cmcg"],
		ContribDevs : ["Cragjagged","DrWatson","im85288","arcticwaters","SamES"],
		DonateSupport : ["c0m3r","Cbers","crashkelly","DaN","FrostByte","gbone8106","ginganinja","grimfandango","fc7","shorty1483","paulsalter","fluffykiwi","oleg","MongooseMan","SilentAssassin","gogreenpower","Ultroman","Spaceboy","JeremyG","strugglez"]
}

guiSettingsContrib.start = function() {
	
	
	document.getElementById("Counter").innerHTML = main.getVersion();
	document.getElementById("pageContent").innerHTML = "<div>About:</div><div id=ContentAbout style='font-size:1em;' class='guiPage_Settings_Settings'></div>";
	
	var htmlToAdd = "JellyFin for Samsung Smart TVs is a free, opensource community project. A broad range of Smarthub devices are supported due to the generously donated time and efforts of, among others, the following people.<br>";
	htmlToAdd += "<span style='font-size:1.2em;'>Main Developers</span><table><tr class='guiSettingsRow'>";
	for (var index = 0; index < this.MainDevs.length; index++) {
		if (index % 6 == 0) {
			htmlToAdd += "<tr class='guiSettingsRow'>";
		}
		htmlToAdd += "<td class='guiSettingsTD'>" + this.MainDevs[index] + "</td>";
		if (index+1 % 6 == 0) {
			htmlToAdd += "</tr>";
		}
	}
	htmlToAdd += "</tr></table><br><br>";
	htmlToAdd += "<span style='font-size:1.2em;'>Contributing Developers</span><table><tr class='guiSettingsRow'>";
	for (var index = 0; index < this.ContribDevs.length; index++) {
		if (index % 6 == 0) {
			htmlToAdd += "<tr class='guiSettingsRow'>";
		}
		htmlToAdd += "<td class='guiSettingsTD'>" + this.ContribDevs[index] + "</td>";
		if (index+1 % 6 == 0) {
			htmlToAdd += "</tr>";
		}
	}
	htmlToAdd += "</tr></table>";
	
	document.getElementById("ContentAbout").innerHTML = htmlToAdd;
	
	//Set Focus for Key Events
	remotecontrol.setCurrentPage("guiSettingsContrib");
}


guiSettingsContrib.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode) {
		case 37:
			break;
		case 10009:
			logger.log("RETURN",1);
			event.preventDefault();
			pagehistory.processReturnURLHistory();
			break;	
		case 10182:
			logger.log ("EXIT KEY",1);
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}

guiSettingsContrib.openMenu = function() {
	pagehistory.updateURLHistory("guiSettingsContrib",null,null,null,null,null,null,null);
	guiMainMenu.requested("guiSettingsContrib",null);
}