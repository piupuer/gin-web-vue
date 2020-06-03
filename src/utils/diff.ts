// 数据比较工具包

import AppMain from '@/layout/components/AppMain.vue'

const jsondiffpatch = require('jsondiffpatch')

// 比较对象中产生更新的字段, 不支持深层对象
export const diffObjUpdate = (oldObj: any, newObj: any, key = 'id') => {
  const instance = jsondiffpatch.create()
  const delta = instance.diff(oldObj, newObj)
  const res: any = {}
  let update = false
  for (const deltaKey in delta) {
    const item = delta[deltaKey]
    // 长度为2表示数据发生更新
    if (item.length === 2) {
      // 记录update的内容
      res[deltaKey] = item[1]
      update = true
    }
  }
  if (update) {
    // 保留原始key
    res[key] = newObj[key]
  }
  return res
}

// 比较数组中更新的元素, 不支持深层对象, 默认通过数组元素的id进行比较
export const diffArrUpdate = (oldArr: any, newArr: any, key = 'id') => {
  const instance = jsondiffpatch.create({
    objectHash: (obj: any) => {
      return obj[key]
    },
  })
  if (!Array.isArray(oldArr) || !Array.isArray(newArr)) {
    throw new Error('非数组类型无法比较')
  }
  const delta = instance.diff(oldArr, newArr)
  const res: any = {
    create: [],
    update: [],
    delete: [],
  }
  console.log(delta)
  for (const key1 in delta) {
    const item = delta[key1]
    if (Array.isArray(item)) {
      // 第一个元素为空表示数组索引发生改变
      if (item[0] !== '') {
        // key带下划线表示数据删除
        // 其余表示创建了新元素
        if (key1.indexOf('_') === 0) {
          res.delete.push(item[0])
        } else {
          res.create.push(item[0])
        }
      }
    } else if (item.constructor === Object) {
      const newItem: any = {}
      // 对象非空说明数据有更新
      if (Object.keys(item).length > 0){
        for (const key2 in item) {
          // 由于是深层对象, 只记录全部更新, 不细分create/update/delete
          newItem[key2] = newArr[Number(key1)][key2]
        }
      }
      // 将更新的数据对应的id记录下来
      newItem[key] = newArr[Number(key1)][key]
      res.update.push(newItem)
    }
  }
  return res
}
