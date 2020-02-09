function musicVisualizer(obj){
    this.source = null;
    this.count = 0;
    this.analyser = musicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize = this.size * 2;
    this.gainNode = musicVisualizer.ac.createGain();
    this.gainNode.connect(musicVisualizer.ac.destination);
    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    //调用obj传来的visualizer属性，这里index里给该属性赋的是一个draw方法
    this.visualizer = obj.visualizer;
    this.visualize();
}
//将AudioContext对象添加为一个属性
musicVisualizer.ac = new window.AudioContext();

//播放音频：加载音频并解码音频
musicVisualizer.prototype.play = function(url){
    var n = ++this.count;
    var self = this;
    this.source && this.stop();
    this.load(url,function(arraybuffer){
        // console.log("play2");
        // console.log("arrayBuffer",arraybuffer);
        if(n!=self.count) return;
        self.decode(arraybuffer,function(buffer){
            console.log(buffer);
            if(n!=self.count) return;
            var bs = musicVisualizer.ac.createBufferSource();
            bs.connect(self.analyser);
            bs.buffer = buffer;
            bs[bs.start ? "start" : "noteOn"](0);
            self.source = bs;
        })
    })
}

//加载音频
musicVisualizer.prototype.load = function(url,fun){
    this.xhr.abort();
    this.xhr.open("GET",url);
    this.xhr.responseType = "arraybuffer";
    var self = this;
    // console.log("loading");
    this.xhr.onload = function(){
        fun(self.xhr.response);
    }
    this.xhr.send();
}

//解码音频
musicVisualizer.prototype.decode = function(arraybuffer,fun){
    musicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
        fun(buffer);
    },function(err){
        console.log("解码失败：",err);
    })
}


musicVisualizer.prototype.stop = function(){
    this.source[this.source.stop ? "stop" : "noteOff"](0);
}

//音量控制的方法
musicVisualizer.prototype.changeVolume = function(per){
    this.gainNode.gain.value = per * per;
}

musicVisualizer.prototype.visualize = function(){
    var arr = new Uint8Array(this.analyser.frequencyBinCount);
    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame;
    var self = this;
    function v(){
        self.analyser.getByteFrequencyData(arr);
        // console.log("解析：",arr);
        //调用绘制函数,根据解析出的音频的频率进行绘制，arr是解析好的音频
        self.visualizer(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}