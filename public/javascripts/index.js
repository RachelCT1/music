function $(s){
    console.log(s);
    //获取到一个集合的dom对象
    return document.querySelectorAll(s);
}

//数据的长度
var size = 64;
var box = $("#right_box")[0];
var height,width;
//添加一个canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var dots = [];
var line;
var mv = new musicVisualizer({
    size:size,
    visualizer:draw
})

//选择音乐列表中要播放的音乐，通过对象调永play方法解析、播放音频（这里其实是传了个地址，根据该地址进行解析）
var list = $("#mus_list li");
for(var i=0;i<list.length;i++){
    list[i].onclick = function(){
       // 将未选择的置为空
       for(var j=0;j<list.length;j++){
           list[j].className = "";
       }
       //将当前的置为已选择状态
        this.className = "selected";
       // load("/media/"+this.title);
        mv.play("/media/"+this.title);
    }
}

//canvas自适应窗口变化
function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    //设置线性渐变
    line = ctx.createLinearGradient(0,0,0,height);
    line.addColorStop(0,"#DA52C4");
    line.addColorStop(0.5,"#4888D7");
    line.addColorStop(1,"#061651");
    getDots();
}
resize();
window.onresize = resize;

//随机数函数，用于生成散点随机颜色的
function random(m,n){
    return Math.round(Math.random()*(n-m)+m);
}
//生成散点
function getDots(){
    dots = [];
    for(var i=0;i<size;i++){
        var x = random(0,width);
        var y = random(0,height);
        var color = "rgba("+ random(0,255)+","+ random(0,255)+","+random(0,255)+",0)";
        dots.push({
            x:x,
            y:y,
            dx:random(1,2),
            color:color,
            //这里面把小方块往下掉的属性也加进来，感觉加在这里不大好
            cap:0
        })
    }
}


//绘制
function draw(arr) {
    // console.log("绘制");
    ctx.clearRect(0,0,width,height);
    var w = width/size;
    var cw = w * 0.6;
    var capH = cw >10 ? 10: cw;
    ctx.fillStyle = line;
    for(var i=0;i<size;i++){
        var o = dots[i];
        if(draw.type =="column"){
            var h = arr[i]/256 * height;
            ctx.fillRect(w*i,height - h,cw,h);
            ctx.fillRect(w*i,height - (o.cap+capH),cw,capH);
            // 小方块往下掉
            o.cap --;
            if(o.cap<0){
                o.cap = 0;
            }
            if(h>0 && o.cap <h+40){
                o.cap = h+40 >height -capH ? height - capH : h + 40
            }
        }else if(draw.type =="dot"){
            // console.log("开始绘制远点");
            ctx.beginPath();
            var r = 5 + arr[i] / 256 * (height > width ? width:height)/20;
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
            o.x += o.dx;
            o.x = o.x > width ? 0:o.x;
        }
    }
}


//btn切换
draw.type = "column";
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
//绑调用改变音量事件
$("#volume")[0].onchange = function(){
    mv.changeVolume(this.value/this.max);
}

//调用音量控制事件
$("#volume")[0].onchange();