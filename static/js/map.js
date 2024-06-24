
/*
map
*/

var gHoverPlaneTexture;
var gHoverSphere;
var gHoverPlane;
var gSelectionPlaneTexture;
var gSelectionSphere;
var gSelectionPlane;
var gCamera;
var gNavigatorCamera;
var gMeshes = new Array();

var canvas = document.getElementById("renderCanvas");
var engine = null;
var sceneToRender = null;
var pcs;

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender != null) {

            sceneToRender.render();

        }
    });
}
function Get3DScene() {
    return sceneToRender;
}
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); }



function create_character_sphere(character) {

    var sphere = BABYLON.MeshBuilder.CreateSphere("WormholeSphere", { diameter: 0.5, segments: 32 }, Get3DScene());

    sphere.material = new BABYLON.StandardMaterial("SphereMaterial", Get3DScene());
    sphere.material.backFaceCulling = false;
    sphere.material.disableLighting = true;
    sphere.material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    
    var plane = BABYLON.MeshBuilder.CreatePlane("SelectionPlane", { width: 20, height: 10 }, Get3DScene());
    var planeMaterial = new BABYLON.StandardMaterial("SelectionMaterial", Get3DScene());
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("SelectionTexture", { width: 512, height: 256 }, Get3DScene());
    planeTexture.getContext();
    planeTexture.hasAlpha = true;
    
    var ctx = planeTexture.getContext();
    ctx.font = "bold 44px Arial";
    const textWidth = ctx.measureText(character.CharacterName).width;
    var x = (512 - textWidth)/2;

    planeTexture.drawText(character.CharacterName, x, 256, "bold 44px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    planeMaterial.diffuseTexture = planeTexture;
    planeMaterial.opacityTexture = planeTexture;

    plane.material = planeMaterial;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    sphere.position = Get3DPositionFromSystem(character.system);

    plane.position.x = sphere.position.x;
    plane.position.y = sphere.position.y + 10;
    plane.position.z = sphere.position.z;
}
function create_selection_sphere(name) {
    if (gSelectionSphere != null) {
        gSelectionSphere.dispose();
        gSelectionPlane.dispose();
    }
    var sphere = BABYLON.MeshBuilder.CreateSphere("SelectionSphere", { diameter: 0.5, segments: 32 }, Get3DScene());

    sphere.material = new BABYLON.StandardMaterial("SphereMaterial", Get3DScene());
    sphere.material.backFaceCulling = false;
    sphere.material.disableLighting = true;
    sphere.material.emissiveColor = new BABYLON.Color3(0, 1.0, 0);
    
    var plane = BABYLON.MeshBuilder.CreatePlane("SelectionPlane", { width: 20, height: 10 }, Get3DScene());
    var planeMaterial = new BABYLON.StandardMaterial("SelectionMaterial", Get3DScene());
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("SelectionTexture", { width: 512, height: 256 }, Get3DScene());
    planeTexture.getContext();
    planeTexture.hasAlpha = true;
    
    var ctx = planeTexture.getContext();
    ctx.font = "bold 44px Arial";
    const textWidth = ctx.measureText(name).width;
    var x = (512 - textWidth)/2;

    planeTexture.drawText(name, x, 256, "bold 44px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
    planeMaterial.diffuseTexture = planeTexture;
    planeMaterial.opacityTexture = planeTexture;

    plane.material = planeMaterial;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // plane.position.x += 0;
    // plane.position.y += 0.5;

    gSelectionSphere = sphere;
    gSelectionPlane = plane;
    gSelectionPlaneTexture = planeTexture;
    gSelectionPlaneTexture.visible = true;
}


function create_wormhole_sphere(system) {

    var sphere = BABYLON.MeshBuilder.CreateSphere("WormholeSphere", { diameter: 0.5, segments: 32 }, Get3DScene());

    sphere.material = new BABYLON.StandardMaterial("SphereMaterial", Get3DScene());
    sphere.material.backFaceCulling = false;
    sphere.material.disableLighting = true;
    sphere.material.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    
    var plane = BABYLON.MeshBuilder.CreatePlane("SelectionPlane", { width: 20, height: 10 }, Get3DScene());
    var planeMaterial = new BABYLON.StandardMaterial("SelectionMaterial", Get3DScene());
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("SelectionTexture", { width: 512, height: 256 }, Get3DScene());
    planeTexture.getContext();
    planeTexture.hasAlpha = true;
    
    var ctx = planeTexture.getContext();
    ctx.font = "bold 44px Arial";
    const textWidth = ctx.measureText(name).width;
    var x = (512 - textWidth)/2;

    planeTexture.drawText(system.name, x, 256, "bold 44px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    planeMaterial.diffuseTexture = planeTexture;
    planeMaterial.opacityTexture = planeTexture;

    plane.material = planeMaterial;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    sphere.position = Get3DPositionFromSystem(system);

    plane.position.x = sphere.position.x;
    plane.position.y = sphere.position.y + 5.25;
    plane.position.z = sphere.position.z;
}

function create_hover_sphere(name) {
    var sphere = BABYLON.MeshBuilder.CreateSphere("HoverSphere", { diameter: 0.5, segments: 32 }, Get3DScene());
    // sphere.isPickable = false;
    
    sphere.material = new BABYLON.StandardMaterial("SphereMaterial2", Get3DScene());
    sphere.material.backFaceCulling = false;
    sphere.material.disableLighting = true;
    sphere.material.emissiveColor = new BABYLON.Color3(1.0, 0, 0);


    var plane = BABYLON.MeshBuilder.CreatePlane("HoverPlane", { width: 20, height: 10 }, Get3DScene());
    plane.isPickable = false;
    var planeMaterial = new BABYLON.StandardMaterial("HoverMaterial", Get3DScene());
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("HoverTexture", { width: 512, height: 256 }, Get3DScene());
    ;
    planeTexture.hasAlpha = true;
    var label = name;
    var ctx = planeTexture.getContext();
    ctx.font = "bold 44px Arial";
    const textWidth = ctx.measureText(label).width;
    var x = (512 - textWidth)/2;
    planeTexture.drawText(label, x, 256, "bold 44px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(1.0, 0, 0);
    planeMaterial.diffuseTexture = planeTexture;
    planeMaterial.opacityTexture = planeTexture;

    plane.material = planeMaterial;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    // plane.position.x += 0;
    // plane.position.y += 0.75;

    gHoverSphere = sphere;
    gHoverPlane = plane;
    gHoverPlaneTexture = planeTexture;
}

function create_region_sphere(region) {
    var sphere = BABYLON.MeshBuilder.CreateSphere("RegionSphere", { diameter: 0.5, segments: 32 }, Get3DScene());
    // sphere.isPickable = false;
    
    sphere.material = new BABYLON.StandardMaterial("SphereMaterial2", Get3DScene());
    sphere.material.backFaceCulling = false;
    sphere.material.disableLighting = true;
    sphere.material.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);


    var plane = BABYLON.MeshBuilder.CreatePlane("HoverPlane", { width: 20, height: 10 }, Get3DScene());
    plane.isPickable = false;
    var planeMaterial = new BABYLON.StandardMaterial("HoverMaterial", Get3DScene());
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("HoverTexture", { width: 512, height: 256 }, Get3DScene());
    ;
    planeTexture.hasAlpha = true;
    var label = region.name;
    var ctx = planeTexture.getContext();
    ctx.font = "bold 44px Arial";
    const textWidth = ctx.measureText(label).width;
    var x = (512 - textWidth)/2;
    planeTexture.drawText(label, x, 256, "bold 32px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(0.5,0.5,0.5,0.5);
    planeMaterial.diffuseTexture = planeTexture;
    planeMaterial.opacityTexture = planeTexture;

    plane.material = planeMaterial;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    
    
    sphere.position = Get3DPositionFromRegion(region);

    plane.position.x = sphere.position.x;
    plane.position.y = sphere.position.y + 10;
    plane.position.z = sphere.position.z;
}

function create_gate_lines(myLines, myColors) {
	const linesystem = BABYLON.MeshBuilder.CreateLineSystem("linesystem", {lines: myLines, colors:myColors}); 
    return linesystem;
}

function vecToLocal(vector, mesh) {
    var m = mesh.getWorldMatrix();
    var v = BABYLON.Vector3.TransformCoordinates(vector, m);
    return v;
}

function mousemovef() {
    }


BABYLON.AbstractMesh.prototype.addPickingBox = function () {
    var _this = this;
    if (!_this || _this._picking_box !== undefined) return;


    var bounds = _this.getBoundingInfo().boundingBox.extendSize.clone();
    bounds = bounds.multiplyByFloats(10, 10, 10);

    _this._picking_box = BABYLON.Mesh.CreateBox('pBox', 1, Get3DScene());
    _this._picking_box.scaling = bounds.clone();
    _this._picking_box.parent = _this;
    _this._picking_box.visibility = 0.25; //0.0001;
    _this._picking_box.__isPickingBox = true;

    _this.isPickable = false;
    return _this;
};
var createScene = async function (systems_json) {
    if (sceneToRender != null)
        return null;

    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0,0,0,1);

    //Main camera
    var camera = new BABYLON.ArcRotateCamera("Camera",
        0, 0, 350,
        new BABYLON.Vector3(0, 0, 0),
        scene);
    camera.wheelPrecision = 1;
    camera.attachControl(canvas, true);

    camera.minZ = 0.001;
    camera.maxZ = 10000;
    scene.activeCameras.push(camera);
    gCamera = camera;

    //Nav Window camera
    gNavigatorCamera = new BABYLON.ArcRotateCamera("Nav Camera",
        0, 0, 350,
        new BABYLON.Vector3(0, 0, 0),
        scene);
    gNavigatorCamera.minZ = 0.001;
    gNavigatorCamera.maxZ = 10000;
    gNavigatorCamera.viewport = new BABYLON.Viewport(0, 0.8, 0.2, 0.2);
    scene.activeCameras.push(gNavigatorCamera);

    //Register size attenuator
    BABYLON.RegisterMaterialPlugin("SizeAttenuation", (material) => {
        material.sizeAttenuationPlugin = new SizeAttenuationMaterialPlugin(material);
        return material.colorify;
    });

    //Add the points
    for (const space_name in gUniverse) {
        pcs = gUniverse[space_name].pcs;

        var keys = Object.keys(gUniverse[space_name].systems);
        pcs.addPoints(keys.length, (particle, i) => {
            var system = keys[i];
            
            particle.position = Get3DPositionFromSystem(gUniverse[space_name].systems[system])
            particle.color = gUniverse[space_name].systems[system].color;
        });
        await pcs.buildMeshAsync();
        pcs.mesh.material.sizeAttenuationPlugin.isEnabled = true;
    }
    
    create_hover_sphere("Thera");
    select_system("Thera")
    hover_system("None");

    var keys = Object.keys(gRegions);
    keys.sort();
    for (var i = 0; i < keys.length; ++i) {
        var region = gRegions[keys[i]];
        create_region_sphere(region);

    }
    //Mouse
    scene.onPointerMove = function () {
        mousemovef();
    };
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                console.log("POINTER DOWN");
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                console.log("POINTER UP");
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                console.log("POINTER MOVE");
                break;
            case BABYLON.PointerEventTypes.POINTERWHEEL:
                console.log("POINTER WHEEL");
                break;
            case BABYLON.PointerEventTypes.POINTERPICK:
                console.log("POINTER PICK");
                break;
            case BABYLON.PointerEventTypes.POINTERTAP:
                console.log("POINTER TAP");
                break;
            case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                console.log("POINTER DOUBLE-TAP");
                break;
        }

        if (pointerInfo._pickInfo.hit) {
            console.log("Picked!")
            console.log(pointerInfo._pickInfo);
        }
    });

    gInitialized = true;
    return scene;
}

