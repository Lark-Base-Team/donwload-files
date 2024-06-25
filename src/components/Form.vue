<template>
  <div v-loading="loading" class="form-container">
    <el-form ref="elform"
class="form"
:model="formData"
:rules="rules"
label-width="auto"
      :scroll-into-view-options="true"
:label-position="'left'"
v-if="!loading">
      <el-form-item :label="$t('data_table_column')" prop="tableId">
        <el-select v-model="formData.tableId" :placeholder="$t('select_data_table')" style="width: 100%">
          <el-option v-for="meta in datas.allInfo" :key="meta.tableId" :label="meta.tableName" :value="meta.tableId" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('view_column')" prop="viewId">
        <el-select v-model="formData.viewId" :placeholder="$t('select_view')" style="width: 100%">
          <el-option v-for="meta in viewList" :key="meta.id" :label="meta.name" :value="meta.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('attachment_fields')" prop="attachmentFileds">
        <el-select v-model="formData.attachmentFileds"
multiple
:placeholder="$t('select_attachment_fields')"
          style="width: 100%">
          <el-option v-for="meta in attachmentList" :key="meta.id" :label="meta.name" :value="meta.id" />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('file_naming_method')" prop="fileNameType">
        <el-select v-model="formData.fileNameType" :placeholder="$t('select_file_naming_method')" style="width: 100%">
          <el-option :label="$t('original_file_name')" :value="0" />
          <el-option :label="$t('select_from_table_fields')" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('file_name_field')" prop="fileNameByField" v-if="formData.fileNameType === 1">
        <el-select v-model="formData.fileNameByField" :placeholder="$t('select_file_name_field')" style="width: 100%">
          <el-option :label="item.name" :value="item.id" v-for="(item, index) in singleSelectList" :key="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('download_method')" prop="downloadType">
        <el-select v-model="formData.downloadType" :placeholder="$t('select_download_method')" style="width: 100%">
          <el-option :label="$t('download_individual_files')" :value="2" />
          <el-option :label="$t('zip_download')" :value="1" />
        </el-select>
      </el-form-item>
      <div style="display: flex">
        <el-form-item prop="downloadTypeByFolders" v-if="formData.downloadType === 1">
          <template #label>
            <p style="display: flex; align-items: center">
              <span style="margin-right: 2px">{{
                $t("folder_classification")
              }}</span>
              <el-popover placement="top-start" trigger="hover" :content="$t('folder_classification_hint')">
                <template #reference>
                  <el-icon>
                    <InfoFilled />
                  </el-icon>
                </template>
              </el-popover>
            </p>
          </template>
          <el-switch v-model="formData.downloadTypeByFolders" :active-text="$t('yes')" :inactive-text="$t('no')" />
        </el-form-item>
      </div>

      <el-form-item :label="$t('first_directory')"
prop="firstFolderKey"
        v-if="formData.downloadType === 1 && formData.downloadTypeByFolders">
        <el-select v-model="formData.firstFolderKey"
:placeholder="$t('select_first_directory')"
style="width: 100%"
          clearable>
          <el-option v-for="meta in singleSelectList" :key="meta.id" :label="meta.name" :value="meta.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('second_directory')"
prop="secondFolderKey"
        v-if="formData.downloadType === 1 && formData.downloadTypeByFolders">
        <el-select clearable
v-model="formData.secondFolderKey"
:placeholder="$t('select_second_directory')"
          style="width: 100%">
          <el-option v-for="meta in singleSelectList" :key="meta.id" :label="meta.name" :value="meta.id" />
        </el-select>
      </el-form-item>

      <div class="btns">
        <el-button type="primary" @click="submit">
          {{ $t("download") }}
          <el-icon>
            <Download />
          </el-icon>
        </el-button>
      </div>
    </el-form>
    <el-dialog v-model="downModelVis"
:title="$t('file_download')"
width="80%"
:close-on-click-modal="false"
      :close-on-press-escape="false"
