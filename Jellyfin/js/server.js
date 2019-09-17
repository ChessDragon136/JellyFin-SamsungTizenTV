	var server = {
			serverAddr : "",
			UserID : "",
			UserName : "",
			Device : "Samsung Smart TV",
			DeviceID : "00000000000000000000000000000000",
			AuthenticationToken : null
	};
	
	server.getserverAddr = function() {
		return this.serverAddr;
	};
	
	server.setserverAddr = function(serverAddr) {
		this.serverAddr = serverAddr;
	};
	
	server.getUserID = function() {
		return this.UserID;
	}

	server.setUserID = function(UserID) {
		this.UserID = UserID;
	}

	server.getUserName = function() {
		return this.UserName;
	}

	server.setUserName = function(UserName) {
		this.UserName = UserName;
	}
	
	server.getDevice = function() {
		return this.Device;
	}
	
	server.setDevice = function(Device) {
		this.Device = Device;
	}

	server.getDeviceID = function() {
		return this.DeviceID;
	}
	
	server.setDeviceID = function(DeviceID) {
		this.DeviceID = DeviceID;
	}

	server.getAuthToken = function() {
		return this.AuthenticationToken;
	}
	
	server.setAuthToken = function(AuthenticationToken) {
		this.AuthenticationToken = AuthenticationToken;
	}

//------------------------------------------------------------
//  Logout
//------------------------------------------------------------		
	
	server.logout = function() {
		var url = this.serverAddr + "/Sessions/Logout";
		xmlhttp.postContent(url,null);
	}
	
//------------------------------------------------------------
//  Generic Functions
//------------------------------------------------------------	
	server.getCustomURL = function(SortParams) {
		if (SortParams != null){
			return  server.getserverAddr() + SortParams;
		} else {
			return  server.getserverAddr();
		}	
	}	
	
	server.getUserURL = function() {
		return server.getserverAddr() + "/Users/" + server.getUserID() + "?format=json&Fields=PrimaryImageTag";
	}
	
	server.getItemTypeURL = function(SortParams) {
		if (SortParams != null){
			return  server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?format=json" + SortParams;
		} else {
			return  server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?format=json";
		}	
	}
	
	server.getItemInfoURL = function(ParentID, SortParams) {
		if (SortParams != null){
			return  server.getserverAddr() + "/Users/" + server.getUserID() + "/Items/"+ParentID+"?format=json" + SortParams;
		} else {
			return  server.getserverAddr() + "/Users/" + server.getUserID() + "/Items/"+ParentID+"?format=json";
		}		
	}	

	server.getChildItemsURL = function(ParentID, SortParams) {
		if (SortParams != null){
			return  server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?ParentId="+ParentID+"&format=json" + SortParams;
		} else {
			return  server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?ParentId="+ParentID+"&format=json";
		}	
	}
	
//------------------------------------------------------------
//  TV Functions
//------------------------------------------------------------	
	
	server.getNextUpURL = function(seriesID) {
		return server.getserverAddr() + "/Shows/NextUp/?SeriesId=" + seriesID + "&UserId=" + server.getUserID()+"&format=json";
	}
	
	server.getSeasonsURL = function(seriesID) {
		return server.getserverAddr() + "/Shows/" + seriesID + "/Seasons?UserId=" + server.getUserID()+"&format=json";
	}
	
	server.getEpisodesURL = function(seriesID,seasonID) {
		return server.getserverAddr() + "/Shows/" + seriesID + "/Episodes?UserId=" + server.getUserID() + "&SeasonId=" + seasonID+"&format=json&Fields=Overview";
	}
	
