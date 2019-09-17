var guiTVShow = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		ShowData : null,		
		
		selectedRow : 0,
		rowDisplayed : remotecontrol.ITEM1,
		
		//Please do not change order - splice is used to remoce ShowCast as pos 3 and is updated to Show Seasons when cast is shown..
		menuItems : ['Play All','Shuffle All','Next Episode','Cast','Watched','Favourite'],
		selectedMenuItem : 0,
		
		//No Banner Items - No selectedBannerItem
		
		MAXCOLUMNCOUNT : 7,
		MAXROWCOUNT : 1,
		
		startParams : []
}

guiTVShow.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiTVShow.start = function(url,selectedItem,topLeftItem) {	
	//Save Start Params	
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
			}
			if (this.ShowData.People.length == 0) {
				this.menuItems.splice(3,1);
			}
			
			document.getElementById("pageContent").innerHTML = "<div id=Content class='guiTVShow-SeasonsContainer'></div>" + 
			"<div id='ShowImage' class='ShowImage'></div>" + 
			"<div id='InfoContainer' class='showItemContainer'>" + 
				"<div id='ShowTitle' class='guiTVShowTitle'></div>" +
				"<div id='ShowMetadata' class='metadata-Container'></div>" +
				"<div id='guiTVShow-MenuContainer' class='guiTVShow-MenuContainer'>" +
			"</div>" +
			"<div id='ShowOverview' class='ShowOverview'></div>" + 
			"</div>";
			
			//Generate Menu Items
			document.getElementById("guiTVShow-MenuContainer").innerHTML = "";
			for (var index = 0; index < this.menuItems.length; index++) {
				document.getElementById("guiTVShow-MenuContainer").innerHTML += "<span id='guiTVShow-MenuItem" + index + "' class='guiTVShow-MenuItem'>"+this.menuItems[index]+"</span>";			
			}
					
			//Set Show Name
			document.getElementById("ShowTitle").innerHTML = this.ShowData.Name;
			
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
			
			//if (this.ShowData.UserData.IsFavorite) {
				htmlforTitle += "<span class='metadata-Item metadata-ItemImageFavourite'></span>";
			//}
			//if (this.ShowData.UserData.IsFavorite) {
				htmlforTitle += "<span class='metadata-Item metadata-ItemImageWatched'></span>";
			//}
			htmlforTitle += "";
			document.getElementById("ShowMetadata").innerHTML = htmlforTitle;
			
			//Set Show Primary Image
			if (this.ShowData.ImageTags.Primary) {
				var imgsrc = server.getImageURL(this.ShowData.Id,"Primary",350,500,0,false,0);
				document.getElementById("ShowImage").style.backgroundImage="url('"+imgsrc+"')";
			} else {
				document.getElementById("ShowImage").style.backgroundColor="rgb(77,77,77)";
			}
			
			//Set Show Title Image
			if (this.ShowData.ImageTags.Logo) {
				var imgsrc = server.getImageURL(this.ShowData.Id,"Logo",600,80,0,false,0);

			}
				
			//Set Show Overview
			if (this.ShowData.Overview !== undefined) {
				document.getElementById("ShowOverview").innerHTML = this.ShowData.Overview;
				support.scrollingText("ShowOverview");
			}
			
			//Display first XX series
			this.selectedItem = selectedItem;
			this.topLeftItem = topLeftItem;
			this.selectedRow = remotecontrol.ITEM1;
			this.selectedMenuItem = 0;
			this.updateDisplayedItems();
			this.updateSelectedItems();	
			
			//Load Background
			if (this.ShowData.BackdropImageTags.length > 0){
				var imgsrc = server.getBackgroundImageURL(this.ShowData.Id,"Backdrop",main.backdropWidth,main.backdropHeight,0,false,0,this.ShowData.BackdropImageTags.length);
				support.fadeImage(imgsrc);
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

guiTVShow.updateDisplayedItems = function() {
	support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",false,null);
}

//Function sets CSS Properties so show which user is selected
guiTVShow.updateSelectedItems = function () {
	support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Seasons Selected highlightBorder","Seasons","");
	this.updateCounter();
};

guiTVShow.updateSelectedItem = function (action) {
	support.updateSelectedItem(this.ItemData.Items,this.selectedItem,"Seasons Selected highlightBorder","Seasons","",action);
}


//Cast
guiTVShow.updateSelectedCastItems = function () {
	support.updateSelectedNEW(this.ShowData.People,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ShowData.People.length),"Seasons Selected highlightBorder","Seasons","");
	this.updateCounter();
};

