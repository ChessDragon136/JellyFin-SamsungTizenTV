//NOTE
//Samsung Player accepts seconds
//Samsung Current time works in seconds * 1000
//Emby works in seconds * 10000000

var player = {	
		updateTimeCount : 0,
		PlayMethod : "",
		videoStartTime : null,
		offsetSeconds : 0, //For transcode, this holds the position the transcode started in the file
		duration : 0,
		
		seekTimeForwardMs : 30000, //30s
		seekTimeBackMs : 30000,
		seekPos : -1, //Used to rememver where user has seeked to, -1 shows no user interaction
		
		speed : [-4,-2,1,2,4],//Used for fast forward / reqwin
		speedPos : 2,
		
		menuItems : [],
		menuItemsPlayPausePos : 0, //Used for quick menu substitution of play / pause icon on respeective play states. 
		selectedMenuItem : 0, //Menu Item
		selectedRow : 0, //Menu or Seek Bar
		menuTimer : null, //Timer to hide menu after X seconds
		showSubtitles : false,
		
		playingMediaSource : null,
		playingMediaSourceIndex : null,
		playingURL : null,
		playingTranscodeStatus : null,
		playingVideoIndex : null,
		playingAudioIndex : null,
		playingSubtitleIndex : null,
		playingPlaySessionId : null,
			
		VideoData : null,
		PlayerData : null,
		PlayerDataSubtitle : null,
		PlayerIndex : null,
		AdjacentData : null,

		startParams : [],
};


player.start = function(title,url,startingPlaybackTick,playedFromPage) { 
	logger.log("Player.Start");
	//Run only once in loading initial request - subsequent vids should go thru the startPlayback
	this.startParams = [title,url,startingPlaybackTick,playedFromPage];
	
    //Get Item Data (Media Streams)
    this.VideoData = xmlhttp.getContent(url);
    if (this.VideoData == null) { return; }
    
    this.PlayerIndex = 0; // Play All  - Default
    if (title == "PlayAll") {
    	if (this.VideoData.TotalRecordCount == 0) {
    		return;
    	}
    	this.PlayerData = this.VideoData.Items[this.PlayerIndex];
    } else {
    	if (this.VideoData.LocationType == "Virtual") {
    		return
    	}
    	this.PlayerData = this.VideoData;
    }

    //Take focus to no input
    remotecontrol.setCurrentPage("NoItems");
    
	//Load Versions
    playerVersions.start(this.PlayerData,startingPlaybackTick,playedFromPage);
};


