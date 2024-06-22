console.log("AeroCorp Eve API Loaded!");

//localhost
var auth = "ZGI4ZTMzOTg5N2JiNDE3Zjk3MWZmMDdlZjYxN2U5Njc6TXNMZWxlZTFMcmo5eG5zYXhHdFozMW5ITHVyRG9VT1J2NjZkeU1hdA==";

// var auth = btoa("db8e339897bb417f971ff07ef617e967:MsLelee1Lrj9xnsaxGtZ31nHLurDoUORv66dyMat");
// console.log(auth);
if(window.location.origin.includes("github.io")) {
    //web site
    // var auth = btoa("5fe7b21736e748c6a78d9e4f98ff536e:5e0tEfn1tNwFPvEz4EEcXcJIpSngdGQBc3cbdOgU");
    // console.log(auth);
    auth = "NWZlN2IyMTczNmU3NDhjNmE3OGQ5ZTRmOThmZjUzNmU6NWUwdEVmbjF0TndGUHZFejRFRWNYY0pJcFNuZ2RHUUJjM2NiZE9nVQ=="
}

var gCharacterCodes = new Array();

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function check_cookie() {
    let character_ids = getCookie("character_ids");
    if (character_ids != "") {
        gCharacterCodes = JSON.parse(character_ids);
    }
}

function parse_my_url() {
    //If we have a new login, there will be a code in the URL.  Store it.

    var url = window.location.href;
    if (url.indexOf('?') >= 0) {
        var params = url.split('?')[1];
        if (url.indexOf('=') >= 0) {
            var code = url.split('=')[1];
            console.log(code);
            var codeExists = false;
            for (i in gCharacterCodes) {
                if (gCharacterCodes[i] == code) {
                    codeExists = true;
                    break;
                }
            }
            if (!codeExists) {
                gCharacterCodes.push(code);
                setCookie("character_ids", JSON.stringify(gCharacterCodes));
            }
        }

    }
}

function sendCommand(commandName, paramString , callback, command_type, headers, body, callback_data) {
    if (command_type == undefined)
        command_type = "GET"
    function reqListener() {
        // console.log(this.responseText);
        try {
            callback(this, callback_data);
        } catch {
            callback(null, callback_data);
        }
    }

    const req = new XMLHttpRequest();
    req.onload = reqListener;
    var url = commandName;
    if (paramString != "") {
        url = url + "?" + paramString;
    }
    req.open(command_type, url);
    if (headers != undefined) {
        for (let header in headers) {
            // console.log(`key: ${header} : value: ${headers[header]}`)
            req.setRequestHeader(String(header),String(headers[header]));
        }
    }
    req.setRequestHeader('Access-Control-Allow-Origin',window.location.origin);

    if (body != undefined && body != null) {
        //Send the proper header information along with the request
        // req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        // console.log(JSON.stringify(body))
        req.send(JSON.stringify(body));
    }else
        req.send();
}

function verification_callback(data, loginCredentials) {
    if(data != undefined) {
        console.log("Requested " + loginCredentials.access_token + " and got " + data.responseText);
        
        // curl -XGET -H 'Authorization: Bearer {access token from the previous step}' https://login.eveonline.com/oauth/verify
        /*
        {"CharacterID":95465499,"CharacterName":"CCP Bartender","ExpiresOn":"2017-07-05T14:34:16.5857101","Scopes":"esi-characters.read_standings.v1","TokenType":"Character","CharacterOwnerHash":"lots_of_letters_and_numbers","IntellectualProperty":"EVE"}

*/
        try {
            var characterInfo = JSON.parse(data.responseText);
            alert("Welcome " + characterInfo.CharacterName + " ID: " + characterInfo.CharacterID)
        } catch(e){

        }

    }
}

function authorization_callback(data, callback_data) {
    if(data != undefined) {
        console.log("Requested " + callback_data.code + " and got " + data.responseText);
        
        // curl -XGET -H 'Authorization: Bearer {access token from the previous step}' https://login.eveonline.com/oauth/verify
        try { 
            var loginCredentials = JSON.parse(data.responseText);
            var base = "https://esi.evetech.net/verify/";
            var paramString = "";
            var command_type = "GET";
            var headers = {};
            headers["Content-Type"] = "application/json";
            headers["Authorization"] = "Bearer " + loginCredentials.access_token;
            loginCredentials.code = callback_data;
            sendCommand(base, paramString,verification_callback, command_type, headers, null, loginCredentials);
        } catch(e){

        }

    }
}
function authorize_character_code(code) {
    //See: https://developers.eveonline.com/blog/article/sso-to-authenticated-calls
    //And: https://developers.eveonline.com/applications/details/84209#app-section-details
    // console.log("Requesting character data for: " + code)
    // curl -XPOST -H "Content-Type:application/json" -H "Authorization:Basic Y2xpZW50X2lkOmNsaWVudHNlY3JldDE=" -d '{"grant_type":"authorization_code", "code":"ckEZIa6JUOdoN6ijmqBI...qgpU-SmPsZ0"}' https://login.eveonline.com/oauth/token

    var base = "https://instacardapp.com/AROCP/public/php/api.php";////https://login.eveonline.com/oauth/token";
    var paramString = "code=" + code;
    var command_type = "GET";
    var headers = {};
    headers["Content-Type"] = "application/json";

    // headers["Content-Length"] = "Basic " + auth;

    
    // var bodyObject = {};
    // bodyObject["grant_type"] = "authorization_code";
    // bodyObject["code"] = code;
    var callback_data = code;
/*
TODO:
Note that access tokens are only valid for 20 minutes, after which you can re-run this step with the same headers and the following body to use the refresh token to get another access token at any time:

    {
      "grant_type":"refresh_token",
      "refresh_token":"{the refresh token}"
    }
    */
    sendCommand(base, paramString,authorization_callback, command_type, headers, null, callback_data);
    
}
function download_character_info() {
    for (i in gCharacterCodes) {
        authorize_character_code(gCharacterCodes[i]);
    }
}

function main() {
    //Make sure the Character ID list is up to date
    // check_cookie();
    parse_my_url();
    download_character_info();
}

main();