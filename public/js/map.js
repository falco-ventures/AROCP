
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
window.scene = null;
var SPS = null;
var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender != null) {

            // SPS.setParticles();
            sceneToRender.render();

        }
    });
}

var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); }
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

function create_selection_sphere(name) {
    if (gSelectionSphere != null) {
        gSelectionSphere.dispose();
        gSelectionPlane.dispose();
    }
    var sphere = BABYLON.MeshBuilder.CreateSphere("SelectionSphere", { diameter: 0.0001, segments: 32 }, g3DScene);
    var plane = BABYLON.MeshBuilder.CreatePlane("SelectionPlane", { width: 0.0020, height: 0.003 }, g3DScene);
    var planeMaterial = new BABYLON.StandardMaterial("SelectionMaterial", g3DScene);
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("SelectionTexture", { width: 512, height: 256 }, g3DScene);
    planeTexture.getContext();
    planeTexture.hasAlpha = true;
    planeTexture.drawText(name, 0, 100, "bold 44px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
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

function create_hover_sphere(name) {
    var sphere = BABYLON.MeshBuilder.CreateSphere("HoverSphere", { diameter: 0.0001, segments: 32 }, g3DScene);
    sphere.isPickable = false;
    var sphereMaterial = new BABYLON.StandardMaterial("SphereMaterial", g3DScene);
    sphereMaterial.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    sphere.material = sphereMaterial


    var plane = BABYLON.MeshBuilder.CreatePlane("HoverPlane", { width: 0.005, height: 0.0025 }, g3DScene);
    plane.isPickable = false;
    var planeMaterial = new BABYLON.StandardMaterial("HoverMaterial", g3DScene);
    var planeTexture = BABYLON.DynamicTexture = new BABYLON.DynamicTexture("HoverTexture", { width: 512, height: 256 }, g3DScene);
    planeTexture.getContext();
    planeTexture.hasAlpha = true;
    var label = name;

    planeTexture.drawText(label, 0, 200, "bold 44px Arial", "white", "transparent", true, true);

    planeMaterial.backFaceCulling = false;
    planeMaterial.disableLighting = true;
    planeMaterial.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
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

function hover_callback() {
    var galaxyName = this.innerHTML;
    var galaxyData = universe[galaxyName];
    var label = galaxyName;
    var selectedGalaxyData = universe[gSelectedGalaxy];
    // gUniverseScale = gJitaCenter[0] / (universe["Jita"].position.x);
    if (galaxyData != undefined && selectedGalaxyData != undefined) {
        var dx = (galaxyData.position.x - selectedGalaxyData.position.x);
        var dy = (galaxyData.position.y - selectedGalaxyData.position.y);
        var dz = (galaxyData.position.z - selectedGalaxyData.position.z);
        var distance = Math.sqrt(dx * dx + dy * dy + dz * dz) / metersPerAu;
        label = galaxyName + " " + distance + " from " + selectedGalaxyData.name;
    }
    gHoverPlaneTexture.clear();
    gHoverPlaneTexture.drawText(label, 0, 54, "bold 44px Arial", "white", "transparent", true, true);
    gHoverSphere.position.x = gScale * galaxyData.position.x / gUniverseScale;
    gHoverSphere.position.y = gScale * galaxyData.position.y / gUniverseScale;
    gHoverSphere.position.z = gScale * galaxyData.position.z / gUniverseScale;

    gHoverPlane.position.x = gHoverSphere.position.x;
    gHoverPlane.position.y = gHoverSphere.position.y;
    gHoverPlane.position.z = gHoverSphere.position.z;

    gHoverPlane.material.opacityTexture = gHoverPlaneTexture
    gHoverPlane.material.diffuseTexture = gHoverPlaneTexture
}

function click_callback() {
    // console.log("click");

    gSelectedGalaxy = "";
    //hover_callback();

    var galaxyName = this.innerHTML;
    var galaxyData = universe[galaxyName];
    gSelectedGalaxy = galaxyName;

    create_selection_sphere(galaxyName);

    gSelectionSphere.position.x = gScale * galaxyData.position.x / gUniverseScale;
    gSelectionSphere.position.y = gScale * galaxyData.position.y / gUniverseScale;
    gSelectionSphere.position.z = gScale * galaxyData.position.z / gUniverseScale;

    gSelectionPlane.position.x = gSelectionSphere.position.x;
    gSelectionPlane.position.y = gSelectionSphere.position.y;
    gSelectionPlane.position.z = gSelectionSphere.position.z;

    gCamera.position.x = gSelectionSphere.position.x;
    gCamera.position.y = gSelectionSphere.position.y;
    gCamera.position.z = gSelectionSphere.position.z - 0.01;

    gCamera.setTarget(new BABYLON.Vector3(gSelectionSphere.position.x, gSelectionSphere.position.y, gSelectionSphere.position.z));
}
var pcs;
function vecToLocal(vector, mesh) {
    var m = mesh.getWorldMatrix();
    var v = BABYLON.Vector3.TransformCoordinates(vector, m);
    return v;
}

function mousemovef() {
    // var origin = gCamera.position;

    // var forward = new BABYLON.Vector3(0, 0, 1);
    // forward = vecToLocal(forward, pcs);

    // var direction = forward.subtract(origin);
    // direction = BABYLON.Vector3.Normalize(direction);

    // var ray = new BABYLON.Ray(origin, direction, length);
    // // var pickResult = window.scene.pick(window.scene.pointerX, window.scene.pointerY);
    // var pickResult = window.scene.pickWithRay(ray);
    // console.log(pickResult)
}


BABYLON.AbstractMesh.prototype.addPickingBox = function () {
    var _this = this;
    if (!_this || _this._picking_box !== undefined) return;


    var bounds = _this.getBoundingInfo().boundingBox.extendSize.clone();
    bounds = bounds.multiplyByFloats(10, 10, 10);

    _this._picking_box = BABYLON.Mesh.CreateBox('pBox', 1, g3DScene);
    _this._picking_box.scaling = bounds.clone();
    _this._picking_box.parent = _this;
    _this._picking_box.visibility = 0.25; //0.0001;
    _this._picking_box.__isPickingBox = true;

    _this.isPickable = false;
    return _this;
};
var createScene = async function (universe) {
    // if(gInitialized == false) {
    //     gInitialized = true;
    //     return;
    // }

    gUniverse = new Object();
    if (sceneToRender != null)
        return null;
    var scene = new BABYLON.Scene(engine);
    var black = [0, 0, 0];
    scene.clearColor = new BABYLON.Color4(128, 128, 128, 0);
    // scene.clearColor = [128,128,128];

    // Create camera and light
    // var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(0, 0, 0), scene);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0.07, 0.07, 1, new BABYLON.Vector3(0, 0, 0), scene);
    camera.wheelPrecision = 100;
    camera.attachControl(canvas, true);

    camera.minZ = 0.0001;
    camera.maxZ = 100;
    gCamera = camera;

    gNavigatorCamera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1.5, new BABYLON.Vector3(0, 0, 0), scene);

    gNavigatorCamera.minZ = 0.0001;
    gNavigatorCamera.maxZ = 1000;
    gNavigatorCamera.viewport = new BABYLON.Viewport(0, 0.8, 0.2, 0.2);
    scene.activeCameras.push(camera);
    scene.activeCameras.push(gNavigatorCamera);



    scene.onPointerMove = function () {
        mousemovef();
    };

    BABYLON.RegisterMaterialPlugin("SizeAttenuation", (material) => {
        material.sizeAttenuationPlugin = new SizeAttenuationMaterialPlugin(material);
        return material.colorify;
    });

    var keys = Object.keys(universe);
    keys.sort();

    var pcs = null;
    // pcs = new BABYLON.PointsCloudSystem("pcs", 10, scene);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    const light2 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, -1, 0), scene);
    var showPoints = true;
    var poly = null;

    if (showPoints) {
        pcs = new BABYLON.PointsCloudSystem("pcs", 30, scene);
    } else {

        //const sphere = BABYLON.MeshBuilder.CreateSphere("s", {});
        var poly = BABYLON.MeshBuilder.CreateBox("system0", { size: 0.1, isPickable: true }, scene);
        // poly.addPickingBox();
        // var sphereMaterial = new BABYLON.StandardMaterial("SphereMaterial", scene);
        // sphereMaterial.backFaceCulling = false;
        // sphereMaterial.disableLighting = true;
        // // sphereMaterial.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        // poly.material = sphereMaterial
        // *** Create a lookup of initial indicies to particles
        gMeshes.push(poly);
    }
    let particleIndLookup = {};

    const insideColor = BABYLON.Color3.FromHexString("#888888");
    const outsideColor = BABYLON.Color3.FromHexString("#888888");

    // var numPoints = points.length;

    const positions = [];
    const colors = [];
    const sizes = [];
    var bands = [[[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], []]];


    create_selection_sphere("Jita");
    create_hover_sphere("Jita");
    for (var i = 0; i < keys.length; ++i) {
        // for (var galaxy in universe) {
        var galaxy = keys[i];
        var galaxyName = universe[galaxy].name;
        // if(galaxyName == undefined || !galaxyName.includes("NGC"))
        //      continue;

        universe[galaxyName] = universe[galaxy];
        let x = gScale * universe[galaxy].position.x;
        let y = gScale * universe[galaxy].position.y;
        let z = gScale * universe[galaxy].position.z;
        let security = universe[galaxy].security_status;
        let magnitude = 500;
        var purple = [1, 0, 1];
        var blue = [0, 0, 1];
        var cyan = [0, 1, 1];
        var green = [0, 1, 0];
        var yellow = [1, 1, 0];
        var orange = [1, 0.5, 0];
        var red = [1, 0.6, 0.6];
        var darkRed = [1, 0.2, 0.2];

        var color = black;
        var band = 0;
        var octant = 0;
        if (x > 0) {
            if (y > 0) {
                if (z > 0) {
                    octant = 1;
                } else {
                    octant = 2;
                }
            } else {
                if (z > 0) {
                    octant = 3;
                } else {
                    octant = 4;
                }
            }
        } else {
            if (y > 0) {
                if (z > 0) {
                    octant = 5;
                } else {
                    octant = 6;
                }
            } else {
                if (z > 0) {
                    octant = 7;
                } else {
                    octant = 8;
                }
            }
        }
        var systemType = "unknown";

        if (universe[galaxyName].system_id < 31000000) {

            if (security <= 0.0) {
                systemType = "nullsec";
            } else if (security < 0.5) {
                systemType = "losec";
            } else {
                systemType = "hisec";
            }
        }
        else if (universe[galaxyName].system_id > 31000000 &&
            universe[galaxyName].system_id < 32000000) {
            if (galaxyName[1] == '0') {
                systemType = "shatteredwormhole"
            } else {
                systemType = "wormhole";
            }
        }
        else if (universe[galaxyName].system_id > 32000000 &&
            universe[galaxyName].system_id < 33000000) {
            systemType = "adspace";
        }
        else if (universe[galaxyName].system_id > 34000000 &&
            universe[galaxyName].system_id < 35000000) {
            systemType = "vspace";
        }

        if (security <= 0.1) {
            color = darkRed;
            band = 0;
        } else if (security <= 0.2) {
            color = darkRed;
            band = 1;
        } else if (security <= 0.3) {
            color = red;
            band = 2;
        } else if (red <= 0.4) {
            color = red;
            band = 3;
        } else if (security <= 0.5) {
            color = yellow;
            band = 4;
        } else if (security <= 0.6) {
            color = cyan;
            band = 5;
        } else if (security <= 0.7) {
            color = green;
            band = 6;
        } else {
            color = blue;
            band = 7;
        }
        if (octant) {
            bands[band][octant - 1] = universe[galaxy];
        }
        if (document.getElementById(universe[galaxy].name) == null) {
            var range = band + 1;
            var elementID = systemType;
            var ul = document.getElementById(elementID);
            var li = document.createElement("li");
            var textNode = document.createTextNode(universe[galaxy].name);
            li.appendChild(textNode);
            li.addEventListener("mouseover", hover_callback);
            li.addEventListener("mousedown", click_callback);
            ul.appendChild(li);
        }
        // if (universe[galaxyName].system_id < 31000000) {
        positions.push(new BABYLON.Vector3(x, y, z));
        sizes.push(new BABYLON.Vector3(magnitude, magnitude, magnitude));

        const babylonColor = new BABYLON.Color3(color[0], color[1], color[2]);
        colors.push(BABYLON.Color4.FromColor3(babylonColor, 1));
        // }
        // *** Add to our lookup of initial indicies to particles

    }
    for (let p = 0; p < positions.length; p++) {
        var position = positions[p];
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


    if (showPoints) {
        pcs.addPoints(positions.length, (particle, i) => {
            particle.position.x = positions[i].x / gUniverseScale;
            particle.position.y = positions[i].y / gUniverseScale;
            particle.position.z = positions[i].z / gUniverseScale;
            particle.color = colors[i];
            particle.scale = sizes[i];
        });
        await pcs.buildMeshAsync();
        pcs.mesh.material.sizeAttenuationPlugin.isEnabled = true;
    } else {
        for (let p = 0; p < colors.length; p++) {
            var particle;
            if (p == 0) {
                particle = gMeshes[p];
            } else {
                particle = poly.clone("system" + p);
                gMeshes.push(particle);
            }

            particle.position = positions[p];
            var sphereMaterial = new BABYLON.StandardMaterial("material" + p, g3DScene);
            sphereMaterial.diffuseColor = colors[p];
            particle.material = sphereMaterial
            // particle.material.emissiveColor = colors[p];

            particle.scale = sizes[p];
            particle.id = p;
            particleIndLookup[particle._ind] = particle;
        }
    }

    g3DScene = scene;
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

    scene.onPointerDown = (evt, pickInfo) => {
        var pickResult = g3DScene.pick(g3DScene.pointerX, g3DScene.pointerY);
        var pickResult = g3DScene.pickWithRay(g3DScene.activeCamera.getForwardRay(800));
        // const pickPartInfo = SPS.pickedParticle(pickInfo);
        if (pickResult.hit) {
            console.log("Picked!")
            console.log(pickResult);
            // const pickPart = SPS.particles[pickPartInfo.idx];
            // console.log(pickPart);
            // const projPos = BABYLON.Vector3.Project(
            //     pickPart.position,
            //     BABYLON.Matrix.Identity(),
            //     camera.getTransformationMatrix(),
            //     { x: 0, y: 0, width: canvas.width, height: canvas.height });
            // console.log('screen pos', projPos);
            // const can = document.querySelector("#renderCanvas");
            // dot.style.left = (projPos.x + can.getBoundingClientRect().left).toFixed(0) + "px";
            // dot.style.top = (projPos.y + can.getBoundingClientRect().top).toFixed(0) + "px";
        }
    }
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
        window.engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        window.scene = createScene(data);
        startRenderLoop(engine, canvas);
    };
    initFunction().then(() => {
        scene.then(returnedScene => { sceneToRender = returnedScene; });
    });

    // window.initFunction();

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
};