player.startPlayback = function(TranscodeAlg, resumeTicksSamsung) {
	 logger.log("Player.StartPlayback");
	//Expand TranscodeAlg to useful variables!!!
	this.playingMediaSourceIndex = TranscodeAlg[0];
	this.playingMediaSource = this.PlayerData.MediaSources[TranscodeAlg[0]];
	this.playingURL = TranscodeAlg[1];
	this.playingTranscodeStatus = TranscodeAlg[2];
	this.playingVideoIndex = TranscodeAlg[3];
	this.playingAudioIndex = TranscodeAlg[4];
	this.playingSubtitleIndex = TranscodeAlg[5];
	this.playingPlaySessionId = TranscodeAlg[6];
	
	//Reset some Vars
	this.seekPos = -1;
	this.showSubtitles = (this.playingSubtitleIndex != -1) ? true : false;

	//Set PlayMethod
	if (this.playingTranscodeStatus == "Direct Play"){
		this.PlayMethod = "DirectPlay";
	} else {
		this.PlayMethod = "Transcode";
	}
	
	//Get Adjacent Data if episode
	this.AdjacentData = null;
	if (filesystem.getUserProperty("AutoPlay") == true && this.PlayerData.Type == "Episode") {
		var url = server.getAdjacentEpisodesURL(this.PlayerData.SeriesId, this.PlayerData.SeasonId,this.PlayerData.Id);
		this.AdjacentData = xmlhttp.getContent(url);	
	}
	
	//Hide Current Page
	document.getElementById("page").style.display = "none";	
	
	//Set Media Info 
	this.generateUI();
	
	logger.log("Initialise Playback URL");
	webapis.avplay.open(this.playingURL);
	webapis.avplay.setDisplayRect(0,0,1920,1080);
	webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO"); //YES THIS IS CORRECT! Else Will stretch
	
	//Seek does work for transcoded - Unable to 
	if (resumeTicksSamsung !== undefined && resumeTicksSamsung > 0) {
		webapis.avplay.seekTo(resumeTicksSamsung);
	}
	
	var listener = {
			  onbufferingstart: function() {
				  logger.log("Buffering Started");
			  },

			  onbufferingprogress: function(percent) {
			  },

			  onbufferingcomplete: function() {
				  logger.log("Buffering Complete");
				  webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);

					//Log what video player sees
				  	var totalTrackInfo = webapis.avplay.getCurrentStreamInfo();
					var Text = '';
					for (var I = 0; I < totalTrackInfo.length; I++) {
					  Text += 'index: ' + totalTrackInfo[I].index + '';
					  Text += 'type: ' + totalTrackInfo[I].type + '';
					  Text += 'extra_info: ' + totalTrackInfo[I].extra_info + ' : ';
					}
					logger.log(Text);
				  
					logger.log("Audio Index: " + player.playingAudioIndex);
					logger.log("Subtitle Index: " + player.playingSubtitleIndex);
					
				  	//Set audio track
					//webapis.avplay.setSelectTrack('AUDIO',totalTrackInfo[player.playingAudioIndex].index);
					
					//Set subtitle track
					//if (player.playingSubtitleIndex != -1) {
					//	webapis.avplay.setSelectTrack('TEXT',totalTrackInfo[player.playingSubtitleIndex].index);
					//}
			  },
			  
			  onsubtitlechange: function(duration, text, data3, data4) {
				  //Samsung limitation - Can not show overlapping subtitles
				  if (player.showSubtitles == true) {
					  document.getElementById("videoSubtitles").innerHTML=text;
				  }
			  },
			  
			  onstreamcompleted: function() {
			    logger.log("Stream Completed");
			    player.playbackEnd();
			  },
			  oncurrentplaytime: function(currentTime) {
				  //Seems to run every 0.5 seconds
				  
				  //Update Current & Remaining Time
				  document.getElementById("videoPlayerTimeCurrent").innerHTML = player.convertmstotime(currentTime)
				  document.getElementById("videoPlayerTimeRemaining").innerHTML = player.convertmstotime(webapis.avplay.getDuration() - currentTime);
					
				  //Update Seek Bar
				  var pos =  1200 * (currentTime / webapis.avplay.getDuration()) //1200 = pixel width of seek bar
				  document.getElementById("videoPlayerSeekBarPlayed").style.width = pos+"px";
				  
				  //If user is on seeker bar, dont update position as user may be interacting with it!
				  if (player.seekPos == -1) {
				  	document.getElementById("videoPlayerSeekBarPosition").style.left = pos-16+"px"; //circle is 32px diameter, minus half to get it right
				  	document.getElementById("videoPlayerSeekBarPositionTime").innerHTML = player.convertmstotime(currentTime);	
				  	
				  }
				  
				  
				  //Update Server - Counter to prevent doing it too often (10 sec approx)
					player.updateTimeCount++;
					if (player.updateTimeCount == 20) {
						player.updateTimeCount = 0;
						server.videoTime(player.PlayerData.Id,player.playingMediaSource.Id,currentTime,player.PlayMethod,player.playingPlaySessionId);
					}
			  },
			  onerror: function(eventType,data) {
				  logger.log("An error has happened :(");
				  logger.log("Stream Error: " + data);
				  player.stop(true);
			  },
			  onevent: function(eventType, eventData) {
				  logger.log("An event has happened");
				  logger.log("event type: " + eventType + ", data: " + eventData);
			  }
	};

	logger.log("Initialise Playback Listeners");
	webapis.avplay.setListener(listener);
	logger.log("Prepare Playback");
	webapis.avplay.prepare();
	logger.log("Play Playback Listeners");
	webapis.avplay.play();
	
	//Update Server content is playing * update time
	server.videoStarted(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod,this.playingPlaySessionId);
	
	//Hide Background - Showing video
	document.getElementById("allBackground").style.display="none";
	document.getElementById("videoplayer").style.display="";
	
	remotecontrol.setCurrentPage("videoPlayer");
}

//---------------------------------------------------------------------------------------------------
//   PLAYBACK FUNCTIONS 
//---------------------------------------------------------------------------------------------------

player.play = function() {
	if (webapis.avplay.getState() == "PAUSED") {
		webapis.avplay.play();
		server.videoPaused(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod,false,this.playingPlaySessionId);	
	}
}

