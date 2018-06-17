import './index.scss';
import _fgj from 'util/fgj.js'; 

import HintTop from 'components/hint-top/index.js';
import Login from 'components/login/index.js';

import { GetMyInfo } from 'api/user.js';

let tempUserInfo = require('./user-info.hbs');

// 导航
/**
 * @class HeaderNav
 */
export default class HeaderNav {
  constructor() {
    // 默认参数
    this.defaultOption = {
      current: null,    // 当前导航元素
      fullNav: $('.js_head_nav_fixed'),
      aNav: $('.js_header_nav .nav-a'),
      oLine: $('.js_header_nav .line'),
      scrollTop: 680,   // 距离顶部的位置
    }
  }

  // 初始化
  init(options) {
    let option = this.option = $.extend({}, this.defaultOption, options);

    this.active();    // 给当前导航添加样式
    this.navFull();   // 监听页面高度，显示浮动导航
    this.getElement();
    this.bindEvent();

    // 添加到消息队列中
    setTimeout(() => {
      if (option.current) {
        this.line();    // 添加下划线运动
        option.oLine.css({'opacity': 1});
      } else {
        option.oLine.hide();
      }
    }, 30);

  }

  getElement() {
    this.el = {
      navLoginBtn: $('#navLoginBtn'),
      navUserLink: $('#navUserLink')
    }
  }

  bindEvent() {
    // 判断是否登陆
    if (_fgj.getCookie('CUserID')) {
      this.GetMyInfo();   // 如果已登录就去获取用户信息
    } else {
      this.onLogin();
    }
  }

  // 给当前导航添加样式
  active() {
    let current = this.option.current;
    if(current) {
      current.addClass('active');
    }
  }

  // 添加下划线运动
  line() {
    let option = this.option;
    let pos = [];   // 存储每个导航的位置信息
    let time = null;
    let currentPosition = this.getPosition(option.current);    // 当前选中的元素位置
    let aNav = option.aNav;
    let leng = option.aNav.length;

    initCurrentPos();   // 初始化当前位置

    for (let i = 0; i < leng; i++) {
      pos.push(this.getPosition(aNav[i]));      // 把位置保存到数组里

      // 鼠标移入
      $(aNav).eq(i).on('mouseover', () => {
        time && clearTimeout(time);

        option.oLine.css({
          width: pos[i].width + 'px',
          left: pos[i].left + 'px'
        });
      })
      
      // 鼠标移除
      $(aNav).eq(i).on('mouseout', () => {
        // 延迟还原
        time = setTimeout(() => {
          initCurrentPos()
        }, 300)
      })
    };

    // 初始化当前位置
    function initCurrentPos() {
      option.oLine.css({
        width: currentPosition.width + 'px',
        left: currentPosition.left + 'px'
      });
    }
  }

  // 获取元素位置信息
  getPosition(el) {
    return {
      left: $(el).position().left,
      width: $(el).innerWidth()
    }
  }

  // 监听页面高度，显示浮动导航
  navFull() {
    let fullNav   = this.option.fullNav,
        scrollTop = this.option.scrollTop;

    $(window).scroll(function () {
      if ($(document).scrollTop() > scrollTop) {
        fullNav.addClass('active');
      }
      else {
        fullNav.removeClass('active');
      }
    });
  }

  // 点击登陆
  onLogin() {
    let _this = this,
        el    = this.el;
    
    this.Login = new Login();
    this.HintTop = new HintTop();
    
    el.navLoginBtn.show();

    $('.js_login_btn').on('click', () => {
      this.Login.init({
        success: function () {
          el.navLoginBtn.hide();
          _this.GetMyInfo();
          _this.HintTop.success('登陆成功！')
        }
      });
    });
  }

  // 获取用户信息
  GetMyInfo() {
    GetMyInfo(res => {
      this.renderUserInfo(res.data);
    }, 
    err => {
      _fgj.errorTips(err);
    })
  }

  // 渲染用户信息
  renderUserInfo(data) {
    if (data._headpic.indexOf('/upfile') !== -1) {
      data._headpic = _fgj.photoPath() + data._headpic;
    };
    let html = _fgj.handlebars(tempUserInfo, data);
    this.el.navUserLink.html(html).show();
  }
  
};