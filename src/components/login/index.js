import './index.scss';
import _fgj from 'util/fgj.js'
import { MobileLogin } from 'api/user.js';

let templateIndex = require('./index.hbs');

/**
 * 登陆
 * @class Login
 * @param {Function} success 登陆成功之后的回调
 * @param {Function} cancel 取消登陆
 */
export default class Login {
  constructor() {
    this.defaultOption = {
    };
  }

  init(options) {
    this.option = $.extend({}, this.defaultOption, options);
    this.render();
  }

  // 绑定事件
  bindEvent() {
    this.onTab();
    this.account();  //账号密码登陆
    this.btnClose();   // 关闭按钮
  }

  // 渲染
  render() {
    let option = this.option;
    let html = _fgj.handlebars(templateIndex, {});
    
    _fgj.contentTips('', html, false, function (value) {
      // 取消登陆
      if (!value) {
        typeof option.cancel === 'function' && option.cancel()
      }
      // console.log(value)
    });

    // 渲染之后，再绑定事件
    this.bindEvent();
  }

  // 绑定tab切换事件
  onTab() {
    let currentIndex = 0,
        $body = $('.js_login_body');

    $('.js_login_tab .tab').each(function (index) {
      $(this).on('click', function () {
        if (currentIndex !== index) {
          currentIndex = index
          $(this).addClass('active').siblings().removeClass('active');
          $body.addClass('hide').eq(index).removeClass('hide');
        }
      })
    })
  }

  // 账号密码登陆
  account() {
    let $iphone   = $('.js_account_iphone'),
        $password = $('.js_account_password'),
        $submit   = $('.js_account_submit'),
        $alert    = $('.js_login_body').eq(1).find('.alert'),
        obj       = {};
  
    $submit.on('click', () => {
      // 验证数据输入是否正确
      obj = {
        Tel: $iphone.val(),
        PassWord: $password.val()
      };

      let verify = this.verify(obj);
      if (verify.result) {
        $alert.addClass('hide');
        // 发送请求
        MobileLogin(obj, res => {
          // 登陆成功
          swal.close();
          typeof this.option.success === 'function' && this.option.success();
        }, 
        err => {
          $alert.removeClass('hide').html(err.msg);
        });
      } 
      else {
        $alert.removeClass('hide').html(verify.msg);
      }
    });
  }

  // 验证数据输入是否正确
  verify(data) {
    let res = {
      result: false,
      msg: '错误提示'
    };
    // 验证手机号
    if ( !_fgj.validate(data.Tel, 'phone') ) {
      res.msg = '手机号有误'
      return res;
    };
    // 验证密码
    if ( !_fgj.validate(data.PassWord, 'require') || data.PassWord.length < 6 ) {
      res.msg = '密码有误'
      return res;
    };

    res.result = true;    // 验证成功后改为true
    return res;
  }

  // 关闭按钮
  btnClose() {
    $('.js_login .close').on('click', () => {
      swal.close();
    })
  }
};