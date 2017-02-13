//four square API required
var CLIENT_ID ='0NRCGCBFN0MYNSPB5IOHDDU05PXWCOLTQ25S1AXD524N2SDK';
var CLIENT_SECRET = '4UVI2W4A4P05PCWWV12XMQLM2ENI2LZNLFFN0SNZ15OAGHCM';

//the model
var locations = { "locations": [{ "location": { "Latitude": "37.7597022", "Longitude": "-122.4347069" }, "title": "Anchor Oyster Bar" }, { "location": { "Latitude": "37.8058713", "Longitude": "-122.4206286" }, "title": "Restaurant Gary Danko" }, { "location": { "Latitude": "37.7905123", "Longitude": "-122.3891332" }, "title": "Waterbar" }, { "location": { "Latitude": "37.7814751", "Longitude": "-122.4598738" }, "title": "Mescolanza Restaurant" }, { "location": { "Latitude": "37.7329743", "Longitude": "-122.5028407" }, "title": "San Francisco Zoo" }, { "location": { "Latitude": "37.7769550", "Longitude": "-122.4217333" }, "title": "Lers Ros Thai" }, { "location": { "Latitude": "37.7860697", "Longitude": "-122.4297070" }, "title": "Ramen Yamadaya" }, { "location": { "Latitude": "37.7866580", "Longitude": "-122.4077450" }, "title": "King of Thai Noodle House" }, { "location": { "Latitude": "37.7852279", "Longitude": "-122.4043890" }, "title": "San Francisco Marriott Marquis" }, { "location": { "Latitude": "37.7817098", "Longitude": "-122.3961356" }, "title": "Garaje" }, { "location": { "Latitude": "37.7698646", "Longitude": "-122.4660947" }, "title": "California Academy of Sciences" }, { "location": { "Latitude": "37.7429027", "Longitude": "-122.4763491" }, "title": "House of Pancakes" }] };
var startLocale = { "lat": 37.7749413, "lng": -122.4561124 };
var Location = function(data) {
    this.lat = data.location.Latitude;
    this.long = data.location.Longitude;
    this.title = data.title;
};

//map model
MapModel = {
    models: [],
    addModel: function(model){
        MapModel.models.push(model);
    }
};

//view model for html/ko
var ViewModel = function() {
    var self = this;
    this.locs = ko.observableArray([]);
    locations.locations.forEach(function(loc) {
        self.locs.push(new Location(loc));
    });
    this.input = ko.observable('');
    this.filterList = ko.computed(function(filter) {
        //no filter
        if (!self.input()) {
            return self.locs();
        } else {
            return ko.utils.arrayFilter(self.locs(), function(location) {
                return location.title.toLowerCase().indexOf(self.input()) !== -1;
            });
        }
    }, this);
    this.infoWindow = ko.observable('');
    this.mapMarker = function(title) {
        model = MapModel.models.find(function(m) {
            return m.marker.getTitle().includes(title.title);
        });
        if (model !== null) {
            MapController.showInfoWindow(model);
        }
    };
};


//map controller
MapController = {
    map: null,
    getInfoWindow: null,
    //init
    initMap: function() {
        if (google !== null) {
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 13,
                center: startLocale
            });
            MapController.map = map;
            MapController.populateMap(map);
            $('#search-bar').on('input', MapController.onInput);
            google.maps.event.addListener(map, 'click', function(event) {
                if (MapController.getInfoWindow !== null) {
                    MapController.getInfoWindow.close();
                }
            });
            //for resizing, thanks to http://stackoverflow.com/questions/1556921/google-map-api-v3-set-bounds-and-center
            var bounds = new google.maps.LatLngBounds({lat:37.7329743, lng:-122.5028407},{lat:37.8058723, lng: -122.4006286});
            map.fitBounds(bounds);
            ko.applyBindings(new ViewModel());
        }else{
            $('#error').text("There has been an error with Google Maps API, please check your internet connection");
        }
    },
    //popuplate map
    populateMap: function(map) {
        locations.locations.forEach(function(loc) {
            MapController.addMarker(map, loc);
        });
    },
    //add marker to map
    addMarker: function(map, loc) {
        var locInfo = {};
        locInfo.lat = parseFloat(loc.location.Latitude);
        locInfo.lng = parseFloat(loc.location.Longitude);
        var marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: locInfo,
            map: map,
            title: loc.title
        });
        var model = {};
        model.marker = marker;
        marker.addListener('click', function() {
            MapController.showInfoWindow(model);
        });
        MapModel.addModel(model);
        //Foursquare API call
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search?ll='+startLocale.lat+','+startLocale.lng+'&client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'+&v=20161016&limit=1&query='+marker.getTitle(),
            type: 'GET',
            dataType: 'json',
            success: function(data){
                //set contact info and checkin count
                var result = data.response.venues[0];
                if(result !== null){
                    model.text = 'Check ins: ' + result.stats.checkinsCount + ' Contact: ' + (result.contact.formattedPhone !== undefined ? result.contact.formattedPhone:"Uh oh, foursquare doens't have this info");
                }else{
                    model.text = "Foursquare doesn't have information about this location";
                }
            },
            error: function(j, status, error){
                model.text = 'There was an error with the foursquare request. Status: ' + status;
            }
        });
    },
    //toggle bounce for marker
    toggleBounce: function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1000);
        }
    },
    //on input search bar for map markers
    onInput: function() {
        var filter = $('#search-bar').val();
        MapModel.models.forEach(function(model) {
            if (!model.marker.getTitle().toLowerCase().includes(filter)) {
                model.marker.setMap(null);
            } else {
                model.marker.setMap(MapController.map);
            }
        });
    },
    //display google info window
    showInfoWindow: function(model) {
        var marker = model.marker;
        MapController.toggleBounce(marker);
        var infoWindow;
        var content =
            '<div id="content">' +
            '<h4 id="firstHeading" class="firstHeading">' + marker.getTitle() + '</h4>' +
                '<div id="bodyContent">' +
                    '<p>' +
                    model.text +
                    '</p>' +
                '</div>' +
            '</div>';
        if (MapController.getInfoWindow !== null) {
            infoWindow = MapController.getInfoWindow;
        } else {
            infoWindow = new google.maps.InfoWindow();
            MapController.getInfoWindow = infoWindow;
        }
        infoWindow.setContent(content);
        infoWindow.open(MapController.map, marker);
    }
};

//error handling for google maps
function onError(){
    $('#error').text("There has been an error with Google Maps API, please check your internet connection");
    $('.app').hide();
}
