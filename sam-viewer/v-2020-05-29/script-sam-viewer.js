const version = "2020-05-29";

const urlJsonDefault =
  "https://cdn.jsdelivr.net/gh/hoarelea/sam-viewer@master/sam-sample-files/RoofFloorWall.JSON";

aGlitchHref = "https://glitch.com/~hoarelea-sam-viewer";

aGithubHref = "https://github.com/HoareLea/sam-viewer/";

const description = `
Online <a href="https://hoarelea.com/" target="_blank">Hoare Lea</a> Sustainable Analytical Model (SAM) JSON file interactive 3D viewer in your browser 
designed to be forked, hacked and remixed using the WebGL and the 
<a href="https://threejs.org" target="_blank">Three.js</a> JavaScript library
`;

//declare SAM
const SAM = {
  json: {},
  group: new THREE.Object3D()
};

SAM.colors = {
  Undefined: 0x808080,
  Ceiling: 0xff8080,
  CurtainWall: 0xffddad,
  Floor: 0xffff14,
  FloorExposed: 0x40b4ff,
  FloorInternal: 0x80ffff,
  FloorRaised: 0x4b417d,
  Roof: 0x800000,
  Shade: 0xffce9d,
  SlabOnGrade: 0x804000,
  SolarPanel: 0xe9967a,
  UndergroundCeiling: 0x408080,
  UndergroundSlab: 0x804000,
  UndergroundWall: 0xa55200,
  Wall: 0xff8c00,
  WallExternal: 0xffb400,
  WallInternal: 0x008000,
  Window: 0x0000ff
};

let timeStart;

function init() {
  timeStart = performance.now();

  aGlitch.href = aGlitchHref;

  aGithub.href = aGithubHref;

  divDescription.innerHTML = description;

  aTitle.innerHTML += ` ${version}`;

  //load THREE
  THR.init();

  THR.animate();

  requestFile(urlJsonDefault, SAM.onLoadSam);

  FRJ.init();

  //HRT.initHeart();
}

SAM.onLoadSam = function(response) {
  panelsJson = response;
  //console.log("panelsJson", panelsJson);

  selPanel.innerHTML = new Array(panelsJson.length)
    .fill()
    .map((panel, i) => `<option>${i} ${panelsJson[i].Name}</option>`);

  //clear debugging console
  console.clear();
  //take every object from item in array
  panels = panelsJson.flatMap((panel, index) => SAM.getPanel(index));

  //main scene 3D model
  SAM.setSceneNew(panels);

  //Java Tree view
  JTV.init();
  JTH.init();
  JTF.init();
};

SAM.setSceneNew = function(shapes = []) {
  scene.remove(SAM.group);

  SAM.group = new THREE.Group();

  SAM.group.add(...shapes);

  scene.add(SAM.group);

  THR.zoomObjectBoundingSphere(SAM.group);

  RAY.intersectObjects = shapes;

  RAY.addMouseMove();
};


