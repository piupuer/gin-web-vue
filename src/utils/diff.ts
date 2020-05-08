// 数据比较工具包

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
    }
  })
  if (!Array.isArray(oldArr) || !Array.isArray(newArr)) {
    throw new Error('非数组类型无法比较')
  }
  const delta = instance.diff(oldArr, newArr)
  const res: any = {
    create: [],
    update: [],
    delete: []
  }
  for (const key1 in delta) {
    const item = delta[key1]
    if (Array.isArray(item)) {
      if (key1.indexOf('_') === 0) {
        res.delete.push(item[0])
      } else {
        res.create.push(item[0])
      }
    } else if (item.constructor === Object) {
      const newItem: any = {}
      for (const key2 in item) {
        const item2 = item[key2]
        newItem[key2] = item2[1]
      }
      // 将更新的数据对应的id记录下来
      newItem[key] = newArr[Number(key1)][key]
      res.update.push(newItem)
    }
  }
  return res
}
