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
var marker_count = [];
var list_str = "";


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
        mylocation = new google.maps.LatLng(my_lat, my_lng);
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
        document.getElementById('list').innerHTML='';
        for (var i = 0; i < marker_count.length; i++) {
            marker_count[i].setMap(null);
        }
        var food = document.getElementById('food').value;

        var request = {
            location: currentLocation,   //搜尋的中心 自身定位
            radius: '500', //公尺
            query: food,
            types: 'restaurant'
        };
        service = new google.maps.places.PlacesService(map);

        service.textSearch(request, callback);
        
        


    })





}

function callback(results, status) {
    var resultCount = 0;
    var clear='<div style="clear:both;"></div>'
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            if (google.maps.geometry.spherical.computeDistanceBetween(results[i].geometry.location, mylocation) < 3000) {
                console.log(results[i]);
                for (n in results[i].types) {
                    if (results[i].types[n] == 'restaurant') {
                        
                        var request2 = {
                            placeId: results[i].place_id,
                        };
                        service = new google.maps.places.PlacesService(map);
                        if(resultCount%2==0){
                            service.getDetails(request2, callback2_1);
                        }else{
                            service.getDetails(request2, callback2_2);
                        }
                        
                      
                        resultCount++;
                        break;
                    }
                }

            }
        }
        if (resultCount == 0) {
            alert('範圍裡找不到符合餐廳');
        }
        
    }
}

function callback2_1(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarker(place);
        creat_list1(place);
        
    }
}
function callback2_2(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarker(place);
        creat_list2(place);
        
    }
}

function creat_list1(data) {
    var n='n'+data.id;
    var str = '<div class="info">\
    <h3>'+ data.name + '</h3>\
    <img src="img/pin.png" class="addIcon">\
    <p class="address">'+ data.formatted_address + '</p>\
    <img src="img/tel.png" class="telIcon">\
    <p class="tel">'+ data.formatted_phone_number + '</p>\
    <div class="btn0">\
        <button class="showAllComments" onclick="showallcomment_list(\''+ n + '\')"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>\
        <a class="recommend" id="recommend_a'+ n + '"><img src="img/best.png" class="bestIcon">查看推薦</a>\
    </div>\
    <div class="btn">\
        <button id="post" onclick="show_post(\''+ n + '\')">發起動態</button>\
        <button id="comment" onclick="my_comment(\''+ n + '\')">我要評論</button>\
        <button>加入清單／自清單移除</button>\
        <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
    </div>\
    <div class="postArea" id="postArea'+ n + '">\
        <div class="postInput">\
            <textarea style="overflow:auto" class="postTerm" placeholder="請輸入動態內容"></textarea>\
            <img src="img/pic.png" alt="">\
        </div>\
        <div class="btn2">\
            <button>確定</button>\
            <button>取消</button>\
        </div>\
    </div>\
    <div class="commentArea" id="commentArea'+ n + '">\
        <div class="commentInput">\
            <textarea style="overflow:auto" class="commentTerm" placeholder="請輸入評論內容"></textarea>\
            <img src="img/pic.png" alt="">\
        </div>\
        <div class="btn3">\
            <button id="option" onclick="show_option(\''+ n + '\')">評論選項</button>\
            <button>我要評論</button>\
        </div>\
        <div class="btnOption" id="btnOption'+ n + '">\
            <button>環境乾淨</button>\
            <button>環境骯髒</button>\
            <button>餐點美味</button>\
            <button>餐點糟糕</button>\
            <button>親切店家</button>\
            <button>服務極差</button>\
        </div>\
    </div>\
    <div class="allComments" id="allComments'+ n + '">\
        <div class="comments">\
            <img src="img/pic.png" alt="">\
            <div class="commentContent">\
                <p>內容</p>\
            </div>\
        </div>\
    </div>\
</div>';
    
    $( "#list" ).append( str );
    setTimeout(() => {
        //讓所有DIV一開始都收起來
        $('.commentArea').hide();
        $('.postArea').hide();
        $('.allComments').hide();
        $('.btnOption').hide();
    }, 0);
}

