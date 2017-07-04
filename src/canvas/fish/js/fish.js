/**
 * Created by ijiajia on 2016/7/19.
 */
// 鱼的大小
var FISH_SIZE=[
    null,
    {w: 55, h: 37, collR: 17},
    {w: 78, h: 64, collR: 24},
    {w: 72, h: 56, collR: 20},
    {w: 77, h: 59, collR: 22},
    {w: 107, h: 122, collR: 29}
];
function Fish(type){
    this.x=0;
    this.y=0;
    this.rotate=0;
    this.type=type;
    this.cur=0;
    this.iSpeed=2;

    this.move();
}
Fish.prototype.draw=function(gd){
    var w=FISH_SIZE[this.type].w;
    var h=FISH_SIZE[this.type].h;
    gd.save();
    gd.translate(this.x, this.y);
    gd.rotate(d2a(this.rotate)); // 弧度
    if(this.rotate>=90 && this.rotate<=270){
        gd.scale(1,-1);
    }
    // 画
    gd.drawImage(JSON['fish'+this.type],
        0,this.cur*h,w,h,
        -w/2,-h/2,w,h
    );
    gd.restore();
};
Fish.prototype.move=function(){
    // 鱼动
    var _this=this;
    setInterval(function(){
        _this.x+=Math.cos(d2a(_this.rotate))*_this.iSpeed;
        _this.y+=Math.sin(d2a(_this.rotate))*_this.iSpeed;
    }, 30);
    // 鱼尾巴动
    setInterval(function(){
        _this.cur++;
        if(_this.cur>=4){
            _this.cur=0;
        }
    }, 150);
};
// 判断子弹是否在鱼身体里面
Fish.prototype.isIn=function(x,y){
    var a=this.x-x;
    var b=this.y-y;

    var c=Math.sqrt(a*a+b*b);
    if(c<FISH_SIZE[this.type].collR){
        return true;
    }else{
        return false;
    }
};

















