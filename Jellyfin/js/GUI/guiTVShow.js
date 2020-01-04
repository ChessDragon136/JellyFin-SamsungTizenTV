var guiTVShow = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		ShowData : null,		
		
		selectedRow : 0,
		rowDisplayed : remotecontrol.ITEM1,
		
		menuItems : ['Play All','Next Episode','Cast','Watched','Favourite'],
		menuItemCastPos : 2, //Change this number to be Cast pos in array above
		selectedMenuItem : 0,
		
		//No Banner Items - No selectedBannerItem
		
		MAXCOLUMNCOUNT : 5,
		MAXCOLUMNCOUNTCAST : 5,
		MAXROWCOUNT : 1,
		
		startParams : []
}

guiTVShow.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiTVShow.getMaxCastDisplay = function() {
	return this.MAXCOLUMNCOUNTCAST * this.MAXROWCOUNT;
}

guiTVShow.start = function(url,selectedItem,topLeftItem) {	
	//Save Start Params	- Null title
	this.startParams = [null,url];

	//Clear Banner
	document.getElementById("bannerSelection").innerHTML = "";
	
	//Load Show Data
	this.ShowData = xmlhttp.getContent(url);
	if (this.ShowData == null) { return; }
	
	//Load Seasons Data
	var url2 = server.getSeasonsURL(this.ShowData.Id);
	this.ItemData = xmlhttp.getContent(url2);
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }
	
	//Check user setting to skip show page with only 1 season
	if (this.ItemData.Items.length == 1 && filesystem.getUserProperty("SkipShow")) {
		//DO NOT UPDATE URL HISTORY AS SKIPPING THIS PAGE
		var url = server.getItemInfoURL(this.ItemData.Items[0].Id,null);
		guiTVEpisodes.start(this.ItemData.Items[0].Name,url,0,0);
		
	} else {
		if (this.ItemData.Items.length > 0) {	
			//If no cast, remove cast button from menu
			//Catch if Actor or GuestStar Only - Seems to be many different types and without documentation of all available types
			//Unable to catch in support.updatedisplayeditems, so remove from array if not Actor or GuestStar
			if (this.ShowData.People.length > 0) {
				for (var p=0;p<this.ShowData.People.length;p++) {
					if (this.ShowData.People[p].Type != "Actor" && this.ShowData.People[p].Type != "GuestStar") {
						this.ShowData.People.splice(p);
					}
				}
			} else {
				//Remove Cast from menu array
				this.menuItems.splice(this.menuItemCastPos,0,1); 
			}
			
			//Set PageContent
			document.getElementById("pageContent").innerHTML = "<div id=Content class='guiTVShow-SeasonsContainer'></div>" + 
			"<div id='ShowImage' class='guiTVShow-ImageEpisode'></div>" + 
			"<div class='guiTVShow-ItemContainer'>" + 
				"<div id='ShowTitle' class='guiTVShow-Title'></div>" +
				"<div id='ShowMetadata' class='metadata-Container guiTVShow-MetaDataPadding'></div>" +
				"<div id='guiTVShow-MenuContainer1' class='guiTVShow-MenuContainer'></div>" +
				"<div id='ShowOverview' class='guiTVShow-Overview'></div>" +
			"</div>" +
			"<div id='guiTVShow-ContentTitle' class='guiTVShow-ContentTitle'></div>";
			
			//Set Show Name
			document.getElementById("ShowTitle").innerHTML = this.ShowData.Name;
			support.scrollingTextHorizontal("ShowTitle");
			
			//Set Episode Primary Image
			if (this.ShowData.ImageTags.Primary) {			
				var imgsrc = server.getImageURL(this.ShowData.Id,"Primary",this.ShowData.ImageTags.Primary);
				document.getElementById("ShowImage").style.backgroundImage="url('" + imgsrc + "')";
			}
			
			//Generate Menu Items
			document.getElementById("guiTVShow-MenuContainer1").innerHTML = "";
			for (var index = 0; index < this.menuItems.length; index++) {
				if (this.menuItems[index] == "Watched") {
					document.getElementById("guiTVShow-MenuContainer1").innerHTML += "<svg id='guiTVShow-MenuItem" + index + "' class='guiTVShow-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 48 48'><path d='M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z'/></svg></span>"
				} else if (this.menuItems[index] == "Favourite") {
					document.getElementById("guiTVShow-MenuContainer1").innerHTML += "<svg id='guiTVShow-MenuItem" + index + "' class='guiTVShow-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 48 48'><path d='M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z'/></svg></span>";
				} else {
					document.getElementById("guiTVShow-MenuContainer1").innerHTML += "<span id='guiTVShow-MenuItem" + index + "' class='guiTVShow-MenuItem'>"+this.menuItems[index]+"</span>";	
				}		
			}	
					
			//Set Show MetaData
			var htmlforTitle = "";	
			var stars = this.ShowData.CommunityRating;
			if (stars){
		    	if (stars <3.1){
		    		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemImageStarEmpty'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
		    	} else if (stars >=3.1 && stars < 6.5) {
		    		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemImageStarHalf'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
		    	} else {
		    		htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemImageStarFull'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
		    	}
			}
			if (this.ShowData.OfficialRating !== undefined) {
				htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemText'>" + this.ShowData.OfficialRating + "</span></span>";
			}
			
			if (this.ShowData.RunTimeTicks != null) {
				htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemText'>"+support.convertTicksToMinutesJellyfin(this.ShowData.RunTimeTicks)+"</span></span>";
			}
			
			if (this.ShowData.UserData.IsFavorite) {
				htmlforTitle += "<span id='guiTVShow-Favourite' class='metadata-Item metadata-ItemImageFavourite'></span>";
			} else {
				htmlforTitle += "<span id='guiTVShow-Favourite'></span>";
			}
			if (this.ShowData.UserData.Played) {
				htmlforTitle += "<span id='guiTVShow-Watched' class='metadata-Item metadata-ItemImageWatched'></span>";
			} else {
				htmlforTitle += "<span id='guiTVShow-Watched'></span>";
			}
			
			htmlforTitle += "";
			document.getElementById("ShowMetadata").innerHTML = htmlforTitle;
			
			
			htmlforTitle += "";
			if (this.ShowData.OfficialRating !== undefined) {
				htmlforTitle += "<span class='metadata-Item'><span class='metadata-ItemText'>" + this.ShowData.OfficialRating + "</span></span>";
			}

			//Set Show Overview
			if (this.ShowData.Overview !== undefined) {
				document.getElementById("ShowOverview").innerHTML = this.ShowData.Overview;
				support.scrollingText("ShowOverview");
			}
				
			document.getElementById("guiTVShow-ContentTitle").innerHTML = "Seasons";
			
			//Display first XX series
			this.selectedItem = selectedItem;
			this.topLeftItem = topLeftItem;
			this.selectedRow = remotecontrol.ITEM1;
			this.selectedMenuItem = 0;
			this.updateDisplayedItems();
			this.updateSelectedItems();	
			
			//Load Background - Check id so if returning from episodes it doesnt re-load the backdrop image
			if (this.ShowData.Id != support.getBackdropId()) {
				if (this.ShowData.BackdropImageTags.length > 0){
					support.setBackdropId(this.ShowData.Id);
					var imagePos = Math.floor((Math.random() * this.ShowData.BackdropImageTags.length) + 0);
					var imgsrc = server.getImageURL(this.ShowData.Id,"Backdrop",this.ShowData.BackdropImageTags[imagePos],"AppBackdrop",imagePos);
					support.fadeImage(imgsrc);
				}				
			}
			
			//Set Focus for Key Events
			remotecontrol.setCurrentPage("guiTVShow");
		} else {
			//Set message to user
			document.getElementById("pageContent").innerHTML = "<div id='itemContainer' class='Columns"+this.MAXCOLUMNCOUNT+" padding10'><p id='title' class=pageTitle>"+title+"</p><div id=Content></div></div>";
			document.getElementById("Counter").innerHTML = "";
			document.getElementById("title").innerHTML = "Sorry";
			document.getElementById("Content").className = "padding60";
			document.getElementById("Content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid";
			
			//As no content focus on menu bar and null null means user can't return off the menu bar
			guiMainMenu.requested(null,null);
		}	
	}
}
//---------------------------------------------------------------------------------------------------
//    ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