//creat_list2 有clear div
function creat_list2(data) {
    var n='n'+data.id;
    var str = '<div class="info">\
    <h3>'+ data.name + '</h3>\
    <img src="img/pin.png" class="addIcon">\
    <p class="address">'+ data.formatted_address + '</p>\
    <img src="img/tel.png" class="telIcon">\
    <p class="tel">'+ data.formatted_phone_number + '</p>\
    <div class="btn0">\
        <button class="showAllComments" onclick="showallcomment_list(\''+ n + '\')"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>\
        <a class="recommend" id="recommend_a'+ n + '"><img src="img/best.png" class="bestIcon">查看推薦</a>\
    </div>\
    <div class="btn">\
        <button id="post" onclick="show_post(\''+ n + '\')">發起動態</button>\
        <button id="comment" onclick="my_comment(\''+ n + '\')">我要評論</button>\
        <button>加入清單／自清單移除</button>\
        <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
    </div>\
    <div class="postArea" id="postArea'+ n + '">\
        <div class="postInput">\
            <textarea style="overflow:auto" class="postTerm" placeholder="請輸入動態內容"></textarea>\
            <img src="img/pic.png" alt="">\
        </div>\
        <div class="btn2">\
            <button>確定</button>\
            <button>取消</button>\
        </div>\
    </div>\
    <div class="commentArea" id="commentArea'+ n + '">\
        <div class="commentInput">\
            <textarea style="overflow:auto" class="commentTerm" placeholder="請輸入評論內容"></textarea>\
            <img src="img/pic.png" alt="">\
        </div>\
        <div class="btn3">\
            <button id="option" onclick="show_option(\''+ n + '\')">評論選項</button>\
            <button>我要評論</button>\
        </div>\
        <div class="btnOption" id="btnOption'+ n + '">\
            <button>環境乾淨</button>\
            <button>環境骯髒</button>\
            <button>餐點美味</button>\
            <button>餐點糟糕</button>\
            <button>親切店家</button>\
            <button>服務極差</button>\
        </div>\
    </div>\
    <div class="allComments" id="allComments'+ n + '">\
        <div class="comments">\
            <img src="img/pic.png" alt="">\
            <div class="commentContent">\
                <p>內容</p>\
            </div>\
        </div>\
    </div>\
</div>';
    str+='<div style="clear:both;"></div>'
    $( "#list" ).append( str );
    setTimeout(() => {
        //讓所有DIV一開始都收起來
        $('.commentArea').hide();
        $('.postArea').hide();
        $('.allComments').hide();
        $('.btnOption').hide();
    }, 0);
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
        icon: maker_img,
        place: {
            placeId: data.place_id,
            location: data.geometry.location
        },
        restaurant: data.name,
        address: data.formatted_address,
        phone: data.formatted_phone_number
    });
    marker_count.push(marker);
    marker.addListener('click', function () {
        typeof infoWindowsOpenCurrently !== 'undefined' && infoWindowsOpenCurrently.close();
        infowindow.setContent('<div class="info_map" id="info_map"><ul>' +
        '<li>餐廳： ' + this.restaurant + '</li>'+
        '<li>地址： </br>' + this.address + '</li>'+
        '<li>電話： ' + this.phone + '</li></ul>'+
        ' <button id="viewMore" >查看更多</button></div>');
        infowindow.open(map, this);
        setTimeout(() => {
            open_info_div(this);
        }, 0);
        infoWindowsOpenCurrently = infowindow;
    });
}


function showallcomment_list(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(allComments).slideToggle();
    $(postArea).hide();
    $(commentArea).hide();
    
}
function show_post(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(postArea).slideToggle();
    $(commentArea).hide();
    $(allComments).hide();
    
}
function my_comment(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(commentArea).slideToggle();
    $(postArea).hide();
    $(allComments).hide();
}
function show_option(i) {
    var btnOption = '#btnOption' + i;
    $(btnOption).slideToggle();
}

function open_info_div(data) { //infowindow點擊後

    document.getElementById('viewMore').addEventListener('click', function () {
        document.getElementById('info_detail').style.display = "block";
        console.log('收到data' + data.restaurant);
        document.getElementById('restaurant').innerHTML = data.restaurant;
        document.getElementById('r_address').innerHTML = data.address;
        document.getElementById('r_tel').innerHTML =data.phone;

    })

}