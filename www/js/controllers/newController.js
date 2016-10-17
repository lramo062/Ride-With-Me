angular.module('app').controller('newController', function($scope, $http, $ionicLoading, uberService, lyftService, markerService, controlService, mapService) {


    // Intialize our Map Service
    var Map = new mapService.Map();
    var Markers = new markerService.Markers(Map);
    var Control = new controlService.Control();


    // View will react to changes on the maps
    google.maps.event.addDomListener(window, 'load', function() {
	/*
	  Get Autocompletion in View
	  @params -> HTML input tags
	*/
	Map.linkFromAddress('user.address');
	Map.linkToAddress('user.destination');
        
	// Create Map Initialize at Current Position
	Map.getCurrentLocation().then((location) => {
            let options = {
		center: location,        // Centers at current location
		zoom: 17,                // Defaults to a zoom level of 17
                disableDefaultUI: true,
                mapTypeControlOptions: { // Changes the Map type control to the bottom
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },
		mapTypeId: google.maps.MapTypeId.ROADMAP // Defaults the Map type to ROAD MAP
	    };
	    Map.create('map', options, new google.maps.Geocoder, navigator);
            Markers.addCurrMarker(Map.getMap(),location);
            // Get and push the search bars into the google maps controls
            var searchBars = document.getElementById("searchBars");
            var prices = document.getElementById("prices");
            Map.getMap().controls[google.maps.ControlPosition.TOP_CENTER].push(searchBars);
            Map.getMap().controls[google.maps.ControlPosition.LEFT_BOTTOM].push(prices);

        });


	$scope.search = function() {

            // Grabs the location from HTML input tags
            Map.getFromLocation() 
                .then((response) => {

                    let location = {
                        lat:response.lat(),
                        lng:response.lng()
                    };

                    if(Markers.isUnique(location)) 
                        Markers.addMarker(Map.getMap(), location);
                    
                    else if(!Markers.isUnique(location) && Markers.getCount() == 2) 
                        Markers.addMarker(Map.getMap(), location);
                    
                    Map.fitBounds(Markers.getMarkers());
                    return Map.getToLocation();
                }).catch((err) => {
                    // Use current location (from is blank)
                    return Map.getToLocation();
                }).then((response2) => {

                    let location = {
                        lat:response2.lat(),
                        lng:response2.lng()
                    };
                    if(Markers.isUnique(location))
                        Markers.addMarker(Map.getMap(), location);
                    
                    else if(!Markers.isUnique(location) && Markers.getCount() == 2)
                        Markers.addMarker(Map.getMap(), location);
                    
                    Map.fitBounds(Markers.getMarkers());
                }).catch((err) => {
                    // MEANS DESTINATION IS NOT FILLED
                });
	};
        
        
	$scope.getPrice = function() {

	    // Hide the Map
	    //Map.hideMap();
            var _markers = Markers.getMarkers();
	    var startLat = _markers[0].getPosition().lat();
	    var startLng = _markers[0].getPosition().lng();
	    var finLat = _markers[1].getPosition().lat();
	    var finLng = _markers[1].getPosition().lng();

	    //   // call uberService
	    //   uberService.getPrices(startLat,startLng,finLat,finLng)
	    // .then((res) => {
	    //     console.log("uber: " + res);
	    // });

	    // call lyftService
	    lyftService.getPrices(startLat,startLng,finLat,finLng)
		.then((data) => {
                    for (x=0;x<data.length;x++)
                    {
                        if (data[x].ride_type == "lyft_line")
                        {
                            data[x].ride_type="Lyft Line";
                        }
                        if (data[x].ride_type == "lyft_plus")
                        {
                            data[x].ride_type="Lyft Plus"
                        }
                        if (data[x].ride_type== "lyft")
                        {
                            data[x].ride_type="Lyft";
                        }
                    }
                    $scope.res = data;
		})
	};


    });
});
