import axios from 'axios'

export default function fetch(method, url, params) {
  return new Promise((resolve, reject) => {
    // get和post要传的参数格式不一样
    var data = method === 'get' ? { params: params } : params

    if (method === 'get') {
      axios.get(url, data)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
    } else {
      axios({
        url: url,
        method: 'post',
        data: data,
        transformRequest: [function (data) {
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'   // 头信息改成from-data
        }
      }).then(res => {
          resolve(res)
        })
        .catch(err => {
          alert('catch：' + err)
          reject(err)
        })
    }
  })
};