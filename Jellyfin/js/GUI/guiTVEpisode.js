var guiTVEpisode = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		selectedRow : 0,
		rowDisplayed : remotecontrol.ITEM1,
		
		EpisodeData : null,
		
		menuItems : [],
		selectedMenuItem : 0,
		menuItemCastPos : null,
		
		//No Banner Items - No selectedBannerItem
		
		MAXCOLUMNCOUNTCAST : 7,
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
			this.menuItems.push("Resume");
		}
		this.menuItems.push("Play");
		
	}
		
	//Set PageContent
	document.getElementById("pageContent").innerHTML = "<div id=Content class='guiTVEpisode-SeasonsContainer'></div>" + 
	"<div id='ShowImage' class='guiTVEpisode-ImageEpisode'></div>" + 
	"<div class='guiTVEpisode-ItemContainer'>" + 
		"<div id='ShowTitle' class='guiTVEpisode-Title'></div>" +
		"<div id='ShowSubTitle' class='guiTVEpisode-SubTitle'></div>" +
		"<div id='ShowMetadata' class='metadata-Container guiTVEpisode-MetaDataPadding'></div>" +
		"<div id='ShowMetadata2' class='metadata-Container guiTVEpisode-MetaDataPadding'></div>" +
		"<div id='guiTVEpisode-MenuContainer1' class='guiTVEpisode-MenuContainer'></div>" +
		"<div id='ShowOverview' class='guiTVEpisode-Overview'></div>" +
	"</div>" +
	"<div id='guiTVEpisode-ContentTitle' class='guiTVEpisode-ContentTitle'></div>";
			
	//If no cast, remove cast button from menu
	//Catch if Actor or GuestStar Only - Seems to be many different types and without documentationof all available types
	//Unable to catch in support.updatedisplayeditems, so remove from array if not Actor or GuestStar
	if (this.ItemData.People.length > 0) {
		for (var p=0;p<this.ItemData.People.length;p++) {
			if (this.ItemData.People[p].Type != "Actor" && this.ItemData.People[p].Type != "GuestStar") {
				this.ItemData.People.splice(p,1);
			}
		}
	}

	//Get Episode Data
	//var episodesUrl = server.getChildItemsURL(this.ItemData.SeriesId,"&IncludeItemTypes=Episode&fields=SortName,Overview");
	var episodesUrl = server.getEpisodesURL(this.ItemData.SeriesId,null);//,this.ItemData.SeasonId); 
	this.EpisodeData = xmlhttp.getContent(episodesUrl);
	
	//If there is More Episodes & Cast, Push Cast Button
	//Mode Episodes is default view so needs no button - Cast Button changes to More Episodes when Cast is displayed
	if (this.EpisodeData.Items !== undefined && this.EpisodeData.Items.length > 1 && this.ItemData.People !== undefined && this.ItemData.People.length > 0) {
		this.menuItemCastPos = this.menuItems.push("Cast") - 1; //push returns array length, not index position in array.
	}
		
	this.menuItems.push("Watched");
	this.menuItems.push("Favourite");
		
	//Setup Episode Specific Things
	//Set Show Name
	var title = this.ItemData.IndexNumber + ". " + this.ItemData.Name;
	document.getElementById("ShowTitle").innerHTML = this.ItemData.SeriesName + " - " + this.ItemData.SeasonName;	
	document.getElementById("ShowSubTitle").innerHTML = title;
	
	support.scrollingTextHorizontal("ShowTitle");
	support.scrollingTextHorizontal2("ShowSubTitle");
	
	//Set Episode Primary Image
	if (this.ItemData.ImageTags.Primary) {			
		var imgsrc = server.getImageURL(this.ItemData.Id,"Primary",this.ItemData.ImageTags.Primary);
		document.getElementById("ShowImage").style.backgroundImage="url('" + imgsrc + "')";
	}
	
	//Generate Menu Items
	document.getElementById("guiTVEpisode-MenuContainer1").innerHTML = "";
	for (var index = 0; index < this.menuItems.length; index++) {
		//Adds time code to resume whilst keeping the name in the menu array as resume - makes life easier when calling processselecteditem
		if (this.menuItems[index] == "Resume") {
			document.getElementById("guiTVEpisode-MenuContainer1").innerHTML += "<span id='guiTVEpisode-MenuItem" + index + "' class='guiTVEpisode-MenuItem'>"+this.menuItems[index]+ " - " + support.convertTicksToTimeSingle(this.ItemData.UserData.PlaybackPositionTicks / 10000) + "</span>";	
		} else if (this.menuItems[index] == "Watched") {
			document.getElementById("guiTVEpisode-MenuContainer1").innerHTML += "<svg id='guiTVEpisode-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 48 48'><path d='M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z'/></svg></span>"
		} else if (this.menuItems[index] == "Favourite") {
			document.getElementById("guiTVEpisode-MenuContainer1").innerHTML += "<svg id='guiTVEpisode-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 48 48'><path d='M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z'/></svg></span>";
		} else {
			document.getElementById("guiTVEpisode-MenuContainer1").innerHTML += "<span id='guiTVEpisode-MenuItem" + index + "' class='guiTVEpisode-MenuItem'>"+this.menuItems[index]+"</span>";	
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
	
	if (this.ItemData.RunTimeTicks != null) {
		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemText'>"+support.convertTicksToMinutesJellyfin(this.ItemData.RunTimeTicks)+"</span></span>";
	}
	
	if (this.ItemData.UserData.IsFavorite) {
		htmlforTitle += "<span id='guiTVEpisode-Favourite' class='metadata-Item metadata-ItemImageFavourite'></span>";
	} else {
		htmlforTitle += "<span id='guiTVEpisode-Favourite'></span>";
	}
	if (this.ItemData.UserData.Played) {
		htmlforTitle += "<span id='guiTVEpisode-Watched' class='metadata-Item metadata-ItemImageWatched'></span>";
	} else {
		htmlforTitle += "<span id='guiTVEpisode-Watched'></span>";
	}
	
	htmlforTitle += "";
	document.getElementById("ShowMetadata").innerHTML = htmlforTitle;
	
	
	htmlforTitle += "";
	if (this.ItemData.OfficialRating !== undefined) {
		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemText'>" + this.ItemData.OfficialRating + "</span></span>";
	}
		
	//Video + Audio Display Titles
	var metaVideoDefault = null;
	var metaVideoFirst = null;
	var metaAudioDefault = null;
	var metaAudioFirst = null;	
	for (var index=0;index < this.ItemData.MediaStreams.length; index++) {
		if (this.ItemData.MediaStreams[index].Type == "Video" && metaVideoFirst == null) {
			metaVideoFirst = index;
		}		
		if (this.ItemData.MediaStreams[index].Type == "Video" && this.ItemData.MediaStreams[index].IsDefault == true && metaVideoDefault == null) {
			metaVideoDefault = index;
		}
		if (this.ItemData.MediaStreams[index].Type == "Audio" && metaAudioFirst == null) {
			metaAudioFirst = index;
		}		
		if (this.ItemData.MediaStreams[index].Type == "Audio" && this.ItemData.MediaStreams[index].IsDefault == true && metaAudioDefault == null) {
			metaAudioDefault = index;
		}
	}
	
	htmlforTitle2 = "<span class='metadata-Item'><span class='metadata-ItemText'>";
	if (metaVideoDefault != null) {
		htmlforTitle2 += "Video:&nbsp&nbsp" + this.ItemData.MediaStreams[metaVideoDefault].DisplayTitle;
	} else {
		if (metaVideoFirst != null) {
			htmlforTitle2 += "Video:&nbsp&nbsp" + this.ItemData.MediaStreams[metaVideoFirst].DisplayTitle;
		}
	}
	if (metaAudioDefault != null) {
		htmlforTitle2 += "&nbsp&nbsp&nbsp&nbsp&nbspAudio:&nbsp&nbsp" + this.ItemData.MediaStreams[metaAudioDefault].DisplayTitle;
	} else {
		if (metaAudioFirst != null) {
			htmlforTitle2 += "&nbsp&nbsp&nbsp&nbsp&nbspAudio:&nbsp&nbsp" + this.ItemData.MediaStreams[metaAudioFirst].DisplayTitle;
		}
	}	
	document.getElementById("ShowMetadata2").innerHTML = htmlforTitle2 + "</span></span>";

	//Set Show Overview
	if (this.ItemData.Overview !== undefined) {
		document.getElementById("ShowOverview").innerHTML = this.ItemData.Overview;
		support.scrollingText("ShowOverview");
	}
	
	//Load Background - Check id so if returning from episodes it doesnt re-load the backdrop image
	if (this.ItemData.SeriesId != support.getBackdropId()) {
		if (this.ItemData.ParentBackdropImageTags !== undefined && this.ItemData.ParentBackdropImageTags.length > 0){
			support.setBackdropId(this.ItemData.SeriesId);
			var imagePos = Math.floor((Math.random() * this.ItemData.ParentBackdropImageTags.length) + 0);
			var imgsrc = server.getImageURL(this.ItemData.SeriesId,"Backdrop",this.ItemData.ParentBackdropImageTags[imagePos],"AppBackdrop",imagePos);
			support.fadeImage(imgsrc);
		}				
	}
		
	this.selectedRow = remotecontrol.MENU;
	this.selectedMenuItem = 0; 
	this.updateSelectedMenuItems(); 
	
	//NOTE - As entry point is a menu, selectedItem & topLeft Item are irrelevant and calculated as new even on return
	//Display More Items - Loop to get right position to start from - needs work
	//Check to see if there are any, else default to Media Info
	this.rowDisplayed = remotecontrol.ITEM1; //YES Outside if below!
	if (this.EpisodeData.Items.length !== undefined && this.EpisodeData.Items.length > 1) {
		document.getElementById("guiTVEpisode-ContentTitle").innerHTML = "More Episodes";
		this.setupMoreEpisodesView(); //Sets top left and selected based on where in list of series episode is
		this.updateDisplayedMoreItems();
		this.updateSelectedMoreItems(); //Will select 1st ID
		this.updateSelectedMoreItem("REMOVE"); //Will hide it
	}
	
	//Set Focus for Key Events
	remotecontrol.setCurrentPage("guiTVEpisode");
}
//---------------------------------------------------------------------------------------------------
//    ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

//More Episodes
guiTVEpisode.updateSelectedMoreItems = function () {
	support.updateSelectedNEW(this.EpisodeData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.EpisodeData.Items.length),"MoreEpisodes Selected highlightBorder","MoreEpisodes","");
	this.updateCounter();
};

