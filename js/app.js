/*jshint esversion: 6 */
// KNOCKOUT
// ViewModel
var vm = {
  userDefLocation: ko.observable(""), // keeps track of the location entered in the search bar.
  coffeeShops: ko.observableArray([]), // stores markers/info for all coffee shops from foursquare
  hipsterShops: ko.observableArray([]), // stores markers/info for only the shops that make it past the hipster filter
  tempArray: ko.observableArray([]), // this array is used to hold the original version of coffeeShops when distance filter is used
  hipsterToggle: ko.observable(false), // tracks if hipster mode is on or off; Default: off meaning all shops display.
  distanceCalled: ko.observable(false), // track if the distance filter has been called so it won't be called back to back
  sortHipsterArray() {
    // removes any instances of known chains with gross coffee.
    this.hipsterShops(this.coffeeShops().slice()); //copies all objects in the coffeeShops array over to hipsterShops
    // remove instances of the coffee shops that don't belong
    this.hipsterShops.remove(function(shop) {
      return shop.title.includes("The Coffee Bean");
    });
    this.hipsterShops.remove(function(shop) {
      return shop.title.includes("Coffee Bean");
    });
    this.hipsterShops.remove(function(shop) {
      return shop.title.includes("Starbuck");
    });
    this.hipsterShops.remove(function(shop) {
      return shop.title.includes("Peet");
    });
    this.hipsterShops.remove(function(shop) {
      return shop.isChain;
    });
  },
  hipsterify() { // toggles hipster mode and calls a sort of the hipster array
    this.hipsterToggle(true); // turns hipster mode on officially
    this.sortHipsterArray();
  },
  unhipsterify() { //turns hipster mode off
    this.hipsterToggle(false);
  },
  walkingDistance() { // filters out any shops over 1 mile away
    if (this.distanceCalled() === false) { // checks to see if this is a back-to-back call to walkingDistance()
      this.tempArray(this.coffeeShops().slice()); // copies the original coffeeShops() array and stores it all
      this.coffeeShops.remove(function(item) { // remove any values with distances over 1610 meters (~1mi)
        return item.distance > 1610;
      });
      this.sortHipsterArray(); // call a sort to hipsterShops now that coffeeShops has been changed
    }
    this.distanceCalled(true); // toggle on distanceCalled so this won't run twice in a row
  },
  anyDistance() { // resets coffeeShops to show all markers
    if (this.distanceCalled() === true) { // since walkingDistance is on, let's undo the filter now and reset it:
      this.coffeeShops(this.tempArray().slice()); // copies the tempArray back over to coffeeShops, restoring it to original
      this.sortHipsterArray(); // re-sort hipsterShops array now that coffeeShops has changed back to original
      this.tempArray.removeAll(); // clear tempArray incase we change locations
      this.distanceCalled(false); //
    }
  }
};

// Create new binding for animation utilizing jquery for the slideDown and fadeOut effects. This solution was found
// on the knockoutjs examples page: (http://knockoutjs.com/examples/animatedTransitions.html). I just changed the
// transitions out for the ones I needed. Ultimately this transition is used to slide the thug glasses down for hipster mode.
ko.bindingHandlers.fadeVisible = {
  init: function(element, valueAccessor) {
    // Initially set the element to be instantly visible/hidden depending on the value
    var value = valueAccessor();
    $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
  },
  update: function(element, valueAccessor) {
    // Whenever the value subsequently changes, slowly fade the element in or out
    var value = valueAccessor();
    ko.unwrap(value) ? $(element).slideDown(1000) : $(element).fadeOut(1000);
  }
};

// initialize bindings for knockout:
ko.applyBindings(vm);

// MAPS
// create global instances of maps variables:
var map, currentPos, updatedLoc, userLoc, foursquare, url, marker, mapCenterMarker, bounds;

// foursquare info to be used for url in ajax later on.
var client_id = 'IECW1ZSMEZ5QD15TXZWC5E1MPEXATEBUHIAEQPO005CZUEDK';
var client_secret = 'W1VA2ZRDWKZ3CXPNBEPH2C15XZB3104BF1OHHBWTJ4H5WNSO';

