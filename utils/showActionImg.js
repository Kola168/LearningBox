const util = require('./util')
const chooseMappingList = {
    takePhoto (limit = 1) {
        return new Promise((resolve,reject)=> {
            wx.chooseImage({
                count: limit,
                sizeType: ['original'],
                sourceType: ['camera'],
                success: (res)=>{
                    resolve(res.tempFilePaths);
                },
                fail: (err)=> {
                    reject(err);
                }
            })
        })
    },
    localAlbum (limit = 1) {
        return new Promise((resolve,reject)=> {
            wx.chooseImage({
                count: limit,
                sizeType: ['original'],
                sourceType: ['album'],
                success: (res)=>{
                    resolve(res.tempFilePaths);
                },
                fail: (err)=> {
                    reject(err);
                }
            })
        })
    },
    weChatAlbum (limit = 1) {
        return new Promise((resolve,reject)=> {
            try {
                const { SDKVersion } = wx.getSystemInfoSync();
                if (util.compareVersion(SDKVersion, '2.5.0')) {
                    const image = wx.chooseMessageFile({
                        type: 'image',
                        count: limit,
                        success: (res)=> {
                            resolve(res.tempFiles)
                        },
                        fail: (err)=> {
                            reject(err);
                        }
                    })
                } else {
                    //请升级到最新的微信版本
                     wx.showModal({
                        title: '微信版本过低',
                        content: '请升级到最新的微信版本',
                        confirmColor: '#2086ee',
                        confirmText: "确认",
                        showCancel: false
                    })
                    reject();
                }
            } catch(err) {
                reject(err);
            }
        })
    }
}
const PropName = Object.getOwnPropertyNames(chooseMappingList);
const chooseImageWay = (limit=1)=> {
    return new Promise ((resolve,reject)=>{
        try {
            if ( !limit && limit > 9) {
                 reject('limit 有误')
            } else {
                wx.showActionSheet({
                    itemList: ['拍照', '手机相册', '微信聊天记录'],
                    success: (res)=> {
                        const idx = res.tapIndex;
                        const chooseFn = chooseMappingList[PropName[idx]];
                        typeof chooseFn === 'function' && chooseFn(limit).then(res=>{
                            resolve(res);
                        });
                    },
                    fail: (err)=> {
                        reject(err)
                    }
                })
            }
          
        } catch (err) {
            reject(err)
        }
    })
}

export default chooseImageWay;