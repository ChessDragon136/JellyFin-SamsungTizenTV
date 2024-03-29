var playerTranscodingParams = {
		codec : null,
		container : null,
		resolution : null,
		bitrate : null,
		framerate : null,
		level : null,
		profile : null,
		audiocodec : null,
		audiocontainer : null,
		audiochannels : null
} 

playerTranscodingParams.getParameters = function(codec,videoWidth) {
	switch (main.modelYear) {
	    case "HU":
	    default:	
			switch (codec) {
			case "mpeg2video":
				this.codec = true;
				this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
				this.resolution = [3840,2160];
				this.bitrate = 30720000;
				this.framerate = 30;
				this.level = true;
				this.profile = true;
				break;
			case "mpeg4":
				this.codec = true;
				this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
				this.resolution = [3840,2160];
				this.bitrate = 30720000;
				if (videoWidth > 720){
					this.framerate = 30;
				} else {
					this.framerate = 60;
				}
				this.level = true;
				this.profile = true;
				break;
			case "h264":
				this.codec = true;
				this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
				this.resolution = [3840,2160];
				this.bitrate = 50720000; //SWH TEMP - Legend of Vox Machina Stutters
				this.framerate = 30;
				this.level = 41;
				this.profile = ["Base","Constrained Baseline","Baseline","Main","High"];
				break;
		    case "hevc":    	    
		    	this.codec = true;
		    	this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
		    	this.resolution = [3840,2160];
		    	this.bitrate = 50720000;
		    	this.framerate = 30;
		    	this.level = 153;			//  Level 4  (HEVC is x30 not x10 like h264)
		    	this.profile = ["Base","Constrained Baseline","Baseline","Main","High"];
		    	break;			
		    case "h265":
		    	this.codec = true;
		    	this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
		    	this.resolution = [3840,2160];
		    	this.bitrate = 50720000;
		    	this.framerate = 30;
		    	this.level = 51;
		    	this.profile = ["Base","Constrained Baseline","Baseline","Main","High"];
		    	break;
		    case "mvc":	
		    	this.codec = true;
		    	this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
		    	this.resolution = [3840,2160];
		    	this.bitrate = 60720000;
		    	this.framerate = 30;
		    	this.level = 41;
		    	this.profile = ["Base","Constrained Baseline","Baseline","Main","High"];
		    	break;
			case "wmv2":
				this.codec = true;
				this.container = ["asf"];
				this.resolution = [3840,2160];
				this.bitrate = 25600000;
				this.framerate = 30;
				this.level = true;
				this.profile = true;
				break;
			case "wmv3":
				this.codec = true;
				this.container = ["asf"];
				this.resolution = [3840,2160];
				this.bitrate = 25600000;
				this.framerate = 30;
				this.level = true;
				this.profile = true;
				break;
			case "vc1":	
				this.codec = true;
				this.container = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
				this.resolution = [3840,2160];
				this.bitrate = 30720000;
				this.framerate = 30;
				this.level = true;
				this.profile = true;
				break;
			default:
				this.codec = null;
				this.container = null;
				this.resolution = null;
				this.bitrate = 50720000;
				this.framerate = null;
				this.level = null;
				this.profile = null;
				break;
			}
		break;
	}
	return [this.codec,this.container,this.resolution,this.bitrate,this.framerate,this.level,this.profile];
}


playerTranscodingParams.getAudioParameters = function(audiocodec) {
	switch (main.modelYear) {
	case "H":
	case "HU":
	default:	
		switch (audiocodec) {
		case "aac":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "mp3":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "mp2":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "ac3":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "wmav2":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "wmapro":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "wmavoice":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "dca":
		case "dts":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 8;
			break;
		case "eac3":	
			this.audiocodec = false;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 6;
			break;
		case "pcm":	
		case "pcm_s16le":	
		case "pcm_s24le":
		case "pcm_s32le":
			this.audiocodec = true;
			this.audiocontainer = ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts","divx"];
			this.audiochannels = 2;
			break;	
		}
		break;	
	}
	return [this.audiocodec,this.audiocontainer,this.audiochannels];
}