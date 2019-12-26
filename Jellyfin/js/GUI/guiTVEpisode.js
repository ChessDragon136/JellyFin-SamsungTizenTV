var guiTVEpisode = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		selectedRow : 0,
		rowDisplayed : remotecontrol.ITEM1,
		
		EpisodeData : null,
		
		menuItems : [],
		selectedMenuItem : 0,	
		
		//No Banner Items - No selectedBannerItem
		
		MAXCOLUMNCOUNTCAST : 6,
		MAXCOLUMNCOUNT : 3,
		MAXROWCOUNT : 1,
		
		startParams : []
}

guiTVEpisode.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiTVEpisode.getMaxCastDisplay = function() {
	return this.MAXCOLUMNCOUNTCAST * this.MAXROWCOUNT;
}

guiTVEpisode.start = function(url,selectedItem,topLeftItem) {	
	//Save Start Params	- Null title
	this.startParams = [null,url];
	
	//Clear Banner & Menu Items
	document.getElementById("bannerSelection").innerHTML = "";
	this.menuItems.length = 0;
	
	//Load Item Data
	this.ItemData = xmlhttp.getContent(url);
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }
		
	//Setup Menu Items
	if (this.ItemData.LocationType != "Virtual") {
		if (this.ItemData.UserData.PlaybackPositionTicks > 0) {
			var resumeTicksSamsung = this.ItemData.UserData.PlaybackPositionTicks / 10000;
			this.menuItems.push("Resume - "+support.convertTicksToTimeSingle(resumeTicksSamsung));
		}
		this.menuItems.push("Play");
		
	}
		
	//Set PageContent
	document.getElementById("pageContent").innerHTML = "<div id=Content class='guiTVEpisode-SeasonsContainer'></div>" + 
	"<div id='ShowImage' class='guiTVEpisode-ImageEpisode'></div>" + 
	"<div class='guiTVEpisode-ItemContainer'>" + 
		"<div id='ShowTitle' class='guiItemDetailsTitle'></div>" +
		"<div id='ShowSubTitle' class='guiItemDetailsSubTitle'></div>" +
		"<div id='ShowMetadata' class='metadata-Container'></div>" +
		"<div id='ShowOverview' class='guiTVEpisode-Overview'></div>" +
	"</div>" +
	"<div id='guiTVEpisode-MenuContainer1' class='guiTVEpisode-MenuContainer'></div>";
	
	this.menuItems.push("Media Info");
		
	//Get Episode Data - Is this the right URL?
	var episodesUrl = server.getChildItemsURL(this.ItemData.SeasonId,"&IncludeItemTypes=Episode&fields=SortName,Overview");
	this.EpisodeData = xmlhttp.getContent(episodesUrl);
	if (this.EpisodeData == null) { return; }
	
	//Browse season episodes
	if (this.EpisodeData.Items.length !== undefined && this.EpisodeData.Items.length > 1) {
		this.menuItems.push("More Episodes");
	}
		
	//If no cast, remove cast button from menu
	//Catch if Actor or GuestStar Only - Seems to be many different types and without documentationof all available types
	//Unable to catch in support.updatedisplayeditems, so remove from array if not Actor or GuestStar
	if (this.ItemData.People.length > 0) {
		for (var p=0;p<this.ItemData.People.length;p++) {
			if (this.ItemData.People[p].Type != "Actor" && this.ItemData.People[p].Type != "GuestStar") {
				this.ItemData.People.splice(p);
			}
		}
	}
	if (this.ItemData.People.length > 0) {
		this.menuItems.push("Cast");
	}
		
	this.menuItems.push("Watched");
	this.menuItems.push("Favourite");
		
	//Setup Episode Specific Things
	//Set Show Name
	var title = this.ItemData.IndexNumber + ". " + this.ItemData.Name;
	document.getElementById("ShowTitle").innerHTML = this.ItemData.SeriesName + " - " + this.ItemData.SeasonName;	
	document.getElementById("ShowSubTitle").innerHTML = title;
	
	//Set Episode Primary Image
	if (this.ItemData.ImageTags.Primary) {			
		var imgsrc = server.getImageURL(this.ItemData.Id,"Primary");
		document.getElementById("ShowImage").style.backgroundImage="url('" + imgsrc + "')";
	}
	
	//Generate Menu Items
	document.getElementById("guiTVEpisode-MenuContainer1").innerHTML = "";
	for (var index = 0; index < this.menuItems.length; index++) {
		document.getElementById("guiTVEpisode-MenuContainer1").innerHTML += "<span id='guiTVEpisode-MenuItem" + index + "' class='guiTVEpisode-MenuItem'>"+this.menuItems[index]+"</span>";			
	}	
			
	//Set Show MetaData
	var htmlforTitle = "";	
	var stars = this.ItemData.CommunityRating;
	if (stars){
    	if (stars <3.1){
    		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemImageStarEmpty'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
    	} else if (stars >=3.1 && stars < 6.5) {
    		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemImageStarHalf'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
    	} else {
    		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemImageStarFull'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
    	}
	}
	if (this.ItemData.OfficialRating !== undefined) {
		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemText'>" + this.ItemData.OfficialRating + "</span></span>";
	}
	
	if (this.ItemData.UserData.IsFavorite) {
		htmlforTitle += "<span class='metadata-Item metadata-ItemImageFavourite'></span>";
	}
	if (this.ItemData.UserData.Played) {
		htmlforTitle += "<span class='metadata-Item metadata-ItemImageWatched'></span>";
	}
	htmlforTitle += "";
	document.getElementById("ShowMetadata").innerHTML = htmlforTitle;

	//Set Show Overview
	if (this.ItemData.Overview !== undefined) {
		document.getElementById("ShowOverview").innerHTML = this.ItemData.Overview;
		support.scrollingText("ShowOverview");
	}
		
	this.selectedRow = remotecontrol.MENU;
	this.selectedMenuItem = 0; 
	this.updateSelectedMenuItems(); 
	
	//NOTE - As entry point is a menu, selectedItem & topLeft Item are irrelevant and calculated as new even on return
	//Display More Items - Loop to get right position to start from - needs work
	//Check to see if there are any, else default to Media Info
	if (this.EpisodeData.Items.length !== undefined && this.EpisodeData.Items.length > 1) {
		for (var index = 0; index < this.EpisodeData.Items.length; index++) {
			if (this.EpisodeData.Items[index].Id == this.ItemData.Id) {
				this.topLeftItem = index;
				this.selectedItem = index;
			}
		}
		this.updateDisplayedMoreItems();
		this.updateSelectedMoreItems(); //Will select 1st ID
		this.updateSelectedMoreItem("REMOVE"); //Will hide it
	} else {
		//Media Info
		this.topLeftItem = 0;
		this.selectedItem = 0;
		this.updateDisplayedMediaItems();
	}

			
	//Set Focus for Key Events
	remotecontrol.setCurrentPage("guiTVEpisode");
}
//---------------------------------------------------------------------------------------------------
//    ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

