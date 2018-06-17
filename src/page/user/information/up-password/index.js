import './index.scss';

import * as Ladda from 'ladda';   // 按钮加载样式
import _fgj from 'util/fgj.js'; 
import { SendLoginValidate } from 'api/user.js';
import { UpPassword } from 'api/user/information.js';

let tempIndex = require('./index.hbs');

// 修改密码
let upPassword = {
  el: {},
  data: {},
  init(data) {
    this.data = data;   // 要把用户数据传过来
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.render();    // 渲染内容
    this.postTel();   // 填充号码
  },
  bindEvent() {
    this.onUpPassword();    // 修改密码
    this.getCode();   // 获取验证码
  },
  // 渲染内容
  render() {
    let $passWrap = $('.js_up_password');
    let html = _fgj.handlebars(tempIndex, {});
    $('.js_up_password_box').html(html);

    $passWrap.show();

    this.getElement();  // 获取页面元素
  },
  // 获取页面元素
  getElement() {
    this.el = {
      Tel         : $('#passTel'),
      ValiNum     : $('#ValiNum'),
      PassWord    : $('#PassWord'),
      NewPassWord : $('#NewPassWord'),
      $alert      : $('#modalUpPassword .alert'),
      $confrim    : $('#modalUpPassword .js_btn_confrim'),
      $getCode    : $('#modalUpPassword .js_get_code'),
    }
  },
  // 填充号码
  postTel() {
    $('#passTel').val(this.data._tel);
  },
  // 修改密码
  onUpPassword() {
    let UserID      = _fgj.getCookie('CUserID'),
        el          = this.el,
        Tel         = el.Tel,
        ValiNum     = el.ValiNum,
        PassWord    = el.PassWord,
        NewPassWord = el.NewPassWord,
        $alert      = el.$alert,
        $confrim    = el.$confrim,
        obj         = {},
        load        = null;

    $confrim.on('click', () => {
      obj = {
        UserID: UserID,
        Tel: Tel.val(),
        ValiNum: ValiNum.val(),
        PassWord: PassWord.val(),
        NewPassWord: NewPassWord.val()
      };
      
      let verify = this.verify(obj);

      if (verify.result) {
        $alert.addClass('hide');
        load = Ladda.create($confrim[0]);
        load.start();
        UpPassword(obj, res => {
          load.remove();
          // 修改成功后，还原输入框
          $('#modalUpPassword').modal('hide');
          ValiNum.val('');
          PassWord.val('');
          NewPassWord.val('');
          _fgj.successTips('密码修改成功！');
        }, 
        err => {
          load.remove();
          $alert.removeClass('hide').html(err.msg);
        })
      } 
      else {
        $alert.removeClass('hide').html(verify.msg);
      }
    });
  },
  // 验证数据输入是否正确
  verify(data) {
    let res = {
      result: false,
      msg: '错误提示'
    };
    // 验证码
    if ( !_fgj.validate(data.ValiNum, 'require') ) {
      res.msg = '请输入验证码'
      return res;
    };
    // 旧密码
    if ( !_fgj.validate(data.PassWord, 'require') ) {
      res.msg = '请输入旧密码'
      return res;
    };
    // 新密码
    if ( !_fgj.validate(data.NewPassWord, 'require') ) {
      res.msg = '请输入新密码'
      return res;
    };

    // 判断新密码不能和旧密码一样
    if (data.PassWord === data.NewPassWord) {
      res.msg = '新密码不能和旧密码一样'
      return res;
    }

    res.result = true;    // 验证成功后改为true
    return res;
  },
  // 获取验证码
  getCode() {
    let el        = this.el,
        $getCode  = el.$getCode,
        Tel       = el.Tel,
        $alert    = el.$alert,
        time      = null,
        num       = 60,
        load      = null;

    $getCode.on('click', () => {
      load = Ladda.create($getCode[0]);
      load.start();
      SendLoginValidate({
        Tel: Tel.val()
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
};

export default upPassword;