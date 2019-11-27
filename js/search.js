var firebaseConfig = {
    apiKey: "AIzaSyCcIFB1orespqziBWnX8kUWyihopdBw8jM",
    authDomain: "japungo.firebaseapp.com",
    databaseURL: "https://japungo.firebaseio.com",
    projectId: "japungo",
    storageBucket: "japungo.appspot.com",
    messagingSenderId: "238647383425",
    appId: "1:238647383425:web:cd43c3708893b6e052c480"
};
// Initialize Firebase 初始化
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

var start_map;
var map;
var my_lat;
var my_lng;
var currentLocation;
var mylocation;


initMap();

//未寫清除標記，若多次搜尋會覆蓋 sad

//用Text Search來搜尋使用者輸入的關鍵字
//https://developers.google.com/maps/documentation/javascript/places?hl=zh-TW#TextSearchRequests

function initMap() {
    start_map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 22.8, lng: 120.20 },
        zoom: 10
    });
    navigator.geolocation.getCurrentPosition(function (position) {
        my_lat = Number(position.coords.latitude);
        my_lng = Number(position.coords.longitude);
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        mylocation=new google.maps.LatLng(my_lat,my_lng);
        map = new google.maps.Map(document.getElementById('map'), {
            center: currentLocation,
            zoom: 14
        });
        //---------------標記自己的點---------------------------
        var my_image = {
            url: 'img/me.png',
            size: new google.maps.Size(25, 50),
            scaledSize: new google.maps.Size(25, 50)
        };
        var my_marker = new google.maps.Marker({
            position: currentLocation,
            map: map,
            icon: my_image
        });
        my_marker.addListener('click', function () {
            creat_infowindow(currentLocation, my_marker);
        })
    });

    //------------用地址查詢--------------
    //let geocoder = new google.maps.Geocoder();
    var service;
    let button = document.getElementById('searchBtn');
    button.addEventListener('click', function () {
        var food = document.getElementById('food').value;

        var request = {
            location: currentLocation,   //搜尋的中心 自身定位
            radius: '500', //公尺
            query: food,
            types:'restaurant'
        };
        service = new google.maps.places.PlacesService(map);

        service.textSearch(request, callback);


    })





}

function callback(results, status) {
    var resultCount=0;
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            if (google.maps.geometry.spherical.computeDistanceBetween(results[i].geometry.location, mylocation) <3000) {
                console.log(results[i]);
                for(n in results[i].types){
                    if( results[i].types[n]=='restaurant'){
                        var request2 = {
                            placeId: results[i].place_id,
                        };
                        service = new google.maps.places.PlacesService(map);
                        
                        service.getDetails(request2, callback2);
                        resultCount++;
                        break;
                    }
                }
                
            }
        }
        if(resultCount==0){
            alert('範圍裡找不到符合餐廳');
        }
    }
}

function callback2(place,status){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarker(place);
    }
}


function createMarker(data) {
    
    var infowindow = new google.maps.InfoWindow();
    let maker_img = {
        url: 'img/restaurant.png',
        size: new google.maps.Size(30, 45),
        scaledSize: new google.maps.Size(30, 45)
    }
    var marker = new google.maps.Marker({
        map: map,
        icon:maker_img,
        place: {
            placeId: data.place_id,
            location: data.geometry.location
        },
        restaurant: data.name,
        address:data.formatted_address,
        phone: data.formatted_phone_number
    });
    marker.addListener('click', function() {
        typeof infoWindowsOpenCurrently !== 'undefined' && infoWindowsOpenCurrently.close();
        infowindow.setContent( '<ul><li>'+this.restaurant+'</li><li>'+this.address+'</li><li>'+this.phone+'</li></ul>' );
        infowindow.open(map, this);
        infoWindowsOpenCurrently = infowindow;
      }); 
}
