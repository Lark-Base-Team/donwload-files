import { bitable, FieldType } from '@lark-base-open/js-sdk'
const SUPPORT_TEXTS = [
  'Formula',
  'AutoNumber',
  'Barcode',
  'CreatedTime',
  'SingleSelect',
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

export function sortByOrder(arrayA, arrayB) {
  // 创建一个映射，以B数组的id为键，值为它们在B数组中的索引
  const orderMap = new Map(arrayB.map((item, index) => [item.id, index]))

  // 使用排序函数对A数组进行排序
  return arrayA.sort((a, b) => {
    // 获取A数组中对象在B数组中的索引
    const indexA = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity
    const indexB = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity

    // 根据B数组中的索引进行排序
    return indexA - indexB
  })
}
