<template>
  <div class="app-container">
    <el-card class="box-card">
      <div
        slot="header"
        class="clearfix"
      >
        <span>{{ $t('messagePushPage.sendMessage') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          :loading="table.pushLoading"
          @click="pushMessage"
        >
          <i class="el-icon-s-promotion">{{ $t('messagePushPage.sendNow') }}</i>
        </el-button>
      </div>
      <el-form
        ref="messageForm"
        v-loading="table.loading"
        :rules="table.rules"
        :model="table.form"
      >
        <el-form-item
          :label="$t('type')"
          prop="type"
        >
          <el-select
            v-model.trim="table.form.type"
            :placeholder="$t('pleaseEnter') + $t('type')"
            clearable
          >
            <el-option
              v-for="item in defaultConfig.types"
              :key="item.name"
              :label="item.label"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="table.form.type === 0"
          :label="$t('messagePushPage.toUser')"
          prop="toUserIds"
        >
          <el-select
            v-model.trim="table.form.toUserIds"
            :placeholder="$t('pleaseEnter') + $t('messagePushPage.toUser')"
            multiple
            filterable
            remote
            clearable
            :remote-method="getUserData"
            :loading="table.userLoading"
          >
            <el-option
              v-for="item in table.userSelectOptions"
              :key="item.id"
              :label="item.nickname + '('+$t('username')+': ' + item.username + ', '+$t('mobile')+': ' + item.mobile + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="table.form.type === 1"
          :label="$t('messagePushPage.toRole')"
          prop="toRoleIds"
        >
          <el-select
            v-model.trim="table.form.toRoleIds"
            :placeholder="$t('pleaseEnter') + $t('messagePushPage.toRole')"
            multiple
            filterable
            remote
            clearable
            :remote-method="findRole"
            :loading="table.roleLoading"
          >
            <el-option
              v-for="item in table.roleSelectOptions"
              :key="item.id"
              :label="item.name + '(' + item.desc + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('title')"
          prop="title"
        >
          <el-input
            v-model.trim="table.form.title"
            :placeholder="$t('pleaseEnter') + $t('title')"
            clearable
          />
        </el-form-item>
        <el-form-item
          :label="$t('content')"
          prop="content"
        >
          <el-input
            v-model.trim="table.form.content"
            type="textarea"
            :rows="5"
            :placeholder="$t('pleaseEnter') + $t('content')"
            clearable
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { findUser } from '@/api/system/users'
import { findRole } from '@/api/system/roles'
import { MessageModule } from '@/store/modules/message'
import { IdempotenceModule } from '@/store/modules/idempotence'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'MessagePush'
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    types: [{
      name: 0,
      label: this.$t('messagePushPage.one2one').toString()
    }, {
      name: 1,
      label: this.$t('messagePushPage.one2more').toString()
    }, {
      name: 2,
      label: this.$t('messagePushPage.one2all').toString()
    }],
    status: [{
      name: 0,
      label: this.$t('messagePushPage.unRead').toString(),
      type: 'danger'
    }, {
      name: 1,
      label: this.$t('messagePushPage.read').toString(),
      type: 'success'
    }]
  }

  private table: any = {
    userLoading: false,
    roleLoading: false,
    pushLoading: false,
    // 备选用户
    userSelectOptions: [],
    // 备选角色
    roleSelectOptions: [],
    form: {
      type: '',
      toUserIds: [],
      toRoleIds: [],
      title: '',
      content: '',
      idempotenceToken: ''
    },
    // 表单校验
    rules: {
      type: [
        { required: true, message: this.$t('type').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      toUserIds: [
        { required: true, message: this.$t('messagePushPage.toUser').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      toRoleIds: [
        { required: true, message: this.$t('messagePushPage.toRole').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      title: [
        { required: true, message: this.$t('title').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      content: [
        { required: true, message: this.$t('content').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  created() {
    IdempotenceModule.RefreshIdempotenceToken()
  }

  // 发送消息
  private async pushMessage() {
    (this.$refs.messageForm as Form).validate(async(valid) => {
      if (valid) {
        try {
          this.table.pushLoading = true
          this.table.form.idempotenceToken = IdempotenceModule.idempotenceToken
          MessageModule.Send({
            type: '1-2-1',
            data: this.table.form
          })
        } catch (e) {
          this.$message({
            type: 'error',
            message: this.$t('sendMessage').toString() + this.$t('fail').toString() + ': ' + e
          })
        } finally {
          this.table.pushLoading = false
          IdempotenceModule.RefreshIdempotenceToken()
        }
      }
    })
  }

  private async getUserData(query: string) {
    this.table.userLoading = true
    try {
      // 读取所有用户
      const params: any = {
        noPagination: true
      }
      if (query !== '') {
        params.nickname = query
      }
      const { data } = await findUser(params)
      this.table.userSelectOptions = data.list
    } catch (e) {
      this.$message.error(this.$t('readDataFail').toString())
      return
    } finally {
      this.table.userLoading = false
    }
  }

  private async findRole(query: string) {
    if (query !== '') {
      this.table.roleLoading = true
      try {
        // 读取所有角色
        const { data } = await findRole({
          name: query,
          noPagination: true
        })
        this.table.roleSelectOptions = data.list
      } catch (e) {
        console.warn(e)
        this.$message.error(this.$t('readDataFail').toString())
        return
      } finally {
        this.table.roleLoading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    .el-row {
      margin-bottom: 15px;
    }
    .el-select {
      width: 100%;
    }
  }
</style>
