<template>
  <div class="app-container">
    <el-form
      ref="searchForm"
      v-loading="table.loading"
      :inline="true"
      :model="table.form"
      :rules="table.rules"
      class="demo-form-inline"
    >
      <el-form-item
        label="分类"
        prop="category"
      >
        <el-input
          v-model.number="table.form.category"
          placeholder="分类"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model.trim="table.form.name"
          placeholder="名称"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
      <el-form-item
        label="提交人确认"
        prop="submitUserConfirm"
      >
        <el-select
          v-model.trim="table.form.submitterConfirm"
          clearable
          placeholder="提交人确认"
        >
          <el-option
            key="1"
            label="是"
            :value="1"
          />
          <el-option
            key="0"
            label="否"
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
          prop="category"
          label="分类"
          sortable
        >
          <template slot-scope="scope">
            <el-tag>
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称"
          sortable
        />
        <el-table-column
          prop="submitterName"
          label="提交人"
        />
        <el-table-column
          prop="submitterEditFields"
          label="提交可编辑字段"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.submitterEditFields === ''"
            >
              {{ '无限制' }}
            </el-tag>
            <el-tag
              v-else
            >
              {{ scope.row.submitterEditFields }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitterConfirm"
          label="需要提交人确认"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.submitterConfirm === 1"
            >
              {{ '是' }}
            </el-tag>
            <el-tag
              v-else
              type="danger"
            >
              {{ '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitterConfirmEditFields"
          label="确认可编辑字段"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.submitterConfirmEditFields === ''"
            >
              {{ '无限制' }}
            </el-tag>
            <el-tag
              v-else
            >
              {{ scope.row.submitterConfirmEditFields }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          align="center"
          width="240"
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

    <!-- 更新对话框 -->
    <el-dialog
      :title="updateDialog.title"
      :visible.sync="updateDialog.visible"
      width="500px"
    >
      <el-form
        ref="updateForm"
        :model="updateDialog.form"
        :rules="updateDialog.rules"
        label-width="100px"
      >
        <el-form-item
          label="唯一分类"
          prop="category"
        >
          <el-input
            v-model.number="updateDialog.form.category"
            placeholder="请输入分类(一个分类对应一个流程)"
          />
        </el-form-item>
        <el-form-item
          label="名称"
          prop="name"
        >
          <el-input
            v-model.trim="updateDialog.form.name"
            placeholder="请输入状态机名称"
          />
        </el-form-item>
        <el-form-item
          label="提交人名称"
          prop="submitterName"
        >
          <el-input
            v-model.trim="updateDialog.form.submitterName"
            placeholder="请输入提交人名称(审批日志显示用)"
          />
        </el-form-item>
        <el-form-item
          label="提交编辑字段"
          prop="submitterEditFields"
        >
          <el-tag
            v-for="item in updateDialog.form.submitterEditFields"
            :key="item"
            closable
            :disable-transitions="false"
            @close="handleSubmitterEditFieldsClose(item)"
          >
            {{ item }}
          </el-tag>
          <el-input
            v-if="updateDialog.form.submitterEditFieldsVisible"
            ref="submitterEditFieldsInput"
            v-model.trim="updateDialog.form.submitterEditFieldsInput"
            class="el-tag-plus-input"
            @keyup.enter.native="handleSubmitterEditFieldsInputConfirm"
            @blur="handleSubmitterEditFieldsInputConfirm"
          />
          <el-button
            class="el-tag-plus-btn"
            @click="showSubmitterEditFieldsInput"
          >
            +
          </el-button>
        </el-form-item>
        <el-form-item
          label="提交人确认"
          prop="submitterConfirm"
        >
          <el-switch
            v-model.trim="updateDialog.form.submitterConfirm"
            :active-value="1"
            :inactive-value="0"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item
          v-if="updateDialog.form.submitterConfirm === 1"
          label="确认编辑字段"
          prop="submitterConfirmEditFields"
        >
          <el-tag
            v-for="item in updateDialog.form.submitterConfirmEditFields"
            :key="item"
            closable
            :disable-transitions="false"
            @close="handleSubmitterConfirmEditFieldsClose(item)"
          >
            {{ item }}
          </el-tag>
          <el-input
            v-if="updateDialog.form.submitterConfirmEditFieldsVisible"
            ref="submitterConfirmEditFieldsInput"
            v-model.trim="updateDialog.form.submitterConfirmEditFieldsInput"
            class="el-tag-plus-input"
            @keyup.enter.native="handleSubmitterConfirmEditFieldsInputConfirm"
            @blur="handleSubmitterConfirmEditFieldsInputConfirm"
          />
          <el-button
            class="el-tag-plus-btn"
            @click="showSubmitterConfirmEditFieldsInput"
          >
            +
          </el-button>
        </el-form-item>
        <!-- 审批层级 -->
        <el-form
          v-for="(level, index) in updateDialog.form.levels"
          ref="levelForm"
          :key="index"
          :data-ref="'levelForm' + index"
          class="level-form"
          :rules="updateDialog.levelRules"
          label-width="80px"
          :model="level"
        >
          <div class="level-form-title">
            <span>第{{ index + 1 }}级审批：</span>
            <i
              class="el-icon-delete level-form-delete"
              @click="levelDelete(index)"
            />
          </div>

          <el-form-item
            label="名称"
            prop="name"
          >
            <el-input
              v-model.trim="level.name"
              placeholder="请输入当前审批层级名称"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="角色"
            prop="roles"
          >
            <el-tag
              v-for="item in level.roles"
              :key="item.id"
              closable
              :disable-transitions="false"
              @close="handleLevelRolesClose(index, item)"
            >
              {{ item.keyword + '(' + item.name + ')' }}
            </el-tag>
            <el-autocomplete
              v-if="level.rolesVisible"
              :ref="level.rolesRef"
              v-model.trim="level.rolesInput"
              value-key="keyword"
              :fetch-suggestions="findRole"
              class="el-tag-plus-input"
              @select="(item) => handleLevelRolesSelect(index, item)"
            />
            <el-button
              class="el-tag-plus-btn"
              @click="showLevelRolesInput(index)"
            >
              +
            </el-button>
          </el-form-item>
          <el-form-item
            label="用户"
            prop="users"
          >
            <el-tag
              v-for="item in level.users"
              :key="item.id"
              closable
              :disable-transitions="false"
              @close="handleLevelUsersClose(index, item)"
            >
              {{ item.username + '(' + item.mobile + ')' }}
            </el-tag>
            <el-autocomplete
              v-if="level.usersVisible"
              :ref="level.usersRef"
              v-model.trim="level.usersInput"
              value-key="username"
              :fetch-suggestions="findUser"
              class="el-tag-plus-input"
              @select="(item) => handleLevelUsersSelect(index, item)"
            />
            <el-button
              class="el-tag-plus-btn"
              @click="showLevelUsersInput(index)"
            >
              +
            </el-button>
          </el-form-item>
          <el-form-item
            label="编辑权限"
            prop="edit"
          >
            <el-switch
              v-model.trim="level.edit"
              :active-value="1"
              :inactive-value="0"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          <el-form-item
            v-if="level.edit === 1"
            label="编辑字段"
            prop="editFields"
          >
            <el-tag
              v-for="item in level.editFields"
              :key="item"
              closable
              :disable-transitions="false"
              @close="handleLevelEditFieldsClose(index, item)"
            >
              {{ item }}
            </el-tag>
            <el-input
              v-if="level.editFieldsVisible"
              :ref="level.editFieldsRef"
              v-model.trim="level.editFieldsInput"
              class="el-tag-plus-input"
              @keyup.enter.native="handleLevelEditFieldsInputConfirm(index)"
              @blur="handleLevelEditFieldsInputConfirm(index)"
            />
            <el-button
              class="el-tag-plus-btn"
              @click="showLevelEditFieldsInput(index)"
            >
              +
            </el-button>
          </el-form-item>
          <el-form-item
            label="拒绝权限"
            prop="refuse"
          >
            <el-switch
              v-model.trim="level.refuse"
              :active-value="1"
              :inactive-value="0"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
        </el-form>
        <div
          class="level-form-plus-box"
          title="新增审批层级"
        >
          <i
            class="el-icon-circle-plus-outline level-form-plus"
            @click="levelCreate"
          />
        </div>
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
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form, Input } from 'element-ui'
import { diffObjUpdate } from '@/utils/diff'
import { findRole, findRoleByIds } from '@/api/system/roles'
import { findUser, findUserByIds } from '@/api/system/users'
import { IdempotenceModule } from '@/store/modules/idempotence'
import { batchDeleteFsm, createFsm, findFsm, updateFsm } from '@/api/system/fsm'

@Component({
  name: 'Fsm',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    level: {
      name: '',
      edit: 1,
      editFields: [],
      editFieldsVisible: false,
      editFieldsInput: '',
      editFieldsRef: 'editFieldsRef',
      refuse: 1,
      roles: [],
      rolesVisible: false,
      rolesInput: '',
      rolesRef: 'rolesRef',
      users: [],
      usersVisible: false,
      usersInput: '',
      usersRef: 'usersRef'
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
    roleLoading: false,
    userLoading: false,
    // 默认数据
    defaultForm: {
      id: 0,
      category: '',
      name: '',
      submitterName: '',
      submitterEditFields: [],
      submitterEditFieldsInput: '',
      submitterEditFieldsVisible: false,
      submitterConfirm: 0,
      submitterConfirmEditFields: [],
      submitterConfirmEditFieldsInput: '',
      submitterConfirmEditFieldsVisible: false,
      levels: []
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      category: [
        { required: true, type: 'number', message: '分类必须为数字', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '状态机名称不能为空', trigger: 'blur' }
      ],
      submitterName: [
        { required: true, message: '提交人名称不能为空', trigger: 'blur' }
      ]
    },
    levelRules: {
      name: [
        { required: true, message: '层级名称不能为空(尽量简单通俗易懂)', trigger: 'blur' }
      ],
      roles: [
        { validator: this.levelRoleOrUserValidate, trigger: 'blur' }
      ],
      users: [
        { validator: this.levelRoleOrUserValidate, trigger: 'blur' }
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
      category: '',
      submitterConfirm: ''
    },
    rules: {
      category: [
        { validator: this.searchCategoryValidate, trigger: 'blur' }
      ]
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
      if (params.category === '') {
        delete params.category
      }
      if (params.submitterConfirm === '') {
        delete params.submitterConfirm
      }
      const { data } = await findFsm(params)
      this.table.list = data.list
      this.table.pageNum = data.pageNum
      this.table.pageSize = data.pageSize
      this.table.total = data.total
    } finally {
      // 不管是否异常自动停止loading
      this.table.loading = false
    }
  }

  private doSearch() {
    (this.$refs.searchForm as Form).validate(async(valid) => {
      if (valid) {
        this.getData()
      }
    })
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      // validate all levelForm
      const forms = this.$refs.levelForm as Form[]
      // roles/users单独校验
      for (let i = 0; i < forms.length; i++) {
        if (this.updateDialog.form.levels[i].roles.length === 0 && this.updateDialog.form.levels[i].users.length === 0) {
          forms[i].validate()
          return
        }
      }
      if (valid) {
        const data = this.encodeData(this.updateDialog.form)
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createFsm(data)
          } finally {
            this.updateDialog.loading = false
            IdempotenceModule.RefreshIdempotenceToken()
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, data)
          if (!update.id) {
            this.$message({
              type: 'warning',
              message: '数据没有发生变化, 请重新输入~'
            })
            return
          }
          // 层级不需要增量更新
          update.levels = data.levels
          try {
            this.updateDialog.loading = true
            await updateFsm(update.id, update)
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
          message: `${this.updateDialog.type === 0 ? '创建' : '更新'}流程成功`,
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private encodeData(row: any) {
    const data: any = {
      id: row.id,
      name: row.name,
      submitterName: row.submitterName,
      submitterEditFields: '',
      submitterConfirm: row.submitterConfirm,
      submitterConfirmEditFields: ''
    }
    if (row.submitterEditFields.length > 0) {
      data.submitterEditFields = row.submitterEditFields.join(',')
    }
    if (row.submitterConfirmEditFields.length > 0) {
      data.submitterConfirmEditFields = row.submitterConfirmEditFields.join(',')
    }
    const levels: any = []
    for (let i = 0; i < row.levels.length; i++) {
      const level: any = {
        name: row.levels[i].name,
        edit: row.levels[i].edit,
        editFields: '',
        refuse: row.levels[i].refuse,
        roles: '',
        users: ''
      }
      if (row.levels[i].editFields.length > 0) {
        level.editFields = row.levels[i].editFields.join(',')
      }
      if (row.levels[i].roles.length > 0) {
        const ids = []
        for (let j = 0; j < row.levels[i].roles.length; j++) {
          ids.push(row.levels[i].roles[j].id)
        }
        level.roles = ids.join(',')
      }
      if (row.levels[i].users.length > 0) {
        const ids = []
        for (let j = 0; j < row.levels[i].users.length; j++) {
          ids.push(row.levels[i].users[j].id)
        }
        level.users = ids.join(',')
      }
      levels.push(level)
    }
    data.levels = levels
    return data
  }

  private cancelUpdate() {
    // 关闭弹窗
    this.updateDialog.visible = false
  }

  private handleCreate() {
    // 之前的类型为更新
    if (this.updateDialog.type === 1) {
      // 清理字段
      this.resetUpdateForm()
    }
    // 修改类型
    this.updateDialog.type = 0
    // 修改标题
    this.updateDialog.title = '创建新状态机'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // save old row
    const oldRow = JSON.parse(JSON.stringify(row))
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.name = row.name
    this.updateDialog.form.submitterName = row.submitterName
    this.updateDialog.form.submitterEditFields = []
    if (row.submitterEditFields !== '') {
      this.updateDialog.form.submitterEditFields = row.submitterEditFields.split(',')
      oldRow.submitterEditFields = row.submitterEditFields.split(',')
    }
    this.updateDialog.form.submitterConfirm = row.submitterConfirm
    this.updateDialog.form.submitterConfirmEditFields = []
    if (row.submitterConfirmEditFields !== '') {
      this.updateDialog.form.submitterConfirmEditFields = row.submitterConfirmEditFields.split(',')
      oldRow.submitterConfirmEditFields = row.submitterConfirmEditFields.split(',')
    }
    let levels: any = []
    let roles: any = []
    let users: any = []
    if (row.eventsJson !== '') {
      levels = JSON.parse(row.eventsJson)
      oldRow.levels = JSON.parse(row.eventsJson)
      for (let i = 0; i < levels.length; i++) {
        levels[i].editFieldsVisible = this.defaultConfig.level.editFieldsVisible
        levels[i].editFieldsInput = this.defaultConfig.level.editFieldsInput
        levels[i].editFieldsRef = this.defaultConfig.level.editFieldsInput + i
        levels[i].rolesVisible = this.defaultConfig.level.rolesVisible
        levels[i].rolesInput = this.defaultConfig.level.rolesInput
        levels[i].rolesRef = this.defaultConfig.level.rolesInput + i
        levels[i].usersVisible = this.defaultConfig.level.usersVisible
        levels[i].usersInput = this.defaultConfig.level.usersInput
        levels[i].usersRef = this.defaultConfig.level.usersInput + i
        if (levels[i].editFields !== '') {
          levels[i].editFields = levels[i].editFields.split(',')
          oldRow.levels[i].editFields = levels[i].editFields
        } else {
          levels[i].editFields = []
        }
        if (levels[i].roles !== '') {
          levels[i].roles = levels[i].roles.split(',')
          roles = roles.concat(levels[i].roles)
        } else {
          levels[i].roles = []
        }
        if (levels[i].users !== '') {
          levels[i].users = levels[i].users.split(',')
          users = users.concat(levels[i].users)
        } else {
          levels[i].users = []
        }
      }
      if (roles.length > 0) {
        const { data } = await findRoleByIds(roles.join(','))
        for (let i = 0; i < levels.length; i++) {
          const levelRoles = []
          for (let j = 0; j < data.length; j++) {
            for (let k = 0; k < levels[i].roles.length; k++) {
              if (data[j].id.toString() === levels[i].roles[k]) {
                levelRoles.push(data[j])
                break
              }
            }
          }
          levels[i].roles = levelRoles
        }
      }
      if (users.length > 0) {
        const { data } = await findUserByIds(users.join(','))
        for (let i = 0; i < levels.length; i++) {
          const levelUsers = []
          for (let j = 0; j < data.length; j++) {
            for (let k = 0; k < levels[i].users.length; k++) {
              if (data[j].id.toString() === levels[i].users[k]) {
                levelUsers.push(data[j])
                break
              }
            }
          }
          levels[i].users = levelUsers
        }
      }
    }

    this.updateDialog.form.levels = levels
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(await this.encodeData(oldRow)))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = '修改状态机'
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async findRole(query: string, cb: Function) {
    if (query !== '') {
      this.updateDialog.roleLoading = true
      try {
        const { data } = await findRole({
          keyword: query
        })
        cb(data.list)
      } catch (e) {
        console.warn(e)
        this.$message.error('读取系统角色信息失败')
        return
      } finally {
        this.updateDialog.roleLoading = false
      }
    }
  }

  private handleLevelRolesSelect(index: number, item: any) {
    if (item) {
      for (let i = 0; i < this.updateDialog.form.levels[index].roles.length; i++) {
        if (item.id === this.updateDialog.form.levels[index].roles[i].id) {
          this.$message({
            type: 'warning',
            message: `角色${item.keyword}已存在, 请重新输入~`
          })
          this.updateDialog.form.levels[index].rolesVisible = false
          this.updateDialog.form.levels[index].rolesInput = ''
          return
        }
      }
      this.updateDialog.form.levels[index].roles.push(item)
    }
    this.updateDialog.form.levels[index].rolesVisible = false
    this.updateDialog.form.levels[index].rolesInput = ''
    this.clearValidate()
  }

  private async findUser(query: string, cb: Function) {
    if (query !== '') {
      this.table.userLoading = true
      try {
        const { data } = await findUser({
          username: query
        })
        cb(data.list)
      } catch (e) {
        console.warn(e)
        this.$message.error('读取系统用户信息失败')
        return
      } finally {
        this.table.userLoading = false
      }
    }
  }

  private clearValidate() {
    this.$nextTick(() => {
      const form = this.$refs.updateForm as Form
      if (form) {
        form.clearValidate()
      }
      const forms = this.$refs.levelForm as Form[]
      if (forms) {
        for (let i = 0; i < forms.length; i++) {
          if (form) {
            forms[i].clearValidate()
          }
        }
      }
    })
  }

  private resetUpdateForm() {
    this.clearValidate()
    this.updateDialog.form = JSON.parse(JSON.stringify(this.updateDialog.defaultForm))
  }

  private handleLevelUsersSelect(index: number, item: any) {
    if (item) {
      for (let i = 0; i < this.updateDialog.form.levels[index].users.length; i++) {
        if (item.id === this.updateDialog.form.levels[index].users[i].id) {
          this.$message({
            type: 'warning',
            message: `用户${item.username}已存在, 请重新输入~`
          })
          this.updateDialog.form.levels[index].usersVisible = false
          this.updateDialog.form.levels[index].usersInput = ''
          return
        }
      }
      this.updateDialog.form.levels[index].users.push(item)
    }
    this.updateDialog.form.levels[index].usersVisible = false
    this.updateDialog.form.levels[index].usersInput = ''
    this.clearValidate()
  }

  private levelCreate() {
    this.updateDialog.form.levels.push(JSON.parse(JSON.stringify({
      ...this.defaultConfig.level,
      editFieldsRef: this.defaultConfig.level.editFieldsRef + this.updateDialog.form.levels.length,
      rolesRef: this.defaultConfig.level.rolesRef + this.updateDialog.form.levels.length,
      usersRef: this.defaultConfig.level.usersRef + this.updateDialog.form.levels.length
    })))
  }

  private levelDelete(index: number) {
    this.updateDialog.form.levels.splice(index, 1)
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private batchDelete(rows: any) {
    const ids: number[] = []
    const names: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      names.push(row.name)
    }
    if (ids.length > 0) {
      const msg = `确定要删除状态机[${names.join(',')}]吗, 此操作不可逆?`
      this.$confirm(msg, '请谨慎操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteFsm(ids.join(','))
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

  private handleSubmitterEditFieldsClose(tag: any) {
    this.updateDialog.form.submitterEditFields.splice(this.updateDialog.form.submitterEditFields.indexOf(tag), 1)
    this.clearValidate()
  }

  private showSubmitterEditFieldsInput() {
    this.updateDialog.form.submitterEditFieldsVisible = true
    this.$nextTick(() => {
      const input = this.$refs.submitterEditFieldsInput as Input
      input.focus()
    })
    this.clearValidate()
  }

  private handleSubmitterEditFieldsInputConfirm() {
    const v = this.updateDialog.form.submitterEditFieldsInput
    if (v) {
      for (let i = 0; i < this.updateDialog.form.submitterEditFields.length; i++) {
        if (v === this.updateDialog.form.submitterEditFields[i]) {
          this.$message({
            type: 'warning',
            message: `标签${v}已存在, 请重新输入~`
          })
          this.updateDialog.form.submitterEditFieldsVisible = false
          this.updateDialog.form.submitterEditFieldsInput = ''
          return
        }
      }
      this.updateDialog.form.submitterEditFields.push(v)
    }
    this.updateDialog.form.submitterEditFieldsVisible = false
    this.updateDialog.form.submitterEditFieldsInput = ''
    this.clearValidate()
  }

  private handleSubmitterConfirmEditFieldsClose(tag: any) {
    this.updateDialog.form.submitterConfirmEditFields.splice(this.updateDialog.form.submitterConfirmEditFields.indexOf(tag), 1)
    this.clearValidate()
  }

  private showSubmitterConfirmEditFieldsInput() {
    this.updateDialog.form.submitterConfirmEditFieldsVisible = true
    this.$nextTick(() => {
      const input = this.$refs.submitterConfirmEditFieldsInput as Input
      input.focus()
    })
    this.clearValidate()
  }

  private handleSubmitterConfirmEditFieldsInputConfirm() {
    const v = this.updateDialog.form.submitterConfirmEditFieldsInput
    if (v) {
      for (let i = 0; i < this.updateDialog.form.submitterConfirmEditFields.length; i++) {
        if (v === this.updateDialog.form.submitterConfirmEditFields[i]) {
          this.$message({
            type: 'warning',
            message: `标签${v}已存在, 请重新输入~`
          })
          this.updateDialog.form.submitterConfirmEditFieldsVisible = false
          this.updateDialog.form.submitterConfirmEditFieldsInput = ''
          return
        }
      }
      this.updateDialog.form.submitterConfirmEditFields.push(v)
    }
    this.updateDialog.form.submitterConfirmEditFieldsVisible = false
    this.updateDialog.form.submitterConfirmEditFieldsInput = ''
    this.clearValidate()
  }

  private handleLevelRolesClose(index: number, tag: any) {
    this.updateDialog.form.levels[index].roles.splice(this.updateDialog.form.levels[index].roles.indexOf(tag), 1)
    this.clearValidate()
  }

  private showLevelRolesInput(index: number) {
    this.updateDialog.form.levels[index].rolesVisible = true
    this.$nextTick(() => {
      const arr: any = this.$refs[this.updateDialog.form.levels[index].rolesRef]
      const input = arr[0] as Input
      input.focus()
    })
    this.clearValidate()
  }

  private handleLevelUsersClose(index: number, tag: any) {
    this.updateDialog.form.levels[index].users.splice(this.updateDialog.form.levels[index].users.indexOf(tag), 1)
    this.clearValidate()
  }

  private showLevelUsersInput(index: number) {
    this.updateDialog.form.levels[index].usersVisible = true
    this.$nextTick(() => {
      const arr: any = this.$refs[this.updateDialog.form.levels[index].usersRef]
      const input = arr[0] as Input
      input.focus()
    })
    this.clearValidate()
  }

  private handleLevelEditFieldsClose(index: number, tag: any) {
    this.updateDialog.form.levels[index].editFields.splice(this.updateDialog.form.levels[index].editFields.indexOf(tag), 1)
    this.clearValidate()
  }

  private showLevelEditFieldsInput(index: number) {
    this.updateDialog.form.levels[index].editFieldsVisible = true
    this.$nextTick(() => {
      const arr: any = this.$refs[this.updateDialog.form.levels[index].editFieldsRef]
      const input = arr[0] as Input
      input.focus()
    })
    this.clearValidate()
  }

  private handleLevelEditFieldsInputConfirm(index: number) {
    const v = this.updateDialog.form.levels[index].editFieldsInput
    if (v) {
      for (let i = 0; i < this.updateDialog.form.levels[index].editFields.length; i++) {
        if (v === this.updateDialog.form.levels[index].editFields[i]) {
          this.$message({
            type: 'warning',
            message: `标签${v}已存在, 请重新输入~`
          })
          this.updateDialog.form.levels[index].editFieldsVisible = false
          this.updateDialog.form.levels[index].editFieldsInput = ''
          return
        }
      }
      this.updateDialog.form.levels[index].editFields.push(v)
    }
    this.updateDialog.form.levels[index].editFieldsVisible = false
    this.updateDialog.form.levels[index].editFieldsInput = ''
    this.clearValidate()
  }

  private handleSelectionChange(rows: any) {
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

  private levelRoleOrUserValidate(rule: any, value: any, callback: Function) {
    if (Array.isArray(value) && value.length === 0) {
      callback(new Error('用户或角色至少填一项'))
    }
  }

  private searchCategoryValidate(rule: any, value: any, callback: Function) {
    if (value !== '' && !Number.isInteger(value)) {
      callback(new Error('分类必须是数字'))
    }
    callback()
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  .el-row {
    margin-bottom: 15px;
  }

  .level-form {
    margin-top: 15px;
    border-radius: 5px;
    border: 1px dashed #efefef;

    .level-form-title {
      margin: 15px 15px 0 15px;
      font-size: 15px;
      font-weight: bold;
      color: #666;
    }

    .el-form-item {
      margin: 10px 20px;
    }

    .level-form-delete {
      float: right;
    }
  }

  .level-form-delete, .level-form-plus {
    cursor: pointer;
  }

  .level-form-plus-box {
    margin-top: 20px;
    font-size: 25px;
    text-align: center;
  }

  .el-tag + .el-tag {
    margin-left: 5px;
  }

  .el-tag-plus-btn {
    margin-left: 5px;
    padding: 4px 10px;
    line-height: 12px;
  }

  .el-tag-plus-input {
    margin-left: 5px;
    display: inline-block;
    width: 80px;
  }
}
</style>