//Media Info - Custom 1 Off View
guiTVEpisode.updateDisplayedMediaItems = function() {
	this.displayMediaItemDetails();
	this.updateCounter();
}




//More Episodes
guiTVEpisode.updateSelectedMoreItems = function () {
	support.updateSelectedNEW(this.EpisodeData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.EpisodeData.Items.length),"MoreEpisodes Selected highlightBorder","MoreEpisodes","");
	this.updateCounter();
};

guiTVEpisode.updateDisplayedMoreItems = function() {
	document.getElementById("Content").style.bottom = "65px";
	support.updateDisplayedItems(this.EpisodeData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.EpisodeData.Items.length),"Content","",false,null,false,true); 
}

guiTVEpisode.updateSelectedMoreItem = function (action) {
	support.updateSelectedItem(this.EpisodeData.Items,this.selectedItem,"MoreEpisodes Selected highlightBorder","MoreEpisodes","",action);
}





//Cast
guiTVEpisode.updateSelectedCastItems = function () {
	support.updateSelectedNEW(this.ItemData.People,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Seasons Selected highlightBorder","Seasons","");
	this.updateCounter();
};

guiTVEpisode.updateDisplayedCastItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.ItemData.People,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Content","",false,null);
}

guiTVEpisode.updateSelectedCastItem = function (action) {
	support.updateSelectedItem(this.ItemData.People,this.selectedItem,"Seasons Selected highlightBorder","Seasons","",action);
}

//Menu
guiTVEpisode.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiTVEpisode-MenuItem highlightBackground","guiTVEpisode-MenuItem","guiTVEpisode-MenuItem");
}

