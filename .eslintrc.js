// http://eslint.org/docs/user-guide/configuring

const currentOsType = require('os').type()

module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: false,
        node: true,
        es6: true
    },
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    extends: 'standard',
    // required to lint *.vue files
    plugins: [
        'html'
    ],
    // add your custom rules here
    'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        // 缩进风格4个空格
        "indent": [
            2, 4, {
                // switch语句单独配置
                "SwitchCase": 1
            }
        ],
        "linebreak-style": currentOsType === 'Windows_NT' ? [0, "windows"] : [2, "unix"],
        // 字符串使用单引号
        "quotes": [
            1, "single"
        ],
        "semi": [0, "always"],
        "no-inline-comments": 0,
        // 定义了但没使用的变量，警告
        "no-unused-vars": [1, {
            "vars": "all",
            "args": "none"
        }],
        // 使用 === 代替 ==,警告
        "eqeqeq": [1, "always"],
        // 最有只能有两个空行
        "no-multiple-empty-lines": [2, {
            "max": 3,
            "maxBOF": 1
        }],
        // 函数名后面空格,忽略
        "space-before-function-paren": 0
    },
    globals: {
        App: true,
        Page: true,
        wx: true,
        getApp: true,
        getPage: true,
        requirePlugin: true
    }
}
