import config from '../../config/config';
Page({
	data: {

	},
	onLoad: function (options) {

	},
	openMap() {
		let plugin = requirePlugin("subway");
		let key = config.txKey; //使用在腾讯位置服务申请的key;
		let referer = config.referer; //调用插件的app的名称
		wx.navigateTo({
			url: 'plugin://subway/index?key=' + key + '&referer=' + referer
		});
	},
	onShareAppMessage: function () {

	}
})