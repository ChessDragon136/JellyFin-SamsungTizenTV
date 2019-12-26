var guiItemDetails = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		selectedRow : 0,
		rowDisplayed : remotecontrol.ITEM1,
		
		EpisodeData : null,
		SimilarData : null,
		
		menuItems : [],
		selectedMenuItem : 0,
		//Used for Movie (Default) View 
		menuItems2 : [],
		selectedMenuItem2 : 0,		
		
		//No Banner Items - No selectedBannerItem
		
		MAXCOLUMNCOUNTCAST : 7,
		MAXCOLUMNCOUNT : 4,
		MAXROWCOUNT : 1,
		
		startParams : []
}

guiItemDetails.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiItemDetails.getMaxCastDisplay = function() {
	return this.MAXCOLUMNCOUNTCAST * this.MAXROWCOUNT;
}

guiItemDetails.start = function(url,selectedItem,topLeftItem) {	
	//Save Start Params	- Null title
	this.startParams = [null,url];
	
	//Clear Banner & Menu Items
	document.getElementById("bannerSelection").innerHTML = "";
	this.menuItems.length = 0;
	this.menuItems2.length = 0;
	
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
	
	if (this.ItemData.Type == "Episode") {
		this.MAXCOLUMNCOUNTCAST = 7;
		this.MAXCOLUMNCOUNT = 4;
		
		//Set PageContent
		document.getElementById("pageContent").innerHTML = "<div id=Content class='guiItemDetails-SeasonsContainer'></div>" + 
		"<div id='ShowImage' class='guiItemDetails-ImageEpisode'></div>" + 
		"<div class='guiItemDetails-ItemContainer'>" + 
			"<div id='ShowTitle' class='guiItemDetailsTitle'></div>" +
			"<div id='ShowSubTitle' class='guiItemDetailsSubTitle'></div>" +
			"<div id='ShowMetadata' class='metadata-Container'></div>" +
			"<div id='ShowOverview' class='guiItemDetails-Overview'></div>" +
		"</div>" +
		"<div id='guiItemDetails-MenuContainer1' class='guiItemDetails-MenuContainer'></div>";

		
		this.menuItems.push("Media Info");
		
		//Get Episode Data - Is this the right URL?
		var episodesUrl = server.getChildItemsURL(this.ItemData.SeasonId,"&IncludeItemTypes=Episode&fields=SortName,Overview");
		this.EpisodeData = xmlhttp.getContent(episodesUrl);
		if (this.EpisodeData == null) { return; }
		
		//Browse season episodes
		if (this.EpisodeData.Items.length > 1) {
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
		document.getElementById("guiItemDetails-MenuContainer1").innerHTML = "";
		for (var index = 0; index < this.menuItems.length; index++) {
			document.getElementById("guiItemDetails-MenuContainer1").innerHTML += "<span id='guiItemDetails-MenuItem" + index + "' class='guiItemDetails-MenuItem'>"+this.menuItems[index]+"</span>";			
		}	
	} else {
		this.MAXCOLUMNCOUNTCAST = 5;
		this.MAXCOLUMNCOUNT = 2;
		
		//Set PageContent
		document.getElementById("pageContent").innerHTML = "<div id=Content class='guiItemDetails-SeasonsMovieContainer'></div>" + 
		"<div id='ShowImage' class='guiItemDetails-ImageMovie'></div>" + 
		"<div class='guiItemDetails-ItemMovieContainer'>" + 
			"<div id='ShowTitle' class='guiItemDetailsTitle'></div>" +
			"<div id='ShowSubTitle' class='guiItemDetailsSubTitle'></div>" +
			"<div id='ShowMetadata' class='metadata-Container'></div>" +
			"<div id='guiItemDetails-MenuContainer1' class='guiItemDetails-MenuMovieContainer'></div>" +
			"<div id='guiItemDetails-MenuContainer2' class='guiItemDetails-MenuMovieContainer'></div>" +
			"<div id='ShowOverview' class='guiItemDetails-MovieOverview'></div>" +
		"</div>";
		
		this.menuItems2.push("Media Info");
		
		//Get suggestions - Is this the right URL
		var url2 = server.getCustomURL("/Movies/"+this.ItemData.Id+"/Similar?format=json&IncludeTrailers=false&Limit=5&UserId=" + server.getUserID());
		this.SimilarFilms = xmlhttp.getContent(url2);
		if (this.SimilarFilms == null) { return; }
		
		if (this.SimilarFilms.Items.length > 0) {
			this.menuItems2.push("Suggested");
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
			this.menuItems2.push("Cast");
		}
		
		this.menuItems.push("Watched");
		this.menuItems.push("Favourite");
		
		//Setup Film / Other Specific Things
		//Set Title
		itemName = this.ItemData.Name;
		if (itemName.length > 42){
			itemName = itemName.substring(0,42) + "...";
		}
		document.getElementById("ShowTitle").innerHTML = itemName;
		
		//Set Episode Primary Image
		if (this.ItemData.ImageTags.Primary) {			
			var imgsrc = server.getImageURL(this.ItemData.Id,"Primary");
			document.getElementById("ShowImage").style.backgroundImage="url('" + imgsrc + "')";
		}
		
		//Generate Menu Items
		document.getElementById("guiItemDetails-MenuContainer1").innerHTML = "";
		for (var index = 0; index < this.menuItems.length; index++) {
			document.getElementById("guiItemDetails-MenuContainer1").innerHTML += "<span id='guiItemDetails-MenuItem" + index + "' class='guiItemDetails-MenuItem'>"+this.menuItems[index]+"</span>";			
		}
		document.getElementById("guiItemDetails-MenuContainer2").innerHTML = "";
		for (var index = 0; index < this.menuItems2.length; index++) {
			document.getElementById("guiItemDetails-MenuContainer2").innerHTML += "<span id='guiItemDetails-MenuItem2" + index + "' class='guiItemDetails-MenuItem'>"+this.menuItems2[index]+"</span>";			
		}	
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
	
	//if (this.ItemData.UserData.IsFavorite) {
		htmlforTitle += "<span class='metadata-Item metadata-ItemImageFavourite'></span>";
	//}
	//if (this.ItemData.UserData.IsFavorite) {
		htmlforTitle += "<span class='metadata-Item metadata-ItemImageWatched'></span>";
	//}
	htmlforTitle += "";
	document.getElementById("ShowMetadata").innerHTML = htmlforTitle;

	//Set Show Overview
	if (this.ItemData.Overview !== undefined) {
		document.getElementById("ShowOverview").innerHTML = this.ItemData.Overview;
		support.scrollingText("ShowOverview");
	}
		
	//Display first XX series
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	
	this.selectedRow = remotecontrol.MENU;
	this.selectedMenuItem = 0;
	this.updateSelectedMenuItems();
	this.updateDisplayedItems();
	
	/*
	this.selectedRow = remotecontrol.ITEM4;
	this.updateDisplayedCastItems();
	this.updateSelectedCastItems();
	*/
	/*
	for (var index = 0; index < this.EpisodeData.Items.length; index++) {
		if (this.EpisodeData.Items[index].Id == this.ItemData.Id) {
			this.selectedItem = index;
			this.topLeftItem = index;
		}
	}
	
	this.selectedRow = remotecontrol.ITEM3;
	this.updateDisplayedMoretItems();
	this.updateSelectedMoreItems();
	*/
	
				
	//Set Focus for Key Events
	remotecontrol.setCurrentPage("guiItemDetails");
}
//---------------------------------------------------------------------------------------------------
//    ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

//Media Info - Custom 1 Off View
guiItemDetails.updateDisplayedItems = function() {
	this.displayMediaItemDetails();
	this.updateCounter();
}




//More Episodes
guiItemDetails.updateSelectedMoreItems = function () {
	support.updateSelectedNEW(this.EpisodeData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.EpisodeData.Items.length),"MoreEpisodes Selected highlightBorder","MoreEpisodes","");
	this.updateCounter();
};

guiItemDetails.updateDisplayedMoretItems = function() {
	support.updateDisplayedItems(this.EpisodeData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.EpisodeData.Items.length),"Content","",false,null,false,true); 
}

