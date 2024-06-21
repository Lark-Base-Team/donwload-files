import { FieldType } from '@lark-base-open/js-sdk'

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

export const getFileSize = (size) => {
  if (size >= 1073741824) return (size / 1073741824).toFixed(2) + 'G'
  if (size >= 1048576) return (size / 1048576).toFixed(2) + 'M'
  if (size >= 1024) return (size / 1024).toFixed(2) + 'K'
  return size.toFixed(2) + 'B'
}
export const removeSpecialChars = (str) =>
  str.replace(/[\n\t\r]/g, '').replace(/\//g, '-')

export const getFolderName = (value) => {
  if (!value) return ''
  if (Array.isArray(value) && value.length) {
    return value[0]?.text || value[0]?.name
  }
  if (typeof value === 'object') return value.text || value.name
  return value
}

export const replaceFileName = (originalName, newName, emptyName = '') => {
  const extension = originalName.split('.').pop()
  return newName
    ? `${newName}.${extension}`
    : `${emptyName}.${extension}`
}
