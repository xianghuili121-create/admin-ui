import request from '@/utils/request';

// 查询角色列表
export function getRoleList(query){
    return request({
        url:"/role/list",
        method:"get",
        params: query
    })
}

// 新增角色
export function addRole(data){
    return request({
        url:"/role",
        method:"post",
        data
    })
}

// 修改角色
export function aditRole(data){
    return request({
        url:"/role",
        method:"put",
        data
    })
}

// 根据id查角色详细
export function getRoleById(id){
    return request({
        url:"/role/"+id,
        method:"get"
    })
}

// 根据id删除角色
export function deleteRoleById(id){
    return request({
        url:"/role/"+id,
        method:"delete"
    })
}
