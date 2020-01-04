var guiHomeTwoItems = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		isResume : false,
		divprepend : "",
		
		ItemData2 : null,
		selectedItem2 : 0,
		topLeftItem2 : 0,
		isResume2 : false,
		divprepend2 : "bottom_",
		
		selectedRow : 0,
		selectedBannerItem : -2,
		
		bannerItems : [],
		
		MAXCOLUMNCOUNT : 3,
		MAXROWCOUNT : 1,
	
		startParams : [],
		backdropTimeout : null
}

guiHomeTwoItems.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

guiHomeTwoItems.start = function(selectedItem,topLeftItem,isTop) {
	//Get Titles
	var title1 = filesystem.getUserViewName("View1");
	var title2 = filesystem.getUserViewName("View2");
	
	//Get URLs - YES the below syntax is correct 
	//View URL initiated in guiHome with the same name as value stored in user setting
	var url1 = guiHome[filesystem.getUserProperty("View1")];
	var url2 = guiHome[filesystem.getUserProperty("View2")];
	
	//Load Data
	this.ItemData = xmlhttp.getContent(url1);
	if (this.ItemData == null) { pagehistory.processReturnURLHistory(); }
	
	this.ItemData2 = xmlhttp.getContent(url2);	
	if (this.ItemData2 == null) { return; }
	
	//If array like MoviesRecommended alter 
	if (title1 == "Suggested For You") {
		if (this.ItemData[0] === undefined){
			this.ItemData[0] = {"Items":[]}; //Create empty Items array and continue
		}
		this.ItemData = this.ItemData[0];
	}
	if (title2 == "Suggested For You") {
		if (this.ItemData2[0] === undefined){
			this.ItemData2[0] = {"Items":[]}; //Create empty Items array and continue
		}
		this.ItemData2 = this.ItemData2[0];
	}
	
	//Latest Page Fix
	if (title1 == "Latest TV" || title1 == "Latest Movies") {
		this.ItemData.Items = this.ItemData;
	}
	if (title2 == "Latest TV" || title2 == "Latest Movies") {
		this.ItemData2.Items = this.ItemData2;
	}
	
	if (this.ItemData.Items.length > 0 && this.ItemData2.Items.length > 0) {
		//Set PageContent
		document.getElementById("pageContent").innerHTML = "<div id=Center class='guiHome-Center'>" + 
				"<span class='guiHome-Title'>"+title1+"</span><div id='TopRow'><div id=Content></div></div>" +
				"<span class='guiHome-Title'>"+title2+"</span><div id='BottomRow'><div id=Content2></div></div>" +
				"</div>";
	
		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume = (title1 == "Resume" ||  title1 == "Continue Watching" ) ? true : false;
		this.isResume2 = (title2 == "Resume" ||  title2 == "Continue Watching" ) ? true : false;
		
		//If to determine positioning of content
		document.getElementById("Center").style.top = "100px";
		
		//Generate Banner Items
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
		
		if (isTop == false) {
			//Bottom Item Row is selected
			//Clear top row
			this.selectedRow = remotecontrol.ITEM1;
			this.topLeftItem = 0;
			this.updateDisplayedItems();
			this.updateSelectedItems();	//Will select one item
			this.updateSelectedItem("REMOVE");	//Will unselect the 1 item
			
			//Select bottom row
			this.selectedItem2 = selectedItem;
			this.selectedRow = remotecontrol.ITEM2;
			this.topLeftItem2 = topLeftItem;
			this.updateDisplayedItems();
			this.updateSelectedItems();	
		} else {
			//Top Item Row is selected
			//Clear bottom row
			this.selectedRow = remotecontrol.ITEM2;
			this.topLeftItem2 = 0;
			this.updateDisplayedItems();
			this.updateSelectedItems();	//Will select one item
			this.updateSelectedItem("REMOVE");	//Will unselect the 1 item
			
			//Select Top row
			this.selectedItem = selectedItem;
			this.selectedRow = remotecontrol.ITEM1;
			this.topLeftItem = topLeftItem;
			this.updateDisplayedItems();	
			this.updateSelectedItems();			
		}	

		//Function to generate random backdrop
		this.backdropTimeout = setTimeout(function(){
			var randomImageURL = server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=20&EnableTotalRecordCount=false");
			var randomImageData = xmlhttp.getContent(randomImageURL);
			if (randomImageData == null) { return; }
			
			for (var index = 0; index < randomImageData.Items.length; index++) {
				if (randomImageData.Items[index ].BackdropImageTags.length > 0) {
					support.setBackdropId(randomImageData.Items[index ].Id);
					var imagePos = Math.floor((Math.random() * randomImageData.Items[index].BackdropImageTags.length) + 0);
					var imgsrc = server.getImageURL(randomImageData.Items[index ].Id,"Backdrop",randomImageData.Items[index ].BackdropImageTags[imagePos],"AppBackdrop",imagePos);
					support.fadeImage(imgsrc);
					break;
				}
			}
		}, 500);
		
		//Set remote control
		remotecontrol.setCurrentPage("guiHomeTwoItems");
		
	} else if (this.ItemData.Items.length > 0 && this.ItemData2.Items.length == 0) {
		guiHomeOneItem.start(0,0);
	} else if (this.ItemData.Items.length == 0 && this.ItemData2.Items.length > 0) {
		guiHomeOneItem.start(0,0);
	} else if (this.ItemData.Items.length == 0 && this.ItemData2.Items.length == 0) {
		//No data to Show at all!!
		guiHomeOneItem.start(0,0);
	}
}

