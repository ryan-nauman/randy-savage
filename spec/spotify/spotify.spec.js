var spotify = require('../../lib/spotify');

describe("Spotify", function() {
  var spotify = require('../../lib/spotify');

  it("should generate link", function() {
    var uri = 'spotify:track:4YPafsGyzXWry3ZWUAhYBn';
    var link = spotify.generateSpotifyLink(uri);
    expect(link).toContain('http');
  });

  it("should return promise", function(done) {
    var uri = 'https://api.spotify.com/v1/tracks/4YPafsGyzXWry3ZWUAhYBn';
    var p = spotify.getMetadata(uri);
    p.then(function(data){
      expect(data.msg).toBeDefined();
      expect(data.card).toBeDefined();
      done();
    });
  });

  it("should return error", function(done) {
    var uri = 'http://httpstat.us/400';
    var p = spotify.getMetadata(uri);
    p.catch(function(err){
      expect(err).toBeDefined();
      done();
    });
  });

});
