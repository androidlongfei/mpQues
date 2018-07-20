/**
 * [exports 将wx.request Promise化]
 * @param  {[String]} options.contentType 请求类型包括 {application/json,application/x-www-form-urlencoded} 默认值application/json
 * @param {[String]}  options.method 请求method包括 {POST,GET} 默认值 GET
 * @param {[String]}  options.baseUrl 请求baseUrl例如:http://www.baidu.com
 * @param {[String]}  options.api 请求baseUrl例如:/map
 * @param {[Object]}  options.params 请求参数例如:{age；100,name:'lisi'} 默认值{}
 */
export default function (options) {
    return new Promise((resolve, reject) => {
        let header = {
            'Content-Type': 'application/json'
        }
        let method = 'GET'
        if (options.contentType) {
            header['Content-Type'] = options.contentType
        }
        console.log('contentType', header['Content-Type']);
        if (options.method) {
            method = options.method
        }
        let params = {}
        if (options.params) {
            params = options.params
        }
        wx.request({
            url: `${options.baseUrl}${options.api}`,
            data: Object.assign({}, params),
            header: header,
            method: method,
            dataType: 'json',
            success: resolve,
            fail: reject
        })
    })
}
