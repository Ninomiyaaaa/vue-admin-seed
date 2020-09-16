/**
 * Created by wentao.z
 * NSNTC
 * on 2020-09-14
 */
import $http from '@/utils/http'

// 商品新增
export function goodsAdd(params) {
  return $http.POST('/goods/add', params)
}

// 商品修改
export function goodsUpdate(params) {
  return $http.POST('/goods/update', params)
}

// 商品分页
export function goodsPage(params) {
  return $http.POST('/goods/page', params)
}

// 商品分页
export function goodsQuery(params) {
  return $http.POST('/goods/query', params)
}

// 商品删除
export function goodsDelete(params) {
  return $http.POST('/goods/delete', params)
}
