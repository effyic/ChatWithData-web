
/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data: any, id: any, parentId?: any, children?: any) {
    const config = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children',
    };

    const childrenListMap: any = {};
    const nodeIds: any = {};
    const tree = [];

    for (const d of data) {
        const parentId = d[config.parentId];
        if (childrenListMap[parentId] == null) {
            childrenListMap[parentId] = [];
        }
        nodeIds[d[config.id]] = d;
        childrenListMap[parentId].push(d);
    }

    for (const d of data) {
        const parentId = d[config.parentId];
        if (nodeIds[parentId] == null) {
            tree.push(d);
        }
    }

    for (const t of tree) {
        adaptToChildrenList(t);
    }

    function adaptToChildrenList(o: any) {
        if (childrenListMap[o[config.id]] !== null) {
            o[config.childrenList] = childrenListMap[o[config.id]];
        }
        if (o[config.childrenList]) {
            for (const c of o[config.childrenList]) {
                adaptToChildrenList(c);
            }
        }
    }
    return tree;
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: any) {
    let result = '';
    for (const propName of Object.keys(params)) {
        const value = params[propName];
        const part = encodeURIComponent(propName) + '=';
        if (value !== null && value !== '' && typeof value !== 'undefined') {
            if (typeof value === 'object') {
                for (const key of Object.keys(value)) {
                    if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
                        const params = propName + '[' + key + ']';
                        const subPart = encodeURIComponent(params) + '=';
                        result += subPart + encodeURIComponent(value[key]) + '&';
                    }
                }
            } else {
                result += part + encodeURIComponent(value) + '&';
            }
        }
    }
    return result;
}

// 返回项目路径
export function getNormalPath(p: any) {
    if (p.length === 0 || !p || p === 'undefined') {
        return p;
    }
    const res = p.replace('//', '/');
    if (res[res.length - 1] === '/') {
        return res.slice(0, res.length - 1);
    }
    return res;
}

/**
 * 智能转换字节单位
 * @param {number} bytes - 字节数
 * @returns {string} 带单位的格式化字符串
 */
export function formatBytes(bytes:number) {
  const KB = 1024;
  const MB = KB * 1024;
  
  if (bytes >= MB) {
    // 大于等于1MB时转为MB单位
    return (bytes / MB).toFixed(2) + ' MB';
  } else {
    // 不足1MB时转为KB单位
    return (bytes / KB).toFixed(2) + ' KB';
  }
}
