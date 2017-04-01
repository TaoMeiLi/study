define(
	"area/shops-modal"
,[
	"jquery"
	,"underscore"
	,"text!/tmpl/area-shops-modal.html"
]
, function (
	$
	,_
	,shopsModalTmpl
)
{
	var tmpl = _.template(shopsModalTmpl);

	return {
		open: function(modal_data, submit_callback) {
			var md = _.extend({shops: [], area: null}, modal_data);

			var m = $(tmpl(md)).modal();
			$('.entire', m).on('click', function(e) { //全选
				var state = e.currentTarget.checked;
				$('[name=shop_chk]:visible', m).each(function(idx, ipt) {
					ipt.checked = state;
				});
			});
			$('[name=shop_chk]', m).on('click', function(e) { //选择单个门店对全选对全选对影响
				if (!e.currentTarget.checked) {
					$('.entire', m).get(0).checked = false;
				}
			});
			$('[type=search]', m).on('input blur', function(e) { //搜索
				var
					v = $.trim(e.currentTarget.value)
					,$empty = $('.empty', m)
				;
				$('.modal-body label').hide();
				$empty.hide();
				if (!modal_data.shops.length) {
					$empty.show();
				} else {
					var shops_shown = _.clone(modal_data.shops);
					if (v) {
						shops_shown = _.filter(shops_shown, function(shop) {
							return ~shop.name.indexOf(v) || (
								shop.belong && ~shop.belong.indexOf(v)
							) || ~shop.city.indexOf(v);
						});
						if (!shops_shown.length) {
							$empty.show();
						}
					}
					_.each(shops_shown, function(s) {
						var lb = $('.modal-body label[data-id='+ s.id +']', m);
						if (lb.length) lb.show();
					});
				}
			}).trigger('input');
			$('.modal-footer .submit', m).on('click', function() { //确定按钮
				$(m).modal('hide');
				var new_shops = $('[name=shop_chk]:checked', m);
				new_shops = new_shops.length
					? new_shops.map(function(idx, ipt) {
						return ipt.value;
					}).toArray()
					: [];
				submit_callback(new_shops);
			});
		} //end of open
	}
});