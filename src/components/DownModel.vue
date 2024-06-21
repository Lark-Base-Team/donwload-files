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

      <p>{{ fileInfo }}</p>
      <p >{{ maxInfo }}</p>
      <p>{{ zipProgressText }}</p>
      <p v-for="(item, index) in errorText" :key="index" style="color: red">
        {{ item }}
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, toRefs, computed, defineEmits } from 'vue'
import ProgressCircle from './ProgressCircle.vue'
import FileDownloader from './downFiles.js'
import { i18n } from '@/locales/i18n.js'
import { getFileSize } from '@/utils/index.js'
const $t = i18n.global.t
const emit = defineEmits(['finsh'])

const current = ref(0)
const totalSize = ref(0)
const totalLength = ref(0)

const fileInfo = ref('')
const maxInfo = ref('')
const errorText = ref([])
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
const percent = computed(() => {
  return ((current.value / totalLength.value) * 100).toFixed(2) - 0
})
const { formData, zipName } = toRefs(props)
onMounted(async() => {
  const fileDownloader = new FileDownloader({ ...formData.value, zipName: zipName.value })
  fileDownloader.on('preding', (cells) => {
    totalLength.value += cells.length
    cells.forEach((cell) => {
      totalSize.value += cell.size
    })
  })
  fileDownloader.on('error', (errorInfo) => {
    const text = $t('file_download_failed_message')
      .replace('file_name', errorInfo.name)
      .replace('error_message', errorInfo.message)
    errorText.value.push(text)
  })
  fileDownloader.on('max_size_warning', (info) => {
    maxInfo.value = info
  })
  fileDownloader.on('progress', (info) => {
    current.value = info.index
    fileInfo.value = $t('downloading_file_progress')
      .replace('index', info.index)
      .replace('percentage', info.percentage)
  })
  fileDownloader.on('finshed', (cells) => {
    emit('finsh')
  })
  fileDownloader.on('zip_progress', (percent) => {
    maxInfo.value = ''
    const text = $t('file_packing_progress_message').replace('percentage', percent)
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
    font-size: 16px;

    & + p {
      margin-top: 8px;
    }
  }
}
</style>
