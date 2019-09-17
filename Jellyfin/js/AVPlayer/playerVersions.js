var playerVersions = {
		//Holders
		PlayerData : null,
		resumeTicks : 0,
		playedFromPage : "",
		previousCounter : "",
		
		//Display Details
		selectedItem : 0,
		topLeftItem : 0,
		maxDisplay : 5,
		
		//Holds MediaStream Indexes of Primary Video Audio for each MediaOption
		MediaOptions : [],

		//Holds Playback Details  : MediaSourceId,Url,transcodeStatus,videoIndex,audioIndex,isFirstAudioIndex,subtitleIndex
		MediaPlayback : [],

		//Holds all options to show in GUI if required
		MediaSelections : [],
}

playerVersions.start = function(playerData,resumeTicks,playedFromPage) {
	//Reset Vars
	this.MediaOptions.length = 0;
	this.MediaPlayback.length = 0;
	this.MediaSelections.length = 0;
	this.selectedItem = 0,
	this.topLeftItem = 0,
	
	//Set Class Vars
	this.PlayerData = playerData;
	this.resumeTicks = resumeTicks;
	this.playedFromPage = playedFromPage;

	logger.log("Video : Loading " + this.PlayerData.Name);
	
	//Check if HTTP
	if (this.PlayerData.MediaSources[0].Protocol.toLowerCase() == "http") {
		/*
		logger.log("Video : Is HTTP : Generate URL Directly");			
		var streamparams = '/master.m3u8?VideoCodec=h264&Profile=high&Level=41&MaxVideoBitDepth=8&MaxWidth=1920&VideoBitrate=10000000&AudioCodec=aac&audioBitrate=360000&MaxAudioChannels=6&MediaSourceId='+this.PlayerData.MediaSources[0].Id + '&api_key=' + Server.getAuthToken();	
		var url = Server.getServerAddr() + '/Videos/' + this.PlayerData.Id + streamparams + '&DeviceId='+Server.getDeviceID();
		var httpPlayback = [0,url,"Transcode",-1,-1,-1];
		player.startPlayback(httpPlayback,resumeTicks);
		return;	
		*/
	}
	
	//Loop through all media sources and determine which is best
	logger.log("Video : Find Media Streams");
	for(var index = 0; index < this.PlayerData.MediaSources.length;index++) {
		this.getMainStreamIndex(this.PlayerData.MediaSources[index],index);
	}
	
	//Loop through all options and see if transcode is required, generate URL blah...
	logger.log("Video : Determine Playback of Media Streams");
	for (var index = 0; index < this.MediaOptions.length; index++) {
		var result = playerTranscoding.start(this.PlayerData.Id, this.PlayerData.MediaSources[this.MediaOptions[index][0]],this.MediaOptions[index][0],
			this.MediaOptions[index][1],this.MediaOptions[index][2],this.MediaOptions[index][3],this.MediaOptions[index][4]);
		logger.log("Video : Playback Added")
		this.MediaPlayback.push(result);	
	}
	
	//Setup Gui
	this.previousCounter = document.getElementById("Counter").innerHTML;
	
	//MediaSource,Url,hasVideo,hasAudio,hasSubtitle,videoIndex,audioIndex,subtitleIndex
	if (this.MediaPlayback.length <= 0) {
		logger.log("Video : No Playback Options");
		//Error - No media playback options!
		//Removes URL to fix Navigation
		pagehistory.removeLatestURL();
		//Return Focus!
		remotecontrol.setCurrentPage(this.playedFromPage);
	} else if (this.MediaPlayback.length == 1) {
		//Play file 
		logger.log("Video : One Playback Option - Player Loaded");
		player.startPlayback(this.MediaPlayback[0],resumeTicks); //Need to change
	} else {
		//The below needs to be implemented correctly
		logger.log("Video : Multiple Playback Options - NOT IMPLEMENTED");
		pagehistory.removeLatestURL();
		remotecontrol.setCurrentPage(this.playedFromPage);
		/*
		//See how many will direct play
		logger.log("Video : Multiple Playback Options - Determine Direct Play Count")
		for (var index = 0; index < this.MediaPlayback.length;index++) {
			if (this.MediaPlayback[index][2] == "Direct Play") {
				logger.log("Video : Found Direct Play - Added to Selections")
				this.MediaSelections.push(this.MediaPlayback[index]);
			}
		}
		
		//If more than 1 loop through and generate GUI asking user
		if (this.MediaSelections.length == 1) {
			logger.log("Video : One Direct Stream - Player Loaded")
			player.startPlayback(this.MediaSelections[0],resumeTicks);
		} else if (this.MediaSelections.length > 1) {
			logger.log("Video : Multiple Direct Stream - Option Presented to User")
			document.getElementById("playerVersions").focus();
			this.updateDisplayedItems();
			this.updateSelectedItems();
		} else {
			//None Direct Play - see if any require Audio Only Transcoding
			logger.log("Video : None Direct Stream - Determine Audio Only Transcode Count")
			for (var index = 0; index < this.MediaPlayback.length;index++) {
				if (this.MediaPlayback[index][2] == "Transcoding Audio") {
					logger.log("Video : Found Audio Only Transcode - Added to Selections")
					this.MediaSelections.push(this.MediaPlayback[index]);
				}
			}
			
			//If more than 1 loop through and generate GUI asking user
			if (this.MediaSelections.length == 1) {
				logger.log("Video : One Audio Only Transcode - Player Loaded")
				player.startPlayback(this.MediaSelections[0],resumeTicks);
			} else if (this.MediaSelections.length > 1) {
				logger.log("Video : Multiple Audio Only Transcode - Option Presented to User")
				document.getElementById("playerVersions").focus();
				this.updateDisplayedItems();
				this.updateSelectedItems();
			} else {	
				//Just use 1st Source and give up!
				logger.log("Video : None Audio Only Transcode - Use First Media Source - Player Started")
				player.startPlayback(this.MediaSelections[0],resumeTicks);
			}
		}
		*/
	}
}

