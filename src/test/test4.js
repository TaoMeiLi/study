/***优惠券****************************************************************/

let CouponList = React.createClass({
	getInitialState() {
		return {
			couponData: this.props.couponData,
			min: this.props.min ? this.props.min : 0,
			coupons: this.props.coupons,
			selected: this.props.selected,
			couponMoney:this.props.couponMoney
		};
	},
	couponSelect(e) {
		let data = _.clone(this.state);
		var index;
		if (e.currentTarget.parentNode.className === 'active') {
			index = data.selected.indexOf(e.currentTarget.parentNode.id);
			data.selected.splice(index, 1);
			data.coupons.forEach(function(n, i) {
				if (n.id === e.currentTarget.parentNode.getAttribute('data-coupon')) {
					index = i;
					return false;
				}
			});
			data.coupons.splice(index, 1);
			data.selected = this.props.selected;
			data.coupons = this.props.coupons;
			this.setState({data});
			return;
		}
		// 已选择
		data.selected.push(e.currentTarget.parentNode.id);
		// 已选择的券的 id 和 share
		data.coupons.push({
			'id': e.currentTarget.parentNode.getAttribute('data-coupon'),
			'share': e.currentTarget.parentNode.getAttribute('data-share') === 'true' ? true : false,
			'type': e.currentTarget.parentNode.getAttribute('data-type')
		});
			data.selected = this.props.selected;
			data.coupons = this.props.coupons;
			this.setState({data});
	},
	confirm() {
		let data = _.clone(this.state.data);
		let vouchers = 0, gifts = 0,couponMoney = 0;
		data.selected.forEach(item => {
			data.couponData.forEach(d => {
				if (d.c2uid == item) {
					couponMoney += d.value;
				}
			})
		});
		data.couponMoney = couponMoney;
		this.setState({data});
		data.coupons.forEach(item => {
			if (item.type === "voucher") {
				vouchers += 1;
			} else if (item.type === "gift") {
				gifts += 1;
			}
		});
		
		if (vouchers > 0) {
			vouchers = true;
		} else {
			vouchers = false;
		}
		if (gifts > 0) {
			gifts = true;
		} else {
			gifts = false;
		}
		this.props.onConfirm(this.state.data.selected, this.state.data.coupons,data.couponMoney, vouchers, gifts);
	},
	render() {
		var coupon = this.state.couponData,
		coupons = this.state.coupons ? this.state.coupons : [],
		selected = this.state.selected ? this.state.selected : [],
		disableArr = [];
		return (
			<div className="coupon-list">
				<ul className="avaliable">
					{coupon.map(item => {
						let count = 0, flag;
						if (this.state.min < item.min && (selected.length === 0 || !~selected.indexOf(item.c2uid))) {
							disableArr.push({
								c2uid: item.c2uid,
								reason: 1
							});
							return;
						}
						coupons.forEach(function(n, i) {
							if (n.id !== item.couponId && (n.share && !item.share || !n.share)  && (selected.length === 0 || !~selected.indexOf(item.c2uid))) {
								flag = 1;
								return false;
							}
							if (n.id === item.couponId) count++;
						});
						if (flag) {
							disableArr.push({
								c2uid: item.c2uid,
								reason: 3
							});
							return;
						}
						if (item.sheets && count >= item.sheets && (selected.length === 0 || !~selected.indexOf(item.c2uid))) {
							disableArr.push({
								c2uid: item.c2uid,
								reason: 2
							});
							return;
						}
						return (
							<CouponItem
								active={selected.length && !!~selected.indexOf(item.c2uid) ? 'active' : ''}
								couponData={item}
							 	onCouponSelect={this.couponSelect.bind(this)} />
						);
					})}
				</ul>

				{disableArr.length ? <h3>不可用优惠券</h3> : ''}

				<ul className="disable">
					{coupon.map(item => {
						let flag;
						disableArr.forEach(function(n, i) {
							if (n.c2uid !== item.c2uid) return;
							flag = n;
						});
						if (flag) {
							return (
								<CouponItem reason={flag.reason} couponData={item} />
							);
						}
					})}
				</ul>

				<footer>
					<a className="confirm"
						onClick={this.confirm.bind(this)}>确定</a>
				</footer>

			</div>
		);
	},
	shouldComponentUpdate() {
		return true;
	}
});

/*******************************************************************/

let CouponItem = React.createClass({
	getInitialState() {
		return {
			couponData: this.props.couponData
		};
	},
	render() {
		var couponData = this.state.couponData,
		reason = this.props.reason;
		return (
			<li id={couponData.c2uid} className={this.props.active ? 'active' : ''} data-type={couponData.type} data-coupon={couponData.couponId} data-share={couponData.share}>
				<a href="javascript:void(0);"
					onClick={this.props.onCouponSelect}>
					<div className="info">
						<h2>{couponData.title}</h2>
						<p className="expiry">有效期至：{couponData.expiry}</p>
						{reason ?
							<p className="reason">
								不可用原因：
								{reason === 1
									? '未达到最低消费金额' + couponData.min + '元'
									: reason === 2
										? '单次消费最多可使用' + couponData.sheets + '张'
										: '不可与其他优惠券同时使用'}
							</p> : ''}
					</div>
					<div className="value">
						<span>{couponData.value}</span>
						<b>元</b>
						<i className="triangle"></i>
						<i className="hook"></i>
					</div>
				</a>
			</li>
		);
	},
	shouldComponentUpdate() {
		return true;
	}
});