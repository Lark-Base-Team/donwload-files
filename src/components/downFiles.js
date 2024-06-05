import { bitable } from "@lark-base-open/js-sdk";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import axios from "axios";

const DEFAULT_FOLDER_NAME = "未分类";
const MAX_ZIP_SIZE_NUM = 1;

const MAX_ZIP_SIZE = MAX_ZIP_SIZE_NUM * 1024 * 1024 * 1024;
const TREE_MAPS = ["rootTreeNode", "folderTreeNode"];

// Utility functions
const getFileSize = (size) => {
  if (size >= 1073741824) return (size / 1073741824).toFixed(2) + "G";
  if (size >= 1048576) return (size / 1048576).toFixed(2) + "M";
  if (size >= 1024) return (size / 1024).toFixed(2) + "K";
  return size.toFixed(2) + "B";
};

const removeSpecialChars = (str) =>
  str.replace(/[\n\t\r]/g, "").replace(/\//g, "-");

const getFolderName = (value) => {
  if (!value) return "";
  if (Array.isArray(value) && value.length)
    return value[0]?.text || value[0]?.name;
  if (typeof value === "object") return value.text || value.name;
  return value;
};

const replaceFileName = (originalName, newName) => {
  const extension = originalName.split(".").pop();
  return newName ? `${newName}.${extension}` : `未定义.${extension}`;
};

// Strategy Pattern for download methods
class DownloadStrategy {
  constructor(datas) {
    this.datas = datas;
  }
  async _downloadFile(file, index, onProgress) {
    try {
      const response = await axios({
        method: "get",
        responseType: "blob",
        url: file.file_url,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onProgress) {
              onProgress(percentage, index);
            }
          }
        },
      });
      return response.data;
    } catch (error) {
      this.datas.errorText.push(
        `${file.file_name} 文件下载失败，错误信息: ${error.message}`
      );
      throw error;
    }
  }

  async downloadFile(file, index) {
    try {
      const blob = await this._downloadFile(
        file,
        index,
        (percentage, index) => {
          this.datas.loadingText[4] = `正在下载第 ${index} 个 文件,当前文件下载进度${percentage}%`;
        }
      ).catch();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", objectUrl);
      a.setAttribute("download", file.file_name);
      a.click();
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      datas.errorText.push(
        `${file.file_name} 文件下载失败，错误信息: ${error.message}`
      );
    }
  }

  async addToZip(zip, file, path = "", index) {
    try {
      const blob = await this._downloadFile(
        file,
        index,
        (percentage, index) => {
          this.datas.loadingText[4] = `正在下载第 ${index} 个 文件,当前文件下载进度${percentage}%`;
        }
      ).catch();
      zip.file(`${path}/${file.file_name}`, blob);
    } catch (error) {
      this.datas.errorText.push(
        `${file.file_name} 文件下载失败，错误信息: ${error.message}`
      );
    }
  }
}

class ZipDownloadStrategy extends DownloadStrategy {
  constructor(datas) {
    super(datas);
    this.zip = new JSZip();
    this.currentTotalSize = 0;
    this.zipIndex = 0;
  }

  async saveAndResetZip() {
    const len = this.datas.loadingText.length;
    const content = await this.zip.generateAsync(
      { type: "blob" },
      (metadata) => {
        const percent = metadata.percent.toFixed(2);
        this.datas.loadingText[len] = `打包文件生成中：${percent}%已完成。`;
      }
    );
    saveAs(
      content,
      `${this.datas.activeTable.tableName}${
        this.zipIndex ? this.zipIndex : ""
      }.zip`
    );
    this.zip = new JSZip();
    this.currentTotalSize = 0;
    this.zipIndex++;
  }

  async processFiles(fileList, withFolders = false, callback = () => {}) {
    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];
      this.datas.loadingText[4] = `正在下载第 ${
        index + 1
      } 个 文件,当前文件下载进度0%`;

      let path = "";
      if (withFolders) {
        if (file.rootTreeNode) path += `${file.rootTreeNode}/`;
        if (file.folderTreeNode) path += `${file.folderTreeNode}/`;
      }

      if (file.size > MAX_ZIP_SIZE) {
        await this.downloadFile(file, index + 1);
      } else {
        this.currentTotalSize += file.size;
        if (this.currentTotalSize >= MAX_ZIP_SIZE) {
          this.datas.loadingText[
            this.datas.loadingText.length
          ] = `当前文件大小即将超过${MAX_ZIP_SIZE_NUM}GB，避免插件崩溃，准备先下载到您本地，在进行后续下载...`;
          await this.saveAndResetZip();
        }

        let uniqueFileName = this.getUniqueFileName(file, path);
        file.file_name = uniqueFileName;
        await this.addToZip(this.zip, file, path, index + 1).catch();
      }
      callback(index + 1);
    }
    await this.saveAndResetZip();
  }

  getUniqueFileName(file, path) {
    let uniqueFileName = file.file_name;
    const fileExtension = uniqueFileName.substring(
      uniqueFileName.lastIndexOf(".")
    );
    let baseName = uniqueFileName.substring(0, uniqueFileName.lastIndexOf("."));
    let nameIndex = 1;
    while (this.datas.nameSpace.has(path + uniqueFileName)) {
      uniqueFileName = `${baseName}_${nameIndex}${fileExtension}`;
      nameIndex++;
    }
    this.datas.nameSpace.add(path + uniqueFileName);
    return uniqueFileName;
  }
}

