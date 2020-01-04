var remotecontrol = {
		currentpage : "",
		BANNER : -2,
		MENU : -1,
		MENU2 : 50,
		ITEM1 : 0,
		ITEM2 : 1,
		ITEM3 : 2,	
		ITEM4 : 3			
};

remotecontrol.getCurrentPage = function() {
	return this.currentpage;
};

remotecontrol.setCurrentPage = function(page) {
	this.currentpage = page;
};

remotecontrol.keyDown = function() {
	switch (this.currentpage) {
	case "NoItems": 
		this.noitemskeyDown();
		break;
	case "guiServer": 
		guiServer.keyDown();
		break;
	case "guiServerNew": 
		guiServerNew.keyDown();
		break;	
	case "guiUsers": 
		guiUsers.keyDown();
		break;
	case "guiUsersManual": 
		guiUsersManual.keyDown();
		break;		
	case "guiMainMenu": 
		guiMainMenu.keyDown();
		break;		
	case "guiSettings": 
		guiSettings.keyDown();
		break;	
	case "guiSettingsBottom":
		guiSettings.bottomKeyDown();
		break;
	case "guiSettingsLog": 
		guiSettingsLog.keyDown();
		break;	
	case "guiSettingsContrib":
		guiSettingsContrib.keyDown();
		break;
	case "guiHomeOneItem": 
		guiHomeOneItem.keyDown();
		break;		
	case "guiHomeTwoItems": 
		guiHomeTwoItems.keyDown();
		break;	
	case "guiOneItem": 
		guiOneItem.keyDown();
		break;		
	case "guiItemDetails": 
		guiItemDetails.keyDown();
		break;		
	case "guiSeries": 
		guiSeries.keyDown();
		break;	
	case "guiTVShow": 
		guiTVShow.keyDown();
		break;	
	case "guiTVEpisodes": 
		guiTVEpisodes.keyDown();
		break;	
	case "guiTVEpisode": 
		guiTVEpisode.keyDown();
		break;			
	case "videoPlayer":
		player.keyDown();
		break;
	}
};

remotecontrol.noitemskeyDown = function() {
	switch(event.keyCode){
		case 10135:
			logger.log("RETURN");
			event.preventDefault();
			pagehistory.processReturnURLHistory();
			break;		
		case 10182:
			logger.log ("EXIT KEY");
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}