var xmlhttp = {};


xmlhttp.setRequestHeaders = function (xmlHttp) {
	xmlHttp.setRequestHeader("X-Emby-Authorization", "MediaBrowser Client=\"Samsung Tizen TV\", Device=\""+server.getDevice()+"\", DeviceId=\""+server.getDeviceID()+"\", Version=\""+main.getVersion()+"\", Token=\""+server.getAuthToken()+"\"");
	xmlHttp.setRequestHeader("Content-Type", 'application/json; charset=UTF-8');	
	//xmlHttp.setRequestHeader("Accept-Charset", 'utf-8');
	return xmlHttp;
};	


xmlhttp.testConnectionSettings = function (servervar,fromFile) {	
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", "http://" + servervar + "/jellyfin/System/Info/Public?format=json",false);
		xmlHttp.setRequestHeader("Content-Type", 'application/json');
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
		        if(xmlHttp.status === 200) {
			    	if (fromFile == false || fromFile === undefined) {
			    		var json = JSON.parse(xmlHttp.responseText);
			    		filesystem.saveServerToFile(json.Id,json.ServerName,servervar); 
			    	}
			       	//Set server.serverAddr!
			    	server.setserverAddr("http://" + servervar + "/jellyfin");
			       	guiUsers.start();
		        } else {
		        }
			}
	    }
		xmlHttp.send(null);
	} else {
		logger.log ("Bad xmlHTTP Request");
		tizen.application.getCurrentApplication().exit(); 
	}
};

xmlhttp.Authenticate = function(UserId, UserName, Password) {
	var url = server.getserverAddr() + "/Users/AuthenticateByName?format=json";
    var params =  JSON.stringify({"Username":UserName,"Pw":Password});
    
    var xmlHttp = new XMLHttpRequest();	
    xmlHttp.open( "POST", url , false ); //Authenticate must be false - need response before continuing!
    xmlHttp = this.setRequestHeaders(xmlHttp);
        
    xmlHttp.send(params);
    
    if (xmlHttp.status != 200) {    	
    	return false;
    } else {
    	var session = JSON.parse(xmlHttp.responseText);
    	server.setAuthToken(session.AccessToken);
    	server.setUserID(session.User.Id);
    	server.setUserName(UserName);
		logger.log("User "+ UserName +" authenticated. ");
		logger.log("Authentication Token:  "+ session.AccessToken);
    	return true;
    }
}


//------------------------------------------------------------
//  Get Content - JSON REQUESTS
//------------------------------------------------------------
xmlhttp.getContent = function(url) {
	var xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("GET", url , false); //must be false
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
		    
		if (xmlHttp.status != 200) {
			logger.log("Server Error: The HTTP status returned by the server was "+xmlHttp.status);
			logger.log(url);
			tizen.application.getCurrentApplication().exit(); 
		} else {
			return JSON.parse(xmlHttp.responseText);
		}
	} else {
		logger.log ("Bad xmlHTTP Request");
		tizen.application.getCurrentApplication().exit(); 
	}
};		


xmlhttp.getContentPost = function(url,contentToPost) {
	var xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("POST", url , false); //must be false
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
		    
		if (xmlHttp.status != 200) {
			logger.log("Server Error: The HTTP status returned by the server was "+xmlHttp.status);
			logger.log(url);
			tizen.application.getCurrentApplication().exit(); 
		} else {
			return JSON.parse(xmlHttp.responseText);
		}
	} else {
		logger.log ("Bad xmlHTTP Request");
		tizen.application.getCurrentApplication().exit(); 
	}
};	


//------------------------------------------------------------
//POST content - Video Playback
//------------------------------------------------------------

xmlhttp.postContent = function(url,contentToPost) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {	
		xmlHttp.open("POST", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(contentToPost);
	}
}

xmlhttp.deleteContent = function(url,contentToDelete) {
	xmlHttp = new XMLHttpRequest();
	if (xmlHttp) {
		xmlHttp.open("DELETE", url , true); //must be true!
		xmlHttp = this.setRequestHeaders(xmlHttp);
		xmlHttp.send(null);
	}
}

