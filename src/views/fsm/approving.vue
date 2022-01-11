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
        :label="$t('category')"
        prop="category"
      >
        <el-select
          v-model.trim="table.form.category"
          :label="$t('categoryPlaceholder')"
        >
          <el-option
            v-for="item in defaultConfig.category"
            :key="item.id"
            :label="item.label"
            :value="item.id"
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
          prop="createdAt"
          :label="$t('createdAt')"
        />
        <el-table-column
          prop="category"
          align="center"
          :label="$t('category')"
        >
          <template slot-scope="scope">
            <el-tag
              :type="getCategoryTagType(scope.row.category)"
            >
              {{ getCategoryTagStr(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitterUser"
          :label="$t('approvingPage.submitterUser')"
        >
          <template slot-scope="scope">
            {{ scope.row.submitterUser.username + '(' +scope.row.submitterUser.mobile + ')' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="submitterRole"
          :label="$t('approvingPage.submitterRole')"
        >
          <template slot-scope="scope">
            {{ scope.row.submitterRole.keyword }}
          </template>
        </el-table-column>
        <el-table-column
          prop="prevDetail"
          :label="$t('approvingPage.prevDetail')"
        />
        <el-table-column
          prop="logDetail"
          :label="$t('approvingPage.logDetail')"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="handleLogDetail(scope.$index)"
            >
              {{ $t('approvingPage.viewLogDetail') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('operation')"
          align="center"
          width="260"
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
              v-if="scope.row.resubmit === 1"
              type="success"
              @click="handleApproval(scope.row, 2)"
            >
              {{ $t('approvingPage.resubmit') }}
            </el-button>
            <el-button
              v-if="scope.row.confirm === 1"
              type="success"
              @click="handleApproval(scope.row, 3)"
            >
              {{ $t('approvingPage.confirm') }}
            </el-button>
            <el-button
              v-if="scope.row.resubmit === 0 && scope.row.confirm === 0"
              type="success"
              @click="handleApproval(scope.row, 0)"
            >
              {{ $t('approvingPage.approve') }}
            </el-button>
            <el-button
              v-if="scope.row.resubmit === 0 && scope.row.confirm === 0"
              type="danger"
              @click="handleApproval(scope.row, 1)"
            >
              {{ $t('approvingPage.refuse') }}
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
    <!-- 审批对话框 -->
    <el-dialog
      :title="approvalDialog.title"
      :visible.sync="approvalDialog.visible"
      width="500px"
    >
      <el-form
        ref="approvalForm"
        :model="approvalDialog.form"
        :rules="approvalDialog.rules"
        label-width="80px"
      >
        <el-form-item
          v-if="approvalDialog.type===0"
          :label="$t('approvingPage.opinion')"
          prop="approvalOpinion"
        >
          <el-input
            v-model.trim="approvalDialog.form.approvalOpinion"
            type="textarea"
            :placeholder="$t('pleaseEnter') + $t('approvingPage.opinion')"
          />
        </el-form-item>
        <el-form-item
          v-else
          :label="$t('approvingPage.reason')"
          prop="approvalReason"
        >
          <el-input
            v-model.trim="approvalDialog.form.approvalReason"
            type="textarea"
            :placeholder="$t('pleaseEnter') + $t('approvingPage.reason')"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="approvalDialog.loading"
          @click="doApproval"
        >
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="cancelApproval">
          {{ $t('cancel') }}
        </el-button>
      </div>
    </el-dialog>
    <!-- 日志明细对话框 -->
    <el-dialog
      :title="logDetailDialog.title"
      :visible.sync="logDetailDialog.visible"
      width="500px"
    >
      <el-form
        ref="logDetailForm"
        :model="logDetailDialog.form"
        label-width="120px"
      >
        <el-form-item
          v-for="item in logDetailDialog.fields"
          :key="item.key"
          :label="item.name"
        >
          <el-input
            v-model.trim="item.val"
            :placeholder="item.placeholder"
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :loading="logDetailDialog.loading"
          @click="doChangeLogDetail"
        >
          {{ $t('edit') }}
        </el-button>
        <el-button @click="cancelChangeLogDetail">
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
import { approveFsm, findFsmApproving, findFsmLogTrack, getFsmLogDetail, updateFsmLogDetail } from '@/api/system/fsm'
import { diffArrUpdate } from '@/utils/diff'

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
    category: [{
      id: 1,
      label: this.$t('leavePage.flowName').toString(),
      type: ''
    }]
  }

  private table: any = {
    loading: false,
    key: 0,
    logTrackLoading: false,
    approvalLoading: false,
    batchDeleteBtnDisabled: true,
    selection: [],
    list: [],
    pageNum: 1,
    pageSize: 5,
    total: 0,
    form: {
      category: ''
    }
  }

  private approvalDialog: any = {
    loading: false,
    visible: false,
    // 分类(0:通过, 1:拒绝)
    type: 0,
    // 标题
    title: '',
    // 默认数据
    defaultForm: {
      uuid: '',
      category: '',
      approvalOpinion: '',
      approvalReason: ''
    },
    // 表单
    form: {},
    // 表单校验
    rules: {
      approvalReason: [
        { required: true, message: this.$t('reason').toString() + this.$t('required').toString(), trigger: 'blur' }
      ]
    }
  }

  private logDetailDialog: any = {
    visible: false,
    title: this.$t('approvingPage.logDetail').toString(),
    form: {},
    category: '',
    uuid: '',
    fields: [],
    oldData: {}
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

  created() {
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
      const { data } = await findFsmApproving(params)
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

  private async handleLogTrack(row: any) {
    this.table.logTrackLoading = true
    try {
      console.log({
        category: row.category,
        uuid: row.uuid
      })
      const { data } = await findFsmLogTrack({
        category: row.category,
        uuid: row.uuid
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

  private async handleApproval(row: any, type: number) {
    // 清理字段
    this.resetApprovalForm()
    // 弹窗表单赋值
    this.approvalDialog.form.uuid = row.uuid
    this.approvalDialog.form.category = row.category
    if (type === 2 || type === 3) {
      // 重新提交/确认
      await approveFsm({
        uuid: row.uuid,
        category: row.category,
        approved: 1
      })
      this.getData()
      return
    }
    // 修改分类
    this.approvalDialog.type = type
    // 修改标题
    if (type === 0) {
      this.approvalDialog.title = this.$t('approvingPage.toApprove').toString()
    } else {
      this.approvalDialog.title = this.$t('approvingPage.toRefuse').toString()
    }
    // 开启弹窗
    this.approvalDialog.visible = true
  }

  private async doApproval() {
    (this.$refs.approvalForm as Form).validate(async(valid) => {
      if (valid) {
        try {
          this.approvalDialog.loading = true
          const approved = this.approvalDialog.type === 0 ? 1 : 2
          const approvalOpinion = this.approvalDialog.type === 0 ? this.approvalDialog.form.approvalOpinion : this.approvalDialog.form.approvalReason
          await approveFsm({
            uuid: this.approvalDialog.form.uuid,
            category: this.approvalDialog.form.category,
            approvalOpinion,
            approved
          })
        } finally {
          this.approvalDialog.loading = false
        }
        // 关闭弹窗
        this.approvalDialog.visible = false
        // 重新查询
        this.getData()
        this.$notify({
          title: this.$t('congratulations').toString(),
          message: this.$t('approvingPage.doApproval').toString() + this.$t('success').toString(),
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private async cancelApproval() {
    // 关闭弹窗
    this.approvalDialog.visible = false
  }

  private async resetApprovalForm() {
    this.$nextTick(() => {
      // 重置校验信息
      const form = this.$refs.approvalForm as Form
      if (form) {
        form.clearValidate()
      }
    })
    this.approvalDialog.form = JSON.parse(JSON.stringify(this.approvalDialog.defaultForm))
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

  private async handleLogDetail(index: number) {
    this.logDetailDialog.fields = []
    this.table.list[index].logLoading = true
    try {
      const { data } = await getFsmLogDetail({
        category: this.table.list[index].category,
        uuid: this.table.list[index].uuid
      })
      this.logDetailDialog.category = this.table.list[index].category
      this.logDetailDialog.uuid = this.table.list[index].uuid
      this.table.list[index].logDetail = data
      this.logDetailDialog.visible = true
      for (const item of data) {
        this.logDetailDialog.fields.push({
          name: item.name,
          key: item.key,
          val: item.val,
          placeholder: this.$t('placeholder').toString() + item.name
        })
      }
    } finally {
      this.table.list[index].logLoading = false
    }
    this.logDetailDialog.oldData = JSON.parse(JSON.stringify(this.logDetailDialog.fields))
  }

  private async doChangeLogDetail() {
    try {
      this.logDetailDialog.loading = true
      const diff = diffArrUpdate(this.logDetailDialog.oldData, this.logDetailDialog.fields, 'key')
      if (diff.create.length === 0 && diff.update.length === 0 && diff.delete.length === 0) {
        this.$message({
          type: 'warning',
          message: this.$t('noDiff').toString()
        })
        return
      }
      await updateFsmLogDetail({
        category: this.logDetailDialog.category,
        uuid: this.logDetailDialog.uuid,
        fields: diff.update
      })
    } finally {
      this.logDetailDialog.loading = false
    }
    this.logDetailDialog.visible = false
    this.getData()
    this.$notify({
      title: this.$t('congratulations').toString(),
      message: this.$t('update').toString() + this.$t('success').toString(),
      type: 'success',
      duration: 2000
    })
  }

  private async cancelChangeLogDetail() {
    this.logDetailDialog.visible = false
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

  // 获取审批分类对应的tag颜色
  private getCategoryTagType(category: number) {
    for (let i = 0, len = this.defaultConfig.category.length; i < len; i++) {
      const item = this.defaultConfig.category[i]
      if (category === item.id) {
        return item.type
      }
    }
    return ''
  }

  // 获取category对应状态机名称, 这里为了简便没有通过后台查询, 理论上也是可以的
  private getCategoryTagStr(category: number) {
    for (let i = 0, len = this.defaultConfig.category.length; i < len; i++) {
      const item = this.defaultConfig.category[i]
      if (category === item.id) {
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

  .el-steps {
    width: 50%;
    margin: 0 auto;
  }
}
</style>