guiTVEpisode.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER || this.selectedRow == remotecontrol.MENU || this.selectedRow == remotecontrol.MENU2) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1){
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM2){
		//Reserved for Chapters If I Implement it
	}  else if (this.selectedRow == remotecontrol.ITEM3){
		support.updateCounter(this.selectedItem,this.EpisodeData.Items.length );
	}  else if (this.selectedRow == remotecontrol.ITEM4){
		support.updateCounter(this.selectedItem,this.ItemData.People.length );
	}
}
//---------------------------------------------------------------------------------------------------
//    REMOTE CONTROL HANDLER
//---------------------------------------------------------------------------------------------------

guiTVEpisode.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode) {	
		case 37:
			logger.log("LEFT");
			this.processLeftKey();
			break;
		case 39:
			logger.log("RIGHT");
			this.processRightKey();
			break;	
		case 38:
			logger.log("UP");
			this.processUpKey();
			break;	
		case 40:
			logger.log("DOWN");
			this.processDownKey();
			break;		
		case 13:
			logger.log("ENTER");
			this.processSelectedItem();
			break;
		case 415:
			logger.log("PLAY");
			this.playSelectedItem();
			break;			
		case 10009:
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

//remotecontrol.ITEM1 = More Episodes
//remotecontrol.ITEM2 = Cast
//remotecontrol.ITEM3 = Media Info

guiTVEpisode.processLeftKey = function() {
	switch (this.selectedRow) {
	//remotecontrol.BANNER not needed - only 1 item (hamburger icon)
	case (remotecontrol.MENU):
		if (this.selectedMenuItem > 0) {
			this.selectedMenuItem--;
			this.updateSelectedMenuItems();
		}
		break;			
	case (remotecontrol.ITEM1):
		this.selectedItem--;
		if (this.selectedItem == -1) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem =  this.selectedItem;
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedMoreItems();
			}
			this.updateSelectedMoreItems();
		}
		break;		
	case (remotecontrol.ITEM2):
		this.selectedItem--;
		if (this.selectedItem == -1) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem =  this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedCastItems();
			}
			this.updateSelectedCastItems();
		}
		break;			
	}
}

guiTVEpisode.processRightKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU):
		if (this.selectedMenuItem < this.menuItems.length-1) {
			this.selectedMenuItem++;
			this.updateSelectedMenuItems();
		}
		break;	
	case (remotecontrol.ITEM1):
		this.selectedItem++;
		if (this.selectedItem >= this.EpisodeData.Items.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem++;
				this.updateDisplayedMoreItems();
			}
			this.updateSelectedMoreItems();
		}	
		break;	
	case (remotecontrol.ITEM2):
		this.selectedItem++;
		if (this.selectedItem >= this.ShowData.People.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedCastItems();
			}
			this.updateSelectedCastItems();
		}	
		break;			
	}
}

guiTVEpisode.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU) :
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		this.selectedRow = remotecontrol.BANNER;
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger";
		break;	
	case (remotecontrol.ITEM1):
		this.updateSelectedMoreItem("REMOVE");
		this.selectedRow = remotecontrol.MENU;
		this.selectedMenuItem = 0;
		this.updateSelectedMenuItems();
		this.updateCounter();
		break;
	case (remotecontrol.ITEM2):
		this.updateSelectedCastItem("REMOVE");
		this.selectedRow = remotecontrol.MENU;
		this.selectedMenuItem = 0;
		this.updateSelectedMenuItems();
		this.updateCounter();
		break;		
	}	
}

guiTVEpisode.processDownKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER) :
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedRow = remotecontrol.MENU;
		this.selectedMenuItem = 0;
		this.updateSelectedMenuItems();
		break;
	case (remotecontrol.MENU):
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();		
		switch (this.rowDisplayed) {
		default:
		case (remotecontrol.ITEM1):
			this.selectedRow = remotecontrol.ITEM1;
			this.updateSelectedMoreItem("ADD");
			break;
		case (remotecontrol.ITEM2):
			this.selectedRow = remotecontrol.ITEM2;
			this.updateSelectedCastItem("ADD");
			break;
		}
		this.updateCounter();
	}	
}

