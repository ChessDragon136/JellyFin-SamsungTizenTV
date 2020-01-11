var usersettings = {	
		//Per Setting Type List of settings, names & defaults
		Settings : ["View1","View2","HighlightColour","LargerView","SkipShow","AutoPlay","SubtitleSize","SubtitleColour"],
		SettingsName : ["Home View 1: ","Home View 2: ","Highlight Colour: ","Show Larger Icons: ","Skip TV Show Page: ","Auto Play Next Episode: ","Subtitle Text Size: ","Subtitle Text Colour: "],
		SettingsDefaults : ["ContinueWatching","TVNextUp","css/highlights/green.css",true,false,true,"50px","white"],
		
		TVSettings : ["Bitrate","ItemPaging","ClockOffset"],
		TVSettingsName : ["Max Bitrate: ","Item Paging: ","Clock Offset: "],
		TVSettingsDefaults : [60,1000000,0],
		
		ServerSettings : ["DisplayMissingEpisodes","DefaultAudioLang","PlayDefaultAudioTrack","DefaultSubtitleLang", "SubtitleMode", "HidePlayedInLatest"],
		ServerSettingsName : ["Display Missing Episodes: ","Default Audio Language: ","Play default audio track regardless of language: ", "Default Subtitle Language: ","Subtitle Mode:","Hide watched content from latest media:"], 
		ServerSettingsDefaults : [false,"",true,"","default",false], //Not actually Used but implemented for clean code!!! Values read from Server so no default needed!
		
		//Per Setting Options & Values
		DefaultOptions : ["True","False"],
		DefaultValues : [true,false], 
		
		View1Options : ["Continue Watching", "Next Up","All Favourites","Favourite Movies","Favourite Series","Favourite Episodes","Suggested For You","Media Folders","Latest TV","Latest Movies"],
		View1Values : ["ContinueWatching", "TVNextUp","Favourites","FavouriteMovies","FavouriteSeries","FavouriteEpisodes","SuggestedMovies","MediaFolders","LatestTV","LatestMovies"],
		View2Options : ["None","Continue Watching","Next Up","All Favourites","Favourite Movies","Favourite Series","Favourite Episodes","Suggested For You","Media Folders","Latest TV","Latest Movies"],
		View2Values : [null,"ContinueWatching","TVNextUp","Favourites","FavouriteMovies","FavouriteSeries","FavouriteEpisodes","SuggestedMovies","MediaFolders","LatestTV","LatestMovies"],

		TvConnectionOptions : ["120Mb/s","100Mb/s","80Mb/s","60Mb/s","40Mb/s","30Mb/s","20Mb/s","15Mb/s","10Mb/s","8Mb/s","6Mb/s","5Mb/s","4Mb/s","3Mb/s","2Mb/s","1Mb/s","0.5Mb/s"], 
		TvConnectionValues : [120,100,80,60,40,30,20,15,10,8,6,5,4,3,2,1,0.5], 
		
		ItemPagingOptions : ["Off",100,150,200,300,500,1000],
		ItemPagingValues : [1000000,100,150,200,300,500],
		
		SubtitleSizeOptions: ["70px","66px","62px","58px","54px","50px"],
		SubtitleSizeValues: ["70px","66px","62px","58px","54px","50px"],
		
		SubtitleColourOptions: ["White","Red","Green","Blue","Yellow"],
		SubtitleColourValues: ["white","red","green","blue","yellow"],	
		
		ClockOffsetOptions : ["+12 hour", "+11 hours", "+10 hours", "+9 hours", "+8 hours", "+7 hours", "+6 hours", "+5 hours", "+4 hours", "+3 hours", "+2 hours", "+1 hour","0 hours", "-1 hour", "-2 hours", "-3 hours", "-4 hours", "-5 hours", "-6 hours", "-7 hours", "-8 hours", "-9 hours", "-10 hours", "-11 hours", "-12 hours"],
		ClockOffsetValues : [12,11,10,9,8,7,6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12],
		
		LanguageOptions : ["None","English","French","German","Spanish","Italian"],
		LanguageValues : ["","eng","fre","ger","spa","ita"],
		
		SubtitleModeOptions : ["Default","Only Forced Subtitles", "Always Play Subtitles", "None"],
		SubtitleModeValues : ["Default","OnlyForced", "Always", "None"],

		HighlightColourOptions : ["Blue","Green"],
		HighlightColourValues : ["css/highlights/blue.css","css/highlights/green.css"]
};

