import {
	formatTime
} from '../../utils/util.js';
import config from '../../config/config.js';

Page({
	data: {
		date: '', // 日期
		weatherInfo: {}, // 天气数据
		inputContent: '', // 输入框内容
	},
	localCity: null, // 本地城市
	currentCity: null, // 查看城市
	onLoad(options) {
		//订阅消息
		this.updateTime(); // 设置时间
		// 获取天气
		if (options.city) {
			this.searchByCity(options.city);
		} else {
			this.getLocalCityWeacher();
		}
	},
	// bookMessage(){
	//   wx.requestSubscribeMessage({
	//     tmplIds: ['mmlkiVj6LYq42i90WSxW4qz-bkaukyXR8hoHQKY6sL0'],
	//     success(res) {},
	//     fail(err){console.log(err)}
	//   })
	// },
	/**
	 * 更新时间
	 */
	updateTime() {
		const time = new Date(); // 获取当前时间对象
		const date = formatTime(time).split(' ')[0] + ' ' + this.formatWeekday(time.getDay()); // 获取日期和星期数
		this.setData({
			date: date
		}); // 保存
	},
	/**
	 * 获取当前城市天气数据
	 */
	getLocalCityWeacher() {
		wx.showToast({
			title: '正在定位...',
			icon: 'loading',
			duration: 2000000,
		});
		// 获取当前经纬度
		wx.getLocation({
			success: (res) => {
				this.searchByLocation(res.latitude, res.longitude);
			},
			fail: () => {
				wx.hideToast();
				wx.showModal({
					title: '定位失败',
					content: '获取不到本地天气了呢！',
					showCancel: false,
				});
			}
		});
	},

	/**
	 * 通过经纬度查询天气
	 * @param {number} latitude 纬度
	 * @param {number} longitude 经度
	 */
	searchByLocation(latitude, longitude) {
		// 更新时间
		this.updateTime();
		wx.showToast({
			title: '正在查询...',
			icon: 'loading',
			duration: 2000000
		});
		// 通过经纬度获取天气数据
		wx.request({
			url: `${config.request.host}/gps-to-weather?from=1&lat=${latitude}&lng=${longitude}&needIndex=1&needMoreDay=1`,
			data: {},
			header: config.request.header,
			success: (res) => {
				// 保存天气数据
				this.setData({
					weatherInfo: this.processData(res.data.showapi_res_body)
				});
				this.localCity = res.data.showapi_res_body.cityInfo.c3;
				this.currentCity = res.data.showapi_res_body.cityInfo.c3;
				wx.hideToast();
			},
			fail: () => {
				wx.hideToast();
				wx.showModal({
					title: '网络超时',
					content: '连接服务器失败,请检查网络设置！',
					showCancel: false
				});
			}
		});
	},

	/**
	 * 通过城市名查询天气
	 * @param {string} city 
	 */
	searchByCity(city) {
		// 更新时间
		this.updateTime();
		// loading
		wx.showToast({
			title: '正在加载...',
			icon: 'loading',
			duration: 2000000
		});
		// 通过城市名获取天气数据
		wx.request({
			url: config.request.host + '/area-to-weather?area=' + city + '&needIndex=1&needMoreDay=1',
			header: config.request.header,
			success: (res) => {
				wx.hideToast();
				if (res.data.showapi_res_body.ret_code == 0) {
					// 设置全局变量
					this.currentCity = res.data.showapi_res_body.cityInfo.c3
					this.setData({
						weatherInfo: this.processData(res.data.showapi_res_body)
					});
				} else {
					wx.showModal({
						title: '查询失败',
						content: '输入的城市名称有误，请重新输入！',
						showCancel: false
					});
				}
			},
			fail: () => {
				wx.hideToast()
				wx.showModal({
					title: '网络超时',
					content: '当前网络不可用,请检查网络设置！',
					showCancel: false
				});
			}
		});
	},

	/**
	 * 刷新
	 */
	refresh() {
		this.searchByCity(this.currentCity);
	},

	/**
	 * 处理天气数据
	 * @param {object} data 数据
	 */
	processData(data) {
		const weatherInfo = {};
		// 城市信息
		weatherInfo.city = {};
		weatherInfo.city.id = data.cityInfo.c1;
		weatherInfo.city.name_en = data.cityInfo.c2;
		weatherInfo.city.name = data.cityInfo.c3;
		// 天气信息
		weatherInfo.now = data.now;
		weatherInfo.today = data.f1;
		weatherInfo.forecast1 = [data.f2, data.f3, data.f4];
		weatherInfo.forecast2 = [data.f5, data.f6, data.f7];
		// 处理星期数
		weatherInfo.forecast1[0].weekday = '明天';
		weatherInfo.forecast1[1].weekday = '后天';
		weatherInfo.forecast1[2].weekday = this.formatWeekday(weatherInfo.forecast1[2].weekday);
		for (let i = 0; i < weatherInfo.forecast2.length; i++) {
			weatherInfo.forecast2[i].weekday = this.formatWeekday(weatherInfo.forecast2[i].weekday);
		}
		return weatherInfo;
	},

	/**
	 * 格式化星期数
	 * @param {number} index 星期数
	 */
	formatWeekday(index) {
		const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
		return weekdays[index];
	},

	/**
	 * 清除输入框内容
	 */
	clearInputContent() {
		this.setData({
			inputContent: ''
		});
	},

	/**
	 * 输入触发函数
	 * @param {object} event 事件
	 */
	onInputFieldChange(event) {
		// 设置全局变量
		this.setData({
			inputContent: event.detail.value
		});
	},

	/**
	 * 点击搜索按钮
	 */
	onSearchBtnClick() {
		// 输入是否为空
		if (this.data.inputContent.length > 0) {
			// 调用搜索函数
			this.searchByCity(this.data.inputContent);
			// 清空输入
			this.clearInputContent();
		} else {
			wx.showToast({
				title: '请输入要查询的城市！',
				icon: 'none',
				duration: 1000
			});
		}
	},

	/**
	 * 点击清除按钮
	 */
	onClearBtnClick() {
		this.clearInputContent();
	},

	/**
	 * 点击刷新按钮
	 */
	onRefreshBtnClick() {
		this.refresh();
	},

	/**
	 * 点击定位按钮
	 */
	onLocalBtnClick() {
		this.clearInputContent();
		if (this.localCity) {
			this.searchByCity(this.localCity);
		} else {
			this.getLocalCityWeacher();
		}
	},

	/**
	 * 下拉刷新
	 */
	onPullDownRefresh() {
		this.searchByCity(this.currentCity);
		wx.stopPullDownRefresh();
	},

	/**
	 * 分享给朋友
	 */
	onShareAppMessage() {
		const city = this.data.weatherInfo.city.name;
		const now = this.data.weatherInfo.now;
		return {
			title: `${city}当前天气：${now.weather} | ${now.temperature}℃`,
			path: `/pages/index/index?city=${city}`,
		};
	},

	/**
	 * 分享至朋友圈
	 */
	onShareTimeline() {
		const city = this.data.weatherInfo.city.name;
		const now = this.data.weatherInfo.now;
		return {
			title: `${city}当前天气：${now.weather} | ${now.temperature}℃`,
			path: `city=${city}`,
		};
	}

});