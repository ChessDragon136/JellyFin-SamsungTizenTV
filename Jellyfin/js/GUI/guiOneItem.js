var guiOneItem = {
		ItemData : null,
		ItemIndexData : null,
		
		selectedItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 3,
		MAXROWCOUNT : 3,
		
		indexSeekPos : -1,
		isResume : false,
		genreType : "",
		
		startParams : [],
		isLatest : false,
		backdropTimeout : null
}

guiOneItem.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiOneItem.start = function(title,url,selectedItem,topLeftItem) {
	//Save Start Params	
	this.startParams = [title,url];
	
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.genreType = null;
	
	//Load Data
	this.ItemData = xmlhttp.getContent(url + "&Limit="+filesystem.getTVProperty("ItemPaging"));
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }
	//Once we've browsed the channels down to a content folder we should display them using GuiDisplay_Series.
	if (this.ItemData.TotalRecordCount >0){
		if (this.ItemData.Items[0].Type == "ChannelVideoItem" || 
				this.ItemData.Items[0].Type == "ChannelAudioItem" || 
				this.ItemData.Items[0].Type == "Trailer" ||
				this.ItemData.Items[0].Type == "AudioPodcast") {
			guiSeries.start("All "+this.ItemData.Items[0].Type,url,selectedItem,topLeftItem,this.ItemData);
			return;
		}	
	}

	//Setup display width height based on title
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
	
	//Set Page Content
	document.getElementById("pageContent").innerHTML = "<div id='title'>"+title+"</div>" +
			"<div id=Center class='oneItemCenter'><div id=Content></div></div>";	
	
	if (this.ItemData.Items.length > 0) {
		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume = (title == "Resume") ? true : false;

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

guiOneItem.updateDisplayedItems = function() {
	support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",this.isResume,this.genreType,true);
}

//Function sets CSS Properties so show which user is selected
guiOneItem.updateSelectedItems = function () {
	//Add Collections Class to add more margin
	support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Series Selected highlightBorder","Series","");
}

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
		case 427: 
			this.processChannelUpKey();
			break;			
		case 428:
			this.processChannelDownKey();
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

guiOneItem.processSelectedItem = function() {
	clearTimeout(this.backdropTimeout);
	support.processSelectedItem("guiOneItem",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null,this.genreType,this.isLatest); 
}

guiOneItem.playSelectedItem = function () {
	clearTimeout(this.backdropTimeout);
	support.playSelectedItem("guiOneItem",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
}

guiOneItem.openMenu = function() {
	pagehistory.updateURLHistory("guiOneItem",this.startParams[0],this.startParams[1],this.selectedItem,this.topLeftItem,null);
	guiMainMenu.requested("guiOneItem",this.ItemData.Items[this.selectedItem].Id);
}

guiOneItem.processLeftKey = function() {
	if (this.selectedItem % this.MAXCOLUMNCOUNT == 0){
		this.openMenu(); //Going left from anywhere in the first column.
	} else {
		this.selectedItem--;
		if (this.selectedItem == -1) {
			this.selectedItem = 0;
			this.openMenu();
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

guiOneItem.processRightKey = function() {
	this.selectedItem++;
	if (this.selectedItem >= this.ItemData.Items.length) {
		this.selectedItem--;
	} else {
		if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
			this.topLeftItem = this.selectedItem;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
}

guiOneItem.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		//Check User Setting
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;	
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
}

guiOneItem.processDownKey = function() {
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
}

guiOneItem.processChannelUpKey = function() {
	this.selectedItem = this.selectedItem - this.getMaxDisplay();
	if (this.selectedItem < 0) {
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.updateDisplayedItems();
	} else {
		if (this.topLeftItem - this.getMaxDisplay() < 0) {
			this.topLeftItem = 0;
		} else {
			this.topLeftItem = this.topLeftItem - this.getMaxDisplay();
		}
		this.updateDisplayedItems();
	}
	this.updateSelectedItems();
}

guiOneItem.processChannelDownKey = function() {
	this.selectedItem = this.selectedItem + this.getMaxDisplay();
	if (this.selectedItem >= this.ItemData.Items.length) {		
		this.selectedItem = (this.ItemData.Items.length-1);
		if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay()) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
		}
		this.updateDisplayedItems();
	} else {
		this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
		this.updateDisplayedItems();
	}
	this.updateSelectedItems();
}