var guiHome = {
	None : null,	 //Yes this None is needed - relied on in pagehistory.updateHomeURL
	ContinueWatching : null,
	TVNextUp : null,
	Favourites : null,
	FavouriteMovies : null,
	FavouriteSeries : null,
	FavouriteEpisodes : null,
	SuggestedMovies : null,
	MediaFolders : null,
	LatestTV : null,
	LatestMovies : null
};

guiHome.processHomePageMenu = function (menuItem) {
	//Initiate Users View URL's
	guiHome.initUserViewsURL();
	
	switch (menuItem) {
	case "Home":
		pagehistory.destroyURLHistory();
		if (filesystem.getUserProperty("View2") != null) {
			guiHomeTwoItems.start(0,0,true);
		} else {
			guiHomeOneItem.start(0,0);	
		}
		break;
	case "TV":
		var url = server.getItemTypeURL("&IncludeItemTypes=Series&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
		guiSeries.start("All TV",url,0,0);
		break;	
	case "Movies":
		var url = server.getItemTypeURL("&IncludeItemTypes=Movie&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
		guiSeries.start("All Movies",url,0,0);
		break;
	case "Media_Folders":
		var url = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");	
		guiOneItem.start("Media Folders", url,0,0);
		break;		
	/*
	 * 
	 * The Below is currently not implemented - Will need major work SWH 29/08/2019
	 * 
	case "Music":
		this.enterMusicPage(File.getUserProperty("MusicView"));
		break;
	case "Playlists":
		var url = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&fields=SortName&IncludeItemTypes=Playlist&Recursive=true");
		guiOneItem.start("Playlists", url,0,0);
		break;	
	case "Favourites":
		var url = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&fields=SortName&recursive=true");
		guiOneItem.start("Favourites", url,0,0);
		break;	

	case "Channels":
		var url = server.getCustomURL("/Channels?userId="+server.getUserID()+"&format=json");	
		guiOneItem.start("Channels", url,0,0);
		break;
	case "Collections":	
		var url = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=BoxSet&Recursive=true&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
		guiSeries.start("All Collections", url,0,0);
		break;				
	case "Photos":
		var photosFolderId = Server.getUserViewId("photos");
		if (photosFolderId != null){
			var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Fields=SortName&StartIndex=0&Limit=500&Recursive=false&IncludeItemTypes=&MediaTypes=&ParentId="+photosFolderId);
			GuiPage_Photos.start("Photos",url,0,0);
		}
		break;
	case "Live_TV":
		var url = server.getCustomURL("/LiveTV/Channels?StartIndex=0&Limit=100&EnableFavoriteSorting=true&UserId=" + server.getUserID());
		var guideTime = new Date();
		var timeMsec = guideTime.getTime();
		var startTime = timeMsec - 300000; //rewind the clock five minutes.
		guideTime.setTime(startTime);
		GuiPage_TvGuide.start("Guide",url,0,0,0,guideTime);
		break;
	case "Home_Movies":
		var homeVideosFolderId = server.getUserViewId("homevideos");
		if (homeVideosFolderId != null){
			var url = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName&ParentId="+homeVideosFolderId);
			guiOneItem.start("Home Movies",url,0,0);
		}
		break;
	case "Search":
		break;	
	*/
	case "Settings":
		guiSettings.start();
		break;		
	case "Log_Out":
		support.logout();
		break;				
	}
}

guiHome.initUserViewsURL = function() {
	this.ContinueWatching = server.getserverAddr() + "/Users/"+server.getUserID()+"/Items?SortBy=DatePlayed&SortOrder=Descending&MediaTypes=Video&Filters=IsResumable&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,BasicSyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop,Banner,Thumb&EnableTotalRecordCount=false";
	this.TVNextUp = server.getserverAddr() + "/Shows/NextUp?format=json&UserId="+server.getUserID()+"&IncludeItemTypes=Episode&ExcludeLocationTypes=Virtual&Limit=24&Fields=PrimaryImageAspectRatio,SeriesInfo,DateCreated,SyncInfo,SortName&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop,Banner,Thumb&EnableTotalRecordCount=false";
	this.Favourites = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&fields=SortName&recursive=true");
	this.FavouriteMovies = server.getserverAddr() + "/Users/"+server.getUserID()+"/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie&Filters=IsFavorite&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,SyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual";
	this.FavouriteSeries = server.getserverAddr() + "/Users/"+server.getUserID()+"/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series&Filters=IsFavorite&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,SyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual";
	this.FavouriteEpisodes = server.getserverAddr() + "/Users/"+server.getUserID()+"/Items?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Episode&Filters=IsFavorite&Limit=10&Recursive=true&Fields=PrimaryImageAspectRatio,SyncInfo&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual";
	this.SuggestedMovies = server.getCustomURL("/Movies/Recommendations?format=json&userId="+server.getUserID()+"&categoryLimit=2&ItemLimit=6&Fields=PrimaryImageAspectRatio,MediaSourceCount,SyncInfo&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop,Banner,Thumb");
	this.MediaFolders = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
	this.LatestTV = server.getCustomURL("/Users/" + server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&IsFolder=false&fields=SortName,Overview,Genres,RunTimeTicks");
	this.LatestMovies = server.getCustomURL("/Users/" + server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
}