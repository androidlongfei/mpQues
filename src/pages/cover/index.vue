<template>
<div class="cover">
    <div v-if="loadError">
        <reload-page :reload="this.againLoad"></reload-page>
    </div>
    <div v-else>
        <div v-if="firstLoadStatus">
            <div class="pageLoad">
                <p>正在加载中...</p>
            </div>
        </div>
        <div v-else>
            <div class="content">
                <img :src="cover" alt="评估问卷首页图片">
            </div>

            <button class="start" @click="agin()">开始评估</button>
        </div>
    </div>
</div>
</template>

<script>
import cover from '@/images/cover.jpg'
import ReloadPage from '@/components/ReloadPage'
import fetch from '@/service/fetch'
import { encodeUrlParam } from '@/utils/urlTool'
import { baseUrl } from '@/config/interfaceTool'
export default {
    data() {
        return {
            cover: cover,
            loadError: false,
            firstLoadStatus: false,
            routerParams: {},
            paramsStr: ''
        }
    },
    components: {
        ReloadPage
    },
    created() {
        // 调用应用实例的方法获取全局数据
        // this.getUserInfo()

    },
    mounted() {
        this.routerParams = this.$root.$mp.query
        this.routerParams.code = 1
        console.log('this.routerParams', this.routerParams);
        this.againLoad()
    },
    methods: {
        agin() {
            console.log('开始评估');
            if (!this.routerParams.code) {
                this.showLoadMsg('问卷code不存在')
                return
            }
            let queryParam = {
                code: this.routerParams.code
            }
            if (this.paramsStr && this.paramsStr.length > 0) {
                queryParam.params = this.paramsStr
            }
            let url = encodeUrlParam('../topic/main', queryParam)
            wx.navigateTo({ url })
        },
        againLoad() {
            console.log('重新加载...');
            let parameterData = {
                data: { code: this.routerParams.code },
                version: '1.0',
                debug: 'false'
            }
            this.firstLoadStatus = true
            this.loadError = false
            wx.showLoading({
                title: '正在加载中...'
            })
            fetch({
                baseUrl: baseUrl,
                api: '/questionnaire/get',
                method: 'POST',
                contentType: 'application/json; charset=UTF-8',
                params: parameterData
            }).then(res => {
                this.firstLoadStatus = false
                this.loadError = false
                wx.hideLoading()
                console.log('问卷首页res', res)
                let contentData = res.data
                console.log('contentData.code', contentData.code)
                if (contentData.code && contentData.code === '10000') {
                    // 获取数据成功
                    this.doResult(contentData.data)
                } else {
                    let failedMsg = contentData.message ? contentData.message : '获取数据失败,服务器异常'
                    this.showLoadMsg(failedMsg)
                }
            }).catch(err => {
                console.log('err', err)
                this.firstLoadStatus = false
                this.loadError = true
                wx.hideLoading()
                this.showLoadMsg('获取数据失败,服务器异常')
            })
        },
        doResult(data) {
            console.log('doResult', data);
            if (data) {
                if (data.questionnaire && data.questionnaire.cover) {
                    this.cover = data.questionnaire.cover
                }
                if (data.questionnaire && data.questionnaire.title) {
                    // 设置title
                    this.setTitle(data.questionnaire.title)
                }
                if (data.questionnaire.params && data.questionnaire.params.length > 0) {
                    this.paramsStr = data.questionnaire.params.join(',')
                }
            }
        },
        goPage() {
            // 查看上一次评估
        }
    }
}
</script>

<style lang="scss">
.cover {
    height: 100%;
    .pageLoad {
        padding-top: 20rpx;
        text-align: center;
    }
    .content {
        width: 100%;
        height: 1200rpx;
        img {
            width: 100%;
            height: 100%;
        }
    }
    .start {
        position: fixed;
        bottom: 40rpx;
        z-index: 10000;
        margin: 0 auto 0 -200rpx;
        width: 400rpx;
        height: 80rpx;
        left: 50%;
        font-size: 30rpx;
        border-radius: 60rpx;
        background-color: #2ecd93;
        color: white;
    }
}
</style>
