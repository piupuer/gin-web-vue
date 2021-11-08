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
        :label="$t('name')"
        prop="name"
      >
        <el-input
          v-model.trim="table.form.name"
          :placeholder="$t('pleaseEnter') + $t('name')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('keyword')"
        prop="keyword"
      >
        <el-input
          v-model.trim="table.form.keyword"
          :placeholder="$t('pleaseEnter') + $t('keyword')"
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
            :label="$t('disabled')"
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
          prop="name"
          :label="$t('name')"
          sortable
        />
        <el-table-column
          prop="keyword"
          :label="$t('keyword')"
          sortable
        />
        <el-table-column
          prop="sort"
          :label="$t('sort')"
        />
        <el-table-column
          prop="desc"
          :label="$t('desc')"
        />
        <el-table-column
          prop="status"
          :label="$t('status')"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="220"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="handleRole(scope.row)"
            >
              {{ $t('permission') }}
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
          :label="$t('name')"
          prop="name"
        >
          <el-input
            v-model.trim="updateDialog.form.name"
            :placeholder="$t('pleaseEnter') + $t('name')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('keyword')"
          prop="keyword"
        >
          <el-input
            v-model.trim="updateDialog.form.keyword"
            :placeholder="$t('pleaseEnter') + $t('keyword')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('sort')"
          prop="sort"
        >
          <el-input-number
            v-model="updateDialog.form.sort"
            :min="defaultConfig.miniRoleSort"
            :placeholder="$t('pleaseEnter') + $t('sort')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('status')"
          prop="status"
        >
          <el-switch
            v-model.trim="updateDialog.form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('available')"
            :inactive-text="$t('disabled')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('desc')"
          prop="desc"
        >
          <el-input
            v-model.trim="updateDialog.form.desc"
            type="textarea"
            :placeholder="$t('pleaseEnter') + $t('desc')"
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

    <!-- 权限对话框 -->
    <el-dialog
      :title="roleDialog.title"
      :visible.sync="roleDialog.visible"
      custom-class="role-dialog"
      width="500px"
    >
      <el-tabs v-model.trim="roleDialog.tab.activeName">
        <el-tab-pane
          :label="$t('menu') + $t('permission')"
          name="menu"
        >
          <el-tree
            ref="roleMenuTree"
            :data="roleDialog.tab.menus"
            :props="defaultConfig.roleMenuTreeProps"
            :default-checked-keys="roleDialog.tab.checkedMenus"
            show-checkbox
            node-key="id"
          />
        </el-tab-pane>
        <el-tab-pane
          :label="$t('api') + $t('permission')"
          name="api"
        >
          <el-tree
            ref="roleApiTree"
            :data="roleDialog.tab.apis"
            :props="defaultConfig.roleApiTreeProps"
            :default-checked-keys="roleDialog.tab.checkedApis"
            show-checkbox
            node-key="id"
          />
        </el-tab-pane>
      </el-tabs>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="roleDialog.loading"
          @click="doRoleUpdate"
        >
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="cancelRoleUpdate">
          {{ $t('cancel') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form, Tree } from 'element-ui'
import { batchDeleteRole, createRole, findRole, updateRole } from '@/api/system/roles'
import { findApiGroupByCategoryByRoleId, updateApiByRoleId } from '@/api/system/apis'
import { findMenuByRoleId, updateMenuByRoleId } from '@/api/system/menus'
import { diffArrUpdate, diffObjUpdate } from '@/utils/diff'
import { UserModule } from '@/store/modules/user'
import { IdempotenceModule } from '@/store/modules/idempotence'

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
    pageSize: 5,
    miniRoleSort: 0,
    roleMenuTreeProps: {
      children: 'children',
      label: 'title'
    },
    roleApiTreeProps: {
      children: 'children',
      label: 'title'
    }
  }

  private validateKeyword(rule: any, value: string, callback: Function) {
    if (!/^[a-zA-Z]/.test(value)) {
      callback(new Error(this.$t('formRules.keyword').toString()))
    } else if (!/^[a-zA-Z]([-_a-zA-Z0-9])+$/.test(value)) {
      callback(new Error(this.$t('formRules.specialChar').toString()))
    } else {
      callback()
    }
  }

  private updateDialog: any = {
    loading: false,
    // 类型(0:创建, 1更新)
    type: 0,
    // 是否打开
    visible: false,
    // 标题
    title: '',
    // 默认数据
    defaultForm: {
      id: 0,
      name: '',
      keyword: '',
      sort: 0,
      status: 1,
      desc: ''
    },
    // 表单
    form: {},
    // 旧数据
    oldData: {},
    // 表单校验
    rules: {
      name: [
        { required: true, message: this.$t('name').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      keyword: [
        { required: true, message: this.$t('keyword').toString() + this.$t('required').toString(), trigger: 'blur' },
        { validator: this.validateKeyword, trigger: 'blur' }
      ],
      sort: [
        { required: true, message: this.$t('sort').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  private roleDialog: any = {
    loading: false,
    title: this.$t('update').toString() + this.$t('permission').toString(),
    // 是否打开
    visible: false,
    // 当前角色编号
    roleId: 0,
    // 标签页
    tab: {
      activeName: 'menu',
      // 权限菜单集合
      menus: [],
      checkedMenus: [],
      // 权限api集合
      apis: [],
      checkedApis: []
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
    this.resetUpdateForm()
    this.defaultConfig.miniRoleSort = UserModule.roleSort
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
      const { data } = await findRole(params)
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
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createRole(this.updateDialog.form)
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
            await updateRole(update.id, update)
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

  private async doRoleUpdate() {
    if (this.roleDialog.tab.activeName === 'menu') {
      await this.doRoleMenuUpdate()
    } else if (this.roleDialog.tab.activeName === 'api') {
      await this.doRoleApiUpdate()
    }
  }

  private async doRoleMenuUpdate() {
    const newMenus = (this.$refs.roleMenuTree as Tree).getCheckedKeys()
    const diff = diffArrUpdate(this.roleDialog.tab.checkedMenus, newMenus)
    if (diff.create.length === 0 && diff.update.length === 0 && diff.delete.length === 0) {
      this.$message({
        type: 'warning',
        message: this.$t('noDiff').toString()
      })
      return
    }
    try {
      this.roleDialog.loading = true
      await updateMenuByRoleId(this.roleDialog.roleId, diff)
    } finally {
      this.roleDialog.loading = false
    }
    // 关闭弹窗
    this.roleDialog.visible = false
    // 重新查询
    this.getData()
  }

  private async doRoleApiUpdate() {
    const checkedApis = (this.$refs.roleApiTree as Tree).getCheckedKeys()
    const newApis: any[] = []
    // 由于根目录为空, 需要去除无效元素
    for (let i = 0, len = checkedApis.length; i < len; i++) {
      const api = checkedApis[i]
      if (api) {
        newApis.push(api)
      }
    }
    const diff = diffArrUpdate(this.roleDialog.tab.checkedApis, newApis)
    if (diff.create.length === 0 && diff.update.length === 0 && diff.delete.length === 0) {
      this.$message({
        type: 'warning',
        message: this.$t('noDiff').toString()
      })
      return
    }
    try {
      this.roleDialog.loading = true
      await updateApiByRoleId(this.roleDialog.roleId, diff)
    } finally {
      this.roleDialog.loading = false
    }
    // 关闭弹窗
    this.roleDialog.visible = false
    // 重新查询
    this.getData()
  }

  private async cancelUpdate() {
    // 关闭弹窗
    this.updateDialog.visible = false
  }

  private async cancelRoleUpdate() {
    // 关闭弹窗
    this.roleDialog.visible = false
    this.roleDialog.roleId = 0
    this.roleDialog.tab.activeName = 'menu'
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
    this.updateDialog.form.name = row.name
    this.updateDialog.form.keyword = row.keyword
    this.updateDialog.form.sort = row.sort
    this.updateDialog.form.status = row.status
    this.updateDialog.form.desc = row.desc
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleRole(row: any) {
    // 刷新权限菜单
    const { data: data1 } = await findMenuByRoleId(row.id)
    const { data: data2 } = await findApiGroupByCategoryByRoleId(row.id)
    this.roleDialog.tab.menus = data1.list
    this.roleDialog.tab.checkedMenus = data1.accessIds
    this.roleDialog.tab.oldCheckedMenus = data1.accessIds
    // 刷新权限接口
    this.roleDialog.tab.apis = data2.list
    this.roleDialog.tab.checkedApis = data2.accessIds
    this.roleDialog.tab.oldCheckedApis = data2.accessIds
    // 记录当前权限编号
    this.roleDialog.roleId = row.id
    // 打开弹窗
    this.roleDialog.visible = true
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
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('role').toString()}[${names.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
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
    let msg = `${this.$t('sureToDo').toString()}${this.$t('recovery').toString()}[${row.name}]?`
    if (row.status === 0) {
      msg = `${this.$t('sureToDo').toString()}${this.$t('disabled').toString()}[${row.name}]?`
    }
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await updateRole(row.id, {
          status: row.status
        })
        this.getData()
      })
      .catch(() => {
        row.status = row.status === 0 ? 1 : 0
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
<style lang="scss">
  .role-dialog > .el-dialog__body {
    padding: 0 20px 30px;
  }
</style>
