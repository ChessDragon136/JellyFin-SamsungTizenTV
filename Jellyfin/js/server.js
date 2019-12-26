	var server = {
	    serverAddr: "",
	    UserID: "",
	    UserName: "",
	    Device: "Samsung Smart TV",
	    DeviceID: "00000000000000000000000000000000",
	    AuthenticationToken: null
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
	    xmlhttp.postContent(url, null);
	}

	 //------------------------------------------------------------
	 //  Generic Functions
	 //------------------------------------------------------------	
	server.getCustomURL = function(SortParams) {
	    if (SortParams != null) {
	        return server.getserverAddr() + SortParams;
	    } else {
	        return server.getserverAddr();
	    }
	}

	server.getUserURL = function() {
	    return server.getserverAddr() + "/Users/" + server.getUserID() + "?format=json&Fields=PrimaryImageTag";
	}

	server.getItemTypeURL = function(SortParams) {
	    if (SortParams != null) {
	        return server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?format=json" + SortParams;
	    } else {
	        return server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?format=json";
	    }
	}

	server.getItemInfoURL = function(ParentID, SortParams) {
	    if (SortParams != null) {
	        return server.getserverAddr() + "/Users/" + server.getUserID() + "/Items/" + ParentID + "?format=json" + SortParams;
	    } else {
	        return server.getserverAddr() + "/Users/" + server.getUserID() + "/Items/" + ParentID + "?format=json";
	    }
	}

	server.getChildItemsURL = function(ParentID, SortParams) {
	    if (SortParams != null) {
	        return server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?ParentId=" + ParentID + "&format=json" + SortParams;
	    } else {
	        return server.getserverAddr() + "/Users/" + server.getUserID() + "/Items?ParentId=" + ParentID + "&format=json";
	    }
	}

	 //------------------------------------------------------------
	 //  TV Functions
	 //------------------------------------------------------------	

	server.getNextUpURL = function(seriesID) {
	    return server.getserverAddr() + "/Shows/NextUp/?SeriesId=" + seriesID + "&UserId=" + server.getUserID() + "&format=json";
	}

	server.getSeasonsURL = function(seriesID) {
	    return server.getserverAddr() + "/Shows/" + seriesID + "/Seasons?UserId=" + server.getUserID() + "&format=json";
	}

	server.getEpisodesURL = function(seriesID, seasonID) {
	    return server.getserverAddr() + "/Shows/" + seriesID + "/Episodes?UserId=" + server.getUserID() + "&SeasonId=" + seasonID + "&format=json&Fields=Overview";
	}

	 //------------------------------------------------------------
	 //  Image Functions
	 //------------------------------------------------------------		
	server.getImageURL = function(itemId, imagetype, totalimages) {
	    var query = "";
	    switch (imagetype) {
	        case "Primary":
	            query = "/Items/" + itemId + "/Images/Primary/0?"; 
	            break;
	        case "Banner":
	            query = "/Items/" + itemId + "/Images/Banner/0?"
	            break;
	        case "Backdrop":
	        	var totalimages = (totalimages !== undefined && Number.isInteger(totalimages)) ? totalimages : 0;
	        	var index = Math.floor((Math.random() * totalimages) + 0);
	            query = "/Items/" + itemId + "/Images/Backdrop/" + index + "?"; 
	            break;
	        case "Thumb":
	            query = "/Items/" + itemId + "/Images/Thumb/0?";
	            break;
	        case "Logo":
	            query = "/Items/" + itemId + "/Images/Logo/0?";
	            break;
	        case "Disc":
	            query = "/Items/" + itemId + "/Images/Disc/0?";
	            break;
	        case "UsersPrimary":
	            query = "/Users/" + itemId + "/Images/Primary?"; 
	            break;
	        case "Chapter":
	            query = "/Items/" + itemId + "/Images/Chapter/" + chapter + "?";
	            break;
	    }

	    return server.getserverAddr() + query;
	}

	 //------------------------------------------------------------
	 //  User Views URL Generation
	 //------------------------------------------------------------			

	server.getUserViews = function() {
	    return server.getserverAddr() + "/Users/" + server.getUserID() + "/Views?format=json&SortBy=SortName&SortOrder=Ascending";
	}

	 //------------------------------------------------------------
	 //  User Updates
	 //------------------------------------------------------------	
	server.setWatched = function(ID,setToWatched) {
	    var url = this.serverAddr + "/Users/" + server.getUserID() + "/PlayedItems/" + ID;  
	    if (setToWatched == true) {
	    	var date = new Date();
		    var queryDate = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
		    url += "?DatePlayed=" + queryDate;
		    xmlhttp.postContent(url, null);
	    } else {
	    	xmlhttp.deleteContent(url);
	    }
	}
	
	 //------------------------------------------------------------
	 //  Media Updates
	 //------------------------------------------------------------	

	server.videoStarted = function(showId, MediaSourceID, ticks, PlayMethod) {
	    var url = this.serverAddr + "/Sessions/Playing";
	    var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + MediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + ticks * 10000 + ',"PlayMethod":' + PlayMethod + '}';
	    xmlhttp.postContent(url, contentToPost);
	}

	server.videoStopped = function(showId, MediaSourceID, ticks, PlayMethod) {
	    var url = this.serverAddr + "/Sessions/Playing/Stopped";
	    var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + MediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + ticks * 10000 + ',"PlayMethod":' + PlayMethod + '}';
	    xmlhttp.postContent(url, contentToPost);
	}

	server.videoPaused = function(showId, MediaSourceID, ticks, PlayMethod) {
	    var url = this.serverAddr + "/Sessions/Playing/Progress";
	    var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + MediaSourceID + ',"IsPaused":true,"IsMuted":false,"PositionTicks":' + ticks * 10000 + ',"PlayMethod":' + PlayMethod + '}';
	    xmlhttp.postContent(url, contentToPost);
	}

	server.videoTime = function(showId, MediaSourceID, ticks, PlayMethod) {
	    var url = this.serverAddr + "/Sessions/Playing/Progress";
	    var contentToPost = '{"QueueableMediaTypes":["Video"],"CanSeek":false,"ItemId":' + showId + ',"MediaSourceId":' + MediaSourceID + ',"IsPaused":false,"IsMuted":false,"PositionTicks":' + ticks * 10000 + ',"PlayMethod":' + PlayMethod + '}';
	    xmlhttp.postContent(url, contentToPost);
	}

	server.videoStopTranscode = function() {
	    var url = this.serverAddr + "/Videos/ActiveEncodings?DeviceId=" + server.getDeviceID();
	    xmlhttp.deleteContent(url);
	}