var guiUsersManual = {
	UserData : null,
	selectedItem : 0, 
	rememberPassword : false
}

guiUsersManual.start = function(user,rememPW) {
	//Reset Properties
	this.selectedItem = 0;
	this.rememberPassword = false;
	
	//document
	remotecontrol.setCurrentPage("NoItems");
	
	//Load Data
	var url = server.getserverAddr() + "/Users/Public?format=json";
	this.UserData = xmlhttp.getContent(url);
	if (this.UserData == null) { return; }
	
	//Pre-populate from GuiUsers if required
	if (rememPW != null || rememPW !== undefined) {
		this.rememberPassword = rememPW;
	}
	
	//Change Display
	document.getElementById("pageContent").innerHTML = "<div class='guiUsersManual-Container'> \
		<p style='padding-bottom:5px'>Username</p> \
		<form><input id='user' style='z-index:10;' type='text' size='40' value=''/></form> \
		<p style='padding-bottom:5px'>Password</p> \
		<form><input id='pass' style='z-index:10;' type='password' size='40' value=''/></form> \
		<br><span id='guiUsers_rempwd'>Remember Password </span> : <span id='guiUsers_rempwdvalue'>" + this.rememberPassword + "</span> \
		<div id='guiUsersManual_login'>Login</div> \
		</div>";
	
	//Pre-populate from GuiUsers if required
	if (user != null || user !== undefined) {
		document.getElementById('user').value = user;
	}
	
	document.getElementById('user').addEventListener('focus', function() {
		guiUsersManual.selectedItem = 0;
		});
	
	
	document.getElementById('user').addEventListener('blur', function() {
		guiUsersManual.selectedItem = 1;
		document.getElementById("pass").focus();
		});
	
	document.getElementById('pass').addEventListener('focus', function() {
		guiUsersManual.selectedItem = 1;
		});
	
	document.getElementById('pass').addEventListener('blur', function() {
		guiUsersManual.selectedItem = 2;
		document.getElementById("guiUsers_rempwd").style.color = "green";
		remotecontrol.setCurrentPage("guiUsersManual");
		
		});
	
	//IME Control Overrides for User
	document.getElementById('user').addEventListener('keydown', function(event) {
		  switch (event.keyCode) {
		    case 65376:
		    case 65385:
		    case 40:
		    		document.getElementById('user').blur();
		      break;
		  }
		});
	
	//IME Control Overrides for Password
	document.getElementById('pass').addEventListener('keydown', function(event) {
		  switch (event.keyCode) {
		    case 65376:
		    case 65385:
		    case 40:
		    	document.getElementById('pass').blur();
		      break;
		    case 38:
		    	document.getElementById('user').focus();
		    	break;
		  }
		});	
	
	document.getElementById("user").focus(); //Should show IME - doesnt in emulator??? Maybe keyboard detected hides IME
	
}

guiUsersManual.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode)
	{
		case 10009:
			//Back to guiUsers
			guiUsers.start();
			break;
		case 38:
			if (this.selectedItem < 2) {
				//Should never happen
			} else if (this.selectedItem == 2) {
				document.getElementById("guiUsers_rempwd").style.color = "#f9f9f9";
				document.getElementById("user").focus();  	
			} else {
				this.selectedItem = 2;
				document.getElementById("guiUsersManual_login").style.color = "#f9f9f9";
				document.getElementById("guiUsers_rempwd").style.color = "green";
			}
			break;	
		case 40:
			if (this.selectedItem < 2) {
				//Should never happen
			} else if (this.selectedItem == 2) {
				this.selectedItem = 3;
				document.getElementById("guiUsers_rempwd").style.color = "#f9f9f9";
				document.getElementById("guiUsersManual_login").style.color = "green";
			}
			break;				
		case 13:
			if (this.selectedItem < 2) {
				//Should never happen
			} else if (this.selectedItem == 2) {
				this.rememberPassword = (this.rememberPassword == false) ? true : false;
				document.getElementById("guiUsers_rempwdvalue").innerHTML = this.rememberPassword;
			} else {
				//Try Log In
				guiUsersManual.login();
			}

			break;	
		case 10182:
			tizen.application.getCurrentApplication().exit()
			break;
		default:
			break;
	}
};

guiUsersManual.login = function() {
	var user = document.getElementById('user').value;
	var pass = document.getElementById('pass').value;
	
	var authenticateSuccess = xmlhttp.Authenticate(null, user, pass);		
	if (authenticateSuccess) {
    	//Check if this user is already in the config, or Add new user to config
		filesystem.addUser(server.UserID,user,pass,this.rememberPassword);
		
		//Change Focus and call function in guiMain to initiate the page!
		guiMainMenu.start();
	} else {
		//Wrong password - Reset IME focus and notifty user
		document.getElementById("guiUsersManual_login").style.color = "#f9f9f9";
		document.getElementById("pass").focus();
	}  
}