:append-to-body="true">
      <DownModel v-if="downModelVis" :formData="formData" @finsh="datas.finshDownload=true" :zipName="activeTableInfo.tableName"/>
      <template #footer v-if="datas.finshDownload">
        <span class="dialog-footer">
          <el-button @click="downModelVis = false">{{
            $t("complete")
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, toRefs, watch, computed } from 'vue'
import { bitable, FieldType } from '@lark-base-open/js-sdk'
import { Download, InfoFilled } from '@element-plus/icons-vue'
import DownModel from './DownModel.vue'
import { SUPPORT_TYPES, getInfoByTableMetaList } from '@/hooks/useBitable.js'

const elform = ref(null)
const loading = ref(true)
const downModelVis = ref(false)
const formData = reactive({
  tableId: '',
  attachmentFileds: [],
  fileNameType: 0,
  fileNameByField: '',
  viewId: '',
  downloadType: 1,
  downloadTypeByFolders: false,
  firstFolderKey: '',
  secondFolderKey: ''
})
const rules = reactive({
  tableId: [
    {
      required: true,
      message: '请选择数据表',
      trigger: 'change'
    }
  ],
  attachmentFileds: [
    {
      required: true,
      message: '请选择附件字段',
      trigger: 'change'
    }
  ],
  viewId: [
    {
      required: true,
      message: '请选择视图',
      trigger: 'change'
    }
  ],
  fileNameType: [
    {
      required: true,
      message: '请选择文件名命名方式',
      trigger: 'change'
    }
  ],
  fileNameByField: [
    {
      required: true,
      message: '请选择文件命名字段',
      trigger: 'change'
    }
  ],
  downloadType: [
    {
      required: true,
      message: '请选择文件下载方式',
      trigger: 'change'
    }
  ],
  // firstFolderKey: [
  //   {
  //     required: true,
  //     message: "请选择一级目录，如不需要则关闭分类下载",
  //     trigger: "change",
  //   },
  // ],
  secondFolderKey: [
    {
      validator: (rule, value, callback) => {
        if (!value && !formData.firstFolderKey) {
          callback()
        } else if (!formData.firstFolderKey) {
          callback(new Error('请先选择一级目录'))
        } else if (value === formData.firstFolderKey) {
          callback(new Error('二级目录不能与一级目录相同'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})
const datas = reactive({
  allInfo: [],
  finshDownload: false
})
const activeTableInfo = computed(() => {
  const item = datas.allInfo.find((item) => item.tableId === formData.tableId)
  return item || null
})
const viewList = computed(() => {
  return activeTableInfo.value ? activeTableInfo.value.viewMetaList : []
})
const attachmentList = computed(() => {
  return activeTableInfo.value
    ? activeTableInfo.value['fieldMetaList'].filter(
      (item) => item.type === FieldType.Attachment
    )
    : []
})
const singleSelectList = computed(() => {
  return activeTableInfo.value
    ? activeTableInfo.value['fieldMetaList'].filter((item) =>
      SUPPORT_TYPES.includes(item.type)
    )
    : []
})
watch(
  () => formData.tableId,
  () => {
    const isExit = viewList.value.find((e) => e.id === formData.viewId)
    if (!isExit) {
      formData.viewId = viewList.value.length ? viewList.value[0]['id'] : ''
    }
    formData.fileNameByField = ''
    formData.attachmentFileds = attachmentList.value.map((e) => e.id)
    formData.firstFolderKey = ''
    formData.secondFolderKey = ''
  }
)
watch(
  () => formData.firstFolderKey,
  () => {
    // 清除二级目录的验证错误
    elform.value.clearValidate('secondFolderKey')
  }
)
watch(
  () => formData.secondFolderKey,
  (newVal) => {
    if (!newVal && formData.firstFolderKey) {
      elform.value.validateField('secondFolderKey')
    }
  }
)
const submit = async() => {
  if (!elform.value) return
  await elform.value.validate(async(valid) => {
    if (valid) {
      datas.finshDownload = false
      downModelVis.value = true
    }
  })
}

onMounted(async() => {
  const tableMetaList = await bitable.base.getTableMetaList()
  datas.allInfo = await getInfoByTableMetaList(tableMetaList)
  console.log('allInfo', datas.allInfo)

  // 刚渲染本插件的时候，用户所选的tableId等信息
  const { tableId, viewId } = await bitable.base.getSelection()
  formData.tableId = tableId
  formData.viewId = viewId
  formData.attachmentFileds = attachmentList.value.map((e) => e.id)

  loading.value = false
})
</script>
<style lang="scss">
.form-container {
  min-height: 300px;

  .btns {
    display: flex;
    justify-content: center;
    align-items: center;

    .el-button {
      width: 80%;
    }
  }
}

.el-dialog {
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    height: 60vh;
    overflow: auto;
    padding: 16px;
  }
}
</style>
