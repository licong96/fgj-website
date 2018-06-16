import './index.scss';
import _fgj from 'util/fgj.js'
import * as Ladda from 'ladda';   // 按钮加载样式

import { MobileLogin, SendLoginValidate, MobileValidateSignOrLogin } from 'api/user.js';

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
    this.quickLogin();  // 手机号快捷登陆
    this.account();  // 账号密码登陆
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

  // 手机号快捷登陆
  quickLogin() {
    let $iphone   = $('.js_quick_iphone'),
        $code     = $('.js_quick_code'),
        $getCode  = $('.js_quick_get_code'),
        $submit   = $('.js_quick_submit'),
        $alert    = $('.js_login_body').eq(0).find('.alert'),
        iphoneVal = '',
        codeVal   = '',
        num       = 60,
        time      = null,
        load      = null;

    // 获取验证码
    $getCode.on('click', () => {
      iphoneVal = $iphone.val();

      if (!_fgj.validate(iphoneVal, 'phone')) {
        $alert.removeClass('hide').html('手机号有误');
        return
      }
      
      load = Ladda.create($getCode[0]);
      load.start();
      SendLoginValidate({
        Tel: iphoneVal
      }, 
      res => {
        load.remove();
        count(num);   // 倒计时
      }, 
      err => {
        load.remove();
        $alert.removeClass('hide').html(err.msg);
      })
    });

    // 登陆
    $submit.on('click', () => {
      codeVal = $code.val();
      iphoneVal = $iphone.val();

      if (!_fgj.validate(iphoneVal, 'phone')) {
        $alert.removeClass('hide').html('手机号有误');
        return
      }
      if (!codeVal) {
        $alert.removeClass('hide').html('请输入验证码');
        return
      };
      
      load = Ladda.create($submit[0]);
      load.start();
      MobileValidateSignOrLogin({
        Tel: iphoneVal,
        ValiNum: codeVal
      }, 
      res => {
        load.remove();
        swal.close();
        typeof this.option.success === 'function' && this.option.success();
      }, 
      err => {
        load.remove();
        $alert.removeClass('hide').html(err.msg);
      })
    });

    // 倒计时，60秒后再获取
    function count(num) {
      $getCode.attr('disabled', true).html(num + '秒后再获取');
      time = setTimeout(() => {
        if (num <= 0) {
          clearTimeout(time)
          $getCode.attr('disabled', false).html('获取验证码');
        } 
        else {
          num--
          count(num)
        }
      }, 1000);
    }
  }

  // 账号密码登陆
  account() {
    let $iphone   = $('.js_account_iphone'),
        $password = $('.js_account_password'),
        $submit   = $('.js_account_submit'),
        $alert    = $('.js_login_body').eq(1).find('.alert'),
        obj       = {},
        load      = null;
  
    $submit.on('click', () => {
      // 验证数据输入是否正确
      obj = {
        Tel: $iphone.val(),
        PassWord: $password.val()
      };

      let verify = this.verify(obj);
      if (verify.result) {
        $alert.addClass('hide');
        load = Ladda.create($submit[0]);
        load.start();
        // 发送请求
        MobileLogin(obj, res => {
          load.remove();
          swal.close();
          typeof this.option.success === 'function' && this.option.success();
        }, 
        err => {
          load.remove();
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