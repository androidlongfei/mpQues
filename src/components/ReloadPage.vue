<template>
<div class="error_page">
    <!-- <custom-header :headerData="this.headerData"></custom-header> -->
    <div class="error_main" style="text-align:center">
        <img src="../images/errs.png">
        <div class="error_text">
            <p>貌似出了点差错</p>
            <p>真忧伤呢~</p>
        </div>
        <div class="error_btn" @click="reload()">点击重试</div>
    </div>
</div>
</template>
<script>
export default {
    props: {
        // 重新加载回调函数
        reload: {
            type: Function,
            required: true
        }
    },
    methods: {},
    components: {}
}
</script>

<style lang="scss">
// @import "../../style/vars.scss";
.error_page {
    .error_main {
        img {
            text-align: center;
            width: 189px;
            height: 186px;
            margin-top: 90px;
        }
        .error_text {
            font-size: 15px;
            margin: 15px 0 30px;
            color: #ccc;
        }
        .error_btn {
            width: 175px;
            height: 35px;
            border-radius: 5px;
            font-size: 15px;
            color: #2ECD93;
            background-color: #eafaf4;
            line-height: 35px;
            position: relative;
            margin: 0 auto;

        }
    }
}
</style>
