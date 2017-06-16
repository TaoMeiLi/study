/**
 * Created by zhenmin on 2017/6/6.
 */
/**
 * @param option
 * @returns {boolean}
 * @constructor
 * option.ele ——> 挂载元素
 * option.evFocus(on/off) ——> 获取焦点时是否搜索（默认：off）
 * option.limitNum ——> 最大提示条数（默认：10）
 * option.dataSource ——> 数据源（type:array）
 * option.getSourceInterval ——> 获取数据时间间隔（默认：500ms）
 * option.attrGather ——> 数据项（type:json）
 * option.attrGather{
			 *      "txt":"",   //当数据源为json格式时，txt字段的值应为所需显示内容所在容器的字段（默认：txt）
			 *      "*":"*"     //当数据源为json格式时，*字段的值应为所需获得的其他信息所在容器的字段
			 * }
 * option.blurCallback ——> 失焦后的回调（type:function）
 * option.selectCallback ——> 选择后的回调（type:function）
 */
function TypeaheadDzm(option) {
	var that = this;
	option = option || {};
	if (!option.ele) {
		return false;
	}

	that.ele = option.ele;
	that.evFocus = option.evFocus || "off";
	that.limitNum = option.limitNum || 10;
	that.dataSource = option.dataSource || [];
	that.dataSourceTemporary = [];//临时的数据源
	that.getSourceInterval = option.getSourceInterval || 500;
	that.intervalTime = null;
	that.attrGather = option.attrGather || {};
	that.attrGather.txt = that.attrGather.txt || "txt";
	that.attrGatherArr = [];//所需信息字段集合
	that.attrGatherArrLen = 0;
	that.blurCallback = option.blurCallback || "";
	that.selectCallback = option.selectCallback || "";

	that.init(option);
}
TypeaheadDzm.prototype.init = function (option) {
	var that = this;
	that.eleOffset = that.ele.offset();
	that.ele.off();
	//将所需信息字段存储到attrGatherArr中
	for (var key in that.attrGather) {
		if (key == "txt")continue;
		that.attrGatherArr.push(that.attrGather[key]);
		that.attrGatherArrLen++;
	}

	that.doEvent(option);
}
TypeaheadDzm.prototype.doEvent = function (option) {
	var that = this;
	//创建提示框
	that.randomId = parseInt(Math.random() * 10000, 10);
	function setOnlyIdNum(){
		if($("#TypeaheadDzm" + that.randomId).length){
			that.randomId = parseInt(Math.random() * 10000, 10);
			setOnlyIdNum();
		}
	}
	setOnlyIdNum();
	that.typeaheadWrap = document.createElement("div");
	that.typeaheadWrap.id = "TypeaheadDzm" + that.randomId;

	that.ele.on("input", function () {
		that.getDataSource();
	});
	if (option.evFocus == "on") {
		that.fnFocus();
	}
	that.fnBlur();
}
TypeaheadDzm.prototype.fnFocus = function (option) {
	var that = this;

	that.ele.on("focus", function () {
		that.getDataSource();
	});
}
TypeaheadDzm.prototype.fnBlur = function (option) {
	var that = this;
	that.ele.on("blur", function () {
		$("#TypeaheadDzm" + that.randomId).css("display", "none");
		that.blurCallback && that.blurCallback(that.ele.val());
	});
}
//匹配挂载元素value值
TypeaheadDzm.prototype.strongStr = function (txt) {
	var that = this;
	var str = "",
		strArr = [],
		val = that.ele.val();
	val = $.trim(val);

	if (val && txt.indexOf(val) != -1) {
		strArr = txt.split(val);
		str = strArr.join('<strong>' + val + '</strong>');
	} else {
		str = txt;
	}
	return str;
}
//填充提示框
TypeaheadDzm.prototype.getDataSource = function () {
	var that = this;

	var dataSource = [];

	if ($.type(that.dataSource) == "array") {
		dataSource = that.dataSource;
		that.renderAheadWrap(dataSource);
	} else if ($.type(that.dataSource) == "function") {
		clearTimeout(that.intervalTime);
		that.intervalTime = setTimeout(function(){
			if(!that.ele.is(":focus")){
				return false;
			}
			that.dataSource(function(data){
				that.dataSourceTemporary = data;
				that.renderAheadWrap(that.dataSourceTemporary);
			});
		},that.getSourceInterval);
	} else {
		console.log("dataSource不是有效的数据源");
	}
}
TypeaheadDzm.prototype.renderAheadWrap = function(dataSource){
	var that = this;
	if(!that.ele.is(":focus")){
		return false;
	}
	if ($.type(dataSource) != "array") {
		console.log("dataSource不是有效的数据源");
		return false;
	}
	var liHtml = "",
		strData = "";
	for (var i = 0; i < dataSource.length && i < that.limitNum; i++) {
		if ($.type(dataSource[i]) == "string") {
			liHtml += '<li data-txt="' + dataSource[i] + '" style="line-height:1.8em;padding: 0 8px;cursor: pointer;">' + that.strongStr(dataSource[i]) + '</li>';
		} else if ($.type(dataSource[i]) == "object") {
			if (that.attrGatherArrLen) {
				strData = "";
				for (var j = 0; j < that.attrGatherArrLen; j++) {
					strData += ' data-' + that.attrGatherArr[j] + '="' + dataSource[i][that.attrGatherArr[j]] + '"';
				}
			}
			liHtml += '<li data-txt="' + dataSource[i][that.attrGather.txt] + '"' + strData + ' style="line-height:1.8em;padding: 0 8px;cursor: pointer;">' + that.strongStr(dataSource[i][that.attrGather.txt]) + '</li>';
		}
	}

	if (!$("#TypeaheadDzm" + that.randomId).length) {
		$("body").append(that.typeaheadWrap);
		$("#TypeaheadDzm" + that.randomId).addClass("typeahead");
		$("#TypeaheadDzm" + that.randomId).css({
			"background": "#fff",
			"border": "1px solid #ccc",
			"position": "absolute",
			"left": that.eleOffset.left,
			"top": that.eleOffset.top + parseInt(that.ele.outerHeight()) + 2,
			"width": that.ele.outerWidth()
		});
		$("#TypeaheadDzm" + that.randomId).off();
		$("#TypeaheadDzm" + that.randomId).on("mouseenter", function () {
			that.ele.off("blur");
		});
		$("#TypeaheadDzm" + that.randomId).on("mouseleave", function () {
			that.fnBlur();
		});
	}

	liHtml = '<ul>' + liHtml + '</ul>';
	$("#TypeaheadDzm" + that.randomId).html(liHtml);
	$("#TypeaheadDzm" + that.randomId).css("display", "block");

	$("#TypeaheadDzm" + that.randomId + " li").off();
	$("#TypeaheadDzm" + that.randomId + " li").on("click", function () {
		that.ele.val($(this).attr("data-txt"));
		$("#TypeaheadDzm" + that.randomId).css("display", "none");
		that.selectCallback && that.selectCallback($(this));
	});
}
window.TypeaheadDzm = TypeaheadDzm;
/*
new TypeaheadDzm({
	ele: $("input[type=text]"),
	evFocus: "on",
	"limitNum": 3,
	dataSource: [
		{
			"value": "a",
			"id": "11",
			"name": "1a"
		},
		{
			"value": "b",
			"id": "22",
			"name": "2b"
		},
		{
			"value": "c",
			"id": "33",
			"name": "3c"
		}
	],
	"dataSource":function (callback) {
		illScreenMd.queryIllList({},function(data){
			if(data.code=="000000"){
				var datas = data.result.entity.allFunction;
				callback && callback(datas);
			}else{
				alert(data.message)
			}
		});
	},
	"attrGather": {
		"txt": "value",
		"attr": "id",
		"attr2": "name"
	},
	"blurCallback": function (val) {
		console.log(val);
	},
	"selectCallback": function (ele) {
		console.log(ele);
	}
});*/
