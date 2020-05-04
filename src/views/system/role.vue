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
        label="角色名称"
        prop="name"
      >
        <el-input
          v-model="table.form.name"
          placeholder="角色名称"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="关键字"
        prop="keyword"
      >
        <el-input
          v-model="table.form.keyword"
          placeholder="关键字"
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
          placeholder="角色状态"
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
          prop="name"
          label="名称"
          sortable
        />
        <el-table-column
          prop="keyword"
          label="关键字"
          sortable
        />
        <el-table-column
          prop="desc"
          label="说明"
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

    <!-- 角色配置对话框 -->
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
          label="角色名称"
          prop="name"
        >
          <el-input
            v-model="updateDialog.form.name"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item
          label="关键字"
          prop="keyword"
        >
          <el-input
            v-model="updateDialog.form.keyword"
            placeholder="请输入关键字"
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
        <el-form-item
          label="说明"
          prop="desc"
        >
          <el-input
            v-model="updateDialog.form.desc"
            type="textarea"
            placeholder="请输入内容"
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
import { batchDeleteRole, createRole, getRoles, updateRole } from '@/api/system/roles'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Role',
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
      name: '',
      keyword: '',
      status: true,
      desc: ''
    },
    // 表单校验
    rules: {
      name: [
        { required: true, message: '角色名称不能为空', trigger: 'blur' }
      ],
      keyword: [
        { required: true, message: '关键字不能为空', trigger: 'blur' }
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
      name: '',
      keyword: '',
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
    const { data } = await getRoles(params)
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
          await createRole(this.updateDialog.form)
        } else {
          await updateRole(this.updateDialog.form.id, this.updateDialog.form)
        }
        // 关闭弹窗
        this.updateDialog.visible = false
        // 重新查询
        this.getData()
        // 清理字段
        this.resetUpdateForm()
        this.$notify({
          title: '恭喜',
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}角色成功`,
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
    this.updateDialog.title = '创建新角色'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.name = row.name
    this.updateDialog.form.keyword = row.keyword
    this.updateDialog.form.status = row.status
    this.updateDialog.form.desc = row.desc
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = '修改角色信息'
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
    const names: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      names.push(row.name)
    }
    if (ids.length > 0) {
      const msg = `确定要删除角色[${names.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteRole(ids.join(','))
          this.getData()
        })
    }
  }

  // 改变角色状态
  private async handleStatusChange(row: any) {
    let msg = `确定要恢复角色[${row.name}]吗?`
    if (!row.status) {
      msg = `确定要禁用角色[${row.name}]吗?该操作可能导致属于该角色的所有用户无法正常使用系统`
    }
    this.$confirm(msg, '请谨慎操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async() => {
        await updateRole(row.id, {
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
