console.log("AeroCorp Eve API Loaded!");

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

function sendCommand(commandName, paramString, callback, command_type, headers, body, callback_data) {
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
            req.setRequestHeader(String(header), String(headers[header]));
        }
    }
    req.setRequestHeader('Access-Control-Allow-Origin', window.location.origin);

    if (body != undefined && body != null) {
        //Send the proper header information along with the request
        // req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        // console.log(JSON.stringify(body))
        req.send(JSON.stringify(body));
    } else
        req.send();
}
var gCharacterInfo = new Array();
var loginCredentials = new Object();

function ValidateCorp(data) {
    if (data != undefined) {
        console.log("Requested Character Info and got " + data.responseText);

        try {
            var characterInfo = JSON.parse(data.responseText);
            var character = gCharacterInfo[0];
            character.characterInfo = characterInfo;
            // alert(character.characterInfo.cororation_id)
            if (characterInfo.corporation_id == 98770774) {
                document.getElementById("logo").style.width = '0';
            }
        } catch (e) {

        }

    }
}

function ProcessCharacterRoute(data) {
    if (data != undefined) {
        console.log("Requested Character Route and got " + data.responseText);

        try {
            var character = gCharacterInfo[0];
            var characterRouteInfo = JSON.parse(data.responseText);
            var system = gSystemsList[characterRouteInfo[characterRouteInfo.length - 1]];

            var scoutData = theraConnectedSystems[characterRouteInfo[characterRouteInfo.length - 1]];

            var wormholeSig = "( " + system.security_status.toFixed(1) + " " + (scoutData.out_signature)
                + " - " + (scoutData.in_signature)
                + ")";

            // console.log(characterRouteInfo);
            var destString = system.name + " " + wormholeSig + " Jumps: " + characterRouteInfo.length;

            AddMenuItem("Characters", destString);



        } catch (e) {

        }
    }
}
function ProcessCharacterLocation(data) {
    if (data != undefined) {
        console.log("Requested Character Location and got " + data.responseText);

        try {
            var characterLocationInfo = JSON.parse(data.responseText);
            var character = gCharacterInfo[0];
            character.location = characterLocationInfo;
            var system = gSystemsList[characterLocationInfo.solar_system_id];
            character.system = system;
            var itemText = system.name
                + " (" + character.CharacterName + ": " + (system.position.x).toFixed(2)
                + "," + (system.position.y).toFixed(2)
                + "," + (system.position.z).toFixed(2)
                + ")";

            AddMenuItem("Characters", itemText);

            create_character_sphere(character);


            for (const system_id in theraConnectedSystems) {
                var destSystem = gSystemsList[system_id];
                if (destSystem.systemType == "NewEden") {
                    var base = "https://esi.evetech.net/latest/route/" + system.system_id + "/" + destSystem.system_id + "/";
                    var paramString = "datasource=tranquility";
                    var command_type = "GET";
                    var headers = {};
                    headers["Content-Type"] = "application/json";
                    headers["Authorization"] = "Bearer " + loginCredentials.access_token;

                    sendCommand(base, paramString, ProcessCharacterRoute, command_type, headers, null, loginCredentials);

                }

            }
            // var base = "https://esi.evetech.net/latest/characters/" + character.CharacterID + "/";
            // var base = "https://esi.evetech.net/latest/characters/" + character.CharacterID + "/";
            // var paramString = "datasource=tranquility";
            // var command_type = "GET";
            // var headers = {};
            // headers["Content-Type"] = "application/json";
            // headers["Authorization"] = "Bearer " + loginCredentials.access_token;
            // sendCommand(base, paramString, ValidateCorp, command_type, headers, null, loginCredentials);



        } catch (e) {

        }

    }
}
function verification_callback(data, code) {
    if (data != undefined) {

        // curl -XGET -H 'Authorization: Bearer {access token from the previous step}' https://login.eveonline.com/oauth/verify
        /*
        {
            "CharacterID": 2122278309,
            "CharacterName": "AeroPete",
            "ExpiresOn": "2024-06-24T16:35:16",
            "Scopes": "publicData esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1 esi-universe.read_structures.v1 esi-ui.write_waypoint.v1 esi-fittings.read_fittings.v1 esi-fittings.write_fittings.v1 esi-location.read_online.v1 esi-clones.read_implants.v1 esi-characters.read_fatigue.v1",
            "TokenType": "Character",
            "CharacterOwnerHash": "CA2DmP2Dx3e72JLAV9pf+tGU4qU=",
            "IntellectualProperty": "EVE"
        }
        */
        try {
            var characterInfo = JSON.parse(data.responseText);
            if (characterInfo != undefined && characterInfo.CharacterName != undefined) {
                // loginCredentials.code = characterInfo.code;

                // characterInfo.refresh_token = loginCredentials.refresh_token;
                // alert("Welcome " + characterInfo.CharacterName + " ID: " + characterInfo.CharacterID);
                console.log(JSON.stringify(characterInfo));
                // AddVerifiedCharacter(characterInfo);

                // https://esi.evetech.net/latest/characters/2122278309/location/?datasource=tranquility
                // https://esi.evetech.net/latest/characters/$character/location/?datasource=tranquility"

                gCharacterInfo.push(characterInfo)

                if (window.location.href.includes("localhost")) {
                    var base = "https://esi.evetech.net/latest/characters/" + characterInfo.CharacterID + "/location/";
                    var paramString = "datasource=tranquility";
                    var command_type = "GET";
                    var headers = {};
                    headers["Content-Type"] = "application/json";
                    headers["Authorization"] = "Bearer " + loginCredentials.access_token;

                    sendCommand(base, paramString, ProcessCharacterLocation, command_type, headers, null, loginCredentials);
                } else {
                    var base = "https://instacardapp.com/AROCP/public/php/location.php";
                    var paramString = "code=" +  characterInfo.access_token + "&character=" + characterInfo.CharacterID;
                    var command_type = "GET";
                    var headers = {};
                    headers["Content-Type"] = "application/json";
                    headers["Authorization"] = "Bearer " + characterInfo.access_token;

                    sendCommand(base, paramString, ProcessCharacterLocation, command_type, headers, null,  characterInfo);

                }

                var base = "https://instacardapp.com/AROCP/public/php/character.php";
                // var base = "https://esi.evetech.net/latest/characters/2122278309/?datasource=tranquility";
                var paramString = "code=" + code + "&character=" + characterInfo.CharacterID;
                var command_type = "GET";
                var headers = {};
                headers["Content-Type"] = "application/json";
                headers["Authorization"] = "Bearer " + code;
                sendCommand(base, paramString, ValidateCorp, command_type, headers, null, code);


            }
        } catch (e) {

        }

    }
}
function authorization_callback(data, callback_data) {
    if (data != undefined) {
        console.log("Requested " + callback_data.code + " and got " + data.responseText);

        // curl -XGET -H 'Authorization: Bearer {access token from the previous step}' https://login.eveonline.com/oauth/verify
        try {
            loginCredentials = JSON.parse(data.responseText);
            var base = "https://esi.evetech.net/verify/";
            var paramString = "";
            var command_type = "GET";
            var headers = {};
            headers["Content-Type"] = "application/json";
            headers["Authorization"] = "Bearer " + loginCredentials.access_token;
            // loginCredentials.code = callback_data;
            sendCommand(base, paramString, verification_callback, command_type, headers, null, callback_data);
        } catch (e) {

        }

    }
}

