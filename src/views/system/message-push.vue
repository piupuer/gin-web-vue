<template>
  <div class="app-container">
    <el-card class="box-card">
      <div
        slot="header"
        class="clearfix"
      >
        <span>创建新消息</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          :loading="table.pushLoading"
          @click="pushMessage"
        >
          <i class="el-icon-s-promotion">立即发送</i>
        </el-button>
      </div>
      <el-form
        ref="messageForm"
        v-loading="table.loading"
        :rules="table.rules"
        :model="table.form"
      >
        <el-form-item
          label="类型"
          prop="type"
        >
          <el-select
            v-model.trim="table.form.type"
            placeholder="请选择消息类型"
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
          v-if="table.form.type===0"
          label="接收人"
          prop="toUserIds"
        >
          <el-select
            v-model.trim="table.form.toUserIds"
            placeholder="请选择消息接收人(输入用户昵称可直接搜索)"
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
              :label="item.nickname + '(用户名: ' + item.username + ', 手机号: ' + item.mobile + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="table.form.type===1"
          label="接收角色"
          prop="toRoleIds"
        >
          <el-select
            v-model.trim="table.form.toRoleIds"
            placeholder="请选择消息接收角色(输入角色名可直接搜索)"
            multiple
            filterable
            remote
            clearable
            :remote-method="getRoleData"
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
          label="标题"
          prop="title"
        >
          <el-input
            v-model.trim="table.form.title"
            placeholder="请输入消息标题"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="内容"
          prop="title"
        >
          <el-input
            v-model.trim="table.form.content"
            type="textarea"
            :rows="5"
            placeholder="请输入消息内容(255个字符以内)"
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
import { getUsers } from '@/api/system/users'
import { getRoles } from '@/api/system/roles'
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
      label: '私信消息(一对一)'
    }, {
      name: 1,
      label: '通知消息(一对多)'
    }, {
      name: 2,
      label: '系统消息(一对全部)'
    }],
    status: [{
      name: 0,
      label: '未读',
      type: 'danger'
    }, {
      name: 1,
      label: '已读',
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
        { required: true, message: '类型不能为空', trigger: 'blur' }
      ],
      toUserIds: [
        { required: true, message: '接收人不能为空', trigger: 'blur' }
      ],
      toRoleIds: [
        { required: true, message: '接收角色不能为空', trigger: 'blur' }
      ],
      title: [
        { required: true, message: '标题不能为空', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '内容不能为空', trigger: 'blur' }
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
            message: '发送消息失败: ' + e
          })
        } finally {
          this.table.pushLoading = false
          IdempotenceModule.RefreshIdempotenceToken()
        }
      }
    })
  }

  private async getUserData(query: string) {
    if (query !== '') {
      this.table.userLoading = true
      try {
        // 读取所有用户
        const { data } = await getUsers({
          nickname: query,
          noPagination: true
        })
        this.table.userSelectOptions = data.list
      } catch (e) {
        this.$message.error('读取系统用户信息失败')
        return
      } finally {
        this.table.userLoading = false
      }
    }
  }

  private async getRoleData(query: string) {
    if (query !== '') {
      this.table.roleLoading = true
      try {
        // 读取所有角色
        const { data } = await getRoles({
          name: query,
          noPagination: true
        })
        this.table.roleSelectOptions = data.list
      } catch (e) {
        console.warn(e)
        this.$message.error('读取系统角色信息失败')
        return
      } finally {
        this.table.roleLoading = false
      }
    }
  }

  // 获取消息类型对应的tag label
  private getTypeTagLabel(type: number) {
    for (let i = 0, len = this.defaultConfig.types.length; i < len; i++) {
      const item = this.defaultConfig.types[i]
      if (type === item.name) {
        return item.label
      }
    }
    return ''
  }

  // 获取消息状态对应的tag颜色
  private getStatusTagType(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.type
      }
    }
    return ''
  }

  // 获取消息类型对应的tag label
  private getStatusTagLabel(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.label
      }
    }
    return ''
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
