var request = require('request-promise');

var Spotify = {

  uri: '',

  generateSpotifyLink: function(cmd) {
    var matched = cmd.match(/(?:(http|https):\/\/(open|play).spotify.com\/(track|album|artist)\/|spotify:(track|album|artist):)\S+/),
        uri = 'https://api.spotify.com/v1/',
        matchForLookup;
    try {
      matchForLookup = matched[0].match(/(track|album|artist)[\/\:](\S+)/);
      switch (matchForLookup[1]) {
        case 'track':
          uri += 'tracks/';
          break;
        case 'album':
          uri += 'albums/';
          break;
        case 'artist':
          uri += 'artists/';
          break;
            }
      uri += matchForLookup[2];
      return uri;
    } catch (e) {
      console.warn(e);
      return null;
    }
  },

  getMetadata: function(uri, appUri) {
    Spotify.uri = appUri;
    var options = {
      uri: uri,
      json: true
    };
    return request(options)
      .then(Spotify.tryGetAlbum)
      .then(Spotify.formatMessage)
      .catch(Spotify.handleError);
  },

  tryGetAlbum: function(data) {
    if (data.type === 'track' && data.album) {
      return request({
        uri: data.album.href,
        json: true
      }).then(function(albumData) {
        return {
          type: 'combined',
          track: data,
          album: albumData
        };
      });
    }
  },

  formatMessage: function(data) {
    var attributes, msg, card,
      iconUrl = "http://icons.iconarchive.com/icons/froyoshark/enkel/512/Spotify-icon.png";
    if (data.type === 'combined') {
      if (data.album.images.length) iconUrl = data.album.images[0].url;
      attributes = [];
      attributes.push({
        "label": "Album",
        "value": {
          "label": data.album.name
        }
      });
      attributes.push({
        "label": "Year",
        "value": {
          "label": data.album.release_date.substr(0,4)
        }
      });
      attributes.push({
        "label": "Lyrics",
        "value": {
          "url": "http://genius.com/search?q=" + data.track.artists[0].name + ' ' + data.track.name,
          "label": "Genius"
        }
      });
      attributes.push({
        "label": "Tracks",
        "value": {
          "label": data.album.tracks.total.toString()
        }
      });
      attributes.push({
        "label": "Popularity",
        "value": {
          "label": data.track.popularity + '/' + data.album.popularity
        }
      });
    }
    switch (data.type) {
      case 'combined':
        if (data.album.images.length) iconUrl = data.album.images[0].url;
        msg = '<a href="'+ data.track.external_urls.spotify +'"><b>' + data.track.name + '</b></a> <i>by</i> <a href="' + data.track.artists[0].external_urls.spotify +'">' + data.track.artists[0].name + '</a>';
        break;
      case 'track':
        if (data.album.images.length) iconUrl = data.album.images[0].url;
        msg = '<a href="'+ data.external_urls.spotify +'">' + data.artists[0].name + ' - ' + data.name + '</a>';
        msg = '<a href="'+ data.external_urls.spotify +'"><b>' + data.name + '</b></a> <i>by</i> <a href="' + data.artists[0].external_urls.spotify +'">' + data.artists[0].name + '</a>';
        break;
      case 'album':
        if (data.images.length) iconUrl = data.images[0].url;
        msg = '<b>Album</b> <a href="'+ data.external_urls.spotify +'">' + data.artists[0].name + ' - ' + data.name + '</a> (' + data.release_date.substr(0, 4) + ')';
        break;
      case 'artist':
        if (data.images.length) iconUrl = data.images[0].url;
        msg = '<b>Artist</b> <a href="'+ data.external_urls.spotify +'">' + data.name + '</a>';
        break;
    }
    card = {
      "style": "application",
      "url": data.type === 'combined' ? data.track.uri : data.uri,
      "format": "compact",
      "id": "db797a68-0aff-4ae8-83fc-2e72dbb1a707",
      "title": "URI",
      "description": {
        "value": "&nbsp;",
        "format": "html"
      },
      "icon": {
        "url": iconUrl
      },
      "attributes": attributes,
      "activity": {
        "html": msg,
        "icon": {
          "url": Spotify.uri + '/img/spotify.png'
        }
      }
    };
    return { msg: msg, card: card };
  },

  handleError: function(err) {
    throw err;
  }

};

module.exports = Spotify;