//More Episodes
guiTVShow.updateSelectedItems = function () {
	support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Cast Selected highlightBorder","Cast","");
	this.updateCounter();
};

guiTVShow.updateDisplayedItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",false,null,false,true); 
}

guiTVShow.updateSelectedItem = function (action) {
	support.updateSelectedItem(this.ItemData.Items[this.selectedItem].Id,"Cast Selected highlightBorder","Cast","",action);
}

//Cast
guiTVShow.updateSelectedCastItems = function () {
	support.updateSelectedNEW(this.ShowData.People,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ShowData.People.length),"Cast Selected highlightBorder","Cast","");
	this.updateCounter();
};

guiTVShow.updateDisplayedCastItems = function() {
	document.getElementById("Content").style.bottom = "40px";
	support.updateDisplayedItems(this.ShowData.People,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxCastDisplay(),this.ShowData.People.length),"Content","",false,null);
}

guiTVShow.updateSelectedCastItem = function (action) {
	support.updateSelectedItem(this.ShowData.People[this.selectedItem].Id,"Cast Selected highlightBorder","Cast","",action);
}

//Menu
guiTVShow.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiTVShow-MenuItem highlightBackground","guiTVShow-MenuItem","guiTVShow-MenuItem","guiTVShow-MenuItemSVG highlightBackground","guiTVShow-MenuItemSVG");
}