//Main steps to create Panel
SAM.getPanel = function(index) {
  const panel = panelsJson[index];
  //console.log( "panel", panel );
  const items = [];
  //const holes = [];
  const v2 = (x, y) => new THREE.Vector2(x, y);
  //console.log("panel", panel);

  //aperture
  if (panel.Apertures) {
    //console.log( "panel.Apertures", panel.Apertures );
    for (let aperture of panel.Apertures) {
      //console.log( "aperture", aperture );
      //let vertices = [];

      //SAM.getEdgeVertices(aperture.PlanarBoundary3D, vertices);
      //console.log("aperture vertices", vertices);

      //const hole = new THREE.Path().setFromPoints(vertices);
      //const color1 = SAM.colors[aperture.SAMType.ApertureType];

      let mesh_Aperture = SAM.GetMeshFromAperture(aperture);
      //console.log("panel", panel);

      //let shape1 = SAM.getShape1(vertices, color1);

      //const pN1 = aperture.PlanarBoundary3D.Plane.Normal;
      //const normal1 = new THREE.Vector3(pN1.X, pN1.Y, pN1.Z);

      //const normal1 = SAM.GetNormal(aperture.PlanarBoundary3D);
      //const origin1 = SAM.GetOrigin(aperture.PlanarBoundary3D);
      //console.log( "Origin", origin1  );

      //const pO1 = aperture.PlanarBoundary3D.Plane.Origin;
      //const origin1 = new THREE.Vector3(pO1.X + (pN1.X * 0.1), pO1.Y + (pN1.Y * 0.1), pO1.Z + (pN1.Z * 0.1));
      //shape1.position.copy(origin1);

      //const pY1 = aperture.PlanarBoundary3D.Plane.AxisY;
      //const axisY1 = new THREE.Vector3(pY1.X, pY1.Y, pY1.Z);
      //shape1.up.copy(axisY1);
      //shape1.lookAt(origin1.clone().add(normal1));
      
      //push Aperture MD 2020-06.01
      items.push(mesh_Aperture);
      //console.log("Mesh Aperture", mesh_Aperture );

      //holes does  not work right now
      //holes.push(hole);
    }
  }
  
    var origin = SAM.GetOrigin(panel.PlanarBoundary3D);
    var axisY = SAM.GetAxisY(panel.PlanarBoundary3D);
    var normal = SAM.GetNormal(panel.PlanarBoundary3D);
    var centroid = SAM.GetCentroid(panel.PlanarBoundary3D);
    //console.log( "Panel Normal", normal);
  //console.log("SAM.test", panel);

  //let b3d = panel.PlanarBoundary3D;
  //console.log( "\n\nBoundary", b3d  );

  //const pO = b3d.Plane.Origin;
  //console.log("plane.origin", b3d.Plane.Origin);

  //const origin = new THREE.Vector3(pO.X, pO.Y, pO.Z);
  //console.log( "origin", origin );

  //var geometryCone = new THREE.ConeGeometry( 0.3, 0.5, 7 );
  var geometrySphere = new THREE.SphereGeometry( 0.2, 6,10);
  var mesh = new THREE.Mesh( geometrySphere );
  
  //const mesh = THR.addMesh(0.3);
  items.push(mesh);
  mesh.position.copy(centroid);
  //console.log( "mesh", mesh );

  //const pN = b3d.Plane.Normal;
  //const normal = new THREE.Vector3(pN.X, pN.Y, pN.Z);
  //console.log("normal", normal);

  //const pY = b3d.Plane.AxisY;
  //const axisY = new THREE.Vector3(pY.X, pY.Y, pY.Z);

  //normal on surface
  /*let line = SAM.getLine(
    [origin, origin.clone().add(normal)],
    "blue",
    origin,
    normal
  );
  items.push(line);

  line = SAM.getLine(
    [origin, origin.clone().add(axisY)],
    "red",
    origin,
    normal
  );
  */

  //---------------------------------------------------
  //Paenl create blue arrow for normal MD 2020-06-01
  //var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  let arrowHelper = new THREE.ArrowHelper(normal, centroid, 1, 0x0000ff);
  items.push(arrowHelper);

  //Panel create green arrow for axisX MD 2020-06-01
  arrowHelper = new THREE.ArrowHelper(axisY, centroid, 1, 0x00ff00);
  items.push(arrowHelper);
  //--------------------------------------------------

  //let vertices = []; // get this to Array.map

  //for Panels
  //SAM.getEdgeVertices(b3d, vertices);
  //console.log("PANEL vertices", vertices);

  //const color = SAM.colors[panel.PanelType];
  //console.log( "color", color, panel.PanelType );

  //-------------DELETE
  //let shape = SAM.getShape1(vertices, color);
  //shape.position.copy(origin);
  //shape.up.copy(axisY);
  //shape.lookAt(origin.clone().add(normal));
  //shape.userData.index = index;
  //-------------

  //shape.userData.panelsJson = panel;

  // when using let can not be accessed from outside the block {}
  //SAM.GetHolesFromAperture;
  let shape_Panel = SAM.GetMeshFromPanel(panel);
  shape_Panel.userData.index = index;
  //Push Panels
  //console.log("shape", shape);
  items.push(shape_Panel);

  //-------------DELETE
  //let shape1 = SAM.getShape(holes, 0x00ff00);
  //console.log("holes", holes);
  //items.push(shape1);
  //-------------

  return items;
  //console.log("items", items);
};

