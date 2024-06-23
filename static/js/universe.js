var gUniverse = new Object();
var gSystemMap = null;

var g3DScene = null;
var gSelectedGalaxy = "";
var SPSMesh = null;
var toggler = document.getElementsByClassName("box");
var i;
var gScale = 1.0;

// 1 AU = 149,597,870,700 meters
var metersPerAu = 9460000000000000;

var gSystemList = new Array();
var gUniverseScale = 1.0;
var gCurrentSystemIO = 0;

var gSelectionName = "Jita";

var gSystems = new Object();

var gUniverseMin = new Object();
var gUniverseMax = new Object();


gUniverseMin.x = 0;
gUniverseMin.y = 0;
gUniverseMin.z = 0;
gUniverseMax.x = 0;
gUniverseMax.y = 0;
gUniverseMax.z = 0;

var gJitaCenter = [-1.29064861735e+17, 6.075530691e+16, - 1.1746922706e+17];

var gInitialized = false;
/*
list clicking
*/
for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", click_galaxy_callback);
    toggler[i].addEventListener("click", function () {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("check-box");



    });
}


function click_login() {
    var eveServer = "https://login.eveonline.com/oauth/authorize"
    var scopes = "response_type=code&redirect_uri=https://falco-ventures.github.io/AROCP/&client_id=db8e339897bb417f971ff07ef617e967&scope=publicData%20esi-location.read_location.v1%20esi-location.read_ship_type.v1%20esi-skills.read_skills.v1%20esi-skills.read_skillqueue.v1%20esi-universe.read_structures.v1%20esi-ui.write_waypoint.v1%20esi-fittings.read_fittings.v1%20esi-fittings.write_fittings.v1%20esi-location.read_online.v1%20esi-clones.read_implants.v1%20esi-characters.read_fatigue.v1";
    window.location = eveServer + "?" + scopes;

}
function click_download() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gSystemMap));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "scene.json");
    dlAnchorElem.click();
}
function click_galaxy_callback() {
    console.log("click_galaxy_callback");
    var galaxyName = this.innerHTML;
    if (galaxyName == "Universe") {
        var galaxyData = gSystemMap[galaxyName];
        gCamera.position.x = 0;//gScale*galaxyData[1];
        gCamera.position.y = 0;//gScale*galaxyData[2];
        gCamera.position.z = -1;//gScale*galaxyData[3]-3;


        gCamera.setTarget(new BABYLON.Vector3(0, 0, 0));//gScale*galaxyData[1],gScale*galaxyData[2],gScale*galaxyData[3]));


    }
}



function ProcessSystem(systemData_i) {
    var systemData = JSON.parse(systemData_i.responseText);
    if (systemData != null) {
        gSystems[systemData.system_id] = systemData;
        if (gCurrentSystemIO < gSystemList.length) {
            GetNextSystem(gSystemList);
        } else {
            startApplication(gSystems);
        }

    } else {
        console.log("ERROR " + gCurrentSystemIO + " of " + gSystemList.length);
        GetNextSystem(gSystemList);
    }

}
function GetNextSystem(data_i) {
    var data = JSON.parse(data_i.responseText);
    if (gSystemList.length == 0) {
        gSystemList = data;
        for (var i = 0; i < data.length; i++) {
            gSystems[data[i]] = new Object();
            gSystems[data[i]].system_id = data[i];
        }
    }

    //https://esi.evetech.net/latest/universe/systems/30000002/?datasource=tranquility&language=en
    var url = "https://esi.evetech.net/latest/universe/systems/" + gSystemList[gCurrentSystemIO];
    if (gCurrentSystemIO % 10 == 0) {
        console.log("Getting " + gCurrentSystemIO + " of " + gSystemList.length);
    }
    gCurrentSystemIO++;
    setTimeout(() => { sendCommand(url, "datasource=tranquility&language=en", ProcessSystem); }, 10);
}

