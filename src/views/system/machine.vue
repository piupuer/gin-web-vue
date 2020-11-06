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
        label="主机地址"
        prop="host"
      >
        <el-input
          v-model.trim="table.form.host"
          placeholder="主机地址"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="登录名"
        prop="loginName"
      >
        <el-input
          v-model.trim="table.form.loginName"
          placeholder="登录名"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model.trim="table.form.status"
          clearable
          placeholder="连接状态"
        >
          <el-option
            key="1"
            label="正常"
            :value="1"
          />
          <el-option
            key="0"
            label="无法连接"
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
          查询
        </el-button>
        <el-button @click="resetForm('searchForm')">
          重置
        </el-button>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
          >
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            :disabled="table.batchDeleteBtnDisabled"
            @click="handleBatchDelete"
          >
            批量删除
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
          label="主机地址"
        />
        <el-table-column
          prop="sshPort"
          label="ssh端口"
          align="center"
        />
        <el-table-column
          prop="loginName"
          label="登录名"
          align="center"
        />
        <el-table-column
          prop="loginPwd"
          label="登录密码"
          align="center"
        />
        <el-table-column
          prop="status"
          label="状态"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status==0?'danger':'success'"
            >
              {{ scope.row.status==0?'无法连接':'正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="version"
          label="操作系统"
          align="center"
        />
        <el-table-column
          prop="arch"
          label="系统架构"
          align="center"
        />
        <el-table-column
          prop="name"
          label="机器名称"
          align="center"
        />
        <el-table-column
          prop="cpu"
          label="CPU"
        />
        <el-table-column
          prop="memory"
          label="内存"
          align="center"
        />
        <el-table-column
          prop="disk"
          label="硬盘"
          align="center"
        />
        <el-table-column
          prop="remark"
          label="备注"
        />
        <el-table-column
          prop="creator"
          label="创建人"
          align="center"
        />
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="320"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="doConnect(scope.row)"
            >
              {{ scope.row.status == 0 ? '连接' : '刷新' }}
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleTerminal(scope.row)"
            >
              终端
            </el-button>
            <el-button
              size="mini"
              @click="handleUpdate(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
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
          label="主机地址"
          prop="host"
        >
          <el-input
            v-model.trim="updateDialog.form.host"
            placeholder="请输入主机地址(可以是IP或域名)"
          />
        </el-form-item>
        <el-form-item
          label="ssh端口"
          prop="sshPort"
        >
          <el-input
            v-model="updateDialog.form.sshPort"
            placeholder="请输入ssh端口号(默认22)"
          />
        </el-form-item>
        <el-form-item
          label="登录名"
          prop="loginName"
        >
          <el-input
            v-model.trim="updateDialog.form.loginName"
            placeholder="请输入登录用户名"
          />
        </el-form-item>
        <el-form-item
          label="登录密码"
          prop="loginPwd"
        >
          <el-input
            v-model.trim="updateDialog.form.loginPwd"
            placeholder="请输入登录密码"
          />
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model.trim="updateDialog.form.remark"
            placeholder="请输入机器备注"
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
          确 定
        </el-button>
        <el-button @click="cancelUpdate">
          取 消
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
import Pagination from '@/components/Pagination/index'
import PrShell from '@/components/Shell/index'
import { Form } from 'element-ui'
import { batchDeleteMachine, createMachine, getMachines, updateMachine, connectMachine } from '@/api/system/machines'
import { diffObjUpdate } from '@/utils/diff'

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
        { required: true, message: '主机地址不能为空', trigger: 'blur' }
      ],
      loginName: [
        { required: true, message: '登录名不能为空', trigger: 'blur' }
      ],
      loginPwd: [
        { required: true, message: '登录密码不能为空', trigger: 'blur' }
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
      const { data } = await getMachines(params)
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
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, this.updateDialog.form)
          // 编号存在则更新, 不存在给出提示
          if (!update.id) {
            this.$message({
              type: 'warning',
              message: '数据没有发生变化, 请重新输入~'
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
        this.$notify({
          title: '恭喜',
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}机器成功`,
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
        title: '恭喜',
        message: `${row.status === 0 ? '连接' : '刷新'}机器状态成功`,
        type: 'success',
        duration: 2000
      })
    } finally {
    }
  }

  private async resetUpdateForm() {
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
    this.updateDialog.title = '创建新机器'
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
    this.updateDialog.title = '修改机器信息'
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

    this.terminalDialog.title = '连接终端(主机地址: ' + row.host + ', 机器名称: ' + row.name + ')'
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
      const msg = `确定要删除机器[${hosts.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
