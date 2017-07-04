/**
 * Created by ijiajia on 2016/7/19.
 */
function Coin(type){
    this.x=0;
    this.y=0;
    this.cur=0;
    this.type=type;

    this.move();
}
Coin.prototype.draw=function(gd){
    gd.save();
    if(this.type<=2){
        gd.drawImage(JSON['coinAni1'],
            0,(this.cur%10)*60,60,60,
            this.x,this.y,60,60
        );
    }else{
        gd.drawImage(JSON['coinAni2'],
            0,(this.cur%10)*60,60,60,
            this.x,this.y,60,60
        );
    }
    gd.restore();
};
Coin.prototype.move=function(){
    var _this=this;
    setInterval(function(){
        _this.cur++;
    }, 30);

    setInterval(function(){
        _this.x+=(0-_this.x)/10;
        _this.y+=(600-_this.y)/10;
    }, 80);
};
Coin.prototype.songPlay=function(){
    var oAudio=new Audio();
    oAudio.src='snd/coin.wav';
    oAudio.play();
};








