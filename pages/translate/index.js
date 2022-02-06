const md5 = require('md5')
import Toast from '../../vant-weapp/toast/toast';
let videoAd = null
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		transResultInfo: [],
		cnValue: '',
		wordList: [], //翻译之后的数据
		spinShow: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let _this = this
		//广告
		if (wx.createRewardedVideoAd) {
			// 加载激励视频广告
			videoAd = wx.createRewardedVideoAd({
				adUnitId: 'adunit-9a02eceebb427568'
			})
			videoAd.onLoad(() => {
				console.log('onLoad event emit')
			})
			//捕捉错误
			videoAd.onError(err => {
				console.log(err)
				// 进行适当的提示
			})
			// 监听关闭
			videoAd.onClose((status) => {
				if (status && status.isEnded || status === undefined) {
					//播放成功可以拍照调用接口
					_this.chooseImg()
				} else {
					// 播放中途退出，进行提示
					Toast('看完视频才可以使用拍照识别哦~~')
				}
			})
		}
	},
	//打开广告//按钮触发加载广告
	openAdVideo() {
		console.log('打开激励视频');
		if (videoAd) {
			videoAd.show()
				.catch(() => {
					videoAd.load()
						.then(() => videoAd.show())
						.catch(err => {
							console.log(err)
							console.log('激励视频 广告显示失败')
						})
				})
		}
		// this.chooseImg()

	},
	chooseImg() { //选择文件
		let _this = this
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success(res) {
				console.log(res)
				// tempFilePath可以作为img标签的src属性显示图片
				const tempFilePaths = res.tempFilePaths
				_this.setData({
					spinShow: true
				})
				wx.uploadFile({
					url: 'https://api.nmxgzs.cn/fanyi/baidu/translate/img',
					filePath: tempFilePaths[0],
					name: 'file',
					formData: {
						'from_lang': 'auto',
						'to_lang': 'en'
					},
					success(res) {
						//do something
						let contentList = JSON.parse(res.data).data ? JSON.parse(res.data).data.data.content : []
						_this.setData({
							wordList: contentList,
							spinShow: false
						})
					},
					fail(err) {
						console.log(err)
					}
				})
			}
		})
	},
	//复制英文框
	copyEnglish() {
		let _this = this
		wx.setClipboardData({
			data: _this.data.transResultInfo[0] ? _this.data.transResultInfo[0].dst : '',
			success(res) {
				console.log(res)
			},
			fail(err) {
				console.log(err)
			}
		})
	},
	copyText() {
		let _this = this
		console.log(_this.data.wordList)
		let str = ''
		_this.data.wordList.forEach(item => {
			str = str + item.src
		});
		console.log(str, 'str')
		wx.setClipboardData({
			data: str,
			success(res) {
				console.log(res) // data
				// wx.getClipboardData({
				// 	success(res) {
				// 		console.log(res.data) // data
				// 	}
				// })
			},
			fail(err) {
				console.log(err)
			}
		})
	},
	cnOnChange(e) {
		this.setData({
			cnValue: e.detail
		})
	},
	translate() {
		let _this = this
		if (this.data.cnValue) {
			wx.request({
				url: 'https://api.nmxgzs.cn/fanyi/baidu/translate/word',
				method: 'POST',
				data: {
					query: this.data.cnValue,
					from_lang: 'auto',
					to_lang: 'en',
				},
				success(res) {
					console.log(res, 'resword')
					if (res.data.data.trans_result.length > 0) {
						_this.setData({
							transResultInfo: res.data.data.trans_result
						})
					}
				}
			})
		} else {
			Toast('请输入需要翻译的语句！')
		}
	},
})