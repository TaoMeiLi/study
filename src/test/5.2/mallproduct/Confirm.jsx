import _ from 'underscore';
import React from 'react';
import appUtils from 'utils/appUtils';

const
	_k = (key, ...args)=>appUtils.i18n.getKey.apply(null, [$i18n.mallproduct_confirm[key], ...args]),
	_num = n=>parseFloat(n).toFixed(2);

export default React.createClass({
	_baseVars() {
		let
			{data} = this.state,
			{totalPrice, deduct, couponMoney, allCoupons, couponShow, couponSelectedUid, couponSelectedData, usePriorityLogic} = data,
			hasDeduct = !_.isUndefined(deduct) || (_.isArray(deduct) && !_.isEmpty(deduct));
			hascouponSelectedUid = !_.isUndefined(couponSelectedUid) || (_.isArray(couponSelectedUid) && !_.isEmpty(couponSelectedUid));
			hascouponSelectedData = !_.isUndefined(couponSelectedData) || (_.isArray(couponSelectedData) && !_.isEmpty(couponSelectedData));
			deduct = hasDeduct ? deduct : [];
			data.couponSelectedUid = hascouponSelectedUid ? couponSelectedUid : [];
			data.couponSelectedData = hascouponSelectedData ? couponSelectedData : [];
			data.couponMoney = couponMoney ? couponMoney :0;
			console.log(1,this.state);
		return {data, totalPrice, deduct, couponMoney, allCoupons, couponShow, couponSelectedUid, couponSelectedData, usePriorityLogic, hasDeduct};
	},
	_getDeduct(id) {
		return _.findWhere(this.state.data.deduct, {id});
	},
	_onDeductToggle(id, isOpen) {
		let
			data = _.clone(this.state.data),
			deduct = this._getDeduct(id);
		_.findWhere(data.deduct, {id}).using = isOpen;
		deduct.using = isOpen;
		this.setState({data});
	},
	_onPasswordChange(value) {
		let
			data = _.clone(this.state.data);
		if (_.isUndefined(data.password)) return;
		data.password.value = value;
		this.setState({data});
	},
	//计算对应部分支付的款额
	//依赖于 componentWillMount 时注入的 _idx
	//计算值放入缓存以防止多次渲染
	_payVars() {
		let
			{data, totalPrice, deduct, couponMoney, allCoupons, couponShow, couponSelectedUid, couponSelectedData, usePriorityLogic, hasDeduct} = this._baseVars(),
			cache = this._deductCostCache,
			unCheckedItems = deduct.filter(d=>!d.using),
			checkedItems = deduct.filter(d=>d.using),
			oldVlu = usePriorityLogic ? d=>d.onhand.amount : d=>(cache[d._idx]||d.onhand.amount),
			checkedTotal = checkedItems.reduce( (prev,d)=>prev+Math.min(d.onhand.amount, oldVlu(d)), 0 ) + couponMoney,
			deductIsEnough = checkedTotal >= totalPrice,
			needToPay = deductIsEnough ? 0 : totalPrice-checkedTotal;
		return {cache, unCheckedItems, checkedItems, oldVlu, checkedTotal, deductIsEnough, needToPay};
	},
	_calcPayPart() {
		if (_.isUndefined(this.state.data.deduct)) {
			if(_.isUndefined(this.state.data.couponShow)){
				this._needToPay = this.state.data.totalPrice;
				return;
			}else{
				let moneyDifference=this.state.data.totalPrice-this.state.data.couponMoney;
				if(moneyDifference>0){
					this._needToPay = moneyDifference;
					return;
				}else{
					this._needToPay = 0;
					return;
				}
			}
		}
		let {data, totalPrice, deduct, couponMoney, allCoupons, couponShow, couponSelectedUid, couponSelectedData, usePriorityLogic, hasDeduct} = this._baseVars();
		console.log(usePriorityLogic ? 'use priority logic' : '');
		if (!hasDeduct)	return;
		if (_.isUndefined(this._deductCostCache)) this._deductCostCache = deduct.map(d=>void 0);
		let
			{cache, unCheckedItems, checkedItems, oldVlu, checkedTotal, deductIsEnough, needToPay} = this._payVars(),
			min = dItem=>(...args)=>_.min([dItem.onhand.amount, ...args]),
			cacheForEach = arr=>vluFunc=>arr.forEach(dItem=>cache[dItem._idx]=vluFunc(dItem));
		if (deductIsEnough) {
			console.log('√ 各种扣款足够支付', cache);
			let t = totalPrice-couponMoney;
			cacheForEach(checkedItems)(d=>{ let v = min(d)(t,oldVlu(d)); t -= v; return v; });
			cacheForEach(unCheckedItems)(()=>0);
			console.log('-->', cache);
		} else {
			console.log('× 各种扣款尚不足支付', cache);
			cacheForEach(checkedItems)(d=>min(d)(totalPrice,oldVlu(d)));
			cacheForEach(unCheckedItems)(d=>min(d)(totalPrice,needToPay));
			console.log('-->', cache);
		}
		this._needToPay = needToPay;
	},
	_onSubmit() {
		let
			{data, totalPrice, deduct, couponMoney, allCoupons, couponShow, couponSelectedUid, couponSelectedData, usePriorityLogic, hasDeduct} = this._baseVars(),
			{cache, unCheckedItems, checkedItems, oldVlu, checkedTotal, deductIsEnough, needToPay} = this._payVars(),
			requirePwd = ()=>{
				let {password} = data;
				return !_.isUndefined(password.value) && password.value.replace(/^\s+/, '').replace(/\s+$/, '').length;
			},
			errNotice = null;
		if (data.totalPrice) {
			let moneyGap = data.totalPrice-data.couponMoney;
			//不支持微信支付
			if (_.isUndefined(data.payMethods)){
				//没有优惠券抵扣
				if(!couponMoney){
					//如果支持的支付方式都没有打开：请选择支付方式；
					if (!deduct.filter(d=>d.using).length) {
						errNotice = '请选择支付方式';
					}
					//如果积分抵扣、储值支付至少打开一项，但支付金额小于总金额时：余额不足；
					
					else if (!deductIsEnough) {
						errNotice = '余额不足';
					}
				}
				//有优惠券抵扣
				else{
					//如果支持的支付方式都没有打开或则没有支持的支付方式并且优惠券抵扣金额不够：余额不足
					if (!deduct.filter(d=>d.using).length && moneyGap>0) {
						errNotice = '余额不足';
					}
					//如果积分抵扣、储值支付至少打开一项，加上优惠券抵扣，但支付金额小于总金额时：余额不足；
					else if (!deductIsEnough) {
						errNotice = '余额不足';
					}
				}
					
			}
			//使用了储值等
			if (this.isOpen && !_.isUndefined(data.password)) {
				let {password} = data;
				//未填写交易密码：请填写交易密码；
				if (password.type === 'pay' && !requirePwd()) {
					errNotice = '请填写交易密码';
				}
				//未填写短信验证码：请填写短信验证码；
				if (password.type === 'sms' && !requirePwd()) {
					errNotice = '请填写短信验证码';
				}
			}

			if (errNotice)
				return this.props.alert(errNotice);

			let submitData = null;
			if (hasDeduct) {
				submitData = _.clone(checkedItems);
				this._deductCostCache.forEach((vlu,idx)=>{
					let item = _.findWhere(submitData, {'_idx': idx});
					if (item) item.cost = vlu;
				});
			}
			this.props.onSubmit({
				deduct: submitData, 
				password: data.password, 
				couponMoney: data.couponMoney,
				coupon: data.couponSelectedUid,
				needToPay: this._needToPay.toFixed(2)
			});
		}
	},
	_onCoupon(id) {
		let {data, totalPrice, deduct, couponMoney, allCoupons, couponShow, couponSelectedUid, couponSelectedData, usePriorityLogic, hasDeduct} = this._baseVars();
		let getCouponUrl = id=>`${_appFacade.ajaxPrefix}/product/coupon/`+id
		appUtils.doGet(getCouponUrl(id)).then(item=>{
			data = this.state.data;
			data.allCoupons = item;
			data.couponShow = true;
			this.setState({data});
		});
	},
	onConfirm (couponSelectedUid,couponSelectedData, couponMoney, vouchers, gifts) {
		let data = this.state.data;
		this.voucher = vouchers;
		this.gift = gifts;
		data.couponShow = false;
		data.couponMoney= couponMoney;
		this.setState({data});
	},
	_onToggleState(item, status) {
		let data = this.state.data;
		if (item === "stored") {
			this.stored = status;
		} else if (item === "intergral") {
			this.intergral = status;
		}
		this.isOpen = this.stored && ~data.password.items.indexOf('stored') || this.intergral && ~data.password.items.indexOf('intergral');
		if (this.isOpen !== this.state.isOpen) {
			this.setState({
				isOpen: this.isOpen
			});
		}
	},

	getInitialState() {
		return {
			data: this.props.data,
			isOpen: false
		};
	},
	render() {
		this._calcPayPart();
		let {data} = this.state;
		return <div>
		{data.couponShow
			? <CouponList
				couponData={data.allCoupons}
				couponSelectedUid={data.couponSelectedUid}
				couponSelectedData={data.couponSelectedData}
				min={parseFloat(data.totalPrice)}
			 	onConfirm={this.onConfirm.bind(this)}/>
			:<div id="mallproduct_confirm" ref="p_root">
				<div className="mod_common_li_item mod_common_list_style noGap total">
					{/*总金额*/}
					<label>{_k('label_total')}</label>
					<span className="pull-right"
						dangerouslySetInnerHTML={{__html:
							appUtils.i18n.getKey($i18n.rmb, _num(data.totalPrice))
						}}></span>
				</div>
				{data.couponNum
					?
						<div className="couponstyle">
							<a href="javascript:void(0);"
								 onClick={this._onCoupon.bind(this,data.id)} >
								<p>优惠券</p>
								<b>{data.couponMoney ? '已抵扣' + data.couponMoney + '元' : data.couponNum + '张'+'可用优惠券'}</b>
							</a>
						</div>		
					: null
				}
				{
					data.totalPrice
						? <div>
							{/*各种抵扣*/}
							{
								!_.isUndefined(data.deduct)
									? <ul className="mod_common_list deduct">
										{data.deduct.map( (item,idx)=>(
											<DeductItem
												data={item}
												password={data.password}
												cost={this._deductCostCache[idx]}
												onToggleState={this._onToggleState.bind(this)}
												onToggle={this._onDeductToggle.bind(this)}
												onPassword={this._onPasswordChange.bind(this)}
												onSMS={this.props.onSMS} />
										))}
										{
											this.state.isOpen
												? _.isUndefined(data.password)
													? null
													: data.password.type === 'sms'
														? <li><SMSPwd
															delay={data.password.delay}
															maxLength={data.password.maxLength}
															onSMS={this.props.onSMS}
															//onTurnOff={this._onTurnOff.bind(this)}
														 	onPassword={this._onPasswordChange.bind(this)}
														 	/></li>
														: <li><PayPwd
															maxLength={data.password.maxLength}
															onPassword={this._onPasswordChange.bind(this)}
														/></li>
												: null
										}
										</ul>
									: null
							}
							{/*微信支付等*/}
							{
								!_.isUndefined(data.payMethods)
									? <div className="mod_common_li_item mod_common_list_style noGap payMethods">
											<label>{data.payMethods[0].name}</label>
											<span className="pull-right"
												dangerouslySetInnerHTML={{__html:
													appUtils.i18n.getKey($i18n.rmb, _num(this._needToPay))
												}}></span>
										</div>
									: null
							}
						</div>
						: null
				}
	
				<footer className="numbtns single">
					<a className="mod_button1"
						href="javascript:void(0)"
						onClick={this._onSubmit.bind(this)}
						dangerouslySetInnerHTML={{__html:
							this._needToPay
								? !_.isUndefined(data.payMethods)
									? data.payMethods[0].btn.label.replace('{0}',_num(this._needToPay))
									: _k('label_btn_zero')
								: _k('label_btn_zero')
						}}></a>
				</footer>
			</div>
			}
		</div>;
	},
	componentWillMount() {
		if (!_.isUndefined(this.state.data.deduct)) {
			this.state.data.deduct.forEach(
				(item,idx)=> item._idx = idx
			);
		}
		this._calcPayPart();
	},
	componentDidMount() {
		appUtils.parseClientRoute();
		appUtils.react.fixCopyrightJump();
	},
	componentWillUpdate(nextProps, nextState) {
		if (!_.isUndefined(this.state.data.deduct)) {
			this._calcPayPart();
		}
	}
});