guiTVShow.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER || this.selectedRow == remotecontrol.MENU || this.selectedRow == remotecontrol.MENU2) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1){
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM2){
		//Reserved for Chapters If I Implement it
	}  else if (this.selectedRow == remotecontrol.ITEM3){
		support.updateCounter(this.selectedItem,this.ItemData.Items.length );
	}  else if (this.selectedRow == remotecontrol.ITEM4){
		support.updateCounter(this.selectedItem,this.ShowData.People.length );
	}
}
//---------------------------------------------------------------------------------------------------
//    REMOTE CONTROL HANDLER
//---------------------------------------------------------------------------------------------------

guiTVShow.keyDown = function() {
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

guiTVShow.processLeftKey = function() {
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
				this.topLeftItem =  this.selectedItem - (this.getMaxCastDisplay() - 1);
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

guiTVShow.processRightKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU):
		if (this.selectedMenuItem < this.menuItems.length-1) {
			this.selectedMenuItem++;
			this.updateSelectedMenuItems();
		}
		break;	
	case (remotecontrol.ITEM1):
		this.selectedItem++;
		if (this.selectedItem >= this.ItemData.Items.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem++;
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
			if (this.selectedItem >= this.topLeftItem+this.getMaxCastDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedCastItems();
			}
			this.updateSelectedCastItems();
		}	
		break;			
	}
}

guiTVShow.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU) :
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		this.selectedRow = remotecontrol.BANNER;
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger";
		break;	
	case (remotecontrol.ITEM1):
		this.updateSelectedItem("REMOVE");
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

