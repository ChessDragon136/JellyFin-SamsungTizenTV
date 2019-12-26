var support = {	
		//Scrolling Text's 
		startScroll : null,
		scroller : null,
		scrollpos : 0,
		resetToTop : null,
};

//------------------------------------------------------------
//    Utility Functions
//------------------------------------------------------------	

support.logout = function() {
	server.setUserID("");
	server.setUserName("");
	server.logout();
	guiUsers.start();
}

support.clock = function() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	m = checkTime(m);
	document.getElementById('bannerClock').innerHTML =
	h + ":" + m;
	var t = setTimeout(support.clock, 900);
	function checkTime(i) {
	  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	  return i;
	}
}

//Used for background image
support.fadeImage = function(imgsrc) {
	var bg = document.getElementById('pageBackground').style.backgroundImage;
	bg = bg.replace('url(','').slice(0, -1);
	if (bg.substring(0,5) == "'file") {
		bg = bg.substring(bg.indexOf("images")).slice(0, -1);
	}
	//Do nothing if the image is the same as the old one.
	if (bg != imgsrc) {
		//Copy the current background image to the holder.
		document.getElementById("pageBackgroundHolder").style.backgroundImage = "url('"+bg+"')";
		//Make the standard pageBackground transparent.
		document.getElementById("pageBackground").className = "pageBackground quickFade";
		document.getElementById("pageBackground").style.opacity = "0";
		setTimeout(function(){
			document.getElementById("pageBackground").style.backgroundImage = "url('"+imgsrc+"')";
			document.getElementById("pageBackground").className = "pageBackground";
			document.getElementById("pageBackground").style.opacity = "1";
		}, 350);
	}	
}

support.scrollingText = function(divToScroll) {
	
	clearTimeout(support.startScroll);
	clearTimeout(support.resetToTop);
	clearInterval(support.scroller);
	
	var div = $('#'+divToScroll+'');
	div.scrollTop(0);
	support.scrollpos = 0;

	support.startScroll = setTimeout(function(){		
		support.scroller = setInterval(function(){
			var pos = div.scrollTop() + 1;
		    div.scrollTop(pos);
		    
		    if (support.scrollpos == pos) {
		    	clearInterval(support.scroller);
		    	support.resetToTop = setTimeout(function(){	
		    		support.scrollingText(divToScroll);
				}, 10000); //Length of pause at the bottom
		    } else {
		    	support.scrollpos = pos;
		    }	    
		}, 200); //Scrolling speed
	}, 10000);	//Intial delay
}

support.convertTicksToMinutes = function (currentTime) {
	timeMinute = Math.floor((currentTime / 3600000) * 60);
	return timeMinute + " mins";
}

support.convertTicksToMinutesJellyfin = function (currentTime) {
	timeMinute = Math.round((currentTime / 36000000000) * 60);
	return timeMinute + " mins";
}

support.convertTicksToTime = function (currentTime, duration) {
	totalTimeHour = Math.floor(duration / 3600000);
    timeHour = Math.floor(currentTime / 3600000);
    totalTimeMinute = Math.floor((duration % 3600000) / 60000);
    timeMinute = Math.floor((currentTime % 3600000) / 60000);
    totalTimeSecond = Math.floor((duration % 60000) / 1000);
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
        timeHTML += "00/";
    } else if (timeSecond < 10) {
         timeHTML += "0" + timeSecond + "/";
    } else {
         timeHTML += timeSecond + "/";
    }
    timeHTML += totalTimeHour + ":";

    if (totalTimeMinute == 0) {
         timeHTML += "00:";
    } else if (totalTimeMinute < 10)
        timeHTML += "0" + totalTimeMinute + ":";
    else {
         timeHTML += totalTimeMinute + ":";

    }

    if (totalTimeSecond == 0) {
         timeHTML += "00";
    } else if (totalTimeSecond < 10) {
        timeHTML += "0" + totalTimeSecond;
    } else
        timeHTML += totalTimeSecond;
    
    return timeHTML;
}

support.convertTicksToTimeSingle = function (currentTime) {
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
	   
	   //ShowMin will show only the time without any leading 00
	   if (timeHour == 0) {
		   timeHTML = timeHTML.substring(2,timeHTML.length);
	   }
	   
	   return timeHTML;
	}