player.pause = function() {
	if (webapis.avplay.getState() == "PLAYING") {
		webapis.avplay.pause();
		server.videoPaused(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod,true,this.playingPlaySessionId);
	}
}

player.seek = function(seekTime) {
	if (this.PlayMethod == "DirectPlay") {
		var successCallback = function() { server.videoTime(player.PlayerData.Id,player.playingMediaSource.Id,webapis.avplay.getCurrentTime(),player.PlayMethod,player.playingPlaySessionId);}
		webapis.avplay.seekTo(seekTime,successCallback);
	} else {
		//Transcoding - Need to be smart and do something..
		//Sadly I'm not smart
		var successCallback = function() { server.videoTime(player.PlayerData.Id,player.playingMediaSource.Id,webapis.avplay.getCurrentTime(),player.PlayMethod,player.playingPlaySessionId);}
		webapis.avplay.seekTo(seekTime,successCallback);
	}
}

player.rewind = function() {
	if (webapis.avplay.getState() == "PLAYING" && this.PlayMethod == "DirectPlay") {
		this.speedPos--;
		if (this.speedPos < 0) {
			this.speedPos++;
		} else {
			webapis.avplay.setSpeed(this.speed[this.speedPos]);
			
			if (this.speed[this.speedPos] == 1) {
				document.getElementById("videoPlayerSeekSpeed").innerHTML = "";
			} else {
				document.getElementById("videoPlayerSeekSpeed").innerHTML = "Speed: " + this.speed[this.speedPos];
			}	
		}	
	}
}

player.fastforward = function() {
	if (webapis.avplay.getState() == "PLAYING" && this.PlayMethod == "DirectPlay") {
		this.speedPos++;
		if (this.speedPos < this.speed.length) {
			webapis.avplay.setSpeed(this.speed[this.speedPos]);
			
			if (this.speed[this.speedPos] == 1) {
				document.getElementById("videoPlayerSeekSpeed").innerHTML = "";
			} else {
				document.getElementById("videoPlayerSeekSpeed").innerHTML = "Speed: " + this.speed[this.speedPos];
			}	
		} else {
			this.speedPos--;
		}
	}
}

player.previous = function() {
	//Check if playlist - 
	logger.log("Player.Previous");
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex--
		if (this.PlayerIndex >= 0) {
			//Load Next Video
			logger.log("Loading Next Video - To Be Implemented");
			player.stop(false);
			remotecontrol.setCurrentPage("NoItems");
		} else {
			//End Playback
			player.stop(true);
		} 
	} else {
		//Check if autoplay is enabled
		if (filesystem.getUserProperty("AutoPlay") == true && this.PlayerData.Type == "Episode" && this.AdjacentData != null) {	
			logger.log("Player.Previous Adjacent Episode");			
			if (this.AdjacentData.Items.length == 2 && (this.AdjacentData.Items[0].IndexNumber < this.PlayerData.IndexNumber)) {
				logger.log("Player.Previous Adjacent Episode == 2");
				player.stop(false);
				//Take focus to no input
				remotecontrol.setCurrentPage("NoItems");
				var url = server.getItemInfoURL(this.AdjacentData.Items[0].Id);
				this.PlayerData = xmlhttp.getContent(url);
				playerVersions.start(this.PlayerData,0,this.startParams[3]);
			} else if (this.AdjacentData.Items.length > 2) {
				logger.log("Player.Previous Adjacent Episode >2");
				player.stop(false);
				//Take focus to no input
				remotecontrol.setCurrentPage("NoItems");
				var url = server.getItemInfoURL(this.AdjacentData.Items[0].Id);
				this.PlayerData = xmlhttp.getContent(url);
				playerVersions.start(this.PlayerData,0,this.startParams[3]);
			} else {
				logger.log("Player.Previous Adjacent Episode Stop");
				player.stop(true);
			}
		} else {
			//End Playback
			player.stop(true);
		}
	}
}

player.next = function() {
	logger.log("Player.Next");
	this.playbackEnd();
}

