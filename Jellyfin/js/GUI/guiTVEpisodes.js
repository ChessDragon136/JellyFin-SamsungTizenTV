var guiTVEpisodes = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		SeasonData : null,
		
		selectedRow : 0,
		selectedBannerItem : 0, //Menu Icon
		
		menuItems : ['Play All'],		
		selectedMenuItem : 0,   //Play All, Shuffle All
		
		//Do not change order! Used in selectedItem statically
		optionItems : ['Play','Info','Watched','Favourite'],	
		selectedOptionItem : 0, //Play, Info, Watched, Favourited
		
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 3,
		
		startParams : []
}

guiTVEpisodes.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiTVEpisodes.start = function(title,url,selectedItem,topLeftItem) {	
	//Save Start Params	
	this.startParams = [title,url];
	
	
	//Reset Values
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.selectedRow = remotecontrol.ITEM1;
	this.selectedBannerItem = 0;
	this.selectedMenuItem = 0;
	this.selectedOptionItem = 0;
	
	//Load Data
	this.SeasonData = xmlhttp.getContent(url);
	if (this.SeasonData == null) { pagehistory.processReturnURLHistory(); }
	
	
	//Load Data
	var url2 = server.getEpisodesURL(this.SeasonData.SeriesId,this.SeasonData.Id);
	this.ItemData = xmlhttp.getContent(url2);
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }
	
	if (this.ItemData.Items.length > 0) {
		
		document.getElementById("pageContent").innerHTML = "<div id='guiTVEpisodes-MenuContainer' class='EpisodesAllOptions'></div>" +
		"<span id='guiTVEpisodes-SeriesName' class='guiTVEpisodes-SeriesName'></span>" +
		"<div id=Content class='EpisodesList'></div>";
		
		//Generate Menu Items
		document.getElementById("guiTVEpisodes-MenuContainer").innerHTML = "";
		for (var index = 0; index < this.menuItems.length; index++) {
			document.getElementById("guiTVEpisodes-MenuContainer").innerHTML += "<span id='guiTVEpisodes-MenuItem" + index + "' class='guiTVEpisodes-MenuItem'>"+this.menuItems[index]+"</span>";			
		}
		
		//Set Series Name
		document.getElementById('guiTVEpisodes-SeriesName').innerHTML = this.SeasonData.SeriesName + " - " + title; 
		
		//Display first XX series
		this.updateDisplayedItems();
		this.updateSelectedItems();	
		this.updateSelectedOptionItems();
			
		//Set Focus for Key Events
		remotecontrol.setCurrentPage("guiTVEpisodes");
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

//---------------------------------------------------------------------------------------------------
//ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

guiTVEpisodes.updateDisplayedItems = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length); index++) {		
		var title = "";
		
		if (this.ItemData.Items[index].IndexNumber === undefined) {
			title = this.ItemData.Items[index].Name;
		} else {
			title = this.ItemData.Items[index].IndexNumber + ". " + this.ItemData.Items[index].Name;
		}
		
		htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'>";
		
		if (this.ItemData.Items[index].ImageTags.Primary) {			
			var imgsrc = server.getImageURL(this.ItemData.Items[index].Id,"Primary",this.ItemData.Items[index].ImageTags.Primary,"GUITVEpisodes");
			htmlToAdd += "<span class='EpisodeListSingleImage' style=background-image:url(" +imgsrc+ ")></span>";
		} else {
			htmlToAdd += "<span class='EpisodeListSingleImage'></span>";
		}
		
		htmlToAdd += "<span class='guiTVEpisodes-EpisodeInfo'>" + 
				"<div class='guiTVEpisodes-EpisodeTitle'>"+ title +"</div>" +
				"<div id='ShowMetadata' class='metadata-Container guiTVEpisode-MetaDataPadding'>";
		
		//Set Show MetaData
		var stars = this.ItemData.Items[index].CommunityRating;
		if (stars){
	    	if (stars <3.1){
	    		htmlToAdd += "<span class='metadata-Item'><span class='metadata-ItemImageStarEmpty'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
	    	} else if (stars >=3.1 && stars < 6.5) {
	    		htmlToAdd += "<span class='metadata-Item'><span class='metadata-ItemImageStarHalf'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
	    	} else {
	    		htmlToAdd += "<span class='metadata-Item'><span class='metadata-ItemImageStarFull'></span><span class='metadata-ItemStar'><span class='metadata-ItemText'>" + stars + "</span></span></span>";
	    	}
		}
		if (this.ItemData.Items[index].OfficialRating !== undefined) {
			htmlToAdd += "<span class='metadata-Item'><span class='metadata-ItemText'>" + this.ItemData.Items[index].OfficialRating + "</span></span>";
		}
		
		if (this.ItemData.Items[index].RunTimeTicks != null) {
			htmlToAdd += "<span class='metadata-Item'><span class='metadata-ItemText'>"+support.convertTicksToMinutesJellyfin(this.ItemData.Items[index].RunTimeTicks)+"</span></span>";
		}
		
		if (this.ItemData.Items[index].UserData.IsFavorite) {
			htmlToAdd += "<span id='guiTVEpisode-Favourite"+index+"' class='metadata-Item metadata-ItemImageFavourite'></span>";
		} else {
			htmlToAdd += "<span id='guiTVEpisode-Favourite"+index+"'></span>";
		}
		if (this.ItemData.Items[index].UserData.Played) {
			htmlToAdd += "<span id='guiTVEpisode-Watched"+index+"' class='metadata-Item metadata-ItemImageWatched'></span>";
		} else {
			htmlToAdd += "<span id='guiTVEpisode-Watched"+index+"'></span>";
		}
		
		if (this.ItemData.Items[index].OfficialRating !== undefined) {
			htmlToAdd += "<span class='metadata-Item'><span class='metadata-ItemText'>" + this.ItemData.Items[index].OfficialRating + "</span></span>";
		}
		
		htmlToAdd += "</div>";
		
		if (this.ItemData.Items[index].Overview != null) {
			htmlToAdd += "<div class='guiTVEpisodes-Overview'>"+this.ItemData.Items[index].Overview+"</div>";
		}
		htmlToAdd += "</span><span id='guiTVEpisodes-Options"+index+"' class='guiTVEpisodes-Options'></span></div>";
	}
	document.getElementById("Content").innerHTML = htmlToAdd;
}