support.loadHighlightCSS = function(newFromSettings) {
	var headID = document.getElementsByTagName("head")[0];
	var cssNode = document.createElement('link');
	cssNode.rel = 'stylesheet';
	cssNode.type = 'text/css';
	
	//If set, load from var, else get from config file
	if (newFromSettings !== undefined && newFromSettings != null) {
		cssNode.href = newFromSettings;
	} else {
		cssNode.href = filesystem.getUserProperty("HighlightColour");
	}

	headID.appendChild(cssNode);
}

support.unloadHighlightCSS = function() {
	var targetAttr = "href";
	var filename = filesystem.getUserProperty("HighlightColour");

	var allCtrl = document.getElementsByTagName("link");
	for (var i=allCtrl.length; i>=0; i--)  { //search backwards within nodelist for matching elements to remove
		if (allCtrl[i] && allCtrl[i].getAttribute(targetAttr)!=null && allCtrl[i].getAttribute(targetAttr).indexOf(filename)!=-1) {
			allCtrl[i].parentNode.removeChild(allCtrl[i]);
		}
	}
}
//------------------------------------------------------------
//Display (Formatting) Functionss
//------------------------------------------------------------	
support.getNameFormat = function(SeriesName, SeriesNo, EpisodeName, EpisodeNo) {
	var nameLabel;
	if (SeriesName == "" || SeriesName == null) {
		if (SeriesNo != undefined && EpisodeNo != undefined) {					
			if (EpisodeName == "" || EpisodeName == null) {
				nameLabel = "S" + SeriesNo + ",E" + EpisodeNo;	
			} else {
				nameLabel = "S" + SeriesNo + ",E" + EpisodeNo + " - " + EpisodeName;	
			}	
		} else {
			var nameLabel = EpisodeName;
		}
	} else {
		//Used by Home Page Views Only
		if (SeriesNo != undefined && EpisodeNo != undefined) {
			nameLabel = SeriesName + "<br><span class='displayedItem-SubTitle'>S" + SeriesNo + ",E" + EpisodeNo + " - " + EpisodeName + "</span>";		
		} else {
			nameLabel = SeriesName + "<br>"+EpisodeName;
		}
	}
	return nameLabel;
}

support.AirDate = function(apiDate, type) {
	var dateString = "";
	var year = apiDate.substring(0,4);
	var month = apiDate.substring(5,7);
	var day = apiDate.substring(8,10);
	var hour = apiDate.substring(11,13);
	var min = apiDate.substring(14,16);
	
	if (type == "Recording"){
		dateString = day + '/' + month + '/' + year + " " + hour + ":" + min;
	} else if (type != "Episode") {
		dateString = year;
	} else {
		dateString = day + '/' + month + '/' + year;
	}
	return dateString;
}

//------------------------------------------------------------
//   Indexing
//------------------------------------------------------------	

support.processIndexing = function(ItemsArray) {	
	var alphabet = "abcdefghijklmnopqrstuvwxyz";
	var currentLetter = 0;
	var indexLetter = [];
	var indexPosition = [];
	
	//Push non alphabetical chars onto index array
	var checkForNonLetter = ItemsArray[0].SortName.charAt(0).toLowerCase();	
	if (checkForNonLetter != 'a') {
		indexPosition.push(0);
		indexLetter.push('#');
	}
	
	for (var index = 0; index < ItemsArray.length; index++) {	
		var letter = ItemsArray[index].SortName.charAt(0).toLowerCase();	
		if (letter == alphabet.charAt(currentLetter-1)) {
			//If item is second or subsequent item with the same letter do nothing
		} else {
			//If Next Letter
			if (letter == alphabet.charAt(currentLetter)) {
				indexPosition.push(index);
				indexLetter.push(alphabet.charAt(currentLetter));
				currentLetter++;
			//Need to check as items may skip a letter (Bones , Downton Abbey) Above code would stick on C	
			} else {
				for (var alpha = currentLetter + 1; alpha < 26; alpha++) {										
					if (letter == alphabet.charAt(alpha)) {
						indexPosition.push(index);
						indexLetter.push(alphabet.charAt(alpha));
						currentLetter= currentLetter + ((alpha - currentLetter)+1);
						break;
					}	
				}
			}	
		}		
	}
	var returnArrays = [indexLetter, indexPosition];
	return  returnArrays;	
}

//------------------------------------------------------------
//    Display (Selected & Displayed Update) Functionss
//------------------------------------------------------------	