guiTVShow.updateDisplayedCastItems = function() {
	support.updateDisplayedItems(this.ShowData.People,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.ShowData.People.length),"Content","",false,null);
}

guiTVShow.updateSelectedCastItem = function (action) {
	support.updateSelectedItem(this.ShowData.People,this.selectedItem,"Seasons Selected highlightBorder","Seasons","",action);
}


guiTVShow.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiTVShow-MenuItem highlightBackground","guiTVShow-MenuItem","guiTVShow-MenuItem");
}

guiTVShow.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER || this.selectedRow == remotecontrol.MENU) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1){
		support.updateCounter(this.selectedItem,this.ItemData.Items.length);
	} else if (this.selectedRow == remotecontrol.ITEM2){
		support.updateCounter(this.selectedItem,this.ShowData.People.length);
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
				this.topLeftItem =  this.selectedItem;
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
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem++;
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
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		
		if (this.rowDisplayed == remotecontrol.ITEM1) {
			this.selectedRow = remotecontrol.ITEM1;
			this.updateSelectedItem("ADD");
		} else {
			this.selectedRow = remotecontrol.ITEM2;
			this.updateSelectedCastItem("ADD");
		}

		this.updateCounter();
		break;
	}	
}

guiTVShow.processSelectedItem = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER) :
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedBannerItem = 0;
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.selectedRow = remotecontrol.ITEM1;
		pagehistory.updateURLHistory("guiTVShow",this.startParams[0],this.startParams[1],0,0,null);
		guiMainMenu.requested("guiTVShow",this.ItemData.Items[0].Id, "Seasons Selected highlightBorder");
		break;
	case (remotecontrol.MENU):
		switch (this.menuItems[this.selectedMenuItem]) {
		case ('Play All') :
			support.playSelectedItem("guiTVShow",this.ShowData,this.startParams,this.selectedItem,this.topLeftItem,null);	
			break;
		case ('Shuffle All') :
			support.playSelectedItem("guiTVShow",this.ShowData,this.startParams,this.selectedItem,this.topLeftItem,null,true);	
			break;
		case ('Next Episode') :
			//Make API call to get nextup
			var url = server.getNextUpURL(this.ShowData.Id);
			var nextUp = xmlhttp.getContent(url);
			if (nextUp == null) { pagehistory.processReturnURLHistory(); }
			if (nextUp.Items.length == 1) {
				support.playSelectedItem("guiTVShow",nextUp,this.startParams,this.selectedItem,this.topLeftItem,null);
			}	
			break;
		case ('Cast') : 
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[3] = 'Seasons';
			document.getElementById("guiTVShow-MenuItem3").innerHTML = 'Seasons';
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM2;
			this.rowDisplayed = remotecontrol.ITEM2;
			this.updateDisplayedCastItems();
			this.updateSelectedCastItems();
			break;
		case ('Seasons') :
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			this.menuItems[3] = 'Cast';
			document.getElementById("guiTVShow-MenuItem3").innerHTML = 'Cast';
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
		support.processSelectedItem("guiTVShow", this.ItemData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
		break;	
	case (remotecontrol.ITEM2):
		//Should load cast page here when I get around to fixing it
		break;			
	}		
}

guiTVShow.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiTVShow",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
	}
}