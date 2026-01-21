Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    // 阻止冒泡
    stopPropagation() {},

    // 点击遮罩不关闭
    onMaskTap() {},

    // 打开用户协议
    openUserAgreement() {
      wx.navigateTo({
        url: '/pages/agreement/user-agreement'
      })
    },

    // 打开隐私政策
    openPrivacyPolicy() {
      wx.navigateTo({
        url: '/pages/agreement/privacy-policy'
      })
    },

    // 不同意
    onDisagree() {
      wx.showModal({
        title: '提示',
        content: '您需要同意协议才能使用本小程序',
        showCancel: false,
        success: () => {
          wx.exitMiniProgram()
        }
      })
    },

    // 同意
    onAgree() {
      wx.setStorageSync('agreementAccepted', true)
      this.triggerEvent('agree')
    }
  }
})