/* Old method to show scene global axis 
SAM.getLine = function(vertices, color = 0x000000) {
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices;

  const material = new THREE.LineBasicMaterial({ color: color });
  const line = new THREE.Line(geometry, material);

  return line;
};
*/

/* Old method
//Vertices for aperture
SAM.getEdgeVertices = function(boundary, vertices) {
  //const v2 = (x, y) => new THREE.Vector2(x, y);

  //let lineColors = ["red", "green", "yellow", "blue"];
  for (let edge of boundary.Edge2DLoop.BoundaryEdge2Ds) {
    //console.log( "edge", edge.Curve2D );

    const cO = edge.Curve2D.Origin;
    //const cO = boundary.Plane.Origin;
    const cOV = new THREE.Vector2(cO.X, cO.Y);
    //const cOV = new THREE.Vector3(cO.X, cO.Y, cO.Z);
    //console.log( "cO", cO.X, cO.Y );

    const cV = edge.Curve2D.Vector;
    const cVV = new THREE.Vector2(cO.X + cV.X, cO.Y + cV.Y);
    //console.log( "cV", cO.X + cV.X, cO.Y + cV.Y );

    // let line = getLine([cOV, cVV], lineColors.pop());
    // line.position.copy(origin);
    // line.up.copy( axisY );
    // line.lookAt(origin.clone().add(normal));
    // items.push(line);

    vertices.push(cVV);
  }
};
*/

///--------------------------------------------------------------///

//Gets Holes from SAM Aperture MD 2020-06-01
//SAM.GetHolesFromAperture = function(aperture) {
//  if (aperture == null || aperture.PlanarBoundary3D == null) return null;
//    let points = SAM.GetPoint2Ds(planarBoundary3D);
//    const hole = new THREE.Path(points);
//  return hole;
//};

//Gets Mesh from SAM Aperture
SAM.GetMeshFromAperture = function(aperture) {
  if (aperture == null || aperture.PlanarBoundary3D == null) return null;

  const color = SAM.colors[aperture.SAMType.ApertureType];

  return SAM.GetMeshFromPlanarBoundary3D(
    aperture.PlanarBoundary3D,
    null,
    color
  );
};

//Gest Mesh from SAM Panel
SAM.GetMeshFromPanel = function(panel) {
  if (panel == null || panel.PlanarBoundary3D == null) return null;

  var color = SAM.colors[panel.PanelType];

  var holes = [];
  if (panel.Apertures && panel.PlanarBoundary3D) {
    var planarBoundary3D = panel.PlanarBoundary3D;

    var origin_panel = SAM.GetOrigin(planarBoundary3D);
    var axisY_panel = SAM.GetAxisY(planarBoundary3D);
    var normal_panel = SAM.GetNormal(planarBoundary3D);

    for (let aperture of panel.Apertures) {
      //should be aperture.PlanarBoundary3D== null??
      if (aperture == null || aperture.PlanarBoundary3D == null) 
        continue;

      planarBoundary3D = aperture.PlanarBoundary3D;

      var origin_aperture = SAM.GetOrigin(planarBoundary3D);
      var axisY_aperture = SAM.GetAxisY(planarBoundary3D);
      var normal_aperture = SAM.GetNormal(planarBoundary3D);

      var points_aperture = SAM.GetPoint2Ds(planarBoundary3D);
      var points_panel = [];
      for (let point_aperture of points_aperture) {
        
        //console.log("Point2D Aperture", point_aperture);
        var point3D = SAM.ConvertTo3D(point_aperture, normal_aperture, origin_aperture, axisY_aperture);
        //console.log("Point3D", point3D);
        var point2D = SAM.ConvertTo2D(point3D, normal_panel, origin_panel, axisY_panel);
        //console.log("Point2D", point2D);
        points_panel.push(point2D);
        
      }
      //console.log("PointsA", points_panel);
      const hole = new THREE.Path().setFromPoints(points_panel);
      
      holes.push(hole);
      //console.log("hole", hole);
    }
  }

  return SAM.GetMeshFromPlanarBoundary3D(panel.PlanarBoundary3D, holes, color);
};