//Function sets CSS Properties so show which user is selected
guiTVEpisodes.updateSelectedItems = function () {
	support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"EpisodeListSingle guiTVEpisodes-highlightBackground","EpisodeListSingle","");
	
	//Hide controls from all items bar the selected one
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length); index++) {	
		if (index == this.selectedItem) {		
			document.getElementById('guiTVEpisodes-Options'+index).innerHTML = 
			"<svg id='guiTVEpisodes-Option0' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M16 10v28l22-14z'/></svg>" +
			"<svg id='guiTVEpisodes-Option1' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M12 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm24 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-12 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z'/></svg>" +	
			"<svg id='guiTVEpisodes-Option2' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z'/></svg>" +
			"<svg id='guiTVEpisodes-Option3' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z'/></svg>";
		} else {
			document.getElementById('guiTVEpisodes-Options'+index).innerHTML = '';
		}
	}
	
	this.updateSelectedOptionItems();
}

guiTVEpisodes.updateSelectedItem = function (action) {
	support.updateSelectedItem(this.ItemData.Items[this.selectedItem].Id,"EpisodeListSingle guiTVEpisodes-highlightBackground","EpisodeListSingle","",action);
	
	if (action == "ADD") {
		//Hide controls from all items bar the selected one
		document.getElementById('guiTVEpisodes-Options0').innerHTML = 
		"<svg id='guiTVEpisodes-Option0' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M16 10v28l22-14z'/></svg>" +
		"<svg id='guiTVEpisodes-Option1' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M12 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm24 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-12 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z'/></svg>" +	
		"<svg id='guiTVEpisodes-Option2' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z'/></svg>" +
		"<svg id='guiTVEpisodes-Option3' class='guiTVEpisodes-Option' xmlns='http://www.w3.org/2000/svg' width='38' height='38' viewBox='0 0 48 48'><path d='M24 42.7l-2.9-2.63C10.8 30.72 4 24.55 4 17 4 10.83 8.83 6 15 6c3.48 0 6.82 1.62 9 4.17C26.18 7.62 29.52 6 33 6c6.17 0 11 4.83 11 11 0 7.55-6.8 13.72-17.1 23.07L24 42.7z'/></svg>";
	}
}

guiTVEpisodes.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiTVEpisodes-MenuItem highlightBackground","guiTVEpisodes-MenuItem","guiTVEpisodes-MenuItem");
}

guiTVEpisodes.updateSelectedOptionItems = function() {
	support.updateSelectedMenuItems(this.optionItems.length,this.selectedOptionItem,"guiTVEpisodes-Option highlightBackground","guiTVEpisodes-Option","guiTVEpisodes-Option");
}


guiTVEpisodes.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode) {	
		case 38:
			logger.log("UP",1);
			this.processUpKey();
			break;	
		case 40:
			logger.log("DOWN",1);
			this.processDownKey();
			break;	
		case 37:
			logger.log("LEFT",1);
			this.processLeftKey();
			break;
		case 39:
			logger.log("RIGHT",1);
			this.processRightKey();
			break;	
		case 10009:
			logger.log("RETURN",1);
			event.preventDefault();
			pagehistory.processReturnURLHistory();
			break;	
		case 13:	
			logger.log("ENTER",1);
			this.processSelectedItem();
			break;
		case 415:
			this.playSelectedItem();
			break;	
		case 10182:
			logger.log ("EXIT KEY",1);
			tizen.application.getCurrentApplication().exit(); 
			break;
	}
}