// map styles for the cool greyscale-ish look, found on snazzymaps.com
var styles = [{
  stylers: [{
    saturation: -100
  }, {
    gamma: 1
  }]
}, {
  elementType: "labels.text.stroke",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "poi.business",
  elementType: "labels.text",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "poi.business",
  elementType: "labels.icon",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "poi.place_of_worship",
  elementType: "labels.text",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "poi.place_of_worship",
  elementType: "labels.icon",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "road",
  elementType: "geometry",
  stylers: [{
    visibility: "simplified"
  }]
}, {
  featureType: "water",
  stylers: [{
    visibility: "on"
  }, {
    saturation: 50
  }, {
    gamma: 0
  }, {
    hue: "#50a5d1"
  }]
}, {
  featureType: "administrative.neighborhood",
  elementType: "labels.text.fill",
  stylers: [{
    color: "#333333"
  }]
}, {
  featureType: "road.local",
  elementType: "labels.text",
  stylers: [{
    weight: 0.5
  }, {
    color: "#333333"
  }]
}, {
  featureType: "transit.station",
  elementType: "labels.icon",
  stylers: [{
    gamma: 1
  }, {
    saturation: 50
  }]
}];

// map initialization:
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      "lat": 34.0522342,
      "lng": -118.2436849
    }, // default if geolocation isn't supported, center is DTLA.
    zoom: 11,
    styles: styles, // apply styles
    draggable: false, // so we don't accidentally drag away from the current location, especially on mobile.
    scrollwheel: false // no accidental zooms when scrolling.
  });
  createMapCenterMarker();
  findMe();
} // closing initMap() function

function mapsLoadError() {
  window.alert("Google Maps could not be loaded.");
}

function findMe() {
  // geolocation to set map center to the device's current location. If failed, alerts user and defaults to LA.
  mapCenterMarker.setVisible(false); // hide marker on initial call while geolocate runs
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(currentPos); // sets map center to the device location
        mapCenterMarker.setPosition(currentPos); // set the position of the single marker to avoid duplicates
        mapCenterMarker.setVisible(true); // make marker visibile
        vm.distanceCalled(false); // resets the distanceCalled param since all shops are being reloaded
        resetMarkers(); // call stack that deletes all current markers, updates the shops with current map center and fills arrays
      },
      function() {
        // Error retrieving location
        console.log("Geolocation ran but failed.");
        window.alert("Geolocation failed, so I sent you to LA. Search your location to see results near you!");
        resetMarkers(); // same function as above, except the default location in LA will be used in updateShops function
        mapCenterMarker.setVisible(true); // make marker visibile
      });
  } else {
    // Browser doesn't support Geolocation
    console.log("Geolocation is not supported in browser so it failed.");
    window.alert("Geolocation is disabled in your browser, so I sent you to LA. Search your location to see results near you!");
    resetMarkers(); // same function as above, except the default location in LA will be used in updateShops function
    mapCenterMarker.setVisible(true); // make marker visibile
  }
}

function createMapCenterMarker() { // creates a map center marker to help quanitfy the distance
  mapCenterMarker = new google.maps.Marker({
    position: {
      lat: map.center.lat(),
      lng: map.center.lng()
    },
    title: "You are here.",
    map: map,
    visible: false, // hide marker on map load
    distance: 0,
    animation: google.maps.Animation.DROP,
    icon: makeMarkerIcon('9fff82'),
    id: "Map Center"
  });

  var contentString = '<div class="content">' +
    '<p><span class="title">' + mapCenterMarker.title + '</span></p></div>';

  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  mapCenterMarker.addListener('mouseover', function() {
    mapCenterMarker.setAnimation(google.maps.Animation.BOUNCE);
    infowindow.open(map, mapCenterMarker);
  });

  mapCenterMarker.addListener('mouseout', function() {
    setTimeout(function() {
      mapCenterMarker.setAnimation(google.maps.Animation.null);
    }, 750);
    infowindow.close();
  });
}