/*******************************************************************/

let DeductItem = React.createClass({
	_onCheckboxChange(e) {
		let bool = e.currentTarget.checked;
		this.setState({
			isOpen: bool
		});
		this.props.onToggle(this.state.data.id, bool);
		let item = this.state.data.item;
		this.props.onToggleState(item, bool);
	},
	_onTurnOff() {
		this.props.onToggle(this.state.data.id, false);
	},
	getInitialState() {
		let {data, cost} = this.props;
		return {
			data,
			cost
		};
	},
	render() {
		let _d = this.state.data;
		return <li className="noGap">
			<div>
				<h1>{_d.label}</h1>
				<h2 dangerouslySetInnerHTML={{__html:
					appUtils.i18n.getKey(
						_d.onhand.label,
						_num(_d.onhand.amount)
					)
				}}></h2>
			</div>
			<h3 dangerouslySetInnerHTML={{__html:
				appUtils.i18n.getKey(
					$i18n.rmb,
					this.state.isOpen
						? _num(this.state.cost)
						: '0.00'
				)
			}}></h3>
			<input
				type="checkbox"
				className="mod_round_checkbox"
				checked={!!this.state.cost && this.state.isOpen}
				disabled={!this.state.cost}
				onChange={this._onCheckboxChange.bind(this)}
				 />
		</li>;
	},
	componentWillReceiveProps(nextProps) {
		if (this.props.cost != nextProps.cost) {
			this.setState({cost: nextProps.cost});
		}
	}
});