player.playbackEnd = function() {
	//Check if playlist - 
	logger.log("Player.PlaybackEnd");
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex++
		if (this.PlayerIndex < this.VideoData.Items.length) {
			//Load Next Video
			logger.log("Loading Next Video - To Be Implemented");
			player.stop(false);
			remotecontrol.setCurrentPage("NoItems");
		} else {
			//End Playback
			player.stop(true);
		} 
	} else {
		//Check if autoplay is enabled
		if (filesystem.getUserProperty("AutoPlay") == true && this.PlayerData.Type == "Episode" && this.AdjacentData != null) {	
			logger.log("Player.PlaybackEnd Adjacent Episode");			
			if (this.AdjacentData.Items.length == 2 && (this.AdjacentData.Items[1].IndexNumber > this.PlayerData.IndexNumber)) {
				logger.log("Player.PlaybackEnd Adjacent Episode == 2");
				player.stop(false);
				//Take focus to no input
				remotecontrol.setCurrentPage("NoItems");
				var url = server.getItemInfoURL(this.AdjacentData.Items[1].Id);
				this.PlayerData = xmlhttp.getContent(url);
				playerVersions.start(this.PlayerData,0,this.startParams[3]);
			} else if (this.AdjacentData.Items.length > 2) {
				logger.log("Player.PlaybackEnd Adjacent Episode >2");
				player.stop(false);
				//Take focus to no input
				remotecontrol.setCurrentPage("NoItems");
				var url = server.getItemInfoURL(this.AdjacentData.Items[2].Id);
				this.PlayerData = xmlhttp.getContent(url);
				playerVersions.start(this.PlayerData,0,this.startParams[3]);
			} else {
				logger.log("Player.PlaybackEnd Adjacent Episode Stop");
				player.stop(true);
			}
		} else {
			//End Playback
			player.stop(true);
		}
	}
}

player.stop = function(cleanup) {
	cleanup = (cleanup === undefined) ? false : cleanup;
	
	server.videoStopped(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod,this.playingPlaySessionId);
	server.videoStopTranscode(); //Is safe to run on all videos
	webapis.avplay.stop();
	
	if (cleanup) {
		this.cleanup();
	}
}

player.cleanup = function() {
	//Clear subtitles & hide player
	document.getElementById("videoSubtitles").innerHTML="";
	document.getElementById("videoplayer").style.display="none";
	
	//Turn on screensaver
	webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
	
	//Hide Page
	document.getElementById("allBackground").style.display="";
	document.getElementById("page").style.display = "";	
	pagehistory.removeLatestURL();
	remotecontrol.setCurrentPage(this.startParams[3]);
}

//---------------------------------------------------------------------------------------------------
//    ITEM HANDLERS
//---------------------------------------------------------------------------------------------------

//Menu
player.updateSelectedMenuItems = function() {
	support.updateSelectedMenuItems(this.menuItems.length,this.selectedMenuItem,"guiTVEpisode-MenuItem highlightBackground","guiTVEpisode-MenuItem","videoPlayer-MenuItem","guiTVEpisode-MenuItemSVG highlightBackground","guiTVEpisode-MenuItemSVG");
}

//---------------------------------------------------------------------------------------------------
//    REMOTE CONTROL HANDLER
//---------------------------------------------------------------------------------------------------

player.keyDown = function() {
	var keyCode = event.keyCode;

	if (document.getElementById("videoPlayerUI").style.display == "") {
		clearTimeout(this.menuTimer);
		this.menuTimer = setTimeout(function(){ player.menuTimeout() }, 10000);
	}
		
	switch(keyCode) {
	//Need Logout Key
	case 37:
		this.processLeftKey();
		break;
	case 39:
		this.processRightKey();
		break;		
	case 38:
		this.processUpKey();
		break;	
	case 40:
		this.processDownKey();
		break;	
	case 13:
		this.processSelectedItem();
		break;
	case 415:
		logger.log  ("Play Key",1);
		player.play();
		break;
	case 19:
		logger.log  ("Pause Key",1);
		player.pause();
		break;	
	case 413:
		logger.log  ("Stop Key",1);
		player.stop(true);
		break;
	case 412:
		logger.log  ("Rewind Key",1);
		player.rewind();
		break;
	case 417:
		logger.log  ("FastForward Key",1);
		player.fastforward();
		break;
	case 10232:
		logger.log  ("Previous Key",1);
		player.previous();
		break;
	case 10233:
		logger.log  ("Next Key",1);
		player.next();
		break;			
	case 10009:
		logger.log("RETURN",1);
		event.preventDefault();
		pagehistory.processReturnURLHistory();
		break;				
	case 10182:
		logger.log ("EXIT KEY",1);
		event.preventDefault();
		//Server updated before video stop to get currentPlayTime
		player.stop(false);
		tizen.application.getCurrentApplication().exit();
		break;
	}
};