support.updateSelectedNEW = function(Array,selectedItemID,startPos,endPos,strIfSelected,strIfNot,DivIdPrepend) {
	for (var index = startPos; index < endPos; index++){		
		if (index == selectedItemID) {			
			document.getElementById(DivIdPrepend + Array[index].Id).className = strIfSelected;		
			document.getElementById(DivIdPrepend + Array[index].Id).style.zIndex = 5;		//Needed to ensure selected stays on top in Series view
		} else {	
			document.getElementById(DivIdPrepend + Array[index].Id).className = strIfNot;	
			document.getElementById(DivIdPrepend + Array[index].Id).style.zIndex = 2;		//Needed to ensure selected stays on top in Series view
		}			
    }
};


//Called when moving from item to banner or the like
support.updateSelectedItem = function(Array,selectedItemID,strIfSelected,strIfNot,DivIdPrepend,action) {
	if (action == "REMOVE") {
		document.getElementById(DivIdPrepend + Array[selectedItemID].Id).className = strIfNot;		
	} 
	if (action == "ADD") {
		document.getElementById(DivIdPrepend + Array[selectedItemID].Id).className = strIfSelected;		
	}
}

support.updateSelectedMenuItems = function(menuLength,selectedItemID,strIfSelected,strIfNot,DivIdPrepend) {
	for (var index = 0; index < menuLength; index++) {	
		if (selectedItemID == index) {
			if (document.getElementById(DivIdPrepend+index).tagName.toLowerCase() == "svg") {
				document.getElementById(DivIdPrepend+index).className.baseVal = strIfSelected;
			} else {
				document.getElementById(DivIdPrepend+index).className = strIfSelected;
			}
		} else {
			if (document.getElementById(DivIdPrepend+index).tagName.toLowerCase() == "svg") {
				document.getElementById(DivIdPrepend+index).className.baseVal = strIfNot;
			} else {
				document.getElementById(DivIdPrepend+index).className = strIfNot;
			}
		}		
	}
}

support.updateSelectedBannerItems = function(menu,selectedItemID,currentView) {
	if (selectedItemID == -1) {
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath highlightHamburger"; //bannerHamburgerPath highlightHamburger
	} else {
		document.getElementById("bannerHamburgerPath").className.baseVal = "bannerHamburgerPath";
	}
	
	if (menu != null) {
		for (var index = 0; index < menu.length; index++) {
			if (index == selectedItemID) {
				if (index != menu.length-1) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlightText";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem highlightText";
				}		
			} else {
				if (index != menu.length-1) {
					if ((currentView == true) || (menu[index] == currentView)) {
						document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
					} else {
						document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
					}	
				} else {
					if ((currentView == true) || (menu[index] == currentView)) {
						document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
					} else {
						document.getElementById("bannerItem"+index).className = "bannerItem";
					}	
				}
			}
		}		
	}
}

support.updateCounter = function(selectedItemID, totalItems) {
	if (totalItems > 0) {
		document.getElementById("Counter").innerHTML = (selectedItemID + 1) + "/" + totalItems;
	} else {
		document.getElementById("Counter").innerHTML = "";	
	}	
}