function authorize_character_code_local(code) {
    //See: https://developers.eveonline.com/blog/article/sso-to-authenticated-calls
    //And: https://developers.eveonline.com/applications/details/84209#app-section-details
    var auth = "ZGI4ZTMzOTg5N2JiNDE3Zjk3MWZmMDdlZjYxN2U5Njc6TXNMZWxlZTFMcmo5eG5zYXhHdFozMW5ITHVyRG9VT1J2NjZkeU1hdA==";
    var base = "https://login.eveonline.com/oauth/token";
    var paramString = "";
    var command_type = "POST";
    var headers = {};

    headers["Content-Type"] = "application/json";
    headers["Authorization"] = "Basic " + auth;


    var bodyObject = {};
    bodyObject["grant_type"] = "authorization_code";
    bodyObject["code"] = code;
    var callback_data = code;

    sendCommand(base, paramString, authorization_callback, command_type, headers, bodyObject, callback_data);
}

function authorize_character_code(code) {
    var base = "https://instacardapp.com/AROCP/public/php/api.php";
    var paramString = "code=" + code;
    var command_type = "GET";
    var headers = {};
    headers["Content-Type"] = "application/json";
    var callback_data = code;
    sendCommand(base, paramString, verification_callback, command_type, headers, null, callback_data);
}

function download_character_info() {
    for (i in gCharacterCodes) {
        if (window.location.href.includes("localhost"))
            authorize_character_code_local(gCharacterCodes[i]);
        else

            authorize_character_code(gCharacterCodes[i]);
    }
}
function loadExternalFile(file, callback) {
    var responseHandled = false;
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && !responseHandled) {
            responseHandled = true;
            delete rawFile;
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
function main() {
    //Make sure the Character ID list is up to date
    // check_cookie();
    parse_my_url();
    

    LoadSystemsJSON();
}

main();