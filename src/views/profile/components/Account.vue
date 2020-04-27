<template>
  <el-form>
    <el-form-item :label="$t('profile.accountNickname')">
      <el-input v-model.trim="user.nickname" />
    </el-form-item>
    <el-form-item :label="$t('profile.accountMobile')">
      <el-input v-model.trim="user.mobile" />
    </el-form-item>
    <el-form-item :label="$t('profile.accountIntroduction')">
      <el-input
        v-model.trim="user.introduction"
        type="textarea"
        :rows="2"
        placeholder="简单描述一下自己吧~"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submit"
      >
        {{ $t('profile.submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { IProfile } from '../index.vue'

@Component({
  name: 'Account'
})
export default class extends Vue {
  @Prop({ required: true }) private user!: IProfile

  private submit() {
    this.$message({
      message: 'User information has been updated successfully',
      type: 'success',
      duration: 5 * 1000
    })
  }
}
</script>
