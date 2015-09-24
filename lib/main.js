var request = require('request');
var _ = require('underscore');

var oneNotePagesApiUrl = 'https://www.onenote.com/api/v1.0/pages';


var OneNote = function() {
  //this.accessToken = accessToken;
  this.readPages = function(accessToken, cb) {
    var options = {
      url: 'https://www.onenote.com/api/v1.0/pages?orderby=createdTime&select=id%2Ctitle%2Clinks%2Cself&count=true',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    request.get(options, cb);

    }

    this.readContentByPageId = function(accessToken, pageId, cb) {
      var options = {
        url: 'https://www.onenote.com/api/v1.0/pages/' + pageId + '/content?includeIDs=true',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Accept*': 'text/html'
        }
      };
      request.get(options, cb);

    }

    this.createNewPage = function(accessToken, type, htmlPayload, cb) {
      createPage(accessToken, htmlPayload, false, cb);
    }

    this.createPageWithSimpleText = function(accessToken, callback) {
      var htmlPayload =
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        "    <title>TASK MANAGEMENT</title>" +
        "    <meta name=\"created\" content=\"" + dateTimeNowISO() + "\">" +
        "</head>" +
        "<body>" +
        "    <p>TASK MANAGEMENT <i>formatted</i></p>" +
        "    <b>test task mamangement</b></p>" +
        "</body>" +
        "</html>";

      createPage(accessToken, htmlPayload, false, callback);
    };


    function dateTimeNowISO() {
      return new Date().toISOString();
    }


    /* Pages API request builder & sender */
    function createPage(accessToken, payload, multipart, callback) {
      var options = {
        url: oneNotePagesApiUrl,
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      };
      // Build simple request
      if (!multipart) {
        options.headers['Content-Type'] = 'text/html';
        options.body = payload;
      }
      var r = request.post(options, callback);
      // Build multi-part request
      if (multipart) {
        var CRLF = '\r\n';
        var form = r.form(); // FormData instance
        _.each(payload, function(partData, partId) {
          form.append(partId, partData.body, {
            // Use custom multi-part header
            header: CRLF +
              '--' + form.getBoundary() + CRLF +
              'Content-Disposition: form-data; name=\"' + partId + '\"' + CRLF +
              'Content-Type: ' + partData.contentType + CRLF + CRLF
          });
        });
      }
    }

    module.exports = new OneNote();

    // var accessToken = "******";

    //    var oneNote = new OneNote();


    // var callback = function(error, response, body) {
    //   console.log("....error....",error);
    //   console.log('Status:', response.statusCode);
    //   console.log('Headers:', JSON.stringify(response.headers));
    //   console.log('Response:',body);
    // }

    //oneNote.readContentByPageId(accessToken,pageid,callback);
    //   oneNote.readPages(accessToken,callback);



    //oneNote.createPageWithSimpleText(accessToken, callback)
