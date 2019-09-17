var guiServerNew = {
	elementIds : [ "1","2","3","4","port","host"],
	inputs : [ null,null,null,null,null],
	ready : [ false,false,false,false,false],

}

guiServerNew.start = function() {	
	//Insert html into page
	document.getElementById("pageContent").innerHTML = "<div class='guiServerNew12key'> \
		<p style='padding-bottom:5px'>Enter your server hostname here without http:// and <br>including : and port number.</p> \
		<form><input id='host' style='z-index:10;' type='text' size='45' value=''/></form> \
		</div>";
	
	document.getElementById('host').addEventListener('blur', function() {
		remotecontrol.setCurrentPage("NoItems");
		document.getElementById("body").focus();
		guiServerNew.test();
		});
	
	document.getElementById("host").focus();
	
	document.body.addEventListener('keydown', function(event) {
		  switch (event.keyCode) {
		  case 13:
		    case 65376: // Done
		      document.getElementById('host').blur();
		      break;
		    case 65385: // Cancel
		      document.getElementById('host').blur();
		      break;
		  }
		});
}

guiServerNew.test = function() {  
    var host = document.getElementById('host').value;          
    if (host == "") {
    		//not valid
            //GuiNotifications.setNotification("Please re-enter your server details.","Incorrect Details",true);
    } else {
    		remotecontrol.setCurrentPage("NoItems");
            //Timeout required to allow notification command above to be displayed
            setTimeout(function(){xmlhttp.testConnectionSettings(host);}, 1000);
    }
};