function $(s){
    console.log(s);
    //获取到一个集合的dom对象
    return document.querySelectorAll(s);
}

var list = $("#mus_list li");
console.log(list);
for(var i=0;i<list.length;i++){
    list[i].onclick = function(){
       // 将未选择的置为空
       for(var j=0;j<list.length;j++){
           list[j].className = "";
       }
       //将当前的置为已选择状态
        this.className = "selected";
       load("/media/"+this.title);
    }
}
//数据的长度
var size = 128;
var box = $("#right_box")[0];
var height,width;
//添加一个canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var dots = [];



//canvas自适应窗口变化
var line;
function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    //设置线性渐变
    line = ctx.createLinearGradient(0,0,0,height);
    line.addColorStop(0,"red");
    line.addColorStop(0.5,"yellow");
    line.addColorStop(1,"green");
    getDots();
}
resize();
window.onresize = resize;

function random(m,n){
    return Math.round(Math.random()*(n-m)+m);
}
function getDots(){
    dots = [];
    for(var i=0;i<size;i++){
        var x = random(0,width);
        var y = random(0,height);
        var color = "rgb("+ random(0,255)+","+ random(0,255)+","+random(0,255)+")";
        dots.push({
            x:x,
            y:y,
            color:color
        })
    }
}


//绘制成柱状
function draw(arr) {
    // console.log("绘制");
    ctx.clearRect(0,0,width,height);
    var w = width/size;
    ctx.fillStyle = line;
    for(var i=0;i<size;i++){
        if(draw.type =="column"){
            var h = arr[i]/256 * height;
            ctx.fillRect(w*i,height - h,w*0.6,h);
        }else if(draw.type =="dot"){
            // console.log("开始绘制远点");
            ctx.beginPath();
            var o = dots[i];
            var r = arr[i] / 256 * 50;
            ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
            //白圈圈
            // ctx.strokeStyle = "#fff";
            // ctx.stroke();
            // 创建渐变色
            var g = ctx.createRadialGradient(o.x,o.y,r/5,o.x,o.y,r);
            g.addColorStop(0,"#fff");
            g.addColorStop(1,o.color);
            ctx.fillStyle = g;
            ctx.fill();
        }
    }
}
draw.type = "column";
//btn切换
var btnType = $("#btn_type li");
for(var i=0;i<btnType.length;i++){
    btnType[i].onclick = function(){
        for(var j=0;j<btnType.length;j++){
            btnType[j].className = "";
        }
        this.className = "selected";
        draw.type = this.getAttribute("datatype");
    }
}



//创建ajax请求
var xhr = new XMLHttpRequest();
//创建AudioContext对象和gainNode对象
var ac = new window.AudioContext();
var gainNode = ac.createGain();
gainNode.connect(ac.destination);
//创建并连接音频分析对象
var analyser = ac.createAnalyser();
analyser.fftSize = size * 2;
analyser.connect(gainNode);


//防止不同歌曲重叠播放
var source = null;
var count = 0;

function load(url){
    var n = ++count;
    source && source.stop();
    //直接终止本次请求
    xhr.abort();
    xhr.open("GET",url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function(){
        //正在请求的资源不是当前点击的，直接返回不进行资源加载
        if(n!=count)return;
        console.log(xhr.response);
        ac.decodeAudioData(xhr.response,function(buffer){
            if(n!=count)return;
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(analyser);
            bufferSource.start(0);
            source = bufferSource;
        },function(err){
            console.log("播放失败：",err);
        })
    };
    xhr.send();
}

//得到音频分析数据
function visualizer(){
    var arr = new Uint8Array(analyser.frequencyBinCount);
    requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame;
    function v(){
        analyser.getByteFrequencyData(arr);
        // console.log("解析：",arr);
        //调用绘制函数,根据解析出的音频的频率进行绘制
        draw(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}
visualizer();

//创建音量控制函数
function changeVolume(per){
gainNode.gain.value = per;
}
//绑定事件
$("#volume")[0].onchange = function(){
    changeVolume(this.value/this.max);
}
//调用音量控制事件
$("#volume")[0].onchange();