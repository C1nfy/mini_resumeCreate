Page({
  data: {
    showAgreement: false,
    colors: {
      primary: '#607052',
      secondary: '#A9B488',
      background: '#FEFAE0',
      accent: '#B99471'
    },
    basic: {
      name: '',
      position: '',
      phone: '',
      email: '',
      workYears: '',
      education: ''
    },
    skills: [],
    experiences: [],
    education: {
      school: '',
      degree: '',
      time: ''
    },
    certificates: '',
    summaries: []
  },
  onLoad() {
    // 检查是否已同意协议
    const agreed = wx.getStorageSync('agreementAccepted')
    if (!agreed) {
      this.setData({
        showAgreement: true
      })
    }
  },
    // 同意协议后的回调
    onAgreeAgreement() {
      this.setData({
        showAgreement: false
      })
    },
  
  // 颜色预设方案
  colorPresets: {
    morandi: {
      primary: '#607052',
      secondary: '#A9B488',
      background: '#FEFAE0',
      accent: '#B99471'
    },
    blue: {
      primary: '#2C5F8D',
      secondary: '#5B9BD5',
      background: '#E7F3FF',
      accent: '#F4A460'
    },
    purple: {
      primary: '#6B4C9A',
      secondary: '#9B7EBD',
      background: '#F3EBFF',
      accent: '#E67E80'
    },
    orange: {
      primary: '#D97642',
      secondary: '#F4A460',
      background: '#FFF4E6',
      accent: '#8B6F47'
    }
  },

  // 应用预设配色
  applyPreset(e) {
    const preset = e.currentTarget.dataset.preset;
    const colors = this.colorPresets[preset];
    if (colors) {
      this.setData({ colors });
      wx.showToast({
        title: '配色已应用',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 显示颜色选择器(提示用户手动输入)
  showColorPicker(e) {
    const key = e.currentTarget.dataset.key;
    const colorNames = {
      primary: '主色调',
      secondary: '辅助色',
      background: '背景色',
      accent: '强调色'
    };

    wx.showModal({
      title: `修改${colorNames[key]}`,
      content: '请在下方输入框中输入颜色代码(如: #607052)',
      editable: true,
      placeholderText: this.data.colors[key],
      success: (res) => {
        if (res.confirm && res.content) {
          const color = res.content.trim();
          if (/^#[0-9A-F]{6}$/i.test(color)) {
            this.setData({
              [`colors.${key}`]: color
            });
          } else {
            wx.showToast({
              title: '颜色格式错误',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  onColorChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value.trim();

    // 验证颜色格式
    if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
      return;
    }

    this.setData({
      [`colors.${key}`]: value
    });
  },

  onBasicChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`basic.${key}`]: e.detail.value
    });
  },

  // ========== 技能管理 ==========
  addSkill() {
    const skills = this.data.skills;
    skills.push({
      id: Date.now(),
      category: '',
      skills: []
    });
    this.setData({ skills });
  },

  removeSkill(e) {
    const index = e.currentTarget.dataset.index;
    const skills = this.data.skills;
    skills.splice(index, 1);
    this.setData({ skills });
  },

  onSkillCategoryChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      [`skills[${index}].category`]: e.detail.value
    });
  },

  addSkillItem(e) {
    const index = e.currentTarget.dataset.index;
    const skills = this.data.skills;
    skills[index].skills.push({ name: '', desc: '' });
    this.setData({ skills });
  },

  removeSkillItem(e) {
    const catIndex = e.currentTarget.dataset.catIndex;
    const skillIndex = e.currentTarget.dataset.skillIndex;
    const skills = this.data.skills;
    skills[catIndex].skills.splice(skillIndex, 1);
    this.setData({ skills });
  },

  onSkillItemChange(e) {
    const catIndex = e.currentTarget.dataset.catIndex;
    const skillIndex = e.currentTarget.dataset.skillIndex;
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`skills[${catIndex}].skills[${skillIndex}].${field}`]: e.detail.value
    });
  },

  // ========== 工作经历管理 ==========
  addExperience() {
    const experiences = this.data.experiences;
    experiences.push({
      id: Date.now(),
      company: '',
      position: '',
      duration: '',
      projects: []
    });
    this.setData({ experiences });
  },

  removeExperience(e) {
    const index = e.currentTarget.dataset.index;
    const experiences = this.data.experiences;
    experiences.splice(index, 1);
    this.setData({ experiences });
  },

  onExpChange(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`experiences[${index}].${field}`]: e.detail.value
    });
  },

  // 项目管理
  addProject(e) {
    const expIndex = e.currentTarget.dataset.expIndex;
    const experiences = this.data.experiences;
    experiences[expIndex].projects.push({
      name: '',
      type: '',
      business: '',
      duties: [],
      achievement: ''
    });
    this.setData({ experiences });
  },

  removeProject(e) {
    const expIndex = e.currentTarget.dataset.expIndex;
    const projIndex = e.currentTarget.dataset.projIndex;
    const experiences = this.data.experiences;
    experiences[expIndex].projects.splice(projIndex, 1);
    this.setData({ experiences });
  },

  onProjectChange(e) {
    const expIndex = e.currentTarget.dataset.expIndex;
    const projIndex = e.currentTarget.dataset.projIndex;
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`experiences[${expIndex}].projects[${projIndex}].${field}`]: e.detail.value
    });
  },

  // 职责管理
  addDuty(e) {
    const expIndex = e.currentTarget.dataset.expIndex;
    const projIndex = e.currentTarget.dataset.projIndex;
    const experiences = this.data.experiences;
    experiences[expIndex].projects[projIndex].duties.push('');
    this.setData({ experiences });
  },

  removeDuty(e) {
    const expIndex = e.currentTarget.dataset.expIndex;
    const projIndex = e.currentTarget.dataset.projIndex;
    const dutyIndex = e.currentTarget.dataset.dutyIndex;
    const experiences = this.data.experiences;
    experiences[expIndex].projects[projIndex].duties.splice(dutyIndex, 1);
    this.setData({ experiences });
  },

  onDutyChange(e) {
    const expIndex = e.currentTarget.dataset.expIndex;
    const projIndex = e.currentTarget.dataset.projIndex;
    const dutyIndex = e.currentTarget.dataset.dutyIndex;
    this.setData({
      [`experiences[${expIndex}].projects[${projIndex}].duties[${dutyIndex}]`]: e.detail.value
    });
  },

  // ========== 教育背景 ==========
  onEducationChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`education.${key}`]: e.detail.value
    });
  },

  // ========== 证书 ==========
  onCertificatesChange(e) {
    this.setData({
      certificates: e.detail.value
    });
  },

  // ========== 个人评价 ==========
  addSummary() {
    const summaries = this.data.summaries;
    summaries.push({
      id: Date.now(),
      title: '',
      content: ''
    });
    this.setData({ summaries });
  },

  removeSummary(e) {
    const index = e.currentTarget.dataset.index;
    const summaries = this.data.summaries;
    summaries.splice(index, 1);
    this.setData({ summaries });
  },

  onSummaryChange(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`summaries[${index}].${field}`]: e.detail.value
    });
  },

  // ========== 生成简历 ==========
  generateResume() {
    // 验证必填项
    if (!this.data.basic.name) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      });
      return;
    }

    if (!this.data.basic.position) {
      wx.showToast({
        title: '请填写职位',
        icon: 'none'
      });
      return;
    }

    // 保存数据到全局
    const app = getApp();
    app.globalData.resumeData = {
      colors: this.data.colors,
      basic: this.data.basic,
      skills: this.data.skills,
      experiences: this.data.experiences,
      education: this.data.education,
      certificates: this.data.certificates,
      summaries: this.data.summaries
    };

    // 跳转到预览页
    wx.navigateTo({
      url: '/pages/preview/preview'
    });
  
    
    
  },openUserAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/user-agreement'
    })
  },
  
  openPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/agreement/privacy-policy'
    })
  }
})