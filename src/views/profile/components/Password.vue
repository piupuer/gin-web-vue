<template>
  <el-form>
    <el-form-item :label="$t('profile.passwordOldPassword')">
      <el-input
        type="password"
        placeholder="请输入旧密码"
      />
    </el-form-item>
    <el-form-item :label="$t('profile.passwordNewPassword')">
      <el-input
        type="password"
        placeholder="请输入新密码"
      />
    </el-form-item>
    <el-form-item :label="$t('profile.passwordConfirmPassword')">
      <el-input
        type="password"
        placeholder="再次确认密码"
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
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'Password'
})
export default class extends Vue {
  private submit() {
    this.$message({
      message: 'User information has been updated successfully',
      type: 'success',
      duration: 5 * 1000
    })
  }
}
</script>
