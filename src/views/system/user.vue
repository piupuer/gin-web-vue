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
        :label="$t('username')"
        prop="username"
      >
        <el-input
          v-model.trim="table.form.username"
          :placeholder="$t('pleaseEnter') + $t('username')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('mobile')"
        prop="mobile"
      >
        <el-input
          v-model.trim="table.form.mobile"
          :placeholder="$t('pleaseEnter') + $t('mobile')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('nickname')"
        prop="nickname"
      >
        <el-input
          v-model.trim="table.form.nickname"
          :placeholder="$t('pleaseEnter') + $t('nickname')"
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
      <el-form-item
        :label="$t('locked')"
        prop="status"
      >
        <el-select
          v-model.trim="table.form.locked"
          clearable
          :placeholder="$t('pleaseEnter') + $t('locked')"
        >
          <el-option
            key="1"
            :label="$t('locked')"
            :value="1"
          />
          <el-option
            key="0"
            :label="$t('unlock')"
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
          prop="username"
          :label="$t('username')"
          sortable
        />
        <el-table-column
          prop="mobile"
          :label="$t('mobile')"
          sortable
        />
        <el-table-column
          prop="nickname"
          :label="$t('nickname')"
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
          prop="locked"
          :label="$t('locked')"
        >
          <template slot-scope="scope">
            <el-switch
              v-model.trim="scope.row.locked"
              :active-value="1"
              :inactive-value="0"
              @change="handleLockedChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="180"
        >
          <template slot-scope="scope">
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
          :label="$t('username')"
          prop="username"
        >
          <el-input
            v-model.trim="updateDialog.form.username"
            :placeholder="$t('pleaseEnter') + $t('username')"
          />
        </el-form-item>
        <el-form-item
          v-if="updateDialog.type===0"
          :label="$t('initPassword')"
          prop="initPassword"
        >
          <el-input
            v-model.trim="updateDialog.form.initPassword"
            :placeholder="$t('pleaseEnter') + $t('initPassword')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('mobile')"
          prop="mobile"
        >
          <el-input
            v-model.trim="updateDialog.form.mobile"
            :placeholder="$t('pleaseEnter') + $t('mobile')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('role')"
          prop="roleId"
        >
          <el-select
            v-model.trim="updateDialog.form.roleId"
            clearable
            filterable
            :placeholder="$t('pleaseEnter') + $t('role')"
          >
            <el-option
              v-for="item in updateDialog.roleSelectOptions"
              :key="item.id"
              :label="item.name + '(' + item.desc + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="updateDialog.type===1"
          :label="$t('newPassword')"
          prop="newPassword"
        >
          <el-input
            v-model.trim="updateDialog.form.newPassword"
            :placeholder="$t('pleaseEnter') + $t('newPassword')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('nickname')"
          prop="nickname"
        >
          <el-input
            v-model.trim="updateDialog.form.nickname"
            :placeholder="$t('pleaseEnter') + $t('nickname')"
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
          :label="$t('locked')"
          prop="status"
        >
          <el-switch
            v-model.trim="updateDialog.form.locked"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('locked')"
            :inactive-text="$t('unlock')"
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
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { batchDeleteUser, createUser, findUser, updateUser } from '@/api/system/users'
import { diffObjUpdate } from '@/utils/diff'
import { findRole } from '@/api/system/roles'
import { IdempotenceModule } from '@/store/modules/idempotence'

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

  private validateUsername(rule: any, value: string, callback: Function) {
    if (!/^[a-zA-Z]/.test(value)) {
      callback(new Error(this.$t('userPage.validate[0]').toString()))
    } else if (!/^[a-zA-Z]([-_a-zA-Z0-9])+$/.test(value)) {
      callback(new Error(this.$t('userPage.validate[1]').toString()))
    } else {
      callback()
    }
  }

  private validateMobile(rule: any, value: string, callback: Function) {
    if (!/^[1-9]([0-9]{10})+$/.test(value)) {
      callback(new Error(this.$t('userPage.validate[2]').toString()))
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
    // 角色选择参数
    roleSelectOptions: [],
    // 默认数据
    defaultForm: {
      id: 0,
      username: '',
      initPassword: '',
      newPassword: '',
      mobile: '',
      nickname: '',
      status: 1,
      locked: 0,
      creator: '',
      roleId: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      username: [
        { required: true, message: this.$t('username').toString() + this.$t('required').toString(), trigger: 'blur' },
        { min: 4, message: this.$t('userPage.validate[3]').toString(), trigger: 'blur' },
        { max: 20, message: this.$t('userPage.validate[4]').toString(), trigger: 'blur' },
        { validator: this.validateUsername, trigger: 'blur' }
      ],
      initPassword: [
        { required: true, message: this.$t('initPassword').toString() + this.$t('required').toString(), trigger: 'blur' },
        { min: 6, message: this.$t('userPage.validate[5]').toString(), trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: this.$t('mobile').toString() + this.$t('required').toString(), trigger: 'blur' },
        { validator: this.validateMobile, trigger: 'blur' }
      ],
      roleId: [
        { required: true, message: this.$t('roleId').toString(), trigger: 'blur' }
      ],
      newPassword: [
        { min: 6, message: this.$t('userPage.validate[6]').toString(), trigger: 'blur' }
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
      locked: '',
      creator: ''
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
      const { data } = await findUser(params)
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
            await createUser(this.updateDialog.form)
          } finally {
            this.updateDialog.loading = false
            // 刷新token
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
            await updateUser(update.id, update)
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
    try {
      // 读取所有角色
      const { data } = await findRole({
        noPagination: true
      })
      this.updateDialog.roleSelectOptions = data.list
    } catch (e) {
      this.$message.error(this.$t('readDataFail').toString())
      return
    }
    // 修改类型
    this.updateDialog.type = 0
    // 修改标题
    this.updateDialog.title = this.$t('create').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    try {
      // 读取当前角色
      const { data } = await findRole({
        noPagination: true
      })
      this.updateDialog.roleSelectOptions = data.list
    } catch (e) {
      this.$message.error(this.$t('readDataFail').toString())
      return
    }
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.username = row.username
    this.updateDialog.form.mobile = row.mobile
    this.updateDialog.form.nickname = row.nickname
    this.updateDialog.form.status = row.status
    this.updateDialog.form.locked = row.locked
    this.updateDialog.form.roleId = row.roleId
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
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
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('user').toString()}[${usernames.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
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
    let msg = `${this.$t('sureToDo').toString()}${this.$t('recovery').toString()}[${row.username}]?`
    if (row.status === 0) {
      msg = `${this.$t('sureToDo').toString()}${this.$t('disabled').toString()}[${row.username}]?`
    }
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await updateUser(row.id, {
          status: row.status
        })
        this.getData()
      })
      .catch(() => {
        row.status = row.status === 0 ? 1 : 0
      })
  }

  private async handleLockedChange(row: any) {
    let msg = `${this.$t('sureToDo').toString()}${this.$t('locked').toString()}[${row.username}]?`
    if (row.locked === 0) {
      msg = `${this.$t('sureToDo').toString()}${this.$t('unlock').toString()}[${row.username}]?`
    }
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await updateUser(row.id, {
          locked: row.locked
        })
        this.getData()
      })
      .catch(() => {
        row.locked = row.locked === 0 ? 1 : 0
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
