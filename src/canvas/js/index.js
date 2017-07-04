	var canvas = document.getElementById('canvas'),
		pen = canvas.getContext('2d');

	//清除画布
	function clear() {
		pen.clearRect(0,0, pen.canvas.width, pen.canvas.height);
	}

		pen.beginPath();
		pen.translate(100,100);
		pen.rotate(Math.PI*2/4);
		pen.fillText('哈哈哈',29,20);
		pen.closePath();

	// (function(){
	// 	pen.beginPath();
	// 	pen.moveTo(51,0);
	// 	pen.lineTo(20,20);
	// 	pen.stroke();
	// 	pen.closePath();

	// 	pen.beginPath();
	// 	pen.arc(30,30,30,0,2*Math.PI);
	// 	pen.stroke();
	// 	pen.closePath();


	// 	pen.beginPath();
	// 	pen.strokeStyle='red';
	// 	pen.font="30px arial";
	// 	pen.strokeText('meili', 100,70);
	// 	pen.closePath();

	// 	//创建线性渐变；
	// 	var grd = pen.createLinearGradient(100,100,300,250);
	// 	grd.addColorStop(0,"red");
	// 	grd.addColorStop(0.5,"pink");
	// 	grd.addColorStop(1,"blue");
	// 	//填充渐变
	// 	pen.beginPath();
	// 	pen.fillStyle = grd;
	// 	pen.fillRect(100,100,200,150);
	// 	pen.closePath();
	// 	//创建线性渐变；
	// 	var grd = pen.createLinearGradient(100,300,400,350);
	// 	grd.addColorStop(0,"red");
	// 	grd.addColorStop(0.5,"pink");
	// 	grd.addColorStop(1,"black");

	// 	pen.beginPath();
	// 	pen.strokeStyle = grd;
	// 	pen.strokeRect(100,300,200,150);
	// 	pen.closePath();

	// 	//创建线性渐变；
	// 	var grd = pen.createLinearGradient(400,400,430,430);
	// 	grd.addColorStop(0,"red");
	// 	grd.addColorStop(1,"black");

	// 	pen.fillStyle = grd;
	// 	pen.font="30px";
	// 	pen.fillText("微生活", 400, 400);

	// 	//创建放射性渐变
	// 	var rad = pen.createRadialGradient(500,100,10,500,100,100);
	// 	rad.addColorStop(0,"purple");
	// 	rad.addColorStop(1,"red");

	// 	pen.fillStyle = rad;
	// 	pen.fillRect(400,0,200,200);



	// 	//划线 线端点样式
	// 	pen.beginPath();
	// 	pen.strokeStyle='red';
	// 	pen.lineWidth = 10;
	// 	pen.moveTo(10,250);
	// 	pen.lineTo(50,250);
	// 	pen.stroke();
	// 	pen.closePath();

	// 	pen.beginPath();
	// 	pen.strokeStyle='red';
	// 	pen.lineWidth = 10;
	// 	pen.lineCap = "square";
	// 	pen.moveTo(10,280);
	// 	pen.lineTo(50,280);
	// 	pen.stroke();
	// 	pen.closePath();

	// 	pen.beginPath();
	// 	pen.strokeStyle='red';
	// 	pen.lineWidth = 10;
	// 	pen.lineCap = "round";
	// 	pen.moveTo(10,310);
	// 	pen.lineTo(50,310);
	// 	pen.stroke();
	// 	pen.closePath();

	// 	// //canvas插入图片
	// 	// var canvasimg = document.getElementById('canvasimg');
	// 	// var penimg = canvasimg.getContext('2d');
	// 	// var img = document.getElementById('img');
	// 	// img.onload = function() {
	// 	// 	penimg.drawImage(img,0,0);
	// 	// }


	// //笑脸
	// 	pen.translate(1000,20);
	// 	pen.beginPath();
	// 	pen.strokeStyle='red';
	// 	pen.lineWidth = 5;
	// 	pen.arc(100,100,50,0,2*Math.PI);
	// 	pen.moveTo(70,70);
	// 	pen.lineTo(90,70);
	// 	pen.moveTo(110,70);
	// 	pen.lineTo(130,70);
	// 	pen.moveTo(95,90);
	// 	pen.lineTo(105,90);
	// 	pen.lineTo(100,100);
	// 	pen.lineTo(95,90);
	// 	pen.stroke();
	// 	pen.closePath();

	// 	pen.beginPath();
	// 	pen.arc(100,125,10,0,1*Math.PI);
	// 	pen.stroke();
	// 	pen.closePath();


	// //保存和恢复
	// 	pen.translate(-300,0);
	// 	pen.fillStyle="black";
	// 	pen.fillRect(0,0,300,300);
	// 	pen.save();

	// 	pen.fillStyle = "red";
	// 	pen.fillRect(30,30,240,240);
	// 	pen.save();


	// 	pen.fillStyle = "pink";
	// 	pen.fillRect(50,50,200,200);
	// 	pen.save();

	// 	pen.restore();
	// 	pen.fillRect(70,70,180,180);

	// 	pen.restore();
	// 	pen.fillRect(60,60,180,180);

	// 	pen.restore();
	// 	pen.fillRect(100,100,100,100);
	// });

