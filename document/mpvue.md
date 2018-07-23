# mpVue 使用文档

- [gitHub](https://github.com/Meituan-Dianping/mpvue)
- [官方介绍](http://mpvue.com/)
- [快速上手](http://mpvue.com/mpvue/quickstart/)
- [使用手册](http://mpvue.com/mpvue/)
- [awesome-mpvue](https://github.com/mpvue/awesome-mpvue)

## 支持scss

第一：分别安装：

```shell
npm i sass-loader -D

npm i node-sass -D
```

第二： 改造style标签，增加属性lang="scss": 这样就可以愉快的在style内写sass了，webpack会自动编译输出

```html
<style lang="scss">
.page {
　　background: $nav-color;
    .test{
      color:red;
    }
}
</style>
```

## 页面跳转时传递参数

**传递参数**

- [native](https://developers.weixin.qq.com/miniprogram/dev/api/ui-navigate.html)
- [mpvue](http://mpvue.com/mpvue/#_18)

传递参数时在url后面加上即可

例子如下:

```javascript
let queryParam = {
    code: this.routerParams.code
}
let url = ''
if (this.paramsStr && this.paramsStr.length > 0) {
    queryParam.params = this.paramsStr
    url = `../topic/main?code=${this.routerParams.code}&params=${this.paramsStr}`
} else {
    url = `../topic/main?code=${this.routerParams.code}`
}
wx.navigateTo({ url })
```

**获取参数**

使用`this.$root.$mp.query`获取参数

例子如下:

```javascript
mounted() {
    this.routerParams = this.$root.$mp.query
    console.log('this.routerParams', this.routerParams);
}
```

> 必须在mounted()方法中调用,在created()方法中会出错。

## 将数据渲染到视图上时,需去掉this,否则无法渲染出数据

例如:

```html
<div class="question" v-if="this.paging.curPage % 2 === 0">
    <single-topic v-for="(questionItem,index) in this.surveyQuestionList" :key="index" :questionItem="questionItem"></single-topic>
</div>
```

> 如`this.paging.curPage`是获取不到值的，去掉this即可

正确写法如下:

```html
<div class="question" v-if="paging.curPage % 2 === 0">
    <single-topic v-for="(questionItem,index) in surveyQuestionList" :key="index" :questionItem="questionItem"></single-topic>
</div>
```

## 页面跳转时传递参数有特殊字符串时，需要手动编码和解码

例如:

```javascript
  let url  = `../topic/main?code=1&*&23.0129`
  wx.navigateTo({ url })
```

> `&`是特殊字符会被分割，从而导致出错

### 编码和解码工具函数

编码:

```javascript
/**
 * [encodeUrlParam 编码参数]
 * @param  {[type]} url      [页面对应的url] 如 '../report/main'
 * @param  {[type]} paramObj [参数对象] 如 {code:100}
 * @return {[type]}          [description]
 */
function encodeUrlParam(url, paramObj = {}) {
    let params = ''
    if (paramObj) {
        let keys = Object.keys(paramObj)
        for (let key of keys) {
            let val = paramObj[key]
            if (val) {
                // console.log('key', val, typeof val)
                if (typeof val === 'object') {
                    val = JSON.stringify(val)
                }
                val = encodeURIComponent(val)
            }
            params += `${key}=${val}&`
        }
    }
    if (params) {
        params = params.substr(0, params.length - 1)
    }
    if (params) {
        return `${url}?${params}`
    }
    return url
}
```

解码:

```javascript
/**
 * [decodeUrlParam 解码参数]
 * @param  {[type]} paramObj [参数对象]
 * @return {[type]}          [description]
 */
function decodeUrlParam(paramObj = {}) {
    if (paramObj && typeof paramObj === 'object') {
        let keys = Object.keys(paramObj)
        for (let key of keys) {
            let val = paramObj[key]
            if (val) {
                // console.log('key', val, typeof val)
                let strVal = decodeURIComponent(val)
                try {
                    paramObj[key] = JSON.parse(strVal)
                } catch (ex) {
                    paramObj[key] = strVal
                }
            }
        }
    }
    return paramObj
}
```

编码参数用法如下:

```javascript
let queryParam = {
    code: this.routerParams.code,
    test: '似懂非懂',
    ll: {
        age: 100
    },
    mk: ['mm', 'ss'],
    op: '1&*&23.0129'
}
let url = encodeUrlParam('../report/main', queryParam)
console.log('url', url)
wx.navigateTo({ url })
```

解码参数用法如下:

```javascript
mounted() {
    this.routerParams = decodeUrlParam(this.$root.$mp.query)
    console.log('this.routerParams', this.routerParams);
}
```
