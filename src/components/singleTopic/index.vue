<template>
<div class="q-item">
    <div class="q-line"></div>
    <div class="q-topic">
        <p class="text_ti" :id="assemblyAnchorId(questionItem.itemId)">{{questionItem.seq}}、{{questionItem.title}}</p>
        <radio-group class="radio-group" @change="radioChange">
            <div v-for="(optionItem,index) in questionItem.optionList" class="q-topic-option" :key="index">
                <radio :id="optionItem.optionId" class="option-radio" type="radio" :name="questionItem.itemId" :value="optionItem.optionId" :checked="optionItem.selected" />
                <label :for="optionItem.optionId" class="radio option-label">{{optionItem.optionContent}}</label>
            </div>
        </radio-group>
        <!-- <span style="color:red;font-size:10px;">{{showOptionName(questionItem.singelCheckId)}}:{{questionItem.singelCheckId}}</span> -->
    </div>
</div>
</template>

<script>
import find from 'lodash/find'
export default {
    props: {
        questionItem: {
            type: Object,
            required: true,
            default: function () {
                return {}
            }
        }
    },
    data() {
        return {
            singelCheckId: ''
        }
    },
    created() {
        // console.log('this.questionItem', this.questionItem.itemId);
        // 初始化选中项
        find(this.questionItem.optionList, option => {
            if (option.selected) {
                this.questionItem.singelCheckId = option.optionId
                return true
            }
        })
    },
    mounted() {
        // console.log('questionItem---', this.questionItem.singelCheckId)
    },
    methods: {
        showOptionName(optionId) {
            if (!optionId) {
                return ''
            }
            for (let i = 0; i < this.questionItem.optionList.length; i++) {
                if (this.questionItem.optionList[i].optionId === optionId) {
                    return '选中:' + this.questionItem.optionList[i].optionContent
                }
            }
            return ''
        },
        assemblyAnchorId(quesId) {
            return `_${quesId}`
        },
        radioChange(e) {
            // console.log('radio发生change事件，携带value值为：', this.questionItem, e.target.value)
            this.questionItem.singelCheckId = e.target.value
        }
    }
}
</script>

<style lang="scss" scoped>
.text_ti {
    line-height: 25px;
    font-size: 16px;
    color: #000000;
    margin: 5px 0;
}

.q-item {
    margin: 10rpx 8rpx;
}

.q-item .q-line {
    width: 100%;
    border-top: 1px solid rgb(228,228,228);
}
.q-item .q-topic {
    margin-left: 20rpx;
    margin-right: 20rpx;
}

.q-topic .q-topic-title {
    // height: 30px;
    line-height: 40rpx;
    margin-top: 10rpx;
    font-size: 32rpx;
}
.q-topic .q-topic-option {
    line-height: 60rpx;
    font-size: 28rpx;
    color: rgb(141,141,141);
}
.q-topic-option .option-radio {}
.q-topic-option .option-label {
    position: relative;
    top: 4rpx;
    margin-right: 8rpx;
}
</style>
