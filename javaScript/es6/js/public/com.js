/**
 * H5页面适配
 * size/100=rem;通过rem转换
 */
	var docEl = document.documentElement,
		userWidth = parseInt(docEl.getAttribute('data-user-width')),
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
	userWidth = userWidth.toString() === 'NaN' ? 750 : userWidth;
	function recalc() {
		//设置根字体大小
		docEl.style.fontSize = 100 * (docEl.clientWidth / userWidth) + 'px';
	};
	window.addEventListener(resizeEvt, recalc, false);
	document.addEventListener('DOMContentLoaded', recalc, false);

/**
 * @param {Object} fn ==> DomReady完成后的回调函数
 */
	function domReady(fn) {
		if(document.addEventListener) {
			document.addEventListener('DOMContentLoaded', function() {
				fn && fn();
			}, false);
		} else {
			document.attachEvent('onreadystatechange', function() {
				fn && fn();
			});
		}
	}

/**
 * phoneParams获取设备参数
 */
	//判断手机类型
	var browser = {
		versions: function() {
			var u = navigator.userAgent,
				app = navigator.appVersion;
			return { //移动终端浏览器版本信息 
				trident: u.indexOf('Trident') > -1, //IE内核
				presto: u.indexOf('Presto') > -1, //opera内核
				webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
				mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
				android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
				iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
				iPad: u.indexOf('iPad') > -1, //是否iPad
				webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
			};
		}()
	}
	//获取手机参数
	phoneParams = {
		// 手机分辨率：宽度
		"phoneWidth": window.screen.width,
		// 手机分辨率：高度
		"phoneHeight": window.screen.height,
		// 浏览器窗口的宽度
		"clientWidth": document.documentElement.clientWidth,
		// 浏览器窗口的高度
		"clientHeight": document.documentElement.clientHeight,
		// 当前手机操作系统
		"currentPhoneSys": ''
	};
	!function() {
		if(browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {
			phoneParams.currentPhoneSys = "ios";
		} else if(browser.versions.android) {
			phoneParams.currentPhoneSys = "android";
		}
	}();

/**
 * @param {Object} fn ==> 页面滚动到底部后的回调函数
 */
	function loadMore(fn) {
		var body = docEl.getElementsByTagName('body')[0];
		function scrollBottom() {
			if(body.offsetHeight < (scrollY + phoneParams.clientHeight + 2)) {
				fn && fn(scrollY + phoneParams.clientHeight);
			}
		}
		$(document).on('scroll', scrollBottom);
	}
	
	/*//瀑布流案例
	function getMoreElement(container,listNum){
		var children=$(container).children();
		//minHeight高度最小的列
		var minHeight='';
		for (var i = 0; i < listNum; i++) {
			minHeight=children.sort(function(n1,n2){
				return $(n1).height()-$(n2).height();
			})[0];
			$(minHeight).append('<li>'+i+'</li>');
		}
	}
	loadMore(function(){
		getMoreElement('父级容器选择器','加载个数');
	});*/

//添加底部导航
/**
 * @param {Object} n --> 隶属于那个页面
 * n=1 首页
 * n=2 商城
 * n=3 匠人
 * n=4 个人中心
 */
	function pushFooter(n){
		domReady(function(){
			var oFooter=document.createElement('footer');
			oFooter.setAttribute('class','bottom-nav-bar');
			switch (n){
			case 1:
				oFooter.innerHTML='<ul class="clearfix">'+
					'<li class="fl clearfix active"><a href="/phone/index/index" class="fl"><i class="img"></i><p>首页</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/index/store" class="fl"><i class="img"></i><p>商城</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/v2controller/designer_index" class="fl"><i class="img"></i><p>匠人</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/center/center" class="fl"><i class="img"></i><p>我的</p></a></li>'+
				'</ul>';
				break;
			case 2:
				oFooter.innerHTML='<ul class="clearfix">'+
					'<li class="fl clearfix"><a href="/phone/index/index" class="fl"><i class="img"></i><p>首页</p></a></li>'+
					'<li class="fl clearfix active"><a href="/phone/index/store" class="fl"><i class="img"></i><p>商城</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/v2controller/designer_index" class="fl"><i class="img"></i><p>匠人</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/center/center" class="fl"><i class="img"></i><p>我的</p></a></li>'+
				'</ul>';
				break;
			case 3:
				oFooter.innerHTML='<ul class="clearfix">'+
					'<li class="fl clearfix"><a href="/phone/index/index" class="fl"><i class="img"></i><p>首页</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/index/store" class="fl"><i class="img"></i><p>商城</p></a></li>'+
					'<li class="fl clearfix active"><a href="/phone/v2controller/designer_index" class="fl"><i class="img"></i><p>匠人</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/center/center" class="fl"><i class="img"></i><p>我的</p></a></li>'+
				'</ul>';
				break;
			case 4:
				oFooter.innerHTML='<ul class="clearfix">'+
					'<li class="fl clearfix"><a href="/phone/index/index" class="fl"><i class="img"></i><p>首页</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/index/store" class="fl"><i class="img"></i><p>商城</p></a></li>'+
					'<li class="fl clearfix"><a href="/phone/v2controller/designer_index" class="fl"><i class="img"></i><p>匠人</p></a></li>'+
					'<li class="fl clearfix active"><a href="/phone/center/center" class="fl"><i class="img"></i><p>我的</p></a></li>'+
				'</ul>';
				break;
			}
			document.getElementsByTagName('body')[0].appendChild(oFooter);
		});
	};

//图片缩略图
domReady(function(){
	var aImg=document.querySelectorAll('img');
	for (var i = 0; i < aImg.length; i++) {
		aImg[i].classList.add('images-unload');
	}
	
	//去掉loading图
	setTimeout(function(){
		for (var i = 0; i < aImg.length; i++) {
			aImg[i].classList.remove('images-unload');
		}
	},1000)
	
	
});

