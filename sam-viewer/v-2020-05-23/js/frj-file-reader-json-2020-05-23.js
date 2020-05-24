

const FRJ = {};

FRJ.init = function () {


    divNavMenuFile.innerHTML = 
    `
<p>
<input type=file id=FRJinpFile onchange=FRJ.openFile(this);  >
</p>

<p id=FRJpStats ></p>
`

}



FRJ.openFile = function ( files ) {

	FRJ.timeStart = performance.now();

	if ( files.files[ 0 ].name.toLowerCase().endsWith( ".zip" ) ) {

		FRJ.files = files;

		FO.url = files.files[ 0 ].name;
		FO.data = files.files[ 0 ];

		//console.log( 'FO.data', FO.data );

		//txtArea.innerHTML = reader.result.slice( 0, 1000 );

		FRJpStats.innerHTML = "";

		event = new Event( "onloadFile", { "bubbles": true, "cancelable": false, detail: true } );

		window.addEventListener( "onloadFile", FRJ.onLoad, false );

		window.dispatchEvent( event );

	} else {

		const reader = new FileReader();
		reader.onload = ( event ) => {

			FRJ.files = files;
			FRJ.result = reader.result;

			FO.url = files.files[ 0 ].name;
			//FO.data = files.files[ 0 ];
			FO.data =  reader.result;
			//FRJ.onLoad();

			FRJ.event = new Event( "onloadFile", {"bubbles": true, "cancelable": false, detail: true } );

			window.addEventListener( "onloadFile", FRJ.onLoad, false );

			window.dispatchEvent( FRJ.event );

		};

		reader.readAsText( files.files[ 0 ] );

	}


};
