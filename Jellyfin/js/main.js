
var main =
{
	//TV Series Version	
	version : "0.0.3",
	debugLevel : 0, //-1 == Off : 0 Events minus Key Presses : 1 Events with Key Presses
	
	//Test Server - Really saves time not typing this in - set to NULL for real production!
	testServer : "192.168.1.130:8096",
	
	//Enable . Disable functions
	enableMusic : false,
	enableLiveTV : false,
	enableCollections : false,
	enableChannels : false,
	enablePlaylists : false
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

main.getVersion = function() {
	return this.version;
}

main.getDebugLevel = function() {
	return this.debugLevel;
}

main.getTestServer = function() {
	return this.testServer;
}


window.onload = function () {	
	logger.log("Application Start: " + main.version);
	
	//Start the clock - Most important thing
	support.clock();
	
	//Register common keys
	tizen.tvinputdevice.registerKey('Exit'); //Registered to close video playback cleanly
	tizen.tvinputdevice.registerKey('MediaPlay');
	tizen.tvinputdevice.registerKey('MediaPause');
	tizen.tvinputdevice.registerKey('MediaStop');
	tizen.tvinputdevice.registerKey('MediaRewind');
	tizen.tvinputdevice.registerKey('MediaFastForward');
	tizen.tvinputdevice.registerKey('MediaTrackPrevious');
	tizen.tvinputdevice.registerKey('MediaTrackNext');
	
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
    	if (main.getTestServer() != null) {
    		logger.log("No server defined. Using Test Server.");
    		xmlhttp.testConnectionSettings(main.getTestServer());
    	} else {
    		logger.log("No server defined. Loading the new server page.");
        	guiServerNew.start();   
    	} 	
    }
};
