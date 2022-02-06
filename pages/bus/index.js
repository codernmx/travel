import QQMapWX from '../../libs/qqmap-wx-jssdk'
import config from '../../config/config';
import Toast from '../../vant-weapp/toast/toast';
import Notify from '../../vant-weapp/notify/notify';
const chooseLocation = requirePlugin('chooseLocation');
Page({
	data: {
		latitude: null,
		longitude: null,
		markList: [], //点的列表
		flag: null, //判断是起点还是终点选点点过去的  1 起点  2终点
		startInfo: {
			name: '我的位置'
		},
		endInfo: {
			name: '输入终点'
		},
	},
	// 生命周期函数--监听页面加载
	onLoad: function (options) {
		const _this = this

		wx.getLocation({
			type: 'wgs84',
			isHighAccuracy: true,
			success(res) {
				_this.setData({
					latitude: res.latitude,
					longitude: res.longitude
				})
				_this.getLocationInfo()
			}
		})
	},
	//开始点
	toStart() {
		this.setData({
			flag: 1
		})
		const key = config.txKey; //使用在腾讯位置服务申请的key
		const referer = config.referer; //调用插件的app的名称
		const location = JSON.stringify({
			latitude: 39.89631551,
			longitude: 116.323459711
		});
		const category = '生活服务,娱乐休闲';
		wx.navigateTo({
			url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&category=${category}`
		});
	},
	//结束点
	toEnd() {
		this.setData({
			flag: 2
		})
		const key = config.txKey; //使用在腾讯位置服务申请的key
		const referer = config.referer; //调用插件的app的名称
		const category = '生活服务,娱乐休闲';
		wx.navigateTo({
			url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&category=${category}`
		});
	},
	onShow: function () {
		const _this = this
		const location = chooseLocation.getLocation();
		//console.log(location)
		const flag = this.data.flag
		if (flag == 1 && location != null) {
			this.setData({
				startInfo: location
			})
		} else if (flag == 2 && location != null) {
			this.setData({
				endInfo: location
			})
		} else if (flag == 'null') {
			//获取默认地址
			wx.getLocation({
				type: 'wgs84',
				success(res) {
					_this.setData({
						startInfo: {
							name: '我的位置',
							latitude: res.latitude,
							longitude: res.longitude
						}
					})
				}
			})
		}
	},
	routePlan() {
		if (this.data.endInfo.latitude) {
			let plugin = requirePlugin('routePlan');
			let key = config.txKey; //使用在腾讯位置服务申请的key
			let referer = config.referer; //调用插件的app的名称
			const startInfo = this.data.startInfo
			const endInfo = this.data.endInfo
			let startPoint = JSON.stringify({
				'name': startInfo.name,
				'latitude': startInfo.latitude,
				'longitude': startInfo.longitude
			})
			let endPoint = JSON.stringify({ //终点
				'name': endInfo.name,
				'latitude': endInfo.latitude,
				'longitude': endInfo.longitude
			});
			wx.navigateTo({
				url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint + '&startPoint=' + startPoint + '&mode=transit'
			});
		} else {
			Toast('哥,请选择终点再来!');
		}
	},
	getLocationInfo() {
		// 引入SDK核心类// 实例化API核心类
		var qqmapsdk = new QQMapWX({
			key: config.txKey // 必填
		})
		var _this = this;
		// 调用接口
		const center = `${this.data.latitude},${this.data.longitude}`
		qqmapsdk.search({
			keyword: '公交站', //搜索关键词
			location: center, //中心点
			page_size: 20, //一页数据
			success: function (res) { //搜索成功后的回调
				//console.log(res)
				//存储获取到的点
				_this.setData({
					markList: res.data
				})
				Notify({
					type: 'success',
					message: `为你找到${res.data.length}个附近公交站`,
					duration: 'notify',
				});
				var mks = []
				for (var i = 0; i < res.data.length; i++) {
					mks.push({ // 获取返回结果，放到mks数组中
						title: res.data[i].title,
						id: res.data[i].id,
						latitude: res.data[i].location.lat,
						longitude: res.data[i].location.lng,
						iconPath: "../../assets/imgs/swiper/marker.png", //图标路径
						width: 30,
						height: 30
					})
				}
				_this.setData({ //将搜索结果显示在地图中
					markers: mks
				})

				let newMark = []
				res.data.forEach(item => {
					newMark.push(item.location)
				});
				newMark.forEach(item => {
					item.latitude = item.lat
					item.longitude = item.lng
				});
				// //console.log(newMark, 'newMark')
				qqmapsdk.calculateDistance({
					from: '', //若起点有数据则采用起点坐标，若为空默认当前地址
					to: newMark, //终点坐标
					success: function (res) { //成功后的回调
						//console.log(res, 'calculateDistance');
						let marketList = _this.data.markList
						var res = res.result;
						var dis = [];
						for (var i = 0; i < res.elements.length; i++) {
							marketList[i].distance = res.elements[i].distance
						}

						_this.setData({ //设置并更新distance数据
							markList: marketList
						});
					},
					fail: function (error) {
						//console.error(error);
					},
					complete: function (res) {
						//console.log(res);
					}
				})
			},
			fail: function (res) {
				//console.log(res);
			},
			complete: function (res) {
				//console.log(res);
			}
		});
	},
	//打开地图app
	openMapApp: function (event) {
		const info = event.currentTarget.dataset.item
		//console.log(info)
		wx.openLocation({
			latitude: info.location.lat,
			longitude: info.location.lng,
			name: info.title,
			address: info.category,
			scale: 18
		})
	},
	onShareAppMessage: function () {
		return {
			title: "附近公交",
			path: `/pages/bus/index`
		}
	},
	//朋友圈
	onShareTimeline() {}
})