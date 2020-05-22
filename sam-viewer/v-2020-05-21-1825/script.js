
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

    url = "../../sam-sample-files/TwoLevelsRevit.JSON";

    requestFile( url, onLoadSam );



}



function onLoadSam( response ) {

    json = JSON.parse( response );
    console.log( "json", json );

	scene.remove( group );

	group = new THREE.Group();

	

    panels = [];

	json.forEach( ( item, index ) => {


		shape = getJsonLine( index );

        group.add( shape );
        panels.push( shape );

	} );

	scene.add( group )

    THR.zoomObjectBoundingSphere();
    
    RAY.intersectObjects = panels;

	RAY.addMouseMove();

}


function showPanel() {

	index = selPanel.selectedIndex;

	scene.remove( group );

	group = new THREE.Group();

    panels = [];

	shape = getJsonLine( index );

	group.add( shape );

	panels.push( shape );

	scene.add( group );

    RAY.intersectObjects = panels;
	
	setData( shape.userData.index );

	//console.log( "", data );

}


function setData( index ) {


	item = json[ index ];

	pO = item.PlanarBoundary3D.Plane.Origin;
	pN = item.PlanarBoundary3D.Plane.Normal;

	edges = [];

	for ( let edge of item.PlanarBoundary3D.Edge2DLoop.BoundaryEdge2Ds ) {


		const cO = edge.Curve2D.Origin;
		console.log( "eO", cO.X, cO.Y );

		const cV = edge.Curve2D.Vector;
		console.log( "eV", cV.X, cV.Y );

		edges.push( `eO ${ cO.X} ${ cO.Y }<br>eV ${ cV.X} ${ cV.Y }<br><br>` );

	 }

	htm =

	`
	Origin:<br>${ pO.X} ${ pO.Y} ${ pO.Z}<br><br>
	Normal:<br>${ pN.X} ${ pN.Y} ${ pN.Z}<br><br>
	Edges:<br>${ edges.join( "")}
	`;

	divLog.innerHTML = htm;

}

function getJsonLine( index ) {

	item = json[ index ]

	ap = item.Apertures;

	if ( ap ) {

		//console.log( "ap", ap );

	}

	let b3d = item.PlanarBoundary3D;
	console.log( "\n\nBoundary", b3d  );

	//b3d = json[ 0 ].PlanarBoundary3D;5

	const pO = b3d.Plane.Origin;
	//console.log( "plane.origin", b3d.Plane.Origin );
	const origin = new THREE.Vector3( pO.X, pO.Y, pO.Z );
	//console.log( "origin", origin );

	const mesh = addMesh( 0.5 );
	mesh.position.copy( origin );
	//console.log( "mesh", mesh );

	const nO =  b3d.Plane.Normal;
	const normal = new THREE.Vector3( nO.X, nO.Y, nO.Z );
	//console.log( "normal", normal );

	let line = getLine( [ origin, origin.clone().add( normal ) ], "red", origin, normal );
	group.add( line )



	let vertices = [];

	// for ( let edge of b3d.Edge2DLoop.BoundaryEdge2Ds ) {

	// 	//console.log( "edge", edge.Curve2D );

	// 	const cO = edge.Curve2D.Origin;
	// 	const cOV = new THREE.Vector3( cO.X, cO.Y, 0 );
	// 	console.log( "cO", cO );

	// 	const cV = edge.Curve2D.Vector;
	// 	const cVV = new THREE.Vector3( cO.X + cV.X, cO.Y + cV.Y, 0 );
	// 	//console.log( "cVV", cVV );

	// 	let line = getLine( [ cOV, cVV ], "black", origin, normal );
	// 	line.position.copy( origin );
	// 	line.lookAt( origin.clone().add( normal ) );

	// 	group.add( line );

	// 	vertices.push( v2( cVV.x, cVV.y ) );

	// }


	let colors = [ "red", "green", "yellow", "blue" ];
	for ( let edge of b3d.Edge2DLoop.BoundaryEdge2Ds ) {

		//console.log( "edge", edge.Curve2D );

		const cO = edge.Curve2D.Origin;
		const cOV = new THREE.Vector3( cO.X, cO.Y, 0 );
		//console.log( "cO", cO.X, cO.Y );

		const cV = edge.Curve2D.Vector;
		const cVV = new THREE.Vector3( cO.X + cV.X, cO.Y + cV.Y, 0 );
		console.log( "cV", cO.X + cV.X, cO.Y + cV.Y );

		let line = getLine( [ cOV, cVV ], colors.pop(), origin, normal );
		line.position.copy( origin );
		line.lookAt( origin.clone().add( normal ) );

		group.add( line );

		vertices.push( v2( cVV.x, cVV.y ) );

	}
	//console.log( "vertices", vertices );

	//verticesFix = [ vertices[ 0 ], vertices[ 1 ], vertices[ 1 ], vertices[ 3 ] ];
	
	let shape = getShape( vertices, origin, normal );
	//let shape = getShape( vertices );
	//shape.position.copy( origin );
	//shape.lookAt( origin.clone().add( normal ) );

	shape.userData.index = index;
	shape.userData.json = item;

	return shape;


}



