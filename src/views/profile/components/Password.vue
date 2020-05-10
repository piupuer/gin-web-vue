<template>
  <el-form
    ref="passwordForm"
    :rules="passwordForm.rules"
    :model="passwordForm.form"
  >
    <el-form-item
      prop="oldPassword"
      :label="$t('profile.passwordOldPassword')"
    >
      <el-input
        v-model.trim="passwordForm.form.oldPassword"
        type="password"
        placeholder="请输入旧密码"
      />
    </el-form-item>
    <el-form-item
      prop="newPassword"
      :label="$t('profile.passwordNewPassword')"
    >
      <el-input
        v-model.trim="passwordForm.form.newPassword"
        type="password"
        placeholder="请输入新密码"
      />
    </el-form-item>
    <el-form-item
      prop="confirmPassword"
      :label="$t('profile.passwordConfirmPassword')"
    >
      <el-input
        v-model.trim="passwordForm.form.confirmPassword"
        type="password"
        placeholder="再次确认密码"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="doUpdate"
      >
        {{ $t('profile.submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { changePwd } from '@/api/system/users'

@Component({
  name: 'Password'
})
export default class extends Vue {
  private validatePassword(rule: any, value: string, callback: Function) {
    if (this.passwordForm.form.newPassword !== value) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }

  private passwordForm: any = {
    form: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    // 表单校验
    rules: {
      oldPassword: [
        { required: true, message: '旧密码不能为空', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '新密码不能为空', trigger: 'blur' },
        { min: 6, message: '新密码至少6个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '确认密码不能为空', trigger: 'blur' },
        { validator: this.validatePassword, trigger: 'blur' }
      ]
    }
  }

  private async doUpdate() {
    (this.$refs.passwordForm as Form).validate(async(valid) => {
      if (valid) {
        await changePwd(this.passwordForm.form)
        this.$notify({
          title: '恭喜',
          message: '修改密码成功',
          type: 'success',
          duration: 2000
        })
      }
    })
  }
}
</script>
