<script setup>
import Form from "./components/Form.vue";
import { Warning, Refresh } from "@element-plus/icons-vue";
import { ref } from "vue";

const isVisible = ref(true);
const refreshForm = () => {
  isVisible.value = false;
  setTimeout(() => {
    isVisible.value = true;
  }, 300);
};
</script>

<template>
  <main>
    <div class="hd">
      <el-popover placement="top-start" :width="'80%'" trigger="click">
        <template #reference>
          <el-button type="primary">
            使用须知<el-icon class="el-icon--right"><Warning /></el-icon>
          </el-button>
        </template>
        <ol>
          <li>借鉴插件“附件批量下载”模板，进行优化升级</li>
          <li>
            调用浏览器原生下载功能，若浏览器提示下载多个文件时，请选择「允许」
          </li>
          <li>需要有附件下载权限，使用时请确保拥有权限</li>
          <li>
            文件下载方式为zip时，若附件过大，则会默认分开下载，避免浏览器崩溃
          </li>
          <li>
            下载路径为浏览器默认下载路径；下载时，使用附件的原始文件名，若出现重名，浏览器将自动添加后缀做区分
          </li>
          <li>多维表格新增数据表、视图或字段时，请重新运行本工具</li>
          <li>
            Zip打包功能使用了JSZip插件，大数据响应体验较慢，当前仅作代码交流学习用。大文件时，请使用逐个下载模式。
          </li>
        </ol>
      </el-popover>
      <el-button type="primary" @click="refreshForm">
        刷新表单<el-icon class="el-icon--right"><Refresh /></el-icon>
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
