var guiOneItem = {
		ItemData : null,
		
		selectedRow : remotecontrol.ITEM1,
		selectedItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 3,
		MAXROWCOUNT : 2,
		
		startParams : []
}

guiOneItem.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiOneItem.start = function(title,url,selectedItem,topLeftItem) {
	//Save Start Params	
	this.startParams = [title,url];
	
	//Clear Banner
	document.getElementById("bannerSelection").innerHTML = "";
	
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	
	//Load Data
	this.ItemData = xmlhttp.getContent(url + "&Limit="+filesystem.getTVProperty("ItemPaging"));
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }

	//Setup display width height based on title
	/*
	switch (title) {
	case "Collections":
	case "Channels":
		this.MAXCOLUMNCOUNT = 3;
		this.MAXROWCOUNT = 2;
		break;
	case "Music":
	case "Albums":	
	case "Artists":	
		this.MAXCOLUMNCOUNT = 6;
		this.MAXROWCOUNT = 3;
		break;		
	default:
		this.MAXCOLUMNCOUNT = 4;
		this.MAXROWCOUNT = 3;
		break;
	}
	*/
	
	//Set Page Content
	document.getElementById("pageContent").innerHTML = "<div id=Center class='oneItemCenter'><div id='title' class='homePagesTitles'>"+title+"</div><div id=Content></div></div>";	
	
	if (this.ItemData.Items.length > 0) {
		//Display first XX series
		this.updateDisplayedItems();
			
		//Update Selected Collection CSS
		this.updateSelectedItems();	
			
		//Set Focus for Key Events
		remotecontrol.setCurrentPage("guiOneItem");
	} else {
		//Set message to user
		document.getElementById("Counter").innerHTML = "";
		document.getElementById("Content").style.fontSize="40px";
		document.getElementById("Content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen";
		
		remotecontrol.setCurrentPage("NoItems");
	}	
}

//---------------------------------------------------------------------------------------------------
//ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

guiOneItem.updateDisplayedItems = function() {
	support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",false,null,true);
}

//Function sets CSS Properties so show which user is selected
guiOneItem.updateSelectedItems = function () {
	//Add Collections Class to add more margin
	support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Series Selected highlightBorder","Series","");
}

guiOneItem.updateSelectedItem = function (action) {
	support.updateSelectedItem(this.ItemData.Items[this.selectedItem].Id,"Series Selected highlightBorder","Series","",action);
}

guiOneItem.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1) {
		support.updateCounter(this.selectedItem,this.ItemData.Items.length);
	} 
}

//---------------------------------------------------------------------------------------------------
//REMOTE CONTROL HANDLER
//---------------------------------------------------------------------------------------------------

guiOneItem.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode) {
		//Need Logout Key
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
		case 10009:
			logger.log("RETURN");
			event.preventDefault();
			pagehistory.processReturnURLHistory();
			break;	
		case 13:
			logger.log("ENTER");
			this.processSelectedItem();
			break;
		case 415:
			this.playSelectedItem();
			break;	
		case 10182:
			logger.log ("EXIT KEY");
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}

guiOneItem.processLeftKey = function() {
	switch (this.selectedRow) {
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

guiOneItem.processRightKey = function() {
	switch (this.selectedRow) {
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

guiOneItem.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.ITEM1):
		this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
		if (this.selectedItem < 0) {
			this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
			this.updateSelectedItem("REMOVE");
			this.selectedRow = remotecontrol.BANNER;
			document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger";
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

guiOneItem.processDownKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
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

guiOneItem.processSelectedItem = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):	
		//Menu Hamburger
		//Reset all vars to default as user may return from menu
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.selectedRow = remotecontrol.ITEM1;
		pagehistory.updateURLHistory("guiOneItem",this.startParams[0],this.startParams[1],0,0,true);
		guiMainMenu.requested("guiOneItem",this.ItemData.Items[0].Id, "Series Selected highlightBorder");
		break;
	case (remotecontrol.ITEM1): 
		support.processSelectedItem("guiOneItem",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null,null,false); 
		break;
	}
}

guiOneItem.playSelectedItem = function () {
	switch (this.selectedRow) {
	case (remotecontrol.ITEM1): 
		support.playSelectedItem("guiOneItem",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
		break;
	}
}