playerVersions.updateDisplayedItems = function() {
	document.getElementById("playerVersions_Playables").style.visibility = "";
	document.getElementById("playerVersions_Playables").innerHTML = "";
	
	for (var index = this.topLeftItem; index < Math.min(this.MediaSelections.length,this.topLeftItem + this.maxDisplay);index++) {
		document.getElementById("playerVersions_Playables").innerHTML += "<div id="+this.MediaSelections[index][0].Id+" class=videoVersionOption>"+this.MediaSelections[index][0].Name
		+ "<div class=videoVersionType>D</div></div>";	
	}
}

playerVersions.updateSelectedItems = function() {
	for (var index = this.topLeftItem; index < Math.min(this.MediaSelections.length,this.topLeftItem + this.maxDisplay); index++){	
		if (index == this.selectedItem) {
			document.getElementById(this.MediaSelections[index][0].Id).style.color = "#27a436";	
		} else {	
			document.getElementById(this.MediaSelections[index][0].Id).style.color = "white";		
		}		
	} 
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.MediaSelections.length;
}



//Gets Primary Streams - Ones that would be used on first playback)
playerVersions.getMainStreamIndex = function(MediaSource, MediaSourceIndex) {
	var videoStreamIfNoDefault = 0;
	var videoIndex = -1, audioIndex = -1, subtitleIndex = -1;
	var indexOfFirstAudio = -1;
		
	var userURL = server.getserverAddr() + "/Users/" + server.getUserID() + "?format=json";
	var UserData = xmlhttp.getContent(userURL);
	if (UserData == null) { return; }
	
	var AudioLanguagePreferenece = (UserData.Configuration.AudioLanguagePreference !== undefined) ? UserData.Configuration.AudioLanguagePreference : "none";
	var PlayDefaultAudioTrack = (UserData.Configuration.PlayDefaultAudioTrack !== undefined) ? UserData.Configuration.PlayDefaultAudioTrack: false;
	
	var SubtitlePreference = (UserData.Configuration.SubtitleMode !== undefined) ? UserData.Configuration.SubtitleMode : "Default";
	var SubtitleLanguage = (UserData.Configuration.SubtitleLanguagePreference !== undefined) ? UserData.Configuration.SubtitleLanguagePreference : "eng";
	
	logger.log("Video : Audio Play Default Track Setting: " + PlayDefaultAudioTrack);
	logger.log("Video : Audio Language Preference Setting: " + AudioLanguagePreferenece);
	logger.log("Video : Subtitle Preference: " + SubtitlePreference);
	logger.log("Video : Subtitle Language: " + SubtitleLanguage);
	
	var MediaStreams = MediaSource.MediaStreams;
	//---------------------------------------------------------------------------
	//Find 1st Audio Stream
	for (var index = 0;index < MediaStreams.length;index++) {
		var Stream = MediaStreams[index];
		if (Stream.Type == "Audio") {
			indexOfFirstAudio = index;
			logger.log("Video : First Audio Index : " + indexOfFirstAudio);
			break;
		} 
	}
	
	for (var index = 0;index < MediaStreams.length;index++) {
		var Stream = MediaStreams[index];
		if (Stream.Type == "Video") {
			videoStreamIfNoDefault = (videoStreamIfNoDefault == 0) ? index : videoStreamIfNoDefault;
			if (videoIndex == -1 && Stream.IsDefault == true) {
				videoIndex = index;
				logger.log("Video : Default Video Index Found : " + videoIndex);
			}
		} 
		
		if (Stream.Type == "Audio") {
			if (PlayDefaultAudioTrack == false) {
				if (audioIndex == -1 && Stream.Language == AudioLanguagePreferenece) {
					audioIndex = index;
					logger.log("Video : Audio Language Preference Found : " + audioIndex);
				}
			} else {
				if (audioIndex == -1 && Stream.IsDefault == true) {
					audioIndex = index;
					logger.log("Video : Default Audio Track Found : " + audioIndex);
				}
			}
		}
	}
	
	//If there was no default video track use first one
	if (videoIndex == -1) {
		videoIndex = videoStreamIfNoDefault;
		logger.log("Video : No Default Video Index Found - Use First Video Index : " + videoIndex);
	}

	//If there was no default audio track find others
	if (audioIndex == -1) {	
		for (var index = 0;index < MediaStreams.length;index++) {
			var Stream = MediaStreams[index];
			if (Stream.Type == "Audio") {
				audioIndex = index;
				logger.log("Video : No Audio Track Set - Use First Audio Index : " + audioIndex);
				break;
			}
		}
	}
	logger.log("Video : Audio language " + (MediaStreams[audioIndex].Language === undefined ? "unknown, defaulting to " + AudioLanguagePreferenece : MediaStreams[audioIndex].Language));
	
	//---------------------------------------------------------------------------
	//Search Subtitles - the order of these is important.
	//Subtitle Mode = Only Forced Subtitles
	// these are reported by the server to be always on (unless specified by the user)
	
	//Really should check if there is a hassubtitles field on video - skip all of this if there isnt!
	if (this.PlayerData.HasSubtitles == true) {
		logger.log("Video : Video has subtitles");
		if (SubtitlePreference != "None") {
			for (var index = 0;index < MediaStreams.length;index++) {
				var Stream = MediaStreams[index];
				if (Stream.IsTextSubtitleStream && Stream.IsForced) {
					subtitleIndex = index;
					logger.log("Video : Forced Subtitle Index : " + subtitleIndex);
					break;
				}
			}
		}
		
		
		//Subtitle Mode = Default
		// display native subtitles only if the audio stream (else server default) is not in the users native language
		if (subtitleIndex == -1) {
			if (MediaStreams[audioIndex].Language == null || MediaStreams[audioIndex].Language != AudioLanguagePreferenece) {
				logger.log("Video : Subtitle Audio Mismatch or Audio Lang is Null");
				if (SubtitlePreference != "None" && SubtitlePreference != "OnlyForced") {
					logger.log("Video : Subtitle should be shown if available - User not turned off");
					for (var index = 0;index < MediaStreams.length;index++) {
						var Stream = MediaStreams[index];
						if (Stream.IsTextSubtitleStream ) {
							if (SubtitleLanguage == null ) {
								logger.log("Subtitle Language is NULL");
							}
							logger.log(Stream.Language + " : " + SubtitleLanguage);
							if (Stream.Language == SubtitleLanguage || SubtitleLanguage == "") {
								subtitleIndex = index;
								logger.log("Video : Audio Not Native - Subtitle Index : " + subtitleIndex);
								break;
							}
						}
					}
				}
			}
		}
		
		//Subtitle Mode = Always Play Subtitles
		if (subtitleIndex == -1) {
			if (SubtitlePreference == "Always") {
				var defaultsubtitleIndex = -1, firstsubtitleIndex = -1, nativesubtitleIndex = -1;
				
				for (var index = 0;index < MediaStreams.length;index++) {
					var Stream = MediaStreams[index];
					if (Stream.IsTextSubtitleStream) {
						var audioLanguage = MediaStreams[audioIndex].Language == null ? AudioLanguagePreferenece : MediaStreams[audioIndex].Language;
						if (defaultsubtitleIndex == -1 && Stream.Default == true) {
							defaultsubtitleIndex = index;
							logger.log("Video : Always Subtitle Index for Default : " + defaultsubtitleIndex);
						}
						
						if (nativesubtitleIndex == -1 && audioLanguage !== SubtitleLanguage && Stream.Language === SubtitleLanguage) {
							nativesubtitleIndex = index;
							logger.log("Video : Always Subtitle Index for Native : " + nativesubtitleIndex);
						}
						if (firstsubtitleIndex == -1) {
							firstsubtitleIndex = index;
							logger.log("Video : Always Subtitle Index for First : " + firstsubtitleIndex);
						}
					}
				}
				if (nativesubtitleIndex != -1) {
					subtitleIndex = nativesubtitleIndex;
				} else if (defaultsubtitleIndex != -1) {
					subtitleIndex = defaultsubtitleIndex;
				} else if (firstsubtitleIndex != -1) {
					subtitleIndex = firstsubtitleIndex;
				}
			}	
		}
	} else {
		logger.log("Video : Video has no subtitles");
	}

	//---------------------------------------------------------------------------

	var audioStreamFirst = (audioIndex == indexOfFirstAudio) ? true : false;
	if (videoIndex > -1 && audioIndex > -1) {
		//Check if item is 3D and if tv cannot support it don't add it to the list!
		if (MediaSource.Video3DFormat !== undefined) {
			//If TV Supports 3d
			/*
			var pluginScreen = document.getElementById("pluginScreen");
			if (pluginScreen.Flag3DEffectSupport()) {
				logger.log("Video : Media Stream Added : 3D " + MediaSourceIndex + "," + videoIndex + "," + audioIndex + "," + audioStreamFirst + "," + subtitleIndex)
				this.MediaOptions.push([MediaSourceIndex,videoIndex,audioIndex,audioStreamFirst,subtitleIndex]); //Index != Id!!!
			} else {
				logger.log("Video : Media Stream Added : 3D - Not Added, TV does not support 3D");
			}
			*/
		} else {
			//Not 3D
			logger.log("Video : Media Stream Added : 2D " + MediaSourceIndex + "," + videoIndex + "," + audioIndex + "," + audioStreamFirst+ "," + subtitleIndex)
			this.MediaOptions.push([MediaSourceIndex,videoIndex,audioIndex,audioStreamFirst,subtitleIndex]); // Index != Id!!!
		}				
	} else {
		if (videoIndex == -1) {
			logger.log("Video : No Video Index Found - Not Added");
		}
		if (audioIndex == -1) {
			logger.log("Video : No Audio Index Found - Not Added");	
		}
	}	
}

