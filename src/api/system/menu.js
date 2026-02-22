import request from '@/utils/request';

// 查询菜单列表
export function getMenuList(query){
    return request({
        url:"/menu/list",
        method:"get",
        params: query
    })
}

// 新增菜单
export function addMenu(data){
    return request({
        url:"/menu",
        method:"post",
        data
    })
}

// 删除菜单
export function deleteById(menuId){
    return request({
        url:"/menu/"+menuId,
        method:"delete"
    })
}

// 修改菜单
export function upMenu(data){
    return request({
        url:"/menu",
        method:"put",
        data
    })
}

// 根据id查菜单详细
export function getMenuById(menuId){
    return request({
        url:"/menu/"+menuId,
        method:"get",
    })
}
