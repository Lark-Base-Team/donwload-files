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
