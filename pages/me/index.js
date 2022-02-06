const app = getApp()
Page({
	data: {
		isShowWeChat: false,
		userInfo: {},
		canIUseGetUserProfile: false,
	},
	onLoad() {
		const _this = this
		wx.login({
			success(res) {
				if (res.code) {
					//发起网络请求
					app.api.request('/api/get/user/info', {
						code: res.code
					}).then(r => {
						console.log(r)
						if (r.length > 0) {
							_this.setData({
								userInfo: r[0]
							})
							// app.globalData.user = r[0].id
						} else {
							wx.getUserInfo({
								success: function (res) {
									const userInfo = res.userInfo
									_this.setData({
										userInfo
									})
								}
							})
						}
					})
				} else {
					console.log('登录失败！' + res.errMsg)
				}
			}
		})
		// if (wx.getUserProfile) {
		// 	this.setData({
		// 		canIUseGetUserProfile: true
		// 	})
		// }
	},
	// getUserProfile(e) {
	// 	// 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
	// 	// 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
	// 	wx.getUserProfile({
	// 		desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
	// 		success: (res) => {
	// 			this.setData({
	// 				userInfo: res.userInfo,
	// 				canIUseGetUserProfile: false
	// 			})
	// 			// 登录携带code
	// 		}
	// 	})
	// },
	//点击登录
	login() {
		const _this = this
		wx.getUserProfile({
			desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
			success: (info) => {
				wx.login({
					success(res) {
						if (res.code) {
							//发起网络请求
							app.api.request('/api/login', {
								code: res.code,
								avatarUrl: info.userInfo.avatarUrl,
								nickName: info.userInfo.nickName
							}).then(r => {
								app.util.toast('登陆成功')
								_this.setData({
									userInfo: r[0]
								})
								app.globalData.user = r[0].id

							})
						} else {
							console.log('登录失败！' + res.errMsg)
						}
					}
				})
			},
			fail: (err) => {
				// console.log(err)
				app.util.toast('小哥哥，拒绝可不行哦！')
			}
		})
	},
	openHelper() {
		wx.switchTab({
			url: '/pages/help/index',
		})
	},
	openWeather() {
		wx.switchTab({
			url: '/pages/index/index',
		})
	},
	openBusEwm() { // 打开乘坐公交
		wx.navigateTo({
			url: '/pages/signIn/index',
		})
	},
	showPopup() {
		this.setData({
			isShowWeChat: true
		});
	},

	onClosePopup() {
		this.setData({
			isShowWeChat: false
		});
	},
	onShareAppMessage: function () {},
	//朋友圈
	onShareTimeline() {},
})