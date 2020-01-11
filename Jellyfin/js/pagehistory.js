var pagehistory = {
		previousPageDetails : [],
};

pagehistory.updateURLHistory = function(page,title,url,selectedItem,topLeftItem,isTop) {
	//Only add new page if going to new page (if url's are the same don't add) - Length must be greater than 0
	if (this.previousPageDetails.length > 0) {
		//If greater than 0 check if page isnt the same as previous page
		
		if (this.previousPageDetails[this.previousPageDetails.length-1][2] != url) {
			this.previousPageDetails.push([page,title,url,selectedItem,topLeftItem,isTop]);
		} else {
			if (this.previousPageDetails[this.previousPageDetails.length-1][0] != page) {
				//Required! Trust me dont remove this if!
				this.previousPageDetails.push([page,title,url,selectedItem,topLeftItem,isTop]);
			} else {
				logger.log  ("Page History: New Item not added - Is duplicate of previous page. Length: " + this.previousPageDetails.length);
			}		
		}
	} else {
		this.previousPageDetails.push([page,title,url,selectedItem,topLeftItem,isTop]);
	}
}

//Below method used for Main Menu & Playlist Deletion
pagehistory.removeLatestURL = function() {
	this.previousPageDetails.pop();
}
	
pagehistory.processReturnURLHistory = function() {
	//Set Hamburger Menu to be unselected - Required if the user has the menu item selected when pressing return
	document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
	
	if (this.previousPageDetails.length > 0) {
		var array = this.previousPageDetails[this.previousPageDetails.length-1];
		var page = array[0];
		var title = array[1];
		var url = array[2];
		var selectedItem = array[3];
		var topLeftItem = array[4];
		var isTop = array[5];
			
		//Remove from array
		this.previousPageDetails.pop();
		
		//Handle Navigation?
		switch (page) {
			case "guiHomeOneItem":
				guiHomeOneItem.start(selectedItem,topLeftItem);
				break;
			case "guiHomeTwoItems": 	
				guiHomeTwoItems.start(selectedItem,topLeftItem,isTop);
				break;	
			case "guiSeries":
				guiSeries.start(title,url,selectedItem,topLeftItem);
				break;
			case "guiTVEpisodes":
				guiTVEpisodes.start(title,url,selectedItem,topLeftItem);
				break;
			case "guiTVEpisode":
				guiTVEpisode.start(url,selectedItem,topLeftItem);
				break;	
			case "guiTVShow":
				guiTVShow.start(url,selectedItem,topLeftItem);
				break;		
			case "guiItemDetails":
				guiItemDetails.start(url,selectedItem);
				break;	
			case "GuiPage_Settings": 	
				guiSettings.start();
				break;
			case "guiOneItem":
				guiOneItem.start(title,url,selectedItem,topLeftItem);
				break;					
			/*	
			 * Below not Implemented yet
			 * 
			
			case "guiMusicArtist": 	
				guiMusicArtist.start(title,url,selectedItem, topLeftItem);
				break;
			case "guiMusicAZ": 	
				guiMusicAZ.start(title,selectedItem);//Not actually Title - Holds page!
				break;		
			case "guiMusic": 	
				guiMusic.start(title,url);
				break;	
			case "guiCastMember": 	
				guiCastMember.start(title,url,selectedItem,topLeftItem);
				break;
			case "guiPhotos":
				guiPhotos.start(title,url,selectedItem,topLeftItem);
				break;
			*/
			default:
				break;
		}
		

	} else {
		//Replace wiht exit gui! Required to pass Samsung tests
		widgetAPI.sendReturnEvent();
	}
}

pagehistory.destroyURLHistory = function() {
	this.previousPageDetails.length = 0;
}
