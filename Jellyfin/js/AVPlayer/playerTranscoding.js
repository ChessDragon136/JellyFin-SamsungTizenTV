var playerTranscoding = {		
		//File Information
		MediaSource : null,
		videoIndex : 0,
		audioIndex : 0,
	
		//Bitrate check
		bitRateToUse : null,
		
		//Boolean that conclude if all Video or All Audio elements will play without transcode
		isVideo : true,
		isAudio : true,
		
		//All Video Elements
		isCodec : null,
		isResolution : null,
		isContainer : null,
		isBitRate : null,
		isLevel : null,	
		isFrameRate : null,
		isProfile : null,
		
		//All Audio elements
		isAudioCodec : null,
		isAudioContainer : null,
		isAudioChannel : null
}

//--------------------------------------------------------------------------------------
playerTranscoding.start = function(showId, MediaSource,MediaSourceIndex, videoIndex, audioIndex, isFirstAudioIndex, subtitleIndex) {	
	//Set Class Vars
	this.MediaSource = MediaSource;
	this.videoIndex = videoIndex;
	this.audioIndex = audioIndex;
	
	//Check Video & Audio Compatibility
	this.checkCodec(videoIndex);
	this.checkAudioCodec(audioIndex);

	var streamparams = "";
	var transcodeStatus = "";
	var streamAudioCodec = "aac"; //Temp - Not sure what to use! Probably was tied into settings

	if (this.isVideo && this.isAudio) {
		transcodeStatus = "Direct Play";
		streamparams = '/Stream.'+this.MediaSource.Container+'?static=true&MediaSourceId='+this.MediaSource.Id + '&api_key=' + server.getAuthToken();
		
	} else if (this.isVideo == false) {
		transcodeStatus = "Transcoding Audio & Video";	
		streamparams = '/master.m3u8?VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&VideoCodec=h264&Profile=high&Level=41&MaxVideoBitDepth=8&MaxWidth=1920&VideoBitrate='+this.bitRateToUse+'&AudioCodec=' + streamAudioCodec +'&AudioBitrate=360000&MaxAudioChannels=6&MediaSourceId='+this.MediaSource.Id + '&api_key=' + server.getAuthToken();	
		if (subtitleIndex != -1) {
			streamparams += '&SubtitleStreamIndex='+subtitleIndex; //SubtitleMethod is broken
		}
	} else if (this.isVideo == true && (this.isAudio == false || convertAACtoDolby == true)) {
		transcodeStatus = "Transcoding Audio";	
		streamparams = '/master.m3u8?VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&VideoCodec=copy&AudioCodec='+ streamAudioCodec +'&audioBitrate=360000&MaxAudioChannels=6&MediaSourceId='+this.MediaSource.Id + '&api_key=' + server.getAuthToken();
		if (subtitleIndex != -1) {
			streamparams += '&SubtitleStreamIndex='+subtitleIndex; //SubtitleMethod is broken
		}
	}
	var url = server.getserverAddr() + '/Videos/' + showId + streamparams + '&DeviceId='+server.getDeviceID();
	logger.log("Video : Transcode Status : " + transcodeStatus);
	logger.log("Video : URL : " + url);
	
	//Return results to Versions
	//MediaSourceId,Url,transcodeStatus,videoIndex,audioIndex
	return [MediaSourceIndex,url,transcodeStatus,videoIndex,audioIndex,subtitleIndex];	
}

playerTranscoding.checkCodec = function() {
	var codec = this.MediaSource.MediaStreams[this.videoIndex].Codec.toLowerCase();
	var codecParams = playerTranscodingParams.getParameters(codec,this.MediaSource.MediaStreams[this.videoIndex].Width);
	
	this.isCodec = codecParams[0];
	this.isContainer = this.checkContainer(codecParams[1]);
	this.isResolution = this.checkResolution(codecParams[2]);
	this.isBitRate = this.checkBitRate(codecParams[3]);
	this.isFrameRate = this.checkFrameRate(codecParams[4]);
	this.isLevel = this.checkLevel(codecParams[5]);
	this.isProfile = this.checkProfile(codecParams[6]);
	
	//Results
	logger.log("Video : Video File Analysis Results");
	logger.log("Video : Codec Compatibility: " + this.isCodec + " : " + this.MediaSource.MediaStreams[this.videoIndex].Codec);
	logger.log("Video : Container Compatibility: " + this.isContainer + " : " + this.MediaSource.Container);
	logger.log("Video : Resolution Compatibility: " + this.isResolution + " : " +this.MediaSource.MediaStreams[this.videoIndex].Width + "x" + this.MediaSource.MediaStreams[this.videoIndex].Height);
	logger.log("Video : BitRate Compatibility: " + this.isBitRate + " : " + this.MediaSource.MediaStreams[this.videoIndex].BitRate + " : " + this.bitRateToUse);
	logger.log("Video : FrameRate Compatibility: " + this.isFrameRate + " : " + this.MediaSource.MediaStreams[this.videoIndex].AverageFrameRate);
	logger.log("Video : Level Compatibility: " + this.isLevel + " : " + this.MediaSource.MediaStreams[this.videoIndex].Level);
	logger.log("Video : Profile Compatibility: " + this.isProfile + " : " + this.MediaSource.MediaStreams[this.videoIndex].Profile);
	
	//Put it all together
	if (this.isCodec && this.isContainer && this.isResolution && this.isBitRate && this.isFrameRate && this.isLevel && this.isProfile) { // 
		this.isVideo = true;
	} else {
		this.isVideo = false;
	}
}

