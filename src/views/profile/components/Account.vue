<template>
  <el-form
    ref="accountForm"
    :rules="accountForm.rules"
    :model="accountForm.form"
  >
    <el-form-item
      :label="$t('nickname')"
      prop="nickname"
    >
      <el-input
        v-model.trim="accountForm.form.nickname"
        :placeholder="$t('pleaseEnter') + $t('nickname')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('mobile')"
      prop="mobile"
    >
      <el-input
        v-model.trim="accountForm.form.mobile"
        :placeholder="$t('pleaseEnter') + $t('mobile')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('introduction')"
      prop="introduction"
    >
      <el-input
        v-model.trim="accountForm.form.introduction"
        type="textarea"
        :rows="2"
        :placeholder="$t('pleaseEnter') + $t('mobile')"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        :loading="accountForm.loading"
        type="primary"
        @click="doUpdate"
      >
        {{ $t('submit') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'
import IProfile from '../index.vue'
import { diffObjUpdate } from '@/utils/diff'
import { updateUser } from '@/api/system/users'
import { UserModule } from '@/store/modules/user'

@Component({
  name: 'Account'
})
export default class extends Vue {
  @Prop({ required: true }) private user!: IProfile

  private accountForm: any = {
    loading: false,
    form: {
      nickname: '',
      mobile: '',
      introduction: ''
    },
    // 旧数据
    oldData: {},
    // 表单校验
    rules: {
      nickname: [
        { required: true, message: this.$t('nickname').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  created() {
    this.getData()
  }

  private async getData() {
    this.$nextTick(() => {
      this.accountForm.form = this.user
      this.accountForm.oldData = JSON.parse(JSON.stringify(this.user))
    })
  }

  private async doUpdate() {
    (this.$refs.accountForm as Form).validate(async(valid) => {
      if (valid) {
        const update = diffObjUpdate(this.accountForm.oldData, this.accountForm.form)
        // 编号存在则更新, 不存在给出提示
        if (!update.id) {
          this.$message({
            type: 'warning',
            message: this.$t('noDiff').toString()
          })
          return
        }
        this.accountForm.loading = true
        try {
          // 更新用户信息
          await updateUser(update.id, update)
          this.$notify({
            title: this.$t('congratulations').toString(),
            message: this.$t('update').toString() + this.$t('success').toString(),
            type: 'success',
            duration: 2000
          })
        } finally {
          this.accountForm.loading = false
        }
        // 重新拉取用户信息
        await UserModule.GetUserInfo()
        this.getData()
      }
    })
  }
}
</script>
