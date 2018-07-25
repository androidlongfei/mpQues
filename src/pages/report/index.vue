<template>
<div class="contain">
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
                <section class="score" v-if="reportData.kScore ||reportData.kScore === 0">
                    <div class="word">
                        {{reportData.kScore}}分
                    </div>
                    <!-- <div class="time-graph">
                        <canvas canvas-id='customCanvas' class="time-graph-canvas" width="400" height="400" @click="kScoreJump(reportData.kScore)"></canvas>
                    </div> -->
                </section>

                <section class="panel" v-for="(reportItem,index) in reportData.list" :key="index">
                    <template v-if="reportItem.title && reportItem.value">
                    <div class="p-title">
                        <h3>{{reportItem.title}}</h3>
                    </div>
                    <div v-if="index === 0">
                        <!-- 评估结论 -->
                        <div class="p-content">
                            <!-- 只有文字 -->
                            <!-- 来自于问卷的结论 -->
                            <!-- 体质问卷 -->
                            <p v-if="routerParams.code == 1 ">
                                {{codeObj.masterCodeContent ? '您的主体质是':''}}<span class="masterCode" @click="codeDesJump(code.master)">{{codeObj.masterCodeContent}}</span> {{codeObj.bothCodeContent ? '，兼有体质是':''}}<span class="bothCode" v-for="(bothItem,bothItemIndex) in code.both" :key="bothItemIndex" @click="codeDesJump(bothItem)">{{bothItem.name}}{{code.both.length !== (bothItemIndex+1) ? '、':''}}</span> {{codeObj.inclineCodeContent ? '，倾向体质是':''}}<span class="inclineCode" v-for="(inclineItem,inclineItemIndex) in code.incline" :key="inclineItemIndex" @click="codeDesJump(inclineItem)">{{inclineItem.name}}{{code.incline.length !== (inclineItemIndex+1) ? '、':''}}</span>
                            </p>
                            <!-- 其它问卷 -->
                            <p v-else>
                                <span class="masterCode" @click="codeDesJump">{{reportItem.value}}</span>
                            </p>
                        </div>
                    </div>
                    <div v-else>
                        <div class="p-content">
                            <p style="white-space:pre-line;">{{reportItem.value}}</p>
                        </div>
                    </div>
                    </template>
                </section>

                <section class="panel" v-if="mulRaiseData">
                    <div class="p-title">
                        <h3>调养建议</h3>
                    </div>
                    <div class="p-content" style="padding-bottom:0px;">
                        <div class="raise">
                            <div class="advice" v-for="(raiseItem,index) in mulRaiseData.list" :key="index" @click="raiseJump(raiseItem)">
                                <img :src="raiseItem.img" alt="">
                                <h3>{{raiseItem.title}}</h3>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import ReloadPage from '@/components/ReloadPage'
