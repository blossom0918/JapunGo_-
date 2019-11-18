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
//var data=get_food_data();


/*
function get_food_data(){
    let button = document.getElementById('button');
    button.addEventListener('click', function () {
        let food = document.getElementById('food').value;
        let ref='/店家資料/'+food;
        db.ref(ref).once('value',function(snapshot){
            data=snapshot.val();
            console.log(data);
            return data;
        })       
    })
}
*/


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
        map = new google.maps.Map(document.getElementById('map'), {
            center: currentLocation,
            zoom: 14
        });
        //---------------標記自己的點---------------------------
        var my_image = "https://images.plurk.com/bHOjfuhV3ojfe5QGxqUP.png";
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
    let geocoder = new google.maps.Geocoder();

    let button = document.getElementById('button');
    button.addEventListener('click', function () {
        let food = document.getElementById('food').value;
        let ref = '/店家資料/' + food;
        db.ref(ref).once('value', function (snapshot) {
            let data = snapshot.val();
            console.log(data);
            var infowindow = new google.maps.InfoWindow();   
            for (let i = 1; i < data.length; i++) {
                geocoder.geocode({ 'address': data[i].地址 }, function (results, status) {
                    if (status == 'OK') {
                        map.setCenter(results[0].geometry.location);
                       
                        var marker = new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            restaurant:data[i].店名,
                            address:data[i].地址,
                            intro:data[i].網址,
                            phone:data[i].電話
                            //icon:地標圖案圖片網址
                            
                        });
                        marker.addListener('click', function() {
                            infowindow.setContent( '<ul><li>'+this.restaurant+'</li><li>'+this.address+'</li><li>'+this.phone+'</li></ul>' );
                            infowindow.open(map, this);
                          }); 
                      
                    } else {
                        console.log(status);
                    }
                });
            }
        })
    })





}

function creat_infowindow(position, marker) {
    let infow = new google.maps.InfoWindow({
        content: '<div class="info">hi everyone</div>'
    });
    infow.open(map, marker);
}
function food_infowindow(position,marker,food){
    let infow= new google.maps.InfoWindow({
        content:'<h2>'+food+'</h2>'
    })
    infow.open(map, marker);
}