// 位移 translate(x,y); 游走的点
	// (function (){
		// var step = 0;
		// setInterval(function(){
		// 	step ++;
		// 	pen.clearRect(0,0,300,400);
		// 	if(step <= 25) {
		// 		pen.translate(10, 0);
		// 	} else {
		// 		pen.translate(-10, 0);
		// 		if(step >= 50){
		// 			step = 0;
		// 		}
		// 	}
		// 	pen.fillRect(0,30,5,5);
		//
		// },30);
	// });

// 合成和剪裁	globalCompositeOperation = type ：刮刮乐
// 	(function(){
// 		pen.fillStyle = "#fff";
// 		pen.fillRect(0,0,1200,600);
// 		pen.globalCompositeOperation = "destination-out";
// 		//要禁用页面的鼠标选中拖动的事件，就是不运行执行选中操作。
// 		var bodyStyle = document.body.style;
// 		bodyStyle.mozUserSelect = 'none';
// 		bodyStyle.webkitUserSelect = 'none';

// 		var mousedown=false;

// 		function eventDown(e){
// 	        e.preventDefault();
// 	        mousedown=true;
// 	    }

// 	    function eventUp(e){
// 	        e.preventDefault();
// 	        mousedown=false;
// 	    }

// 	    function eventMove(e){
// 	        e.preventDefault();
// 	        if(mousedown) {
// 	            var x=event.clientX,
// 					y=event.clientY;
// 	            with(pen) {
// 	                beginPath()
// 	                arc(x, y, 10, 0, Math.PI * 2);//绘制圆点
// 	                fill();
// 	            }
// 	        }
// 	    }
// 	    canvas.addEventListener('mousedown', eventDown);
//     	canvas.addEventListener('mouseup', eventUp);
//     	canvas.addEventListener('mousemove', eventMove);
// 	}());

// //变幻线
// 	(function(){
// 		var w = canvas.width,		//获取画布宽高 (运动的点不能超出画布范围)
// 			h = canvas.height,
// 			pointlength = 10, 		//画布上点的个数
// 			pintArray = [],			//存储这几个点的坐标
// 			oldPintArray = [],		//存储点运动的轨迹坐标（为了营造有阴影的效果，我们把每条线后都加上颜色渐浅的跟随线）
// 			lineArray = [],			//存储这些跟随线的点的坐标
// 			followlength = 20,		//设置跟随线的条数（也就是跟随点点条数，因为这些线都是由点连接起来的，是不）
// 			rgb;					//颜色值
// 			canvas.style.background = "#000";
// 		//随机数
// 		function ran(n,m) {
// 			var num = parseInt(Math.random() * (m - n) + n);
// 				return num;
// 		}
// 		//随机出现点的坐标和速度并储存到pintArray中；
// 		for (var i = 0; i<pointlength; i++){
// 			pintArray.push({
// 				'x': ran(0,w),
// 				'y': ran(0,h),
// 				'spx': ran(-10,10),
// 				'spy': ran(-10,10)
// 			});
// 		}
// 		//为了让页面的线看起来更炫，我们让线每隔一段时间改变一个颜色
// 		setInterval(function() {
// 			rgb = ran(0,256)+","+ran(0,256)+","+ran(0,256);
// 		},2000);

// 		setInterval(function() {
// 			oldPintArray =[];
// 			for (var i = 0; i<pintArray.length; i++){
// 				oldPintArray.push({					//记录并存储每个点运动过坐标的，也就是辅助线的点的坐标
// 					'x': pintArray[i].x,
// 					'y': pintArray[i].y
// 				})
// 				pintArray[i].x = pintArray[i].x + pintArray[i].spx;
// 				pintArray[i].y = pintArray[i].y + pintArray[i].spy;
// 				if(pintArray[i].x<0 || pintArray[i].x>w) {
// 					pintArray[i].spx = -pintArray[i].spx;
// 				}
// 				if(pintArray[i].y<0 || pintArray[i].y>h) {
// 					pintArray[i].spy = -pintArray[i].spy;
// 				}
// 			}
// 			lineArray.push(oldPintArray);
// 			if(lineArray.length>10){
// 				lineArray.shift();
// 			}
// 			clear();
// 			//画pointlength个点,连线;pointlength为点的个数
// 			pen.beginPath();
// 			pen.strokeStyle = "rgba("+rgb+",1)";		//线的颜色
// 			pen.moveTo(pintArray[0].x,pintArray[0].y);	//画第一个点的坐标
// 			for( var j = 1; j<pointlength; j++){		//剩下的点
// 				pen.lineTo(pintArray[j].x,pintArray[j].y);
// 			}
// 			pen.closePath();
// 			pen.stroke();

// 			for(var i = 0; i<lineArray.length; i++) {
// 				pen.beginPath();
// 				pen.strokeStyle = "rgba("+ rgb +","+ i/lineArray.length+")";//改变辅助线的透明度，距离运动点越远点的，透明度越低
// 				pen.moveTo(lineArray[i][0].x,lineArray[i][0].y); //绘制辅助线
// 				for(var j = 1; j<lineArray[i].length; j++) {
// 					pen.lineTo(lineArray[i][j].x,lineArray[i][j].y);
// 				}
// 				pen.closePath();
// 				pen.stroke();
// 			}

// 		},30);

	// });
