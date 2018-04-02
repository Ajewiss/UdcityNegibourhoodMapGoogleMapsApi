// declare variables
var map;
var Location;
var foursqaureClientID;
var foursquareClientSecret;

// Locations for the map
var defaultLocations = [
    {
        name: 'Armstrong',
        lat: -41.212378, long: 174.894494,
        info: 'Train with Nath'
    },
    {
        name: 'Change Fitness HQ',
        lat: -41.213475, long: 174.899536,
        info: 'Run and Walk / Train with Nath'
    },
    {
        name: 'Car Park',
        lat: -41.206841, long: 174.904858,
        info: 'Run and Walk'
    },
    {
        name: 'Te Whiti Riser',
        lat: -41.223815, long: 174.925200,
        info: 'Run and Walk'
    },
    {
        name: 'Wainui Hill',
        lat: -41.229458, long: 174.917523,
        info: 'Run and Walk'
    },
    {
        name: 'Petone Foreshore',
        lat: -41.231664, long: 174.888974,
        info: 'Run and Walk'
    }
];

//set up the location
Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.info = data.info;
    this.coffeeShop = '';
    this.cafeAddress = '';

    this.visible = ko.observable(true);

    // Foursquare API credentials.
    foursqaureClientID = 'HIAD0LFUHWOYUYHSICUNH4B0HPKEPYRCFR4PGR2ZU3PBMCO5';
    foursquareClientSecret = 'QPWEYEGGJG10U4OUC2SAAYR2WAMYQT5Q5CILJA4N2V50FONF';
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + 
    this.long + '&client_id=' + foursqaureClientID + '&client_secret=' + 
    foursquareClientSecret + '&v=20170413' + '&query="coffee" & limit=1';
    
    // Gets the data from foursquare.
    $.getJSON(foursquareURL).done(function (data) {
        var results = data.response.venues[0];
        self.coffeeShop = results.name;
        self.cafeAddress = results.location.address;
        //debug foursquare data
        //console.log(self.coffeeShop);
        //console.log(self.cafeAddress);
    }).fail(function () {
        $('.list').html('Oops the Foursquare API failed to load, please re-try.');
    });

    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + data.info + "</div>" +
        '<div class="content">Nearby cafe\'s:</div>' +
        '<div class="content">' + self.coffeeShop +"</div>" +
        '<div class="content">' + self.cafeAddress +"</div></div>";
    console.log(this.contentString);

    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    this.showMarker = ko.computed(function(){
        if(this.visible() === true){
            this.marker.setMap(map);
        }
        else{
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function(){
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content">' + data.info + "</div>" + 
            '<div class="content">Nearby cafe\'s:</div>' + 
            '<div class="content">' + self.coffeeShop +"</div>" +
            '<div class="content">' + self.cafeAddress +"</div></div>";

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);
        
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);
    });

    // add animation to marker
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function ViewModel(){

    var self = this;

    // show or hide list
    this.toggleSymbol = ko.observable('hide');
    this.searchTerm = ko.observable('');
    this.locationList = ko.observableArray([]);
    
    //initialise map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -41.2092, lng: 174.9081},
        zoom: 14,
        mapTypeControl: false
    });

    // push each location
    defaultLocations.forEach(function(locationItem){
        self.locationList.push( new Location(locationItem));
    });

    this.filteredList = ko.computed( function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem){
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);
}

function errorMap() {
    $('#map').html("Oops, I can't display google maps please try again.");
}

// this is called to start the app
function initMap() {
    ko.applyBindings(new ViewModel());
}