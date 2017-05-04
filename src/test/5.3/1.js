{data.couponNum
					?
						<div className="couponstyle">
							<ul className="mod_common_list coupon">
								<li className="noGap" >
									<a href="javascript:void(0);"  onClick={this._onCoupon.bind(this,data.id)} >
										<div>
											<h1>优惠券</h1>
											<h2>可用优惠券: ¥{data.maxCouponPay}</h2>
										</div>
										<p>{data.couponValue ? '已抵扣' + data.couponDeductMoney + '元' : data.couponNum + '张'+'可用优惠券'}</p>
									</a>
								</li>
							</ul>
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