guiItemDetails.updateSelectedMoreItem = function (action) {
	support.updateSelectedItem(this.EpisodeData.Items[this.selectedItem].Id,"MoreEpisodes Selected highlightBorder","MoreEpisodes","",action);
}





//Cast
guiItemDetails.updateSelectedCastItems = function () {
	support.updateSelectedNEW(this.ItemData.People,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Seasons Selected highlightBorder","Seasons","");
	this.updateCounter();
};

guiItemDetails.updateDisplayedCastItems = function() {
	support.updateDisplayedItems(this.ItemData.People,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Content","",false,null);
}

guiItemDetails.updateSelectedCastItem = function (action) {
	support.updateSelectedItem(this.ItemData.People[this.selectedItem].Id,"Seasons Selected highlightBorder","Seasons","",action);
}

//Menu
guiItemDetails.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiItemDetails-MenuItem highlightBackground","guiItemDetails-MenuItem","guiItemDetails-MenuItem");
}

guiItemDetails.updateSelectedMenuItems2 = function() {
	support.updateSelectedMenuItems(this.menuItems2.length,this.selectedMenuItem2,"guiItemDetails-MenuItem highlightBackground","guiItemDetails-MenuItem","guiItemDetails-MenuItem2");
}

guiItemDetails.updateCounter = function () {
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

guiItemDetails.keyDown = function() {
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

guiItemDetails.processLeftKey = function() {
	switch (this.selectedRow) {
	//remotecontrol.BANNER not needed - only 1 item (hamburger icon)
	case (remotecontrol.MENU):
		if (this.selectedMenuItem > 0) {
			this.selectedMenuItem--;
			this.updateSelectedMenuItems();
		}
		break;	
	case (remotecontrol.MENU2):
		if (this.selectedMenuItem2 > 0) {
			this.selectedMenuItem2--;
			this.updateSelectedMenuItems2();
		}
		break;			
	case (remotecontrol.ITEM1):
		this.selectedItem--;
		if (this.selectedItem == -1) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem =  this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
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

guiItemDetails.processRightKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU):
		if (this.selectedMenuItem < this.menuItems.length-1) {
			this.selectedMenuItem++;
			this.updateSelectedMenuItems();
		}
		break;
	case (remotecontrol.MENU2):
		if (this.selectedMenuItem2 < this.menuItems2.length-1) {
			this.selectedMenuItem2++;
			this.updateSelectedMenuItems2();
		}
		break;		
	case (remotecontrol.ITEM1):
		this.selectedItem++;
		if (this.selectedItem >= this.ItemData.Items.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
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

guiItemDetails.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU) :
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		this.selectedRow = remotecontrol.BANNER;
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger";
		break;
	case (remotecontrol.MENU2) :
		this.selectedRow = remotecontrol.MENU;
		this.selectedMenuItem2 = -1;
		this.updateSelectedMenuItems2();
		this.selectedMenuItem = 0;
		this.updateSelectedMenuItems();		
		break;		
	case (remotecontrol.ITEM1):
		this.updateSelectedItem("REMOVE");
		this.selectedRow = remotecontrol.MENU2;
		this.selectedMenuItem2 = 0;
		this.updateSelectedMenuItems2();
		this.updateCounter();
		break;
	case (remotecontrol.ITEM2):
		this.updateSelectedCastItem("REMOVE");
		this.selectedRow = remotecontrol.MENU2;
		this.selectedMenuItem2 = 0;
		this.updateSelectedMenuItems2();
		this.updateCounter();
		break;		
	}	
}

guiItemDetails.processDownKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER) :
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedRow = remotecontrol.MENU;
		this.selectedMenuItem = 0;
		this.updateSelectedMenuItems();
		break;
	case (remotecontrol.MENU):
	case (remotecontrol.MENU2):
		if (this.menuItems2.length > 0 && this.selectedRow == remotecontrol.MENU) {
			this.selectedRow = remotecontrol.MENU2;
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.selectedMenuItem2 = 0;
			this.updateSelectedMenuItems2();
			this.updateCounter();
		} else {
			switch (this.rowDisplayed) {
			default:
			case (remotecontrol.ITEM1):
				break;
			case (remotecontrol.ITEM2):
				this.selectedRow = remotecontrol.ITEM2;
				this.updateSelectedCastItem("ADD");
				break;
			}
			this.updateCounter();
		}
		break;	
	}	
}