player.processLeftKey = function() {
	if (document.getElementById("videoPlayerUI").style.display == "") {
		if (this.selectedRow == 0) {
			//Menu Item
			if (this.selectedMenuItem > 0) {
				this.selectedMenuItem--;
				this.updateSelectedMenuItems();
			}
		} else {
			//Seek Bar
			if (this.seekPos > 0 || this.seekPos == -1) {
				if (this.seekPos == -1) {
					this.seekPos = webapis.avplay.getCurrentTime() - this.seekTimeBackMs; //webapis.avplay.getCurrentTime() + 60000;
				} else {
					this.seekPos-= this.seekTimeBackMs;
				}	
				
				if (this.seekPos >= 0) {
					var pos =  1200 * (this.seekPos / webapis.avplay.getDuration()) //webapis.avplay.getDuration()
					document.getElementById("videoPlayerSeekBarPosition").style.left = pos-16+"px";
					document.getElementById("videoPlayerSeekBarPositionTime").innerHTML = player.convertmstotime(this.seekPos);
				} else {
					document.getElementById("videoPlayerSeekBarPosition").style.left = 0-16+"px";
					document.getElementById("videoPlayerSeekBarPositionTime").innerHTML = player.convertmstotime(0);	
				}
			}
		}
	} else {
		//This if here as I dont want to allow multiple short 30s seeking for transcoding - seek can be done via seek bar whilst transcoding
		if (this.PlayMethod == "DirectPlay") {
			this.seek(webapis.avplay.getCurrentTime() - this.seekTimeBackMs);
		}
	}
}

player.processRightKey = function() {
	if (document.getElementById("videoPlayerUI").style.display == "") {
		if (this.selectedRow == 0) {
			//Menu Item
			if (this.selectedMenuItem < this.menuItems.length-1) {
				this.selectedMenuItem++;
				this.updateSelectedMenuItems();
			}
		} else {
			//Seek Bar
			if (this.seekPos < webapis.avplay.getDuration()) { //webapis.avplay.getDuration()
				if (this.seekPos == -1) {
					this.seekPos = webapis.avplay.getCurrentTime() + this.seekTimeForwardMs; //webapis.avplay.getCurrentTime() + this.seekTimeForwardMs;
				} else {
					this.seekPos+= this.seekTimeForwardMs;
				}			
				
				if (this.seekPos <=  webapis.avplay.getDuration()) { //webapis.avplay.getDuration()
					var pos =  1200 * (this.seekPos / webapis.avplay.getDuration()) //webapis.avplay.getDuration()
					document.getElementById("videoPlayerSeekBarPosition").style.left = pos-16+"px";
					document.getElementById("videoPlayerSeekBarPositionTime").innerHTML = player.convertmstotime(this.seekPos);
				} else {
					document.getElementById("videoPlayerSeekBarPosition").style.left = 1200-16+"px";
					document.getElementById("videoPlayerSeekBarPositionTime").innerHTML = player.convertmstotime(webapis.avplay.getDuration());				
				}	
			}
		}
	} else {
		//This if here as I dont want to allow multiple short 30s seeking for transcoding - seek can be done via seek bar whilst transcoding
		if (this.PlayMethod == "DirectPlay") {
			this.seek(webapis.avplay.getCurrentTime() + this.seekTimeForwardMs);
		}
	}	
}

player.processUpKey = function() {
	if (document.getElementById("videoPlayerUI").style.display == "") {
		if (this.selectedRow == 1) {
			this.selectedRow = 0;
			document.getElementById("videoPlayerSeekBarPositionTime").style.display = "none";
			document.getElementById("videoPlayerSeekBarPosition").className = "videoPlayerSeekBarPosition";
			this.selectedMenuItem = this.menuItemsPlayPausePos;
			this.updateSelectedMenuItems();
		}
	} else {
		//Display UI
		this.menuDisplay();
	}
}

player.processDownKey = function() {
	if (document.getElementById("videoPlayerUI").style.display == "") {
		if (this.selectedRow == 0) {
			this.selectedRow = 1;
			//Unset Menu
			this.selectedMenuItem = -1;
			this.updateSelectedMenuItems();
			//Set Seek Position
			document.getElementById("videoPlayerSeekBarPosition").className = "videoPlayerSeekBarPosition highlightBackground";
			//Unhide Seek Position Time
			document.getElementById("videoPlayerSeekBarPositionTime").innerHTML = player.convertmstotime(webapis.avplay.getCurrentTime()); //player.convertmstotime(webapis.avplay.getCurrentTime());
			document.getElementById("videoPlayerSeekBarPositionTime").style.display = "";
		}
	} else {
		//Display UI
		this.menuDisplay();
	}
}

