// 用户中心公用js
import './common.scss';
import 'common/js/common.js';
import _fgj from 'util/fgj.js';
import HeaderNav from 'components/header-nav/index.js';
import HintTop from 'components/hint-top/index.js';
import Login from 'components/login/index.js';

import { GetMyInfo } from 'api/user/information.js';

let common = {
  init(params) {
    this.params = params || {};
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();
    this.isLogin();   // 判断是否已登陆
  },
  bindEvent() {
    
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init();
  },
  // 判断是否已登陆
  isLogin() {
    let _this = this;
    this.HintTop = new HintTop();
    this.Login = new Login();
    
    login();
    
    function login() {
      if (!_fgj.getCookie('CUserID')) {
        _this.Login.init({
          success() {
            _this.HintTop.success('登陆成功！');
            _this.GetMyInfo();
          },
          cancel() {
            login();  // 这一招叫强制登陆
          }
        });
      }
      else {
        _this.GetMyInfo();
      }
    }
  },
  // 获取用户信息
  GetMyInfo() {
    let params = this.params;

    GetMyInfo(res => {
      params.successGetInfo && params.successGetInfo(res.data);
    }, err => {
      params.errorGetInfo && params.errorGetInfo(err);
    })
  }
};

export default common;