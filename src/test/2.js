onConfirm (selected, money, vouchers, gifts) {
		let data = this.state.data;
		this.voucher = vouchers;
		this.gift = gifts;
		data.coupon.show = false;
		data.coupon.money= money;
		this.setState({data});
	},
	
<CouponList
				allcoupons={data.coupon.allcoupons}
				selected={data.coupon.selected}
				min={data.coupon.money}
			 	onConfirm={this.onConfirm.bind(this)}/>
let 

{allcoupons, selected, money, show} = this.state.data.coupon,
hasCouponSelected = !_.isUndefined(coupon.selected) || (_.isArray(coupon.selected) && !_.isEmpty(coupon.selected)),
hasAllcoupons = !_.isUndefined(coupon.allcoupons) || (_.isArray(coupon.allcoupons) && !_.isEmpty(coupon.allcoupons));
deduct = hasDeduct ? deduct : [];
coupon.selected = hasCouponSelected ? coupon.selected : [];
coupon.allcoupons = hasAllcoupons ? coupon.allcoupons : [];
coupon.money = coupon.money ? coupon.money :0;

<CouponList
allcoupons={data.coupon.allcoupons}
selected={data.coupon.selected}
min={parseFloat(data.totalPrice)}
onConfirm={this.onConfirm.bind(this)}/>