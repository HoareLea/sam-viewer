const version = "2020-05-25";

aGlitchHref = "https://glitch.com/~hoarelea-sam-viewer";

aGithubHref = "https://github.com/HoareLea/sam-viewer/";

const description = `
Online <a href="https://hoarelea.com/" target="_blank">Hoare Lea</a> Sustainable Analytical Model (SAM) JSON file interactive 3D viewer in your browser 
designed to be forked, hacked and remixed using the WebGL and the 
<a href="https://threejs.org" target="_blank">Three.js</a> JavaScript library
`;

let json;
let group;

const v2 = (x, y) => new THREE.Vector2(x, y);

const colors = {
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
	WallInternal: 0xffb400,
};

let timeStart;

function init() {
	timeStart = performance.now();

	aGlitch.href = aGlitchHref;

	aGithub.href = aGithubHref;

	divDescription.innerHTML = description;

	aTitle.innerHTML += ` ${version}`;

	THR.init();

	THR.animate();

	const url = "../../sam-sample-files/TwoLevelsRevit.JSON";

	requestFile(url, onLoadSam);

	FRJ.init();

	HRT.initHeart();
}

function setSceneNew(shapes = []) {
	scene.remove(group);

	group = new THREE.Group();

	group.add(...shapes);

	scene.add(group);

	THR.zoomObjectBoundingSphere();

	RAY.intersectObjects = shapes;

	RAY.addMouseMove();
}

function onLoadSam(response) {
	panelsJson = response;
	console.log("panelsJson", panelsJson);

	selPanel.innerHTML = new Array(panelsJson.length).fill().map((panel, i) => `<option>${i} ${panelsJson[i].Name}</option>`);

	const panels = panelsJson.map((panel, index) => getPanel(index));

	setSceneNew(panels);

	JTVdivJsonTree.innerHTML = JTV.parseJson(JTV.root, panelsJson, 0);
}

function getPanel(index) {
	const panel = panelsJson[index];

	const items = [];
	const holes = [];

	if (panel.Apertures) {
		//console.log( "panel.Apertures", panel.Apertures );
		for (let aperture of panel.Apertures) {
			//console.log( "aperture", aperture );

			let vertices = [];

			let colors = ["red", "green", "yellow", "blue"];
			for (let edge of aperture.PlanarBoundary3D.Edge2DLoop.BoundaryEdge2Ds) {
				//console.log( "edge", edge.Curve2D );

				const cO = edge.Curve2D.Origin;
				const cOV = new THREE.Vector3(cO.X, cO.Y, 0);
				//console.log( "cO", cO.X, cO.Y );

				const cV = edge.Curve2D.Vector;
				const cVV = new THREE.Vector3(cO.X + cV.X, cO.Y + cV.Y, 0);
				//console.log( "cV", cO.X + cV.X, cO.Y + cV.Y );

				let line = getLine([cOV, cVV], colors.pop());
				//line.position.copy(origin);
				//line.up.copy( axisY );
				//line.lookAt(origin.clone().add(normal));

				items.push(line);

				vertices.push(v2(cVV.x, cVV.y));
			}

			const hole = new THREE.Path().setFromPoints(vertices);

			holes.push(hole);

			//console.log( "vertices", vertices );
		}
	}

	let b3d = panel.PlanarBoundary3D;
	//console.log( "\n\nBoundary", b3d  );

	//b3d = panelsJson[ 0 ].PlanarBoundary3D;5

	const pO = b3d.Plane.Origin;
	//console.log( "plane.origin", b3d.Plane.Origin );

	const origin = new THREE.Vector3(pO.X, pO.Y, pO.Z);
	//console.log( "origin", origin );

	const mesh = THR.addMesh(0.5);
	items.push(mesh);
	mesh.position.copy(origin);
	//console.log( "mesh", mesh );

	const pN = b3d.Plane.Normal;
	const normal = new THREE.Vector3(pN.X, pN.Y, pN.Z);
	//console.log( "normal", normal );

	const pY = b3d.Plane.AxisY;
	const axisY = new THREE.Vector3(pY.X, pY.Y, pY.Z);

	let line = getLine([origin, origin.clone().add(normal)], "blue", origin, normal);
	items.push(line);

	line = getLine([origin, origin.clone().add(axisY)], "red", origin, normal);
	items.push(line);

	let vertices = [];

	//let colors = ["red", "green", "yellow", "blue"];
	for (let edge of b3d.Edge2DLoop.BoundaryEdge2Ds) {
		//console.log( "edge", edge.Curve2D );

		const cO = edge.Curve2D.Origin;
		const cOV = new THREE.Vector3(cO.X, cO.Y, 0);
		//console.log( "cO", cO.X, cO.Y );

		const cV = edge.Curve2D.Vector;
		const cVV = new THREE.Vector3(cO.X + cV.X, cO.Y + cV.Y, 0);
		//console.log( "cV", cO.X + cV.X, cO.Y + cV.Y );

		// let line = getLine([cOV, cVV], colors.pop());
		// line.position.copy(origin);
		// //line.up.copy( axisY );
		// line.lookAt(origin.clone().add(normal));

		//group.add( line );

		vertices.push(v2(cVV.x, cVV.y));
	}
	//console.log( "vertices", vertices );

	const color = colors[panel.PanelType];
	//console.log( "color", color, panel.PanelType );

	let shape = getShape(vertices, holes, color);
	shape.position.copy(origin);
	shape.up.copy(axisY);

	shape.lookAt(origin.clone().add(normal));

	shape.userData.index = index;
	shape.userData.panelsJson = panel;

	return shape;
}