playerTranscoding.checkAudioCodec = function() {
	var audiocodec = this.MediaSource.MediaStreams[this.audioIndex].Codec.toLowerCase();
	var audiocodecParams = playerTranscodingParams.getAudioParameters(audiocodec);
	
	this.isAudioCodec = audiocodecParams[0];
	this.isAudioContainer = this.checkContainer(audiocodecParams[1]);
	this.isAudioChannel = this.checkAudioChannels(audiocodecParams[2]);		
	
	//Results
	logger.log("Video : Audio File Analysis Results");
	logger.log("Video : Codec Compatibility: " + this.isAudioCodec + " : " + this.MediaSource.MediaStreams[this.audioIndex].Codec);
	logger.log("Video : Container Compatibility: " + this.isAudioContainer + " : " + this.MediaSource.Container);
	logger.log("Video : Channel Compatibility: " + this.isAudioChannel + " : " + this.MediaSource.MediaStreams[this.audioIndex].Channels);
	
	//Put it all together
	if (this.isAudioCodec && this.isAudioChannel) {
		this.isAudio = true;
	} else {
		this.isAudio = false;
	}		
}

playerTranscoding.checkAudioChannels = function(maxChannels) {
	if (maxChannels == null) {
		return false;
	} else {
		if (this.MediaSource.MediaStreams[this.audioIndex].Channels <= maxChannels) {
			return true;
		} else {
			return false;
		}
	}
}

playerTranscoding.checkResolution = function(maxResolution) {
	if (maxResolution == null) {
		return false;
	} else if (this.MediaSource.MediaStreams[this.videoIndex].Width <= maxResolution[0] && this.MediaSource.MediaStreams[this.videoIndex].Height <= maxResolution[1]) {
		return true;
	} else {
		return false;
	}
}

playerTranscoding.checkContainer = function(supportedContainers) {
	if (supportedContainers == null) {
		return false
	} else {
		var isContainer = false;
		for (var index = 0; index < supportedContainers.length; index++) {
			if (this.MediaSource.Container.toLowerCase() == supportedContainers[index]) {
				isContainer =  true;
				break;
			}
		}
		return isContainer;
	}
}

playerTranscoding.checkBitRate = function(maxBitRate) {
	//Get Bitrate from Settings File
	var maxBitRateSetting = filesystem.getTVProperty("Bitrate")*1024*1024;

    // MCB - Ignore bitrate in file
    this.bitRateToUse = maxBitRateSetting;

	if (this.MediaSource.MediaStreams[this.videoIndex].BitRate > maxBitRateSetting) {
		return false;
	} else {
		return true;
	}
}

playerTranscoding.checkFrameRate = function(maxFrameRate) {
	if (maxFrameRate == null) {
		return false;
	} else if (this.MediaSource.MediaStreams[this.videoIndex].AverageFrameRate <= maxFrameRate) {
		return true;
	} else {
		return false;
	}
}

playerTranscoding.checkLevel = function(maxLevel) {
	var level = this.MediaSource.MediaStreams[this.videoIndex].Level;
	if (maxLevel == null) {
		return false;
	} if (maxLevel == true) {
		return true;
	} else {
		var level = this.MediaSource.MediaStreams[this.videoIndex].Level;
		level = (level < 10) ? level * 10 : level; //If only 1 long, multiply by 10 to make it correct!
		if (level <= maxLevel && level >= 0) {
			return true;
		} else {
			return false;
		}
	}
}

playerTranscoding.checkProfile = function(supportedProfiles) {
	if (supportedProfiles == null) {
		return false;
	} if (supportedProfiles == true) {
		return true;
	} else {
		var profile = false;
		for (var index = 0; index < supportedProfiles.length; index++) {
			if (this.MediaSource.MediaStreams[this.videoIndex].Profile == supportedProfiles[index]) {
				profile = true;
				break;
			}
		}
		return profile;
	}
}