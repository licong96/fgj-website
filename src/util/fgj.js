import swal from 'sweetalert';

var Handlebars = require('handlebars');

var conf = {
  serverHost: ''      // webpack里面配置了 (/) ，所以这里不需要填写
};

var _fgj = {
  // 网络请求
  request: function (param) {
    var _this = this;
    $.ajax({
      type: param.method || 'get',
      url: param.url || '',
      dataType: param.type || 'json',
      data: param.data || {},
      success: function (res) {
        // console.log(res)
        if (res.result === 'success') {
          typeof param.success === 'function' && param.success(res);
        } else {
          typeof param.error === 'function' && param.error(res);
        }
      },
      error: function (err) {
        _this.errorTips('有一个请求失败了', err.responseText.substring(0, 400));
      }
    })
  },
  // 如果有需要的话，获取服务器地址
  getServerUrl: function (path) {
    return conf.serverHost + path
  },
  // 获取url参数
  getUrlParam: function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var result = window.location.search.substr(1).match(reg);
    return result ? decodeURIComponent(result[2]) : null;
  },
  // 渲染 Handlebars 模板
  /** 常用方法
   * #each 可以循环
   * this 可以访问到当前的上下文
   * #with 可以改变当前的上下文
   * @index 可以获取当前的序列号
   * 对于object，可以使用{{@key}}获取当前的key
   * #unless 的作用和 #if 刚好相反，表达式返回false的时候渲染
   * log 允许执行模板的时候输出当前上下文的状态
   * @first 和 @last 判断当前的第一步和最后一步
   * ../ 引用上一级的作用域
   * [].[0] 数组引用要加 .
   */
  handlebars: function (source, data) {
    var template = Handlebars.compile(source),
        result = template(data);
    return result
  },
  // 注册一个helpers
  registerHelper: function (name, callback) {
  },
  // 成功提示
  successTips: function (title, msg = '', callback) {
    swal({
      title: title,
      text: msg,
      icon: 'success',
      button: {
        text: '知道了'
      }
    }).then(value => {
      return callback && callback(value)
    })
  },
  // 失败提示
  errorTips: function (title, msg) {
    swal({
      title: title,
      text: msg,
      icon: 'error',
      button: {
        text: '知道了'
      }
    })
  },
  // 自定义内容提示
  contentTips: function (title, html, button, callback) {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = html;   // html字符串

    swal({
      title: title,
      content: wrapper,
      button: button
    }).then(value => {
      return callback && callback(value)
    })
  },
  // 字段验证，支持非空、手机号、邮箱号
  validate: function (value, type) {
    var value = $.trim(value);
    // 非空验证
    if (type === 'require') {
      return !!value;
    }
    // 只验证数字
    if (type === 'number') {
      return /^[0-9]*$/.test(value)
    }
    // 验证数字和小数点验证
    if (type === 'number-dot') {
      return /^[0-9]+\.{0,1}[0-9]{0,5}$/.test(value)
    }
    if (type === 'phone') {
      return /^(13[0-9]|147|15[0-9]|18[0-9]|17[0-9]|19[0-9]|16[0-9])([0-9]{8})$/.test(value)
    }
    // 邮箱号验证
    if (type === 'email') {
      return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value);
    }
  },
  // 统一登录处理
  doLogin: function () {
    window.location.href = './user-login.html?redirect=' + encodeURIComponent(window.location.href);
  },
  // 跳首页
  goHome: function () {
    window.location.href = './index.html';
  },
  setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
  },
  getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
      return unescape(arr[2]);
    }
    else {
      return null;
    }
  },
  delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) {
      document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }
  },
  // // 获取cookies
  // getCookies(c_name) {
  //   var c_start = null
  //   var c_end = null
  //   if (document.cookie.length > 0) {
  //     c_start = document.cookie.indexOf(c_name + "=");
  //     if (c_start != -1) {
  //       c_start = c_start + c_name.length + 1;
  //       c_end = document.cookie.indexOf(";", c_start);
  //       if (c_end == -1) c_end = document.cookie.length;
  //       return decodeURI(document.cookie.substring(c_start, c_end));
  //     }
  //   };
  //   return null;
  // },
  // 图片线上地址
  photoPath() {
    return 'http://t.vipfgj.com';
    // return '';
  }
};

export default _fgj;