/*******************************************************************/

let PayPwd = React.createClass({
	render() {
		return <div className="pwd pay">
			<input type="password"
				maxLength={this.props.maxLength}
				placeholder={$i18n.mallproduct_confirm.pwd_placeholder_pay}
				onChange={e=>this.props.onPassword(e.currentTarget.value)} />
		</div>;
	}
});

/*******************************************************************/

let SMSPwd = React.createClass({
	getInitialState() {
		return {
			countdown: 0
		};
	},
	render() {
		return <div className="pwd sms">
			<input type="text"
				maxLength={this.props.maxLength}
				placeholder={$i18n.mallproduct_confirm.pwd_placeholder_sms}
				onChange={e=>this.props.onPassword(e.currentTarget.value)} />
			<button
				className={!this.state.countdown ? 'active' : ''}
				disabled={!!this.state.countdown}
				onClick={this._sendAndCountdown.bind(this)}
				>{
				this.state.countdown
					? appUtils.i18n.getKey(
						$i18n.mallproduct_confirm.pwd_time_sms,
						this.props.delay - this.state.countdown + 1
					)
					: $i18n.mallproduct_confirm.pwd_resent_sms
			}</button>
		</div>;
	},
	componentDidMount() {
		//初始化后就发送一次
		this._sendAndCountdown();
		//第一次不显示重发，优化视觉体验
		this.setState({
			countdown: 1
		});
	},

	turnOff() {
		this._clearTimeout();
		this.props.onTurnOff();
	},

	_sendAndCountdown() {
		this._clearTimeout();
		this.props.onSMS(this);
		this._setTimeout();
	},
	_setTimeout() {
		this._timeout = setTimeout(
			()=>{
				try {
					let cd = this.state.countdown;
					if (cd < this.props.delay) {
						this.setState({
							countdown: cd + 1
						});
						this._setTimeout();
					} else {
						this._clearTimeout();
					}
				} catch (ex) {}
			},
			1000
		);
	},
	_clearTimeout() {
		clearTimeout(this._timeout);
		this.setState({
			countdown: 0
		})
	},
});

