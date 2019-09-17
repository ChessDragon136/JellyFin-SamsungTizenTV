//NOTE
//
//Samsung Player accepts seconds
//Samsung Current time works in seconds * 1000
//Emby works in seconds * 10000000

var player = {	
		updateTimeCount : 0,
		PlayMethod : "",
		videoStartTime : null,
		offsetSeconds : 0, //For transcode, this holds the position the transcode started in the file
		
		playingMediaSource : null,
		playingMediaSourceIndex : null,
		playingURL : null,
		playingTranscodeStatus : null,
		playingVideoIndex : null,
		playingAudioIndex : null,
		playingSubtitleIndex : null,
			
		VideoData : null,
		PlayerData : null,
		PlayerDataSubtitle : null,
		PlayerIndex : null,
		
		subtitleInterval : null,
		subtitleShowingIndex : 0,
		subtitleSeeking : false,
		startParams : [],
		infoTimer : null
};


player.start = function(title,url,startingPlaybackTick,playedFromPage) { 
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
	 logger.log("Start Playback");
	//Expand TranscodeAlg to useful variables!!!
	this.playingMediaSourceIndex = TranscodeAlg[0];
	this.playingMediaSource = this.PlayerData.MediaSources[TranscodeAlg[0]];
	this.playingURL = TranscodeAlg[1];
	this.playingTranscodeStatus = TranscodeAlg[2];
	this.playingVideoIndex = TranscodeAlg[3];
	this.playingAudioIndex = TranscodeAlg[4];
	this.playingSubtitleIndex = TranscodeAlg[5];
	
	//Set PlayMethod
	if (this.playingTranscodeStatus == "Direct Play"){
		this.PlayMethod = "DirectPlay";
	} else {
		this.PlayMethod = "Transcode";
	}

	//Register Keys
	tizen.tvinputdevice.registerKey('MediaStop');
	
	document.getElementById("allBackground").style.display = "none";
	document.getElementById("page").style.display = "none";	
	document.getElementById("av-player").style.display = "";
	
	logger.log("Initialise Playback URL");
	webapis.avplay.open(this.playingURL);
	webapis.avplay.setDisplayRect(0,0,1920,1080);
	webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_FULL_SCREEN");
	webapis.avplay.seekTo(this.startParams[2]);
	
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
					webapis.avplay.setSelectTrack('AUDIO',totalTrackInfo[player.playingAudioIndex].index);
					
					//Set subtitle track
					//if (player.playingSubtitleIndex != -1) {
						//webapis.avplay.setSelectTrack('TEXT',totalTrackInfo[player.playingSubtitleIndex].index);
					//}
					

			  },
			  
			  onsubtitlechange: function(duration, text, data3, data4) {
				  //Samsung limitation - Can not show overlapping subtitles
				  document.getElementById("videoSubtitles").innerHTML=text;
			  },
			  
			  onstreamcompleted: function() {
			    logger.log("Stream Completed");
			    player.stop();
			  },
			  oncurrentplaytime: function(currentTime) {
				  //Seems to run every 0.5 seconds
					player.updateTimeCount++;
					if (player.updateTimeCount == 60) {
						player.updateTimeCount = 0;
						server.videoTime(player.PlayerData.Id,player.playingMediaSource.Id,currentTime,player.PlayMethod);
					}
			  },
			  onerror: function(eventType,data) {
				  logger.log("An error has happened :(");
				  logger.log("Stream Error: " + data);
				  player.stop();
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
	
	document.getElementById("videoplayer").style.display="";
	
	//Update Server content is playing * update time
	server.videoStarted(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod);
	
	remotecontrol.setCurrentPage("videoPlayer");
}

player.keyDown = function() {
	var keyCode = event.keyCode;
	switch(keyCode) {
	case 37: //Left
		var successCallback = function() { server.videoTime(player.PlayerData.Id,player.playingMediaSource.Id,webapis.avplay.getCurrentTime(),player.PlayMethod);}
		webapis.avplay.seekTo(webapis.avplay.getCurrentTime() - 60000,successCallback);
		break;
	case 39: //Right
		var successCallback = function() { server.videoTime(player.PlayerData.Id,player.playingMediaSource.Id,webapis.avplay.getCurrentTime(),player.PlayMethod);}
		webapis.avplay.seekTo(webapis.avplay.getCurrentTime() + 60000,successCallback);
		break;		
	case 413:
		logger.log  ("Stop Key");
		player.stop();
		break;
		
	case 10182:
		logger.log ("EXIT KEY");
		event.preventDefault();
		//Server updated before video stop to get currentPlayTime
		server.videoStopped(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod);
		webapis.avplay.stop();
		server.videoStopTranscode(); //Is safe to run on all videos
		tizen.application.getCurrentApplication().exit();
		break;
	}
};

player.stop = function() {
	//Server updated before video stop to get currentPlayTime
	server.videoStopped(this.PlayerData.Id,this.playingMediaSource.Id,webapis.avplay.getCurrentTime(),this.PlayMethod);
	webapis.avplay.stop();
	server.videoStopTranscode(); //Is safe to run on all videos
	
	//Clear subtitles & hide player
	document.getElementById("videoSubtitles").innerHTML="";
	document.getElementById("videoplayer").style.display="none";
	
	//Turn on screensaver
	webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
	
	
	document.getElementById("av-player").style.display = "none";
	document.getElementById("allBackground").style.display = "";
	document.getElementById("page").style.display = "";	
	pagehistory.removeLatestURL();
	remotecontrol.setCurrentPage(this.startParams[3]);
}