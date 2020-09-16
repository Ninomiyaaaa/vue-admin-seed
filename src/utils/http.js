import axios from 'axios'
import store from '@/store'
import qs from 'qs'
import router from '@/router'
import { httpTimeOut, apiCode, httpNullParams } from '@/config'
import { Notification } from 'element-ui'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: httpTimeOut
})

// 响应数据拦截器
service.interceptors.response.use(
  response => {
    // oss
    const res = response.data
    if (!res && apiCode.httpState.indexOf(response.status) !== -1) {
      return res
    }
    // 匹配到正确的code 返回成功
    if (apiCode.success.indexOf(res.code) !== -1) {
      return res
    } else {
      // 匹配到非法登陆
      if (apiCode.illegal.indexOf(res.code) !== -1) {
        store.commit('app/removeToken')
        if (!sessionStorage.getItem('http-api')) {
          sessionStorage.setItem('http-api', 1)
          Notification({
            showClose: true,
            title: '登录异常',
            message: res.msg,
            type: 'warning'
          })
          setTimeout(() => {
            sessionStorage.removeItem('http-api')
          }, 1000)
          router.replace('/')
        }
      } else {
        // 匹配 不再白名单里面的异常(如果在白名单，异常不会全局抛出)
        if (apiCode.error.indexOf(res.code) === -1) {
          if (process.env.NODE_ENV === 'development') {
            Notification({
              showClose: true,
              title: '系统异常',
              dangerouslyUseHTMLString: true,
              message: `<code class='app-code'>${response.config.url}</code> <br/> <b>异常信息：</b>${res.msg}`,
              type: 'error'
            })
          } else {
            Notification({
              showClose: true,
              title: '警告',
              message: res.msg,
              type: 'warning'
            })
          }
        }
      }
      return Promise.reject(res)
    }
  },
  error => {
    if (String(error) === 'Cancel') {
      console.warn('请求已主动中断')
      return Promise.reject({ code: 0, data: null, msg: '请求已中断' })
    } else {
      Notification({
        showClose: true,
        title: '错误',
        message: error,
        type: 'error'
      })
      return Promise.reject(error)
    }
  }
)

function request(url, method, data, isJson, cancelFun = () => {}) {
  return new Promise((resolve, reject) => {
    const transformRequest = isJson
      ? [
          function(data, headers) {
            headers['Content-Type'] = 'application/json'
            return data
          }
        ]
      : null
    if (httpNullParams) {
      deleteNullVal(data)
    }
    const CancelToken = axios.CancelToken
    let params = {
      url,
      method,
      cancelToken: new CancelToken(c => {
        cancelFun(c)
      })
    }
    switch (method) {
      case 'get':
        params.params = data
        break
      case 'post':
      case 'put':
        params.transformRequest = transformRequest
        params.data = isJson ? JSON.stringify(data) : qs.stringify(data)
        break
      case 'delete':
        if (isJson) {
          params.transformRequest = transformRequest
          params.data = JSON.stringify(data)
        } else {
          params.params = data
        }
        break
      case 'native':
        params.method = 'post'
        params.data = data
        params.transformRequest = transformRequest
        break
    }
    service(params)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

// 删除为空的值
function deleteNullVal(data) {
  for (const key in data) {
    if (data[key] === '' || data[key] === null || data[key] === undefined) {
      // console.warn('已自动删除空属性:', key)
      delete data[key]
    }
  }
}

/**
 * CURD
 */

function GET(url, data, isJson = false, cancelFun) {
  return request(url, 'get', data, isJson, cancelFun)
}

function POST(url, data, isJson = false, cancelFun) {
  return request(url, 'post', data, isJson, cancelFun)
}

function PUT(url, data, isJson = false, cancelFun) {
  return request(url, 'put', data, isJson, cancelFun)
}

function APP_DELETE(url, data, isJson = false, cancelFun) {
  return request(url, 'delete', data, isJson, cancelFun)
}

function NATIVE(url, data, isJson = false) {
  return request(url, 'native', data, isJson)
}

export default {
  GET,
  POST,
  PUT,
  DELETE: APP_DELETE,
  NATIVE
}