playerVersions.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode) {
		case tvKey.KEY_UP:
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem++;
			}
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem--;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		break;
		case tvKey.KEY_DOWN:
			this.selectedItem++;
			if (this.selectedItem > this.MediaSelections.length-1) {
				this.selectedItem--;
			}
			if (this.selectedItem >= this.topLeftItem + this.maxDisplay) {
				this.topLeftItem++;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
			break;
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			logger.log ("RETURN");
			widgetAPI.blockNavigation(event);
			//Hide Menu
			document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
			document.getElementById("playerVersions_Playables").style.visibility = "hidden";
			document.getElementById("playerVersions_Playables").innerHTML = "";
			
			//Remove Last URL History - as we didn't navigate away from the page!
			pagehistory.removeLatestURL();
			
			//Reset counter to existing value
			document.getElementById("Counter").innerHTML = this.previousCounter;
			
			//Set focus back to existing page
			document.getElementById(this.playedFromPage).focus();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			logger.log ("ENTER");
			document.getElementById("playerVersions_Playables").style.visibility = "hidden";
			document.getElementById("playerVersions_Playables").innerHTML = "";
			document.getElementById("Counter").innerHTML = this.previousCounter;
			document.getElementById(this.playedFromPage).focus();
			GuiPlayer.startPlayback(this.MediaSelections[this.selectedItem],this.resumeTicks);
			break;	
		case tvKey.KEY_BLUE:
			logger.log ("BLUE");
			document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
			File.deleteFile();
			widgetAPI.sendExitEvent()
			break;	
		case tvKey.KEY_EXIT:
			logger.log  ("EXIT KEY");
			document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
			widgetAPI.sendExitEvent();
			break;
		default:
			logger.log ("Unhandled key");
			break;
	}
};