/**
 * 用于在页面上点击“添加券+”按钮时通用的逻辑
 */
define("modules/coupon", [
	"jquery",
	"underscore",
	"welife",
	"modules/shops_with_area",
	"text!/tmpl/coupon-modal-body-template.html",
	"modules/date",
	"modules/popovers",
	"modules/text-editor"
], function($, _, we, AreaShop, modal_body_tmpl) {

	"use strict";

	we.couponEditor = function($scope, p_config) {
		var config = _.extend({
			max: $(".main").data("max") || 10,
			num: $(".main").data("num") || 10,
			initvalue: 1,
			mountCallback: $.noop,
			unmountCallback: $.noop,
			maxInit: function($obj, _num) {
				$obj.attr('max', _num)
			}
		}, p_config);

		var
			_this = this,
			$container = $scope ? $scope.find(".coupon-settings") : $(".coupon-settings"),
			$coupon = $container.find(".we-coupon"),
			$sandbox = $container.find(".we-sandbox"),
			$condition = $container.find(".coupon-condition"),
			$couponList = $coupon.find(".coupon-list"),
			existedCoupons = $couponList.data("existedCoupons"),
			_couponListTemplate = _.template($coupon.find(".coupon-list-template").text()),
			$couponToggle = $coupon.find(".coupon-toggle"),
			$couponMenu = $coupon.find(".coupon-menu"),
			$previewModal = $container.find(".preview-modal"),
			$previewModalBody = $previewModal.find(".modal-body"),
			_previewModalTemplate = _.template(modal_body_tmpl);

		// 载入页面
		// -----------------------------------------------------------------------
		function loadPages(data) {
			var shown = $sandbox.hasClass("in");

			if (!shown) {
				$couponToggle.addClass("disabled").prop("disabled", true);
			}

			// 异步载入模板
			$.ajax(data.remote, {
				data: data,
				success: function(response) {
					if (!shown) {
						$sandbox.html(response).collapse("show");
					} else {
						$sandbox.empty().html(response);
					}

					console.log('[coupon] loadpage: ', data.page)

					if (data.page === "create") {
						createCoupon(data.type);
						AreaShop.scan();
					}

					if (data.page === "search") {
						searchCoupon();
					}
				},
				error: function() {
					if (!shown) {
						$couponToggle.removeClass("disabled").prop("disabled", false);
					}

					console.log(arguments);
				}
			});
		}

		// 创建券
		// -----------------------------------------------------------------------
		function createCoupon(cType) {
			var
				$scope = $sandbox.find(".coupon-create"),
				$form = $scope.find(".we-form"),
				$type = $form.find(".input-type"),
				$value = $form.find(".input-value"),
				$number = $form.find(".input-number"),
				$valuetype = $form.find("[name=valuetype]"),
				$minvalue = $form.find(".input-minvalue"),
				$sheets = $form.find(".input-sheets"),
				$mix = $form.find("[name=mix]"),
				$enabled = $form.find(".input-enabled"),
				$dishesId = $form.find(".input-dishes"),
				$shanhui = $form.find(".input-shanhui"),
				$shanhuiState = $form.find(".shanhui-state li"),
				$namePrefix = $form.find(".input-name-prefix"),
				$name = $form.find(".input-name"),
				$term = $form.find(".input-term"),
				$week = $form.find(".week-day"),
				$absolute = $form.find(".term-absolute"),
				$relative = $form.find(".term-relative"),
				$count = $relative.find(".input-term-count"),
				// $shop = $form.find(".input-shop"),
				$restriction = $form.find(".input-restriction"),
				$detail = $scope.find(".voucher-detail"),
				_detailTemplate = _.template($scope.find("#voucher-detail-template").text()),
				couponData = {},
				validates = {
					count: function() {
						if ($relative.is(":visible")) {
							return $count.validate("validate");
						}

						return true;
					},
					compareTermTime: function() {
						var
							termData = $term.val().split(','),
							termday;
						// 如果是0就不验证了
						if (parseInt($enabled.val()) == 0) {
							return true;
						}
						if (termData[0] == 'relative') {
							termday = (termData[2] == 1) ? termData[1] : (termData[1] * 30);
							if (parseInt($enabled.val()) >= parseInt(termday)) {
								we.showError($enabled, "启用时间请勿大于等于相对有效期");
								return false;
							}
						} else if (termData[0] == 'absolute') {
							termday = (new Date(termData[2]).getTime() - new Date(termData[1]).getTime()) / 86400000;
							if (parseInt($enabled.val()) >= parseInt(termday)) {
								we.showError($enabled, "启用时间请勿大于等于有效天数");
								return false;
							}
						}

						return true;
					}
				},
				dealError = {
					showError: function($target, message) {
						var $container = $target.closest(".form-group"),
							$col = $container.find("div[class^='col']:last"),
							$highlight = $container.find(".highlight");
						if ($col.length) {
							$container = $col;
						}
						if (!$highlight.length) {
							$highlight = $('<p class="help-block highlight hide"></p>');
							$container.append($highlight);
						}
						if (message) {
							$target.is(':visible') && $target.focus();
							$highlight.text(message).removeClass("hide");
						} else {
							$highlight.empty().addClass("hide");
						}
					},
					hideError: function($target) {
						var $errorText = $target.closest(".form-group").find('p.help-block');
						$errorText.remove();
					}
				};

			_this.$shopSelect = $('.we-shop-selector', $scope);

			if ($relative.is(":visible")) {
				$relative.data("active", true);
				$count.validate();
			}

			// 激活日历控件
			if ($absolute.is(":visible")) {
				$absolute.data("active", true);
				we.date($scope, {
					startDate: true
				});
			}
			
			//使用时段验证
			$week.on("change",'input', function(){
				if ($week.find('input:checked').length==0){
					dealError.showError($week, "请选择使用时段");
					return;
				}
				dealError.hideError($week);
			})
			$dishesId.on('keyup', function() {
				var $_thisNum = $(this).val(),
					len = $_thisNum.length,
					$val = len >= 10 ? $_thisNum.substring(0, 10) : $_thisNum;
				$(this).val($val);
			})

			$scope.on("click", "[data-toggle^='coupon']", function() {
				var $this = $(this),
					data = $this.data(),
					toggle = data.toggle.replace("coupon.", "");

				if ($this.hasClass('disabled') || $this.prop('disabled')) {
					return;
				}

				switch (toggle) {
					case "relative":
						$relative.removeClass("hide");
						$absolute.addClass("hide");

						if (!$relative.data("active")) {
							$relative.data("active", true);
							$count.validate();
						}

						$relative.parent().find(".highlight").addClass("hide");

						break;

					case "absolute":
						$relative.addClass("hide");
						$absolute.removeClass("hide");

						// 激活日历控件
						if (!$absolute.data("active")) {
							$absolute.data("active", true);
							we.date($scope, {
								startDate: true
							});
						}

						$absolute.parent().find(".highlight").addClass("hide");

						break;

					case "create":
						// 转换有效期
						$term.val(function() {
							var term = $(this).val();

							if (!$relative.hasClass("hide")) {
								term = [
									"relative",
									$relative.find(".input-term-count").val(),
									$relative.find(".input-term-unit").val()
								];
							} else if (!$absolute.hasClass("hide")) {
								term = [
									"absolute",
									$absolute.find(".input-term-start").val(),
									$absolute.find(".input-term-end").val()
								];
							}

							return $.isArray(term) ? term.join() : term;
						});

						if ($value.length && !$value.validate("validate")) {
							return;
						}

						if (!$valuetype.length && $number.length && !$number.validate("validate")) {
							return;
						}

						if ($valuetype.length && $valuetype.filter(":checked").val() == 0 && $number.length) {
							if (!$number.val()) {
								dealError.showError($number, "请填写礼品券价值");
								return;
							}
							if (!/^[0-9]+(\.[0-9]{0,2})?$/.test($number.val())) {
								dealError.showError($number, "请正确填写礼品券价值");
								return;
							}
						}

						if ($minvalue.val().length !== 0 && !/^[0-9]+(\.[0-9]{0,2})?$/.test($minvalue.val()) || $minvalue.val().length > 6) {
							dealError.showError($minvalue, "请正确填写起用金额");
							return;
						}

						if ($sheets.val().length !== 0 && !/^[0-9]+$/.test($sheets.val()) || $sheets.val().length > 5) {
							dealError.showError($sheets, "请正确填写单次使用张数");
							return;
						}

						if ($enabled.length && !$enabled.validate("validate")) {
							return;
						}

						if ($shanhui.length && !$shanhui.validate("validate")) {
							return;
						}

						if (!($name.validate("validate") && validates.count() && $restriction.validate("validate"))) {
							return;
						}

						if ($week.find('input:checked').length==0){
							return;
						}
						
						if (!($enabled.validate("validate") && validates.compareTermTime())) {
							return;
						}

						couponData.value = $value.val();
						couponData.number = $number.val();
						couponData.valuetype = $valuetype.length && $valuetype.filter(":checked").val();
						couponData.minvalue = $minvalue.val() == 0 ? "" : $minvalue.val();
						couponData.sheets = $sheets.val() == 0 ? "" : $sheets.val();
						couponData.mix = $mix.filter(":checked").val();
						couponData.enabled = $enabled.val();
						couponData.dishesId = $dishesId.val();
						couponData.shanhui = $shanhui.val();
						couponData.state = $shanhuiState.find(".we-radio.checked span").text();
						couponData.name = $name.val();
						couponData.term = $term.val().split(/\s*\,\s*/);
						//遍历选择的使用时段
						var checkVal=[];
						$week.find('input:checked').each(function(i){
							checkVal.push($(this).data('week'));
						});
						couponData.checkval = checkVal;
						
						//couponData.shop = $shop.closest(".form-group").hasClass("hide") ? "" : $shop.data("shop");
						couponData.shop = _this.$shopSelect.closest(".form-group").hasClass("hide") ? "" : _this.$shopSelect.find('input.rst').data('names');
						couponData.restriction = $restriction.val();
						$detail.html(_detailTemplate(couponData));
						$form.addClass("hide");
						$detail.removeClass("hide");

						break;

					case "cancel":
						closeSandbox();
						break;

					case "apply": //确认使用
						if ($value.length && !$value.validate("validate")) {
							return;
						}

						if ($number.length && !$number.validate("validate")) {
							return;
						}

						if ($enabled.length && !$enabled.validate("validate")) {
							return;
						}

						if ($shanhui.length && !$shanhui.validate("validate")) {
							return;
						}

						if (!($name.validate("validate") && validates.count() && $restriction.validate("validate"))) {
							return;
						}

						$term.val(function() {
							var term = $(this).val();

							if (!$relative.hasClass("hide")) {
								term = [
									"relative",
									$relative.find(".input-term-count").val(),
									$relative.find(".input-term-unit").val()
								];
							} else if (!$absolute.hasClass("hide")) {
								term = [
									"absolute",
									$absolute.find(".input-term-start").val(),
									$absolute.find(".input-term-end").val()
								];
							}

							return $.isArray(term) ? term.join() : term;
						});
						//遍历选择的使用时段
						var check=[];
						$week.find('input:checked').each(function(i){
							check.push($(this).val());
						});
						data.checkval = check;
						data[$type.attr("name")] = $type.val();
						data[$name.attr("name")] = $name.val();
						data.initvalue = config.initvalue;
						data.valuetype = $valuetype.length && $valuetype.filter(":checked").val();
						data.minvalue = $minvalue.val() == 0 ? "" : $minvalue.val();
						data.sheets = $sheets.val() == 0 ? "" : $sheets.val();
						data.mix = $mix.filter(":checked").val();

						if ($value.length) {
							data[$value.attr("name")] = $value.val();
						} else {
							data.value = "";
						}

						if ($number.length) {
							data[$number.attr("name")] = $number.val();
						} else {
							data.number = "";
						}

						if ($enabled.length) {
							data[$enabled.attr("name")] = $enabled.val();
						} else {
							data.enabled = "";
						}

						if ($shanhui.length) {
							data[$shanhui.attr("name")] = $shanhui.val();
						} else {
							data.shanhui = "";
						}
						if ($dishesId.length) {
							data[$dishesId.attr("name")] = $dishesId.val();
						} else {
							data.dishesId = "";
						}

						data[$shanhuiState.find(".we-radio.checked input").attr("name")] = $shanhuiState.find(".we-radio.checked input").val();
						data[$term.attr("name")] = $term.val();
						// data[$shop.attr("name")] = $shop.val();
						data[_this.$shopSelect.data('resultField')] = _this.$shopSelect.closest(".form-group").hasClass("hide") ? "" : _this.$shopSelect.find('input.rst').val();
						data[$restriction.attr("name")] = $restriction.val();

						data.type = cType;
						//console.log('POST', data.url, data);

						// 异步提交券设置
						$.ajax(data.url, {
							type: "POST",
							data: data,
							dataType: "json",
							beforeSend: function() {
								$this.prop('disabled', true);
							},
							success: function(response) {
								we.respond(response, {
									success: function() {

										//console.log(response);
										var acData = _.extend(response.result, {
											type: cType
										});
										applyCoupon(acData);
									},
									error: function() {
										$this.prop('disabled', false);
									}
								});
							},
							fail: function() {
								$this.prop('disabled', false);
							}
						});

						break;

					case "modify":
						$form.removeClass("hide");
						$detail.addClass("hide");
						break;
				}
			});

			$value.validate();
			$value.on("keyup change", function() {
				var value = parseInt($(this).val(), 10);

				$namePrefix.text(value && value > 0 ? (value + "元") : "");
			});

			$number.on("keyup", function() {
				var number;
				if (!$valuetype.length) return;
				number = $number.val();
				if (number.length !== 0 && !/^[0-9]+(\.[0-9]{0,2})?$/.test(number) || number.length > 5) {
					$number.val(number.slice(0,-1));
					return;
				}
				dealError.hideError($number);
			});

			$minvalue.on("keyup", function() {
				var minvalue = $minvalue.val();

				if (minvalue.length !== 0 && !/^[0-9]+(\.[0-9]{0,2})?$/.test(minvalue) || minvalue.length > 6) {
					$minvalue.val(minvalue.slice(0,-1));
					return;
				}
				dealError.hideError($minvalue);
			});

			$sheets.on("keyup", function() {
				var sheets = $sheets.val();

				if (sheets.length !== 0 && !/^[0-9]+$/.test(sheets) || sheets.length > 5) {
					$sheets.val(sheets.slice(0,-1));
					return;
				}
				dealError.hideError($sheets);
			});

			$shanhui.validate();
			$shanhui.on("keyup change", function() {
				var shanhui = parseInt($(this).val(), 10);

				$namePrefix.text(shanhui && shanhui > 0 ? (shanhui + "元") : "");
			});

			// 券名称验证
			$name.validate({
				charCodeLength: true,
				trimOverflow: true,
				trim: true
			});

			$relative.find(".input-term-count").validate();
			$restriction.validate({
				filter: function() {
					return $(this).data("text");
				}
			});

			// 礼品券名称弹出提示框
			we.popoverNotice($scope);

			// 激活门店选择
			// we.shop($scope);

			// 文本编辑
			we.textEditor($scope);
		}

		// 搜索券
		// -----------------------------------------------------------------------
		function searchCoupon() {
			var $scope = $sandbox.find(".coupon-search"),
				$voucherList = $container.find(".voucher-list"),
				_voucherListTemplate = _.template($container.find(".voucher-list-template").text()),
				$load = $container.find(".voucher-load"),
				$loadToggle = $load.find("a"),
				$detailModal = $container.find(".detail-modal"),
				$detailModalBody = $detailModal.find(".modal-body"),
				_detailModalTemplate = _.template(modal_body_tmpl);

			$loadToggle.data("originalText", $loadToggle.text());

			$scope.on("click", "[data-toggle^='coupon']", function(e) {
				var $this = $(this),
					data = $this.data(),
					toggle = data.toggle.replace("coupon.", "");

				if ($this.hasClass("disabled") || $this.prop("disabled")) {
					return;
				}

				e.preventDefault();

				switch (toggle) {
					case "detail":
						$detailModal.data("coupon", (data = $this.closest("li").data()));

						data = $.extend({}, data);
						data.name = data.value ? String(data.name).replace(/^\d+\u5143/, "") : (data.shanhui ? String(data.name).replace(/^\d+\u5143/, "") : data.name); // 将名称中的“**元”删除
						data.term = data.term.split(/\s*\,\s*/);
						data.restriction = escape2Html(data.restriction);
						data.name = escape2Html(data.name);
						$detailModalBody.empty().html(
							_detailModalTemplate(
								_.extend({show_footer: 'voucher'}, data)
							)
						);

						$detailModal.modal("show");
						break;

						// 在弹出中的使用操作
					case "detailApply":
						$detailModal.one("hidden.bs.modal", function() {
							applyCoupon($detailModal.data("coupon"));
						}).modal("hide");
						break;

					case "cancel":
						closeSandbox();
						break;

					case "apply":
						var _data = $this.closest("li").data();
						_data.num = config.num ? config.num : 10;
						_data.initvalue = config.initvalue ? config.initvalue : 1;
						applyCoupon(_data);
						break;

					case "load":
						// 异步加载更多券
						$.ajax(data.url, {
							data: data,
							dataType: "json",
							beforeSend: function() {
								$loadToggle.addClass("disabled").text($loadToggle.data("loading"));
							},
							success: function(response) {
								var html = "",
									result;

								if (response.errcode === 0) {
									$this.data("pageId", ++data.pageId);
									result = response.result;

									if (result.data.length > 0) {
										$.each(result.data, function(i, n) {
											n.name = n.value ? n.name.replace(/^\d+\u5143/, "") : (n.shanhui ? n.name.replace(/^\d+\u5143/, "") : n.name), // 将名称中的“**元”删除
												n.term = n.term.split(/\s*\,\s*/);
												
											html += _voucherListTemplate(n);
										});

										$voucherList.append(html);
									}

									if (!result.more) {
										$load.addClass("hide");
									}
								} else {
									console.log(response.errmsg);
								}
							},
							complete: function() {
								$loadToggle.removeClass("disabled").text($loadToggle.data("originalText"));
							}
						});
						break;
				}
			});

			// 搜索
			$scope.on("keyup", ".input-search", function(e) {
				var $this = $(this),
					$submit = $this.next("button");

				$submit.data($this.attr("name"), $this.val());

				if (e.which === 13) {
					e.preventDefault();
					$submit.click();
				}
			});
		}

		//普通字符转换成转意符
		function html2Escape(sHtml) {
			sHtml = sHtml.toString();
			return sHtml.replace(/[<>&"]/g, function(c) {
				return {
					'<': '&lt;',
					'>': '&gt;',
					'&': '&amp;',
					'"': '&quot;'
				}[c];
			});
		}
		//转意符换成普通字符
		function escape2Html(str) {
			var arrEntities = {
				'lt': '<',
				'gt': '>',
				'nbsp': ' ',
				'amp': '&',
				'quot': '"'
			};
			str = str.toString();
			return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
				return arrEntities[t];
			});
		}

		// 使用券
		// -----------------------------------------------------------------------
		function applyCoupon(data) {
			data = $.extend({}, data);

			if (data.value) {
				data.name = String(data.name).replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
			}

			if (data.shanhui) {
				data.name = String(data.name).replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
			}

			data.restriction = html2Escape(data.restriction);
			data.name = html2Escape(data.name);
			data.num = String(data.num);
			data._data = _.clone(data);
			$couponList.append(_couponListTemplate(data));

			if ($sandbox.hasClass("in")) {
				closeSandbox();
			}

			if ($couponList.children().length >= config.max) {
				$couponToggle.addClass("hide");
			}

			config.mountCallback(data);
			config.maxInit($('.coupon-list .coupon-input'), config.num)

			$("[name^=couponCount").on("input", function() {
				if ($(this).val() > config.num) {
					$(this).val(config.num);
				}
			});
		}

		// 关闭沙箱
		// -----------------------------------------------------------------------
		function closeSandbox() {
			$sandbox.one("hidden.bs.collapse", function() {
				$sandbox.empty();
				$couponToggle.removeClass("disabled").prop("disabled", false);
			}).collapse("hide");
		}

		// 初始化券列表
		// -----------------------------------------------------------------------
		try {
			existedCoupons = eval(existedCoupons);
		} catch (ex) {}
		if ($.isArray(existedCoupons) && existedCoupons.length) {
			$.each(existedCoupons, function(i, coupon) {
				applyCoupon(coupon);
			});
		}

		// 点击触发载入页面
		// -----------------------------------------------------------------------
		$couponMenu.add($sandbox).on("click", "[data-toggle='page']", function(e) {
			e.preventDefault();
			loadPages($(this).data());
		});

		$couponList.off("click").on("click", "[data-toggle='coupon.preview']", function(e) {
			var data = $(this).closest("li").data();
			e.preventDefault();
			data = $.extend({}, data);
			if (data.value) {
				data.name = String(data.name).replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
			}

			if (data.shanhui) {
				data.name = String(data.name).replace(/^\d+\u5143/, ""); // 将名称中的“**元”删除
			}

			if (_.isUndefined(data.number)) {
				data.number = 0;
			}

			data.term = data.term.split(/\s*\,\s*/);
			data.restriction = escape2Html(data.restriction);
			data.name = escape2Html(data.name);

			//console.log(e.currenTarget, data);

			$previewModalBody.empty().html(_previewModalTemplate(data));
			$previewModal.modal("show");
		});

		$condition.find(".condition-type").on("change", function() {
			$condition.find(".condition-unit").text($(this).find(":selected").data("unit"));
		});

		// 删除券确认框
		we.popoverConfirm({
			namespace: '.remove_coupon',
			message: "确定要删除此券么？",
			confirm: function() {
				// 进行删除操作
				var $li = $(this).popover("destroy").closest("li");
				var d = $li.data();
				$li.remove();

				if ($couponList.children().length < config.max) {
					$couponToggle.removeClass("hide");
				}

				config.unmountCallback(d);
				$li = null;
			}
		});
	};

});
