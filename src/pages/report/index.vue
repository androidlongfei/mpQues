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
                                {{codeObj.masterCodeContent ? '您的主体质是':''}}<span class="masterCode" @click="codeDesJump(code.master)">{{codeObj.masterCodeContent}}</span> {{codeObj.bothCodeContent ? '，兼有体质是':''}}<span class="bothCode" v-for="(bothItem,bothItemIndex) in code.both" :key="bothItemIndex" @click="codeDesJump(bothItem)">{{bothItem.name}}{{code.both.length !== (bothItemIndex+1) ? '、':''}}</span> {{codeObj.inclineCodeContent ? '，倾向体质是':''}}<span class="inclineCode" v-for="(inclineItem,inclineItemIndex) in code.incline" @click="codeDesJump(inclineItem)">{{inclineItem.name}}{{code.incline.length !== (inclineItemIndex+1) ? '、':''}}</span>
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
export default {
    data() {
        return {
            loadError: false,
            firstLoadStatus: false,
            routerParams: {},
            reportData: {}, // 报告数据
            paramsStr: ''
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
            getStorage(`REPORT_${this.routerParams.code}`).then(res => {
                wx.hideLoading()
                this.firstLoadStatus = false
                console.log('res', res);
                if (res && res.data) {
                    this.doReport(res.data)
                } else {
                    this.showLoadMsg('获取问卷失败')
                }
            }).catch(err => {
                console.log(err)
                this.showLoadMsg('获取问卷失败')
            })
        },
        showLoadMsg(msg) {
            wx.showToast({
                title: msg,
                icon: 'fail',
                duration: 2000
            })
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
        getReportItemContentImg(reportItem) {
            if (reportItem.img) {
                return reportItem.img
            }
            return ''
            // return 'http://fs-prod.ipaas.enncloud.cn/laikang-sydn-img-care/e56e980b-f928-41e1-b2b9-69b92a7ed782.jpg?e=9999999999&token=2:HQJMCQOQEXFIBKKOEAWI:ef38a2a3ac7879de0daaa444f92dcae5525ed0e87913730908ca50320e9d098e'
        },
        getReportItemTitle(reportItem) {
            console.log('getReportItemTitle', reportItem)
            if (reportItem.title) {
                return reportItem.title
            }
            return ''
        },
        getReportItemContentWord(reportItem) {
            if (reportItem.value) {
                return reportItem.value
            }
            return '无'
        },
        codeDesJump() {

        },
        doReport(data) {
            console.log('doReport data', data)
            if (data.questionnaire) {
                let questionnaire = data.questionnaire
                if (questionnaire.title) {
                    // 问卷title
                    this.reportData.title = data.title
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
                console.log('data.kScore.................', data.kScore);
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
            console.log('this.reportData', this.reportData)
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
            border: 1px solid $lineColor;
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
            .healthConsultation {
                display: flex;
                justify-content: space-between;
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
                }
                .des {
                    display: flex;
                    align-items: center;
                    img {
                        width: 100px;
                        height: auto;
                    }
                }
                .des-left {
                    img {
                        margin-right: 10px;
                    }
                }
                .des-right {
                    justify-content: space-between;
                    flex-direction: row-reverse;
                    img {
                        margin-left: 10px;
                    }
                }

                .advice {
                    box-sizing: border-box;
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

                .line {
                    border-bottom: 1px solid #e4e4e4;
                    margin: 10px -18px;
                }
                .healthb {
                    border: 1px solid #EAEAEA;
                    padding: 2px;
                }
            }
        }
        .panel:last-child {
            border-bottom: 1px solid $lineColor;
        }
        .panel:first-child {
            .p-title {
                border-top: 1px solid $lineColor;
            }
        }

        padding-bottom: 70px;
    }
}
</style>