class FileDownloader {
  constructor(datas) {
    this.datas = datas;
    this.total = 0;
    this.current = 0;
    this.strategy = this.getStrategy(datas.formData.downloadType);
    this.datas.nameSpace = new Set();
    this.datas.loadingText = [];
    this.datas.errorText = []
    this.datas.percent = 0;
    this.datas.finshDownload = false;
    this.datas.submitLoading = true;
  }

  getStrategy(downloadType) {
    return downloadType === 2
      ? new DownloadStrategy(this.datas)
      : new ZipDownloadStrategy(this.datas);
  }

  async getCellsAddressList(oTable) {
    const fieldIdList = this.datas.formData.attachmentFileds;
    const oView = await oTable.getViewById(this.datas.formData.viewField);
    const oRecordList = await oView.getVisibleRecordIdList();

    let fileQty = 0;
    const cellsAddressList = [];

    for (const fieldId of fieldIdList) {
      for (const recordId of oRecordList) {
        const oCell = await oTable.getCellValue(fieldId, recordId);
        if (oCell) {
          fileQty += oCell.length;
          cellsAddressList.push({ fieldId, recordId });
          this.datas.fileQty += oCell.length;
          this.datas.loadingText[0] = `计算待下载文件数量……${fileQty}个。若较慢，请刷新页面后重新尝试。`;
        }
      }
    }
    return { cellsAddressList, fileQty };
  }

  async getFileInfo(oTable, fieldId, recordId, indexFieldId, fields = []) {
    const oCell = await oTable.getCellValue(fieldId, recordId);
    const fileList = [];

    for (const cell of oCell) {
      const { token, name: oFileName, size } = cell;
      console.log(oFileName);
      const oURL = await oTable.getAttachmentUrl(token, fieldId, recordId);
      const newName = indexFieldId
        ? await oTable.getCellString(indexFieldId, recordId)
        : oFileName;
      const fileName =
        oFileName === newName ? oFileName : replaceFileName(oFileName, newName);
      const fileInfo = {
        file_url: oURL,
        file_name: removeSpecialChars(fileName),
        size,
      };

      if (fields.length) {
        for (let i = 0; i < fields.length; i++) {
          const fieldCell = await oTable.getCellString(fields[i], recordId);
          fileInfo[TREE_MAPS[i]] =
            removeSpecialChars(getFolderName(fieldCell)) || DEFAULT_FOLDER_NAME;
        }
      }
      fileList.push(fileInfo);
    }
    return fileList;
  }
  getProgress() {
    this.datas.percent = ((this.current / this.total) * 100).toFixed(2);
  }

  async execute() {
    const oTable = await bitable.base.getTableById(this.datas.formData.tableId);
    const indexFieldId =
      this.datas.formData.fileNameType === 1
        ? this.datas.activeTable.fieldMetaList.find(
            (e) => e.id === this.datas.formData.fileNameByField
          ).id
        : "";

    const { cellsAddressList, fileQty } = await this.getCellsAddressList(
      oTable
    );
    this.total = fileQty;
    this.datas.loadingText[0] = `共计有${fileQty}个文件待下载。`;
    if (!fileQty) {
      this.datas.loadingText[1]= `当前无文件需要下载，请确认`;
      this.datas.finshDownload = true;
      return "";
    }
    this.datas.loadingText[1] = `正在获取文件信息...`;
    let totalSize = 0;
    const fileList = [];

    for (const cell of cellsAddressList) {
      const fileInfo = await this.getFileInfo(
        oTable,
        cell.fieldId,
        cell.recordId,
        indexFieldId,
        [
          this.datas.formData.firstFolderKey,
          this.datas.formData.secondFolderKey,
        ].filter(Boolean)
      );
      fileInfo.forEach((item) => (totalSize += item.size));
      this.datas.loadingText[2] = `当前文件总大小${getFileSize(totalSize)}`;
      fileList.push(...fileInfo);
    }
    this.datas.loadingText[3] = `准备下载文件`;
    const withFolders =
      this.datas.formData.downloadTypeByFoldes &&
      this.datas.formData.firstFolderKey;
    if (this.datas.formData.downloadType === 2) {
      for (let index = 0; index < fileList.length; index++) {
        this.current = index;
        const file = fileList[index];
        this.datas.loadingText[4] = `正在下载第 ${
          index + 1
        } 个 文件,当前文件下载进度0%`;
        await this.strategy.downloadFile(file, index + 1);
        this.getProgress();
      }
    } else {
      await this.strategy.processFiles(fileList, withFolders, (index) => {
        this.current = index;
        this.getProgress();
      });
    }
    this.current = fileList.length;
    this.getProgress();
    this.datas.finshDownload = true;
  }
}

export default FileDownloader;
