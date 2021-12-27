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
        :label="$t('category')"
        prop="category"
      >
        <el-input
          v-model.number="table.form.category"
          :placeholder="$t('pleaseEnter') + $t('category')"
          clearable
          @clear="doSearch"
          @keyup.enter.native="doSearch"
        />
      </el-form-item>
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
        :label="$t('fsmPage.submitterConfirm')"
        prop="submitterConfirm"
      >
        <el-select
          v-model.trim="table.form.submitterConfirm"
          clearable
          :placeholder="$t('pleaseEnter') + $t('fsmPage.submitterConfirm')"
        >
          <el-option
            key="1"
            :label="$t('yes')"
            :value="1"
          />
          <el-option
            key="0"
            :label="$t('no')"
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
          prop="category"
          :label="$t('category')"
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
          :label="$t('name')"
          sortable
        />
        <el-table-column
          prop="submitterName"
          :label="$t('fsmPage.submitterName')"
        />
        <el-table-column
          prop="submitterEditFields"
          :label="$t('fsmPage.submitterEditFields')"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.submitterEditFields === ''"
            >
              {{ $t('any') }}
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
          :label="$t('fsmPage.submitterConfirm')"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.submitterConfirm === 1"
            >
              {{ $t('yes') }}
            </el-tag>
            <el-tag
              v-else
              type="danger"
            >
              {{ $t('no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitterConfirmEditFields"
          :label="$t('fsmPage.submitterConfirmEditFields')"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.submitterConfirmEditFields === ''"
            >
              {{ $t('any') }}
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
          :label="$t('operation')"
          align="center"
          width="240"
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
          :label="$t('category')"
          prop="category"
        >
          <el-input
            v-model.number="updateDialog.form.category"
            :placeholder="$t('pleaseEnter') + $t('category')"
          />
        </el-form-item>
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
          :label="$t('fsmPage.submitterName')"
          prop="submitterName"
        >
          <el-input
            v-model.trim="updateDialog.form.submitterName"
            :placeholder="$t('pleaseEnter') + $t('fsmPage.submitterName')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('fsmPage.submitterEditFields')"
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
          :label="$t('fsmPage.submitterConfirm')"
          prop="submitterConfirm"
        >
          <el-switch
            v-model.trim="updateDialog.form.submitterConfirm"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('available')"
            :inactive-text="$t('disabled')"
          />
        </el-form-item>
        <el-form-item
          v-if="updateDialog.form.submitterConfirm === 1"
          :label="$t('fsmPage.submitterConfirmEditFields')"
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
            <span>{{ $t('level') + (index + 1) }}：</span>
            <i
              class="el-icon-delete level-form-delete"
              @click="levelDelete(index)"
            />
          </div>

          <el-form-item
            :label="$t('name')"
            prop="name"
          >
            <el-input
              v-model.trim="level.name"
              :placeholder="$t('pleaseEnter') + $t('name')"
              clearable
            />
          </el-form-item>
          <el-form-item
            :label="$t('fsmPage.roles')"
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
            :label="$t('fsmPage.users')"
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
            :label="$t('fsmPage.edit')"
            prop="edit"
          >
            <el-switch
              v-model.trim="level.edit"
              :active-value="1"
              :inactive-value="0"
              :active-text="$t('available')"
              :inactive-text="$t('disabled')"
            />
          </el-form-item>
          <el-form-item
            v-if="level.edit === 1"
            :label="$t('fsmPage.editFields')"
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
        </el-form>
        <div
          class="level-form-plus-box"
          :title="$t('create') + ' ' + $t('level')"
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
        { required: true, type: 'number', message: this.$t('fsmPage.validate[0]').toString(), trigger: 'blur' }
      ],
      name: [
        { required: true, message: this.$t('fsm').toString() + this.$t('name').toString() + this.$t('required').toString(), trigger: 'blur' }
      ],
      submitterName: [
        { required: true, message: this.$t('submitter').toString() + this.$t('name').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    },
    levelRules: {
      name: [
        { required: true, message: this.$t('level').toString() + this.$t('name').toString() + this.$t('required').toString(), trigger: 'blur' }
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
        { required: true, type: 'number', message: this.$t('fsmPage.validate[0]').toString(), trigger: 'blur' }
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
      if (this.updateDialog.form.levels.length === 0) {
        this.$message({
          type: 'warning',
          message: this.$t('level').toString() + this.$t('required').toString()
        })
        return
      }
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
              message: this.$t('noDiff').toString()
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

  private encodeData(row: any) {
    const data: any = {
      id: row.id,
      category: row.category,
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
    this.updateDialog.title = this.$t('create').toString()
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
    this.updateDialog.form.category = row.category
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
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.encodeData(oldRow)))
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
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
        this.$message.error(this.$t('readDataFail').toString())
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
            message: item.keyword + this.$t('alreadyExists').toString()
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
        this.$message.error(this.$t('readDataFail').toString())
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
            message: item.username + this.$t('alreadyExists').toString()
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
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('fsm').toString()}[${names.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
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
            message: v + this.$t('alreadyExists').toString()
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
            message: v + this.$t('alreadyExists').toString()
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
            message: v + this.$t('alreadyExists').toString()
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
      callback(new Error(this.$t('fsmPage.validate[1]').toString()))
    }
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