usersettings.setOverview = function(setting) {
	switch (setting) {
		case "View1":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Home View 1";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Sets the content of the first view on the Home page." +
					"<br><br>Available Choices:<br>&nbsp;<ul style='padding-left:22px'><li>Next Up</li><li>All Favourites</li><li>Favourite Movies</li><li>Favourite Series</li><li>Favourite Episodes</li><li>Suggested For You</li><li>Media Folders</li><li>Latest TV</li><li>Latest Movies</li></ul>" +
					"<br><br>Setting Home View 2 to None will show more content in this view.";
			break; 
		case "View2":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Home View 2";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Sets the content of the second view on the Home page." +
					"<br><br>Available Choices:<br>&nbsp;<ul style='padding-left:22px'><li>None</li><li>Next Up</li><li>All Favourites</li><li>Favourite Movies</li><li>Favourite Series</li><li>Favourite Episodes</li><li>Suggested For You</li><li>Media Folders</li><li>Latest TV</li><li>Latest Movies</li></ul>" +
					"<br><br>Setting this to None will show more content from Home View 1.";
			break;	
		case "HighlightColour":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Highlight colour";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Sets the background and boarder colour of selected items." +
					"<br><br>Available Choices:<br>&nbsp;<ul style='padding-left:22px'><li>Green</li><li>Silver</li><li>Red</li><li>Navy</li><li>Aqua</li><li>Purple</li></ul>";
			break;	
		case "LargerView":	
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Display Larger View";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Enabling this changes the TV & Movies view from 9 items across to 7 items across, allowing for larger images for each item.";
			break;
		case "SkipShow":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Skip TV Show Page";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "This option allows for the TV Show page to be skipped if there is only one season, taking you directly to the episodes page.";
			break;
		case "AutoPlay":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Auto Play Next Episode";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "If enabled, when a playing episode has finished, the next episode will automatically load.";
			break;
		case "SubtitleSize":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Subtitle Text Size";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "The font size for displayed subtitles.<br><br>Image player and screensaver overlays also use this setting.";
			break;
		case "SubtitleColour":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Subtitle Text Colour";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "The font colour for displayed subtitles.<br><br>Image player and screensaver overlays also use this setting.";
			break;	
		case "ClockOffset":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Clock Offset";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Some devices report their system time incorrectly. Use this option to apply a correction.";
			break;	
		case "Bitrate":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Max Bitrate";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Use this setting to select the maximum video bitrate your network can handle. If a video bitrate is higher than this, the video will be transcoded to use the max bitrate setting here.";
			break;
		case "ItemPaging":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Item Paging";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "As nobody likes waiting, items on screen are loaded in batches, with each new batch called when needed, as opposed to loading everything and making you wait until its all ready.<br><br>Change the number of items loaded in a batch dependant on how fast your server is.";
			break;	
		case "DefaultAudioLang":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Audio Language Preference";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Select the preferred audio language.<br><br>If your language is not listed, you will need to change the setting via the web app which has a full list of languages.<br><br>This is a server option and will affect your Emby experience on all clients";
			break;	
		case "PlayDefaultAudioTrack":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Play default audio track regardless of language";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Will play the default audio track even if it doesn't match your language setting.<br><br>This is a server option and will affect your Emby experience on all clients";
			break;	
		case "DefaultSubtitleLang":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Subtitle Language Preference";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Select the preferred subtitle language.<br><br>If your language is not listed, you will need to change the setting via the web app which has a full list of languages.<br><br>This is a server option and will affect your Emby experience on all clients";
			break;		
		case "SubtitleMode":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Subtitle Mode";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Select the default behaviour of when subtitles are loaded<br><br>Default: Subtitles matching the language preference will be loaded when the audio is in a foreign language.<br><br>Only Forced Subtitles: Only subtitles marked as forced will be loaded.<br><br>Always Play Subtitles: Subtitles matching the language preference will be loaded regardless of the audio language.<br><br>None: Subtitles will not be loaded by default.<br><br>This is a server option and will affect your Emby experience on all clients";
			break;	
		case "HidePlayedInLatest":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Hide watched content from latest media";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Watched items will not appear in the Latest TV or Latest Movies home views or pages.<br><br>This is a server option and will affect your Emby experience on all clients";
			break;
		case "DisplayMissingEpisodes":
			document.getElementById("guiSettings_Overview_Title").innerHTML = "Display Missing Episodes within Seasons";
			document.getElementById("guiSettings_Overview_Content").innerHTML = "Display missing episodes within TV seasons<br><br>This is a server option and will affect your Emby experience on all clients";
			break;		
	}
}