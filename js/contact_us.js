var db=firebase.database();
var qRef=db.ref('問題回報');

var question=document.getElementById('questionTerm');
var email=document.getElementById('emailTerm');
var submit=document.getElementById('submitBtn');


submit.addEventListener('click',function(){
    qRef.push({
        'email':email.value,
        'question':question.value
    })
    email.value='';
    question.value='';
    alert('回報成功');
})