guiItemDetails.processSelectedItem = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER) :
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedBannerItem = 0;
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.selectedRow = remotecontrol.ITEM1;
		pagehistory.updateURLHistory("guiItemDetails",null,this.startParams[1],null,null,0,0,null);
		guiMainMenu.requested("guiItemDetails",this.ItemData.Items[0].Id, "SeriesPortraitLarge Selected highlightBorder");
		break;
	case (remotecontrol.MENU):
		switch (this.menuItems[this.selectedMenuItem]) {
		case ('Play All') :
			support.playSelectedItem("guiItemDetails",this.ShowData,this.startParams,this.selectedItem,this.topLeftItem,null);	
			break;
		case ('Shuffle All') :
			support.playSelectedItem("guiItemDetails",this.ShowData,this.startParams,this.selectedItem,this.topLeftItem,null,true);	
			break;
		case ('Next Episode') :
			//Make API call to get nextup
			var url = server.getNextUpURL(this.ShowData.Id);
			var nextUp = xmlhttp.getContent(url);
			if (nextUp == null) { pagehistory.processReturnURLHistory(); }
			if (nextUp.Items.length == 1) {
				support.playSelectedItem("guiItemDetails",nextUp,this.startParams,this.selectedItem,this.topLeftItem,null);
			}	
			break;
		case ('Show Cast') : 
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[3] = 'Show Seasons';
			document.getElementById("guiItemDetails-MenuItem3").innerHTML = 'Show Seasons';
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
			document.getElementById("guiItemDetails-MenuItem3").innerHTML = 'Show Cast';
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
		support.processSelectedItem("guiItemDetails", this.ItemData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
		break;	
	case (remotecontrol.ITEM2):
		//Should load cast page here when I get around to fixing it
		break;			
	}		
}

guiItemDetails.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiItemDetails",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
	}
}


//---------------------------------------------------------------------------------------------------
// Special Displays - Media Items
//---------------------------------------------------------------------------------------------------
guiItemDetails.displayMediaItemDetails = function() {
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