player.processSelectedItem = function() {
	if (document.getElementById("videoPlayerUI").style.display == "") {
		if (this.selectedRow == 0) {
			//Menu Bar
			switch (this.menuItems[this.selectedMenuItem]) {
			case "Play":
				this.play();
				document.getElementById('videoPlayer-MenuItemPlayPausePath').setAttribute('d','M6 19h4V5H6v14zm8-14v14h4V5h-4z');
				this.menuItems[this.menuItemsPlayPausePos] = "Pause";
				break;
			case "Pause":
				this.pause();
				document.getElementById('videoPlayer-MenuItemPlayPausePath').setAttribute('d',"M8 5v14l11-7z");
				this.menuItems[this.menuItemsPlayPausePos] = "Play";
				break;
			case "Rewind":
				player.rewind();
				break;
			case "Fast Forward":
				player.fastforward();
				break;	
			case "Previous":
				player.previous();
				break;
			case "Next":
				player.next();
				break;
			case "CC":
				this.showSubtitles = (this.showSubtitles == true) ? false : true;
				if (this.showSubtitles == false) {
					//Need to hide UI
					document.getElementById("videoSubtitles").innerHTML = "";
				}
				break;
			}
		} else if (this.selectedRow == 1) {
			//Seek Bar
			this.seek(this.seekPos);
			this.menuTimeout();
		}
	} else {
		//Show menu
		this.menuDisplay();
	}
}

//---------------------------------------------------------------------------------------------------
//   Helper Functions
//---------------------------------------------------------------------------------------------------


player.menuDisplay = function() {
	this.updateSelectedMenuItems();
	document.getElementById("videoPlayerUI").style.display = "";
	clearTimeout(this.menuTimer);
	this.menuTimer = setTimeout(function(){ player.menuTimeout() }, 10000);
}

player.menuTimeout = function() {
	clearTimeout(this.menuTimer);
	document.getElementById("videoPlayerUI").style.display = "none";
	document.getElementById("videoPlayerSeekBarPositionTime").style.display = "none";
	document.getElementById("videoPlayerSeekBarPosition").className = "videoPlayerSeekBarPosition";
	this.selectedMenuItem = this.menuItemsPlayPausePos; 
	this.selectedRow = 0;
	this.seekPos = -1;
}

