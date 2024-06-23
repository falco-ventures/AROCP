
var gCharacters = new Object();

function InitialzieCharactersFromCookies() {
    let character_string = getCookie("characters");
    if (character_string != "") {
        gCharacters = JSON.parse(character_string);
    }
}

function VerifyCharacter() {

}

 
/*
{{
    "CharacterID": 2122278309,
    "CharacterName": "AeroPete",
    "ExpiresOn": "2024-06-23T02:41:55",
    "Scopes": "publicData esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1 esi-universe.read_structures.v1 esi-ui.write_waypoint.v1 esi-fittings.read_fittings.v1 esi-fittings.write_fittings.v1 esi-location.read_online.v1 esi-clones.read_implants.v1 esi-characters.read_fatigue.v1",
    "TokenType": "Character",
    "CharacterOwnerHash": "CA2DmP2Dx3e72JLAV9pf+tGU4qU=",
    "IntellectualProperty": "EVE",
    "refresh_token": "MShhzOId22H_SGQzMcyMt3iu6w3om4vkkQ6dD6UAOBTusPVmz_98BcQ289QWtjEmtRp03aau6D6rfocqCYLO52HEgq-hLmcMRX-gfSdUVVA"
}
*/
function AddVerifiedCharacter(charaterInfo) {
    //if we have the character, replace


}

InitialzieCharactersFromCookies();