guiTVEpisode.updateDisplayedMoreItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.EpisodeData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.EpisodeData.Items.length),"Content","",false,null,false,true); 
}

guiTVEpisode.updateSelectedMoreItem = function (action) {
	support.updateSelectedItem(this.EpisodeData.Items[this.selectedItem].Id,"MoreEpisodes Selected highlightBorder","MoreEpisodes","",action);
}

//Cast
guiTVEpisode.updateSelectedCastItems = function () {
	support.updateSelectedNEW(this.ItemData.People,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Cast Selected highlightBorder","Cast","");
	this.updateCounter();
};

guiTVEpisode.updateDisplayedCastItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.ItemData.People,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Content","",false,null);
}

guiTVEpisode.updateSelectedCastItem = function (action) {
	support.updateSelectedItem(this.ItemData.People[this.selectedItem].Id,"Cast Selected highlightBorder","Cast","",action);
}

//Menu
guiTVEpisode.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiTVEpisode-MenuItem highlightBackground","guiTVEpisode-MenuItem","guiTVEpisode-MenuItem","guiTVEpisode-MenuItemSVG highlightBackground","guiTVEpisode-MenuItemSVG");
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
			logger.log("LEFT",1);
			this.processLeftKey();
			break;
		case 39:
			logger.log("RIGHT",1);
			this.processRightKey();
			break;	
		case 38:
			logger.log("UP",1);
			this.processUpKey();
			break;	
		case 40:
			logger.log("DOWN",1);
			this.processDownKey();
			break;		
		case 13:
			logger.log("ENTER",1);
			this.processSelectedItem();
			break;
		case 415:
			logger.log("PLAY",1);
			this.playSelectedItem();
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