import { decodeUrlParam } from '@/utils/urlTool'
import { getStorage } from '@/utils/wechat'
import each from 'lodash/each'
import series from 'async-es/series'
import fetch from '@/service/fetch'
import { knowledgeLibUrl } from '@/config/interfaceTool'
export default {
    data() {
        return {
            loadError: false,
            firstLoadStatus: false,
            routerParams: {},
            reportData: {}, // 报告数据
            paramsStr: '',
            codeObj: {
                masterCodeContent: '',
                bothCodeContent: '',
                inclineCodeContent: ''
            },
            code: {
                master: {},
                both: [],
                incline: []
            },
            mulRaiseData: '', // 五养数据
            computeSize: 3
        }
    },
    components: {
        ReloadPage
    },
    created() {},
    methods: {
        againLoad() {
            console.log('againLoad...');
            console.log('从localStorage获取report数据');
            this.firstLoadStatus = true
            this.loadError = false
            wx.showLoading({
                title: '正在加载中...'
            })
            series([
                // 1.评估报告
                (done) => {
                    // 从本地缓存取数据
                    getStorage(`REPORT_${this.routerParams.code}`).then(res => {
                        // console.log('res', res)
                        if (res && res.data) {
                            this.setMasterCode(res.data)
                            done(null, {
                                res: res.data,
                                isError: false
                            })
                        } else {
                            done(null, {
                                isError: true,
                                msg: '获取报告数据失败,本地没数据'
                            })
                        }
                    }).catch(err => {
                        console.log(err)
                        done(null, {
                            isError: true,
                            msg: '获取本地数据异常'
                        })
                        // this.showLoadMsg('获取问卷失败')
                    })
                },
                // 五养
                (done) => {
                    if (!this.routerParams.reportCode) {
                        done(null, {
                            isError: false
                        })
                        return
                    }
                    const parameterData = { 'type': '1', 'diseaseCode': this.routerParams.reportCode }
                    fetch({
                        baseUrl: knowledgeLibUrl,
                        api: '/health/category',
                        method: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        params: { data: JSON.stringify(parameterData) }
                    }).then(respose => {
                        let res = respose.data
                        console.log('五养 res', res)
                        if (res && res.data && (res.success === true || res.success === 'true')) {
                            done(null, {
                                res: res.data,
                                isError: false
                            })
                        } else {
                            let failedMsg = res.message ? res.message : '获取数据失败'
                            done(null, {
                                isError: true,
                                msg: failedMsg
                            })
                        }
                    }).catch((ex) => {
                        console.log('五养 error', ex)
                        done(null, {
                            isError: true,
                            msg: '获取五养失败，服务器异常'
                        })
                    })
                }
            ], (err, results) => {
                if (err) {
                    console.log('err', err)
                }
                wx.hideLoading()
                this.firstLoadStatus = false
                this.doResults(results)
            })
        },
        doResults(results) {
            console.log('doResults', results);
            const reportResult = results[0]
            const mulRaiseResult = results[1]
            let failedMsg = ''
            // 1.处理报告数据
            if (!reportResult.isError) {
                if (reportResult.res) {
                    this.doReport(reportResult.res)
                }
            } else {
                failedMsg = reportResult.msg
                // this.loadError = true
            }
            // 2.处理五养数据
            if (mulRaiseResult) {
                // console.log('mulRaiseResult', mulRaiseResult);
                if (!mulRaiseResult.isError) {
                    this.doMulRaise(mulRaiseResult.res)
                } else {
                    failedMsg = mulRaiseResult.msg
                }
            }
            console.log(failedMsg)
        },
        kScoreJump(kScore) {
            console.log('kScoreJump', kScore)
        },
        ringCanvas(speed) {
            // console.log('myChart speed', speed)
            let ctx = wx.createCanvasContext('customCanvas')
            ctx.setFontSize(20);
            ctx.setFillStyle('#666');
            ctx.fillText('我是测试信息', 30, 40);
            ctx.save()
            ctx.beginPath()
            ctx.arc(100, 100, 25, 0, 2 * Math.PI)
            ctx.clip()
            ctx.restore()
            ctx.draw()
        },
        codeDesJump() {

        },
        setMasterCode(data) {
            // console.log('setMasterCode', data)
            if (data && data.result) {
                let result = data.result
                if (!this.routerParams.reportCode && result.master && result.master.code) {
                    // 问卷masterCode
                    this.routerParams.reportCode = result.master.code
                    console.log('setMasterCode-----reportCode', this.routerParams.reportCode);
                }
                if (result.master) {
                    // console.log('master', result.master);
                    // 主体质
                    this.codeObj.masterCodeContent = result.master.name
                    this.code.master = result.master
                }
                if (result.both && result.both.length > 0) {
                    // 兼有体质列表
                    let bothCodeArr = []
                    each(result.both, (bothItem) => {
                        if (bothItem.name) {
                            bothCodeArr.push(bothItem.name)
                        }
                    })
                    this.codeObj.bothCodeContent = bothCodeArr.join('、')
                    this.code.both = result.both
                }
                if (result.incline && result.incline.length > 0) {
                    // 倾向体质列表
                    let inclineCodeArr = []
                    each(result.incline, (inclineItem) => {
                        if (inclineItem.name) {
                            inclineCodeArr.push(inclineItem.name)
                        }
                    })
                    this.codeObj.inclineCodeContent = inclineCodeArr.join('、')
                    this.code.incline = result.incline
                }
            }
            if (data && data.questionnaire) {
                let questionnaire = data.questionnaire
                if (!this.routerParams.code && questionnaire && questionnaire.code) {
                    this.routerParams.code = questionnaire.code
                }
            }
        },
        doMulRaise(mulRaiseOriginData) {
            console.log('doMulRaise data', mulRaiseOriginData)
            let raiseData = {}
            raiseData.list = []
            if (mulRaiseOriginData) {
                each(mulRaiseOriginData, (raiseItemValue, raiseItemkey) => {
                    if (raiseItemValue.name === '食养') {
                        raiseData.list.push({
                            name: 'dietary',
                            title: raiseItemValue.name ? raiseItemValue.name : '',
                            nextPageId: '0',
                            img: raiseItemValue.imgUrl ? raiseItemValue.imgUrl : '',
                            desc: '',
                            apiUrl: raiseItemValue.apiUrl
                        })
                    } else if (raiseItemValue.name === '居养') {
                        raiseData.list.push({
                            name: 'house',
                            title: raiseItemValue.name ? raiseItemValue.name : '',
                            nextPageId: '0',
                            img: raiseItemValue.imgUrl ? raiseItemValue.imgUrl : '',
                            desc: ''
                        })
                    } else if (raiseItemValue.name === '术养') {
                        raiseData.list.push({
                            name: 'kungfu',
                            title: raiseItemValue.name ? raiseItemValue.name : '',
                            nextPageId: '0',
                            img: raiseItemValue.imgUrl ? raiseItemValue.imgUrl : '',
                            desc: ''
                        })
                    } else if (raiseItemValue.name === '心养') {
                        raiseData.list.push({
                            name: 'heart',
                            title: raiseItemValue.name ? raiseItemValue.name : '',
                            nextPageId: '0',
                            img: raiseItemValue.imgUrl ? raiseItemValue.imgUrl : '',
                            desc: ''
                        })
                    } else if (raiseItemValue.name === '动养') {
                        raiseData.list.push({
                            name: 'action',
                            title: raiseItemValue.name ? raiseItemValue.name : '',
                            nextPageId: '0',
                            img: raiseItemValue.imgUrl ? raiseItemValue.imgUrl : '',
                            desc: ''
                        })
                    }
                    // console.log('mulRaiseOriginData each', raiseItemkey, raiseItemValue)
                })
                this.mulRaiseData = raiseData
                console.log('mulRaiseOriginData-知识库-后', this.mulRaiseData)
            }
        },
        raiseJump(raiseItem) {
            console.log('raiseJump', raiseItem)
        },
        doReport(data) {
            console.log('doReport data', data)
            if (data.questionnaire) {
                let questionnaire = data.questionnaire
                // console.log('questionnaire', questionnaire)
                if (questionnaire.title) {
                    // 问卷title
                    this.reportData.title = questionnaire.title
                    wx.setNavigationBarTitle({
                        title: questionnaire.title
                    })
                }
            }

            if (data.result) {
                let result = data.result
                if (!this.routerParams.reportCode && result.master && result.code) {
                    // 问卷masterCode
                    this.routerParams.reportCode = result.code
                }
            }
            if (data.kScore || data.kScore === 0) {
                // 画布画评估分数
                this.reportData.kScore = data.kScore
                // console.log('data.kScore.................', data.kScore);
            }
            if (this.routerParams.kScore) {
                // 画布画评估分数 问卷传输过来的分数，会把分数覆盖掉
                this.reportData.kScore = this.routerParams.kScore
            }
            if (data.report) {
                let report = data.report
                let list = []
                if (report.data_list && report.data_list.length > 0) {
                    each(report.data_list, item => {
                        list.push({
                            value: item.index_content.value,
                            title: item.index_title.value,
                            name: '',
                            nextPageId: '',
                            img: ''
                        })
                    })
                }
                this.reportData.list = list
            }
            // console.log('this.reportData', this.reportData)
        }
    },
    updated() {
        if (this.reportData.kScore || this.reportData.kScore === 0) {
            this.ringCanvas(this.reportData.kScore)
        }
    },
    mounted() {
        this.routerParams = decodeUrlParam(this.$root.$mp.query)
        console.log('this.routerParams', this.routerParams);
        this.againLoad()
    }
}
</script>

