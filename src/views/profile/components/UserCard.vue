<template>
  <el-card style="margin-bottom:20px;">
    <div
      slot="header"
      class="clearfix"
    >
      <span>{{ $t('profile.userCardTitle') }}</span>
    </div>

    <div class="user-profile">
      <div class="box-center">
        <img
          :src="user.avatar"
          style="border-radius: 50%"
          :height="'100px'"
          :width="'100px'"
        >
      </div>
      <div class="box-center">
        {{ $t('profile.userCardHello') }},
        <span class="user-name text-center">
          {{ user.nickname }}
        </span>
      </div>
    </div>

    <div class="user-bio">
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header">
          <svg-icon name="user" /><span>{{ $t('profile.accountUsername') }}</span><span class="span-right">{{ user.username }}</span>
        </div>
      </div>
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header">
          <svg-icon name="guide" /><span>{{ $t('profile.accountNickname') }}</span><span class="span-right">{{ user.nickname }}</span>
        </div>
      </div>
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header">
          <i class="el-icon-mobile-phone" /><span>{{ $t('profile.accountMobile') }}</span><span class="span-right">{{ user.mobile }}</span>
        </div>
      </div>
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header">
          <svg-icon name="education" /><span>{{ $t('profile.accountIntroduction') }}</span>
        </div>
      </div>
      <div class="user-bio-section-body">
        <div class="text-muted">
          {{ user.introduction }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import IProfile from '../index.vue'
import PanThumb from '@/components/PanThumb/index.vue'

@Component({
  name: 'UserCard',
  components: {
    PanThumb
  }
})
export default class extends Vue {
  @Prop({ required: true }) private user!: IProfile
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .span-right {
      float: right;
      font-weight: normal;
      font-size: 14px;
    }
  }
  .user-bio-section-body {
    font-size: 12px;
    text-indent: 24px;
  }
}
</style>
