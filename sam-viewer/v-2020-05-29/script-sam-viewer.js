const version = "2020-05-29";

const urlJsonDefault =
  "https://cdn.jsdelivr.net/gh/hoarelea/sam-viewer@master/sam-sample-files/ThreeLevelsRotatedBoxes.JSON";

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

  HRT.initHeart();
}

SAM.onLoadSam = function(response) {
  panelsJson = response;
  console.log("panelsJson", panelsJson);

  selPanel.innerHTML = new Array(panelsJson.length)
    .fill()
    .map((panel, i) => `<option>${i} ${panelsJson[i].Name}</option>`);

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

SAM.getPanel = function(index) {
  const panel = panelsJson[index];
  //console.log( "panel", panel );
  const items = [];
  const holes = [];
  const v2 = (x, y) => new THREE.Vector2(x, y);

  //aperture
  if (panel.Apertures) {
    //console.log( "panel.Apertures", panel.Apertures );
    for (let aperture of panel.Apertures) {
      //console.log( "aperture", aperture );

      let vertices = [];

      SAM.getEdgeVertices(aperture.PlanarBoundary3D, vertices);
      //console.log("aperture vertices", vertices);

      const hole = new THREE.Path().setFromPoints(vertices);
      
      const color1 = SAM.colors[aperture.SAMType.ApertureType];
      let shape1 = SAM.getShape1(vertices, color1);
      
      const pN1 = aperture.PlanarBoundary3D.Plane.Normal;
      const normal1 = new THREE.Vector3(pN1.X, pN1.Y, pN1.Z);
      
      
  const pO1 = aperture.PlanarBoundary3D.Plane.Origin;
  const origin1 = new THREE.Vector3(pO1.X + (pN1.X * 0.1), pO1.Y + (pN1.Y * 0.1), pO1.Z + (pN1.Z * 0.1));      
      shape1.position.copy(origin1);
      
const pY1 = aperture.PlanarBoundary3D.Plane.AxisY;
  const axisY1 = new THREE.Vector3(pY1.X, pY1.Y, pY1.Z);
      shape1.up.copy(axisY1);
      
      

      shape1.lookAt(origin1.clone().add(normal1));
      items.push(shape1);

      //holes does  not work right now
      holes.push(hole);
    }
  }

  console.log("SAM.test", panel);

  let b3d = panel.PlanarBoundary3D;
  //console.log( "\n\nBoundary", b3d  );

  const pO = b3d.Plane.Origin;
  console.log("plane.origin", b3d.Plane.Origin);

  const origin = new THREE.Vector3(pO.X, pO.Y, pO.Z);
  //console.log( "origin", origin );

  const mesh = THR.addMesh(0.3);
  items.push(mesh);
  mesh.position.copy(origin);
  //console.log( "mesh", mesh );

  const pN = b3d.Plane.Normal;
  const normal = new THREE.Vector3(pN.X, pN.Y, pN.Z);
  //console.log("normal", normal);

  const pY = b3d.Plane.AxisY;
  const axisY = new THREE.Vector3(pY.X, pY.Y, pY.Z);

  //nraml on surface
  let line = SAM.getLine(
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

  //create arrow for normal
  let arrowHelper = new THREE.ArrowHelper(normal, origin, 1, 0x0000ff);
  items.push(arrowHelper);

  arrowHelper = new THREE.ArrowHelper(axisY, origin, 1, 0x00ff00);
  items.push(arrowHelper);
  //

  let vertices = []; // get this to Array.map

  //for Panels
  SAM.getEdgeVertices(b3d, vertices);
  console.log("PANEL vertices", vertices);

  const color = SAM.colors[panel.PanelType];
  //console.log( "color", color, panel.PanelType );

  let shape = SAM.getShape1(vertices, color);
  shape.position.copy(origin);
  shape.up.copy(axisY);
  shape.lookAt(origin.clone().add(normal));
  shape.userData.index = index;

  //shape.userData.panelsJson = panel;

  items.push(shape);

  //let shape1 = SAM.getShape(holes, 0x00ff00);
  //console.log("holes", holes);
  //items.push(shape1);

  //console.log("items", items);

  return items;
};

SAM.getLine = function(vertices, color = 0x000000) {
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices;

  const material = new THREE.LineBasicMaterial({ color: color });
  const line = new THREE.Line(geometry, material);

  return line;
};

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
///////////////////

//New Function Get Pint3d from Point2D for Panels and aperture 29.05.2020

/* started writingn new method
SAM.getPoint3Ds = function(Boundary3D, vertices) {
  
};

SAM.ConvertTo3D = function(point2D, normal, origin, axisY)
{
  if (point3D == null || normal == null || origin == null || axisY == null)
    return null;
  
  //const point = new THREE.Vector3(point3D.X, point3D.Y, point3D.Z);
  const normal_Temp = new THREE.Vector3(normal.X, normal.Y, normal.Z);
  const axisX = new THREE.Vector3(((axisY.Y * normal.Z) - (axisY.Z * normal.Y), (axisY.Z * normal.X) - (axisY.X * normal.Z), (axisY.X * normal.Y) - (axisY.Y * normal.X)));
  
  const u = new THREE.Vector3(axisX_Temp.X * point2D.X, axisX_Temp.Y * point2D.X, axisX_Temp.Z * point2D.X);
  
};

*/

/* C# tp JS
    public static partial class Query
    {
		public static Point3D Convert(this Point3D origin, Vector3D normal, Planar.Point2D point2D, Vector3D axisX = null)
		{
			if (normal == null || origin == null || point2D == null)
				return null;

			Vector3D normal_Temp = normal.Unit;
			Vector3D axisX_Temp = axisX;

			if (axisX_Temp == null)
			{
				if (normal_Temp.X == 0 && normal_Temp.Y == 0)
					normal_Temp = new Vector3D(1, 0, 0);
				else
					normal_Temp = new Vector3D(normal_Temp.Y, -normal_Temp.X, 0).Unit;
			}

			Vector3D axisY = new Vector3D((normal_Temp.Y * axisX_Temp.Z) - (normal_Temp.Z * axisX_Temp.Y), (normal_Temp.Z * axisX_Temp.X) - (normal_Temp.X * axisX_Temp.Z), (normal_Temp.X * axisX_Temp.Y) - (normal_Temp.Y * axisX_Temp.X));

			Vector3D u = new Vector3D(axisX_Temp.X * point2D.X, axisX_Temp.Y * point2D.X, axisX_Temp.Z * point2D.X);
			Vector3D v = new Vector3D(axisY.X * point2D.Y, axisY.Y * point2D.Y, axisY.Z * point2D.Y);

			return new Point3D(origin.X + u.X + v.X, origin.Y + u.Y + v.Y, origin.Z + u.Z + v.Z);
		}
    }

*/

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
