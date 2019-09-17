var guiMainMenuSupport = {};


guiMainMenuSupport.generateMainMenu = function() {
	var menuItems = [];
	
	menuItems.push("Home");
	
	//Check Favourites - Not Implemented
	/*
	var urlFav = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&fields=SortName&recursive=true");
	var hasFavourites = xmlhttp.getContent(urlFav);
	
	if (hasFavourites.TotalRecordCount > 0) {
		menuItems.push("Favourites");
	}
	*/
	
	var url = server.getUserViews();
	var userViews = xmlhttp.getContent(url);
	for (var i = 0; i < userViews.Items.length; i++){
		if (userViews.Items[i].CollectionType == "tvshows" || userViews.Items[i].CollectionType == "movies") {
			//Below are Disabled - Removed from if statement above
			//Removed  || userViews.Items[i].CollectionType == "boxsets" || userViews.Items[i].CollectionType == "photos" || userViews.Items[i].CollectionType == "music"	
			var name = "";
			if (userViews.Items[i].CollectionType == "tvshows") {
				name = "TV";
			} else if (userViews.Items[i].CollectionType == "homevideos") {
				name = "Home_Movies";
			} else if (userViews.Items[i].CollectionType == "boxsets") {
				name = "Collections";
			} else if (userViews.Items[i].CollectionType == "movies") {
				name = "Movies";
			} else if (userViews.Items[i].CollectionType == "photos") {
				name = "Photos";
			} else if (userViews.Items[i].CollectionType == "music") {
				name = "Music";
			}
			var inarray = false;
			for (var t=0; t<menuItems.length;t++) {
				if (menuItems[t] == name) {
					inarray = true;
					break;
				}	
			}
			if (inarray == false) {
				menuItems.push(name);
			}
		}
	}
	
	//Check Server Playlists - 
	/*
	 * 
	 * Below is not implemented SWH 29/08/2019
	 * 
	if (main.isPlaylistsEnabled()) {
		var urlPlaylists = server.getItemTypeURL("/SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Playlist&Recursive=true&Limit=0");
		var hasPlaylists = xmlhttp.getContent(urlPlaylists);
		
		if (hasPlaylists.TotalRecordCount > 0) {
			menuItems.push("Playlists");
		}
	} 

	//Check Live TV
	if (main.isLiveTVEnabled()) {
		var liveTvAdded = false;
		var urlLiveTV = server.getCustomURL("/LiveTV/Info?format=json");
		var hasLiveTV = xmlhttp.getContent(urlLiveTV);
		if (hasLiveTV.IsEnabled) {
			for (var index = 0; index < hasLiveTV.EnabledUsers.length; index++) {
				if (server.getUserID() == hasLiveTV.EnabledUsers[index]) {
					menuItems.push("Live_TV");
					liveTvAdded = true;
					break;
				}
			}
		}		
	}

	//Recordings
	if (main.isLiveTVEnabled()) {
		var urlRecordings = server.getCustomURL("/LiveTV/Recordings?IsInProgress=false&SortBy=SortName&SortOrder=Ascending&StartIndex=0&fields=SortName&format=json");
		var hasRecordings = xmlhttp.getContent(urlRecordings);
		if (hasRecordings == null) { return; }
		
		if (hasRecordings.TotalRecordCount > 0) {
			if (!liveTvAdded){
				menuItems.push("Live_TV");
			}
		}
	}
	
	//Check Channels
	if (main.isChannelsEnabled()) {
		var urlChannels = server.getCustomURL("/Channels?userId="+server.getUserID()+"&format=json");
		var hasChannels = xmlhttp.getContent(urlChannels);
		if (hasChannels == null) { return; }
		
		if (hasChannels.Items.length > 0) {
			menuItems.push("Channels");
		}
	}
	
	//Check Media Folders
	var urlMF = server.getItemTypeURL("&Limit=0");
	var hasMediaFolders = xmlhttp.getContent(urlMF);
		
	if (hasMediaFolders.TotalRecordCount > 0) {
		menuItems.push("Media_Folders");
	}
	
	//Push Search
	menuItems.push("Search");
	
	*/
	
	//Push Settings
	menuItems.push("Settings");
	
	//Push Logout
	menuItems.push("Log_Out");

	return menuItems;
}

guiMainMenuSupport.generateTopMenu = function() {
	var menuItems = [];
	
	var url = server.getUserViews();
	var userViews = xmlhttp.getContent(url);
	for (var i = 0; i < userViews.Items.length; i++){
		if (userViews.Items[i].CollectionType == "tvshows" || userViews.Items[i].CollectionType == "movies") {
		//Below are Disabled - Removed from if statement above
		//Removed  || userViews.Items[i].CollectionType == "boxsets" || userViews.Items[i].CollectionType == "photos" || userViews.Items[i].CollectionType == "music"	
			var name = "";
			if (userViews.Items[i].CollectionType == "tvshows") {
				name = "TV";
			} else if (userViews.Items[i].CollectionType == "boxsets") {
				name = "Collections";
			} else if (userViews.Items[i].CollectionType == "movies") {
				name = "Movies";
			} else if (userViews.Items[i].CollectionType == "photos") {
				name = "Photos";
			} else if (userViews.Items[i].CollectionType == "music") {
				name = "Music";
			}

			var inarray = false;
			for (var t=0; t<menuItems.length;t++) {
				if (menuItems[t] == name) {
					inarray = true;
					break;
				}	
			}
			if (inarray == false) {
				menuItems.push(name);
			}
		}
	}
	
	//Check Media Folders
	/*
	 * 
	 * Below is not implemented SWH 29/08/2019
	 * 
	var urlMF = server.getItemTypeURL("&Limit=0");
	var hasMediaFolders = xmlhttp.getContent(urlMF);
	if (hasMediaFolders == null) { return; }
		
	if (hasMediaFolders.TotalRecordCount > 0) {
		menuItems.push("Media_Folders");
	}
	*/
	
	return menuItems;
}
