var gUniverse = new Object();
var gSystemMap = new Object();
var gConstellations = new Object();
var gRegions = new Object();

var gGateIDs = new Array();
var gGates = new Object();

var g3DScene;
var gSelectedGalaxy = "";

var toggler = document.getElementsByClassName("box");
var i;
var gScale = 1.0;

// 1 AU = 149,597,870,700 meters
var metersPerAu = 9460000000000000;

var gSystemsList = new Object();
var gUniverseScale = 1.0;
var gCurrentSystemIO = 0;
var gCurrentRegionIO = 0;
var gCurrentGateIO = 0;
var gCurrentConstellationIO = 0;

var gSelectionName = "Jita";
var gSelectedSystem = "Jita";
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



function click_login() {
    var eveServer = "https://login.eveonline.com/oauth/authorize"
    var scopes = "response_type=code&redirect_uri=https://falco-ventures.github.io/AROCP/&client_id=db8e339897bb417f971ff07ef617e967&scope=publicData%20esi-location.read_location.v1%20esi-location.read_ship_type.v1%20esi-skills.read_skills.v1%20esi-skills.read_skillqueue.v1%20esi-universe.read_structures.v1%20esi-ui.write_waypoint.v1%20esi-fittings.read_fittings.v1%20esi-fittings.write_fittings.v1%20esi-location.read_online.v1%20esi-clones.read_implants.v1%20esi-characters.read_fatigue.v1";
    window.location = eveServer + "?" + scopes;

}
function download_json(fileName, json) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", fileName);
    dlAnchorElem.click();
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

function ProcessConstellation(cData_i) {
    var constellationData = JSON.parse(cData_i.responseText);
    if (constellationData != null) {
        gConstellations[constellationData.constellation_id] = constellationData;
        var constellationIDs = Object.keys(gConstellations);
        if (gCurrentConstellationIO < constellationIDs.length) {
            GetNextConstellation();
        } else {
            download_json("/AROCP/map/constellations.json", gConstellations);
        }

    }

}
function GetNextConstellation(data_i) {
    var constellationIDs = Object.keys(gConstellations);

    if (constellationIDs == undefined || constellationIDs.length == 0) {
        var data = JSON.parse(data_i.responseText);
        for (var i = 0; i < data.length; i++) {
            gConstellations[String(data[i])] = new Object();
            gConstellations[String(data[i])].constellation_id = String(data[i]);
        }
    }
    constellationIDs = Object.keys(gConstellations);
    var url = "https://esi.evetech.net/latest/universe/constellations/" + gConstellations[constellationIDs[gCurrentConstellationIO]].constellation_id + "/";
    if (gCurrentConstellationIO % 10 == 0) {
        console.log("Getting " + gCurrentConstellationIO + " of " + constellationIDs.length);
    }
    gCurrentConstellationIO++;
    setTimeout(() => { sendCommand(url, "datasource=tranquility&language=en", ProcessConstellation); }, 10);
}



function ProcessRegion(cData_i) {
    var regionData = JSON.parse(cData_i.responseText);
    if (regionData != null) {
        gRegions[regionData.region_id] = regionData;
        var regionIDs = Object.keys(gRegions);
        if (gCurrentRegionIO < regionIDs.length) {
            GetNextRegion();
        } else {
            download_json("/AROCP/map/regions.json", gRegions);
        }


    }

}
function GetNextRegion(data_i) {
    var regionIDs = Object.keys(gRegions);

    if (regionIDs == undefined || regionIDs.length == 0) {
        var data = JSON.parse(data_i.responseText);
        for (var i = 0; i < data.length; i++) {
            gRegions[String(data[i])] = new Object();
            gRegions[String(data[i])].region_id = String(data[i]);
        }
    }
    regionIDs = Object.keys(gRegions);
    var url = "https://esi.evetech.net/latest/universe/regions/" + gRegions[regionIDs[gCurrentRegionIO]].region_id + "/";
    if (gCurrentRegionIO % 10 == 0) {
        console.log("Getting " + gCurrentRegionIO + " of " + regionIDs.length);
    }
    gCurrentRegionIO++;
    setTimeout(() => { sendCommand(url, "datasource=tranquility&language=en", ProcessRegion); }, 10);
}