//---------------------------------------------------------------------------------------------------
//      ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
guiHomeTwoItems.updateDisplayedItems = function() {
	if (this.selectedRow == remotecontrol.ITEM2) {
		support.updateDisplayedItems(this.ItemData2.Items,this.selectedItem2,this.topLeftItem2,
				Math.min(this.topLeftItem2 + this.getMaxDisplay(),this.ItemData2.Items.length),"Content2",this.divprepend2,this.isResume2,null,true);
	} else {
		support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content",this.divprepend,this.isResume,null,true);
	}
}

//Function sets CSS Properties so show which user is selected
guiHomeTwoItems.updateSelectedItems = function () {
	if (this.selectedRow == remotecontrol.ITEM2) {
		support.updateSelectedNEW(this.ItemData2.Items,this.selectedItem2,this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplay(),this.ItemData2.Items.length),"Series Selected highlightBorder","Series",this.divprepend2);
		this.updateCounter();
	} else {
		support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Series Selected highlightBorder","Series",this.divprepend);
		this.updateCounter();
	}
}

guiHomeTwoItems.updateSelectedItem = function (action) {
	if (this.selectedRow == remotecontrol.ITEM2) {
		support.updateSelectedItem(this.ItemData2.Items[this.selectedItem2].Id,"Series Selected highlightBorder","Series",this.divprepend2,action);
	} else {
		support.updateSelectedItem(this.ItemData.Items[this.selectedItem].Id,"Series Selected highlightBorder","Series",this.divprepend,action);
	}
}

guiHomeTwoItems.updateSelectedBannerItems = function() {
	support.updateSelectedBannerItems(this.bannerItems,this.selectedBannerItem,true);
}

guiHomeTwoItems.updateCounter = function () {
	if (this.selectedRow == remotecontrol.BANNER) {
		support.updateCounter(null,0);
	} else if (this.selectedRow == remotecontrol.ITEM1) {
		support.updateCounter(this.selectedItem,this.ItemData.Items.length);
	} if (this.selectedRow == remotecontrol.ITEM2) {
		support.updateCounter(this.selectedItem2,this.ItemData2.Items.length);
	}
}

guiHomeTwoItems.keyDown = function() {
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

guiHomeTwoItems.processLeftKey = function() {
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
				this.topLeftItem = this.selectedItem;
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}
		break;		
	case (remotecontrol.ITEM2):
		this.selectedItem2--;
		if (this.selectedItem2 == -1) {
			this.selectedItem2 = 0;
		} else {
			if (this.selectedItem2 < this.topLeftItem2) {
				this.topLeftItem2 = this.selectedItem2;
				if (this.topLeftItem2 < 0) {
					this.topLeftItem2 = 0;
				}
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}
		break;
	}
}

