// 数组交集
export function arrayIntersection (arr1, arr2) {
  return arr1.filter(v => arr2.includes(v))
}
// 数组并集
export function arrayUnion (arr1, arr2) {
  return arr1.concat(arr2)
}

// 数组差集，arr1中有，arr2中没有，相当于 arr1 - arr2，如：[1,2,3] - [1,2,4] = [3]
export function arrayDifference (arr1, arr2) {
  return arr1.filter(v => !arr2.includes(v))
}

// 将 map 中没有的数据补白，顺便比较列是否一致,用在表和字段/索引上，比较表的时候需要传key1
// table的列信息在key1（Meta）里,keyOrder1 防止keyOrder相同不能确定顺序
export function appendMap (leftMapParam, rightMapParam, key1, keyOrder ,keyOrder1, compareKeys) {
  const leftMap = JSON.parse(JSON.stringify(leftMapParam)) // deep clone
  const rightMap = JSON.parse(JSON.stringify(rightMapParam)) // deep clone

  const leftArr = Object.values(leftMap)
  const rightArr = Object.values(rightMap)

  const leftKeys = Object.keys(leftMap)
  const rightKeys = Object.keys(rightMap)

  // 补白
  const rightNotHas = arrayDifference(leftKeys, rightKeys) // 右边没有的表名
  const leftNotHas = arrayDifference(rightKeys, leftKeys) // 左边没有的表名

  leftNotHas.forEach(function (v) {
    const leftRow = JSON.parse(JSON.stringify(rightMap[v]))
    if (key1.length > 0) {
      leftRow[key1].IS_PLACEHOLDER = true // 占位
      rightMap[v][key1].IS_ALONE = true
    } else {
      leftRow.IS_PLACEHOLDER = true // 占位
      rightMap[v].IS_ALONE = true
    }

    leftArr.push(leftRow)
  })

  rightNotHas.forEach(function (v) {
    const rightRow = JSON.parse(JSON.stringify(leftMap[v]))
    if (key1.length > 0) {
      rightRow[key1].IS_PLACEHOLDER = true // 占位
      leftMap[v][key1].IS_ALONE = true
    } else {
      rightRow.IS_PLACEHOLDER = true // 占位
      leftMap[v].IS_ALONE = true // 占位
    }
    rightArr.push(rightRow)
  })

  let sortFunc = function (a, b) {
    if (key1.length > 0) {
      let res =  ('' + a[key1][keyOrder]).localeCompare(b[key1][keyOrder])
      if(res != 0) {
        return res
      }
      return  ('' + a[key1][keyOrder1]).localeCompare(b[key1][keyOrder1])
    } else {
      let res =  ('' + a[keyOrder]).localeCompare(b[keyOrder])
      if(res != 0) {
        return res
      }
      return ('' + a[keyOrder1]).localeCompare(b[keyOrder1])
    }
  }

  leftArr.sort(sortFunc)
  rightArr.sort(sortFunc)

  // 开始比较表信息是否相同
  const tableUnEqualKeys = {}
  const intersection = arrayIntersection(leftKeys, rightKeys) // 交集，两边都有的，要比较表信息相同
  intersection.forEach(function (v) {
    if (key1.length > 0) {
      tableUnEqualKeys[v] = compareObject(leftMap[v][key1], rightMap[v][key1], compareKeys)
    } else {
      tableUnEqualKeys[v] = compareObject(leftMap[v], rightMap[v], compareKeys)
    }
  })

  return [leftArr, rightArr, tableUnEqualKeys]
}

// objectCompare 比较两个对象，keys 是要比较的列，返回不相等的列
export function compareObject (obj1, obj2, keys) {
  return keys.filter(function (v) {
    // String(null) = "null"
    if (!obj1[v] && !obj2[v]) {
      return false
    }
    return (obj1[v] + '') !== (obj2[v] + '')
  })
}