function LoadSystemsJSON() {
    //Try to load the systems.json file we scrape from Eve.  If it is not there, start scraping
    loadExternalFile("systems.json", function (text) {
        try {
            gSystems = JSON.parse(text);
            startApplication(gSystems);
        } catch {
            //https://esi.evetech.net/latest/universe/systems/?datasource=tranquility
            sendCommand("https://esi.evetech.net/latest/universe/systems/", "datasource=tranquility", GetNextSystem);
        }
    })

}
function AddSystemToSpace(space, system, systemType) {
    if (space.bbox == undefined) {
        space.bbox = new Object();
        space.bbox.min = new Object();
        space.bbox.min.x = 100000;
        space.bbox.min.y = 100000;
        space.bbox.min.z = 100000;
        space.bbox.max = new Object();
        space.bbox.max.x = -100000;
        space.bbox.max.y = -100000;
        space.bbox.max.z = -100000;
    }
    system.systemType = systemType;

    space[system.name] = system;
    space[system.name].position.x = space[system.name].position.x ;
    space[system.name].position.y = space[system.name].position.y ;
    space[system.name].position.z = space[system.name].position.z ;
    if (space[system.name].position.x < space.bbox.min.x) {
        space.bbox.min.x = space[system.name].position.x;
    }
    if (space[system.name].position.y < space.bbox.min.y) {
        space.bbox.min.y = space[system.name].position.y;
    }
    if (space[system.name].position.z < space.bbox.min.z) {
        space.bbox.min.z = space[system.name].position.z;
    }
    if (space[system.name].position.x > space.bbox.max.x) {
        space.bbox.max.x = space[system.name].position.x;
    }
    if (space[system.name].position.y > space.bbox.max.y) {
        space.bbox.max.y = space[system.name].position.y;
    }
    if (space[system.name].position.z > space.bbox.max.z) {
        space.bbox.max.z = space[system.name].position.z;
    }
}
function InitializeUniverse() {

    gUniverse.NewEden = new Object();
    gUniverse.NewEden.name = "New Eden";
    gUniverse.NewEden.hisec = new Object();
    gUniverse.NewEden.losec = new Object();
    gUniverse.NewEden.nullsec = new Object();
    gUniverse.WormholeSpace = new Object();
    gUniverse.WormholeSpace.name = "Wormhole Space";
    gUniverse.ShatteredWormholeSpace = new Object();
    gUniverse.ShatteredWormholeSpace.name = "Shattered Wormhole Space";
    gUniverse.VSpace = new Object();
    gUniverse.VSpace.name = "V Space";
    gUniverse.ADSpace = new Object();
    gUniverse.ADSpace.name = "AD Space";


    for (const system_name in gSystemMap) {
        var system = gSystemMap[system_name];

        if (system.system_id < 31000000) {
            if (system.security_status <= 0.0) {
                systemType = "nullsec";
            } else if (system.security_status < 0.5) {
                systemType = "losec";
            } else {
                systemType = "hisec";
            }
            AddSystemToSpace(gUniverse.NewEden[systemType], system, systemType);
        }
        else if (system.system_id > 31000000 &&
            system.system_id < 32000000) {
            if (system_name[1] == '0') {
                systemType = "ShatteredWormholeSpace"
            } else {
                systemType = "WormholeSpace";
            }
            AddSystemToSpace(gUniverse[systemType], system, systemType)
        }
        else if (system.system_id > 32000000 &&
            system.system_id < 33000000) {
            systemType = "ADSpace";
            AddSystemToSpace(gUniverse[systemType], system, systemType)
        }
        else if (system.system_id > 34000000 &&
            system.system_id < 35000000) {
            systemType = "VSpace";
            AddSystemToSpace(gUniverse[systemType], system, systemType)
        }
    }

    gUniverse.NewEden.bbox = gUniverse.NewEden.nullsec.bbox;
}

function InitializeMenus() {

    for (const system_name in gSystemMap) {
        var system = gSystemMap[system_name];
        var itemText = system.name
            + " (" + (system.position.x/metersPerAu).toFixed(2)
            + "," + (system.position.y/metersPerAu).toFixed(2)
            + "," +(system.position.z/metersPerAu).toFixed(2)
            + ")";
        AddMenuItem(system.systemType, itemText);
    }

    for (const space_name in gUniverse) {
        var menuItem = document.getElementById(space_name+"UL");


        var itemText = gUniverse[space_name].name
            + " (" + (gUniverse[space_name].bbox.min.x/metersPerAu).toFixed(2)
            + "," + (gUniverse[space_name].bbox.min.y/metersPerAu).toFixed(2)
            + "," + (gUniverse[space_name].bbox.min.z/metersPerAu).toFixed(2)
            + ") - "
            + " (" + (gUniverse[space_name].bbox.max.x/metersPerAu).toFixed(2)
            + "," + (gUniverse[space_name].bbox.max.y/metersPerAu).toFixed(2)
            + "," + (gUniverse[space_name].bbox.max.z/metersPerAu).toFixed(2)
            + ")";

        menuItem.innerHTML = itemText;
    }

}

function AddMenuItem(parentMenuID, itemText) {
    var ul = document.getElementById(parentMenuID);
    var li = document.createElement("li");
    var textNode = document.createTextNode(itemText);
    li.appendChild(textNode);
    li.addEventListener("mouseover", hover_callback);
    li.addEventListener("mousedown", click_callback);
    ul.appendChild(li);
}