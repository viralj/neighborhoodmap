'use strict';

var initialLocations = [
    {
        name: 'Quad (Illinois State University)',
        lat: 40.5086536,
        long: -88.9912084
    },
    {
        name: 'The Rock Restaurant',
        lat: 40.5092357,
        long: -88.9860323
    },
    {
        name: 'D P Dough',
        lat: 40.5095144,
        long: -88.9831754
    },
    {
        name: 'Hancock Stadium',
        lat: 40.5124877,
        long: -88.9966437
    },
    {
        name: 'Illinois State University Athletics',
        lat: 40.5106554,
        long: -88.9988456
    },
    {
        name: 'Bone Student Center',
        lat: 40.5112643,
        long: -88.9924279
    },
    {
        name: 'ISU Bowling and Billards Center',
        lat: 40.512066,
        long: -88.9909766
    },
    {
        name: 'The Alamo II',
        lat: 40.5091633,
        long: -88.9890882
    },
    {
        name: 'Maggie Miley\'s',
        lat: 40.5098793,
        long: -88.9833566
    },
    {
        name: 'Insomnia Cookies',
        lat: 40.5095127,
        long: -88.9832346
    },
    {
        name: 'Firehouse Pizza & Pub',
        lat: 40.5093929,
        long: -88.9834364
    },
    {
        name: 'Emack & Bolio\'s Ice Cream',
        lat: 40.5093929,
        long: -88.9834364
    },


];

// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;


function formatPhone(phonenum) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
        var parts = phonenum.match(regexObj);
        var phone = "";
        if (parts[1]) {
            phone += "+1 (" + parts[1] + ") ";
        }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else {
        //invalid phone number
        return phonenum;
    }
}

var Location = function (data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.URL = "";
    this.street = "";
    this.city = "";
    this.phone = "";

    this.visible = ko.observable(true);

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

    $.getJSON(foursquareURL).done(function (data) {
        var results = data.response.venues[0];

        if (typeof results === 'undefined') {

        } else {
            self.URL = results.url;
            if (typeof self.URL === 'undefined') {
                self.URL = "";
            }
            self.street = results.location.formattedAddress[0];
            self.city = results.location.formattedAddress[1];
            self.phone = results.contact.phone;
            if (typeof self.phone === 'undefined') {
                self.phone = "";
            } else {
                self.phone = formatPhone(self.phone);
            }
        }

    }).fail(function () {
        alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
    });

    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    this.showMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function () {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
            '<div class="content">' + self.street + "</div>" +
            '<div class="content">' + self.city + "</div>" +
            '<div class="content"><a href="tel:' + self.phone + '">' + self.phone + "</a></div></div>";

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function AppViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 40.5082864, lng: -88.990047}
    });

    // Foursquare API settings
    clientID = "JW3WFHDY3JDN40HQMJQBBTY0T53CF0PZVFXE5TJLXGEU2PES";
    clientSecret = "X5HA15N4QZVSUE1HBZPIMAF2RRQXBZEODIHRMR4WXAKVF22W";

    initialLocations.forEach(function (locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    this.filteredList = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}