guiTVEpisodes.processLeftKey = function() {
	switch (this.selectedRow) {
	//remotecontrol.BANNER not needed - only 1 item (hamburger icon)
	case (remotecontrol.MENU):
		if (this.selectedMenuItem > 0) {
			this.selectedMenuItem--;
			this.updateSelectedMenuItems();
		}
		break;	
	case (remotecontrol.ITEM1):
		if (this.selectedOptionItem > 0) {
			this.selectedOptionItem--;
			this.updateSelectedOptionItems();
		}
		break;	
	}
}

guiTVEpisodes.processRightKey = function() {
	switch (this.selectedRow) {
	//remotecontrol.BANNER not needed - only 1 item (hamburger icon)
	case (remotecontrol.MENU):
		if (this.selectedMenuItem < this.menuItems.length-1) {
			this.selectedMenuItem++;
			this.updateSelectedMenuItems();
		}
		break;
	case (remotecontrol.ITEM1):
		if (this.selectedOptionItem < this.optionItems.length-1) {
			this.selectedOptionItem++;
			this.updateSelectedOptionItems();
		}
		break;	
	}
}

guiTVEpisodes.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.MENU) :
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		this.selectedRow = remotecontrol.BANNER;
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger";
		break;
	case (remotecontrol.ITEM1):	
		this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
		if (this.selectedItem == -1) {
			//Unselect Option
			document.getElementById('guiTVEpisodes-Options0').innerHTML = '';
			//Unselect Item
			this.selectedItem = 0;
			this.updateSelectedItem("REMOVE");
			//Update Menu
			this.selectedRow = remotecontrol.MENU;
			this.selectedMenuItem = 0;
			this.updateSelectedMenuItems();
			//this.updateCounter();
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

guiTVEpisodes.processDownKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
		this.selectedRow = remotecontrol.MENU;
		this.selectedMenuItem = 0;
		this.updateSelectedMenuItems();
		break;
	case (remotecontrol.MENU):
		this.selectedMenuItem = -1;
		this.updateSelectedMenuItems();
		this.selectedRow = remotecontrol.ITEM1;
		
		
		
		this.updateSelectedItem("ADD");
		this.updateSelectedOptionItems();
		
		
		//this.updateCounter();
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

guiTVEpisodes.processSelectedItem = function() {
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
			support.playSelectedItem("guiTVEpisodes",this.SeasonData,this.startParams,this.selectedItem,this.topLeftItem,null);	
			break;
		}
		break;
	case (remotecontrol.ITEM1):
		switch (this.optionItems[this.selectedOptionItem]) {
		case ('Play') :
			support.playSelectedItem("guiTVEpisodes",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);	
			break;
		case ('Info') :
			support.processSelectedItem("guiTVEpisodes", this.ItemData.Items[this.selectedItem], this.startParams, this.selectedItem, this.topLeftItem, null, null, null);
			break;
		case ('Favourite') :
			if (this.ItemData.Items[this.selectedItem].UserData.IsFavorite == false) {
				this.ItemData.Items[this.selectedItem].UserData.IsFavorite = true;
				document.getElementById("guiTVEpisode-Favourite"+[this.selectedItem]).className = "metadata-Item metadata-ItemImageFavourite";
				server.setFavourite(this.ItemData.Items[this.selectedItem].Id,true);
			} else {
				this.ItemData.Items[this.selectedItem].UserData.IsFavorite = false;
				document.getElementById("guiTVEpisode-Favourite"+[this.selectedItem]).className = "";
				server.setFavourite(this.ItemData.Items[this.selectedItem].Id,false);
			}
			break;
		case ('Watched') :
			//Check if Watched or not
			if (this.ItemData.Items[this.selectedItem].UserData.Played == false) {
				this.ItemData.Items[this.selectedItem].UserData.Played = true;
				document.getElementById("guiTVEpisode-Watched"+[this.selectedItem]).className = "metadata-Item metadata-ItemImageWatched";
				server.setWatched(this.ItemData.Items[this.selectedItem].Id,true);
			} else {
				this.ItemData.Items[this.selectedItem].UserData.Played = false;
				document.getElementById("guiTVEpisode-Watched"+[this.selectedItem]).className = "";
				server.setWatched(this.ItemData.Items[this.selectedItem].Id,false);				
			}
			break;			
		}		
		break;			
	}		
}

guiTVEpisodes.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiTVEpisodes",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
	}
}