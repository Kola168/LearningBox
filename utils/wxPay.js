
import graphql from '../network/graphql_request'

// 微信支付
function wxPay (obj) {
  return new Promise((resolve, reject)=>{
    try {
      if (obj.success) {
        var success  = obj.success
        obj.success = function (res) {
          success(res)
          resolve(res)
        }
      }
      if (obj.fail) {
        var fail  = obj.fail
        obj.fail = function (err) {
          fail(err)
          reject(err)
        }
      }
      obj.success = obj.success ? obj.success : resolve
      obj.fail = obj.fail ? obj.fail : reject
      obj.signType = obj.signType ? obj.signType : 'MD5'
      wx.requestPayment(obj)
    } catch(err) {
      reject(err)
    }
  })
}

// msg 
var msg = {
  cancel: ()=> ({message: 'cancel pay', action: 'cancel'}),
  free: ()=> ({message: 'paid', action: 'free'}),
  invokeWayError: ()=> ({message: 'invokeWay error', action: 'error'}),
  error: (err)=> ({message: err, action: 'error'}),
}

// 调用支付
function invokeWxPay (params) {
  return new Promise((resolve, reject)=>{
    try {
      graphql.invokeWxPay(params)
      .then(res=>{
        if (!res.invokeWxpay) {
          return reject(msg.invokeWayError())
        }

        if (res.invokeWxpay.freeToPrint) {
          return resolve(msg.free())
        }

        var payPms = res.invokeWxpay.invokeWxpayParams 
        payPms && wxPay(payPms).then(res=>{
          resolve(res)
        }).catch(err=>{
          resolve(msg.cancel())
        })
        
      }).catch(err=>{
        reject(msg.error(err.errors && err.errors[0].message || 'invoke pay error'))
      }) 
    } catch(err) {
      reject(msg.error(err))
    }
  })
}

export default {
    wxPay,
    invokeWxPay
}