guiTVEpisode.processSelectedItem = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER) :
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedBannerItem = 0;
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.selectedRow = remotecontrol.ITEM1;
		pagehistory.updateURLHistory("guiTVEpisode",null,this.startParams[1],null,null,0,0,null);
		guiMainMenu.requested("guiTVEpisode",this.ItemData.Items[0].Id, "SeriesPortraitLarge Selected highlightBorder");
		break;
	case (remotecontrol.MENU):
		switch (this.menuItems[this.selectedMenuItem]) {
		case ('Show Cast') : 
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[3] = 'Show Seasons';
			document.getElementById("guiTVEpisode-MenuItem3").innerHTML = 'Show Seasons';
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM2;
			this.rowDisplayed = remotecontrol.ITEM2;
			this.updateDisplayedCastItems();
			this.updateSelectedCastItems();
			break;
		case ('Show Seasons') :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[3] = 'Show Cast';
			document.getElementById("guiTVEpisode-MenuItem3").innerHTML = 'Show Cast';
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM1;
			this.rowDisplayed = remotecontrol.ITEM1;
			this.updateDisplayedItems();
			this.updateSelectedItems();
			break;
		}
		break;
	case (remotecontrol.ITEM1):
		support.processSelectedItem("guiTVEpisode", this.EpisodeData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
		break;	
	case (remotecontrol.ITEM2):
		//Should load cast page here when I get around to fixing it
		break;			
	}		
}

guiTVEpisode.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiTVEpisode",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
	}
}


//---------------------------------------------------------------------------------------------------
// Special Displays - Media Items
//---------------------------------------------------------------------------------------------------
guiTVEpisode.displayMediaItemDetails = function() {
	document.getElementById("Content").innerHTML = "";
	
	var maxpos = Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.MediaStreams.length);
	for (var index=this.topLeftItem;index < maxpos; index++) {
		if (this.ItemData.MediaStreams[index].Type == "Video") {
			document.getElementById("Content").innerHTML += "<div id='MediaInfo"+index+"' class='MediaInfo'>Video<br><br>" +
				"Title: " + this.ItemData.MediaStreams[index].DisplayTitle + "<br>" +
				"Codec: " + this.ItemData.MediaStreams[index].Codec + "<br>" +
				"AVC: " + this.ItemData.MediaStreams[index].IsAVC + "<br>" +
				"Profile: " + this.ItemData.MediaStreams[index].Profile + "<br>" +
				"Level: " + this.ItemData.MediaStreams[index].Level + "<br>" +
				"Resolution: " + this.ItemData.MediaStreams[index].Width + "x" + this.ItemData.MediaStreams[index].Height + "<br>" +
				"Aspect Ratio: " + this.ItemData.MediaStreams[index].AspectRatio + "<br>" +
				"Interlaced: " + this.ItemData.MediaStreams[index].IsInterlaced + "<br>" +
				"Framerate: " + this.ItemData.MediaStreams[index].RealFrameRate + "<br>" +
				"Bitrate: " + this.ItemData.MediaStreams[index].BitRate + "<br>" +
				"Bit Depth: " + this.ItemData.MediaStreams[index].BitDepth + " Bit<br>" +
				"Pixel Format: " + this.ItemData.MediaStreams[index].PixelFormat + "</div>";
		}
		if (this.ItemData.MediaStreams[index].Type == "Audio") {
			document.getElementById("Content").innerHTML += "<div id='MediaInfo"+index+"' class='MediaInfo'>Audio<br><br>" +
				"Title: " + this.ItemData.MediaStreams[index].DisplayTitle + "<br>" +
				"Language: " + this.ItemData.MediaStreams[index].Language + "<br>" +
				"Codec: " + this.ItemData.MediaStreams[index].Codec + "<br>" +			
				"Profile: " + this.ItemData.MediaStreams[index].Profile + "<br>" +
				"Layout: " + this.ItemData.MediaStreams[index].ChannelLayout + "<br>" +
				"Channels: " + this.ItemData.MediaStreams[index].Channels + "<br>" +
				"BitRate: " + this.ItemData.MediaStreams[index].BitRate + "<br>" +
				"Sample Rate: " + this.ItemData.MediaStreams[index].SampleRate + "<br>" +
				"Default: " + this.ItemData.MediaStreams[index].IsDefault + "</div>";
		}
		if (this.ItemData.MediaStreams[index].Type == "Subtitle") {
			document.getElementById("Content").innerHTML += "<div id='MediaInfo"+index+"' class='MediaInfo'>Subtitle<br><br>" +
			"Title: " + this.ItemData.MediaStreams[index].DisplayTitle + "<br>" +
			"Language: " + this.ItemData.MediaStreams[index].Language + "<br>" +
			"Codec: " + this.ItemData.MediaStreams[index].Codec + "<br>" +	
			"Default: " + this.ItemData.MediaStreams[index].IsDefault + "<br>" +
			"Forced: " + this.ItemData.MediaStreams[index].IsForced + "<br>" +
			"External: " + this.ItemData.MediaStreams[index].IsExternal + "</div>";
		}		
	}
}

