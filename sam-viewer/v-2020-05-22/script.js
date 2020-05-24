
aSource.href = "https://github.com/HoareLea/sam-viewer/";

svgOcticon = `<svg height="18" class="octicon" viewBox="0 0 16 16" version="1.1" width="18" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>`;
aSource.innerHTML = svgOcticon;


sTitle.innerHTML= document.title ? document.title : location.href.split( '/' ).pop().slice( 0, - 5 ).replace( /-/g, ' ' );
const version = document.head.querySelector( "[ name=version ]" );
sVersion.innerHTML = version ? version.content : "";
divDescription.innerHTML = document.head.querySelector( "[ name=description ]" ).content;

let json;
let group;

const v2 = ( x, y ) => new THREE.Vector2( x, y );

function init() {

    THR.init();
    THR.animate();

   const url = "../../sam-sample-files/TwoLevelsRevit.JSON";

    requestFile( url, onLoadSam );

}



function onLoadSam( response ) {

    json = response;
    console.log( "json", json );

	selPanel.innerHTML = new Array( json.length ).fill().map( ( item, i ) => `<option>${ i } ${ json[ i ].Name}</option>` );

	scene.remove( group );

	group = new THREE.Group();

    const panels = json.map( ( item, index ) => {

		const shape = getJsonLine( index );

		group.add( shape );
		
        return shape;

	} );

	scene.add( group );

    THR.zoomObjectBoundingSphere();
    
    RAY.intersectObjects = panels;

	RAY.addMouseMove();

}



function getJsonLine( index ) {

	item = json[ index ]

	ap = item.Apertures;

	if ( ap ) {

		//console.log( "ap", ap );

	}

	let b3d = item.PlanarBoundary3D;
	//console.log( "\n\nBoundary", b3d  );

	//b3d = json[ 0 ].PlanarBoundary3D;5

	const pO = b3d.Plane.Origin;
	//console.log( "plane.origin", b3d.Plane.Origin );

	const origin = new THREE.Vector3( pO.X, pO.Y, pO.Z );
	//console.log( "origin", origin );

	const mesh = THR.addMesh( 0.5 );
	mesh.position.copy( origin );
	//console.log( "mesh", mesh );

	const pN =  b3d.Plane.Normal;
	const normal = new THREE.Vector3( pN.X, pN.Y, pN.Z );
	//console.log( "normal", normal );

	const pX =  b3d.Plane.AxisX;
	const axisX = new THREE.Vector3( pX.X, pX.Y, pX.Z );

	let line = getLine( [ origin, origin.clone().add( normal ) ], "blue", origin, normal );
	group.add( line );

	line = getLine( [ origin, origin.clone().add( axisX ) ], "red", origin, normal );
	group.add( line );



	let vertices = [];

	let colors = [ "red", "green", "yellow", "blue" ];
	for ( let edge of b3d.Edge2DLoop.BoundaryEdge2Ds ) {

		//console.log( "edge", edge.Curve2D );

		const cO = edge.Curve2D.Origin;
		const cOV = new THREE.Vector3( cO.X, cO.Y, 0 );
		//console.log( "cO", cO.X, cO.Y );

		const cV = edge.Curve2D.Vector;
		const cVV = new THREE.Vector3( cO.X + cV.X, cO.Y + cV.Y, 0 );
		//console.log( "cV", cO.X + cV.X, cO.Y + cV.Y );

		let line = getLine( [ cOV, cVV ], colors.pop() );
		line.position.copy( origin );
		//line.up.copy( axisX ); 
		line.lookAt( origin.clone().add( normal ) );

		//group.add( line );

		vertices.push( v2( cVV.x, cVV.y ) );

	}
	//console.log( "vertices", vertices );
	
	let shape = getShape( vertices );
	shape.position.copy( origin );
	shape.up.copy(  axisX ); 

	shape.lookAt( origin.clone().add( normal ) );

	shape.userData.index = index;
	shape.userData.json = item;

	return shape;


}



function getLine( vertices, color = 0x000000 ) {

	const geometry = new THREE.Geometry();
	geometry.vertices = vertices;
	//geometry.applyMatrix4( new THREE.Matrix4().makeRotationZ( -0.5 * Math.PI ) );


	const material = new THREE.LineBasicMaterial( { color: color } );
	const line = new THREE.Line( geometry, material );

	return line;

}


function getShape( vertices ) {

	const shapeGeo = new THREE.Shape( vertices );
	const geometry = new THREE.ShapeGeometry( shapeGeo );
	geometry.applyMatrix4( new THREE.Matrix4().makeRotationZ( 0.5 * Math.PI ) );

	const material = new THREE.MeshNormalMaterial( { side: 2 } );
	const shape = new THREE.Mesh( geometry, material );
	shape.receiveShadow = true;
	shape.castShadow = true;

	return shape;

}


//////////

function showPanel() {

	scene.remove( group );
	
	group = new THREE.Group();
	
	const shape = getJsonLine( selPanel.selectedIndex );

	group.add( shape );

	scene.add( group );

    RAY.intersectObjects = [ shape ];
	
	setData( shape.userData.index );

}



function setData( index ) {

	const item = json[ index ];

	pO = item.PlanarBoundary3D.Plane.Origin;
	pN = item.PlanarBoundary3D.Plane.Normal;
	pX = item.PlanarBoundary3D.Plane.AxisX;

	edges = [];

	for ( let edge of item.PlanarBoundary3D.Edge2DLoop.BoundaryEdge2Ds ) {

		
		const cO = edge.Curve2D.Origin;
		//console.log( "eO", cO.X, cO.Y );

		const cV = edge.Curve2D.Vector;
		//console.log( "eV", cV.X, cV.Y );

		edges.push( `
		eO ${ cO.X.toLocaleString() }, ${ cO.Y.toLocaleString() }<br>
		eV ${ cV.X.toLocaleString() }, ${ cV.Y.toLocaleString() }<br><br>` );

	 }

	htm =

	`
	Origin:<br>${ pO.X.toLocaleString() }, ${ pO.Y.toLocaleString() }, ${ pO.Z.toLocaleString() }<br><br>
	Normal:<br>${ pN.X}, ${ pN.Y}, ${ pN.Z}<br><br>
	X-axis:<br>${ pX.X}, ${ pX.Y}, ${ pX.Z}<br><br>
	Edges:<br>${ edges.join( "")}
	`;


	divLog.innerHTML = htm;

}



RAY.getHtm = function ( intersected ) {

    //console.log( "intersected", intersected );

	const json = intersected.object.userData.json;

	//let htm = JSON.stringify( intersected.object.userData.json, null, "" );
	//console.log( "json", json );
	//htm = htm ? htm.replace( /,/g, ",<br>") : "&nbsp;";

	const apps = json.Apertures && json.Apertures.length ? json.Apertures.length : 0;
	const htm = `Name: ${ json.Name }<br>
	Type: ${ json.PanelType }<br>
	Apertures: ${ apps }`;
    
	setData( intersected.object.userData.index )

	return htm;

};


//////////




function requestFile( url, callback ) {

	const xhr = new XMLHttpRequest();
	xhr.open( 'GET', url, true );
	xhr.responseType = "json";
	xhr.onerror = ( xhr ) => console.log( 'error:', xhr  );
	//xhr.onprogress = ( xhr ) => console.log( 'bytes loaded:', xhr.loaded );
	xhr.onload = ( xhr ) => callback( xhr.target.response );
	xhr.send( null );

}