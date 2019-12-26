var guiSeries = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		isResume : false,
		genreType : "",
			
		currentView : "",
		currentMediaType : "",	
		
		selectedRow : 0,
		selectedBannerItem : 0,
		
		bannerItems : [],
		tvBannerItems : ["Series","Latest","Genre"],
		movieBannerItems : ["All","Latest","Genre"],
		
		ItemIndexData : null,
		indexSeekPos : -1,
		indexTimeout : null,
		
		MAXCOLUMNCOUNT : 9, //Default TV
		MAXROWCOUNT : 3,
		
		startParams : []
}

guiSeries.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiSeries.start = function(title,url,selectedItem,topLeftItem) {	
	//Save Start Params	
	this.startParams = [title,url];
	
	//Reset Values - This view can be called from itself (Series to Genre...) 
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.selectedRow = remotecontrol.ITEM1;
	this.genreType = null;
	this.bannerItems = [];
	this.selectedBannerItem = 0;
	
	//Set Display Size from User settings
	this.MAXCOLUMNCOUNT = (filesystem.getUserProperty("LargerView") == true) ? 7 : 9;
	this.MAXROWCOUNT = (filesystem.getUserProperty("LargerView") == true) ? 2 : 3;

	//On show all items pages, there is no limit - For music there is due to speed!
	url = url + "&Limit="+filesystem.getTVProperty("ItemPaging");
	this.ItemData = xmlhttp.getContent(url);
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }

	//Update Padding on pageContent
	document.getElementById("pageContent").innerHTML = "<div id=Center class='guiseries-Center'>" +
			"<div id=Content></div>" +
			"</div>";
	
	//Split Title - 1st Element = View, 2nd = Type
	this.currentMediaType =  title.split(" ")[1];
	logger.log(this.currentMediaType);
	
	//If TV change to series
	this.currentView =  title.split(" ")[0];
	if (title == "All TV"){
		this.currentView = "Series";
	}
	
	//If Genre, set genreType
	if (this.currentView == "Genre") {
		this.genreType = (this.currentMediaType == "TV") ? "Series" : "Movie";
	}
	
	//If Latest, fix Items array
	if (this.currentView == "Latest") {
		this.ItemData.Items = this.ItemData;
	}
	
	//Fix missing Total Record Count by setting to ItemData.length
	//Some API calls do not have TotalRecordCount, others do. This view relies on it!
	if (this.ItemData.Items.TotalRecordCount == undefined) {
		this.ItemData.Items.TotalRecordCount = this.ItemData.Items.length;
	}
	
	//Set Banner Items
	if (this.currentMediaType == "TV") {
		this.bannerItems = this.tvBannerItems;
	}
	if (this.currentMediaType == "Movies") {
		this.bannerItems = this.movieBannerItems;
	}

	
	if (this.ItemData.Items.length > 0) {		
		//Determine if extra top padding is needed for items <= MaxRow
		if (this.MAXROWCOUNT > 2) {
			//1 Row
			if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
				document.getElementById("Center").style.top = "210px";
			//2 Rows	
			} else if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT * 2) {
				document.getElementById("Center").style.top = "140px";
			} else {
				document.getElementById("Center").style.top = "70px";
			}
		} else {
			//1 Row
			if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
				document.getElementById("Center").style.top = "210px";
			//2 Rows
			} else {
				document.getElementById("Center").style.top = "140px";
			}
		}
		
		//Create banner headers only if all tv or all movies is selected
		document.getElementById("bannerSelection").innerHTML = "";
		for (var index = 0; index < this.bannerItems.length; index++) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";			
			} else {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";					
			}
		}
	
		//Indexing Algorithm
		this.ItemIndexData = support.processIndexing(this.ItemData.Items); 
	
		//Display first XX series
		this.updateDisplayedItems();
		this.updateSelectedItems();
		
		//Update Selected Banner Item Special - Direct call to override selectedItem with -10 (nothing selected)
		//Simply cleaner than having another 2 if statements in the banner header setup above
		support.updateSelectedBannerItems(this.bannerItems,-10,this.currentView);

		//Set Focus for Key Events
		remotecontrol.setCurrentPage("guiSeries");
		
	} else {
		//Set message to user
		document.getElementById("Counter").innerHTML = "";
		document.getElementById("Content").style.fontSize="40px";
		document.getElementById("Content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen";
		
		remotecontrol.setCurrentPage("NoItems");
	}	
}


