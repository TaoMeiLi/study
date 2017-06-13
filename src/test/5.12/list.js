define('member/list', [
	'jquery',
	'underscore',
	'typeahead',
	'welife',
	"text!/tmpl/coupon-modal-body-template.html",
	"modules/date",
	"modules/shops_with_area",
	"modules/popovers"
], function ($, _, typeahead, we, modal_body_tmpl) {

	'use strict';

	function _isActual() {
		return $('.pagetype').find('.active').data('type') === 'actual';
	}

	var Controller = function (element, options) {
			this.$element = element ? $(element) : $('.mainbody');
			this.options = $.isPlainObject(options) ? options : {};
			this.$elements = this.$element;
			this.unlockModal = this.$elements.find('.unlock-modal');
			this.lockModal = this.$elements.find('.lock-modal');
			this.init();
			this.initMultiCardsLogic();
			$('[data-toggle="tooltip"]').tooltip();
		},
		prototype = Controller.prototype;

	prototype.init = function () {
		var levelId,
			$this = this.$element,total,
			$pthis = this,
			$uid = $this.find('#uid'),
			uid = $uid.data('uid'),
			uidNum = $uid.find('#uidNum'),
			uData = function(key){
				return $uid.data(key); 
			},
			isBindPhone = $uid.data('isbind'),
			userPhone = $uid.data('phone'),
			userNum = $uid.data('num'),
			// userLevel = $uid.data('level'),
			userBirthday = $uid.data('birthday'),

			userId = $this.find('#userId'),
			usave = userId.find('a').data('usave'),
			memUserId = $this.find('#memUserId'),
			$couponModal = $this.find('.coupon-detail-modal'),
			$creditModal = $this.find('.credit-detail-modal'),
			$infoModal = $this.find('.more-info-modal'),

			$editModal = $this.find('.edit-info-modal'),
			//$confirmModal = $this.find('.confirm-info-modal'),
			$editActualModal = $this.find('.edit-actual-modal'),
			//$confirmActualModal = $this.find('.confirm-actual-modal'),

			$getVxpay = $this.find('.get-vxpay-modal'),
			$adjustStored = $this.find('.adjust-stored-modal'),
			$confirmAdjust = $this.find('.confirm-adjust-modal'),
			$adjustPoint = $this.find('.adjust-point-modal'),
			$confirmPoint = $this.find('.confirm-point-modal'),
			$adjustGift = $this.find('.adjust-gift-modal'),
			$confirmGift = $this.find('.confirm-gift-modal'),
			$vxpayIpt = $getVxpay.find('.vxpay-input'),
			// $confirmForm = $('.confirm-form'),
			$inputVIPLevel = $('#inputVIPLevel'),
			$inputBirthday = $('#inputBirthday'),
			$uName = $('#uName'),
			$uSex = $('#uSex'),
			//$memName = $('#memName'),
			//$memSex = $('#memSex'),
			$cardPhone = $('#cardPhone'),
			$cardName = $('#cardName'),
			$cardSex = $('#cardSex'),
			$cardVIPLevel = $('#cardVIPLevel'),
			$cardBirthday = $('#cardBirthday'),
			//$memCardPhone = $('#memCardPhone'),
			//$memCardName = $('#memCardName'),
			//$memCardSex = $('#memCardSex'),
			//$memCardVIPLevel = $('#memCardVIPLevel'),
			//$memCardBirthday = $('#memCardBirthday'),
			//$memVIPLevel = $('#memVIPLevel'),
			//$memBirthday = $('#memBirthday'),
			$storedType = $('#storedType'),
			$storedAmount = $('#storedAmount'),
			$storedReceipts = $("#storedReceipts"),
			$storedReward = $("#storedReward"),
			$storedShops = $('#storedShops'),
			$storedNote = $('#storedNote'),
			$pointType = $('#pointType'),
			$pointAmount = $('#pointAmount'),
			$pointShops = $('#pointShops'),
			$pointNote = $('#pointNote'),
			$giftAdd = $('#giftAdd'),
			$giftRomove = $('#giftRomove'),
			$giftType = $('#giftType'),
			$giftName = $('#giftName'),
			$giftNum = $('#giftNum'),
			$giftShops = $('#giftShops'),
			$giftTotalvalue = $('#giftTotalvalue'),
			$giftNote = $('#giftNote'),
			$giftSearch = $('#giftSearch');	//调整券搜索框 

		/**
		 * 设置性别
		 * @param  {Number} sex 0空，1男，2女
		 * @return {void}
		 */
		/*function changeSex(sex, $ele) {
			$ele.data('sex', sex).html(['','男','女'][sex]);
			console.log('set sex:', sex, $ele);
		}*/
		/**
		 * 设置公历农历
		 * @param  {Number} c 1公里，2农历
		 * @return {void}
		 */
		/*function changeCale(c, $ele) {
			$ele.find('b').data('calendar', c).text(['', '公历', '农历'][c]);
			console.log('set calendar: ', c, $ele);
		}*/
    //限制卡号/手机号只能输入数字和字母
		$("#inputMemberId").on("input", function () {
			var val = $(this).val(),
				num = $(this).data("num"),
				reg= /^[0-9a-zA-Z]*$/g;
			if (reg.test(val)) {
				$(this).data("num",val);
			} else {
				$(this).val(num);
			}
		});

		$("#coupons").on('change', function(){
			var num = $(this).val();
			if(parseInt(num) === 1){
				$giftAdd.show();
				$giftRomove.hide();
			}else{
				$giftAdd.hide();
				$giftRomove.show();
			}
		});

		usave = (usave > 0) ? '您确定要解绑该手机号吗？该会员有储值余额，解绑后将无法使用储值，重新绑定手机号后可正常使用储值！' : '确定要解绑该手机号吗？';
		we.popoverConfirm({
			message: usave,
			confirm: function () {
				var $this = $(this),
					data = $this.data();

				// 进行删除操作
				$.ajax(data.url, {
					async: false,
					type: "post",
					data: {uid: uid},
					dataType: "json",
					success: function (response) {
						if(response.errcode){
							alert(response.errmsg);
						}else{
							we.respond(response, {
								success: function () {
									$this.remove();
									isBindPhone = false;
									userId.find('span').html(userNum + '&nbsp;&nbsp;已解绑&nbsp;&nbsp;');
									userId.find('span').addClass('danger');
									uidNum.html(userPhone);
								}
							});
						}
					}
				});
			}
		});

		$('input[type=text][format=money]').bind('keyup',function(e) {
			$(this).val($(this).val().replace(/[^\d.]/g, '').replace('..', '.'));
		});

		$('input[type=text][format=number]').bind('keyup',function() {
			$(this).val($(this).val().replace(/[^\d]/g, ''));
		});

		//获取某天日期
		function GetDateStr(AddDayCount){
			var dd = new Date();
			dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
			var y = dd.getFullYear();
			var m = dd.getMonth()+1;//获取当前月份的日期
			var d = dd.getDate();
			return y+"-"+m+"-"+d;
		}
		var tomorrowDate = GetDateStr(1);
		we.date($this,{
			endViewDate: '',
			endDate: tomorrowDate
		});
		//去除空格
		$getVxpay.find('input').on('keyup', function(){
			this.value = this.value.replace(/\D/,'');
		});

    //调整储值增加还是扣减
//
//		$("#stored").on("change", function () {
//			if (parseInt($(this).val()) === 1) {
//				$(".money-box").addClass("hide");
//				$(".receipts-box").removeClass("hide");
//				$(".reward-box").removeClass("hide");
//			} else if (parseInt($(this).val()) === 2) {
//				$(".money-box").removeClass("hide");
//				$(".receipts-box").addClass("hide");
//				$(".reward-box").addClass("hide");
//			}
//		});


		$this.on('click', '[data-toggle^="member"]', function () {
			var $this = $(this),
				data = $this.data(),
				toggle = data.toggle.replace('member.', '');

			if (typeof $pthis.funcs[toggle] === 'function') {
				return $pthis.funcs[toggle].apply($pthis, [$this, data]);
			}

			if ($this.hasClass('disabled')) {
				return;
			}

			switch (toggle) {
				case 'coupon':
					data = $.extend({}, $this.closest('tr').data()); // 复制一份，避免改变原对象
					data.name = data.value ? String(data.name).replace(/^\d+\u5143/, "") : data.name; // 将名称中的“**元”删除
					data.term = data.term.split(/\s*\,\s*/);
					$couponModal.find('.modal-body').html(_.template(modal_body_tmpl)(data));
					$couponModal.modal();
					break;

				case 'credit':
					data = $this.closest('tr').data();
					if (data.content) {
						$creditModal.find('.modal-body').html(data.content);
						$creditModal.modal();
					}
					break;

				case 'info':
					$infoModal.modal();
					break;

				case 'edit':
					$inputBirthday.val(userBirthday);
					$('#uCustom1', $editModal).val(uData('custom1'));
					$('#uCustom2', $editModal).val(uData('custom2'));
					$('#uCustom3', $editModal).val(uData('custom3'));
					$('#uCustom4', $editModal).val(uData('custom4'));
					$('#uCustom5', $editModal).val(uData('custom5'));
					if(_isActual()){
						$editActualModal.modal({
							backdrop: 'static',
							keyboard: false,
							show: true
						});
					}else{
						$editModal.modal({
							backdrop: 'static',
							keyboard: false,
							show: true
						});
					}

					break;

			/*case 'confirm':
				!function() {
					var sex = $uSex.find('.we-radio.checked input').val() || 0,
						calendar = $('[data-name="calendar"].checked input').val();
					// 性别
					changeSex(sex, $memSex);
					// 公历or农历
					changeCale(calendar, $memBirthday);

					//自定义
					$('#memCustom', $confirmModal).html(
						$('#uCustom', $editModal).val()
					);

					if (!isBindPhone) {
						memUserId.html(userPhone);
					}
					levelId = $inputVIPLevel.val();
					$memVIPLevel.html($inputVIPLevel.find('option:selected').text());
					$memName.html($.trim($uName.val()));
					$memBirthday.find('span').text($inputBirthday.val());
					$confirmModal.modal();
				}();
				break;
    */
				case 'confirm':
					!function() {

						if (!isBindPhone) {
							memUserId.html(userPhone);
						}
						levelId = $inputVIPLevel.val();
						var birthday = $inputBirthday.val(),
							calendar = $('[data-name="calendar"].checked input').val(),
							username = $.trim($uName.val()),
							sex = $uSex.find('.we-radio.checked input').val() || 0,
							editInfoUrl = $this.data('url'),
							reqObj = {
								url: editInfoUrl,
								type: 'post',
								dataType: 'json',
								data: {
									uid: uid,
									userGrade: levelId,
									birthday: birthday,
									calendar: calendar,
									username: username,
									sex: sex,
									custom1: $('#uCustom1').val(),
									custom2: $('#uCustom2').val(),
									custom3: $('#uCustom3').val(),
									custom4: $('#uCustom4').val(),
									custom5: $('#uCustom5').val()
								}
							};
						$.ajax(reqObj).then(function(response){
							if(response.errcode){
								alert(response.errmsg);
							}else{
								we.respond(response, {
									assignDelay: 800
								});
								window.setTimeout('location.reload()',2500);
							}
						});
					}();
					break;
				case 'card':
					!function() {
						levelId = $cardVIPLevel.val();
						var reg = /1[34578]{1}\d{9}$/,
							birthday = $cardBirthday.val(),
							calendar = $('[data-name="cardCalendar"].checked input').val(),
							username = $cardName.val(),
							sex = $cardSex.find('.we-radio.checked input').val() || 0,
							phone = $cardPhone.find('input').val(),
							cardUrl = $this.data('url');

						if(!reg.test(phone)){
							we.msg('请输入正确的手机号', 4);
							return false;
						} else{
							$.ajax(cardUrl, {
								type: 'post',
								dataType: 'json',
								data: {
									uid: uid,
									phone: phone,
									userGrade: levelId,
									birthday: birthday,
									calendar: calendar,
									username: username,
									sex: sex
								},
								success: function(response){
									if(response.errcode){
										we.msg(response.errmsg, 4);
									}else{
										we.respond(response, {
											assignDelay: 800
										});
										window.setTimeout('location.reload()',2500);
									}
								}
							});
						}
					}();
					break;

				case 'getvxpay':
					$getVxpay.modal();
					break;

				case 'trading':
					var vxpayUrl = $this.data('url'),
						vxpayIpt = $vxpayIpt.find('input').val();
					if(vxpayIpt == ''){
						alert('请输入交易单号');
					}else if(vxpayIpt.length > 50){
						alert('输入长度不能超过50字符');
					}else{
						$.ajax({
							url: vxpayUrl,
							type: 'post',
							dataType: 'json',
							data: {
								number: vxpayIpt
							},
							success: function(response){
								if(response.errcode){
									alert(response.errmsg);
								}else{
									we.respond(response, {
										assignDelay: 800
									});
									$getVxpay.modal('hide');
								}
							}
						});
					}
					break;

			/*case 'submit':
				!function() {
					var birthday = $memBirthday.find('span').text(),
						calendar = $memBirthday.find('b').data('calendar'),
						username = $memName.text(),
						sex = $memSex.data('sex'),
						editInfoUrl = $this.data('url'),
						reqObj = {
							url: editInfoUrl,
							type: 'post',
							dataType: 'json',
							data: {
								uid: uid,
								userGrade: levelId,
								birthday: birthday,
								calendar: calendar,
								username: username,
								sex: sex,
								custom: $('#memCustom', $confirmModal).html()
							}
						};

					$.ajax(reqObj).then(function(response){
						if(response.errcode){
							alert(response.errmsg);
						}else{
							we.respond(response, {
								assignDelay: 800
							});
							window.setTimeout('location.reload()',2500);
						}
					});
				}();
				break;*/

			/*case 'memcard':
				!function() {
					var birthday = $memCardBirthday.find('span').text(),
						calendar = $memCardBirthday.find('b').data('calendar'),
						username = $memCardName.text(),
						sex = $memCardSex.data('sex'),
						phone = $memCardPhone.data('phone'),
						cardUrl = $this.data('url');
					$.ajax({
						url: cardUrl,
						type: 'post',
						dataType: 'json',
						data: {
							uid: uid,
							phone: phone,
							userGrade: levelId,
							birthday: birthday,
							calendar: calendar,
							username: username,
							sex: sex
						},
						success: function(response){
							if(response.errcode){
								alert(response.errmsg);
							}else{
								we.respond(response, {
									assignDelay: 800
								});
								window.setTimeout('location.reload()',2500);
							}
						}
					});
				}();
				break;*/

				case 'stored':
					$adjustStored.modal({
						backdrop: 'static',
						keyboard: false,
						show: true
					});
					total = parseFloat($this.data('total'));
					break;

				case 'adjuststored':
					var sType = $('#stored').val(),
						sAmount = parseFloat($('#sMoney').val()).toFixed(2),
						sReceipts = parseFloat($('#sReceipts').val()).toFixed(2),
						sReward = parseFloat($('#sReward').val()).toFixed(2),
						sShopsId = $('.adjust-stored-modal').find('input[name="shop"]').val(),
						sShops = $('.adjust-stored-modal').find('input[name="shop"]').data('names'),
						sNote = $('#sNote').val();

					if(sNote == ''){
						we.msg("请填写备注", 4);
						return;
					}
					if(sShopsId == 0){
						we.msg("请选择门店", 4);
						return;
					}

					$storedType.attr('data-type', sType);
					if(parseInt(sType) === 1){
						if(sReceipts == 'NaN'){
							we.msg("请填写调整实收额", 4);
							return;
						}
						if(sReward == 'NaN'){
							we.msg("请填写调整奖励额", 4);
							return;
						}
						if((parseFloat(sReceipts) + parseFloat(sReward)) > 50000){
							we.msg("调整储值额（实收+奖励）不得大于50000元", 4);
							return;
						} else if ((parseFloat(sReceipts) + parseFloat(sReward)) == 0) {
							we.msg("调整储值额（实收+奖励）必须大于0", 4);
							return;
						}
						$(".modal-receipts").removeClass("hide");
						$(".modal-reward").removeClass("hide");
						$storedType.html('增加');
						$storedAmount.html((parseFloat(sReceipts) + parseFloat(sReward)).toFixed(2));
						$storedReceipts.html(sReceipts);
						$storedReward.html(sReward);
					}else{
						if(sAmount == 'NaN'){
							we.msg("请填写调整储值额", 4);
							return;
						}else if(parseFloat(sAmount) == 0){
							we.msg("储值额不能为零", 4);
							return;
						}
						if(total < parseFloat(sAmount)){
							we.msg("会员账户余额不足以扣减", 4);
							return;
						}
						$(".modal-receipts").addClass("hide");
						$(".modal-reward").addClass("hide");
						$storedType.html('扣减');
						$storedAmount.html(sAmount);
					}
					$storedShops.html(sShops);
					$storedShops.attr('data-id', sShopsId);
					$storedNote.html(sNote);
					$confirmAdjust.modal();
					break;

				case 'confirmstored':
					!function() {
						var url = $this.data('url'),
							scType = $storedType.data('type'),
							scAmount = $storedAmount.html(),
							scReceipts = $storedReceipts.html(),
							scReward = $storedReward.html(),
							scShops = $storedShops.data('id'),
							scNote = $storedNote.html();

						$this.addClass('disabled');
						$.ajax({
							url: url,
							type: 'post',
							dataType: 'json',
							data: {
								type: scType,
								amount: scAmount,
								receipts: scReceipts,
								reward: scReward,
								shopId: scShops,
								note: scNote
							},
							success: function(response){
								if(response.errcode){
									we.msg(response.errmsg, 4);
									window.setTimeout('location.reload()',2000);
								}else{
									we.respond(response, {
										assignDelay: 800
									});
									window.setTimeout('location.reload()',1800);
								}
							}
						});
					}();
					break;

				case 'point':
					$adjustPoint.modal({
						backdrop: 'static',
						keyboard: false,
						show: true
					});
					total = parseFloat($this.data('total'));
					break;

				case 'adjustpoint':
					var pType = $('#point').val(),
						pAmount = $('#pMoney').val(),
						pShopsId = $('.adjust-point-modal').find('input[name="shop"]').val(),
						pShops = $('.adjust-point-modal').find('input[name="shop"]').data('names'),
						pNote = $('#pNote').val();

					if(pAmount == ''){
						we.msg("请填写调整积分额", 4);
						return;
					}else if(parseInt(pAmount) === 0){
						we.msg("积分额不能为零", 4);
						return;
					}
					if(pNote == ''){
						we.msg("请填写备注", 4);
						return;
					}
					if(pShopsId == 0){
						we.msg("请选择门店", 4);
						return;
					}

					$pointType.attr('data-type', pType);
					if(parseInt(pType) === 1){
						if(parseInt(pAmount) > 50000){
							we.msg("最多可增加50000积分", 4);
							return;
						}
						$pointType.html('增加');
					}else{
						if(total < parseFloat(pAmount)){
							we.msg("会员账户积分额不足以扣减", 4);
							return;
						}
						$pointType.html('扣减');
					}
					$pointAmount.html(pAmount);
					$pointShops.html(pShops);
					$pointShops.attr('data-id', pShopsId);
					$pointNote.html(pNote);
					$confirmPoint.modal();
					break;

				case 'confirmpoint':
					!function() {
						var url = $this.data('url'),
							pcType = $pointType.data('type'),
							pcAmount = $pointAmount.html(),
							pcShops = $pointShops.data('id'),
							pcNote = $pointNote.html();

						$this.addClass('disabled');
						$.ajax({
							url: url,
							type: 'post',
							dataType: 'json',
							data: {
								type: pcType,
								amount: pcAmount,
								shopId: pcShops,
								note: pcNote
							},
							success: function(response){
								if(response.errcode){
									we.msg(response.errmsg, 4);
									window.setTimeout('location.reload()',2000);
								}else{
									we.respond(response, {
										assignDelay: 800
									});
									window.setTimeout('location.reload()',1800);
								}
							}
						});
					}();
					break;

				case 'gift':
					$adjustGift.modal({
						backdrop: 'static',
						keyboard: false,
						show: true
					});
					$('#giftSearch').typeahead({
						source: function(query, process){
							let adjustType,					//调整类型:增加
								url = $this.data('url');
							if(parseInt($("#coupons").val()) === 1){
								adjustType = "giftAdd";
							}else if(parseInt($("#coupons").val()) === 2){
								adjustType = "giftRomove";
							}
							
							$.ajax({
								type: "post",
								url: url,
								data: {
									giftsearch: query,				//查询内容query
									adjustType: adjustType, 			//调整类型 增加／扣减adjustType
									userId : 12334					//用户id
								},
								dataType: 'json',
								success: function(response){
									if(response.errcode){
										we.msg(response.errmsg, 4);
										window.setTimeout('location.reload()',2000);
									}else{
										var data = response.result;
										if(data.length!=0){
											var giftItem = _.map(data, function (n) {
												return n.cName+'<input type="hidden" value="'+'/'+n.couponId+'/'+n.cType+'/'+n.cAmount+'/'+n.cGiftCouponAmountCustom+'/'+n.c2uIds+'/'+'/'+n.couponNum+'">';
						                	 	});	
						                  	 process(giftItem);
										}else{
											alert('无搜索内容');
										}
									}
								}
							});
						},
						 highlighter: function (item) {
			                return item;  
			            },  
			            updater: function (item) {//选中  
			                console.log("'" + item + "' selected.");
			                var selectedItem = item.split('<'),
			                 	itemOther = selectedItem[1].split('/'),
			                		cName = selectedItem[0],					//券名称
			                 	couponId = itemOther[1],					//券id
			               		cType = itemOther[2],					//券类型
			                 	cAmount = itemOther[3],					//券金额
			                 	giftAmountCustom =itemOther[4], 			//礼品券自定义金额
			                 	c2uIds = itemOther[5],					//用户id
			                 	couponNum = itemOther[6];				//拥有券数量
			                 	
			                 $giftSearch.data({'couponId':couponId,'facevalue':cAmount,'num':couponNum});
			                
			                console.log(11,couponId);
			                console.log(33,$giftSearch.data());
			                
//			                $('#giftSearch').focus();
			                return cName;  
			            },
			            items:5000,
			            afterSelect:function(item){
			            		//选中的券名称
			            		
			            		
			            		//选中的券id
			            }
					});
					break;

				case 'adjustgift':
					var gName,gId,gVal,
						gType = $('#coupons').val(),
						gNum = $('#gNum').val(),
						gMax = parseInt($('#gNum').data('max')),
						gShopsId = $('.adjust-gift-modal').find('input[name="shop"]').val(),
						gShops = $('.adjust-gift-modal').find('input[name="shop"]').data('names'),
						gNote = $('#gNote').val();

					if(parseInt(gType) === 1){
						if(parseInt(gNum) > gMax){
							we.msg("最多可增加"+gMax+"张优惠券", 4);
							return;
						}else if(parseInt(gNum) === 0){
							we.msg("优惠券张数不能为零", 4);
							return;
						}else if(gNum == ""){
							we.msg("请填写调整优惠券张数", 4);
							return;
						}
						gName = $giftAdd.find('option:selected').text();
						gId = $giftAdd.val();
						$giftType.html('增加');
					}else{
						gVal = $giftRomove.find('option:selected').data('value');
						if(parseInt(gVal) < parseInt(gNum)){
							we.msg("优惠券张数不足以扣减", 4);
							return;
						}
						gName = $giftRomove.find('option:selected').text();
						gId = $giftRomove.val();
						$giftType.html('扣减');
					}

					if(gId == 0){
						we.msg("请选择优惠券", 4);
						return;
					}
					if(gNum == ''){
						we.msg("请输入券张数", 4);
						return;
					}
					if(gShopsId == 0){
						we.msg("请选择门店", 4);
						return;
					}
					if(gNote == ''){
						we.msg("请填写备注", 4);
						return;
					}
					$giftType.attr('data-type', gType);
					$giftName.html(gName);
					$giftName.attr('data-id', gId);
					$giftNum.html(gNum)
					$giftShops.html(gShops);
					$giftShops.attr('data-id', gShopsId);
					$giftNote.html(gNote);

					var $selectedOption = parseInt(gType) === 1
					? $giftAdd.find('option:selected')
					: $giftRomove.find('option:selected');
					var selectedFacevalue = $selectedOption.data('facevalue');
					$giftTotalvalue.html(
					selectedFacevalue === 'custom'
						? '收银员自定义'
						: (parseFloat(selectedFacevalue) * gNum).toFixed(2) + '元'
				);

					$confirmGift.modal();
					break;

				case 'confirmgift':
					!function() {
						var url = $this.data('url'),
							gcType = $giftType.data('type'),
							gcName = $giftName.data('id'),
							gcNum = $giftNum.html(),
							gcShops = $giftShops.data('id'),
							gcNote = $giftNote.html();

						$this.addClass('disabled');
						$.ajax({
							url: url,
							type: 'post',
							dataType: 'json',
							data: {
								type: gcType,
								giftId: gcName,
								number: gcNum,
								shopId: gcShops,
								note: gcNote
							},
							success: function(response){
								if(response.errcode){
									we.msg(response.errmsg, 4);
									window.setTimeout('location.reload()',2000);
								}else{
									we.respond(response, {
										assignDelay: 800
									});
									window.setTimeout('location.reload()',1800);
								}
							}
						});
					}();
					break;

				default:
					break;
			}
		});
	};

	prototype.funcs = {
		unlock: function(e, data){
			this.unlockModal.find('.lock-reason').html(data.lockreason);
			this.unlockModal.find('.lock-oper').html(data.lockoper);
			$('#unlockUid').val(data.uid);
			this.unlockModal.modal({
				backdrop: 'static',
				keyboard: false,
				show: true
			});
		},
		confirmunlock: function(e, data) {
			var url = data.url,
				unlockReason = $('#unlockReason').val(),
				unlockUid = $('#unlockUid').val();

			if (unlockReason == '') {
				we.msg('请输入解锁原因', 4);
				$('#unlockReason').focus();
				return;
			}

			e.addClass('disabled');
			e.attr('disabled', true);
			$.ajax({
				url: url,
				type: 'post',
				dataType: 'json',
				data: {
					reason: unlockReason,
					uid: unlockUid
				},
				success: function(response){
					if(response.errcode){
						we.msg(response.errmsg, 4);
						window.setTimeout('location.reload()',2000);
					}else{
						we.respond(response, {
							assignDelay: 800
						});
						window.setTimeout('location.reload()',1800);
					}
				}
			});
		},
		lock: function(e, data) {
			$('#lockUid').val(data.uid);
			this.lockModal.modal({
				backdrop: 'static',
				keyboard: false,
				show: true
			});
		},
		confirmlock: function(e, data) {
			var url = data.url,
				lockReason = $('#lockReason').val(),
				lockUid = $('#lockUid').val();

			if (lockReason == '') {
				we.msg('请输入锁定原因', 4);
				$('#lockReason').focus();
				return;
			}

			e.addClass('disabled');
			e.attr('disabled', true);
			$.ajax({
				url: url,
				type: 'post',
				dataType: 'json',
				data: {
					reason: lockReason,
					uid: lockUid
				},
				success: function(response){
					if(response.errcode){
						we.msg(response.errmsg, 4);
						window.setTimeout('location.reload()',2000);
					}else{
						we.respond(response, {
							assignDelay: 800
						});
						window.setTimeout('location.reload()',1800);
					}
				}
			});
		}
	};

	//http://pm.acewiller.com/task-view-1618.html
	//http://pm.acewiller.com/task-view-1192.html
	//https://github.com/bassjobsen/Bootstrap-3-Typeahead
	//会员管理 - 一个手机号可以绑定99张实体卡
	prototype.initMultiCardsLogic = function() {
		try {
			var
				// $tabs = $('.pagetype'),
				$ab = $('.actual_binds'),
				$toggle = $ab.find('a.toggle'),
				$ipt = $ab.find('.suggestion'),
				reverseStr = function(str) {
					return Array.prototype.reverse.call(str.split('')).join('');
				},
				formatNum = function(n) {
					var rst = n.replace(/\s/g, '');
					rst = reverseStr(rst).replace(/(.{4})/g, "$1 ");
					return reverseStr(rst);
				};
			if (!_isActual() && $toggle.length) {
				$toggle.hide();
			}

			if (!$toggle.length || !$ipt.length) return;
			$toggle.click(function(e){
				if ($ipt.hasClass('hide')) {
					$ipt
						.removeClass('hide')
						.typeahead({
							showHintOnFocus: true,
							source: $ipt.data('cards').split(','),
							items: 99,
							displayText: formatNum,
							afterSelect: function(n) {
								var url = '//'
									+ location.host
									+ location.pathname
									+ location.search
									+ '&acNo=' + n;
								$('.typeahead').addClass('hide');
								location.href = url;
							}
						})
						.css({
							left: $toggle.position().left - $ipt.width()
						})
						.focus();
				}
			});
			$(document.body).on('click', function(e) {
				var isToggle = $(e.target).is($toggle);
				var isIpt = $(e.target).is($ipt);
				if (!(isToggle || isIpt)) {
					$ipt.addClass('hide').typeahead('destroy');
				}
			});
		} catch(ex) {
			console.log(ex);
		}
	};
	return Controller;
});
