var guiItemDetails = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		selectedRow : 0,
		rowDisplayed : remotecontrol.ITEM1,
		
		SimilarData : null,
		
		menuItems : [],
		selectedMenuItem : 0,
		menuItemCastPos : null,
		
		//No Banner Items - No selectedBannerItem
		
		MAXCOLUMNCOUNTCAST : 5,
		MAXCOLUMNCOUNT : 5,
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
	
	this.selectedItem = 0;
	this.topLeftItem = 0;
	
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
	document.getElementById("pageContent").innerHTML = "<div id=Content class='guiItemDetails-SeasonsContainer'></div>" + 
	"<div id='ShowImage' class='guiItemDetails-ImageEpisode'></div>" + 
	"<div class='guiItemDetails-ItemContainer'>" + 
		"<div id='ShowTitle' class='guiItemDetails-Title'></div>" +
		"<div id='ShowMetadata' class='metadata-Container guiItemDetails-MetaDataPadding'></div>" +
		"<div id='ShowMetadata2' class='metadata-Container guiItemDetails-MetaDataPadding'></div>" +
		"<div id='guiItemDetails-MenuContainer1' class='guiItemDetails-MenuContainer'></div>" +
		"<div id='ShowOverview' class='guiItemDetails-Overview'></div>" +
	"</div>" +
	"<div id='guiItemDetails-ContentTitle' class='guiItemDetails-ContentTitle'></div>";
			
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

	//Get Episode Data
	//var episodesUrl = server.getChildItemsURL(this.ItemData.SeriesId,"&IncludeItemTypes=Episode&fields=SortName,Overview");
	var similarUrl = server.getSimilarURL(this.ItemData.Id);
	this.SimilarData = xmlhttp.getContent(similarUrl);
	
	//If there is More Episodes & Cast, Push Cast Button
	//Mode Episodes is default view so needs no button - Cast Button changes to More Episodes when Cast is displayed
	if (this.SimilarData.Items !== undefined && this.SimilarData.Items.length > 1 && this.ItemData.People !== undefined && this.ItemData.People.length > 0) {
		this.menuItemCastPos = this.menuItems.push("Cast") - 1; //push returns array length, not index position in array.
	}
		
	this.menuItems.push("Watched");
	this.menuItems.push("Favourite");
		
	//Setup Episode Specific Things
	//Set Show Name
	document.getElementById("ShowTitle").innerHTML = this.ItemData.Name;	
	
	support.scrollingTextHorizontal("ShowTitle");
	
	//Set Episode Primary Image
	if (this.ItemData.ImageTags.Primary) {			
		var imgsrc = server.getImageURL(this.ItemData.Id,"Primary");
		document.getElementById("ShowImage").style.backgroundImage="url('" + imgsrc + "')";
	}
	
	//Generate Menu Items
	document.getElementById("guiItemDetails-MenuContainer1").innerHTML = "";
	for (var index = 0; index < this.menuItems.length; index++) {
		//Adds time code to resume whilst keeping the name in the menu array as resume - makes life easier when calling processselecteditem
		if (this.menuItems[index] == "Resume") {
			document.getElementById("guiItemDetails-MenuContainer1").innerHTML += "<span id='guiItemDetails-MenuItem" + index + "' class='guiItemDetails-MenuItem'>"+this.menuItems[index]+ " - " + support.convertTicksToTimeSingle(this.ItemData.UserData.PlaybackPositionTicks / 10000) + "</span>";	
		} else if (this.menuItems[index] == "Watched") {
			document.getElementById("guiItemDetails-MenuContainer1").innerHTML += "<svg id='guiItemDetails-MenuItem" + index + "' class='guiItemDetails-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 48 48'><path d='M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z'/></svg></span>"
		} else if (this.menuItems[index] == "Favourite") {
			document.getElementById("guiItemDetails-MenuContainer1").innerHTML += "<svg id='guiItemDetails-MenuItem" + index + "' class='guiItemDetails-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 48 48'><path d='M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z'/></svg></span>";
		} else {
			document.getElementById("guiItemDetails-MenuContainer1").innerHTML += "<span id='guiItemDetails-MenuItem" + index + "' class='guiItemDetails-MenuItem'>"+this.menuItems[index]+"</span>";	
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
		htmlforTitle += "<span id='guiItemDetails-Favourite' class='metadata-Item metadata-ItemImageFavourite'></span>";
	} else {
		htmlforTitle += "<span id='guiItemDetails-Favourite'></span>";
	}
	if (this.ItemData.UserData.Played) {
		htmlforTitle += "<span id='guiItemDetails-Watched' class='metadata-Item metadata-ItemImageWatched'></span>";
	} else {
		htmlforTitle += "<span id='guiItemDetails-Watched'></span>";
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
	if (this.ItemData.Id != support.getBackdropId()) {
		if (this.ItemData.BackdropImageTags !== undefined && this.ItemData.BackdropImageTags.length > 0){
			support.setBackdropId(this.ItemData.Id);
			var imgsrc = server.getImageURL(this.ItemData.Id,"Backdrop",this.ItemData.BackdropImageTags.length);
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
	if (this.SimilarData.Items.length !== undefined && this.SimilarData.Items.length > 1) {
		document.getElementById("guiItemDetails-ContentTitle").innerHTML = "Similar";
		this.updateDisplayedSimilarItems();
		this.updateSelectedSimilarItems(); //Will select 1st ID
		this.updateSelectedSimilarItem("REMOVE"); //Will hide it
	}
	
	//Set Focus for Key Events
	remotecontrol.setCurrentPage("guiItemDetails");
}
//---------------------------------------------------------------------------------------------------
//    ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

//More Episodes
guiItemDetails.updateSelectedSimilarItems = function () {
	support.updateSelectedNEW(this.SimilarData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.SimilarData.Items.length),"Cast Selected highlightBorder","Cast","");
	this.updateCounter();
};

guiItemDetails.updateDisplayedSimilarItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.SimilarData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.SimilarData.Items.length),"Content","",false,null,false,true); 
}

