const btnNo = $("#no");
const btnYes = $('#yes');
$(document).ready(function () {
    // process bar
    setTimeout(function () {
        firstQuestion();
        $('.spinner').fadeOut();
        $('#preloader').delay(350).fadeOut('slow');
        $('body').delay(350).css({
            'overflow': 'visible'
        });
    }, 600);
});

function firstQuestion() {

    $('.content').hide();
    Swal.fire({
        title: 'He luu cậu!',
        text: 'Tớ có điều này muốn hỏi cậu nhớ phải trả lời thật lòng nhaaa.',
        imageUrl: 'img/cuteCat.jpg',
        imageWidth: 300,
        imageHeight: 300,
        background: '#fff url("img/iput-bg.jpg")',
        imageAlt: 'Custom image',
    }).then(function () {
        $('.content').show(200);
    })
}

// switch button position
function switchButton() {
    let audio = new Audio('sound/duck.mp3');
    audio.play();
    let leftNo = btnNo.css("left");
    let topNO = btnNo.css("top");
    let leftY = btnYes.css("left");
    let topY = btnYes.css("top");
    btnNo.css("left", leftY);
    btnNo.css("top", topY);
    btnYes.css("left", leftNo);
    btnYes.css("top", topNO);
    console.log('kk');
}

// move random button póition
function moveButton() {
    let audio = new Audio('sound/Swish1.mp3');
    audio.play();
    let x = Math.random() * screen.width * 0.8;
    let y = Math.random() * screen.height * 0.8;
    let left = x + 'px';
    let top = y + 'px';
    btnNo.css("left", left);
    btnNo.css("top", top);
}


let n = 0;
btnNo.mousemove(function () {
    if (n < 1)
        switchButton();
    if (n > 1)
        moveButton();
    n++;
});
btnNo.click(function () {
    switchButton();
    moveButton();
});

// generate text in input
function textGenerate() {
    const txtReason =  $('#txtReason');
    let n = "";
    let text = " Tại vì cậu đẹp trai vl :<<<<<<< ";
    let a = Array.from(text);
    let textVal = txtReason.val() ? txtReason.val() : "";
    let count = textVal.length;
    if (count > 0) {
        for (let i = 1; i <= count; i++) {
            n = n + a[i];
            if (i === text.length + 1) {
                txtReason.val("");
                n = "";
                break;
            }
        }
    }
    txtReason.val(n);
    setTimeout("textGenerate()", 1);
}

// show popup
btnYes.click(function () {
    let audio = new Audio('sound/tick.mp3');
    audio.play();
    Swal.fire({
        title: 'Nói cho tớ lí do cậu thích tớ đi :vvvv',
        html: true,
        width: screen.width > 900 ? 900 : screen.width,
        padding: '3em 1em',
        html: '<input type="text" class="form-control" id="txtReason" onmousemove=textGenerate()  placeholder="Tớ đẹp trai lắm phải không <3">',
        background: '#fff url("img/iput-bg.jpg")',
        showCancelButton: true,
        cancelButtonText: "Thôi ngại lém :<<",
        confirmButtonColor: '#fe8a71',
        cancelButtonColor: '#f6cd61',
        confirmButtonText: 'Gửi cho tớ <3'
    }).then((result) => {
        if (result.value) {
            Swal.fire({
                width: 900,
                confirmButtonText: 'Okiiiii lun <3',
                background: '#fff url("img/iput-bg.jpg")',
                title: 'Tớ biết mà ^^ Yêu cậu 300.000',
                text: "Tối nay tớ qua đón cậu đi chơi nhaaaaaaaaa :v Còn giờ thì chờ gì nữa mà ko inbox cho tớ đi nàoooooo",
                confirmButtonColor: '#83d0c9',
                onClose: () => {
                    window.location = 'http://m.me/tuanskp';
                }
            })
        }
    })
})