<style lang="scss">
$lineColor: rgb(228,228,228);
.contain {
    height: 100%;
    .pageLoad {
        padding-top: 20rpx;
        text-align: center;
    }
    .content {
        .score {
            .word {
                font-size: 100rpx;
                font-weight: bold;
                text-align: center;
                color: #e7e7e7;
            }
            .time-graph {
                padding: 5px 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .time-graph-canvas {
                width: 170px;
                height: 170px;
                border: 1px solid red;
                border-radius: 50%;
            }
        }

        .panel {
            // border: 1px solid $lineColor;
            border-bottom: 0;
            .p-title {
                padding: 0 20px;
                background-color: rgb(242,242,242);
                line-height: 38px;
                border-bottom: 1px solid $lineColor;
                h3 {
                    font-size: 16px;
                    // font-weight: 460;
                }
            }
            .p-content {
                padding: 20px;
                p {
                    line-height: 25px;
                    .bothCode,
                    .inclineCode,
                    .masterCode {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .masterCode {
                        color: rgb(0,139,0);
                    }
                    .bothCode,
                    .inclineCode {
                        color: rgb(255,164,89);
                    }
                }
                .raise {
                    margin: 0 -10px;
                    .advice {
                        box-sizing: border-box;
                        flex: 1 1 33.33%;
                        padding: 0 2px;
                        margin-bottom: 15px;
                        img {
                            width: 100%;
                        }
                        h3 {
                            font-size: 16px;
                            font-weight: normal;
                            line-height: 30px;
                            text-align: center;
                            position: relative;
                            font-size: 14px;
                            top: -4px;
                        }
                    }
                }

                .line {
                    border-bottom: 1px solid #e4e4e4;
                    margin: 10px -18px;
                }
            }
        }

        padding-bottom: 70px;
    }
}
</style>