function ProcessGate(cData_i) {
    try {
        var gateData = JSON.parse(cData_i.responseText);
        gGates[gateData.stargate_id] = gateData;
        if (gCurrentGateIO < gGateIDs.length) {
            GetNextGate();
        } else {
            download_json("/AROCP/map/gates.json", gGates);
            InitializeGates();
        }

    } catch {
        download_json("/AROCP/map/gates.json", gGates);
        InitializeGates();
    }
}

function GetNextGate(data_i) {
    var gateIDs = gGateIDs;

    if (gGates[gateIDs[0]] == undefined) {
        // var data = JSON.parse(data_i.responseText);
        for (var i = 0; i < gGateIDs.length; i++) {
            gGates[(gGateIDs[i])] = new Object();
            gGates[(gGateIDs[i])].stargate_id = (gGateIDs[i].stargate_id);
        }
    }

    var url = "https://esi.evetech.net/latest/universe/stargates/" + gateIDs[gCurrentGateIO] + "/";
    if (gCurrentGateIO % 10 == 0) {
        console.log("Getting " + gCurrentGateIO + " of " + gateIDs.length);
    }
    gCurrentGateIO++;
    setTimeout(() => { sendCommand(url, "datasource=tranquility&language=en", ProcessGate); }, 10);
}
function LoadSystemsJSON() {
    //Try to load the systems.json file we scrape from Eve.  If it is not there, start scraping
    loadExternalFile("/AROCP/map/constellations.json", function (text) {
        try {
            gConstellations = JSON.parse(text);
        } catch {
            gConstellations = new Object();
            sendCommand("https://esi.evetech.net/latest/universe/constellations/", "datasource=tranquility", GetNextConstellation);
        }
        //Try to load the systems.json file we scrape from Eve.  If it is not there, start scraping
        loadExternalFile("/AROCP/map/regions.json", function (text) {
            try {
                gRegions = JSON.parse(text);
            } catch {
                gRegions = new Object();
                sendCommand("https://esi.evetech.net/latest/universe/regions/", "datasource=tranquility", GetNextRegion);
            }

            //Try to load the systems.json file we scrape from Eve.  If it is not there, start scraping
            loadExternalFile("/AROCP/map/systems.json", function (text) {
                try {
                    gSystems = JSON.parse(text);
                    startApplication(gSystems);
                } catch {
                    gSystems = new Object();
                    sendCommand("https://esi.evetech.net/latest/universe/systems/", "datasource=tranquility", GetNextSystem);
                }

            })

        })
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

    space.systems[system.name] = system;
    // space[system.name].position.x = space[system.name].position.x / metersPerAu ;
    // space[system.name].position.y = space[system.name].position.y / metersPerAu ;
    // space[system.name].position.z = space[system.name].position.z / metersPerAu ;

    if (space.systems[system.name].position.x < space.bbox.min.x) {
        space.bbox.min.x = space.systems[system.name].position.x;
    }
    if (space.systems[system.name].position.y < space.bbox.min.y) {
        space.bbox.min.y = space.systems[system.name].position.y;
    }
    if (space.systems[system.name].position.z < space.bbox.min.z) {
        space.bbox.min.z = space.systems[system.name].position.z;
    }
    if (space.systems[system.name].position.x > space.bbox.max.x) {
        space.bbox.max.x = space.systems[system.name].position.x;
    }
    if (space.systems[system.name].position.y > space.bbox.max.y) {
        space.bbox.max.y = space.systems[system.name].position.y;
    }
    if (space.systems[system.name].position.z > space.bbox.max.z) {
        space.bbox.max.z = space.systems[system.name].position.z;
    }
}

/*

Menus

*/

function click_space_callback() {
    var spaceName = this.innerHTML;
    console.log("click_space_callback " + spaceName);
}
function hover_callback() {
    var systemName = this.innerHTML.split(' (')[0];
    hover_system(systemName)
}
function Get3DPositionFromSystem(system_data) {
    var space = gUniverse[system_data.systemType];
    var offsetPosition = new Object();
    offsetPosition.x = system_data.position.x - space.bbox.center.x + space.offset.x;
    offsetPosition.y = system_data.position.y - space.bbox.center.y + space.offset.y;
    offsetPosition.z = system_data.position.z - space.bbox.center.z + space.offset.z;
    return new BABYLON.Vector3(offsetPosition.x, offsetPosition.y, offsetPosition.z);
}
function Get3DPositionFromRegion(region_data) {
    var space = gUniverse[region_data.space];
    var offsetPosition = new Object();
    offsetPosition.x = region_data.position.x - space.bbox.center.x + space.offset.x;
    offsetPosition.y = region_data.position.y - space.bbox.center.y + space.offset.y;
    offsetPosition.z = region_data.position.z - space.bbox.center.z + space.offset.z;
    return new BABYLON.Vector3(offsetPosition.x, offsetPosition.y, offsetPosition.z);
}

function CalculateSystemDistance(s1, s2) {
    var p1 = Get3DPositionFromSystem(s1);
    var p2 = Get3DPositionFromSystem(s2);
    var dx = (p1.x - p2.x);
    var dy = (p1.y - p2.y);
    var dz = (p1.z - p2.z);
    var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance;
}

function hover_system(systemName) {
    var systemData = gSystemMap[systemName];
    if (systemData != undefined) {
        var label = systemName;
        var selectedSystemData = gSystemMap[gSelectedSystem];
        var p1 = Get3DPositionFromSystem(systemData);
        // gUniverseScale = gJitaCenter[0] / (gSystemMap["Jita"].position.x);
        if (selectedSystemData != undefined) {
            var distance = CalculateSystemDistance(systemData, selectedSystemData);
            label = systemName + " " + distance.toFixed(1) + " from " + selectedSystemData.name;
        }

        gHoverPlaneTexture.clear();
        gHoverPlaneTexture.drawText(label, 0, 256, "bold 44px Arial", "white", "transparent", true, true);
        gHoverSphere.position = p1;

        gHoverPlane.position.x = gHoverSphere.position.x;
        gHoverPlane.position.y = gHoverSphere.position.y + 8.25;
        gHoverPlane.position.z = gHoverSphere.position.z;

        gHoverPlane.material.opacityTexture = gHoverPlaneTexture;
        gHoverPlane.material.diffuseTexture = gHoverPlaneTexture;
    } else {
        if (gHoverPlane != undefined)
            gHoverPlane.position.x = 100000;
        if (gHoverSphere != undefined)
            gHoverSphere.position.x = 100000;
    }
}
function select_system(systemName) {
    if (gSystemMap[systemName] != undefined) {
        var systemData = gSystemMap[systemName];
        if (systemData != undefined) {
            gSelectedSystem = systemName;

            create_selection_sphere(systemName);

            gSelectionSphere.position = Get3DPositionFromSystem(gSystemMap[systemName]);

            gSelectionPlane.position.x = gSelectionSphere.position.x;
            gSelectionPlane.position.y = gSelectionSphere.position.y + 8.25;
            gSelectionPlane.position.z = gSelectionSphere.position.z;

            gCamera.position.x = gSelectionSphere.position.x;
            gCamera.position.y = gSelectionSphere.position.y;
            gCamera.position.z = gSelectionSphere.position.z - 200;

            gCamera.setTarget(new BABYLON.Vector3(gSelectionSphere.position.x, gSelectionSphere.position.y, gSelectionSphere.position.z));

        }
    }
}
function click_system_callback() {
    var systemName = this.innerHTML.split(' (')[0];
    select_system(systemName);
}


function ColorFromSecurity(security) {
    var black = [0, 0, 0];
    var blue = [0, 0, 1];
    var cyan = [0, 1, 1];
    var green = [0, 1, 0];
    var yellow = [1, 1, 0];
    var red = [1, 0.6, 0.6];
    var orange = [1, 0.6, 0];
    var darkRed = [0.5, 0.1, 0.1];
    var color = black;
    if (security <= 0.0) {
        color = darkRed;
    } else if (security <= 0.2) {
        color = red;
    } else if (security <= 0.3) {
        color = orange;
    } else if (security <= 0.4) {
        color = orange;
    } else if (security <= 0.5) {
        color = yellow;
    } else if (security <= 0.6) {
        color = cyan;
    } else if (security <= 0.7) {
        color = green;
    } else {
        color = blue;
    }
    return new BABYLON.Color3(color[0], color[1], color[2]);
}

function InitializeUniverse(systems_json) {



    gUniverse.NewEden = new Object();
    gUniverse.NewEden.name = "New Eden";
    gUniverse.NewEden.systems = new Object();
    gUniverse.NewEden.offset = { x: 0, y: 0, z: 0 };
    gUniverse.NewEden.pcs = new BABYLON.PointsCloudSystem("New Eden", 30, g3DScene);
    // gUniverse.NewEden.hisec = new Object();
    // gUniverse.NewEden.losec = new Object();
    // gUniverse.NewEden.nullsec = new Object();

    gUniverse.WormholeSpace = new Object();
    gUniverse.WormholeSpace.name = "Wormhole Space";
    gUniverse.WormholeSpace.systems = new Object();
    gUniverse.WormholeSpace.offset = { x: 0, y: 0, z: 0 };
    gUniverse.WormholeSpace.pcs = new BABYLON.PointsCloudSystem("Wormhole Space", 30, g3DScene);

    gUniverse.ShatteredWormholeSpace = new Object();
    gUniverse.ShatteredWormholeSpace.name = "Shattered Wormhole Space";
    gUniverse.ShatteredWormholeSpace.systems = new Object();
    gUniverse.ShatteredWormholeSpace.offset = { x: 0, y: -30, z: 0 };
    gUniverse.ShatteredWormholeSpace.pcs = new BABYLON.PointsCloudSystem("Shattered Wormhole Space", 30, g3DScene);

    gUniverse.VSpace = new Object();
    gUniverse.VSpace.name = "V Space";
    gUniverse.VSpace.systems = new Object();
    gUniverse.VSpace.offset = { x: 0, y: 0, z: 0 };
    gUniverse.VSpace.pcs = new BABYLON.PointsCloudSystem("V Space", 30, g3DScene);

    gUniverse.ADSpace = new Object();
    gUniverse.ADSpace.name = "AD Space";
    gUniverse.ADSpace.systems = new Object();
    gUniverse.ADSpace.offset = { x: 0, y: 0, z: 0 };
    gUniverse.ADSpace.pcs = new BABYLON.PointsCloudSystem("AD Space", 30, g3DScene);

    //Add regions to spaces
    var keys = Object.keys(gRegions);
    keys.sort();
    for (var i = 0; i < keys.length; ++i) {
        var region = gRegions[keys[i]];
        if (region.region_id < 11000000) {
            //new eden
            region.space = "NewEden";
            gUniverse.NewEden[region.name] = region;
        } else if (region.region_id < 11000031) {
            //wormhole
            region.space = "WormholeSpace";
            gUniverse.WormholeSpace[region.name] = region;
        } else if (region.region_id < 12000000) {
            //shattered wormhole
            region.space = "ShatteredWormholeSpace";
            gUniverse.ShatteredWormholeSpace[region.name] = region;
        } else if (region.region_id < 14000000) {
            //AD
            region.space = "ADSpace";
            gUniverse.ADSpace[region.name] = region;
        } else {
            //V
            region.space = "VSpace";
            gUniverse.VSpace[region.name] = region;
        }
    }

    //Add regions to spaces
    keys = Object.keys(gConstellations);
    keys.sort();
    for (var i = 0; i < keys.length; ++i) {
        var constellation = gConstellations[keys[i]];

        constellation.position.x = constellation.position.x / metersPerAu;
        constellation.position.y = constellation.position.y / metersPerAu;
        constellation.position.z = constellation.position.z / metersPerAu;

        gConstellations[keys[i]] = constellation;
        var region = gRegions[constellation.region_id];
        var space = region.space;
        gUniverse[space][region.name][keys[i]] = constellation;

    }


    keys = Object.keys(systems_json);
    keys.sort();
    for (var i = 0; i < keys.length; ++i) {


        var system = keys[i];
        var systemName = systems_json[system].name;


        //Convert units
        systems_json[system].position.x = systems_json[system].position.x / metersPerAu;
        systems_json[system].position.y = systems_json[system].position.y / metersPerAu;
        systems_json[system].position.z = systems_json[system].position.z / metersPerAu;


        //Color
        let security = systems_json[system].security_status;
        systems_json[system].color = ColorFromSecurity(security);

        gSystemsList[systems_json[system].system_id] = systems_json[system];
        //Add to system map
        gSystemMap[systemName] = systems_json[system];
        if (systems_json[system].stargates != undefined) {
            for (stargate_id in systems_json[system].stargates) {
                gGateIDs.push(systems_json[system].stargates[stargate_id]);
            }
        }
    }
    //Try to load the systems.json file we scrape from Eve.  If it is not there, start scraping
    loadExternalFile("/AROCP/map/gates.json", function (text) {
        try {
            gGates = JSON.parse(text);
            InitializeGates()
        } catch {
            gGates = new Object();
            GetNextGate();
        }
    });
    //Universe bounds
    for (const system_name in systems_json) {
        var position = systems_json[system_name].position;

        if (gUniverseMax.x < position.x) {
            gUniverseMax.x = position.x;
        }
        if (gUniverseMax.y < position.y) {
            gUniverseMax.y = position.y;
        }
        if (gUniverseMax.z < position.z) {
            gUniverseMax.z = position.z;
        }

        if (gUniverseMin.x > position.x) {
            gUniverseMin.x = position.x;
        }
        if (gUniverseMin.y > position.y) {
            gUniverseMin.y = position.y;
        }
        if (gUniverseMin.z > position.z) {
            gUniverseMin.z = position.z;
        }
    }
    var xSize = gUniverseMax.x - gUniverseMin.x;
    var ySize = gUniverseMax.y - gUniverseMin.y;
    var zSize = gUniverseMax.z - gUniverseMin.z;
    var maxSize = xSize;
    if (ySize > xSize) {
        maxSize = ySize;
    }
    if (zSize > maxSize) {
        maxSize = zSize;
    }
    gUniverseScale = maxSize;

    var purple = [1, 0, 1];
    var orange = [1, 0.5, 0];
    var gray = [0.5, 0.5, 0.5];
    var color;
    for (const system_name in gSystemMap) {
        var system = gSystemMap[system_name];

        if (system.system_id < 31000000) {
            // if (system.security_status <= 0.0) {
            //     systemType = "nullsec";
            // } else if (system.security_status < 0.5) {
            //     systemType = "losec";
            // } else {
            //     systemType = "hisec";
            // }
            systemType = "NewEden";
            AddSystemToSpace(gUniverse[systemType], system, systemType);

        }
        else if (system.system_id > 31000000 && system.system_id < 32000000) {
            var constellation = gConstellations[system.constellation_id];
            var region = gRegions[constellation.region_id];
            systemType = region.space;
            if (systemType == "ShatteredWormholeSpace") {
                color = orange;
            } else {
                color = purple;
            }
            system.color = new BABYLON.Color3(color[0], color[1], color[2]);
            AddSystemToSpace(gUniverse[systemType], system, systemType)
        }
        else if (system.system_id > 32000000 &&
            system.system_id < 33000000) {
            systemType = "ADSpace";
            color = gray;
            system.color = new BABYLON.Color3(color[0], color[1], color[2]);
            AddSystemToSpace(gUniverse[systemType], system, systemType)
        }
        else if (system.system_id > 34000000 &&
            system.system_id < 35000000) {
            systemType = "VSpace";
            color = gray;
            system.color = new BABYLON.Color3(color[0], color[1], color[2]);
            AddSystemToSpace(gUniverse[systemType], system, systemType)
        }
    }

    // gUniverse.NewEden.bbox = gUniverse.NewEden.nullsec.bbox;
    //Calculate region positions
    for (const space_name in gUniverse) {
        gUniverse[space_name].bbox.center = new Object();
        gUniverse[space_name].bbox.center.x = (gUniverse[space_name].bbox.min.x + gUniverse[space_name].bbox.max.x) / 2;
        gUniverse[space_name].bbox.center.y = (gUniverse[space_name].bbox.min.y + gUniverse[space_name].bbox.max.y) / 2;
        gUniverse[space_name].bbox.center.z = (gUniverse[space_name].bbox.min.z + gUniverse[space_name].bbox.max.z) / 2;

        for (const region_name in gRegions) {
            var region = gRegions[region_name];
            if (region.space == space_name) {
                gUniverse[space_name][region.name].position = new BABYLON.Vector3(0, 0, 0);
                var numConst = 0;
                for (const constellation_name in gConstellations) {
                    var constellation = gConstellations[constellation_name];
                    if (constellation.region_id == region.region_id) {
                        gUniverse[space_name][region.name].position.x += constellation.position.x;
                        gUniverse[space_name][region.name].position.y += constellation.position.y;
                        gUniverse[space_name][region.name].position.z += constellation.position.z;
                        numConst++;
                    }
                }
                gUniverse[space_name][region.name].position.x /= numConst;
                gUniverse[space_name][region.name].position.y /= numConst;
                gUniverse[space_name][region.name].position.z /= numConst;
            }

        }
    }

}

var gScoutData = new Array();
var gScoutLines = null;
var gScoutCount = 1;
var theraConnectedSystems = new Object();
function ProcessScouts(response) {
    if (response == undefined || response == null)
        return;
    gScoutData = JSON.parse(response.responseText);
    var scountString = "Scouts";
    gScoutCount++;
    if (gScoutData != null) {
        var myLines = new Array();
        var myColors = new Array();


        var wormholeSystems = new Array();
        var thera = null;
        for (const scout_entry in gScoutData) {
            var scout_data = gScoutData[scout_entry];
            // var itemText = gate.name;
            var srcSystem = gSystemsList[scout_data.in_system_id];
            create_wormhole_sphere(srcSystem);
            var destSystem = gSystemsList[scout_data.out_system_id];
            create_wormhole_sphere(destSystem);

            if (srcSystem.name == "Thera") {
                thera = srcSystem;
                theraConnectedSystems[destSystem.system_id] = scout_data;
            }
            if (destSystem.name == "Thera") {
                thera = destSystem;
                theraConnectedSystems[srcSystem.system_id] = scout_data;
            }
            //Gather up all wormhole systems and a reference to their scout sonnection
            if (srcSystem.systemType == "WormholeSpace") {
                srcSystem.scout_index = scout_entry;
                wormholeSystems.push(srcSystem);
            }
            if (destSystem.systemType == "WormholeSpace" && destSystem.name != "Thera") {
                destSystem.scout_index = scout_entry;
                wormholeSystems.push(destSystem);
            }


            //Array of lines to construct linesystem
            var myLine = new Array();
            myLine.push(Get3DPositionFromSystem(srcSystem))
            myLine.push(Get3DPositionFromSystem(destSystem))
            myLines.push(myLine);

            // [   new BABYLON.Color4(0, 1, 1, 1),
            var myColorLine = new Array();
            myColorLine.push(new BABYLON.Color4(0.25, 0.25, 0.25, 0.5));
            myColorLine.push(new BABYLON.Color4(0.25, 0.25, 0.25, 0.5));
            myColors.push(myColorLine);

            var groupString = "Connection " + myColors.length;
            AddScoutMenu(scountString, groupString, groupString);

            var srcText = srcSystem.name
                + " (" + (srcSystem.position.x).toFixed(2)
                + "," + (srcSystem.position.y).toFixed(2)
                + "," + (srcSystem.position.z).toFixed(2)
                + ")";
            AddMenuItem(groupString, srcText);
            var dstText = destSystem.name
                + " (" + (destSystem.position.x).toFixed(2)
                + "," + (destSystem.position.y).toFixed(2)
                + "," + (destSystem.position.z).toFixed(2)
                + ")";
            AddMenuItem(groupString, dstText);

        }
        if (gScoutLines != null) {
            gScoutLines.dispose();
        }

        var jumpableWormHoles = new Array();

        for (const w1 in wormholeSystems) {
            // Loop through list and find pairs that are less that 8 ly apart
            var srcSystem = wormholeSystems[w1];
            for (const w2 in wormholeSystems) {
                if (w1 == w2) {
                    continue;
                }
                var destSystem = wormholeSystems[w2];
                var d = CalculateSystemDistance(srcSystem, destSystem);
                if (d < 8) {
                    var jumpableHole = new Object();
                    jumpableHole.src = srcSystem.scout_index;
                    jumpableHole.dest = destSystem.scout_index;
                    jumpableHole.distance = d;
                    jumpableWormHoles.push(jumpableHole);
                }
            }
        }
        for (const w in jumpableWormHoles) {
            var srcScout = gScoutData[jumpableWormHoles[w].src];
            var dstScout = gScoutData[jumpableWormHoles[w].dest];

            var route = new Array();
            route.push(gSystemsList[srcScout.out_system_id].name);
            route.push(gSystemsList[srcScout.in_system_id].name);
            route.push("Jump " + jumpableWormHoles[w].distance.toFixed(1) + "ly");
            route.push(gSystemsList[dstScout.in_system_id].name);
            route.push(gSystemsList[dstScout.out_system_id].name);

            console.log("Route: " + route);

            var myLine = new Array();
            myLine.push(Get3DPositionFromSystem(gSystemsList[srcScout.out_system_id]))
            myLine.push(Get3DPositionFromSystem(gSystemsList[srcScout.in_system_id]))
            myLines.push(myLine);

            var myColorLine = new Array();
            myColorLine.push(ColorFromSecurity(gSystemsList[srcScout.out_system_id].security_status));
            myColorLine.push(ColorFromSecurity(gSystemsList[srcScout.in_system_id].security_status));
            myColors.push(myColorLine);

            myLine = new Array();
            myLine.push(Get3DPositionFromSystem(gSystemsList[srcScout.in_system_id]))
            myLine.push(Get3DPositionFromSystem(gSystemsList[dstScout.in_system_id]))
            myLines.push(myLine);

            myColorLine = new Array();
            myColorLine.push(new BABYLON.Color4(0, 1, 0, 1));
            myColorLine.push(new BABYLON.Color4(0, 1, 0, 1));
            myColors.push(myColorLine);

            myLine = new Array();
            myLine.push(Get3DPositionFromSystem(gSystemsList[dstScout.in_system_id]))
            myLine.push(Get3DPositionFromSystem(gSystemsList[dstScout.out_system_id]))
            myLines.push(myLine);

            myColorLine = new Array();
            myColorLine.push(ColorFromSecurity(gSystemsList[srcScout.in_system_id].security_status));
            myColorLine.push(ColorFromSecurity(gSystemsList[dstScout.out_system_id].security_status));
            myColors.push(myColorLine);


            var groupString = "Jumpable Route " + w;
            AddScoutMenu("Jumps", groupString, groupString);

            var srcText = gSystemsList[srcScout.out_system_id].name
                + " (" + (srcScout.out_signature)
                + " - " + (srcScout.in_signature)
                + ")";
            AddMenuItem(groupString, srcText);
            var dstText = gSystemsList[srcScout.in_system_id].name
                + " ( Time Remaining: " + srcScout.remaining_hours + " , " + srcScout.remaining_hours
                + ")";
            AddMenuItem(groupString, dstText);

            var dstText = gSystemsList[dstScout.in_system_id].name
                + " ( Distance: " + jumpableWormHoles[w].distance.toFixed(1)
                + ")";
            AddMenuItem(groupString, dstText);

            var srcText = gSystemsList[dstScout.out_system_id].name
                + " (" + (dstScout.out_signature)
                + " - " + (dstScout.in_signature)
                + ")";
            AddMenuItem(groupString, srcText);
        }

        for (const system_id in theraConnectedSystems) {
            var scoutData = theraConnectedSystems[system_id];
            var wormholeSig = " (" + (scoutData.out_signature)
                + " - " + (scoutData.in_signature)
                + ")";
            var system = gSystemsList[system_id];
            var destString = system.name + wormholeSig + " Time: " + scoutData.remaining_hours;

            if (system.security_status >= 0.5) {
                AddMenuItem("Thera1", destString);
            } else if (system.security_status >= 0.0) {
                AddMenuItem("Thera2", destString);
            } else {
                AddMenuItem("Thera3", destString);
            }

            var myLine = new Array();
            myLine.push(Get3DPositionFromSystem(thera))
            myLine.push(Get3DPositionFromSystem(system))
            myLines.push(myLine);

            var lineColor = ColorFromSecurity(system.security_status);
            var myColorLine = new Array();
            myColorLine.push(lineColor);
            myColorLine.push(lineColor);
            myColors.push(myColorLine);



        }
        gScoutLines = create_gate_lines(myLines, myColors);


    }

    download_character_info();
}

function InitializeEveScout() {
    sendCommand("https://api.eve-scout.com/v2/public/signatures", "", ProcessScouts);

    const myFunction = () => {
        sendCommand("https://api.eve-scout.com/v2/public/signatures", "", ProcessScouts);
    }


    // setInterval(myFunction, 10000); // Repeat myFunction every 2 seconds
}

function InitializeGates() {
    var myLines = new Array();
    var myColors = new Array();

    for (const gate_name in gGates) {
        var gate = gGates[gate_name];
        // var itemText = gate.name;
        var srcSystem = gSystemsList[gate.system_id];
        var destSystem = gSystemsList[gate.destination.system_id];
        // console.log( "Gate: " + gate.name + 
        //                 " from " + srcSystem.name +
        //                 " to " + destSystem.name
        //                 )
        //Array of lines to construct linesystem
        var myLine = new Array();
        myLine.push(Get3DPositionFromSystem(srcSystem))
        myLine.push(Get3DPositionFromSystem(destSystem))
        myLines.push(myLine);

        // [   new BABYLON.Color4(0, 1, 1, 1),
        var myColorLine = new Array();
        myColorLine.push(new BABYLON.Color4(0.25, 0.25, 0.25, 0.25));
        myColorLine.push(new BABYLON.Color4(0.25, 0.25, 0.25, 0.25));
        myColors.push(myColorLine);

    }
    create_gate_lines(myLines, myColors);
    InitializeEveScout();
}


function InitializeMenus() {


    for (const region_name in gRegions) {
        var region = gRegions[region_name];
        var itemText = region.name;
        AddRegionMenu(region.space, region.name, itemText);
    }

    for (const c_name in gConstellations) {
        var constellation = gConstellations[c_name];
        var itemText = constellation.name
            + " (" + (constellation.position.x).toFixed(2)
            + "," + (constellation.position.y).toFixed(2)
            + "," + (constellation.position.z).toFixed(2)
            + ")";
        var region = gRegions[constellation.region_id];
        AddConstellationMenu(region.name, constellation.name, itemText);
    }

    for (const system_name in gSystemMap) {
        var system = gSystemMap[system_name];
        var itemText = system.name
            + " (" + (system.position.x).toFixed(2)
            + "," + (system.position.y).toFixed(2)
            + "," + (system.position.z).toFixed(2)
            + ")";
        var constellation = gConstellations[system.constellation_id];
        AddMenuItem(constellation.name, itemText);
    }
    /*
    list clicking
    */
    for (i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", click_space_callback);
        toggler[i].addEventListener("click", function () {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("check-box");



        });
    }


}

function AddMenuItem(parentMenuID, itemText) {
    var ul = document.getElementById(parentMenuID);
    var li = document.createElement("li");
    var textNode = document.createTextNode(itemText);
    textNode.class = "box"
    li.appendChild(textNode);
    li.addEventListener("mouseover", hover_callback);
    li.addEventListener("mousedown", click_system_callback);
    ul.appendChild(li);
}


function AddScoutMenu(parentMenuID, region_name, itemText) {
    var ul = document.getElementById(parentMenuID);

    var li = document.createElement("li");
    var span = document.createElement("span");

    span.class = "box";
    span.id = region_name + "UL";
    span.innerHTML = itemText;
    li.appendChild(span);

    var newul = document.createElement("ul");
    newul.class = "nested";
    newul.id = region_name;
    li.appendChild(newul);

    li.addEventListener("click", function () {
        this.parentElement.querySelector("nested").classList.toggle("active");
        this.classList.toggle("check-box");



    });
    ul.appendChild(li);
}

function AddRegionMenu(parentMenuID, region_name, itemText) {
    var ul = document.getElementById(parentMenuID);

    var li = document.createElement("li");
    var span = document.createElement("span");

    span.class = "box";
    span.id = region_name + "UL";
    span.innerHTML = itemText;
    li.appendChild(span);

    var newul = document.createElement("ul");
    newul.class = "nested";
    newul.id = region_name;
    li.appendChild(newul);

    li.addEventListener("click", function () {
        this.parentElement.querySelector("nested").classList.toggle("active");
        this.classList.toggle("check-box");



    });
    ul.appendChild(li);
}


function AddConstellationMenu(parentMenuID, c_name, itemText) {
    var ul = document.getElementById(parentMenuID);

    var li = document.createElement("li");
    var span = document.createElement("span");

    span.class = "box";
    span.id = c_name + "UL";
    span.innerHTML = itemText;
    li.appendChild(span);

    var newul = document.createElement("ul");
    newul.class = "nested";
    newul.id = c_name;
    li.appendChild(newul);

    li.addEventListener("click", function () {
        this.parentElement.querySelector("nested").classList.toggle("active");
        this.classList.toggle("check-box");



    });
    ul.appendChild(li);
}
