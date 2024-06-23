

var gDrifterSystems = {
    "J164710": {
        name: "Vidette",
        ksig: "V928",
        wormhole_name: "J164710",
        effect: "Magnetar"
    },
    "J174618": {
        name: "Redoubt",
        ksig: "R259",
        wormhole_name: "J174618",
        effect: "Magnetar"
    },
    "J055520": {
        name: "Sentinel",
        ksig: "S877",
        wormhole_name: "J055520",
        effect: "Magnetar"
    },
    "J110145": {
        name: "Barbican",
        ksig: "B735",
        wormhole_name: "J110145",
        effect: "Magnetar"
    },
    "J200727": {
        name: "Conflux",
        ksig: "C414",
        wormhole_name: "J200727",
        effect: "Pulsar"
    }

}

function GetDrifterProperties(system_name) {
    if(gDrifterSystems[system_name] == undefined) {
        return undefined;
    }

    return gDrifterSystems[system_name];
}