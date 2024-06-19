<template>
  <div class="dialog-process">
    <h4>{{ $t("download_progress") }}</h4>
    <div class="dialog-circle">
      <ProgressCircle :percent="percent" />
    </div>
    <h4>{{ $t("download_details") }}</h4>
    <div class="prompt" >
      <p v-for="(item, index) in loadingText" :key="index">
        {{ item }}
      </p>
      <p v-for="(item, index) in errorText" :key="index" style="color: red">
        {{ item }}
      </p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, toRefs, watch, computed } from 'vue'
import ProgressCircle from './ProgressCircle.vue'

const percent = ref(0)
const loadingText = ref([])
const errorText = ref([])
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
