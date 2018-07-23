/**
 * 将微信接口promise化
 */

/**
 * 登录
 */
function login() {
    return new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
    })
}

/**
 * 获取用户信息
 */
function getUserInfo() {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({ success: resolve, fail: reject })
    })
}

/**
 * 缓存数据(异步)
 */
function setStorage(key, value) {
    return new Promise((resolve, reject) => {
        wx.setStorage({ key: key, data: value, success: resolve, fail: reject })
    })
}

/**
 * 获取缓存数据(异步)
 */
function getStorage(key) {
    return new Promise((resolve, reject) => {
        wx.getStorage({ key: key, success: resolve, fail: reject })
    })
}

export {
    login,
    getUserInfo,
    setStorage,
    getStorage
}
