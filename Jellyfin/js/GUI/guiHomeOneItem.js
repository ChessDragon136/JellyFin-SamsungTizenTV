var guiHomeOneItem = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		isResume : false,
		
		selectedRow : 0,
		selectedBannerItem : -2,
		
		bannerItems : [],
		
		MAXCOLUMNCOUNT : 3,
		MAXROWCOUNT : 2,
		
		startParams : [],
		backdropTimeout : null
}

guiHomeOneItem.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}


guiHomeOneItem.start = function(selectedItem,topLeftItem) {	
	//Get Titles
	var title1 = filesystem.getUserViewName("View1");
	
	//Get URLs - YES the below syntax is correct 
	//View URL initiated in guiHome with the same name as value stored in user setting
	var url1 = guiHome[filesystem.getUserProperty("View1")];
	
	//Load Data
	this.ItemData = xmlhttp.getContent(url);
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }
	
	//If array like MoviesRecommended alter 
	if (title == "Suggested For You") {
		if (this.ItemData[0] === undefined){
			this.ItemData[0] = {"Items":[]}; //Create empty Items array and continue
		}
		this.ItemData = this.ItemData[0];
	}

	//Latest Page Fix
	if (title == "Latest TV" || title == "Latest Movies") {
		this.ItemData.Items = this.ItemData;
	}
	
	//If all user selected homepages are blank try media items
	if (this.ItemData.Items.length == 0) {
		title = "Media Folders"
		var newURL = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
		this.ItemData = xmlhttp.getContent(newURL);
		if (this.ItemData == null) { 
			pagehistory.processReturnURLHistory(); 
		}
	}
	
	if (this.ItemData.Items.length > 0) {		
		//Set page content
		document.getElementById("pageContent").innerHTML = "<div id=Center class='guiHome-Center'>" +
				"<span class='guiHome-Title'>"+title+"</span>" +
				"<div id=Content></div></div>";			

		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume = (title == "Resume" ||  title == "Continue Watching" ) ? true : false;
		
		//If to determine positioning of content
		document.getElementById("Center").style.top = (this.ItemData.Items.length >= this.MAXCOLUMNCOUNT) ? "130px" : "170px";

		//Generate Banner Items - Mreove Home Page
		this.bannerItems = guiMainMenu.menuItemsHomePages; 
		
		//Generate Banner display
		document.getElementById("bannerSelection").innerHTML = "";
		for (var index = 0; index < this.bannerItems.length; index++) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding offWhite'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";			
			} else {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem offWhite'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";					
			}
		}
	
		//Display first XX series
		this.selectedItem = selectedItem;
		this.selectedRow = remotecontrol.ITEM1;
		this.topLeftItem = topLeftItem;
		this.updateDisplayedItems();
		this.updateSelectedItems();

		//Function to generate random backdrop
		this.backdropTimeout = setTimeout(function(){
			var randomImageURL = server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=20&EnableTotalRecordCount=false");
			var randomImageData = xmlhttp.getContent(randomImageURL);
			if (randomImageData == null) { return; }
			
			for (var index = 0; index < randomImageData.Items.length; index++) {
				if (randomImageData.Items[index ].BackdropImageTags.length > 0) {
					var imgsrc = server.getImageURL(randomImageData.Items[index ].Id,"Backdrop",randomImageData.Items[index ].BackdropImageTags.length);
					support.fadeImage(imgsrc);
					break;
				}
			}
		}, 500);
		
		//Set Focus for Key Events
		remotecontrol.setCurrentPage("guiHomeOneItem");
		
	} else {
		//Set message to user
		document.getElementById("pageContent").innerHTML = "<div id=Content></div>";
		document.getElementById("Counter").innerHTML = "";
		document.getElementById("Content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid";

		//As no content  on menu bar and null null means user can't return off the menu bar
		guiMainMenu.requested(null,null);
	}
}

//---------------------------------------------------------------------------------------------------
//     ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

guiHomeOneItem.updateDisplayedItems = function() {
	support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",this.isResume,null,true);
}

//Function sets CSS Properties so show which user is selected
guiHomeOneItem.updateSelectedItems = function () {
	support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Series Selected highlightBorder","Series","");
	this.updateCounter();
}

guiHomeOneItem.updateSelectedItem = function (action) {
	support.updateSelectedItem(this.ItemData.Items,this.selectedItem,"Series Selected highlightBorder","Series","",action);
}

guiHomeOneItem.updateSelectedBannerItems = function() {
	support.updateSelectedBannerItems(this.bannerItems,this.selectedBannerItem,true);
}

guiHomeOneItem.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1) {
		support.updateCounter(this.selectedItem,this.ItemData.Items.length);
	} 
}

guiHomeOneItem.keyDown = function() {
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
			logger.log ("DOWN");
			this.processDownKey();
			break;
		case 13:
			logger.log("ENTER");
			this.processSelectedItem();
			break;	
		case 415:
			logger.log ("PLAY");
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

guiHomeOneItem.processLeftKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):
		if (this.selectedBannerItem > -1) {
			this.selectedBannerItem--;
			this.updateSelectedBannerItems();
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
	}
}

guiHomeOneItem.processRightKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):
		if (this.selectedBannerItem < this.bannerItems.length-1) {
			this.selectedBannerItem++;
			this.updateSelectedBannerItems();
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
	}
}

guiHomeOneItem.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.ITEM1):
		this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
		if (this.selectedItem < 0) {
			this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
			this.updateSelectedItem("REMOVE");
			this.selectedRow = remotecontrol.BANNER;
			this.selectedBannerItem = 0;
			this.updateSelectedBannerItems();
			this.updateCounter();
		} else {
			if (this.selectedItem < this.topLeftItem) {
				if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
					this.topLeftItem = 0;
				} else {
					this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
				}
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}	
		break;
	}	
}

guiHomeOneItem.processDownKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):
		this.selectedBannerItem = -2; //Yes -2 as -1 is hamburger icon!
		this.updateSelectedBannerItems();
		this.selectedRow = remotecontrol.ITEM1;
		this.updateSelectedItem("ADD");
		this.updateCounter();
		break;
	case (remotecontrol.ITEM1):
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.ItemData.Items.length) {
			this.selectedItem = (this.ItemData.Items.length-1);
			if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
				this.updateDisplayedItems();
			}
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}	
		this.updateSelectedItems();
		break;	
	}
}

guiHomeOneItem.processSelectedItem = function() {
	clearTimeout(this.backdropTimeout);
	if (this.selectedRow == remotecontrol.BANNER) {
		if (this.selectedBannerItem == -1) {
			//Menu Hamburger
			//Reset all vars to default as user may return from menu
			document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
			this.selectedBannerItem = 0;
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM1;
			pagehistory.updateURLHistory("guiHomeOneItem",null,null,0,0,null);
			guiMainMenu.requested("guiHomeOneItem",this.ItemData.Items[0].Id, "Series Selected highlightBorder");
		} else {
			pagehistory.updateURLHistory("guiHomeOneItem",null,null,0,0,null);
			guiHome.processHomePageMenu(this.bannerItems[this.selectedBannerItem]);
		}
	} else {
		var isLatest = false;
		if (this.startParams[2] == "New TV") {
			isLatest = true;
		}
		support.processSelectedItem("guiHomeOneItem",this.ItemData.Items[this.selectedItem],null,this.selectedItem,this.topLeftItem,true,null,isLatest); 
	}
}

guiHomeOneItem.playSelectedItem = function () {
	support.playSelectedItem("guiHomeOneItem",this.ItemData.Items[this.selectedItem],null,this.selectedItem,this.topLeftItem,null);
}