support.updateDisplayedItems = function(Items,selectedItemID,startPos,endPos,DivIdUpdate,DivIdPrepend,isResume,Genre,showBackdrop,showEpisodeImage) {
	var htmlToAdd = "";	
	for (var index = startPos; index < endPos; index++) {
		if (isResume == true) {
			progress = Math.round(Items[index].UserData.PlayedPercentage);
			//Calculate Width of Progress Bar
			if (Items[index].Type == "Episode") {
				var title = this.getNameFormat(Items[index].SeriesName, Items[index].ParentIndexNumber, Items[index].Name, Items[index].IndexNumber);
				var imgsrc = "";
				if (Items[index].ParentThumbItemId) {
					imgsrc = server.getImageURL(Items[index].SeriesId,"Thumb");
				} else if (Items[index].ParentBackdropImageTags !== undefined && Items[index].ParentBackdropImageTags.length > 0) {	
					imgsrc = server.getImageURL(Items[index].ParentBackdropItemId,"Backdrop",Items[index].ParentBackdropImageTags.length);
				} else if (Items[index].ImageTags.Primary) {	
					imgsrc = server.getImageURL(Items[index].Id,"Primary");
				} else {
					imgsrc = "images/collection.png";
				}
				//Add watched and favourite overlays.
				htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:url(" +imgsrc+ ");background-size:contain'><div class=displayedItem-ProgressBar></div><div class=displayedItem-ProgressBarCurrent style='width:"+progress+"%;'></div>";
				if (Items[index].UserData.Played) {
					htmlToAdd += "<div class='displayedItem-NumberOverlay highlightBackground'>&#10003</div>";	
				}
				if (Items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=displayedItem-FavouriteOverlay></div>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainer>" + title +"</div></div>";
	
			} else {
				var title = Items[index].Name;
				if (Items[index].ImageTags.Thumb) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb");
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-ProgressBar></div><div class=displayedItem-ProgressBarCurrent style='width:"+progress+"%;'></div>";	
				} else if (Items[index].BackdropImageTags.length > 0) {	
					var imgsrc = server.getImageURL(Items[index].Id,"Backdrop".Items[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-ProgressBar></div><div class=displayedItem-ProgressBarCurrent style='width:"+progress+"%;'></div>";	
				} else if (Items[index].ImageTags.Primary) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Primary");
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-ProgressBar></div><div class=displayedItem-ProgressBarCurrent style='width:"+progress+"%;'></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(images/collection.png)><div class=displayedItem-ProgressBar></div><div class=displayedItem-ProgressBarCurrent style='width:"+progress+"%;'></div>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainer>" + title +"</div></div>";
			}			
		} else {
			//----------------------------------------------------------------------------------------------
			if (Items[index].Type == "Series" || Items[index].Type == "Movie" || Items[index].Type == "BoxSet" || Items[index].Type == "ChannelVideoItem" || Items[index].Type == "Trailer") {
				var title = Items[index].Name;
				if (showBackdrop == true) {
					if (Items[index].ImageTags.Thumb) {		
						var imgsrc = server.getImageURL(Items[index].Id,"Thumb");
						htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:url(" +imgsrc+ ")'>";
					} else if (Items[index].BackdropImageTags.length > 0) {
						var imgsrc = server.getImageURL(Items[index].Id,"Backdrop",Items[index].BackdropImageTags.length);
						htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:url(" +imgsrc+ ")'>";
					} else if (Items[index].ImageTags.Primary) {		
						var imgsrc = server.getImageURL(Items[index].Id,"Primary");
						htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:url(" +imgsrc+ ")'>";
					} else {
						htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:rgba(0,0,0,0.5)'>";				
					}
				} else {
					if (Items[index].ImageTags.Primary) {
						var imgsrc = (filesystem.getUserProperty("LargerView") == true) ? server.getImageURL(Items[index].Id,"Primary",main.seriesPosterLargeWidth,main.seriesPosterLargeHeight) : server.getImageURL(Items[index].Id,"Primary",main.seriesPosterWidth,main.seriesPosterHeight); 
						htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:url(" +imgsrc+ ")'>";
					} else {
						htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:rgba(0,0,0,0.5)'>";				
					}
				}
				//Add watched and favourite overlays.
				if (Items[index].UserData.Played) {
					htmlToAdd += "<div class='displayedItem-NumberOverlay highlightBackground'>&#10003</div>";	
				} else if (Items[index].UserData.UnplayedItemCount > 0){
					htmlToAdd += "<div class='displayedItem-NumberOverlay highlightBackground'>"+Items[index].UserData.UnplayedItemCount+"</div>";
				}
				if (Items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=displayedItem-FavouriteOverlay></div>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainerSeries>"+ title + "</div></div>";
				
			//----------------------------------------------------------------------------------------------	
			} else if (Items[index].Type == "Season") {
				var title = Items[index].Name;
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",main.seriesPosterLargeWidth,main.seriesPosterLargeHeight);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-image:url(" +imgsrc+ ")'>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-color:rgba(0,0,0,0.5)'>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainerSeries>"+ title + "</div></div>";
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "Episode") {			
				if (showEpisodeImage) {
					var title = Items[index].IndexNumber + ". " + Items[index].Name;				
					var imageData = "";	
					if (Items[index].ImageTags.Primary) {	
						var imgsrc = server.getImageURL(Items[index].Id,"Primary");	
						imageData = "'background-image:url(" +imgsrc+ ")'";
					} else {
						imageData = "background-color:rgba(0,0,0,0.5)";
					}
				} else {

					var title = this.getNameFormat(Items[index].SeriesName, Items[index].ParentIndexNumber, Items[index].Name, Items[index].IndexNumber);				
					var imageData = "";	
					if (Items[index].ParentThumbItemId) {	
						var imgsrc = server.getImageURL(Items[index].SeriesId,"Thumb");
						imageData = "'background-image:url(" +imgsrc+ ")'";
					} else if (Items[index].ParentBackdropImageTags !== undefined && Items[index].ParentBackdropImageTags.length > 0) {	
						var imgsrc = server.getImageURL(Items[index].ParentBackdropItemId,"Backdrop",Items[index].ParentBackdropImageTags.length);
						imageData = "'background-image:url(" +imgsrc+ ")'";
					} else 	if (Items[index].ImageTags.Primary) {	
						var imgsrc = server.getImageURL(Items[index].Id,"Primary");	
						imageData = "'background-image:url(" +imgsrc+ ")'";
					} else {
						imageData = "background-color:rgba(0,0,0,0.5)";
					}
				}
				
				htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style="+imageData+">";
				//Add overlays.
				if (Items[index].UserData.Played) {
					htmlToAdd += "<div class='displayedItem-NumberOverlay highlightBackground'>&#10003</div>";	
				}
				if (Items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=displayedItem-FavouriteOverlay></div>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainer>"+ title + "</div></div>";				
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "Actor" || Items[index].Type == "GuestStar") {
				var title = Items[index].Name;
				if (Items[index].PrimaryImageTag) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",main.seriesPosterLargeWidth,main.seriesPosterLargeHeight);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainer>"+ title + "</div></div>";		
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "Genre") {	
				var itemCount = 0;
				var title = Items[index].Name;
				switch (Genre) {
				case "Movie":
					itemCount = Items[index].MovieCount;
					break;
				case "Series":
					itemCount = Items[index].SeriesCount;
					break;
				default:
					break;
				}
				if (Items[index].ImageTags.Primary) {
					var imgsrc = (filesystem.getUserProperty("LargerView") == true) ? server.getImageURL(Items[index].Id,"Primary",main.seriesPosterLargeWidth,main.seriesPosterLargeHeight) : server.getImageURL(Items[index].Id,"Primary",main.seriesPosterWidth,main.seriesPosterHeight); 
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class='displayedItem-NumberOverlay highlightBackground'>"+itemCount+"</div>";	
					
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class='displayedItem-NumberOverlay highlightBackground'>"+itemCount+"</div>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainer>" + title +"</div></div>";
			//----------------------------------------------------------------------------------------------
				/*
				 * 
				 * The Below Code is currently not implemented, nor has been checked SWH 29/08/2019 
				 * 
				 *
			} else if (Items[index].Type == "TvChannel") {
				var title = Items[index].Name;		
				
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",224,224,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-position:center;background-color:rgba(63,81,181,0.8);background-image:url(images/Live-TV-108x98.png)')><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
				//----------------------------------------------------------------------------------------------	
			} else if (Items[index].Type == "Recording") {
				var title = Items[index].Name + "<br>" + support.AirDate(Items[index].StartDate,"Recording");		
				
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style='background-position:center;background-color:rgba(63,81,181,0.8);background-image:url(images/Live-TV-108x98.png)')><div class=displayedItem-TitleContainer>"+ title + "</div>";
				}
				//Add watched and favourite overlays.
				if (Items[index].UserData.Played) {
					htmlToAdd += "<div class='displayedItem-NumberOverlay highlightBackground'>&#10003</div>";	
				} else if (Items[index].UserData.UnplayedItemCount > 0){
					htmlToAdd += "<div class='displayedItem-NumberOverlay highlightBackground'>"+Items[index].UserData.UnplayedItemCount+"</div>";
				}
				if (Items[index].UserData.IsFavorite) {
					htmlToAdd += "<div class=displayedItem-FavouriteOverlay></div>";
				}
				htmlToAdd += "</div>";
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "Channel") {
				var title = Items[index].Name;	 
				if (Items[index].BackdropImageTags.length > 0) {			
					var imgsrc = server.getBackgroundImageURL(Items[index].Id,"Backdrop",0,false,0,Items[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				}
				else if (Items[index].ImageTags.Thumb) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
				else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "ChannelFolderItem") {
				var title = Items[index].Name;		
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);background-image:url(images/EmptyFolder-122x98.png)><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "ChannelVideoItem") {
				var title = Items[index].Name;		
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "Playlist" || Items[index].Type == "CollectionFolder" ) {
				var title = Items[index].Name;	
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else if (Items[index].ImageTags.Thumb) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else if (Items[index].BackdropImageTags.length > 0) {			
					var imgsrc = server.getBackgroundImageURL(Items[index].Id,"Backdrop",0,false,0,Items[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (Items[index].Type == "Photo") {
				var title = Items[index].Name;		
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer></div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (Items[index].Type == "Folder") {
				var title = Items[index].Name;
				if (Items[index].ImageTags.Thumb) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				} else if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);background-image:url(images/EmptyFolder-122x98.png)><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			}  else if (Items[index].Type == "PhotoAlbum") {
				var title = Items[index].Name;		
				if (Items[index].ImageTags.Thumb) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				} else if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}
			//----------------------------------------------------------------------------------------------
			} else if (Items[index].Type == "Video") {
				var title = Items[index].Name;	
				if (Items[index].ImageTags.Primary) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Primary",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else if (Items[index].ImageTags.Thumb) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb",0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				} else if (Items[index].BackdropImageTags.length > 0) {			
					var imgsrc = server.getBackgroundImageURL(Items[index].Id,"Backdrop",0,false,0,Items[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=displayedItem-TitleContainer>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=displayedItem-TitleContainer>"+ title + "</div></div>";
				}			
			//----------------------------------------------------------------------------------------------
			*/
			}  else {
				logger.log("Unhandled Item type: "+Items[index].Type)
				var title = Items[index].Name;		
				if (Items[index].ImageTags.Thumb) {		
					var imgsrc = server.getImageURL(Items[index].Id,"Thumb");
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")>";
				} else if (Items[index].BackdropImageTags.length > 0) {			
					var imgsrc = server.getImageURL(Items[index].Id,"Backdrop",Items[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-image:url(" +imgsrc+ ")>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Items[index].Id + " style=background-color:rgba(0,0,0,0.5);>";
				}
				htmlToAdd += "<div class=displayedItem-TitleContainer>" + title +"</div></div>";
			}	 	
		}
    }
	document.getElementById(DivIdUpdate).innerHTML = htmlToAdd;
}

//------------------------------------------------------------
//   Process Selected Item
//------------------------------------------------------------	

support.processSelectedItem = function(page,SelectedItem,startParams,selectedItemID,topLeftItem,isTop,genreType,isLatest) {	
	if (page == "guiHomeTwoItems") {
		pagehistory.updateURLHistory(page,null,null,selectedItemID,topLeftItem,isTop);
	} else {
		if (startParams == null) {
			pagehistory.updateURLHistory(page,null,null,selectedItemID,topLeftItem,null);
		} else {
			startParams[0] = (startParams[0] === undefined) ? null : startParams[0];
			startParams[1] = (startParams[1] === undefined) ? null : startParams[1];
			pagehistory.updateURLHistory(page,startParams[0],startParams[1],selectedItemID,topLeftItem,null);
		}	
	}
	if (SelectedItem.CollectionType != null) {
		/*
		 * 
		 * Collections not implemented SWH 20/08/2019
		 * 
		 * 
		logger.log("CollectionType: "+SelectedItem.CollectionType);
		switch (SelectedItem.CollectionType) {
		case "boxsets":	
			//URL Below IS TEMPORARY TO GRAB SERIES OR FILMS ONLY - IN FUTURE SHOULD DISPLAY ALL
			var url = server.getChildItemsURL(SelectedItem.Id,"&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			guiSeries.start("All Collections",url,0,0);
			break;
		case "tvshows" :	
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			guiSeries.start("All TV",url,0,0);
			break;
		case "movies" :
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			guiSeries.start("All Movies",url,0,0);
			break;	
		case "music" :
			if (main.isMusicEnabled()) {			
				var url = server.getChildItemsURL(SelectedItem.Id,"&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=ParentId,SortName&CollapseBoxSetItems=false");
				guiSeries.start("Album Music",url,0,0);
			} else {
				pagehistory.removeLatestURL();
			}
			break;
		case "photos" :
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName");
			GuiPage_Photos.start(SelectedItem.Name,url,0,0);
			break;
		case "playlists":
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&fields=SortName");
			guiOneItem.start(SelectedItem.Name,url,0,0);
			break;	
		default:
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName");
			if (page == "guiPhotos"){
				guiPhotos.start(SelectedItem.Name,url,0,0);
			} else {
				guiOneItem.start(SelectedItem.Name,url,0,0);
			}
			break;
		}
		*/
	} else {
		switch (SelectedItem.Type) {
		case "ManualCollectionsFolder":
		case "BoxSet":
			var url = server.getChildItemsURL(SelectedItem.Id,"&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			guiSeries.start("All Collections",url,0,0);
			break;
		case "Series":
			//Is Latest Items Screen - If so skip to Episode view of latest episodes
			if (isLatest) {
				var url = server.getCustomURL("/Users/" + server.getUserID() + "/Items/Latest?format=json&Limit="+SelectedItem.ChildCount+"&ParentId="+SelectedItem.Id+"&isPlayed=false&IsFolder=false&GroupItems=false&fields=SortName,Overview,Genres,RunTimeTicks");
				guiTVEpisodes.start("New TV",url,0,0);
			} else {
				var url = server.getItemInfoURL(SelectedItem.Id,null);
				guiTVShow.start(url,0,0);
			}
			break;	
		case "Season":
			var url = server.getItemInfoURL(SelectedItem.Id,null);
			guiTVEpisodes.start(SelectedItem.Name,url,0,0);
			break;
		case "Movie":
			var url = server.getItemInfoURL(SelectedItem.Id,null);
			guiItemDetails.start(url,0,0);
			break;	
		case "Episode":
			var url = server.getItemInfoURL(SelectedItem.Id,null);
			guiTVEpisode.start(url,0,0);
			break;
		case "Genre":
			var url = server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes="+genreType+"&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,RunTimeTicks&Genres=" + SelectedItem.Name);
			var name = (genreType == "Series") ? "Genre TV" : "Genre Movies";
			guiSeries.start(name, url,0,0);		
			break;
		/*	
		case "MusicArtist":	
			var artist = SelectedItem.Name.replace(/ /g, '+');	 
			artist = artist.replace(/&/g, '%26');	
			var url = server.getItemTypeURL("&SortBy=Album%2CSortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false&Artists=" + artist);
			GuiPage_Music.start(SelectedItem.Name,url,SelectedItem.Type);
			break;	
		case "MusicAlbum":	
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false");
			GuiPage_Music.start(SelectedItem.Name,url,SelectedItem.Type);
			break;	
		case "Folder":
		case "PhotoAlbum":
		case "CollectionFolder":	
			var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&fields=PrimaryImageAspectRatio,SortName,ParentId");
			if (page == "guiPhotos"){
				guiPhotos.start(SelectedItem.Name,url,0,0);
			} else {
				guiOneItem.start(SelectedItem.Name,url,0,0);
			}
			break;
		case "Channel":
			var url = server.getCustomURL("/Channels/"+SelectedItem.Id+"/Items?userId="+server.getUserID()+"&fields=SortName&format=json");	
			guiOneItem.start(SelectedItem.Name,url,0,0);
			break;
		case "ChannelFolderItem":
			var url = server.getCustomURL("/Channels/"+SelectedItem.ChannelId+"/Items?userId="+server.getUserID()+"&folderId="+SelectedItem.Id+"&fields=SortName&format=json");	
			guiOneItem.start(SelectedItem.Name,url,0,0);
			break;	
		case "TvChannel":
			this.playSelectedItem("GuiDisplay_Series",ItemData,startParams,selectedItem,topLeftItem,null);
			break;		
		case "Playlist":
			var url = server.getCustomURL("/Playlists/"+SelectedItem.Id+"/Items?userId="+server.getUserID()+"&fields=SortName&SortBy=SortName&SortOrder=Ascending&format=json");	
			GuiPage_Playlist.start(SelectedItem.Name,url,SelectedItem.MediaType,SelectedItem.Id);
			break;
			*/		
		default:
			/*
			switch (SelectedItem.MediaType) {
			case "Photo":
				GuiImagePlayer.start(ItemData,selectedItem);
				break;	
			case "Video":	
				var url = server.getItemInfoURL(SelectedItem.Id,null);
				guiItemDetails.start(SelectedItem.Name,url,0);
				break;
			case "Audio":
				pagehistory.removeLatestURL(); //Music player loads within the previous page - thus remove!
				var url = server.getItemInfoURL(SelectedItem.Id,null);
				GuiMusicPlayer.start("Song",url,page,false,false,SelectedItem.Id);
				break;
			default:
				pagehistory.removeLatestURL();
				break;
			}
			break;
			*/
			
			//Temporary Code until above is implemented - Do nothing!
			//Should not happen until things like home video, individual music track..  are implemented
			pagehistory.removeLatestURL();
		break;
		}
	}
}

//------------------------------------------------------------
//   Play Selected Item
//------------------------------------------------------------	

support.playSelectedItem = function(page,SelectedItem,startParams,selectedItemID,topLeftItem,isTop,shuffle) {
	shuffle = (shuffle === undefined) ? null : shuffle;
	
	if (startParams == null) {
		pagehistory.updateURLHistory(page,startParams[0],startParams[1],selectedItemID,topLeftItem,null);
	} else {
		startParams[0] = (startParams[0] === undefined) ? null : startParams[0];
		startParams[1] = (startParams[1] === undefined) ? null : startParams[1];
		pagehistory.updateURLHistory(page,startParams[0],startParams[1],selectedItemID,topLeftItem,null);
	}
	
	var url = server.getItemInfoURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual");		
	if (SelectedItem.Type == "Movie" || SelectedItem.Type == "Episode") {
		url = server.getItemInfoURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual");
		player.start("PLAY",url,0,page);
	} else if (SelectedItem.Type == "Series") {
		if (shuffle != null) {
			url= server.getChildItemsURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
		} else {
			url= server.getChildItemsURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=Random&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
		}
		player.start("PlayAll",url,0,page);
	} else if (SelectedItem.Type == "Season") {
		urlToPlay= server.getChildItemsURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
		player.start("PlayAll",urlToPlay,0,page);	
	/*
	 * 
	 * The Below is currently not implemented and will definitely need major alterations! Mose of the below has noe been updated since 2017 SWH 29/08/2019
	 * 
	} else if (SelectedItem.MediaType == "Video" && SelectedItem.Type != "TvChannel" && SelectedItem.Type != "Playlist") {
		if (SelectedItem.LocationType == "Virtual"){
			return;
		}
		pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
		url = server.getItemInfoURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual");
		player.start("PLAY",url,SelectedItem.UserData.PlaybackPositionTicks / 10000,page);	
	} else if (SelectedItem.Type == "Folder") {
		if (page == "GuiPage_Photos") {
			//pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
			//GuiImagePlayer.start(ItemData,selectedItem,true);	
		}
	} else if (SelectedItem.Type == "Playlist") {
		var url = server.getCustomURL("/Playlists/"+SelectedItem.Id+"/Items?userId="+server.getUserID()+"&StartIndex=0&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,MediaSources");
		if (SelectedItem.MediaType == "Video"){
			pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
			player.start("PlayAll",url,0,page);
		} else if (SelectedItem.MediaType == "Audio"){
			//GuiMusicPlayer.start("Album",url,page,false);
		} else {
			return;
		}
	} else if (SelectedItem.MediaType == "ChannelVideoItem") {
		pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
		url = server.getItemInfoURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual");
		player.start("PLAY",url,SelectedItem.UserData.PlaybackPositionTicks / 10000,page);	
	}  else if (SelectedItem.Type == "TvChannel") {
		pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
		url = server.getItemInfoURL(SelectedItem.Id,"&ExcludeLocationTypes=Virtual");
		player.start("PLAY",url,0,page);
	}  else if (SelectedItem.CollectionType == "photos") {
		//pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
		//GuiImagePlayer.start(ItemData,selectedItem,true);	
	} else if (SelectedItem.Type == "PhotoAlbum") {
		//pagehistory.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItemID,topLeftItem,isTop);
		//GuiImagePlayer.start(ItemData,selectedItem,true);	
	} else if (SelectedItem.Type == "MusicAlbum") {
		//pagehistory.updateURLHistory(page,startParams[0],startParams[1],null,null,selectedItemID,topLeftItem,null);
		//var url = server.getChildItemsURL(SelectedItem.Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false&Fields=MediaSources");
		//GuiMusicPlayer.start("Album",url,"GuiDisplay_Series",false);
	} else if (SelectedItem.Type == "Audio") {
		//pagehistory.updateURLHistory(page,startParams[0],startParams[1],null,null,selectedItemID,topLeftItem,null);
		//var url = server.getItemInfoURL(SelectedItem.Id);
		//GuiMusicPlayer.start("Song",url,"GuiDisplay_Series",false);
		*/
	} else {
		//If for some reason I got here - remove page history added at top of this function!
		pagehistory.removeLatestURL
	}
}
