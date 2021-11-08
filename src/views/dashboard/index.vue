<template>
  <div class="app-container">
    <div class="tips">
      <h1>{{ $t('dashboardPage.t1') }}</h1>
      <h2>{{ $t('dashboardPage.t2') }}</h2>
      <h2>{{ $t('dashboardPage.t3') }}</h2>
      <br>
      <br>
      <br>
      <br>
      <br>
      <h5>{{ $t('dashboardPage.t4') }}: </h5>
      <p>{{ $t('dashboardPage.t5') }}(<span class="special">{{ $t('dashboardPage.t6') }}</span>)</p>
      <p>{{ $t('dashboardPage.t7') }}(<span class="special">{{ $t('dashboardPage.t8') }} ¥59 {{ $t('dashboardPage.t9') }}</span>):</p>
      <p>
        <el-link
          href="https://www.ucloud.cn/site/active/kuaijie.html?invitation_code=C1x8863BB6C7A1E"
          target="_blank"
          type="primary"
        >
          https://www.ucloud.cn/site/active/kuaijie.html?invitation_code=C1x8863BB6C7A1E
        </el-link>
      </p>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .tips {
    padding: 8px 16px;
    background-color: #ecf8ff;
    border-radius: 4px;
    border-left: 5px solid #50bfff;
    margin: 20px 0;
    p {
      font-size: 12px;
    }
    .special {
      color: red;
    }
  }
</style>
