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
        command_type = "GET";

    function reqListener() {
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
            req.setRequestHeader(String(header), String(headers[header]));
        }
    }

    if (body != undefined && body != null) {
        if (typeof body === "string") {
            // e.g. x-www-form-urlencoded
            req.send(body);
        } else {
            // JSON body
            req.send(JSON.stringify(body));
        }
    } else {
        req.send();
    }
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

            // OLD:
            // var base = "https://esi.evetech.net/verify/";
            // NEW:
            var base = "https://login.eveonline.com/oauth/verify";

            var paramString = "";
            var command_type = "GET";
            var headers = {};
            headers["Content-Type"] = "application/json";
            headers["Authorization"] = "Bearer " + loginCredentials.access_token;

            sendCommand(base, paramString, verification_callback, command_type, headers, null, callback_data);
        } catch (e) {

        }
    }
}

function authorization_callback(data, callback_data) {
    if (data != undefined) {
        console.log("Requested " + callback_data.code + " and got " + data.responseText);

        try {
            loginCredentials = JSON.parse(data.responseText);

            var base = "https://login.eveonline.com/oauth/verify";
            var paramString = "";
            var command_type = "GET";
            var headers = {};
            headers["Content-Type"] = "application/json";
            headers["Authorization"] = "Bearer " + loginCredentials.access_token;

            sendCommand(base, paramString, verification_callback, command_type, headers, null, callback_data);
        } catch (e) {
        }
    }
}


function verification_callback(data, code) {
    if (data != undefined) {
        try {
            var characterInfo = JSON.parse(data.responseText);
            if (characterInfo != undefined && characterInfo.CharacterName != undefined) {
                console.log(JSON.stringify(characterInfo));

                gCharacterInfo.push(characterInfo)

                var base = "https://esi.evetech.net/latest/characters/" + characterInfo.CharacterID + "/location/";
                var paramString = "datasource=tranquility";
                var command_type = "GET";
                var headers = {};
                headers["Content-Type"] = "application/json";
                headers["Authorization"] = "Bearer " + loginCredentials.access_token;

                sendCommand(base, paramString, ProcessCharacterLocation, command_type, headers, null, loginCredentials);

                var base = "https://esi.evetech.net/latest/characters/2122278309/";
                var paramString = "datasource=tranquility";
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
function authorize_character_code_local(code) {
    var auth = "ZGI4ZTMzOTg5N2JiNDE3Zjk3MWZmMDdlZjYxN2U5Njc6TXNMZWxlZTFMcmo5eG5zYXhHdFozMW5ITHVyRG9VT1J2NjZkeU1hdA==";

    // OLD:
    // var base = "https://login.eveonline.com/oauth/token";
    // NEW (v2 endpoint):
    var base = "https://login.eveonline.com/v2/oauth/token";

    var paramString = "";
    var command_type = "POST";
    var headers = {};

    headers["Content-Type"] = "application/x-www-form-urlencoded";
    headers["Authorization"] = "Basic " + auth;

    var body =
        "grant_type=authorization_code" +
        "&code=" + encodeURIComponent(code);

    var callback_data = code;

    sendCommand(base, paramString, authorization_callback, command_type, headers, body, callback_data);
}



function authorize_character_code(code) {
    var base = "https://falco-ventures.github.io/AROCP/php/api.php";
    var paramString = "code=" + code;
    var command_type = "GET";
    var headers = {};
    headers["Content-Type"] = "application/json";
    var callback_data = code;
    sendCommand(base, paramString, verification_callback, command_type, headers, null, callback_data);
}

function download_character_info() {
    for (i in gCharacterCodes) {
        authorize_character_code_local(gCharacterCodes[i]);
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
    parse_my_url();
    LoadSystemsJSON();
}

main();
