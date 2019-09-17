
var main =
{
	version : "0.0.1",
	debugLevel : 0,
	
	//TV Series Version
	width : 1920,
	height : 1080,
	backdropWidth : 1920,
	backdropHeight : 1080,
	posterWidth : 473,
	posterHeight : 267,
	seriesPosterWidth : 180,
	seriesPosterHeight : 270,
	seriesPosterLargeWidth : 235,
	seriesPosterLargeHeight : 350,
			
	enableMusic : false,
	enableLiveTV : false,
	enableCollections : false,
	enableChannels : false,
	enablePlaylists : false,
	enableImageCache : true
};

main.isMusicEnabled = function() {
	return this.enableMusic;
};

main.isLiveTVEnabled = function() {
	return this.enableLiveTV;
};

main.isCollectionsEnabled = function() {
	return this.enableCollections;
};

main.isChannelsEnabled = function() {
	return this.enableChannels;
};

main.isPlaylistsEnabled = function() {
	return this.enablePlaylists;
};

main.isImageCaching = function() {
	return this.enableImageCache;
};

main.getVersion = function() {
	return this.version;
}

main.getDebugLevel = function() {
	return this.debugLevel;
}


window.onload = function () {	
	logger.log("Application Start: " + main.version);
	
	//Start the clock - Most important thing
	support.clock();
	
	//Register common keys
	tizen.tvinputdevice.registerKey('Exit'); //Registered to close video playback cleanly
	
	//Set screensaver
	webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
	
	//Set Device & Device ID
	server.setDevice(webapis.productinfo.getRealModel());
	server.setDeviceID(webapis.productinfo.getDuid());
	
	//Clear Settings - Manual Override for testing only
	//localStorage.clear();
	
	//Load Config File
	filesystem.loadfile();
    var fileJson = filesystem.getConfigJSON();	
    
    //Check if need to wipe based on new version
    if (fileJson.Version != main.getVersion()) {
    	localStorage.clear();
    	
    	//Load Config File
    	filesystem.loadfile();
        fileJson = filesystem.getConfigJSON();	 	
    }
    
    //Load ImageCache - Not Required! See filesystem.js
    //if (main.isImageCaching()) {
    //	filesystem.loadimagecache();
    //}
    
    
    //Check if Server exists
    if (fileJson.Servers.length > 1) {
    	//If no default show user Servers page (Can set default on that page)
    	var foundDefault = false;
    	for (var index = 0; index < fileJson.Servers.length; index++) {
    		if (fileJson.Servers[index].Default == true) {
    			foundDefault = true;
    			logger.log("Default server found.");
    			filesystem.setServerEntry(index);
    			xmlhttp.testConnectionSettings(fileJson.Servers[index].Path,true);    				
    			break;
    		}
    	}
    	if (foundDefault == false) {
    		logger.log("Multiple servers defined. Loading the select server page.");
    		guiServer.start();
    	}
    } else if (fileJson.Servers.length == 1) {
    	//If 1 server auto login with that
    	logger.log("Emby server name found in settings. Auto-connecting.");
    	filesystem.setServerEntry(0);
    	xmlhttp.testConnectionSettings(fileJson.Servers[0].Path,true);
    } else {
    	//No Server Defined - Load GuiPage_IP
    	logger.log("No server defined. Loading the new server page.");
    	guiServerNew.start();    	
    }
};
