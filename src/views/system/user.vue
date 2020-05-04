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
        label="用户名"
        prop="username"
      >
        <el-input
          v-model="table.form.username"
          placeholder="用户名"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="手机号"
        prop="mobile"
      >
        <el-input
          v-model="table.form.mobile"
          placeholder="手机号"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="昵称"
        prop="nickname"
      >
        <el-input
          v-model="table.form.nickname"
          placeholder="昵称"
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
          v-model="table.form.status"
          clearable
          placeholder="用户状态"
        >
          <el-option
            key="true"
            label="正常"
            :value="true"
          />
          <el-option
            key="false"
            label="禁用"
            :value="false"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建人"
        prop="creator"
      >
        <el-input
          v-model="table.form.creator"
          placeholder="创建人"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
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
          prop="username"
          label="用户名"
          sortable
        />
        <el-table-column
          prop="mobile"
          label="手机号"
          sortable
        />
        <el-table-column
          prop="nickname"
          label="昵称"
        />
        <el-table-column
          prop="status"
          label="状态"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          label="创建人"
        />
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
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

    <!-- 用户配置对话框 -->
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
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="updateDialog.form.username"
            placeholder="请输入用户名(用于登录系统)"
          />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        >
          <el-input
            v-model="updateDialog.form.mobile"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item
          label="昵称"
          prop="nickname"
        >
          <el-input
            v-model="updateDialog.form.nickname"
            placeholder="请输入昵称"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-switch
            v-model="updateDialog.form.status"
            active-text="正常"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="doUpdate"
        >
          确 定
        </el-button>
        <el-button @click="cancelUpdate">
          取 消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { batchDeleteUser, createUser, getUsers, updateUser } from '@/api/users'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'User',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5
  }

  private updateDialog: any = {
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 表单
    form: {
      id: 0,
      username: '',
      mobile: '',
      nickname: '',
      status: true,
      creator: ''
    },
    // 表单校验
    rules: {
      username: [
        { required: true, message: '用户名不能为空', trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: '手机号不能为空', trigger: 'blur' }
      ]
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
      username: '',
      mobile: '',
      nickname: '',
      status: '',
      creator: ''
    }
  }

  created() {
    this.getData()
  }

  private async getData() {
    this.table.loading = true
    const params: any = {
      ...this.table.form,
      pageNum: this.table.pageNum,
      pageSize: this.table.pageSize
    }
    if (params.status === '') {
      delete params.status
    }
    const { data } = await getUsers(params)
    this.table.list = data.list
    this.table.pageNum = data.pageNum
    this.table.pageSize = data.pageSize
    this.table.total = data.total
    this.table.loading = false
  }

  private async doSearch() {
    this.getData()
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        if (this.updateDialog.type === 0) {
          await createUser(this.updateDialog.form)
        } else {
          await updateUser(this.updateDialog.form.id, this.updateDialog.form)
        }
        // 关闭弹窗
        this.updateDialog.visible = false
        // 重新查询
        this.getData()
        // 清理字段
        this.resetUpdateForm()
        this.$notify({
          title: '恭喜',
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}用户成功`,
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async resetUpdateForm() {
    const form = this.$refs.updateForm as Form
    form.resetFields()
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
    this.updateDialog.title = '创建新用户'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.username = row.username
    this.updateDialog.form.mobile = row.mobile
    this.updateDialog.form.nickname = row.nickname
    this.updateDialog.form.status = row.status
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = '修改用户信息'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const usernames: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      usernames.push(row.username)
    }
    if (ids.length > 0) {
      const msg = `确定要删除用户[${usernames.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteUser(ids.join(','))
          this.getData()
        })
    }
  }

  // 改变用户状态
  private async handleStatusChange(row: any) {
    let msg = `确定要恢复用户[${row.username}]吗?`
    if (!row.status) {
      msg = `确定要禁用用户[${row.username}]吗?该操作可能导致该用户无法正常使用系统`
    }
    this.$confirm(msg, '请谨慎操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async() => {
        await updateUser(row.id, {
          status: row.status
        })
        this.getData()
      })
      .catch(() => {
        row.status = !row.status
      })
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
