function typegame(){
    // 定義字母物件
    this.objletter={};
    
    // --- 失敗提示語句庫 (打錯時出現) ---
    this.fails = ["Oops", "Try Again", "Missed", "Wrong"];

    // 建立遊戲函式
    this.creatGame();
    // 一開始出現的字母數量
    this.num=3;
    // 檢查字母出現是否存在重疊
    this.check();
    // 建立分數面板
    this.creatScore();
    // 分數
    this.score=0;
    // 第幾關
    this.stage=1;
    
    // 初始化按鍵監聽
    this.initKeyEvents();
    
    // 建立按鈕
    this.startGame();
    this.stopGame();
}

typegame.prototype={
    // --- 語音合成函式 (調整為沉穩速度) ---
    speak: function(text) {
        if ('speechSynthesis' in window) {
            // 先停止上一句，確保發音不延遲，但也不會太混亂
            window.speechSynthesis.cancel();
            
            var msg = new SpeechSynthesisUtterance();
            msg.text = text;       
            msg.lang = 'en-US';    
            msg.volume = 1;        
            // 語速設定：0.9 (比正常 1.0 稍慢一點，清楚不急促)
            msg.rate = 0.9; 
            msg.pitch = 1.0; // 正常語調
            
            window.speechSynthesis.speak(msg);
        }
    },

    // 建立遊戲場景
    creatGame:function(){
        var width1=$(window).width();
        $(".screen1").css({
            width:width1,
            height:$(window).height()-10,
            overflow:"hidden"
        });
    },

    // 建立字母
    creatletter:function(){
        var that=this;
        do{
            var randomnum=Math.floor(Math.random()*26+65);
            var randomletter=String.fromCharCode(randomnum);
        }while(this.objletter[randomletter]);
        
        var top1=-Math.round(Math.random()*100);
        do{
            var left1=Math.round(Math.random()*740);
        }while(this.check(left1));
        
        var time=new Date().getTime();
        
        var ele=$("<div data-time="+time+"></div>").css({
            width:"100px",height:"100px",
            background:"url(img/"+randomletter+".png) center no-repeat",backgroundSize:"contain"
            ,lineHeight:"60px",fontSize:"30px",color:"#fff",
            textAlign:"center",position:"absolute",left:left1,top:top1
        }).appendTo(".screen1").animate({top:$(window).height()},6000,"linear",function(){
            if($("div[data-time="+time+"]")[0]){
                that.num = 3;
                that.score=0;
                that.stage=1;
                $.each(that.objletter,function(index,value){
                    value.el.remove();
                });
                that.objletter={};
                // 失敗語音
                that.speak("Game Over");
                that.createFail();
            }
        });
        this.objletter[randomletter]={start:left1-60,end:left1+60,keycode:randomnum,el:ele}
    },

    playGame:function(){
        for(var i=0;i<this.num;++i){
            this.creatletter();
        }
    },

    check:function(left){
        var flag=false;
        $.each(this.objletter,function(index,value){
            if(left>value.start&&left<value.end){
                flag=true;
            }
        });
        return flag;
    },

    // --- 鍵盤監聽邏輯 (核心修改) ---
    initKeyEvents:function(){
        var that=this;
        $(document).off("keydown").on("keydown", function(e){
            var code=e.keyCode;
            var matchFound = false;

            $.each(that.objletter,function(index,value){
                if(code==value.keycode){
                    matchFound = true;
                    
                    // --- 修改點：打對時只唸字母 ---
                    var char = String.fromCharCode(code);
                    that.speak(char); // 這裡只傳入字母，不再加鼓勵語

                    // 移除元素與加分
                    value.el.remove();
                    delete that.objletter[index];
                    that.creatletter();
                    that.score++;
                    $(".score").html(that.score);
                    
                    // 過關判斷
                    if(that.score>=that.stage*10){
                        that.speak("Level Up"); // 簡單的過關提示
                        
                        that.score=0;
                        $(".score").html(0);
                        that.num++;
                        that.stage++;
                        $.each(that.objletter,function(index,value){
                            value.el.remove();
                        });
                        that.objletter={};
                        that.creatStage();
                    }
                    return false;
                }
            });

            // 錯誤回饋
            if (!matchFound) {
                if (code >= 65 && code <= 90) {
                    var randomFail = that.fails[Math.floor(Math.random() * that.fails.length)];
                    that.speak(randomFail); // 打錯時依然提示，但速度已變慢
                }
            }
        });
    },

    creatScore:function(){
        $("<div class='score'>0</div>").css({
            background:"url(fs.png) no-repeat",
            backgroundSize:"150px 180px",
            width:150,height:180,
            position:"absolute",right:25,bottom:60,color:"#522E1A",
            fontSize:"60px",lineHeight:"140px",textAlign:"center"
        }).appendTo("body");
    },

    creatStage:function(){
        var that=this;
        $("<div class='stage'></div>").css({
            position:"absolute",top:"-50%",bottom:0,right:0,left:0,
            background:"url(cg.png)",
            width:520,height:400,backgroundSize:"contain no-repeat",
            margin:"auto",
            borderRadius:"5%",
            animation:"cg 2s linear"
        }).appendTo("body");
        
        $("<div class='btn'></div>").css({
            position:"absolute",top:"235px",right:0,left:"65px",margin:"auto",
            background:"url(xy.png)",
            zIndex:9999,
            fontFamily:"幼圓",
            fontSize:"22px",
            width:100,height:40,
            marginTop:"200",
            color:"#fff",
            lineHeight:"40px",
            backgroundSize:"240px 300px",
            cursor:"pointer"
        }).appendTo(".stage").click(function(){
            that.playGame();
            $(this).parent().remove();
        });
    },

    createFail:function(){
        var that=this;
        if(this.failbord){
            this.failbord.remove();
        }
        var btn=$("<div></div>").css({
            width:160,height:35,textAlign:"center",lineHeight:"30px",
            margin:"0 auto",cursor:"pointer",
            position:"absolute",right:0,left:0,margin:"auto",bottom:"70px"
        }).click(function(){
            $(".score").html(0);
            that.playGame();
            $(this).parent().remove();
        });
        this.failbord=$("<div></div>").css({
            position:"absolute",top:"-50%",bottom:0,right:0,left:0,
            background:"url(sp1.png)",
            width:500,height:350,backgroundSize:"400px 340px",
            margin:"auto",
            borderRadius:"5%",
            backgroundSize:"contain no-repeat",
            animation:"cg 2s linear"
        }).appendTo("body").append(btn);
    },

    startGame:function(){
        var that=this;
        $("<div class='start'>開始遊戲</div>").css({
            width:130,height:50,textAlign:"center",lineHeight:"50px",
            margin:"0 auto",cursor:"pointer",
            background:"url(stop.png) no-repeat",
            backgroundSize:"130px 50px",
            color:"#392112",
            position:"absolute",
            left:"175px",bottom:0,
            fontWeight:"bold",
            marginTop:"55px"
        }).appendTo("body").click(function(){
            if(window.speechSynthesis) window.speechSynthesis.cancel();
            that.playGame();
            $(this).remove();
        })
    },

    stopGame:function(){
        var that=this;
        $(".stop1").click(function(){
            $.each(that.objletter,function(index,value){
                value.el.stop();
            });
            if($(".stop1").html()=="暫停遊戲"){
                 $(".stop1").html("繼續遊戲");
            }else if($(".stop1").html()=="繼續遊戲"){
                $(".stop1").html("暫停遊戲");
                $.each(that.objletter,function(index,value){
                    value.el.animate({top:$(window).height()},6000,"linear",function(){
                        that.num=3;
                        that.stage=1;
                        that.score=0;
                        $.each(that.objletter,function(index,value){
                            value.el.remove();
                        });
                        that.objletter={};
                        that.createFail();
                    })
                })
            }
        })
    }
};