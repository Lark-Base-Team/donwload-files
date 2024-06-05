import { bitable, FieldType } from "@lark-base-open/js-sdk";
import { ElMessage } from "element-plus";
import { ref, onMounted, reactive, toRefs, watch, watchEffect } from "vue";
let first = true;
const SUPPORT_TEXTS = [
  "AutoNumber",
  "Barcode",
  "CreatedTime",
  "CreatedUser",
  "DateTime",
  "Location",
  "ModifiedTime",
  "ModifiedUser",
  "Number",
  "Phone",
  "Text",
  "Url",
  "User",
];
const SUPPORT_TYPES = SUPPORT_TEXTS.map((e) => FieldType[e]);
//根据tableMetaList，输出对应的fieldMetaList
async function getInfoByTableMetaList(tableMetaList) {
  let res = [];
  for (let i = 0; i < tableMetaList.length; i++) {
    let table = await bitable.base.getTableById(tableMetaList[i].id);
    let iFieldMetaList = await table.getFieldMetaList();
    let iViewMetaList = await table.getViewMetaList();
    const recordList = await table.getRecordList();
    let info = {
      recordList: recordList,
      tableId: tableMetaList[i].id,
      tableName: tableMetaList[i].name,
      fieldMetaList: iFieldMetaList,
      viewMetaList: iViewMetaList,
    };
    res.push(info);
  }
  return res;
}
//获得各个数据表的索引字段信息
function getIndexFieldMetaList(info) {
  let res = [];
  for (let i = 0; i < info.length; i++) {
    let iIndexFieldMetaList = info[i].fieldMetaList.filter(
      (item) => item.isPrimary === true
    );
    let indexFieldInfo = {
      tableId: info[i].tableId,
      tableName: info[i].tableName,
      indexFieldId: iIndexFieldMetaList[0].id,
      indexFieldName: iIndexFieldMetaList[0].name,
    };
    res.push(indexFieldInfo);
  }
  return res;
}
//在输入的内容中，检查是否包含type===17的字段，如果包含，则返回一个对象数组。
//每个对象，包含tableId,tablName,fieldMetaList（只返回符合type==17的内容）
function getAttachmentFieldMetaList(info) {
  let res = [];
  let hasAttachmentFieldMark = false;
  for (let i = 0; i < info.length; i++) {
    //从info中获取附件字段信息
    let iAttachmentFieldMetaList = info[i].fieldMetaList.filter(
      (item) => item.type === FieldType.Attachment
    );
    //如果数组长度>0，说明有附件字段，则将标记置为true.
    if (iAttachmentFieldMetaList.length > 0) {
      hasAttachmentFieldMark = true;
    }
    //输出附件字段的MetaList信息。
    let attachmentFieldInfo = {
      tableId: info[i].tableId,
      tableName: info[i].tableName,
      fieldMetaList: iAttachmentFieldMetaList,
    };
    res.push(attachmentFieldInfo);
  }
  //循环结束后，判断附件字段标记，如果为true，则返回结果。如果为false，则返回fasle
  if (hasAttachmentFieldMark) {
    return res;
  } else {
    return hasAttachmentFieldMark;
  }
}
export const initialization = async (datas) => {
  datas.oTables = await bitable.base.getTableMetaList();
  // 数据表
  datas.oTables = datas.oTables.filter(({ name }) => name);
  console.log("oTables", datas.oTables);

  datas.allInfo = await getInfoByTableMetaList(datas.oTables);
  console.log("allInfo", datas.allInfo);

  datas.allIndexFieldInfo = getIndexFieldMetaList(datas.allInfo);
  console.log("allIndexFieldInfo", datas.allIndexFieldInfo);

  datas.allAttachmentFieldList = getAttachmentFieldMetaList(datas.allInfo);
  console.log("allAttachmentFieldList", datas.allAttachmentFieldList);

  if (!datas.allAttachmentFieldList) {
    return alert("当前多维表格无附件类型字段");
  }

  // 刚渲染本插件的时候，用户所选的tableId等信息
  datas.selection = await bitable.base.getSelection();
  console.log("selection", datas.selection);
  //对表格字段选择控件，按照用户选择的数据表，设置初始的默认值
  datas.formData.tableId = datas.selection.tableId;

  watch(
    () => datas.formData.tableId,
    async (tableId) => {
      datas.formData.attachmentFileds = [];
      datas.formData.firstFolderKey = "";
      datas.formData.secondFolderKey = "";
      datas.formData.viewField = "";
      const activeTable = datas.allInfo.find((el) => el.tableId === tableId);
      datas.activeTable = activeTable;
      console.log("activeTable", activeTable);
      datas.attachmentList = datas.allAttachmentFieldList.find(
        (el) => el.tableId === tableId
      )["fieldMetaList"];
      console.log("attachmentList", datas.attachmentList);

      datas.viewList = activeTable["viewMetaList"];
      console.log("viewList", datas.viewList);
      console.log("FieldType", FieldType);
      // datas.singleSelectList = activeTable.fieldMetaList;
      datas.singleSelectList = activeTable.fieldMetaList.filter((e) =>
        SUPPORT_TYPES.includes(e.type)
      );

      if (first) {
        datas.formData.attachmentFileds = datas.attachmentList.map((e) => e.id);
        const viewItem = datas.viewList.find(
          (e) => e.id === datas.selection.viewId
        );
        console.log("datas.viewList", viewItem);
        if (viewItem) {
          datas.formData.viewField = viewItem["id"];
        } else {
          datas.formData.viewField = datas.viewList[0]["id"];
        }
        // first = false;
      }
    },
    {
      immediate: true,
    }
  );
};