//remotecontrol.ITEM1 = More Episodes
//remotecontrol.ITEM2 = Cast

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
				this.topLeftItem =  this.selectedItem - (this.getMaxCastDisplay
						() - 1);
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
		if (this.selectedItem >= this.ItemData.People.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxCastDisplay() ) {
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
		switch (this.rowDisplayed) {
		case (remotecontrol.ITEM1):
			if (this.EpisodeData.Items !== undefined && this.EpisodeData.Items.length > 0) {
				this.selectedMenuItem = -1;
				this.updateSelectedMenuItems();	
				this.selectedRow = remotecontrol.ITEM1;
				this.updateSelectedMoreItem("ADD");
			}
			break;
		case (remotecontrol.ITEM2):
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();	
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
		this.selectedMenuItem = 0;
		this.selectedRow = remotecontrol.MENU;
		pagehistory.updateURLHistory("guiTVEpisode",null,this.startParams[1],null,null,0,0,null);
		guiMainMenu.requested("guiTVEpisode","guiTVEpisode-MenuItem0", "guiTVEpisode-MenuItem highlightBackground");		
		break;
	case (remotecontrol.MENU):
		switch (this.menuItems[this.selectedMenuItem]) {
		case ("Resume") :
		case ("Play") :
			this.playSelectedItem();
			break;
		case ("More Episodes") :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[this.menuItemCastPos] = 'Cast';
			document.getElementById("guiTVEpisode-MenuItem"+this.menuItemCastPos).innerHTML = 'Cast';
			document.getElementById("guiTVEpisode-ContentTitle").innerHTML = "More Episodes";
			this.setupMoreEpisodesView() //Sets top left and selected based on where in list of series episode is
			this.selectedRow = remotecontrol.ITEM1;
			this.rowDisplayed = remotecontrol.ITEM1;
			this.updateDisplayedMoreItems();
			this.updateSelectedMoreItems();					
			break;
		case ("Cast") :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[this.menuItemCastPos] = 'More Episodes';
			document.getElementById("guiTVEpisode-MenuItem"+this.menuItemCastPos).innerHTML = 'More Episodes';	
			document.getElementById("guiTVEpisode-ContentTitle").innerHTML = "Cast";
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM2;
			this.rowDisplayed = remotecontrol.ITEM2;
			this.updateDisplayedCastItems();
			this.updateSelectedCastItems();			
			break;
		case ('Favourite') :
			if (this.ItemData.UserData.IsFavorite == false) {
				this.ItemData.UserData.IsFavorite = true;
				document.getElementById("guiTVEpisode-Favourite").className = "metadata-Item metadata-ItemImageFavourite";
				server.setFavourite(this.ItemData.Id,true);
			} else {
				this.ItemData.UserData.IsFavorite = false;
				document.getElementById("guiTVEpisode-Favourite").className = "";
				server.setFavourite(this.ItemData.Id,false);
			}
			break;
		case ('Watched') :
			//Check if Watched or not
			if (this.ItemData.UserData.Played == false) {
				this.ItemData.UserData.Played = true;
				document.getElementById("guiTVEpisode-Watched").className = "metadata-Item metadata-ItemImageWatched";
				server.setWatched(this.ItemData.Id,true);
			} else {
				this.ItemData.UserData.Played = false;
				document.getElementById("guiTVEpisode-Watched").className = "";
				server.setWatched(this.ItemData.Id,false);				
			}
			break;		
		}
		break;
	case (remotecontrol.ITEM1):
		//Check user hasnt selected the same episode that they are currently on - If so, just reset
		if (this.EpisodeData.Items[this.selectedItem].Id == this.ItemData.Id) {
			this.updateSelectedMoreItem("REMOVE");
			this.selectedRow = remotecontrol.MENU;
			this.selectedMenuItem = 0;
			this.updateSelectedMenuItems();
			this.updateCounter();
		} else {
			support.processSelectedItem("guiTVEpisode", this.EpisodeData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
		}
		
		break;	
	case (remotecontrol.ITEM2):
		//Should load cast page here when I get around to fixing it
		break;			
	}		
}

guiTVEpisode.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiTVEpisode",this.EpisodeData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null,null);
	} else if (this.selectedRow == remotecontrol.MENU) {
		if (this.menuItems[this.selectedMenuItem] == "Resume") {
			support.playSelectedItem("guiTVEpisode",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null,this.ItemData.UserData.PlaybackPositionTicks);
		}
		if (this.menuItems[this.selectedMenuItem] == "Play") {
			support.playSelectedItem("guiTVEpisode",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null);
		}		
	}
}


//---------------------------------------------------------------------------------------------------
// Special Displays
//---------------------------------------------------------------------------------------------------

guiTVEpisode.setupMoreEpisodesView = function() {
	for (var index = 0; index < this.EpisodeData.Items.length; index++) {
		if (this.EpisodeData.Items[index].Id == this.ItemData.Id) {		
			//Setup More episodes such that the current episode is shown in the middle
			//If Last Entry or 1st entry, ensure 3 items are displayed
			if (index == this.EpisodeData.Items.length-1) {
				this.topLeftItem = index-(this.MAXCOLUMNCOUNT-1);
				this.selectedItem = index;
			} else if (index == 0) {
				this.topLeftItem = index;
				this.selectedItem = index;
			} else {
				this.topLeftItem = index - 1;
				this.selectedItem = index;
			}
		}
	}
}
