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
      <p v-for="(item, index) in errorText" :key="index" style="color: red">
        {{ item }}
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, toRefs, watch, computed } from 'vue'
import ProgressCircle from './ProgressCircle.vue'
import FileDownloader from './downFiles.js'
import { i18n } from '@/locales/i18n.js'
import { getFileSize } from '@/utils/index.js'
const $t = i18n.global.t
const percent = ref(0)
const loadingText = ref([])
const errorText = ref([])
const totalSize = ref(0)
const totalLength = ref(0)

const props = defineProps({
  formData: {
    type: Object,
    default: () => {}
  }
})

const { formData } = toRefs(props)
onMounted(async() => {
  const fileDownloader = new FileDownloader(formData.value)
  fileDownloader.on('preding', (cells) => {
    totalLength.value += cells.length
    cells.forEach((cell) => {
      totalSize.value += cell.size
    })
  })
  fileDownloader.on('info', (info) => {
    loadingText.value.push(info)
  })
  fileDownloader.on('error', (error) => {
    errorText.value.push(error)
  })
  fileDownloader.on('progress', (cell) => {
    percent.value = (cell.downloaded / cell.size) * 100
  })
  fileDownloader.on('finshed', (cells) => {
    percent.value = 100
  })
  fileDownloader.on('progress', (cellList) => {})
  await fileDownloader.startDownload()
  console.log(fileDownloader)
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