player.generateUI = function() {
	
	//Reset
	this.menuItems.length = 0;
	this.menuItemsPlayPausePos = 0;
	this.selectedMenuItem = 0; 
	this.selectedRow = 0;
	this.seekPos = -1;
	this.speedPos = 2;
	
	if (this.PlayMethod == "DirectPlay") {
		//Only Add Previous if there is previous in current playlist or if autoplay is on and adjacentData has a previous eposide
		//AdjacentData will be null here if autoplay is disabled! No need to check here
		if (this.startParams[0] == "PlayAll" && this.VideoData[this.PlayerIndex-1] !== undefined) {
			this.menuItems.push("Previous");
		} else if (this.AdjacentData != null && this.AdjacentData.Items[0].IndexNumber < this.PlayerData.IndexNumber) {
			this.menuItems.push("Previous");
		}
	
		this.menuItems.push("Rewind");
		this.menuItems.push("Pause");
		this.menuItems.push("Fast Forward");
		
		//Only Add Previous if there is previous in current playlist or if autoplay is on and adjacentData has a previous eposide
		//AdjacentData will be null here if autoplay is disabled! No need to check here
		if (this.startParams[0] == "PlayAll" && this.VideoData[this.PlayerIndex+1] !== undefined) {
			this.menuItems.push("Next");
		} else if (this.AdjacentData != null && ((this.AdjacentData.Items.length == 2 && this.AdjacentData.Items[1].IndexNumber > this.PlayerData.IndexNumber) || (this.AdjacentData.Items.length == 3))) {
			this.menuItems.push("Next");
		}	
	} else {
		this.menuItems.push("Previous");
		this.menuItems.push("Pause");
		this.menuItems.push("Next");
	}
	this.menuItems.push("CC");
	this.menuItems.push("Settings");
	
	document.getElementById("videoPlayerControls").innerHTML = "";
	document.getElementById("videoPlayerSettings").innerHTML = "";
	for (var index = 0; index < this.menuItems.length; index++) {
		if (this.menuItems[index] == "Previous") {
			document.getElementById("videoPlayerControls").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='M6 6h2v12H6zm3.5 6l8.5 6V6z'/></svg></span>";
		} else if (this.menuItems[index] == "Rewind") {
			document.getElementById("videoPlayerControls").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z'/></svg></span>";
		} else if (this.menuItems[index] == "Pause") {
			this.menuItemsPlayPausePos = index;
			document.getElementById("videoPlayerControls").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path id='videoPlayer-MenuItemPlayPausePath' d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/></svg></span>";
		} else if (this.menuItems[index] == "Fast Forward") {
			document.getElementById("videoPlayerControls").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z'/></svg></span>";
		} else if (this.menuItems[index] == "Next") {
			document.getElementById("videoPlayerControls").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'/></svg></span>";
		} else if (this.menuItems[index] == "CC") {
			document.getElementById("videoPlayerSettings").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z'/></svg></span>";
		} else if (this.menuItems[index] == "Settings") {
			document.getElementById("videoPlayerSettings").innerHTML += "<svg id='videoPlayer-MenuItem" + index + "' class='guiTVEpisode-MenuItemSVG ' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><path d='M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' /></svg></span>";	
		}
	}
	
	this.selectedMenuItem = this.menuItemsPlayPausePos;
	this.updateSelectedMenuItems();
	
	document.getElementById("videoPlayerSeek").innerHTML = '<div id="videoPlayerTimeCurrent" class="videoPlayerTimeCurrent">00:02:35</div><div class="videoPlayerSeekBar">' +
	    '<div id="videoPlayerSeekBarPlayed" class="videoPlayerSeekBarPlayed" style="width:0px";></div>' +
	    '<div id="videoPlayerSeekBarPosition" class="videoPlayerSeekBarPosition"><div id="videoPlayerSeekBarPositionTime" class="videoPlayerSeekBarPositionTime" style="display:none"></div></div>' +
	    '</div><div id="videoPlayerTimeRemaining" class="videoPlayerTimeRemaining">00:12:14</div>';

	/*
	if (this.PlayMethod == "DirectPlay") {
		document.getElementById("videoPlayerPlaybackMethod").innerHTML = "Direct Play";
	} else {
		document.getElementById("videoPlayerPlaybackMethod").innerHTML = "Transcoding";
	}
	*/
	document.getElementById("videoPlayerPlaybackMethod").innerHTML = this.playingTranscodeStatus;
	
	if (this.PlayerData.Type == "Episode") {
		var videoTitle ="";
		if (this.PlayerData.ParentIndexNumber != undefined && this.PlayerData.IndexNumber != undefined) {
			videoTitle =  "<span>"+this.PlayerData.SeriesName+" S" + this.PlayerData.ParentIndexNumber + ",E" + this.PlayerData.IndexNumber + " - " + this.PlayerData.Name + "</span>";		
		} else {
			videoTitle = this.PlayerData.SeriesName + " - "+this.PlayerData.Name;
		}

	} else {
		var videoTitle = this.PlayerData.Name;
		
		//Add the series logo at the top left.
		if (this.PlayerData.LogoImageTag) {
			var imgsrc = server.getImageURL(this.PlayerData.Id,"Logo",this.PlayerData.LogoImageTag,"videoPlayer");
			document.getElementById("videoPlayerMediaItemLogo").style.backgroundImage="url('"+imgsrc+"')";	
		}	
	}
	
	document.getElementById("videoPlayerMediaInfo").innerHTML = videoTitle;
}

player.convertmstotime = function(currentTime) {
	timeHour = Math.floor(currentTime / 3600000);
	timeMinute = Math.floor((currentTime % 3600000) / 60000);
	timeSecond = Math.floor((currentTime % 60000) / 1000);
	timeHTML = timeHour + ":";
	
	if (timeMinute == 0) {
		timeHTML += "00:";
	} else if (timeMinute < 10) {
		timeHTML += "0" + timeMinute + ":";
	} else {
		timeHTML += timeMinute + ":";
	}
	
	if (timeSecond == 0) {
		timeHTML += "00";
	} else if (timeSecond < 10) {
		timeHTML += "0" + timeSecond;
	} else {
		timeHTML += timeSecond;
	}		   
	return timeHTML;
}