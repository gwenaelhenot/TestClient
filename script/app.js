var testUrl = "../TestAPI/public/index.php"
var citiesList = $('#citiesList');
var map;
var openInfo;
var markers = [];
var stationsList = $('#stationsList');

stationsList.append('<h3>Veuillez sélectionner une ville pour afficher la liste des stations.</h3>');

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 46.4658338, lng: 3.3923536},
        zoom: 5
    });
}

function createMarker(station){
    var contentString = '<h5>'+station.name+
        '</h5><p>'+station.address+
        '</p><p>CB : '+station.banking+
        '</p><p>'+station.status+
        '</p><p>Bornes : '+station.bike_stands+
        '</p><p>Vélos : '+station.available_bikes+
        '</p><p>Places libres : '+station.available_bike_stands+'</p>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    var marker = new google.maps.Marker({
        position: {lat: station.position.lat, lng: station.position.lng},
        map:map,
        title:station.name
    });
    markers.push(marker);
    marker.addListener('click', function() {
        if (openInfo) {
            openInfo.close();
        }
        infowindow.open(map, marker);
        openInfo = infowindow;
    });
}

$.ajax({
    url : testUrl+'/contracts',
    type : 'GET',
    dataType : 'json',
    success : function(data){
        var list = [];
        for (var key in data) {
            if (data[key].country_code == "FR") {
                list.push(data[key].name);
            }
        }
        list.sort();
        for (var key in list){
            citiesList.append('<option class="city" value="'+list[key]+'">'+list[key]+'</option>')
        }
    }
});

citiesList.change(function(ev){
    $.ajax({
        url : testUrl+'/stations/'+ev.target.value,
        type : 'GET',
        dataType : 'json',
        success : function(data){
            var list = [];
            var latlng = [];

            for (var ii in markers) {
                markers[ii].setMap(null);
            }
            markers = [];

            for (var key in data) {
                console.dir(data);
                latlng.push(new google.maps.LatLng(data[key].position.lat, data[key].position.lng))

                data[key].status = data[key].status == "OPEN" ? "Ouvert" : "Fermé";
                data[key].banking = data[key].banking == true ? "Oui" : "Non";

                createMarker(data[key]);
                list[data[key].number] = data[key];
            }

            stationsList.html('<table id=stationsTable class="table table-hover">');
            stationsTable = $('#stationsTable');
            stationsTable.append('<tr><th>N°</th><th>Nom</th><th>Adresse</th><th>CB</th><th>Statut</th><th>Nb Bornes</th><th>Vélos</th><th>Places libres</th></tr>')
            for (key in list){
                stationsTable.append(
                    '<tr><td>'+list[key].number+'</td><td>'+list[key].name+'</td><td>'+list[key].address+'</td><td>'+list[key].banking+'</td><td>'+list[key].status+'</td><td>'+list[key].bike_stands+'</td><td>'+list[key].available_bikes+'</td><td>'+list[key].available_bike_stands+'</td></tr>')
            }

            var latlngbounds = new google.maps.LatLngBounds();
            for (var ii in latlng) {
                latlngbounds.extend(latlng[ii]);
            }
            map.fitBounds(latlngbounds);
        }
    });
})
