/**
 * weToast
 *
 * @param { String } type 类型 必选 可选参数：loading、complete、fail
 * @param { String } icon 图标 可选
 * @param { Number } duration 显示时长 可选
 * @param { String } title 提示文字 可选
 *
 */

const defaultSetting = {
  loading: {
    icon: '/images/loading.gif',
    duration: 0,
    title: '请稍等'
  },
  complete: {
    icon: '/images/complete.png',
    duration: 2000,
    title: "加载成功"
  },
  fail: {
    icon: '/images/fail.png',
    duration: 2000,
    title: "出错了"
  }
}

function weToastClass() {
  //构造函数
  function weToast() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    this.__page = curPage
    this.__timeout = null

    //附加到page上，方便访问
    curPage.wetoast = this

    return this
  }

  //切换显示/隐藏
  weToast.prototype.toast = function(data) {
    try {
      if (!data) {
        this.hide()
      } else {
        let toastInfo = Object.assign({}, defaultSetting[data.type], data)
        this.show(toastInfo)
      }
    } catch (err) {
      console.log(err)
    }
  }

  //显示
  weToast.prototype.show = function(data) {
    let page = this.__page

    clearTimeout(this.__timeout)

    page.setData({
      '__wetoast__.reveal': true
    })

    setTimeout(() => {
      let animation = wx.createAnimation()
      animation.opacity(1).step()
      data.animationData = animation.export()
      data.reveal = true
      page.setData({
        __wetoast__: data
      })
    }, 30)

    if (data.duration !== 0) {
      this.__timeout = setTimeout(() => {
        this.toast()
      }, (data.duration || 1500) + 400)
    } 
  }

  //隐藏
  weToast.prototype.hide = function() {
    let page = this.__page

    clearTimeout(this.__timeout)

    if (!page.data.__wetoast__ || !page.data.__wetoast__.reveal) {
      return
    }

    let animation = wx.createAnimation()
    animation.opacity(0).step()
    page.setData({
      '__wetoast__.animationData': animation.export()
    })

    setTimeout(() => {
      page.setData({
        __wetoast__: { 'reveal': false }
      })
    }, 400)
  }

  return new weToast()
}

module.exports = {
  weToast: weToastClass
}