function getLine(vertices, color = 0x000000) {
	const geometry = new THREE.Geometry();
	geometry.vertices = vertices;
	//geometry.applyMatrix4( new THREE.Matrix4().makeRotationZ( -0.5 * Math.PI ) );

	const material = new THREE.LineBasicMaterial({ color: color });
	const line = new THREE.Line(geometry, material);

	return line;
}

function getShape(vertices, holes, color) {
	const shapeGeo = new THREE.Shape(vertices);
	shapeGeo.holes = holes;
	const geometry = new THREE.ShapeGeometry(shapeGeo);
	//geometry.applyMatrix4(new THREE.Matrix4().makeRotationZ(0.5 * Math.PI));

	const material = new THREE.MeshPhongMaterial({ color: color, opacity: 0.85, side: 2, transparent: true });
	const shape = new THREE.Mesh(geometry, material);
	shape.receiveShadow = true;
	shape.castShadow = true;

	return shape;
}

//////////

function showPanel() {
	const shape = getPanel(selPanel.selectedIndex);

	setSceneNew([shape]);
}

function setData(index) {
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

	htm = `
	Origin:<br>${pO.X.toLocaleString()}, ${pO.Y.toLocaleString()}, ${pO.Z.toLocaleString()}<br><br>
	Normal:<br>${pN.X}, ${pN.Y}, ${pN.Z}<br><br>
	X-axis:<br>${pY.X}, ${pY.Y}, ${pY.Z}<br><br>
	Edges:<br>${edges.join("")}
	`;

	divLog.innerHTML = htm;
}

RAY.getHtm = function (intersected) {
	//console.log( "intersected", intersected );

	const panelsJson = intersected.object.userData.panelsJson;

	//let htm = JSON.stringify( intersected.object.userData.panelsJson, null, "" );
	//console.log( "panelsJson", panelsJson );
	//htm = htm ? htm.replace( /,/g, ",<br>") : "&nbsp;";

	const apps = panelsJson.Apertures && panelsJson.Apertures.length ? panelsJson.Apertures.length : 0;
	const htm = `Name: ${panelsJson.Name}<br>
	Type: ${panelsJson.PanelType}<br>
	Apertures: ${apps}`;

	setData(intersected.object.userData.index);

	return htm;
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
