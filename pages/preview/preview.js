Page({
  data: {
    colors: {},
    basic: {},
    skills: [],
    experiences: [],
    education: {},
    certificates: '',
    summaries: []
  },

  onLoad() {
    const app = getApp();
    const data = app.globalData.resumeData;
    if (data) {
      this.setData({
        colors: data.colors,
        basic: data.basic,
        skills: data.skills,
        experiences: data.experiences,
        education: data.education,
        certificates: data.certificates,
        summaries: data.summaries
      });
    } else {
      wx.showToast({
        title: '未找到简历数据',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 返回编辑页
  backToEdit() {
    wx.navigateBack();
  },

  // ========== 版本1: 直接保存到相册(当前使用) ==========
  saveImage() {
    wx.showLoading({
      title: '生成中...',
      mask: true
    });

    // 创建canvas上下文
    const query = wx.createSelectorQuery();
    query.select('.resume')
      .boundingClientRect()
      .exec((res) => {
        if (!res || !res[0]) {
          wx.hideLoading();
          wx.showToast({
            title: '获取简历失败',
            icon: 'none'
          });
          return;
        }

        const resumeRect = res[0];
        const canvasWidth = 750; // 固定宽度
        const canvasHeight = Math.ceil(resumeRect.height * 2); // 高度根据内容动态计算

        // 创建离屏canvas
        const canvas = wx.createOffscreenCanvas({
          type: '2d',
          width: canvasWidth,
          height: canvasHeight
        });

        // 如果不支持离屏canvas,使用页面canvas
        if (!canvas) {
          this.saveImageWithPageCanvas(canvasWidth, canvasHeight);
          return;
        }

        // 绘制简历到canvas
        this.drawResumeToCanvas(canvas, canvasWidth, canvasHeight);
      });
  },

  // 使用页面canvas保存(兼容方案)
  saveImageWithPageCanvas(width, height) {
    // 需要在wxml中添加canvas组件
    wx.showModal({
      title: '提示',
      content: '当前方案需要使用截图功能。请长按简历区域保存图片。',
      showCancel: false,
      success: () => {
        wx.hideLoading();
      }
    });
  },

  // 绘制简历内容到canvas
  drawResumeToCanvas(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const data = this.data;

    // 设置背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    let currentY = 0;
    const padding = 40;
    const contentWidth = width - padding * 2;

    // 绘制头部
    const headerHeight = 280;
    const gradient = ctx.createLinearGradient(0, 0, width, headerHeight);
    gradient.addColorStop(0, data.colors.primary + 'dd');
    gradient.addColorStop(1, data.colors.secondary + 'dd');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, headerHeight);

    // 绘制姓名
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 68px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.basic.name, width / 2, 100);

    // 绘制职位
    ctx.font = '38px sans-serif';
    ctx.fillText(data.basic.position, width / 2, 160);

    // 绘制联系方式
    ctx.font = '28px sans-serif';
    const contactY = 220;
    const contactInfo = `📱 ${data.basic.phone}  📧 ${data.basic.email}  💼 ${data.basic.workYears}  🎓 ${data.basic.education}`;
    ctx.fillText(contactInfo, width / 2, contactY);

    currentY = headerHeight + 60;

    // 绘制内容区域
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';

    // 绘制核心技能
    if (data.skills && data.skills.length > 0) {
      currentY = this.drawSection(ctx, '核心技能', currentY, padding, contentWidth, data.colors);

      data.skills.forEach(skillCat => {
        if (skillCat.category) {
          ctx.font = 'bold 32px sans-serif';
          ctx.fillStyle = data.colors.primary;
          ctx.fillText(skillCat.category, padding, currentY);
          currentY += 50;
        }

        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#374151';
        skillCat.skills.forEach(skill => {
          if (skill.name && skill.desc) {
            const text = `• ${skill.name}: ${skill.desc}`;
            const lines = this.wrapText(ctx, text, contentWidth - 20);
            lines.forEach(line => {
              ctx.fillText(line, padding + 20, currentY);
              currentY += 42;
            });
          }
        });
        currentY += 20;
      });
    }

    // 保存canvas为图片
    wx.canvasToTempFilePath({
      canvas: canvas,
      success: (res) => {
        wx.hideLoading();
        this.saveToAlbum(res.tempFilePath);
      },
      fail: (err) => {
        console.error('Canvas保存失败:', err);
        wx.hideLoading();
        wx.showModal({
          title: '保存失败',
          content: '请尝试截图保存。长按简历区域可以保存图片。',
          showCancel: false
        });
      }
    });
  },

  // 绘制章节标题
  drawSection(ctx, title, y, padding, width, colors) {
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = colors.primary;
    ctx.fillText(title, padding, y);

    // 绘制下划线
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, y + 15);
    ctx.lineTo(width + padding, y + 15);
    ctx.stroke();

    return y + 60;
  },

  // 文本换行处理
  wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  },

  // 保存到相册
  saveToAlbum(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要授权',
            content: '需要授权访问相册才能保存图片',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // ========== 版本2: 带激励视频广告(备用) ==========
  /*
  // 在使用前需要在app.json中配置广告位ID
  // 需要先在微信公众平台申请广告位

  saveImageWithAd() {
    // 创建激励视频广告
    if (!this.rewardedVideoAd) {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-xxxxxxxxxxxxxxxx' // 替换为你的广告位ID
      });

      // 监听广告加载
      this.rewardedVideoAd.onLoad(() => {
        console.log('广告加载成功');
      });

      // 监听广告错误
      this.rewardedVideoAd.onError((err) => {
        console.error('广告加载失败', err);
        wx.showModal({
          title: '提示',
          content: '广告加载失败,是否直接保存?',
          success: (res) => {
            if (res.confirm) {
              this.saveImage(); // 调用直接保存方法
            }
          }
        });
      });

      // 监听广告关闭
      this.rewardedVideoAd.onClose((res) => {
        if (res && res.isEnded) {
          // 用户完整观看了广告
          this.saveImage(); // 调用直接保存方法
        } else {
          // 用户中途退出
          wx.showToast({
            title: '请看完广告后保存',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }

    // 显示广告
    this.rewardedVideoAd.show()
      .catch(() => {
        // 广告未准备好,重新加载
        this.rewardedVideoAd.load()
          .then(() => this.rewardedVideoAd.show())
          .catch(err => {
            console.error('广告展示失败', err);
            // 广告失败,提供直接保存选项
            wx.showModal({
              title: '提示',
              content: '广告暂时无法播放,是否直接保存?',
              success: (res) => {
                if (res.confirm) {
                  this.saveImage();
                }
              }
            });
          });
      });
  },
  */

  // 分享功能
  shareResume() {
    // 小程序分享需要在 onShareAppMessage 中配置
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    wx.showToast({
      title: '点击右上角分享',
      icon: 'none',
      duration: 2000
    });
  },

  // 配置分享内容
  onShareAppMessage() {
    return {
      title: `${this.data.basic.name}的个人简历`,
      path: '/pages/index/index',
      imageUrl: '' // 可以设置分享图片
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `${this.data.basic.name}的个人简历`,
      query: '',
      imageUrl: ''
    };
  }
})