guiItemDetails.updateSelectedSimilarItem = function (action) {
	support.updateSelectedItem(this.SimilarData.Items[this.selectedItem].Id,"Cast Selected highlightBorder","Cast","",action);
}

//Cast
guiItemDetails.updateSelectedCastItems = function () {
	support.updateSelectedNEW(this.ItemData.People,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Cast Selected highlightBorder","Cast","");
	this.updateCounter();
};

guiItemDetails.updateDisplayedCastItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.ItemData.People,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ItemData.People.length),"Content","",false,null);
}

guiItemDetails.updateSelectedCastItem = function (action) {
	support.updateSelectedItem(this.ItemData.People[this.selectedItem].Id,"Cast Selected highlightBorder","Cast","",action);
}

//Menu
guiItemDetails.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiItemDetails-MenuItem highlightBackground","guiItemDetails-MenuItem","guiItemDetails-MenuItem","guiItemDetails-MenuItemSVG highlightBackground","guiItemDetails-MenuItemSVG");
}

guiItemDetails.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER || this.selectedRow == remotecontrol.MENU || this.selectedRow == remotecontrol.MENU2) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1){
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM2){
		//Reserved for Chapters If I Implement it
	}  else if (this.selectedRow == remotecontrol.ITEM3){
		support.updateCounter(this.selectedItem,this.SimilarData.Items.length );
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

//remotecontrol.ITEM1 = More Episodes
//remotecontrol.ITEM2 = Cast

guiItemDetails.processLeftKey = function() {
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
				this.updateDisplayedSimilarItems();
			}
			this.updateSelectedSimilarItems();
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

guiItemDetails.processRightKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU):
		if (this.selectedMenuItem < this.menuItems.length-1) {
			this.selectedMenuItem++;
			this.updateSelectedMenuItems();
		}
		break;	
	case (remotecontrol.ITEM1):
		this.selectedItem++;
		if (this.selectedItem >= this.SimilarData.Items.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem++;
				this.updateDisplayedSimilarItems();
			}
			this.updateSelectedSimilarItems();
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

