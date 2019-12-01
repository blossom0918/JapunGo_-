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
//var User=getCookie('ID');
var User = 'opop';  //為方便更改功能先設為opop
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}


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
        document.getElementById('input_food').innerHTML = food;
        document.getElementById('list').innerHTML = '';
        for (var i = 0; i < marker_count.length; i++) {
            marker_count[i].setMap(null);
        }


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
    var clear = '<div style="clear:both;"></div>'
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            if (google.maps.geometry.spherical.computeDistanceBetween(results[i].geometry.location, mylocation) < 3000) {
                // console.log(results[i]);
                for (n in results[i].types) {
                    if (results[i].types[n] == 'restaurant') {

                        var request2 = {
                            placeId: results[i].place_id,
                        };
                        service = new google.maps.places.PlacesService(map);
                        if (resultCount % 2 == 0) {
                            $("#list").append('<div style="clear:both;"></div>');
                            service.getDetails(request2, callback2);
                        } else {
                            service.getDetails(request2, callback2);
                        }


                        resultCount++;

                    }
                }

            }
        }
        if (resultCount == 0) {
            document.getElementById('list').innerHTML='<h2 class="inputItem" >範圍裡找不到符合餐廳</h2>';
        }

    }
}

function callback2(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarker(place);
        creat_list1(place);

    }
}


function creat_list1(data) {
    var n = 'n' + data.id;
    var str = '<div class="info">\
    <input type="hidden" id="name'+ n + '" value="' + data.name + '">\
    <input type="hidden" id="address'+ n + '" value="' + data.formatted_address + '">\
    <input type="hidden" id="phone'+ n + '" value="' + data.formatted_phone_number + '">\
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
        <button onclick="favorite(\''+ n + '\')" id="favorite' + n + '">加入清單</button>\
        <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
    </div>\
    <div class="postArea" id="postArea'+ n + '">\
        <div class="postInput">\
            <input type="text" class="eatTimeTerm"  placeholder="請輸入飯局時間" id="eatTime'+ n + '"/>\
            <img src="img/pic.png" alt="">\
            <textarea style="overflow:auto" class="postTerm" placeholder="請輸入動態內容" id="post'+ n + '"></textarea>\
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
            <button id="option" onclick="show_option(\''+ n + '\')">評論選項</button>\
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

    $("#list").append(str);
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
            '<li>餐廳： ' + this.restaurant + '</li>' +
            '<li>地址： </br>' + this.address + '</li>' +
            '<li>電話： ' + this.phone + '</li></ul>' +
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
        document.getElementById('name0').value = data.restaurant;
        document.getElementById('r_address').innerHTML = data.address;
        document.getElementById('address0').value = data.address;
        document.getElementById('r_tel').innerHTML = data.phone;
        document.getElementById('phone0').value = data.phone;
        

    })

}


//-------------以下店家資訊裡面的按鈕功能-----------------------------------

//----發起動態---------
function post_enter(i) { //發起動態 確定
    var id = 'post' + i;
    var eatTime_id='eatTime'+i;
    var eatTime=document.getElementById(eatTime_id).value;
    var content = document.getElementById(id).value;  //取得動態內容
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var phone_id = 'phone' + i;
    var phone = document.getElementById(phone_id).value;
    var date=new Date();
    var today=date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
    var joinKey=User+date.getTime();
    let ref = '/動態資料';
    db.ref(ref).push({
        UNo: User,
        Name: name,
        Address: address,
        Phone: phone,
        Date: today,
        Content:content,
        EatTime:eatTime,
        JoinKey:joinKey
    });
    setTimeout(() => {
    document.getElementById(id).value='';
    document.getElementById(eatTime_id).value=''
    document.getElementById(id).placeholder=today+"動態發佈成功!!";
    }, 0);
    


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
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var date=new Date();
    var today=date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
    var ref = '/評論區資料';
    db.ref(ref).push({
        UNo: User,
        Name: name,
        Address: address,
        Date: today,
        Discon:content
       
    });
    console.log(User+'已評論成功! 日期:'+today);
    document.getElementById(id).value=''
    document.getElementById(id).placeholder=today+"評論成功!!"

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
        UNo: User,
        Name: name,
        Address: address,
        Phone: phone,
        Url:0
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