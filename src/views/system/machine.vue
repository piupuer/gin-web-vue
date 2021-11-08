<template>
  <div class="app-container">
    <el-form
      ref="searchForm"
      v-loading="table.loading"
      :inline="true"
      :model="table.form"
      class="demo-form-inline"
    >
      <el-form-item
        :label="$t('host')"
        prop="host"
      >
        <el-input
          v-model.trim="table.form.host"
          :placeholder="$t('pleaseEnter') + $t('host')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('username')"
        prop="loginName"
      >
        <el-input
          v-model.trim="table.form.loginName"
          :placeholder="$t('pleaseEnter') + $t('username')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('status')"
        prop="status"
      >
        <el-select
          v-model.trim="table.form.status"
          clearable
          :placeholder="$t('pleaseEnter') + $t('status')"
        >
          <el-option
            key="1"
            :label="$t('available')"
            :value="1"
          />
          <el-option
            key="0"
            :label="$t('machinePage.cannotConnect')"
            :value="0"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="table.loading"
          @click="doSearch"
        >
          {{ $t('query') }}
        </el-button>
        <el-button @click="resetForm('searchForm')">
          {{ $t('reset') }}
        </el-button>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
          >
            {{ $t('create') }}
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="table.batchDeleteBtnDisabled"
            @click="handleBatchDelete"
          >
            {{ $t('batchDel') }}
          </el-button>
        </el-col>
      </el-row>
      <el-table
        :data="table.list"
        style="width: 100%;margin-bottom: 20px;"
        row-key="id"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="host"
          :label="$t('host')"
        />
        <el-table-column
          prop="sshPort"
          :label="$t('port')"
          align="center"
        />
        <el-table-column
          prop="loginName"
          :label="$t('username')"
          align="center"
        />
        <el-table-column
          prop="loginPwd"
          :label="$t('password')"
          align="center"
        />
        <el-table-column
          prop="status"
          :label="$t('status')"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status===0?'danger':'success'"
            >
              {{ scope.row.status===0? $t('machinePage.cannotConnect').toString() : $t('healthy').toString() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="version"
          :label="$t('machinePage.version')"
          align="center"
        />
        <el-table-column
          prop="arch"
          :label="$t('machinePage.arch')"
          align="center"
        />
        <el-table-column
          prop="name"
          :label="$t('machinePage.name')"
          align="center"
        />
        <el-table-column
          prop="cpu"
          label="CPU"
        />
        <el-table-column
          prop="memory"
          :label="$t('machinePage.memory')"
          align="center"
        />
        <el-table-column
          prop="disk"
          :label="$t('machinePage.disk')"
          align="center"
        />
        <el-table-column
          prop="remark"
          :label="$t('remark')"
        />
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="320"
        >
          <template slot-scope="scope">
            <el-button

              @click="doConnect(scope.row)"
            >
              {{ scope.row.status === 0 ? $t('connect').toString() : $t('refresh').toString() }}
            </el-button>
            <el-button

              type="primary"
              @click="handleTerminal(scope.row)"
            >
              {{ $t('terminal').toString() }}
            </el-button>
            <el-button

              @click="handleUpdate(scope.row)"
            >
              {{ $t('edit') }}
            </el-button>
            <el-button

              type="danger"
              @click="handleDelete(scope.row)"
            >
              {{ $t('del') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="table.pageNum"
        :page-sizes="[1, 5, 20, 50]"
        :page-size="table.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="table.total"
        background
        @size-change="handlePagSizeChange"
        @current-change="handlePageNumChange"
      />
    </el-form>

    <!-- 机器配置对话框 -->
    <el-dialog
      :title="updateDialog.title"
      :visible.sync="updateDialog.visible"
      width="500px"
    >
      <el-form
        ref="updateForm"
        :model="updateDialog.form"
        :rules="updateDialog.rules"
        label-width="80px"
      >
        <el-form-item
          :label="$t('host')"
          prop="host"
        >
          <el-input
            v-model.trim="updateDialog.form.host"
            :placeholder="$t('pleaseEnter') + $t('host')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('port')"
          prop="sshPort"
        >
          <el-input
            v-model="updateDialog.form.sshPort"
            :placeholder="$t('pleaseEnter') + $t('port')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('username')"
          prop="loginName"
        >
          <el-input
            v-model.trim="updateDialog.form.loginName"
            :placeholder="$t('pleaseEnter') + $t('username')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('password')"
          prop="loginPwd"
        >
          <el-input
            v-model.trim="updateDialog.form.loginPwd"
            :placeholder="$t('pleaseEnter') + $t('password')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('remark')"
          prop="remark"
        >
          <el-input
            v-model.trim="updateDialog.form.remark"
            :placeholder="$t('pleaseEnter') + $t('remark')"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="updateDialog.loading"
          @click="doUpdate"
        >
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="cancelUpdate">
          {{ $t('cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <!--  机器终端对话框  -->
    <el-dialog
      :title="terminalDialog.title"
      :visible.sync="terminalDialog.visible"
      :fullscreen="true"
    >
      <pr-shell
        v-if="terminalDialog.visible"
        :host="terminalDialog.machine.host"
        :ssh-port="terminalDialog.machine.sshPort"
        :login-name="terminalDialog.machine.loginName"
        :login-pwd="terminalDialog.machine.loginPwd"
      />
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import PrShell from '@/components/Shell/index.vue'
import { Form } from 'element-ui'
import { batchDeleteMachine, createMachine, findMachine, updateMachine, connectMachine } from '@/api/system/machines'
import { diffObjUpdate } from '@/utils/diff'
import { IdempotenceModule } from '@/store/modules/idempotence'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Machine',
  components: {
    Pagination,
    PrShell
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5
  }

  private updateDialog: any = {
    loading: false,
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 角色选择参数
    roleSelectOptions: [],
    // 默认数据
    defaultForm: {
      id: 0,
      host: '',
      sshPort: 22,
      loginName: '',
      loginPwd: '',
      osInfo: '',
      kernelInfo: '',
      status: 0,
      remark: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      host: [
        { required: true, message: this.$t('host').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      loginName: [
        { required: true, message: this.$t('login').toString() + this.$t('name').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      loginPwd: [
        { required: true, message: this.$t('login').toString() + this.$t('password').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  private terminalDialog: any = {
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 机器信息
    machine: {
      host: '',
      sshPort: '',
      loginName: '',
      loginPwd: ''
    }
  }

  private table: any = {
    loading: false,
    batchDeleteBtnDisabled: true,
    selection: [],
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      host: '',
      sshPort: '',
      loginName: '',
      loginPwd: '',
      remark: ''
    }
  }

  created() {
    this.resetUpdateForm()
    this.getData()
    IdempotenceModule.RefreshIdempotenceToken()
  }

  private async getData() {
    this.table.loading = true
    try {
      const params: any = {
        ...this.table.form,
        pageNum: this.table.pageNum,
        pageSize: this.table.pageSize
      }
      if (params.status === '') {
        delete params.status
      }
      const { data } = await findMachine(params)
      this.table.list = data.list
      this.table.pageNum = data.pageNum
      this.table.pageSize = data.pageSize
      this.table.total = data.total
    } finally {
      this.table.loading = false
    }
  }

  private async doSearch() {
    this.getData()
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        this.updateDialog.form.sshPort = parseInt(this.updateDialog.form.sshPort)
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createMachine(this.updateDialog.form)
          } finally {
            this.updateDialog.loading = false
            IdempotenceModule.RefreshIdempotenceToken()
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, this.updateDialog.form)
          // 编号存在则更新, 不存在给出提示
          if (!update.id) {
            this.$message({
              type: 'warning',
              message: this.$t('noDiff').toString()
            })
            return
          }
          try {
            this.updateDialog.loading = true
            await updateMachine(update.id, update)
          } finally {
            this.updateDialog.loading = false
          }
        }
        // 关闭弹窗
        this.updateDialog.visible = false
        // 重新查询
        this.getData()
        // 清理字段
        this.resetUpdateForm()
        const message = this.updateDialog.type === 0 ? this.$t('create').toString() : this.$t('update').toString()
        this.$notify({
          title: this.$t('congratulations').toString(),
          message: message + this.$t('success').toString(),
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async doConnect(row: any) {
    try {
      await connectMachine(row.id)
      // 重新查询
      this.getData()
      this.$notify({
        title: this.$t('congratulations').toString(),
        message: `${row.status === 0 ? this.$t('connect').toString() : this.$t('refresh').toString()}${this.$t('success').toString()}`,
        type: 'success',
        duration: 2000
      })
    } finally {
    }
  }

  private resetUpdateForm() {
    this.$nextTick(() => {
      // 重置校验信息
      const form = this.$refs.updateForm as Form
      if (form) {
        form.clearValidate()
      }
    })
    this.updateDialog.form = JSON.parse(JSON.stringify(this.updateDialog.defaultForm))
  }

  private async cancelUpdate() {
    // 关闭弹窗
    this.updateDialog.visible = false
  }

  private async handleCreate() {
    // 之前的类型为更新
    if (this.updateDialog.type === 1) {
      // 清理字段
      this.resetUpdateForm()
    }
    // 修改类型
    this.updateDialog.type = 0
    // 修改标题
    this.updateDialog.title = this.$t('create').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.host = row.host
    this.updateDialog.form.sshPort = row.sshPort
    this.updateDialog.form.loginName = row.loginName
    this.updateDialog.form.loginPwd = row.loginPwd
    this.updateDialog.form.remark = row.remark
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleTerminal(row: any) {
    this.terminalDialog.machine = {
      host: row.host,
      sshPort: row.sshPort,
      loginName: row.loginName,
      loginPwd: row.loginPwd
    }

    this.terminalDialog.title = `${this.$t('terminal').toString()}(${this.$t('host').toString()}: ${row.host}, ${this.$t('machinePage.name').toString()}: ${row.name})`
    this.terminalDialog.visible = true
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const hosts: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      hosts.push(row.host)
    }
    if (ids.length > 0) {
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('machine').toString()}[${hosts.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteMachine(ids.join(','))
          this.getData()
        })
    }
  }

  private resetForm(formName: string) {
    // 重置分页
    this.table.pageNum = this.defaultConfig.pageNum
    this.table.pageSize = this.defaultConfig.pageSize
    // 仅对el-form-item设置prop的字段有效
    // 这种写法可能导致无法正确执行: (this.$refs[formName] as Form).resetFields()
    const form = this.$refs[formName] as Form
    form.resetFields()
    // 重新获取数据
    this.getData()
  }

  private async handleSelectionChange(rows: any) {
    this.table.batchDeleteBtnDisabled = rows.length === 0
    this.table.selection = rows
  }

  private handlePagSizeChange(val: number) {
    this.table.pageSize = val
    this.doSearch()
  }

  private handlePageNumChange(val: number) {
    this.table.pageNum = val
    this.doSearch()
  }
}
</script>
<style lang="scss" scoped>
  .app-container {
    .el-row {
      margin-bottom: 15px;
    }
  }
</style>
