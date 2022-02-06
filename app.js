import util from './utils/util';
import api from './utils/api';

App({
	onLaunch() { //更新检测
		if (wx.canIUse('getUpdateManager')) {
			const updateManager = wx.getUpdateManager()
			updateManager.onCheckForUpdate(function (res) {
				// 请求完新版本信息的回调
				if (res.hasUpdate) { //有新版本
					updateManager.onUpdateReady(function () {
						wx.showModal({
							title: '更新提示',
							content: '是否加载新版本应用',
							success: function (res) {
								console.log('success====', res)
								// res: {errMsg: "showModal: ok", cancel: false, confirm: true}
								if (res.confirm) {
									// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
									updateManager.applyUpdate()
								}
							}
						})
					})
					updateManager.onUpdateFailed(function () {
						wx.showModal({ // 新的版本下载失败 给提示
							title: '已经有新版本了哟~',
							content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
						})
					})
				}
			})
		}
	},
	onShareTimeline() {},
	globalData: {
		isLogin: false, // 是否已登录小程序
		token: '6970b773309c4a4094824c8cbd253d8e',
		user: null,
	},
	util,    //引入工具
	api      //引入api
})