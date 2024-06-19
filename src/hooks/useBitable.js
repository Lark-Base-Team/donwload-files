import { bitable, FieldType } from '@lark-base-open/js-sdk'
const SUPPORT_TEXTS = [
  'Formula',
  'AutoNumber',
  'Barcode',
  'CreatedTime',
  'CreatedUser',
  'DateTime',
  'Location',
  'ModifiedTime',
  'ModifiedUser',
  'Number',
  'Phone',
  'Text',
  'Url',
  'User'
]
export const SUPPORT_TYPES = SUPPORT_TEXTS.map((e) => FieldType[e])

// 根据tableMetaList，输出对应的fieldMetaList
export async function getInfoByTableMetaList(tableMetaList) {
  const res = []
  for (let i = 0; i < tableMetaList.length; i++) {
    const table = await bitable.base.getTableById(tableMetaList[i].id)
    const fieldMetaList = await table.getFieldMetaList()
    const viewMetaList = await table.getViewMetaList()
    const info = {
      tableId: tableMetaList[i].id,
      tableName: tableMetaList[i].name,
      fieldMetaList: fieldMetaList,
      viewMetaList: viewMetaList
      // fieldList:fieldMetaList.filter(
      //   (item) => item.type === FieldType.Attachment
      // )
    }
    res.push(info)
  }
  return res
}