//---------------------------------------------------------------------------------------------------
//ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

guiSeries.updateDisplayedItems = function() {
	if (this.topLeftItem + this.getMaxDisplay() > this.ItemData.Items.length) {
		if (this.ItemData.TotalRecordCount > this.ItemData.Items.length) {
			this.loadMoreItems();
		}
	}
	
	support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",this.isResume,this.genreType);
}

//Function sets CSS Properties so show which user is selected
guiSeries.updateSelectedItems = function () {
	if (filesystem.getUserProperty("LargerView") == true) {
		support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortraitLarge Selected highlightBorder","SeriesPortraitLarge","",false,this.ItemData.TotalRecordCount);
	} else {
		support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortrait SelectedLarger highlightBorder","SeriesPortrait","",false,this.ItemData.TotalRecordCount);
	}
	this.updateCounter();
}

guiSeries.updateSelectedItem = function (action) {
	if (filesystem.getUserProperty("LargerView") == true) {
		support.updateSelectedItem(this.ItemData.Items[this.selectedItem].Id,"SeriesPortraitLarge Selected highlightBorder","SeriesPortraitLarge","",action);
	} else {
		support.updateSelectedItem(this.ItemData.Items[this.selectedItem].Id,"SeriesPortrait SelectedLarger highlightBorder","SeriesPortrait","",action);
	}
}

guiSeries.updateSelectedBannerItems = function() {
	support.updateSelectedBannerItems(this.bannerItems,this.selectedBannerItem, this.currentView);
}

guiSeries.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1) {
		support.updateCounter(this.selectedItem,this.ItemData.TotalRecordCount );
	} 
}

