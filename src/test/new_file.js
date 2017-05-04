
/***优惠券****************************************************************/

let CouponList = React.createClass({
	getInitialState() {
		this.selected = this.props.selected;
		this.coupons = this.props.coupons;
		return {
			data: this.props.data,
			min: this.props.min ? this.props.min : 0,
			coupons: this.props.coupons,
			selected: this.props.selected
		};
	},
	couponSelect(e) {
		var index;
		if (e.currentTarget.parentNode.className === 'active') {
			index = this.selected.indexOf(e.currentTarget.parentNode.id);
			this.selected.splice(index, 1);

			this.coupons.forEach(function(n, i) {
				if (n.id === e.currentTarget.parentNode.getAttribute('data-coupon')) {
					index = i;
					return false;
				}
			});
			this.coupons.splice(index, 1);
			this.setState({
				selected: this.selected,
				coupons: this.coupons
			});
			return;
		}
		// 已选择
		this.selected.push(e.currentTarget.parentNode.id);
		// 已选择的券的 id 和 share
		this.coupons.push({
			'id': e.currentTarget.parentNode.getAttribute('data-coupon'),
			'share': e.currentTarget.parentNode.getAttribute('data-share') === 'true' ? true : false,
			'type': e.currentTarget.parentNode.getAttribute('data-type')
		});
		this.setState({
			selected: this.selected,
			coupons: this.coupons
		});
	},
	confirm() {
		let couponMoney = 0, vouchers = 0, gifts = 0;
		this.state.selected.forEach(item => {
			this.state.data.forEach(d => {
				if (d.c2uid == item) {
					couponMoney += d.value;
				}
			})
		});
		this.coupons.forEach(item => {
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
		this.props.onConfirm(this.selected, this.coupons, couponMoney, vouchers, gifts);
	},
	render() {
		var coupon = this.state.data,
		coupons = this.coupons ? this.coupons : [],
		selected = this.selected ? this.selected : [],
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
								data={item}
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
								<CouponItem reason={flag.reason} data={item} />
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
			data: this.props.data
		};
	},
	render() {
		var data = this.state.data,
		reason = this.props.reason;

		return (
			<li id={data.c2uid} className={this.props.active ? 'active' : ''} data-type={data.type} data-coupon={data.couponId} data-share={data.share}>
				<a href="javascript:void(0);"
					onClick={this.props.onCouponSelect}>
					<div className="info">
						<h2>{data.title}</h2>
						<p className="expiry">有效期至：{data.expiry}</p>
						{reason ?
							<p className="reason">
								不可用原因：
								{reason === 1
									? '未达到最低消费金额' + data.min + '元'
									: reason === 2
										? '单次消费最多可使用' + data.sheets + '张'
										: '不可与其他优惠券同时使用'}
							</p> : ''}
					</div>
					<div className="value">
						<span>{data.value}</span>
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