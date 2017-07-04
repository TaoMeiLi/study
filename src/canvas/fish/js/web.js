/**
 * Created by ijiajia on 2016/7/19.
 */
function Web(){
    this.x=0;
    this.y=0;
    this.scale=0.5;
}
Web.prototype.draw=function(gd){
    gd.save();
    gd.translate(this.x, this.y);
    gd.scale(this.scale, this.scale);
    gd.drawImage(JSON['web'],
        22,23,200,200,
        -100,-100,200,200
    );
    gd.restore();
};