//Gets Mesh from SAM PlanarBoundary3D
SAM.GetMeshFromPlanarBoundary3D = function(planarBoundary3D, holes, color) {
  if (planarBoundary3D == null) return null;

  let points = SAM.GetPoint2Ds(planarBoundary3D);

  const shape = new THREE.Shape(points);

  if (holes != null && holes.length != 0) shape.holes = holes;

  const shapeGeometry = new THREE.ShapeGeometry(shape);

  const material = new THREE.MeshPhongMaterial({
    color: color,
    opacity: 0.85,
    side: 2,
    transparent: true
  });

  const mesh = new THREE.Mesh(shapeGeometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;

  //control display
  const origin = SAM.GetOrigin(planarBoundary3D);
  const axisY = SAM.GetAxisY(planarBoundary3D);
  const normal = SAM.GetNormal(planarBoundary3D);
  //const axisX = SAM.GetAxisX(planarBoundary3D);
  //console.log( "origin", origin );
  //console.log( "axisY", axisY );
  //console.log( "axisX", axisX );

  mesh.position.copy(origin);
  mesh.up.copy(axisY);
  //mesh.traverse();
  mesh.lookAt(origin.clone().add(normal));
  //Added fix
  mesh.rotateX(-Math.PI);
  mesh.rotateZ(Math.PI);

  return mesh;
};

//Gets 2D Points from SAM PlanarBoundary3D (as THREE.Vector2)
SAM.GetPoint2Ds = function(planarBoundary3D) {
  if (
    planarBoundary3D == null ||
    planarBoundary3D.Edge2DLoop == null ||
    planarBoundary3D.Edge2DLoop.BoundaryEdge2Ds == null
  )
    return null;

  const result = [];

  for (let edge of planarBoundary3D.Edge2DLoop.BoundaryEdge2Ds) {
    if (
      edge == null ||
      edge.Curve2D == null ||
      edge.Curve2D.Origin == null ||
      edge.Curve2D.Vector == null
    )
      continue;

    const origin = edge.Curve2D.Origin;
    const vector = edge.Curve2D.Vector;

    const point = new THREE.Vector2(origin.X + vector.X, origin.Y + vector.Y);

    result.push(point);
  }

  return result;
};

//Gets normal for SAM PlanarBoundary3D (as THREE.Vector3)
SAM.GetNormal = function(planarBoundary3D) {
  if (planarBoundary3D == null || planarBoundary3D.Plane == null) return null;

  const normal = planarBoundary3D.Plane.Normal;
  if (normal == null) return null;

  return SAM.Vector3DToVector3(normal);
};

//Gets origin for SAM PlanarBoundary3D (as THREE.Vector3)
SAM.GetOrigin = function(planarBoundary3D) {
  if (planarBoundary3D == null || planarBoundary3D.Plane == null) return null;

  const origin = planarBoundary3D.Plane.Origin;
  if (origin == null) return null;

  return SAM.Vector3DToVector3(origin);
};

//Gets axis Y for SAM PlanarBoundary3D (as THREE.Vector3)
SAM.GetAxisY = function(planarBoundary3D) {
  if (planarBoundary3D == null || planarBoundary3D.Plane == null) return null;

  const axisY = planarBoundary3D.Plane.AxisY;
  if (axisY == null) return null;

  return SAM.Vector3DToVector3(axisY);
};

//Gets axis Y for SAM PlanarBoundary3D (as THREE.Vector3)
SAM.GetAxisX = function(planarBoundary3D) {
  if (planarBoundary3D == null || planarBoundary3D.Plane == null) return null;

  const axisY = SAM.GetAxisY(planarBoundary3D);
  const normal = SAM.GetNormal(planarBoundary3D);

  return normal.cross(axisY);
};

//Converts Point 2D (THREE.Vector2) to Point 3D (THREE.Vector3) by given plane represented by normal (THREE.Vector3), origin (THREE.Vector3) and axisY (THREE.Vector3)
SAM.ConvertTo3D = function(point2D, normal, origin, axisY) {
  if (point2D == null || normal == null || origin == null || axisY == null)
    return null;

  let normal_Temp = normal.clone();
  normal_Temp.normalize();
  
  let axisY_Temp = axisY.clone();
  axisY_Temp.normalize();

  let axisX = normal_Temp.cross(axisY_Temp);
  
  //console.log("point2D", point2D);
  //console.log("normal", normal_Temp);
  //console.log("axisY", axisY_Temp);
  //console.log("axisX", axisX);
  //console.log("axisY_Temp.X * point2D.Y", axisY_Temp.y * point2D.y);

  let u = new THREE.Vector3(
    axisY_Temp.x * point2D.y,
    axisY_Temp.y * point2D.y,
    axisY_Temp.z * point2D.y
  );
  
    //console.log("u", u);
  
  let v = new THREE.Vector3(
    axisX.x * point2D.x,
    axisX.y * point2D.x,
    axisX.z * point2D.x
  );
  
  //console.log("v", v);

  return new THREE.Vector3(
    origin.x + u.x + v.x,
    origin.y + u.y + v.y,
    origin.z + u.z + v.z
  );
};

//Converts Point 3D (THREE.Vector3) to Point 2D (THREE.Vector2) by given plane represented by normal (THREE.Vector3), origin (THREE.Vector3) and axisY (THREE.Vector3)
SAM.ConvertTo2D = function(point3D, normal, origin, axisY) {
  if (point3D == null || normal == null || origin == null || axisY == null)
    return null;

  const normal_Temp = normal.clone();
  normal_Temp.normalize();

  const axisY_Temp = axisY.clone();
  axisY_Temp.normalize();

  const axisX = normal_Temp.cross(axisY_Temp);

  const vector = new THREE.Vector3(
    point3D.x - origin.x,
    point3D.y - origin.y,
    point3D.z - origin.z
  );

  return new THREE.Vector2(axisX.dot(vector), axisY_Temp.dot(vector));
};

//Converts SAM Point2D to Vector3 (THREE.Vector3)
SAM.Point2DToVector2 = function(point2D) {
  if (point2D == null) return null;

  return new THREE.Vector2(point2D.X, point2D.Y);
};

//Converts SAM Vector2D to Vector2 (THREE.Vector2)
SAM.Vector2DToVector2 = function(vector2D) {
  if (vector2D == null) return null;

  return new THREE.Vector2(vector2D.X, vector2D.Y);
};

//Converts SAM Vector3D to Vector3 (THREE.Vector3)
SAM.Vector3DToVector3 = function(vector3D) {
  if (vector3D == null) return null;

  return new THREE.Vector3(vector3D.X, vector3D.Y, vector3D.Z);
};

//Gets centroid of SAM PlanarBoundary3D
SAM.GetCentroid = function(planarBoundary3D){
  
  if(planarBoundary3D == null)
    return null;
  
  const origin = SAM.GetOrigin(planarBoundary3D);
  const axisY = SAM.GetAxisY(planarBoundary3D);
  const normal = SAM.GetNormal(planarBoundary3D);   
  
  let point2Ds = SAM.GetPoint2Ds(planarBoundary3D);
  if(point2Ds == null || point2Ds.length < 3)
    return null;
  
  let area = 0.0;
  let vector3D = new THREE.Vector3(0,0,0);
  
  let point3D_1 = SAM.ConvertTo3D(point2Ds[0], normal, origin, axisY);
  let point3D_2 = SAM.ConvertTo3D(point2Ds[1], normal, origin, axisY);
  
  for (let i = 2; i < point2Ds.length ; i++) {
    
    let point3D_3 = SAM.ConvertTo3D(point2Ds[i], normal, origin, axisY);
    
    let vector3D_1 = new THREE.Vector3(point3D_3.x - point3D_1.x, point3D_3.y - point3D_1.y, point3D_3.z - point3D_1.z);
    let vector3D_2 = new THREE.Vector3(point3D_3.x - point3D_2.x, point3D_3.y - point3D_2.y, point3D_3.z - point3D_2.z);
    
    let vector3D_3 = vector3D_1.cross(vector3D_2);
    let area_Temp = vector3D_3.length() / 2;
    
    vector3D.x += area_Temp * (point3D_1.x + point3D_2.x + point3D_3.x) / 3;
    vector3D.y += area_Temp * (point3D_1.y + point3D_2.y + point3D_3.y) / 3;
    vector3D.z += area_Temp * (point3D_1.z + point3D_2.z + point3D_3.z) / 3;
    
    area += area_Temp;
    point3D_2 = point3D_3;
  }
  
  if(area == 0)
    return null;
  
  return new THREE.Vector3(vector3D.x / area, vector3D.y / area, vector3D.z / area);
  
};

///--------------------------------------------------------------///

SAM.getShape = function(vertices, holes, color) {
  const shapeGeo = new THREE.Shape(vertices);
  shapeGeo.holes = holes;
  const geometry = new THREE.ShapeGeometry(shapeGeo);

  const material = new THREE.MeshPhongMaterial({
    color: color,
    opacity: 0.85,
    side: 2,
    transparent: true
  });
  const shape = new THREE.Mesh(geometry, material);
  shape.receiveShadow = true;
  shape.castShadow = true;

  return shape;
};

SAM.getShape1 = function(vertices, color) {
  const shapeGeo = new THREE.Shape(vertices);
  const geometry = new THREE.ShapeGeometry(shapeGeo);

  const material = new THREE.MeshPhongMaterial({
    color: color,
    opacity: 0.85,
    side: 2,
    transparent: true
  });
  const shape = new THREE.Mesh(geometry, material);
  shape.receiveShadow = true;
  shape.castShadow = true;

  return shape;
};

//////////

SAM.showPanel = function(index) {
  const shape = SAM.getPanel(index);

  SAM.setSceneNew(shape);
};

SAM.setData = function(index) {
  // no longer needed?
  const panel = panelsJson[index];

  const pO = panel.PlanarBoundary3D.Plane.Origin;
  const pN = panel.PlanarBoundary3D.Plane.Normal;
  const pY = panel.PlanarBoundary3D.Plane.AxisY;

  edges = [];

  for (let edge of panel.PlanarBoundary3D.Edge2DLoop.BoundaryEdge2Ds) {
    const cO = edge.Curve2D.Origin;
    //console.log( "eO", cO.X, cO.Y );

    const cV = edge.Curve2D.Vector;
    //console.log( "eV", cV.X, cV.Y );

    edges.push(`
		eO ${cO.X.toLocaleString()}, ${cO.Y.toLocaleString()}<br>
		eV ${cV.X.toLocaleString()}, ${cV.Y.toLocaleString()}<br><br>`);
  }

  /*htm = `
	Origin:<br>${pO.X.toLocaleString()}, ${pO.Y.toLocaleString()}, ${pO.Z.toLocaleString()}<br><br>
	Normal:<br>${pN.X}, ${pN.Y}, ${pN.Z}<br><br>
	Y-axis:<br>${pY.X}, ${pY.Y}, ${pY.Z}<br><br>
	Edges:<br>${edges.join("")}
	`;*/

  // divLog.innerHTML = htm;
};

RAY.getHtm = function(intersected) {
  //console.log( "intersected", intersected );

  const panelJson = panelsJson[intersected.object.userData.index];
  //console.log("panelJson", panelJson);

  //let htm = JSON.stringify( intersected.object.userData.panelsJson, null, "" );
  //htm = htm ? htm.replace( /,/g, ",<br>") : "&nbsp;";

  if (panelJson) {
    const apps =
      panelJson.Apertures && panelJson.Apertures.length
        ? panelJson.Apertures.length
        : 0;
    const htm = `Name: ${panelJson.Name}<br>
	Type: ${panelJson.PanelType}<br>
	//Apertures: ${apps}<br>
	//<button onclick=RAY.showFind(${intersected.object.userData.index}); >panel parameters</button>`;

    //SAM.setData(intersected.object.userData.index);

    return htm;
  }
};

RAY.showFind = function(index) {
  detNavMenu.open = true;
  detData.open = true;

  JTH.toggleAll();

  const details = JTVdivJsonTreeView.querySelectorAll("details");

  details[0].open = true;

  panelsHtml = Array.from(details[0].children).slice(1);

  panelsHtml[index].open = true;

  panelsHtml[index].scrollIntoView();
};

//////////

function requestFile(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onerror = xhr => console.log("error:", xhr);
  //xhr.onprogress = ( xhr ) => console.log( 'bytes loaded:', xhr.loaded );
  xhr.onload = xhr => callback(xhr.target.response);
  xhr.send(null);
}