guiTVShow.processDownKey = function() {
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
			if (this.ItemData.Items !== undefined && this.ItemData.Items.length > 0) {
				this.selectedMenuItem = -1;
				this.updateSelectedMenuItems();	
				this.selectedRow = remotecontrol.ITEM1;
				this.updateSelectedItem("ADD");
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

guiTVShow.processSelectedItem = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER) :
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedBannerItem = 0;
		this.selectedItem = 0;
		this.topLeftItem = 0;
		
		pagehistory.updateURLHistory("guiTVShow",null,this.startParams[1],null,null,0,0,null);
		
		//Must catch which row is displayed so on return from menu (if user doesnt navigate away) correct ID is used
		if (this.rowDisplayed == remotecontrol.ITEM2) {
			this.selectedRow = remotecontrol.ITEM2;
			guiMainMenu.requested("guiTVShow",this.ShowData.People[0].Id, "Cast Selected highlightBorder");
		} else {
			this.selectedRow = remotecontrol.ITEM1;
			guiMainMenu.requested("guiTVShow",this.ItemData.Items[0].Id, "Cast Selected highlightBorder");
		}
		
		
		break;
	case (remotecontrol.MENU):
		switch (this.menuItems[this.selectedMenuItem]) {
		case ("Resume") :
			this.playSelectedItem();
			break;
		case ("Play") :
			this.playSelectedItem();
			break;
		case ("Seasons") :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[this.menuItemCastPos] = 'Cast';
			document.getElementById("guiTVShow-MenuItem"+this.menuItemCastPos).innerHTML = 'Cast';
			document.getElementById("guiTVShow-ContentTitle").innerHTML = "Seasons";
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM1;
			this.rowDisplayed = remotecontrol.ITEM1;
			this.updateDisplayedItems();
			this.updateSelectedItems();					
			break;
		case ("Cast") :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[this.menuItemCastPos] = 'Seasons';
			document.getElementById("guiTVShow-MenuItem"+this.menuItemCastPos).innerHTML = 'Seasons';	
			document.getElementById("guiTVShow-ContentTitle").innerHTML = "Cast";
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM2;
			this.rowDisplayed = remotecontrol.ITEM2;
			this.updateDisplayedCastItems();
			this.updateSelectedCastItems();			
			break;
		case ('Favourite') :
			if (this.ShowData.UserData.IsFavorite == false) {
				this.ShowData.UserData.IsFavorite = true;
				document.getElementById("guiTVShow-Favourite").className = "metadata-Item metadata-ItemImageFavourite";
				server.setFavourite(this.ShowData.Id,true);
			} else {
				this.ShowData.UserData.IsFavorite = false;
				document.getElementById("guiTVShow-Favourite").className = "";
				server.setFavourite(this.ShowData.Id,false);
			}
			break;
		case ('Watched') :
			//Check if Watched or not
			if (this.ShowData.UserData.Played == false) {
				this.ShowData.UserData.Played = true;
				document.getElementById("guiTVShow-Watched").className = "metadata-Item metadata-ItemImageWatched";
				server.setWatched(this.ShowData.Id,true);
			} else {
				this.ShowData.UserData.Played = false;
				document.getElementById("guiTVShow-Watched").className = "";
				server.setWatched(this.ShowData.Id,false);				
			}
			break;		
		}
		break;
	case (remotecontrol.ITEM1):
		//Check user hasnt selected the same episode that they are currently on - If so, just reset
		if (this.ItemData.Items[this.selectedItem].Id == this.ItemData.Id) {
			this.updateSelectedItemItem("REMOVE");
			this.selectedRow = remotecontrol.MENU;
			this.selectedMenuItem = 0;
			this.updateSelectedMenuItems();
			this.updateCounter();
		} else {
			support.processSelectedItem("guiTVShow", this.ItemData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
		}
		
		break;	
	case (remotecontrol.ITEM2):
		//Should load cast page here when I get around to fixing it
		break;			
	}		
}

guiTVShow.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiTVShow",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null,null);
	} else if (this.selectedRow == remotecontrol.MENU) {
		if (this.menuItems[this.selectedMenuItem] == "Resume") {
			support.playSelectedItem("guiTVShow",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null,this.ItemData.UserData.PlaybackPositionTicks);
		}
		if (this.menuItems[this.selectedMenuUtem] == "Play") {
			support.playSelectedItem("guiTVShow",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null);
		}		
	}
}