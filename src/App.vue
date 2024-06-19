<script setup>
import Form from './components/Form.vue'
import { Warning, Refresh } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useTheme } from '@/hooks/useTheme'
useTheme()
const isVisible = ref(true)
const refreshForm = () => {
  isVisible.value = false
  setTimeout(() => {
    isVisible.value = true
  }, 300)
}
</script>

<template>
  <main>
    <div class="hd">
      <el-popover placement="top-start" :width="'80%'" trigger="click">
        <template #reference>
          <el-button type="primary">
            {{ $t("usage_instructions")
            }}<el-icon class="el-icon--right"><Warning /></el-icon>
          </el-button>
        </template>
        <ol>
          <li>{{ $t("notice_1") }}</li>
          <li>{{ $t("notice_2") }}</li>
          <li>{{ $t("notice_3") }}</li>
          <li>{{ $t("notice_4") }}</li>
          <li>{{ $t("notice_5") }}</li>
          <li>{{ $t("notice_6") }}</li>
          <li>{{ $t("notice_7") }}</li>
        </ol>
      </el-popover>
      <el-button type="primary" @click="refreshForm">
        {{ $t("refresh_form")
        }}<el-icon class="el-icon--right"><Refresh /></el-icon>
      </el-button>
    </div>
    <div class="forms" v-loading="!isVisible">
      <Form v-if="isVisible" />
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  padding: 1rem;
}

.hd {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .el-button {
    flex: 1;
  }
}
.forms {
  min-height: 300px;
}

ol {
  margin-left: 8px;
  padding-left: 8px;
  line-height: 1.5;
  flex-direction: column;
  font-size: 12px;
  color: var(--N500);
  margin-bottom: 16px;
  li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    position: relative;
    &:before {
      content: "";
      border: 3px solid var(--el-color-primary);
      border-radius: 50%;
      margin-top: 0.5em;
    }
  }
}
</style>
