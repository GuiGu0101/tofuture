function SiriWave(opt) {
    this.opt = opt || {};

    this.K = 2;
    this.F = 6;


    if (!devicePixelRatio) devicePixelRatio = 1;
    this.width = devicePixelRatio * (this.opt.width || 320);
    this.height = devicePixelRatio * (this.opt.height || 100);
    this.MAX = (this.height / 2) - 4;
    this.speed = this.opt.speed || 0.1;
    this.phase = this.opt.phase || 0;
    this.setNoise(this.opt.noise || 0);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = (this.width / devicePixelRatio) + 'px';
    this.canvas.style.height = (this.height / devicePixelRatio) + 'px';
    (this.opt.container || document.body).appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this._drawZeroLine('rgba(118,113,113,1)', 2);
    this.run = false;
}

SiriWave.prototype = {

    _globalAttenuationFn: function (x) {
        return Math.pow(this.K * 4 / (this.K * 4 + Math.pow(x, 4)), this.K * 2);
    },

    _drawLine: function (attenuation, color, width) {
        this.ctx.moveTo(0, 0);
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width || 1;
        var x, y;
        for (var i = -this.K; i <= this.K; i += 0.01) {
            x = this.width * ((i + this.K) / (this.K * 2));
            y = this.height / 2 + this.noise * this._globalAttenuationFn(i) * (1 / attenuation) * Math.sin(this.F * i - this.phase);
            this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    },

    _drawZeroLine: function (color, width) {
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.beginPath()
        this.ctx.lineTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width || 1;

        this.ctx.stroke();
    },

    _clear: function () {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = 'source-over';
    },

    _draw: function () {
        if (!this.run) return;

        this.phase = (this.phase + this.speed) % (Math.PI * 64);
        this._clear();
        this._drawLine(-2, 'rgba(118,113,113,0.1)');
        this._drawLine(-6, 'rgba(118,113,113,0.2)');
        this._drawLine(4, 'rgba(118,113,113,0.4)');
        this._drawLine(2, 'rgba(118,113,113,0.6)');
        this._drawLine(1, 'rgba(118,113,113,1)', 2);

        requestAnimationFrame(this._draw.bind(this), 1000);
    },

    start: function () {
        this.phase = 0;
        this.run = true;
        this._draw();
    },

    stop: function () {
        this.run = false;
        this._clear();
        this._drawZeroLine('rgba(118,113,113,1)', 2);
    },

    pause: function () {
        this.run = false;
    },

    setNoise: function (v) {
        this.noise = Math.min(v, 1) * this.MAX;
    },

    setSpeed: function (v) {
        this.speed = v;
    },

    set: function (noise, speed) {
        this.setNoise(noise);
        this.setSpeed(speed);
    }

};
function getParams(url) {
    var vars = {},
        hash, hashes, i;

    url = url || window.location.href;

    // 没有参数的情况
    if (url.indexOf('?') == -1) {
        return vars;
    }

    hashes = url.slice(url.indexOf('?') + 1).split('&');

    for (i = 0; i < hashes.length; i++) {
        if (!hashes[i] || hashes[i].indexOf('=') == -1) {
            continue;
        }
        hash = hashes[i].split('=');
        if (hash[1]) {
            vars[hash[0]] = (hash[1].indexOf('#') != -1) ? hash[1].slice(0, hash[1].indexOf('#')) : hash[1];
        }
    }
    return vars;
}
function changeHtml(value){
    value = value.replace(/&/g, "&amp;");
    value = value.replace(/\t/g, "&nbsp;&nbsp;");//水平制表
    value = value.replace(/ /g, "&nbsp;");//空格
    value = value.replace(/</g, "&lt;");
    value = value.replace(/\>/g, "&gt;");
    value = value.replace(/\"/g, "&quot;");//英文引号
    value = value.replace(/\r\n/g,"<br/>");//换行
    value = value.replace(/\n/g,"<br/>");//换行
    value = value.replace(/\\n/g,"<br/>");//换行

    return value;
}
$(document).ready(function () {
    var audioDisplay = $('.audio-dispaly');
    var audioFile = $('#audioFile');
    var audioFileDom = audioFile[0];
    var SW;
    var param = getParams()
    audioFile.one('canplay', function () {
        console.log('audio canplay')
        $('.audio-dispaly').empty();
        SW = new SiriWave({
            width: audioDisplay.width(),
            height: 40,
            noise: 0.6,
            container: audioDisplay[0],
        });
    });
    audioFile.on('play', function () {
        console.log('audio play')
        $('.play-btn').removeClass('paused').addClass('playing');
        SW && SW.start();
    });
    audioFile.on('pause', function () {
        console.log('audio stop')
        $('.play-btn').removeClass('playing').addClass('paused');
        SW && SW.stop()
    });
    console.log(param)
    if (param.id) {
        $.ajax({
            url: 'http://paywhere.fast.im/index.php/home/Future/getShare',
            data: {
                id: param.id
            },
            dataType: 'json',
            success: function (data) {
                if (data.status === 0 && data.data) {
                    var mail = data.data[0];
                    audioFile.attr('src', mail.music_url);
                    $('#content').html(changeHtml(mail.content));
                }
            }

        })

        $('.play-btn').click(function () {
            var that = $(this);
            if (that.hasClass('paused')) {
                audioFileDom.play();
            } else {
                audioFileDom.pause();
            }

        })
    } else {
        $('#content').text('没有数据');
        $('.audio-dispaly span').text('没有音频');
    }
})


