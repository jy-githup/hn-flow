<script lang="ts" name="home" setup>
import CategoryRatio from './components/category-ratio.vue';
import CountEffect from './components/count-effect.vue';
import CountPaid from './components/count-paid.vue';
import CountUser from './components/count-user.vue';
import CountViews from './components/count-views.vue';
import HotSearch from './components/hot-search.vue';
import SalesRank from './components/sales-rank.vue';
import TabChart from './components/tab-chart.vue';
</script>

<template>
  <el-scrollbar>
    <div class="view-home">
      <el-row :gutter="15">
        <el-col :lg="6" :md="12" :xs="24">
          <div class="card">
            <CountUser />
          </div>
        </el-col>
        <el-col :lg="6" :md="12" :xs="24">
          <div class="card">
            <CountViews />
          </div>
        </el-col>
        <el-col :lg="6" :md="12" :xs="24">
          <div class="card">
            <CountPaid />
          </div>
        </el-col>
        <el-col :lg="6" :md="12" :xs="24">
          <div class="card">
            <CountEffect />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="15">
        <el-col :lg="14" :xs="24">
          <div class="card">
            <TabChart />
          </div>
        </el-col>
        <el-col :lg="10" :xs="24">
          <div class="card">
            <SalesRank />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="15">
        <el-col :lg="14" :sm="24">
          <div class="card card--last">
            <HotSearch />
          </div>
        </el-col>
        <el-col :lg="10" :sm="24">
          <div class="card card--last">
            <CategoryRatio />
          </div>
        </el-col>
      </el-row>
    </div>
  </el-scrollbar>
</template>

<style lang="scss">
.view-home {
  overflow-x: hidden;

  .card {
    background-color: #fff;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 12px;
    letter-spacing: 0.5px;
    color: #000;
    line-height: 1;

    &__header {
      display: flex;
      align-items: center;
      height: 50px;
      padding: 0 20px;

      .label {
        font-size: 12px;
      }

      .value {
        font-size: 18px;
        font-weight: bold;
        margin-left: 10px;
      }
    }

    &__container {
      padding: 0 20px;
      height: 50px;
    }

    &__footer {
      display: flex;
      align-items: center;
      height: 50px;
      border-top: 1px solid #f7f7f7;
      font-size: 12px;
      margin: 0 5px;
      padding: 0 15px;
      box-sizing: border-box;

      .label {
        margin-right: 10px;
      }

      .value {
        font-size: 13px;
      }
    }
  }
}
</style>