guiItemDetails.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU) :
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		this.selectedRow = remotecontrol.BANNER;
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger";
		break;	
	case (remotecontrol.ITEM1):
		this.updateSelectedSimilarItem("REMOVE");
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

guiItemDetails.processDownKey = function() {
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
			if (this.SimilarData.Items !== undefined && this.SimilarData.Items.length > 0) {
				this.selectedMenuItem = -1;
				this.updateSelectedMenuItems();	
				this.selectedRow = remotecontrol.ITEM1;
				this.updateSelectedSimilarItem("ADD");
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

guiItemDetails.processSelectedItem = function() {
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
			this.playSelectedItem();
			break;
		case ("Play") :
			this.playSelectedItem();
			break;
		case ("Similar") :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[this.menuItemCastPos] = 'Cast';
			document.getElementById("guiItemDetails-MenuItem"+this.menuItemCastPos).innerHTML = 'Cast';
			document.getElementById("guiItemDetails-ContentTitle").innerHTML = "Simlar";
			this.setupMoreEpisodesView() //Sets top left and selected based on where in list of series episode is
			this.selectedRow = remotecontrol.ITEM1;
			this.rowDisplayed = remotecontrol.ITEM1;
			this.updateDisplayedSimilarItems();
			this.updateSelectedSimilarItems();					
			break;
		case ("Cast") :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[this.menuItemCastPos] = 'Similar';
			document.getElementById("guiItemDetails-MenuItem"+this.menuItemCastPos).innerHTML = 'Similar';	
			document.getElementById("guiItemDetails-ContentTitle").innerHTML = "Cast";
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
				document.getElementById("guiItemDetails-Favourite").className = "metadata-Item metadata-ItemImageFavourite";
				server.setFavourite(this.ItemData.Id,true);
			} else {
				this.ItemData.UserData.IsFavorite = false;
				document.getElementById("guiItemDetails-Favourite").className = "";
				server.setFavourite(this.ItemData.Id,false);
			}
			break;
		case ('Watched') :
			//Check if Watched or not
			if (this.ItemData.UserData.Played == false) {
				this.ItemData.UserData.Played = true;
				document.getElementById("guiItemDetails-Watched").className = "metadata-Item metadata-ItemImageWatched";
				server.setWatched(this.ItemData.Id,true);
			} else {
				this.ItemData.UserData.Played = false;
				document.getElementById("guiItemDetails-Watched").className = "";
				server.setWatched(this.ItemData.Id,false);				
			}
			break;		
		}
		break;
	case (remotecontrol.ITEM1):
		//Check user hasnt selected the same episode that they are currently on - If so, just reset
		if (this.SimilarData.Items[this.selectedItem].Id == this.ItemData.Id) {
			this.updateSelectedSimilarItem("REMOVE");
			this.selectedRow = remotecontrol.MENU;
			this.selectedMenuItem = 0;
			this.updateSelectedMenuItems();
			this.updateCounter();
		} else {
			support.processSelectedItem("guiItemDetails", this.SimilarData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
		}
		
		break;	
	case (remotecontrol.ITEM2):
		//Should load cast page here when I get around to fixing it
		break;			
	}		
}

guiItemDetails.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiItemDetails",this.SimilarData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null,null);
	} else if (this.selectedRow == remotecontrol.MENU) {
		if (this.menuItems[this.selectedMenuItem] == "Resume") {
			support.playSelectedItem("guiItemDetails",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null,this.ItemData.UserData.PlaybackPositionTicks);
		}
		if (this.menuItems[this.selectedMenuUtem] == "Play") {
			support.playSelectedItem("guiItemDetails",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null);
		}		
	}
}