guiSeries.keyDown = function() {
	var keyCode = event.keyCode;
	
	//Clear Indexing Letter Display timeout & Hide
	clearTimeout(this.indexTimeout);
	document.getElementById("guiSeriesIndexing").style.opacity = 0;
	
	switch(keyCode) {
		//Need Logout Key
		case 37:
			this.processLeftKey();
			break;
		case 39:
			this.processRightKey();
			break;		
		case 38:
			this.processUpKey();
			break;	
		case 40:
			this.processDownKey();
			break;	
		case 428: 
			this.processChannelUpKey();
			break;			
		case 427: 
			this.processChannelDownKey();
			break;	
		case 13:
			this.processSelectedItem();
			break;
		case 415:
			this.playSelectedItem();
			break;	
		case 405:
			this.processIndexing();
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

guiSeries.processLeftKey = function() {
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

guiSeries.processRightKey = function() {
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
			this.selectedItem = this.selectedItem - 1;				
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
		break;	
	}
}

guiSeries.processUpKey = function() {
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

guiSeries.processDownKey = function() {
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

guiSeries.processChannelUpKey = function() {
	if (this.selectedRow == remotecontrol.ITEM1) {
		if (this.selectedItem > -1) {
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
	}
}

guiSeries.processChannelDownKey = function() {
	if (this.selectedRow == remotecontrol.ITEM1) {
		if (this.selectedItem > -1) {
			this.selectedItem = this.selectedItem + this.getMaxDisplay();
			if (this.selectedItem >= this.ItemData.Items.length) {	
				
				if (this.ItemData.TotalRecordCount > this.ItemData.Items.length) {
					this.loadMoreItems();
					
					if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
						this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
						this.updateDisplayedItems();
					}		
				} else {
					this.selectedItem = (this.ItemData.Items.length-1);
					if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
						this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
						this.updateDisplayedItems();
					}
				}	
			} else {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}
	}
}

guiSeries.processSelectedItem = function() {
	if (this.selectedRow == remotecontrol.BANNER) {
		if (this.selectedBannerItem == -1) {
			//Menu Hamburger
			//Reset all vars to default as user may return from menu
			document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
			this.selectedBannerItem = 0;
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedRow = remotecontrol.ITEM1;
			pagehistory.updateURLHistory("guiSeries",this.startParams[0],this.startParams[1],0,0,true);
			if (filesystem.getUserProperty("LargerView") == true) {
				guiMainMenu.requested("guiSeries",this.ItemData.Items[0].Id, "SeriesPortraitLarge Selected highlightBorder");
			} else {
				guiMainMenu.requested("guiSeries",this.ItemData.Items[0].Id, "SeriesPortrait Selected highlightBorder");	
			}
		} else {
			switch (this.bannerItems[this.selectedBannerItem]) {
			case "All":	
				var url = server.getItemTypeURL("&IncludeItemTypes=Movie&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
				guiSeries.start("All Movies",url,0,0);
				break;
			case "Series":
				var url = server.getItemTypeURL("&IncludeItemTypes=Series&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
				guiSeries.start("All TV",url,0,0);
				break;
			case "Latest":		
				if (this.currentMediaType == "Movies") {
					var url = server.getCustomURL("/Users/" + server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
					guiSeries.start("Latest Movies",url,0,0);
				} else if (this.currentMediaType == "TV"){
					var url = server.getCustomURL("/Users/" + server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
					guiSeries.start("Latest TV",url,0,0);
				}		
				break;
			case "Genre":
				if (this.currentMediaType == "Movies") {	
					var url1 = server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + server.getUserID());
					guiSeries.start("Genre Movies",url1,0,0);
				} else if (this.currentMediaType == "TV"){
					var url1 = server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + server.getUserID());
					guiSeries.start("Genre TV",url1,0,0);
				}		
				break;
			}
		}
	} else {
		var isLatest = false;
		if (this.currentView == "Latest") {
			isLatest = true;
		}
		support.processSelectedItem("guiSeries",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null,this.genreType,isLatest); 	
	}
}

guiSeries.playSelectedItem = function () {
	support.playSelectedItem("guiSeries",this.ItemData.Items[this.selectedItem],this.startParams,this.selectedItem,this.topLeftItem,null);
}


//This works perfectly - Do not touch now!
guiSeries.processIndexing = function() {
	if (this.selectedItem > -1) {
		var indexLetter = this.ItemIndexData[0];
		var indexPos = this.ItemIndexData[1];
		
		//Start indexing based off current selected item
		var letterSelected = this.ItemData.Items[this.selectedItem].SortName.charAt(0).toLowerCase();
		if(new RegExp("^([^a-z])").test(letterSelected)){
			letterSelected = "#";
		}
		
		
		var indexSeekPos = 0; //Safety
		for (var i = 0; i < indexLetter.length; i++) {
			if (letterSelected == indexLetter[i]) {
				indexSeekPos = i+1;
				break;
			}
		}
		
		if (indexSeekPos >= indexPos.length) {
			//Check if more items, if so load next batch
			if (this.ItemData.TotalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();
				//If we were skipping through the alphabet we need to bail here.
				if (this.indexTimeout){
					return;
				}
			} else {
				indexSeekPos = 0;
				this.topLeftItem = 0;
			}
		}
		
		this.selectedItem = indexPos[indexSeekPos];
		this.topLeftItem = this.selectedItem; //safety net
		
		for (var i = this.selectedItem; i > this.selectedItem-this.MAXCOLUMNCOUNT; i--) {		
			if (i % this.MAXCOLUMNCOUNT == 0) {
				this.topLeftItem = i;
				break;
			}
		}
		
		document.getElementById("guiSeriesIndexing").innerHTML = indexLetter[indexSeekPos].toUpperCase();
		document.getElementById("guiSeriesIndexing").style.opacity = 1;
		
		clearTimeout(this.indexTimeout);
		this.indexTimeout = setTimeout(function(){
			document.getElementById("guiSeriesIndexing").style.opacity = 0;
			guiSeries.updateDisplayedItems();
			guiSeries.updateSelectedItems();
		}, 500);
	}
}

guiSeries.loadMoreItems = function() {
	if (this.ItemData.TotalRecordCount > this.ItemData.Items.length) {
		//Remove User Control
		remotecontrol.setCurrentPage("NoItems");
		
		//Load Data
		var originalLength = this.ItemData.Items.length
		var ItemDataRemaining = xmlhttp.getContent(this.startParams[1] + "&Limit="+filesystem.getTVProperty("ItemPaging") + "&StartIndex=" + originalLength);
		if (ItemDataRemaining == null) { return; }
		
		for (var index = 0; index < ItemDataRemaining.Items.length; index++) {
			this.ItemData.Items[index+originalLength] = ItemDataRemaining.Items[index];
		}
		
		//Reprocess Indexing Algorithm
		this.ItemIndexData = support.processIndexing(this.ItemData.Items); 
				
		//Pass back Control
		remotecontrol.setCurrentPage("guiSeries");
	}
}