function addMesh( size = 20 ) {

	// CylinderGeometry( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded )
	// SphereGeometry( radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength )
	// TorusGeometry( radius, tube, radialSegments, tubularSegments, arc )

	const geometry = new THREE.BoxGeometry( size, size, size );

	// geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( -0.5 * Math.PI ) );
	// geometry.applyMatrix4( new THREE.Matrix4().makeScale( 1, 1, 1 ) );
	// geometry.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );

	const material = new THREE.MeshNormalMaterial();
	//const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random(), specular: 0xffffff } );
	mesh = new THREE.Mesh( geometry, material );
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	
	group.add( mesh );

	return mesh;

}




function getLine( vertices, color = 0x000000, position, normal ) {

	const geometry = new THREE.Geometry();
	geometry.vertices = vertices;


	// const scale = new THREE.Vector3( 1, 1, 1 );
	// const quaternion = new THREE.Quaternion().setFromUnitVectors( new THREE.Vector3( 0, 0, 1), normal );
	// const matrix = new THREE.Matrix4().compose( position, quaternion, scale );
	// console.log( "n q ", normal, quaternion ); 
	// //geometry.applyMatrix4( matrix );

	const material = new THREE.LineBasicMaterial( { color: color } );
	line = new THREE.Line( geometry, material );

	return line;

}



function getShape( vertices, position = new THREE.Vector3(), normal = new THREE.Vector3( 0, 0, 1), 
	scale = new THREE.Vector3( 1, 1, 1 ) ) {

	console.log( "normal",normal, position );
	const shapeGeo = new THREE.Shape( vertices );
	const geometry = new THREE.ShapeGeometry( shapeGeo );

	const quaternion = new THREE.Quaternion().setFromUnitVectors( new THREE.Vector3( 0, 0, 1 ), normal );
	const matrix = new THREE.Matrix4().compose( position, quaternion, scale );
	geometry.applyMatrix4( matrix );
	//console.log( "n q ", normal, quaternion );  

	const material = new THREE.MeshNormalMaterial( { side: 2 } );
	const shape = new THREE.Mesh( geometry, material );
	return shape;

}





function requestFile( url, callback ) {

	const xhr = new XMLHttpRequest();
	xhr.open( 'GET', url, true );
	xhr.onerror = ( xhr ) => console.log( 'error:', xhr  );
	//xhr.onprogress = ( xhr ) => console.log( 'bytes loaded:', xhr.loaded );
	xhr.onload = ( xhr ) => callback( xhr.target.response );
	xhr.send( null );

}


RAY.getHtm = function ( intersected ) {

    //console.log( "intersected", intersected );

    let htm = JSON.stringify( intersected.object.userData.json, null, "" )
    
	htm = htm ? htm.replace( /,/g, ",<br>") : "&nbsp;";
	
	setData( intersected.object.userData.index )

	return htm;

};