guiHomeTwoItems.processRightKey = function() {
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
				this.topLeftItem++;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}	
		break;		
	case (remotecontrol.ITEM2):
		this.selectedItem2++;
		if (this.selectedItem2 >= this.ItemData2.Items.length) {
			this.selectedItem2--;
		} else {
			if (this.selectedItem2 >= this.topLeftItem2+this.getMaxDisplay() ) {
				this.topLeftItem2++;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		}	
		break;
	}
}

guiHomeTwoItems.processUpKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.ITEM1):
		this.updateSelectedItem("REMOVE");
		this.selectedRow = remotecontrol.BANNER;
		this.selectedBannerItem = 0;
		this.updateSelectedBannerItems();
		this.updateCounter();
		break;
	case (remotecontrol.ITEM2):
		this.updateSelectedItem("REMOVE")
		this.selectedRow = remotecontrol.ITEM1;
		this.updateSelectedItem("ADD");		
		this.updateCounter();
		break;
	}
}

guiHomeTwoItems.processDownKey = function() {
	switch (this.selectedRow) {
	case (remotecontrol.BANNER):
		this.selectedBannerItem = -2; //Yes -2 as -1 is hamburger icon!
		this.updateSelectedBannerItems();
		this.selectedRow = remotecontrol.ITEM1;
		this.updateSelectedItem("ADD");
		this.updateCounter();
		break;
	case (remotecontrol.ITEM1):
		this.updateSelectedItem("REMOVE");
		this.selectedRow = remotecontrol.ITEM2;
		this.updateSelectedItem("ADD");	
		this.updateCounter();
		break;
	}
}

guiHomeTwoItems.processSelectedItem = function () {
	clearTimeout(this.backdropTimeout);
	if (this.selectedRow == remotecontrol.BANNER) {
		if (this.selectedBannerItem == -1) {
			//Menu Hamburger
			//Reset all vars to default as user may return from menu
			document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
			this.selectedBannerItem = 0;
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.selectedItem2 = 0;
			this.topLeftItem2 = 0;
			this.selectedRow = remotecontrol.ITEM1;
			pagehistory.updateURLHistory("guiHomeTwoItems",null,null,0,0,true);
			guiMainMenu.requested("guiHomeTwoItems",this.ItemData.Items[0].Id, "Series Selected highlightBorder");
		} else {
			pagehistory.updateURLHistory("guiHomeTwoItems",null,null,0,0,true);
			guiHome.processHomePageMenu(this.bannerItems[this.selectedBannerItem]);
		}
	} else {
		var isLatest = false;
		if (this.selectedRow == remotecontrol.ITEM2) {			
			if (this.startParams[0] == "New TV") {
				isLatest = true;
			}
			support.processSelectedItem("guiHomeTwoItems",this.ItemData2.Items[this.selectedItem2],null,this.selectedItem2,this.topLeftItem2,false,null,isLatest); 
		} else {
			if (this.startParams[2] == "New TV") {
				isLatest = true;
			}
			support.processSelectedItem("guiHomeTwoItems",this.ItemData.Items[this.selectedItem],null,this.selectedItem,this.topLeftItem,true,null,isLatest); 
		}
	}
}

guiHomeTwoItems.playSelectedItem = function () {
	if (this.selectedRow == remotecontrol.ITEM1) {
		support.playSelectedItem("guiHomeTwoItems",this.ItemData.Items[this.selectedItem],null,this.selectedItem,this.topLeftItem,true);	
	} else if (this.selectedRow == remotecontrol.ITEM2) {
		support.playSelectedItem("guiHomeTwoItems",this.ItemData2.Items[this.selectedItem2],null,this.selectedItem2,this.topLeftItem2,false);	
	}
}