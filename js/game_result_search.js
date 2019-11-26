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

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}
var food = getCookie('food');
document.getElementById('q_answer').innerHTML = food;

var start_map;
var map;
var my_lat;
var my_lng;
var currentLocation;
initMap();

function initMap() {
    start_map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 22.8, lng: 120.20 },
        zoom: 10
        //未開啟定位之前的地圖      
    });
    navigator.geolocation.getCurrentPosition(function (position) {
        my_lat = Number(position.coords.latitude);
        my_lng = Number(position.coords.longitude);
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map = new google.maps.Map(document.getElementById('map'), {
            //定位後的地圖
            center: currentLocation,
            zoom: 14,
            mapTypeControl: false,
            styles: [
                {
                    "featureType": "poi.business",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                }
            ]

        });
        //---------------標記自己的點---------------------------
        var my_image = {
            url: 'img/me.png',
            size: new google.maps.Size(25, 50),
            scaledSize: new google.maps.Size(25, 50)
        }
        var my_marker = new google.maps.Marker({
            position: currentLocation,
            map: map,
            icon: my_image
        });
        my_marker.addListener('click', function () {
            creat_infowindow(currentLocation, my_marker);
        })
    });
    let geocoder = new google.maps.Geocoder();
    let ref = '/店家資料/' + food;
    db.ref(ref).once('value', function (snapshot) {
        let data = snapshot.val();
        console.log(data);
        var infowindow = new google.maps.InfoWindow();
        for (let i = 1; i < data.length; i++) {  //不能用for (i in data),會只抓最後一筆資料
            geocoder.geocode({ 'address': data[i].地址 }, function (results, status) {
                if (status == 'OK') {
                    map.setCenter(results[0].geometry.location);
                    let maker_img = {
                        url: 'img/restaurant.png',
                        size: new google.maps.Size(30, 45),
                        scaledSize: new google.maps.Size(30, 45)
                    }
                    var marker = new google.maps.Marker({
                        map: map,
                        icon: maker_img,
                        position: results[0].geometry.location,
                        restaurant: data[i].店名,
                        address: data[i].地址,
                        intro: data[i].網址,
                        phone: data[i].電話
                        //icon:地標圖案圖片網址

                    });
                    marker.addListener('click', function () {
                        infowindow.setContent('<div class="info_map" id="info_map"><ul>' +
                            '<li>餐廳： ' + data[i].店名 + '</li>' +
                            '<li>地址： </br>' + data[i].地址 + '</li>' +
                            '<li>電話： ' + data[i].電話 + '</li></ul>' +
                            '<button id="viewMore" >查看更多</button></div>');

                        infowindow.open(map, this);
                        setTimeout(() => {
                            test(data[i]);
                        }, 0);
                    });

                } else {
                    console.log(status);
                }
            });
        }
    })


}  //initMap


function creat_infowindow(position, marker) {
    let infow = new google.maps.InfoWindow({
        content: '我的位置'
    });
    infow.open(map, marker);
}

function test(data) { //infowindow點擊後

    document.getElementById('viewMore').addEventListener('click', function () {
        document.getElementById('info_detail').style.display = "block";
        console.log('收到data' + data.店名);
        document.getElementById('restaurant').innerHTML = data.店名;
        document.getElementById('r_address').innerHTML = data.地址;
        document.getElementById('r_tel').innerHTML = data.電話;
        // document.getElementById('recommend_a').href=data.網址;
        // document.getElementById('recommend_a').target="_blank";

    })
       
}

//----清單版本-------------------------------------------------------
var ref = '/店家資料/' + food;
db.ref(ref).once('value', function (snapshot) {
    let data = snapshot.val();
    let list_content='';
    for(i in data){
        console.log(data[i].店名);
    }
})


/*<li>
                        <div class="info">
                            <h3>餐廳名</h3>
                            <img src="img/pin.png" class="addIcon">
                            <p class="address">地址</p>
                            <img src="img/tel.png" class="telIcon">
                            <p class="tel">電話</p>
                            <button class="showAllComments" id="showAllComments"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>
                            <button class="recommend"><img src="img/best.png" class="bestIcon">查看推薦</button>
                            <div class="btn">
                                <button id="post">發起動態</button>
                                <button id="comment">我要評論</button>
                                <button>加入清單／自清單移除</button>
                                <!-- 已在清單內顯示移除，尚未加入顯示加入 -->
                            </div>

                            <div class="postArea">
                                <div class="postInput">
                                    <textarea style="overflow:auto" class="postTerm" placeholder="請輸入動態內容"></textarea>
                                    <img src="img/pic.png" alt="">
                                </div>
                                <div class="btn2">
                                    <button>確定</button>
                                    <button>取消</button>
                                </div>
                            </div>

                            <div class="commentArea">
                                <div class="commentInput">
                                    <textarea style="overflow:auto" class="commentTerm" placeholder="請輸入評論內容"></textarea>
                                    <img src="img/pic.png" alt="">
                                </div>
                                <div class="btn3">
                                    <button id="option">評論選項</button>
                                    <button>我要評論</button>
                                </div>
                                <div class="btnOption">
                                    <button>環境乾淨</button>
                                    <button>環境骯髒</button>
                                    <button>餐點美味</button>
                                    <button>餐點糟糕</button>
                                    <button>親切店家</button>
                                    <button>服務極差</button>
                                </div>
                            </div>

                            <div class="allComments">
                                <div class="comments">
                                    <img src="img/pic.png" alt="">
                                    <div class="commentContent">
                                        <p>內容</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>*/