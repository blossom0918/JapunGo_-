db = firebase.database();

function more(key) {
    console.log('你按的是' + key + '的More');
    var id = '#moreCompanion' + key;
    $(id).slideToggle();
}