function createFSQMarkerList(link) {
  // ajax call to retrieve foursquare data:
  $.getJSON(link, function(data) {
    foursquare = data.response.venues; // only store the venues data from the JSON's returned.
    if (foursquare.length === 0) {
      window.alert("There's no coffee here! Try somewhere else.");
    }
    // style markers, took this from the course on google api :) I liked their custom markers
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // initialize new InfoWindow object & bounds param
    var largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // loop used to create markers and infowindows for each shop in the foursquare ajax call data
    for (var i = 0; i < foursquare.length; i++) {
      var fslat = foursquare[i].location.lat;
      var fslng = foursquare[i].location.lng;
      var chain;
      // if a foursquare location is a chain, there is an id attached to the venueChains array
      // I use this array to label locations as chains or not, then filter chains out in hipster mode.
      if (foursquare[i].venueChains.length > 0) {
        chain = true;
      } else {
        chain = false;
      }
      marker = new google.maps.Marker({
        position: {
          lat: fslat,
          lng: fslng
        },
        title: foursquare[i].name,
        map: map,
        isChain: chain,
        distance: foursquare[i].location.distance,
        venueId: foursquare[i].id,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      });

      // Tip from reviewer: helps keep the markers in the window during a screen resize.
      google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
      });

      // needed to create event listener so I could trigger click events on and off map. Solution found:
      // (http://stackoverflow.com/questions/18333679/google-maps-open-info-window-after-click-on-a-link)
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          var chainDisplay;
          // checks if the marker is associated with a chain and displays the appropriate response.
          if (marker.isChain) {
            chainDisplay = '<span class="text-danger">This location is a chain.</span>';
          } else {
            chainDisplay = '<span class="text-success">Hipster Approved. #DrinkLocal</span>';
          }
          var contentString = '<div class="content">' +
            '<p><span class="title">' + marker.title + '</span>' +
            '<br />' + chainDisplay +
            '<br />' + 'You are ' + distanceConversion(marker.distance) + ' miles away.' +
            '<br /> <a class="fsq-link" href="http://foursquare.com/v/' + marker.venueId +
            '" target="_blank">See on Foursquare</a></p>' +
            '</div>';
          largeInfowindow.setContent(contentString);
          largeInfowindow.open(map, marker);
          marker.setIcon(highlightedIcon); // highlighted icon displayed on click
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            // returns to default marker after 1.5 seconds
            marker.setAnimation(null);
            marker.setIcon(defaultIcon);
          }, 1500);
        };
      })(marker, i));

      // once the marker is created above (with the listener added) push the marker into coffeeShops array
      vm.coffeeShops.push(marker);
      // if hipster mode is active, call hipsterfy() so not all results are shown
      if (vm.hipsterToggle() === true) {
        vm.hipsterify();
      }

      // creates listeners for mouse function to show various icons.
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
      // sets map bounds to show all markers
      bounds.extend(vm.coffeeShops()[i].position);
      map.fitBounds(bounds);
    } // close loop
  }).fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    window.alert("Foursquare request failed, please check your location or credentials.");
    console.log("Request Failed: " + err);
  }); // close ajax call
} // close createFSQMarkerList() function

// function from the Google Maps API course:
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34)
  );
  return markerImage;
}

// converts meters to miles (rounded to tenths), used to display distance away from current location.
function distanceConversion(meters) {
  return Math.round((meters * 0.000621371) * 10) / 10;
}

// Handle marker deletion for updated locations, code from google documentation:
// (https://developers.google.com/maps/documentation/javascript/examples/marker-remove),
// sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < vm.coffeeShops().length; i++) {
    vm.coffeeShops()[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  vm.coffeeShops.removeAll();
  vm.hipsterShops.removeAll();
}

// activates the map for the markers in the hipsterShops array so they display on the map
function setHipsterMarkers() {
  for (var i = 0; i < vm.hipsterShops().length; i++) {
    vm.hipsterShops()[i].setMap(map);
  }
}

// activates the map for the markers in the coffeeShops array so all shops display on the map
function setAllMarkers() {
  for (var i = 0; i < vm.coffeeShops().length; i++) {
    vm.coffeeShops()[i].setMap(map);
  }
}

// call stack to reset the markers if the map center changes
function resetMarkers() {
  deleteMarkers();
  updateShops();
  //setAllMarkers();
}

// function called when the search bar is used to change location, resets map center using geocoding api
function changeMapCenter() {
  deleteMarkers(); // clear markers out of both arrays since they will change.
  var geocoder = new google.maps.Geocoder(); // new geocoder instance
  var address = vm.userDefLocation(); // retreive address from te search bar
  // run geocode:
  geocoder.geocode({
    address: address
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      newCenter = results[0].geometry.location;
      map.setCenter(newCenter);
      map.setZoom(12);
      mapCenterMarker.setPosition(newCenter);
    } else {
      // if error thrown, alerts user
      window.alert("location could not be found, try another one!");
    }
  });
  // Need to run updateShops() once the map has loaded and the new map center has been established
  // Needed to find when map load has finished, found solution online using the map 'idle' throw.
  // map idle solution found on stack overflow: (http://stackoverflow.com/questions/832692/how-can-i-check-whether-google-maps-is-fully-loaded)
  google.maps.event.addListenerOnce(map, 'idle', function() {
    updateShops();
  });
}

// updates the url for the foursquare ajax call, calls createFSQMarkerList to retrieve new data
function updateShops() {
  // update the request:
  url = "https://api.foursquare.com/v2/venues/search\?" +
    "client_id=" + client_id +
    "&client_secret=" + client_secret +
    "&v=20170406" +
    "&ll=" + map.getCenter().lat().toString() + "," + map.getCenter().lng().toString() +
    "&query=coffee" +
    "&limit=25" + "&radius=8000";
  createFSQMarkerList(url);
}

// subscribe so we can let maps know there was a change once the observable changes.
vm.userDefLocation.subscribe(function(newLoc) {
  changeMapCenter();
});
