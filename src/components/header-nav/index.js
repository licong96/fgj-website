import './index.scss';
import _fgj from 'util/fgj.js'; 

import HintTop from 'components/hint-top/index.js';
import Login from 'components/login/index.js';

// 导航
/**
 * @class HeaderNav
 */
export default class HeaderNav {
  constructor() {
    // 默认参数
    this.defaultOption = {
      // current: $('.js_header_nav .nav-a').eq(0)    // 当前导航元素
      fullNav: $('.js_head_nav_fixed'),
      aNav: $('.js_header_nav .nav-a'),
      oLine: $('.js_header_nav .line'),
      scrollTop: 680,   // 距离顶部的位置
    }
  }

  // 初始化
  init(option) {
    this.option = $.extend({}, this.defaultOption, option);
    this.active();    // 给当前导航添加样式

    this.navFull();   // 监听页面高度，显示浮动导航

    // 添加到消息队列中
    setTimeout(() => {
      this.line();    // 添加下划线运动
      this.option.oLine.css({'opacity': 1});
    }, 30);
    
    this.initLogin();   // 初始化登陆

    this.bindEvent();
  }

  bindEvent() {
    this.onLogin();
  }

  // 给当前导航添加样式
  active() {
    this.option.current.addClass('active');
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

  // 初始化登陆
  initLogin() {
    this.Login = new Login();
    if (_fgj.getCookie('CUserID')) {
      $('.js_login_state').hide();
    }
  }
  // 点击登陆
  onLogin() {
    let _this = this;
    
    this.HintTop ? '' : this.HintTop = new HintTop();

    $('.js_login_btn').on('click', () => {
      if (!_fgj.getCookie('CUserID')) {
        this.Login.init({
          success: function () {
            _this.HintTop.show({
              type: 'success',
              text: '登陆成功！'
            });
            $('.js_login_state').hide();
          }
        });
      }
    });
  }
  
};