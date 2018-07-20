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
