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
//var User=getCookie('ID');
var User = 'opop';  //為方便更改功能先設為opop
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
        if (data.網址 != 0) {
            document.getElementById('map_recommend_a').href = data.網址;
            document.getElementById('map_recommend_a').target = "_blank";
        }


    })

}

//----清單版本-------------------------------------------------------
var ref = '/店家資料/' + food;
db.ref(ref).once('value', function (snapshot) {
    let data = snapshot.val();
    let list_content = '';
    for (i in data) {
        console.log(data[i].店名);
    }
    var n = 1;
    var list = '';
    for (i in data) {
        var clear = '<div style="clear:both;"></div>';
        var str =
            '<div class="info">\
            <h3>'+ data[i].店名 + '</h3>\
            <img src="img/pin.png" class="addIcon">\
            <p class="address">'+ data[i].地址 + '</p>\
            <img src="img/tel.png" class="telIcon">\
            <p class="tel">'+ data[i].電話 + '</p>\
            <div class="btn0">\
                <button class="showAllComments" onclick="showallcomment_list('+ n + ')"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>\
                <a class="recommend" id="recommend_a'+ n + '"><img src="img/best.png" class="bestIcon">查看推薦</a>\
            </div>\
            <div class="btn">\
                <button id="post" onclick="show_post('+ n + ')">發起動態</button>\
                <button id="comment" onclick="my_comment('+ n + ')">我要評論</button>\
                <button  onclick="favorite(\''+ n + '\')">加入清單／自清單移除</button>\
                <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
            </div>\
            <div class="postArea" id="postArea'+ n + '">\
                <div class="postInput">\
                    <textarea style="overflow:auto" class="postTerm" placeholder="請輸入動態內容" id="post'+ n + '"></textarea>\
                    <img src="img/pic.png" alt="">\
                </div>\
                <div class="btn2">\
                    <button onclick="post_enter(\''+ n + '\')">確定</button>\
                    <button onclick="post_cancel(\''+ n + '\')">取消</button>\
                </div>\
            </div>\
            <div class="commentArea" id="commentArea'+ n + '">\
                <div class="commentInput">\
                    <textarea style="overflow:auto" class="commentTerm" placeholder="請輸入評論內容" id="comment'+ n + '"></textarea>\
                    <img src="img/pic.png" alt="">\
                </div>\
                <div class="btn3">\
                    <button id="option" onclick="show_option('+ n + ')">評論選項</button>\
                    <button onclick="comment_enter(\''+ n + '\')">我要評論</button>\
                </div>\
                <div class="btnOption" id="btnOption'+ n + '">\
                    <button onclick="opt1(\''+ n + '\')">環境乾淨</button>\
                    <button onclick="opt2(\''+ n + '\')">環境骯髒</button>\
                    <button onclick="opt3(\''+ n + '\')">餐點美味</button>\
                    <button onclick="opt4(\''+ n + '\')">餐點糟糕</button>\
                    <button onclick="opt5(\''+ n + '\')">親切店家</button>\
                    <button onclick="opt6(\''+ n + '\')">服務極差</button>\
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
        list += str;
        if (n % 2 == 0) {
            list += clear;
        }
        n += 1;
    }
    document.getElementById('list').innerHTML = list;

    setTimeout(() => {
        //判斷有沒有網址
        //判斷有沒有加清單也要寫在這裡
        var m = 1;
        for (i in data) {
            if (data[i].網址 != 0) {
                var a_id = 'recommend_a' + m;
                document.getElementById(a_id).href = data[i].網址;
                document.getElementById(a_id).target = "_blank";
            }
            m += 1;
        }
        //讓所有DIV一開始都收起來
        $('.commentArea').hide();
        $('.postArea').hide();
        $('.allComments').hide();
        $('.btnOption').hide();
    }, 0);
})



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

//-------------以下店家資訊裡面的按鈕功能-----------------------------------

//----發起動態---------
function post_enter(i) { //發起動態 確定
    var id = 'post' + i;
    var content = document.getElementById(id).value;  //取得動態內容
    console.log('user' + User + '輸入的內容是:' + content);
    const ref = '/店家資料/' + food;


}
function post_cancel(i) { //發起動態 取消
    var id = 'post' + i;
    var content = document.getElementById(id);
    content.value = '';

}

//----我要評論---------
function comment_enter(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value; //取得評論內容
}
function opt1(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 環境乾淨 ';
    document.getElementById(id).value = content;
}
function opt2(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 環境骯髒 ';
    document.getElementById(id).value = content;
}
function opt3(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 餐點美味 ';
    document.getElementById(id).value = content;
}
function opt4(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 餐點糟糕 ';
    document.getElementById(id).value = content;
}
function opt5(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 親切店家 ';
    document.getElementById(id).value = content;
}
function opt6(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 服務極差 ';
    document.getElementById(id).value = content;
}

//----加入清單---------
function favorite(i) {
    var favorite = 'favorite' + i;
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var phone_id = 'phone' + i;
    var phone = document.getElementById(phone_id).value;
    var user_ref = '/美食清單資料/' + User;
    db.ref(user_ref).push({
        Uno: User,
        Name: name,
        Address: address,
        Phone: phone
    });
    console.log('加入清單ㄌ');

    //---將按鈕改成自清單移除-----
    setTimeout(() => {
        document.getElementById(favorite).innerHTML='自清單移除';
        document.getElementById(favorite).setAttribute("onclick","javascript: favorite_delete('"+i+"');" );
    }, 0);
}
function favorite_delete(i) {
    var favorite = 'favorite' + i;
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var user_ref = '/美食清單資料/'+User;
    db.ref(user_ref).once('value', function (snapshot) {
        var data=snapshot.val();
        for (i in data){
            if (data[i].Name==name && data[i].Address==address){
                db.ref(user_ref).child(i).remove();
            }
        }
    })
    setTimeout(() => {
        document.getElementById(favorite).setAttribute("onclick","javascript: favorite('"+i+"');" );
        document.getElementById(favorite).innerHTML='加入清單';
    }, 0);
    
}