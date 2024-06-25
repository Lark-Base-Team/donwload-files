<template>
  <div class="dialog-process">
    <h4>{{ $t("download_progress") }}</h4>
    <div class="dialog-circle">
      <ProgressCircle :percent="percent" />
    </div>
    <h4>{{ $t("download_details") }}</h4>
    <div class="prompt">
      <p>共计有 {{ totalLength }} 个文件待下载。</p>
      <p>当前文件总大小{{ getFileSize(totalSize) }}</p>
      <p>已下载文件数量{{ getCompletedIdsLength }}个</p>
      <p>{{ maxInfo }}</p>
      <p>{{ zipProgressText }}</p>

      <el-table
        :data="fileInfo"
        style="width: 100%"
        show-overflow-tooltip
        size="small"
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="文件名" width="" />
        <el-table-column prop="percentage" label="下载进度">
          <template #default="scope">
            {{ scope.row.percentage
            }}{{ scope.row.type === "error" ? "" : "%" }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小">
          <template #default="scope">
            {{ getFileSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-button
              type="primary"
              v-if="scope.row.type === 'loading'"
              size="small"
              link
              >下载中</el-button
            >
            <el-button
              type="success"
              link
              v-if="scope.row.type === 'success'"
              size="small"
              >下载成功</el-button
            >
            <el-button
              type="danger"
              link
              v-if="scope.row.type === 'error'"
              size="small"
              >下载失败</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, toRefs, computed, defineEmits } from 'vue'
import ProgressCircle from './ProgressCircle.vue'
import FileDownloader from './downFiles.js'
import { i18n } from '@/locales/i18n.js'
import { getFileSize, debouncedSort } from '@/utils/index.js'
const $t = i18n.global.t
const emit = defineEmits(['finsh'])

const completedIds = ref(new Set())

const totalSize = ref(0)
const totalLength = ref(0)
const fileInfo = ref([])
const maxInfo = ref('')
const zipProgressText = ref('')

const props = defineProps({
  zipName: {
    type: String,
    default: ''
  },
  formData: {
    type: Object,
    default: () => {}
  }
})
const getCompletedIdsLength = computed(() => {
  return completedIds.value.size
})

const percent = computed(() => {
  return (
    ((getCompletedIdsLength.value / totalLength.value) * 100).toFixed(2) - 0
  )
})
const sortFileInfo = () => {
  // 根据条件对 fileInfo 数组进行排序
  // 确保 'loading' 类型的条目排在数组的最前面
  fileInfo.value.sort((a, b) => {
    // 如果 a 是 'loading' 而 b 不是，则 a 排在前面
    if (a.type === 'loading' && b.type !== 'loading') {
      return -1
    }
    // 如果 b 是 'loading' 而 a 不是，则 b 排在前面
    if (b.type === 'loading' && a.type !== 'loading') {
      return 1
    }
    // 对于其他情况，可以按其他标准排序，或者保持原顺序
    return 0
  })
}

const debouncedSortFileInfo = debouncedSort(sortFileInfo, 200)
const { formData, zipName } = toRefs(props)
onMounted(async() => {
  const fileDownloader = new FileDownloader({
    ...formData.value,
    zipName: zipName.value
  })
  fileDownloader.on('preding', (cells) => {
    totalLength.value += cells.length
    cells.forEach((cell) => {
      totalSize.value += cell.size
    })
  })
  fileDownloader.on('error', (errorInfo) => {
    const { index, message } = errorInfo
    const itemIndex = fileInfo.value.findIndex((item) => item.index === index)

    if (itemIndex !== -1) {
      fileInfo.value[itemIndex].type = 'error'
      fileInfo.value[itemIndex].percentage = message
      debouncedSortFileInfo()
    }
  })
  fileDownloader.on('max_size_warning', (info) => {
    maxInfo.value = info
  })
  fileDownloader.on('progress', (progressInfo) => {
    const { index, percentage, name, size } = progressInfo

    const itemIndex = fileInfo.value.findIndex((item) => item.index === index)

    if (itemIndex === -1) {
      fileInfo.value.unshift({
        index,
        percentage,
        name,
        size,
        type: 'loading'
      })
    } else {
      fileInfo.value[itemIndex].percentage = percentage

      if (percentage >= 100) {
        if (!completedIds.value.has(index)) {
          fileInfo.value[itemIndex].type = 'success'

          completedIds.value.add(index) // 标记为已处理
        }
        debouncedSortFileInfo()
      } else {
        fileInfo.value[itemIndex].type = 'loading'
      }
    }
  })
  fileDownloader.on('finshed', (cells) => {
    emit('finsh')
  })
  fileDownloader.on('zip_progress', (percent) => {
    maxInfo.value = ''
    const text = $t('file_packing_progress_message').replace(
      'percentage',
      percent
    )
    zipProgressText.value = text
  })
  await fileDownloader.startDownload()
})
</script>

<style scoped lang="scss">
.dialog-process {
  h4 {
    color: var(--N900);
    margin-bottom: 16px;
    font-size: 16px;
    border-left: 3px solid var(--el-color-primary);
    padding-left: 8px;
  }

  .dialog-circle {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    .statistic {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}

.prompt {
  h4 {
    margin-bottom: 8px;
  }

  p {
    line-height: 1.2;
    color: var(--N500);
    font-size: 14px;
    margin-bottom: 8px;
  }
}

</style>