class SizeAttenuationMaterialPlugin extends BABYLON.MaterialPluginBase {

    sizeAttenuation = 1.05;

    get isEnabled() {
        return this._isEnabled;
    }

    set isEnabled(enabled) {
        if (this._isEnabled === enabled) {
            return;
        }
        this._isEnabled = enabled;
        this.markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    _isEnabled = false;

    constructor(material) {
        super(material, "SizeAttenuation", 1, { "SIZEATTENUATION": 1 });
    }

    prepareDefines(defines, scene, mesh) {
        defines.SIZEATTENUATION = this._isEnabled;
    }

    getUniforms() {
        return {
            "ubo": [
                { name: "sizeAttenuation", size: 1, type: "float" },
            ],
            "vertex":
                `#ifdef SIZEATTENUATION
                        uniform float sizeAttenuation;
                    #endif`,
        };
    }

    bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
        if (this._isEnabled) {
            uniformBuffer.updateFloat("sizeAttenuation", this.sizeAttenuation);
        }
    }

    getClassName() {
        return "SizeAttenuationMaterialPlugin";
    }

    getCustomCode(shaderType) {
        return shaderType === "vertex" ? {
            "CUSTOM_VERTEX_MAIN_END": `
                    #ifdef SIZEATTENUATION
                        gl_PointSize = pointSize * (sizeAttenuation - (gl_Position.z / gl_Position.w * 0.5 + 0.5));
                    #endif
                `,
        } : null;
    }
}

function startApplication(data) {
    window.initFunction = async function () {
        var asyncEngineCreation = async function () {
            try {
                return createDefaultEngine();
            } catch (e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                return createDefaultEngine();
            }
        }

        engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        InitializeUniverse(data);
        InitializeMenus(data);
        g3DScene = createScene(data);
        startRenderLoop(engine, canvas);
    };
    initFunction().then(() => {
        g3DScene.then(returnedScene => { sceneToRender = returnedScene; });
    });

    // window.initFunction();

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
};