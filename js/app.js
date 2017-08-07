'use strict';

/*global google */
/*global Google */
/*global alert */


//To get formatted phone number
function fp(t) {
    var e = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (e.test(t)) {
        var n = t.match(e),
            o = "";
        return n[1] && (o += "+1 (" + n[1] + ") "), o += n[2] + "-" + n[3]
    }
    return t
}

//View Model for the app to initialize clientID, clientSecret and load google map in the screen
function vmfa() {
    var t = this;
    this.searchTerm = ko.observable(""), this.locList = ko.observableArray([]), map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: {
            lat: 40.5074476,
            lng: -89.0000705
        }
    }), cID = "JW3WFHDY3JDN40HQMJQBBTY0T53CF0PZVFXE5TJLXGEU2PES", cSec = "X5HA15N4QZVSUE1HBZPIMAF2RRQXBZEODIHRMR4WXAKVF22W", iloc.forEach(function (e) {
        t.locList.push(new Location(e))
    }), this.filteredList = ko.computed(function () {
        var e = t.searchTerm().toLowerCase();
        return e ? ko.utils.arrayFilter(t.locList(), function (t) {
                var n = t.name.toLowerCase(),
                    o = n.search(e) >= 0;
                return t.visible(o), o
            }) : (t.locList().forEach(function (t) {
                t.visible(!0)
            }), t.locList())
    }, t), this.mapElem = document.getElementById("map"), this.mapElem.style.height = window.innerHeight - 50
}

//`run` function to start from Google Map API and run `vmfa` function
function run() {
    ko.applyBindings(new vmfa)
}


//String formatter : To format string with replacing characters/words
String.prototype.format || (String.prototype.format = function () {
    var t = arguments;
    return this.replace(/{(\d+)}/g, function (e, n) {
        return void 0 !== t[n] ? t[n] : e
    })
});

//initial location information
var iloc = [{
        "name": "Quad (Illinois State University)",
        "lat": 40.5086536,
        "long": -88.9912084
    }, {
        "name": "The Rock Restaurant",
        "lat": 40.5092357,
        "long": -88.9860323
    }, {
        "name": "D P Dough",
        "lat": 40.5095144,
        "long": -88.9831754
    }, {
        "name": "Hancock Stadium",
        "lat": 40.5124877,
        "long": -88.9966437
    }, {
        "name": "Illinois State University Athletics",
        "lat": 40.5106554,
        "long": -88.9988456
    }, {
        "name": "Bone Student Center",
        "lat": 40.5112643,
        "long": -88.9924279
    }, {
        "name": "ISU Bowling and Billards Center",
        "lat": 40.512066,
        "long": -88.9909766
    }, {
        "name": "The Alamo II",
        "lat": 40.5091633,
        "long": -88.9890882
    }, {
        "name": "Maggie Miley's",
        "lat": 40.5098793,
        "long": -88.9833566
    }, {
        "name": "Insomnia Cookies",
        "lat": 40.5095127,
        "long": -88.9832346
    }, {
        "name": "Firehouse Pizza & Pub",
        "lat": 40.5093929,
        "long": -88.9834364
    }, {
        "name": "Emack & Bolio's Ice Cream",
        "lat": 40.5093929,
        "long": -88.9834364
    }],

    //Global vars and Location function to display information from Foursquare about location when location is selected 
    map, cID, cSec, Location = function (t) {
        var e = this;
        this.name = t.name, this.lat = t.lat, this.long = t.long, this.URL = "", this.street = "", this.city = "", this.phone = "", this.visible = ko.observable(!0);
        var n = "https://api.foursquare.com/v2/venues/search?ll={0},{1}&client_id={2}&client_secret={3}&v=20160118&query={4}".format(this.lat, this.long, cID, cSec, this.name);
        $.getJSON(n).done(function (t) {
            var n = t.response.venues[0];
            void 0 === n || (e.URL = n.url, void 0 === e.URL && (e.URL = ""), e.street = n.location.formattedAddress[0], e.city = n.location.formattedAddress[1], e.phone = n.contact.phone, e.phone = void 0 === e.phone ? "" : fp(e.phone))
        }).fail(function () {
            alert("Foursquare API call ran into error. To load Foursquare data, please refresh page.")
        }), this.contentString = '<div class="info-window-content"><div class="title"><b>' + t.name + '</b></div><div class="content"><a href="' + e.URL + '">' + e.URL + '</a></div><div class="content">' + e.street + '</div><div class="content">' + e.city + '</div><div class="content">' + e.phone + "</div></div>", this.infoWindow = new google.maps.InfoWindow({
            content: e.contentString
        }), this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(t.lat, t.long),
            map: map,
            title: t.name
        }), this.showMarker = ko.computed(function () {
            return this.marker.setMap(this.visible() === !0 ? map : null), !0
        }, this), this.marker.addListener("click", function () {
            e.contentString = '<div class="info-window-content"><div class="title"><b>' + t.name + '</b></div><div class="content"><a href="' + e.URL + '">' + e.URL + '</a></div><div class="content">' + e.street + '</div><div class="content">' + e.city + '</div><div class="content"><a href="tel:' + e.phone + '">' + e.phone + "</a></div></div>", e.infoWindow.setContent(e.contentString), e.infoWindow.open(map, this), e.marker.setAnimation(google.maps.Animation.BOUNCE), setTimeout(function () {
                e.marker.setAnimation(null)
            }, 2100)
        }), this.bounce = function () {
            google.maps.event.trigger(e.marker, "click")
        }
    };