/***优惠券***************************************************************/
let CouponList = React.createClass({
	getInitialState() {
		return {
			couponData: this.props.couponData,
			couponSelectedData: this.props.couponSelectedData,
			couponSelectedUid: this.props.couponSelectedUid,
			min:this.props.min
		};
	},
	couponSelect(e) {
		var index;
		if (e.currentTarget.parentNode.className === 'active') {
			index = this.state.couponSelectedUid.indexOf(e.currentTarget.parentNode.id);
			this.state.couponSelectedUid.splice(index, 1);

			this.state.couponSelectedData.forEach(function(n, i) {
				if (n.id === e.currentTarget.parentNode.getAttribute('data-coupon')) {
					index = i;
					return false;
				}
			});
			this.state.couponSelectedData.splice(index, 1);
			this.setState({
				couponSelectedUid: this.state.couponSelectedUid,
				couponSelectedData: this.state.couponSelectedData
			});
			return;
		}
		// 已选择
		this.state.couponSelectedUid.push(e.currentTarget.parentNode.id);
		// 已选择的券的 id 和 share
		this.state.couponSelectedData.push({
			'id': e.currentTarget.parentNode.getAttribute('data-coupon'),
			'share': e.currentTarget.parentNode.getAttribute('data-share') === 'true' ? true : false,
			'type': e.currentTarget.parentNode.getAttribute('data-type')
		});
		this.setState({
			couponSelectedUid: this.state.couponSelectedUid,
			couponSelectedData: this.state.couponSelectedData
		});
	},
	confirm() {
		let couponMoney = 0, vouchers = 0, gifts = 0;
		this.state.couponSelectedUid.forEach(item => {
			this.state.couponData.forEach(d => {
				if (d.c2uid == item) {
					couponMoney += d.value;
				}
			})
		});
		this.state.couponSelectedData.forEach(item => {
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
		this.props.onConfirm(this.state.couponSelectedUid, this.state.couponSelectedData, couponMoney, vouchers, gifts);
	},
	render() {
		var allCoupons = this.state.couponData,
			couponSelectedData = this.state.couponSelectedData ? this.state.couponSelectedData : [],
			couponSelectedUid = this.state.couponSelectedUid ? this.state.couponSelectedUid : [],
			disableArr = [];
			return (
			<div className="coupon-list">
				<ul className="avaliable">
					{allCoupons.map(item => {
						let count = 0, flag;
						if (this.state.min < item.min && (couponSelectedUid.length === 0 || !~couponSelectedUid.indexOf(item.c2uid))) {
							disableArr.push({
								c2uid: item.c2uid,
								reason: 1
							});
							return;
						}
						couponSelectedData.forEach(function(n, i) {
							if (n.id !== item.couponId && (n.share && !item.share || !n.share)  && (couponSelectedUid.length === 0 || !~couponSelectedUid.indexOf(item.c2uid))) {
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
						if (item.sheets && count >= item.sheets && (couponSelectedUid.length === 0 || !~couponSelectedUid.indexOf(item.c2uid))) {
							disableArr.push({
								c2uid: item.c2uid,
								reason: 2
							});
							return;
						}
						return (
							<CouponItem
								active={couponSelectedUid.length && !!~couponSelectedUid.indexOf(item.c2uid) ? 'active' : ''}
								data={item}
							 	onCouponSelect={this.couponSelect.bind(this)} />
						);
					})}
				</ul>

				{disableArr.length ? <h3>不可用优惠券</h3> : ''}

				<ul className="disable">
					{allCoupons.map(item => {
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
