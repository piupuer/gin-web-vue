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
        :label="$t('desc')"
        prop="desc"
      >
        <el-input
          v-model.trim="table.form.desc"
          :placeholder="$t('pleaseEnter') + $t('desc')"
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
          :placeholder="$t('pleaseEnter') + $t('status')"
        >
          <el-option
            v-for="item in defaultConfig.status"
            :key="item.name"
            :label="item.label"
            :value="item.name"
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
          prop="desc"
          :label="$t('desc')"
        />
        <el-table-column
          prop="startTime"
          :label="$t('startTime')"
        />
        <el-table-column
          prop="endTime"
          :label="$t('endTime')"
        />
        <el-table-column
          prop="status"
          :label="$t('status')"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
            >
              {{ getStatusTagLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="500"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              :loading="table.logTrackLoading"
              @click="handleLogTrack(scope.row)"
            >
              {{ $t('approveLogTrack') }}
            </el-button>
            <el-button
              v-if="scope.row.status === 2"
              type="success"
              @click="handleResubmit(scope.row)"
            >
              {{ $t('approvingPage.resubmit') }}
            </el-button>
            <el-button
              v-if="scope.row.status === 5"
              type="success"
              @click="handleConfirm(scope.row)"
            >
              {{ $t('confirm') }}
            </el-button>
            <el-button
              v-if="scope.row.status !== 1"
              @click="handleUpdate(scope.row)"
            >
              {{ $t('edit') }}
            </el-button>
            <el-button
              v-if="scope.row.status !== 1 &&scope.row.status !== 3 && scope.row.status !== 5"
              type="warning"
              @click="handleCancel(scope.row)"
            >
              {{ $t('cancel') }}
            </el-button>
            <el-button
              v-if="scope.row.status !== 1"
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

    <!-- 请假配置对话框 -->
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
          :label="$t('desc')"
          prop="desc"
        >
          <el-input
            v-model.trim="updateDialog.form.desc"
            type="textarea"
            :placeholder="$t('pleaseEnter') + $t('desc')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('startTime')"
          prop="startTime"
        >
          <el-date-picker
            v-model="updateDialog.form.startTime"
            type="datetime"
            :picker-options="updateDialog.startTimePickerOptions"
            :placeholder="$t('pleaseEnter') + $t('startTime')"
          />
        </el-form-item>
        <el-form-item
          :label="$t('endTime')"
          prop="endTime"
        >
          <el-date-picker
            v-model="updateDialog.form.endTime"
            type="datetime"
            :picker-options="updateDialog.endTimePickerOptions"
            :placeholder="$t('pleaseEnter') + $t('endTime')"
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
    <!-- 审批日志对话框 -->
    <el-dialog
      :title="logTrackDialog.title"
      :visible.sync="logTrackDialog.visible"
      width="500px"
    >
      <el-steps
        :active="logTrackDialog.stepsActive"
        :align-center="true"
        :space="80"
        direction="vertical"
        finish-status="success"
      >
        <el-step
          v-for="(item, index) in logTrackDialog.steps"
          :key="index"
          :title="item.title"
          :status="item.status"
          :description="item.description"
        />
      </el-steps>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="logTrackDialog.visible=false"
        >
          {{ $t('confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Pagination from '@/components/Pagination/index.vue'
import { Form } from 'element-ui'
import { batchDeleteLeave, createLeave, findLeave, updateLeave } from '@/api/test/leaves'
import { diffObjUpdate } from '@/utils/diff'
import { IdempotenceModule } from '@/store/modules/idempotence'
import { approveFsm, cancelFsm, findFsmLogTrack } from '@/api/system/fsm'

@Component({
  // 组件名称首字母需大写, 否则会报警告
  name: 'Leave',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private readonly defaultConfig: any = {
    pageNum: 1,
    pageSize: 5,
    // 默认状态机分类, 需要和后端保持一致, 也可以动态从数据字典查询
    category: 1,
    status: [{
      name: 0,
      label: this.$t('leavePage.submitted').toString(),
      type: 'info'
    }, {
      name: 1,
      label: this.$t('leavePage.approved').toString(),
      type: 'success'
    }, {
      name: 2,
      label: this.$t('leavePage.refusedNeedResubmit').toString(),
      type: 'danger'
    }, {
      name: 3,
      label: this.$t('leavePage.cancelled').toString(),
      type: 'warning'
    }, {
      name: 4,
      label: this.$t('leavePage.approving').toString(),
      type: ''
    }, {
      name: 5,
      label: this.$t('leavePage.approvedNeedConfirm').toString(),
      type: ''
    }]
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
      status: '',
      desc: '',
      startTime: '',
      endTime: ''
    },
    // 表单
    form: {},
    oldData: {},
    // 表单校验
    rules: {
      desc: [
        { required: true, message: this.$t('desc').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    },
    startTimePickerOptions: {
      disabledDate(time: any) {
        return time.getTime() < Date.now()
      }
    },
    endTimePickerOptions: {
      disabledDate(time: any) {
        return time.getTime() < Date.now()
      }
    }
  }

  private logTrackDialog: any = {
    // 是否打开
    visible: false,
    // 标题
    title: this.$t('approveLogTrack').toString(),
    // 历史步骤
    stepsActive: 0,
    steps: []
  }

  private table: any = {
    loading: false,
    logTrackLoading: false,
    batchDeleteBtnDisabled: true,
    selection: [],
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      status: '',
      desc: '',
      startTime: '',
      endTime: ''
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
      const { data } = await findLeave(params)
      this.table.list = data.list
      this.table.pageNum = data.pageNum
      this.table.pageSize = data.pageSize
      this.table.total = data.total
    } finally {
      // 不管是否异常自动停止loading
      this.table.loading = false
    }
  }

  private async doSearch() {
    this.getData()
  }

  private async doUpdate() {
    (this.$refs.updateForm as Form).validate(async(valid) => {
      if (valid) {
        if (this.updateDialog.form.startTime !== '' && this.updateDialog.form.endTime !== '' && this.updateDialog.form.startTime.getTime() > this.updateDialog.form.endTime.getTime()) {
          this.$message({
            type: 'warning',
            message: '开始时间不能大于结束时间, 请重新输入~'
          })
          return
        }
        const newData = JSON.parse(JSON.stringify(this.updateDialog.form))
        newData.startTime = this.date2Str(this.updateDialog.form.startTime)
        newData.endTime = this.date2Str(this.updateDialog.form.endTime)
        if (this.updateDialog.type === 0) {
          try {
            this.updateDialog.loading = true
            await createLeave(newData)
          } finally {
            this.updateDialog.loading = false
            IdempotenceModule.RefreshIdempotenceToken()
          }
        } else {
          const update = diffObjUpdate(this.updateDialog.oldData, newData)
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
            await updateLeave(update.id, update)
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
    // 修改类型
    this.updateDialog.type = 0
    // 修改标题
    this.updateDialog.title = this.$t('create').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleLogTrack(row: any) {
    this.table.logTrackLoading = true
    try {
      console.log({
        category: this.defaultConfig.category,
        uuid: row.fsmUuid
      })
      const { data } = await findFsmLogTrack({
        category: this.defaultConfig.category,
        uuid: row.fsmUuid
      })
      this.logTrackDialog.stepsActive = data.length - 1
      const logs: any [] = []
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i]
        if (i === 0) {
          logs.push({
            title: item.name,
            description: item.createdAt,
            status: 'success'
          })
        } else if (i < len - 1 || item.status > 0) {
          let status = 'success'
          let description = item.updatedAt
          let opinion = item.opinion
          if (item.opinion === '' && item.status !== 3 && item.end === 0 && item.confirm === 0) {
            opinion = this.$t('approvingPage.defaultOpinion').toString()
          }
          let title = item.name
          if (opinion !== '') {
            title = item.name + '[' + this.$t('approvingPage.opinion').toString() + ': ' + opinion + ']'
          }
          if (item.status === 2) {
            status = 'error'
            if (item.opinion !== '') {
              description = item.updatedAt
            }
          } else if (item.status === 3) {
            status = 'error'
          } else if (item.status === 4) {
            status = 'finish'
          }
          logs.push({
            title,
            description,
            status
          })
        } else {
          if (item.resubmit === 1) {
            logs.push({
              title: this.$t('leavePage.refusedNeedResubmit').toString(),
              description: this.$t('leavePage.refusedNeedResubmitDesc').toString(),
              status: 'wait'
            })
          } else if (item.confirm === 1) {
            logs.push({
              title: this.$t('leavePage.approvedNeedConfirm').toString(),
              description: this.$t('leavePage.approvedNeedConfirmDesc').toString(),
              status: 'wait'
            })
          } else {
            logs.push({
              title: this.$t('leavePage.approving').toString(),
              description: this.$t('leavePage.approvingDesc').toString(),
              status: 'wait'
            })
          }
        }
      }
      this.logTrackDialog.steps = logs
      this.logTrackDialog.visible = true
    } catch (e) {
      this.$message.error(this.$t('readDataFail').toString())
    } finally {
      this.table.logTrackLoading = false
    }
  }

  private async handleUpdate(row: any) {
    // 清理字段
    this.resetUpdateForm()
    // 弹窗表单赋值
    this.updateDialog.form.id = row.id
    this.updateDialog.form.desc = row.desc
    this.updateDialog.form.startTime = row.startTime
    this.updateDialog.form.endTime = row.endTime
    // 记录旧数据
    this.updateDialog.oldData = JSON.parse(JSON.stringify(this.updateDialog.form))
    // 转为date
    if (this.updateDialog.form.startTime !== '') {
      this.updateDialog.form.startTime = new Date(Date.parse(this.updateDialog.form.startTime))
    }
    if (this.updateDialog.form.endTime !== '') {
      this.updateDialog.form.endTime = new Date(Date.parse(this.updateDialog.form.endTime))
    }
    // 修改类型
    this.updateDialog.type = 1
    // 修改标题
    this.updateDialog.title = this.$t('update').toString()
    // 开启弹窗
    this.updateDialog.visible = true
  }

  private async handleConfirm(row: any) {
    const msg = `${this.$t('sureToDo').toString()}${this.$t('confirm').toString()}[${row.desc}]?`
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await approveFsm({
          category: this.defaultConfig.category,
          uuid: row.fsmUuid,
          // 确认相当于一次审批通过
          approved: 1
        })
        this.getData()
      })
  }

  private async handleResubmit(row: any) {
    await approveFsm({
      category: this.defaultConfig.category,
      uuid: row.fsmUuid,
      // 重新提交相当于一次审批通过
      approved: 1
    })
    this.getData()
  }

  private async handleCancel(row: any) {
    const msg = `${this.$t('sureToDo').toString()}${this.$t('cancel').toString()}[${row.desc}]?`
    this.$confirm(msg, this.$t('caution').toString(), {
      confirmButtonText: this.$t('confirm').toString(),
      cancelButtonText: this.$t('cancel').toString(),
      type: 'warning'
    })
      .then(async() => {
        await cancelFsm({
          category: this.defaultConfig.category,
          uuids: [row.fsmUuid]
        })
        this.getData()
      })
  }

  private handleDelete(row: any) {
    this.batchDelete([row])
  }

  private handleBatchDelete() {
    this.batchDelete(this.table.selection)
  }

  private async batchDelete(rows: any) {
    const ids: number[] = []
    const descs: string[] = []
    for (let i = 0, len = rows.length; i < len; i++) {
      const row = rows[i]
      ids.push(row.id)
      descs.push(row.desc)
    }
    if (ids.length > 0) {
      const msg = `${this.$t('sureToDo').toString()}${this.$t('del').toString()}${this.$t('leave').toString()}[${descs.join(',')}], ${this.$t('irreversible').toString()}?`
      this.$confirm(msg, this.$t('caution').toString(), {
        confirmButtonText: this.$t('confirm').toString(),
        cancelButtonText: this.$t('cancel').toString(),
        type: 'warning'
      })
        .then(async() => {
          await batchDeleteLeave(ids.join(','))
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

  // 获取审批状态对应的tag颜色
  private getStatusTagType(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.type
      }
    }
    return ''
  }

  // 获取审批状态对应的tag label
  private getStatusTagLabel(status: number) {
    for (let i = 0, len = this.defaultConfig.status.length; i < len; i++) {
      const item = this.defaultConfig.status[i]
      if (status === item.name) {
        return item.label
      }
    }
    return ''
  }

  private date2Str(date: any) {
    if (date !== '') {
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
      const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
      const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
      const s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      return Y + M + D + h + m + s
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
    .el-steps {
      width: 70%;
      margin: 0 auto;
    }
  }
</style>
