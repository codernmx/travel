let videoAd = null
import Toast from '../../vant-weapp/toast/toast';
const app = getApp()
Page({

        /**
         * 页面的初始数据
         */
        data: {
                steps: [{
                                text: '1天',
                                inactiveIcon: 'circle'
                                // desc: '描述信息',
                        },
                        {
                                text: '2天',
                                inactiveIcon: 'circle'
                                // desc: '描述信息',
                        },
                        {
                                text: '3天',
                                inactiveIcon: 'circle'
                                // desc: '描述信息',
                        },
                        {
                                text: '4天',
                                inactiveIcon: 'circle'
                                // desc: '描述信息',
                        },
                        {
                                text: '5天',
                                inactiveIcon: 'circle'
                                // desc: '描述信息',
                        },
                        {
                                text: '6天',
                                // desc: '描述信息',
                                inactiveIcon: 'circle'
                        },
                        {
                                text: '7天',
                                inactiveIcon: 'circle'
                                // desc: '描述信息',
                        },
                ],
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
                // console.log(app.globalData.user,'user')
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
                                console.log(status)
                                if (status && status.isEnded || status === undefined) {
                                        //播放成功可以拍照调用接口
                                        // _this.chooseImg()
                                } else {
                                        // 播放中途退出，进行提示
                                        Toast('看完视频才可以领取哦~~')
                                }
                        })
                }
        },
        // 签到
        submit() {
                Toast('开发中 ~~')
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

        }
})