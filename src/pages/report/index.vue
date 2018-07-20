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
                问题内容
            </div>
        </div>
    </div>
</div>
</template>

<script>
import ReloadPage from '@/components/ReloadPage'
export default {
    data() {
        return {
            loadError: false,
            firstLoadStatus: false,
            routerParams: {},
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
        }
    },
    mounted() {
        this.routerParams = this.$root.$mp.query
        console.log('this.routerParams', this.routerParams);
        this.againLoad()
    }
}
</script>

<style lang="scss">
.contain {
    height: 100%;
    .pageLoad {
        padding-top: 20rpx;
        text-align: center;
    }
    .content {
        text-align: center;
    }
}
</style>
