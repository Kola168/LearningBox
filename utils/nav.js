/**
 * wxNav
 * wxNav.navigateTo(url [, query [, cb]])
 * wxNav.redirectTo(url [, query [, cb]])
 * wxNav.reLaunch(url [, query [, cb]])
 * wxNav.switchTab(url [, cb])
 * wxNav.navigateBack([, delta [, cb]])
 */
const _ = require('../lib/underscore/we-underscore')

function relative2AbsolutePath(nextUrl) {
  let pages = getCurrentPages(),
    curUrl = pages[pages.length - 1].route,
    nextUrlArr = nextUrl.split('../'),
    isRelativePathLen = nextUrlArr.length - 1
  if (isRelativePathLen) {
    let curUrlArr = curUrl.split('/')
    return curUrlArr.splice(0, curUrlArr.length - 1 - isRelativePathLen).join('/') + '/' + nextUrlArr[nextUrlArr.length - 1]
  } else {

    return _.without(nextUrl.split('/'),'').join('/')
  }
}

function parseObj2QueryStr() {
  let query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.keys(query).reduce(function(acc, key, index) {
    return acc.concat(index === 0 ? '' : '&', key, '=', query[key])
  }, '')
}

function safeWxApiTargetUrl(url) {
  return url[0] === "/" ? url : "/" + url
}

// 拼接页面路径
function joinUrlAndQuery(url) {
  let query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
  let splitStr = /\?/.test(url) ? "" : "?";
  return safeWxApiTargetUrl(url) + splitStr + parseObj2QueryStr(query)
}

function getUrlRoute(url) {
  return url.replace(/^\//, "").replace(/\?.*/, "");
}

// 重复页面个数
function getRepeatCountOfDelta(delta) {
  let repeatCount = 0
  let pages = getCurrentPages()

  if (pages.length - delta > 1) {
    pages = pages.slice(0, pages.length - delta)
    let pagesLength = pages.length;
    let finalIndex = pagesLength - 1;
    let url = pages[finalIndex].route;

    for (var index = finalIndex - 1; index >= 0; index--) {
      if (pages[index].route !== url) {
        break;
      }

      repeatCount++;
    }
  }

  return repeatCount;
}

// 对象相等
function objEq(obj1, obj2) {
  var o1 = obj1 instanceof Object;
  var o2 = obj2 instanceof Object;
  // 判断是不是对象
  if (!o1 || !o2) {
    return obj1 === obj2;
  }

  //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,
  //例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (var o in obj1) {
    var t1 = obj1[o] instanceof Object;
    var t2 = obj2[o] instanceof Object;
    if (t1 && t2) {
      return objEq(obj1[o], obj2[o]);
    } else if (obj1[o] !== obj2[o]) {
      return false;
    }
  }
  return true;
}

// 已存在页面的位置
function findLastUrlAndQueryDelta(url, query) {
  let pages = getCurrentPages(),
    len = pages.length
  for (let i = 0; i < len; i++) {
    let isIn = (pages[i].route === url) && objEq(pages[i].options, query)
    if (isIn) {
      return {
        delta: len - i - 1
      }
    }
  }
  return false
}

const emptyFn = function emptyFn() {}
const MAX_PAGES_LENGTH = 10

const navigateTo = (url, query = {}, cb = emptyFn) => {
  let pages = getCurrentPages()
  url = relative2AbsolutePath(url)
  let routeLocation = findLastUrlAndQueryDelta(url, query)
  if (routeLocation) { //已存在页面栈
    let delta = routeLocation.delta
    if (delta > 0) {
      navigateBack(routeLocation.delta, cb)
    }
  } else if (pages.length >= MAX_PAGES_LENGTH) { //超过10层
    redirectTo(url, query, cb)
  } else { //正常跳转
    wx.navigateTo({
      url: joinUrlAndQuery(url, query),
      success: function success() {
        cb(true)
      },
      fail: function fail() {
        cb(false)
      }
    });
  }
}
const backPage=(url, query = {}, cb = emptyFn)=>{
  let pages = getCurrentPages()
  url = relative2AbsolutePath(url)
  let len = pages.length
  let delta=0
  for (let i = 0; i < len; i++) {
    if (pages[i].route === url) {
      delta= len - i - 1
      break
    }
  }
  if (delta>0) { //已存在页面栈
    navigateBack(delta, cb)
  } else if (pages.length >= MAX_PAGES_LENGTH) { //超过10层
    redirectTo(url, query, cb)
  } else { //正常跳转
    wx.navigateTo({
      url: joinUrlAndQuery(url, query),
      success: function success() {
        cb(true)
      },
      fail: function fail() {
        cb(false)
      }
    })
  }
}

const redirectTo = (url, query = {}, cb = emptyFn) => {
  url = relative2AbsolutePath(url)
  wx.redirectTo({
    url: joinUrlAndQuery(url, query),
    success: function success() {
      cb(true);
    },
    fail: function fail() {
      cb(false);
    }
  });
}
const navigateBack = (delta = 1, cb = emptyFn) => {
  let repeatCount = getRepeatCountOfDelta(delta)
  wx.navigateBack({
    delta: delta + repeatCount,
    success: function success() {
      cb(true)
    },
    fail: function fail() {
      cb(false)
    }
  })
}

const switchTab = (url, cb = emptyFn) => {
  url = relative2AbsolutePath(url)
  wx.switchTab({
    url: safeWxApiTargetUrl(url).split("?")[0],
    success: function success() {
      cb(true);
    },
    fail: function fail() {
      cb(false);
    }
  });
}

const reLaunch = (url, query = {}, cb = emptyFn) => {
  let pages = getCurrentPages()
  url = relative2AbsolutePath(url)
  if (pages.length <= 1) {
    // 1. redirect
    redirectTo(url, query, cb)
  } else if (pages[0].route === getUrlRoute(url)) {
    // 2. back to first page and refresh
    wx.navigateBack({
      delta: pages.length - 1,
      success: function success() {
        redirectTo(url, query, cb)
      },
      fail: function fail() {
        wx.reLaunch({
          url: url
        })
      }
    })
  } else {
    // 3. wx.reLaunch
    wx.reLaunch({
      url: url
    })
  }
}

module.exports = {
  navigateTo: navigateTo,
  redirectTo: redirectTo,
  reLaunch: reLaunch,
  switchTab: switchTab,
  navigateBack: navigateBack,
  backPage:backPage
}
