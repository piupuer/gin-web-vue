<template>
  <el-form
    ref="passwordForm"
    :rules="passwordForm.rules"
    :model="passwordForm.form"
  >
    <el-form-item
      prop="oldPassword"
      :label="$t('oldPassword')"
    >
      <el-input
        v-model.trim="passwordForm.form.oldPassword"
        type="password"
        :placeholder="$t('pleaseEnter') + $t('oldPassword')"
      />
    </el-form-item>
    <el-form-item
      prop="newPassword"
      :label="$t('newPassword')"
    >
      <el-input
        v-model.trim="passwordForm.form.newPassword"
        type="password"
        :placeholder="$t('pleaseEnter') + $t('newPassword')"
      />
    </el-form-item>
    <el-form-item
      prop="confirmPassword"
      :label="$t('confirmPassword')"
    >
      <el-input
        v-model.trim="passwordForm.form.confirmPassword"
        type="password"
        :placeholder="$t('pleaseEnter') + $t('confirmPassword')"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :loading="passwordForm.loading"
        @click="doUpdate"
      >
        {{ $t('submit') }}
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
      callback(new Error(this.$t('profilePage.passwordInconsistent').toString()))
    } else {
      callback()
    }
  }

  private passwordForm: any = {
    loading: false,
    form: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    // 表单校验
    rules: {
      oldPassword: [
        { required: true, message: this.$t('oldPassword').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: this.$t('newPassword').toString() + this.$t('required').toString(), trigger: 'blur' },
        { min: 6, message: this.$t('profilePage.newPasswordSmallLen').toString(), trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: this.$t('confirmPassword').toString() + this.$t('required').toString(), trigger: 'blur' },
        { validator: this.validatePassword, trigger: 'blur' }
      ]
    }
  }

  private async doUpdate() {
    (this.$refs.passwordForm as Form).validate(async(valid) => {
      if (valid) {
        this.passwordForm.loading = true
        try {
          await changePwd(this.passwordForm.form)
          this.$notify({
            title: this.$t('congratulations').toString(),
            message: this.$t('update').toString() + this.$t('password').toString() + this.$t('success').toString(),
            type: 'success',
            duration: 2000
          })
        } finally {
          this.passwordForm.loading = false
        }
      }
    })
  }
}
</script>
