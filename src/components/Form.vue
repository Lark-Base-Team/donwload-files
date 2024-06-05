<template>
  <div v-loading="loading" class="form-container">
    <el-form
      ref="elform"
      class="form"
      :model="formData"
      :rules="rules"
      label-width="auto"
      :scroll-into-view-options="true"
      :label-position="'left'"
      v-if="!loading"
    >
      <el-form-item label="数据表列" prop="tableId">
        <el-select
          v-model="formData.tableId"
          placeholder="请选择数据表"
          style="width: 100%"
        >
          <el-option
            v-for="meta in oTables"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="视图列" prop="viewField">
        <el-select
          v-model="formData.viewField"
          placeholder="请选择数据表"
          style="width: 100%"
        >
          <el-option
            v-for="meta in viewList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="附件字段(可多选)" prop="attachmentFileds">
        <el-select
          v-model="formData.attachmentFileds"
          multiple
          placeholder="请选择附件字段"
          style="width: 100%"
        >
          <el-option
            v-for="meta in attachmentList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="文件命名方式" prop="fileNameType">
        <el-select
          v-model="formData.fileNameType"
          placeholder="请选择附件字段"
          style="width: 100%"
        >
          <el-option :label="'原文件名称'" :value="0" />
          <el-option :label="'从表字段选择'" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="字段列"
        prop="fileNameByField"
        v-if="formData.fileNameType === 1"
      >
        <el-select
          v-model="formData.fileNameByField"
          placeholder="请选择文件命名字段"
          style="width: 100%"
        >
          <el-option
            :label="item.name"
            :value="item.id"
            v-for="(item, index) in singleSelectList"
            :key="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="下载方式" prop="downloadType">
        <el-select
          v-model="formData.downloadType"
          placeholder="请选择下载方式"
          style="width: 100%"
        >
          <el-option :label="'逐个文件下载'" :value="2" />
          <el-option :label="'zip打包下载'" :value="1" />
        </el-select>
      </el-form-item>
      <div style="display: flex">
        <el-form-item
          prop="downloadTypeByFoldes"
          v-if="formData.downloadType === 1"
        >
          <template #label>
            <p style="display: flex; align-items: center">
              <span style="margin-right: 2px">文件夹分类</span>
              <el-popover
                placement="top-start"
                trigger="hover"
                content="可根据所选字段进行一级、二级文件夹分类下载"
              >
                <template #reference>
                  <el-icon><InfoFilled /></el-icon>
                </template>
              </el-popover>
            </p>
          </template>
          <el-switch
            v-model="formData.downloadTypeByFoldes"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </div>

      <el-form-item
        label="一级目录"
        prop="firstFolderKey"
        v-if="formData.downloadType === 1 && formData.downloadTypeByFoldes"
      >
        <el-select
          v-model="formData.firstFolderKey"
          placeholder="请选择一级目录"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="meta in singleSelectList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="二级目录"
        prop="secondFolderKey"
        v-if="formData.downloadType === 1 && formData.downloadTypeByFoldes"
      >
        <el-select
          clearable
          v-model="formData.secondFolderKey"
          placeholder="请选择二级目录"
          style="width: 100%"
        >
          <el-option
            v-for="meta in singleSelectList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
      </el-form-item>

      <div class="btns">
        <el-button type="primary" @click="submit" :loading="submitLoading"
          >下载 <el-icon><Download /></el-icon
        ></el-button>
      </div>
    </el-form>
    <el-dialog
      v-model="submitLoading"
      title="文件下载"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true"
    >
      <div class="dialog-process">
        <h4>下载总进度</h4>
        <div class="dialog-circle">
          <ProgressCircle :percent="percent" />
        </div>
        <h4>下载详情</h4>
        <div class="prompt" v-if="submitLoading">
          <p v-for="(item, index) in loadingText" :key="index">
            {{ item }}
          </p>
          <p v-for="(item, index) in errorText" :key="index" style="color: red">
            {{ item }}
          </p>
        </div>
      </div>
      <template #footer v-if="finshDownload">
        <span class="dialog-footer">
          <el-button @click="submitLoading = false">完 成</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref, onMounted, reactive, toRefs, watch } from "vue";
import { initialization } from "./initialization.js";
import ProgressCircle from "./ProgressCircle.vue";
import {
  Download,
  InfoFilled,
  Edit,
  UploadFilled,
  Picture,
} from "@element-plus/icons-vue";
import FileDownloader from "./downFiles.js";
export default {
  components: {
    Download,
    InfoFilled,
    Edit,
    UploadFilled,
    Picture,
    ProgressCircle,
  },
  setup() {
    const elform = ref(null);
    const loading = ref(true);
    const datas = reactive({
      percent: 0,
      finshDownload: false,
      loadingText: [],
      errorText: [],
      oTables: [],
      allInfo: [],
      allIndexFieldInfo: [],
      allAttachmentFieldList: [],
      selection: [],
      attachmentList: [],
      viewList: [],
      activeTable: [],
      submitLoading: false,
      singleSelectList: [],
      rules: {
        tableId: [
          {
            required: true,
            message: "请选择数据表",
            trigger: "change",
          },
        ],
        attachmentFileds: [
          {
            required: true,
            message: "请选择附件字段",
            trigger: "change",
          },
        ],
        viewField: [
          {
            required: true,
            message: "请选择视图",
            trigger: "change",
          },
        ],
        fileNameType: [
          {
            required: true,
            message: "请选择文件名命名方式",
            trigger: "change",
          },
        ],
        fileNameByField: [
          {
            required: true,
            message: "请选择文件命名字段",
            trigger: "change",
          },
        ],
        downloadType: [
          {
            required: true,
            message: "请选择文件下载方式",
            trigger: "change",
          },
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
              if (!value && !datas.formData.firstFolderKey) {
                callback();
              } else if (!datas.formData.firstFolderKey) {
                callback(new Error("请先选择一级目录"));
              } else if (value === datas.formData.firstFolderKey) {
                callback(new Error("二级目录不能与一级目录相同"));
              } else {
                callback();
              }
            },
            trigger: "change",
          },
        ],
      },
      formData: {
        tableId: "",
        attachmentFileds: [],
        fileNameType: 0,
        fileNameByField: "",
        viewField: "",
        downloadType: 1,
        downloadTypeByFoldes: false,

        firstFolderKey: "",
        secondFolderKey: "",
        deleteEmpty: true,
      },
    });
    const outputValue = ref(11);
    onMounted(async () => {
      await initialization(datas);
      loading.value = false;
    });
    watch(
      () => datas.formData.firstFolderKey,
      (newVal) => {
        // 清除二级目录的验证错误
        elform.value.clearValidate("secondFolderKey");
      }
    );
    watch(
      () => datas.formData.secondFolderKey,
      (newVal) => {
        if (!newVal && datas.formData.firstFolderKey) {
          elform.value.validateField("secondFolderKey");
        }
      }
    );
    const submit = async () => {
      if (!elform) return;
      await elform.value.validate(async (valid) => {
        if (valid) {
          const fileDownloader = new FileDownloader(datas);
          await fileDownloader.execute();
        }
      });
    };
    return {
      elform,
      outputValue,
      loading,
      submit,
      ...toRefs(datas),
    };
  },
};
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
    min-height: 60vh;
    padding: 16px;
    .dialog-process {
      h4 {
        color: var(--N900);
        margin-bottom: 16px;
        font-size: 16px;
        border-left: 3px solid var(--el-color-primary);
        padding-left:8px;
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
  }
}
</style>
