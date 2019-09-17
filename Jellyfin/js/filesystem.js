var filesystem = {
		configJSON : "", //Never access this directly outside of this file
		
		ServerEntry : null,
		UserEntry : null,
		imageCachejson : null
};

filesystem.getConfigJSON = function() {
	return this.configJSON;
}

filesystem.getServerEntry = function() {
	return this.ServerEntry;
};

filesystem.setServerEntry = function(serverEntry) {
	this.ServerEntry = serverEntry;
};

filesystem.getUserEntry = function() {
	return this.UserEntry;
};

filesystem.setUserEntry = function(userEntry) {
	this.UserEntry = userEntry;
};

//Only ever called once at start of application
//Settings are then only ever read from the configJson Class var, and saved to var / written to file when changed
filesystem.loadfile = function() {
	if (localStorage.getItem('config') == null) {
		//Must set this first else setTVProperty falls into a loop calling loadfile... Bad!
		configNew = {"Version":main.getVersion(),"Servers":[],"TV":{}};
		localStorage.setItem("config", JSON.stringify(configNew));
		
		//Reload file and set TV default settings
		var config = localStorage.getItem('config');
		this.configJSON = JSON.parse(config);
		for (var index = 0; index < usersettings.TVSettings.length;index++) {
			if (this.configJSON.TV[usersettings.TVSettings[index]] === undefined) {
				this.configJSON.TV[usersettings.TVSettings[index]] = usersettings.TVSettingsDefaults[index];
				this.setTVProperty(usersettings.TVSettings[index],usersettings.TVSettingsDefaults[index]);
			}
		}
	} else {
		var config = localStorage.getItem('config');
		this.configJSON = JSON.parse(config);
	}
};

//Does not seem to work on multiple application launches - Useless as far as I know
//Only ever called once at start of application
//Settings are then only ever read from the configJson Class var, and saved to var / written to file when changed
filesystem.loadimagecache = function() {
	if (localStorage.getItem('imageCache') == null) {
		imageCacheNew = {"Images":[]};
		localStorage.setItem("imageCache", JSON.stringify(imageCacheNew));
		this.imageCachejson = imageCacheNew;
	} else {
		var imageCache = localStorage.getItem('imageCache');
		this.imageCachejson = JSON.parse(imageCache);
	}
}

//------------------------------------------------------------
//   Server Settings
//------------------------------------------------------------	

filesystem.saveServerToFile = function(Id,Name,ServerIP) {
	var serverExists = false;
	for (var index = 0; index < this.configJSON.Servers.length; index++) {
		if (Id == this.configJSON.Servers[index].Id) {
			this.ServerEntry = index;
			serverExists = true;
		}
	}
		
	if (serverExists == false) {
		this.ServerEntry = this.configJSON.Servers.length
		this.configJSON.Servers[this.configJSON.Servers.length] = {"Id":Id,"Name":Name,"Path":ServerIP,"Default":false,"Users":[]};
		localStorage.setItem("config", JSON.stringify(this.configJSON));
	}	
};

//------------------------------------------------------------
//   User Setup
//------------------------------------------------------------	

filesystem.addUser = function (UserId, Name, Password, rememberPassword) {
	//Blank Password if rememberPassword == false
	if (rememberPassword == false) {
		Password = "";
	}
	
	//Check if user doesn't already exist - if does, alter password and save!
	var userFound = false;
	for (var index = 0; index < this.configJSON.Servers[this.ServerEntry].Users.length; index++) {
		if (this.configJSON.Servers[this.ServerEntry].Users[index].UserId == UserId) {
			userFound = true;
			this.UserEntry = index;
			this.configJSON.Servers[this.ServerEntry].Users[index].Password = Password;
			this.configJSON.Servers[this.ServerEntry].Users[index].RememberPassword = rememberPassword;
			break;
		}
	}
	
	if (userFound == false) {
		this.UserEntry = this.configJSON.Servers[this.ServerEntry].Users.length;
		this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry] = {"UserId":UserId,"UserName":Name.toLowerCase(),"Password":Password,"RememberPassword":rememberPassword};	
		localStorage.setItem("config", JSON.stringify(this.configJSON));
		

		for (var index = 0; index < usersettings.Settings.length;index++) {
			if ( this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry][usersettings.Settings[index]] === undefined) {
				 this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry][usersettings.Settings[index]] = usersettings.SettingsDefaults[index];
				filesystem.setUserProperty(usersettings.Settings[index],usersettings.SettingsDefaults[index]);
			}
		}
	}
};

filesystem.deleteUser = function (index) {
	this.configJSON.Servers[this.ServerEntry].Users.splice(index);
	localStorage.setItem("config", JSON.stringify(this.configJSON));
};


//------------------------------------------------------------
//   User Preferences
//------------------------------------------------------------	
filesystem.getUserProperty = function(property) {
	if (!this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry]) { //In case we're not logged in yet.
		return null;
	}
	//No error checking - defaults written at time of user creation
	return this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry][property];	
};

filesystem.setUserProperty = function(property,value) {
	if (!this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry]) { //In case we're not logged in yet.
		return null;
	}
	this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry][property] = value;
	localStorage.setItem("config", JSON.stringify(this.configJSON));
};

//Used for Home Pages to get view name
filesystem.getUserViewName = function(view) {
	var userView = this.configJSON.Servers[this.ServerEntry].Users[this.UserEntry][view];

	if (userView != undefined) {
		for (var i = 0; i < usersettings.View1Values.length; i++) {
			if (usersettings.View1Values[i] == userView) {
				return usersettings.View1Options[i];
			}
		}					
		return "Unknown";
	} else {
		return "Unknown";
	}
}

//------------------------------------------------------------
//    TV Preferences
//------------------------------------------------------------	
filesystem.getTVProperty = function(property) {
	//No error checking - defaults written at time of file creation
	return this.configJSON.TV[property];	
};

filesystem.setTVProperty = function(property,value) {
	this.configJSON.TV[property] = value;
	localStorage.setItem("config", JSON.stringify(this.configJSON));
};

//------------------------------------------------------------
//    Settings Page - Save Settings
//------------------------------------------------------------	

filesystem.saveSettings = function(configLocalJSON) {
	this.configJSON = configLocalJSON;
	localStorage.setItem("config", JSON.stringify(this.configJSON));
}