//------------------------------------------------------------
//  Image Functions
//------------------------------------------------------------		
	server.getImageURL = function(itemId,imagetype,maxwidth,maxheight,unplayedcount,played,playedpercentage,chapter) {
		var query = "";
		switch (imagetype) {
		case "Primary":
			query = "/Items/"+ itemId +"/Images/Primary/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		case "Banner":
			query = "/Items/"+ itemId +"/Images/Banner/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		case "Backdrop":
			query = "/Items/"+ itemId +"/Images/Backdrop/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		case "Thumb":
			query = "/Items/"+ itemId +"/Images/Thumb/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;	
		case "Logo":
			query = "/Items/"+ itemId +"/Images/Logo/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		case "Disc":
			query = "/Items/"+ itemId +"/Images/Disc/0?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		case "UsersPrimary":
			query = "/Users/" + itemId + "/Images/Primary?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		case "Chapter":
			query = "/Items/" + itemId + "/Images/Chapter/" + chapter + "?maxwidth="+maxwidth+"&maxheight="+maxheight + "&quality=90";
			break;
		}
		
		if (main.isImageCaching()) {
			if (filesystem.imageCachejson == null) {
				filesystem.imageCachejson = {"Images":[]};
			}
			
			for (var i = 0; i < filesystem.imageCachejson.Images.length; i++) {
				//Is image in cache - If so use it
				if (filesystem.imageCachejson.Images[i].URL == query) {
					return filesystem.imageCachejson.Images[i].DataURI;
				}
			}

			//Use URL & Add to Cache
			var full = server.getserverAddr() +  query;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', full, true);
			xhr.responseType = 'blob';

			xhr.onload = function(e) {
				if (this.status == 200) {
					var blob = this.response;
					filesystem.imageCachejson.Images[filesystem.imageCachejson.Images.length] = {"URL":query,"DataURI":window.URL.createObjectURL(blob)};
			    	//Does not work - See filesystem.js
			    	//localStorage.setItem("imageCache", JSON.stringify(filesystem.imageCachejson));
				}
			};
			xhr.send();		
			return full;
		} else {
			return server.getserverAddr() +  query;
		}
	}	
	
	server.getBackgroundImageURL = function(itemId,imagetype,maxwidth,maxheight,unplayedcount,played,playedpercentage,totalbackdrops) {
		var index =  Math.floor((Math.random()*totalbackdrops)+0);
		return server.getserverAddr() + "/Items/"+ itemId +"/Images/Backdrop/"+index+"?maxwidth="+maxwidth+"&maxheight="+maxheight+ "&Quality=90";
	}	
	
//------------------------------------------------------------
//  User Views URL Generation
//------------------------------------------------------------			
	server.getMoviesViewQueryPart = function() {
		var ParentId = server.getUserViewId("movies", "UserView");
		
		if (ParentId == null) { 
			return "";
		} else {
			return "&ParentId="+ParentId;
		}
	}

	server.getTvViewQueryPart = function() {
		var ParentId = server.getUserViewId("tvshows", "UserView");
		
		if (ParentId == null) { 
			return "";
		} else {
			return "&ParentId="+ParentId;
		}
	}

	server.getUserViewId = function (collectionType, Type) {
		var folderId = null;
		var userViewsURL = server.getUserViews();
		var userViews = xmlhttp.getContent(userViewsURL);
		for (var i = 0; i < userViews.Items.length; i++){
			if ((Type === undefined || userViews.Items[i].Type == Type) && userViews.Items[i].CollectionType == collectionType){
				folderId = userViews.Items[i].Id;
			}
		}
		return folderId;
	}
	
	server.getUserViews = function () {
		return server.getserverAddr()  + "/Users/" + server.getUserID() + "/Views?format=json&SortBy=SortName&SortOrder=Ascending";
	}	
	
	
//------------------------------------------------------------
//  Media Updates
//------------------------------------------------------------	
	
server.videoStarted = function(showId,MediaSourceID,ticks,PlayMethod) {
	var url = this.serverAddr + "/Sessions/Playing";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":false,"IsMuted":false,"PositionTicks":'+ticks*10000+',"PlayMethod":'+PlayMethod+'}';
	xmlhttp.postContent(url,contentToPost);
}

server.videoStopped = function(showId,MediaSourceID,ticks,PlayMethod) {
	var url = this.serverAddr + "/Sessions/Playing/Stopped";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":false,"IsMuted":false,"PositionTicks":'+ticks*10000+',"PlayMethod":'+PlayMethod+'}';
	xmlhttp.postContent(url,contentToPost);
}

server.videoPaused = function(showId,MediaSourceID,ticks,PlayMethod) {
	var url = this.serverAddr + "/Sessions/Playing/Progress";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":true,"IsMuted":false,"PositionTicks":'+ticks*10000+',"PlayMethod":'+PlayMethod+'}';
	xmlhttp.postContent(url,contentToPost);
}

server.videoTime = function(showId,MediaSourceID,ticks,PlayMethod) {
	var url = this.serverAddr + "/Sessions/Playing/Progress";
	var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":'+showId+',"MediaSourceId":'+MediaSourceID+',"IsPaused":false,"IsMuted":false,"PositionTicks":'+ticks*10000+',"PlayMethod":'+PlayMethod+'}';
	xmlhttp.postContent(url,contentToPost);
}	

server.videoStopTranscode = function() {
	var url = this.serverAddr + "/Videos/ActiveEncodings?DeviceId="+server.getDeviceID();
	xmlhttp.deleteContent(url);
}	
