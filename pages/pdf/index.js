import Toast from '../../vant-weapp/toast/toast';
let videoAd = null

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		historyList: [], //历史记录
		spinShow: false,
		AdCount: false, //默认没打开过广告
		loadCount: 0,
		activeTab: '1',
		setInter: '',
		token: null,
		docInfo: {}, //解析之后的文档信息
		pdfToFileType: 'docx',
		chooseFileLoading: false,
		preFileLoading: false, //预览文件加载动画
	},
	onChange(event) {
		// wx.showToast({
		// 	title: `切换到标签 ${event.detail.name}`,
		// 	icon: 'none',
		// });
	},
	// 更改pdf转文件类型
	onChangePdfToFileType(event) {
		this.setData({
			pdfToFileType: event.detail
		});
	},
	//打开文件
	getDownloadFile() {
		let _this = this
		if (this.data.token) { //判断是否可以打开文件
			wx.request({
				url: `https://api.nmxgzs.cn/get/file/url`,
				method: 'POST',
				data: {
					token: _this.data.token
				},
				success(res) {
					console.log(res, '预览文件res')
					let result = res.data.data.result
					_this.setData({
						docInfo: result,
						preFileLoading: true
					})
					//打开文件
					if (result.fileurl || result.pdfurl) {
						let url = result.fileurl || result.pdfurl
						//存储转化记录到localstorage
						// let fileName = url.split('/').pop()
						let historyList = wx.getStorageSync('historyList') ? JSON.parse(wx.getStorageSync('historyList')) : []
						historyList.push(url)
						wx.setStorageSync('historyList', JSON.stringify(historyList))
						_this.setData({
							historyList
						})
						console.log(historyList, 'historyList')
						//存储结束
						wx.downloadFile({
							// 示例 url，并非真实存在
							url: url,
							success: function (res) {
								const filePath = res.tempFilePath
								wx.openDocument({
									showMenu: true,
									filePath: filePath,
									success: function (res) {
										console.log('打开文档成功')
										_this.setData({
											preFileLoading: false
										})
									}, //文件打开失败
									fail: function (err) {
										console.log(err)
										Toast(`文件打开失败！！！${err}`)
										_this.setData({
											preFileLoading: false
										})
									}
								})
							}, //文件下载失败
							fail: function (err) {
								console.log(err)
								Toast(`文件打开失败！！！${err}`)
								_this.setData({
									preFileLoading: false
								})
							}
						})
					} else {
						Toast('获取文件地址失败，请重新预览文件！！')
						_this.setData({
							preFileLoading: false
						})
					}
				}
			})
		} else {
			Toast('当前没有文件可以打开')
		}
	},
	//清除历史记录
	clearHistory() {
		let _this = this
		wx.clearStorage().then(res => {
			console.log(res)
			Toast(res.errMsg);
			//清空显示列表
			_this.setData({
				historyList: []
			})
		}).catch(err => {
			console.log(err, 'err')
			Toast(err);
		})
	},
	//打开历史记录
	openHistory(e) {
		console.log(e.target.dataset.url)
		let url = e.target.dataset.url
		wx.downloadFile({
			// 示例 url，并非真实存在
			url: url,
			success: function (res) {
				const filePath = res.tempFilePath
				wx.openDocument({
					showMenu: true,
					filePath: filePath,
					success: function (res) {
						console.log('打开文档成功')
					},
					fail: function (err) {
						console.log(err)
						Toast(`打开文件失败！！！${err}`)
					}
				})
			},
			fail: function (err) {
				console.log(err)
				Toast(`下载文件失败！！！${err}`)
			}
		})
	},
	//打开广告
	openAdd() {
		let openAdCount = this.data.adCount
		if (videoAd && !openAdCount) {
			console.log('打开激励视频');
			videoAd.show()
				.catch(() => {
					videoAd.load()
						.then(() => videoAd.show())
						.catch(err => {
							console.log(err)
							console.log('激励视频 广告显示失败')
						})
				})
		} else if (openAdCount) {
			//当天已经看过广告了
			this.openPdf()
		}
	},
	openPdf() {
		let _this = this
		// 选择记录的文件
		wx.chooseMessageFile({
			count: 10,
			type: 'file',
			success(res) {
				_this.setData({
					chooseFileLoading: true,
					loadCount: 0
				});
				// tempFilePath可以作为img标签的src属性显示图片
				const tempFilePaths = res.tempFiles
				console.log(tempFilePaths)
				console.log(res)
				wx.uploadFile({
					url: 'https://api.nmxgzs.cn/get/pdf/change/token', //仅为示例，非真实的接口地址
					filePath: tempFilePaths[0].path,
					name: 'file',
					formData: {
						'type': _this.data.pdfToFileType
					},
					success(res) {
						console.log(JSON.parse(res.data))
						if (JSON.parse(res.data).success) {
							let token = JSON.parse(res.data).data.result.token
							_this.setData({
								token
							})
							Toast('文件导入成功')
							_this.setData({
								chooseFileLoading: false
							});
							//定时器  做动态加载图片
							_this.loading()
						} else {
							Toast('文件导入失败，请联系小主人哦！！！')
							_this.setData({
								chooseFileLoading: false
							});
						}
						//do something
					}
				})
			}
		})
	},
	loading() {
		var _this = this;
		//将计时器赋值给setInter
		_this.data.setInter = setInterval(
			() => {
				wx.request({
					url: `https://api.nmxgzs.cn/get/file/url`,
					method: 'POST',
					data: {
						token: _this.data.token
					},
					success(res) {
						console.log(res, 'setInter  res')
						_this.setData({
							loadCount: res.data.data.result.progress * 100
						})
						if (res.data.data.result.status == 'Done') {
							Toast({
								message: '文件转换完成，预览文件右上角可以转发好友！',
								duration: 3000
							})
							//清除计时器  即清除setInter
							clearInterval(_this.data.setInter)
							_this.setData({
								loadCount: 100
							})
							setTimeout(() => {
								_this.setData({
									loadCount: 0
								})
							}, 5000);
						}
					}
				})
			}, 1500);
	},
	chooseFileToPdf() {
		let _this = this
		// 选择聊天记录的文件
		wx.chooseMessageFile({
			count: 1,
			type: 'file',
			success(res) {
				_this.setData({
					spinShow: true,
					loadCount: 0
				});
				// tempFilePath可以作为img标签的src属性显示图片
				const tempFilePaths = res.tempFiles
				console.log(tempFilePaths)
				console.log(res)
				wx.uploadFile({
					url: 'https://api.nmxgzs.cn/get/change/pdf/token', //仅为示例，非真实的接口地址
					filePath: tempFilePaths[0].path,
					name: 'file',
					success(res) {
						console.log(JSON.parse(res.data))
						if (JSON.parse(res.data).success) {
							let token = JSON.parse(res.data).data.result.token
							_this.setData({
								token
							})
							Toast('文件导入成功')
							_this.setData({
								spinShow: false
							});
							//定时器  做动态加载图片
							_this.loading()
						} else {
							Toast('文件导入失败，请联系小主人哦！！！')
							_this.setData({
								spinShow: false
							});
						}
						//do something
					}
				})
			}
		})
	},
	chooseImgToPdf() {
		let _this = this
		// 选择聊天记录的文件
		wx.chooseImage({
			count: 1,
			success(res) {
				console.log(res)
				_this.setData({
					spinShow: true,
					loadCount: 0
				});
				// tempFilePath可以作为img标签的src属性显示图片
				const tempFilePaths = res.tempFiles
				console.log(tempFilePaths)
				console.log(res)
				wx.uploadFile({
					url: 'https://api.nmxgzs.cn/get/change/pdf/token', //仅为示例，非真实的接口地址
					filePath: tempFilePaths[0].path,
					name: 'file',
					success(res) {
						console.log(JSON.parse(res.data))
						if (JSON.parse(res.data).success) {
							let token = JSON.parse(res.data).data.result.token
							_this.setData({
								token
							})
							Toast('文件导入成功')
							_this.setData({
								spinShow: false
							});
							//定时器  做动态加载图片
							_this.loading()
						} else {
							Toast('文件导入失败，请联系小主人哦！！！')
							_this.setData({
								spinShow: false
							});
						}
						//do something
					}
				})
			}
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(wx.getStorageSync('historyList'), '88888888')
		//获取storage数据
		let historyList = wx.getStorageSync('historyList') ? JSON.parse(wx.getStorageSync('historyList')) : []
		this.setData({
			historyList
		})
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
					_this.setData({
						adCount: true
					})
					_this.openPdf()
				} else {
					// 播放中途退出，进行提示
					Toast('看完广告才可以导入文件哦~~')
				}
			})
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		let that = this
		clearInterval(that.data.setInter)
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		return {
			title: "你也快来试试吧，各种文档转换、天气查询、文字翻译识别...",
			path: `/pages/pdf/index`
		}
	},
})