var config = require('./config');

var http = require('http');
var qs = require('querystring');
var _ = require('underscore');

var OAuth = require('oauth');
var OAuth2 = OAuth.OAuth2;
 
var oauth2 = new OAuth2(config.clientID, config.clientSecret, config.baseSite, config.authorizePath, config.tokenURL, null);

 
http.createServer(function(req, res) {
  var p = req.url.split('/');

  pLen = p.length;

  /**
   * Authorised url as per OneNote docs:
   * Adding params to authorize url with fields as mentioned in OneNote docs
   * https://msdn.microsoft.com/EN-US/library/office/dn575421.aspx
   */
  var authURL = oauth2.getAuthorizeUrl(
    _.extend({
      redirect_uri: config.redirectUrl
    }, config.authURLParams)
  );

  console.log("..authURL.....", authURL);
  /**
   * Creating an anchor with authURL as href and sending as response
   */
  //console.log("....sdsds..", authURL);
  var body = '<a href="' + authURL + '"> Get Code </a>';
  if (pLen === 2 && p[1] === '') {
    res.writeHead(200, {
      'Content-Length': body.length,
      'Content-Type': 'text/html'
    });
    res.end(body);
  } else if (pLen === 2 && p[1].indexOf('code') > 0) {
    /** Github sends auth code so that access_token can be obtained */
    var qsObj = {};

    /** To obtain and parse code='...' from code?code='...' */
    qsObj = qs.parse(p[1].split('?')[1]);

    var code = qsObj.code.toString();
    var params = {
      'redirect_uri': config.redirectUrl.toString(),
      'grant_type': config.grant_type
    }

    /** Obtaining access_token */
    oauth2.getOAuthAccessToken(
      code, params,
      function(e, access_token, refresh_token, results) {
        if (e) {
          console.log("Error:==>", e);
          res.end(e);
        } else if (results.error) {
          console.log(results);
          res.end(JSON.stringify(results));
        } else {
          console.log('Obtained access_token: ', access_token);
          res.end(access_token)
        }
      });

  } else {
    // Unhandled url
  }

}).listen(3000);

