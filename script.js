var cache;
var lastfm;
var detail = false;

gatherArtists = function(artist) {
	$('#artists').fadeOut();
	loadingOn();
	$('#artists').children().remove();

	lastfm.artist.getSimilar({
		artist: artist
	},
	{
		success: function(data) {
			var artists = data.similarartists.artist;
			for (var i = 1; i < artists.length; i++) {
				if (artists[i].image[1]['#text'] != "") setupImage(artists[i]);
			}
			$('#artists').fadeIn();
			loadingOff();
		},
		error: function(code, message) {
			alert('Unable to retrieve data from last.fm');
		}
	});
};

setupImage = function(artist) {
	var imageurl = artist.image[1]['#text'];
	imageurl = imageurl.replace('\/64\/', '\/126s\/');
	var name = $('<span/>').addClass('name').text(artist.name).hide();
	var image = $('<li/>').css('background', 'url(' + imageurl + ')').append(name);

	var bio;

	image.mouseover(function() {
		if (!detail) {
			image.animate({
				opacity: 1
			});
			name.slideDown();
		}
	});

	image.mouseout(function() {
		image.animate({
			opacity: 0.3
		});
		name.slideUp();
	});

	image.click(function() {
		if (!detail) {
			loadDetail(artist);
		} else {
			closeDetail();
		}
	});

	$('#artists').append(image);
};

loadDetail = function(artist) {
	loadDetailInfo(artist);

	$('#detail-nav-info').click(function() {
		loadDetailInfo(artist);
	});
	$('#detail-nav-videos').click(function() {
		loadDetailVideos(artist);
	});
};

loadDetailInfo = function(artist) {
	loadingOn();
	lastfm.artist.getInfo({
		artist: artist.name
	},
	{
		success: function(data) {
			bio = data.artist.bio.summary;

			detail = true;
			$('#detail-photo').attr('src', artist.image[3]['#text']);
			$('#detail-name').text(artist.name);
			$('#detail-descrip').html(bio);
			$('#detail-links-lastfm').attr('href', 'http://' + artist.url);
			$('#detail-links-wikipedia').attr('href', 'http://en.wikipedia.org/w/index.php?title=Special:Search&search=' + artist.name);
			$('#detail-links-flickr').attr('href', 'http://www.flickr.com/search/?q=' + artist.name + ' concert&w=all');
			$('#detail-links-youtube').attr('href', 'http://www.youtube.com/results?search_query=' + artist.name + '&aq=f');
			$('#artists').animate({
				opacity: 0.5
			});
			$('#detail').fadeIn();
			loadingOff();
		},
		error: function(code, message) {
			alert('Unable to retrieve data from last.fm');
		}
	});
};

loadDetailVideos = function(artist) {
	loadingOn();
	$('#detail-main').hide();
	$.getJSON('http://gdata.youtube.com/feeds/api/videos?q=' + artist.name + '&max-results=8&v=2&alt=json', function(response) {
		$.each(response.feed.entry, function(i, video) {
			$('<li/>').append($('<img/>').attr('src', video.media$group.media$thumbnail[0].url)).append($('<a/>').attr('href', video.link[0].href).text(video.title.$t)).appendTo($('#detail-videos'));
		});
	});
	$('#detail-videos').show();
	loadingOff();
};

closeDetail = function() {
	detail = false;
	$('#artists').animate({
		opacity: 1
	});
	$('#detail').fadeOut();
};

getVideos = function() {
	ytvb.appendScriptTag = function(scriptSrc, scriptId, scriptCallback) {
		// Remove any old existance of a script tag by the same name
		var oldScriptTag = document.getElementById(scriptId);
		if (oldScriptTag) {
			oldScriptTag.parentNode.removeChild(oldScriptTag);
		}
		// Create new script tag
		var script = document.createElement('script');
		script.setAttribute('src', scriptSrc + '&alt=json-in-script&callback=' + scriptCallback);
		script.setAttribute('id', scriptId);
		script.setAttribute('type', 'text/javascript');
		// Append the script tag to the head to retrieve a JSON feed of videos
		// NOTE: This requires that a head tag already exists in the DOM at the
		// time this function is executed.
		document.getElementsByTagName('head')[0].appendChild(script);
	};
};

loadingOn = function() {
	$('#loading').fadeIn();
};

loadingOff = function() {
	$('#loading').fadeOut();
};

$(function() {
	cache = new LastFMCache();
	lastfm = new LastFM({
		apiKey: '80a188b0bc2bbad47509ece49e5504c5',
		apiSecret: 'df1faefee53e9ae601255b0220bd5113',
		cache: cache
	});

	gatherArtists('The Beatles');
	$('#input-form').submit(function() {
		closeDetail();
		gatherArtists($('#input-text').val());
		return false;
	});

	$('#artists').fadeIn();
});
