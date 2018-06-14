import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import swal from 'sweetalert';
import _fgj from 'util/fgj.js'; 
import NavCrumbs from 'components/nav-crumbs/index.js';
import HeaderNav from 'components/header-nav/index.js';

import { MobileLogin } from 'api/user.js';
import { GetListMoreMessage } from 'api/message/message-home.js';
import {
  GetModel,
  ClickCountUp,
  GetMyPraise,
  ClickPraiseUp,
  RecallPraise,
  GetPageList,
  AddComment,
} from 'api/message/message-detail.js';
import { WSAESOCKTNOSUPPORT, POINT_CONVERSION_COMPRESSED } from 'constants';

var tempReadList = require('./read-list.hbs');
var tempTextContent = require('./text-content.hbs');
var tempEmpty = require('components/empty/empty.hbs');
var tempCommentList = require('./comment-list.hbs');

// 资讯详细
var messageDetail = {
  el: {
    praise: $('.js_praise'),
  },
  data: {
    NewsID: _fgj.getUrlParam('NewsID') || (window.location.href = './message-home.html'),   // 资讯ID
    NewsClassID: _fgj.getUrlParam('NewsClassID') || (window.location.href = './message-home.html'), // 资讯分类ID
    NewsClassName: '',    // 分类名称
    commentPage: 1,   // 评论分页
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.ClickCountUp();  // 点击量|阅读量累计
    this.initHeaderNav();  // 给当前导航加class
    this.GetModel();    // 根据id获取数据
    this.getReadList();   // 获取相关阅读数据
    this.GetCommentList();   // 获取评论分页数据
    this.GetMyPraise();     // 判断是去点赞还是取消点赞
  },
  bindEvent() {
    this.onPraise();    // 点赞
    this.onComment();   // 评论
    this.onCommentLoadMOre(); // 加载更多评论
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(3)    // 当前导航元素
    });
  },
  // 根据id获取数据
  GetModel() {
    GetModel({
      NewsID: this.data.NewsID
    }, res => {
      let data = res.data;
      var html = _fgj.handlebars(tempTextContent, {
        data: data
      });
      $('.js_text_content').html(html);
      
      // 保存分类名称
      this.data.NewsClassName = data._newsclass._classname;
      this.renderNavCrumbs(data._shorttitle);   // 渲染导航屑
    }, err => {
      $('.js_text_content').html(err.responseText);
    });
  },
  // 渲染导航屑
  renderNavCrumbs(_shorttitle) {
    let NewsClassName = this.data.NewsClassName;
    let NewsClassID = this.data.NewsClassID;
    var listData = [
      {
        name: '资讯首页',
        link: './message-home.html'
      }, {
        name: NewsClassName,
        link: './message-list.html?NewsClassID=' + NewsClassID
      }, {
        name: _shorttitle
      }
    ];
    var html = new NavCrumbs();
    html.renderList({
      box: $('.js_nav_crumbs'),
      list: listData
    });
  },
  // 获取相关阅读数据
  getReadList() {
    GetListMoreMessage({
      num: 3,
      NewsClassID: this.data.NewsClassID,
      RegDate: 'DESC'
    }, res => {
      // console.log(res)
      let data = this.filterReadData(res.data);    // 过滤相关阅读的数据

      let html = _fgj.handlebars(tempReadList, {
        list: data
      });
      $('.js_read_wrap').html(html);
    }, err => {
      $('.js_read_wrap').html(tempEmpty);
    });
  },
  // 过滤相关阅读的数据
  filterReadData(data) {
    let NewsID = this.data.NewsID;
    let newArr = [];

    for (let i = 0; i < data.length; i++) {
      let list = data[i];
      if (list._newsid !== NewsID) {   // 过滤掉当前正在阅读的这条
        list.link = './message-detail.html?NewsID=' + list._newsid + '&NewsClassID=' + list._newsclassid
        newArr.push(list);
      }
    };
    return newArr;
  },
  // 点赞事件
  onPraise() {
    this.el.praise.on('click', () => {
      this.GetMyPraise('oper');
    });
  },
  // 判断对象是否点赞
  GetMyPraise(oper) {
    let praise = this.el.praise;

    GetMyPraise({
      ObjectName: 'News',
      ObjectID: this.data.NewsID
    }, res => {
      // 有 oper 就是手动触发
      oper ? this.RecallPraise() : praise.addClass('active opacity-1');
    }, err => {
      oper ? this.ClickPraiseUp() : praise.removeClass('active opacity-0');
    })
  },
  // 去点赞
  ClickPraiseUp() {
    ClickPraiseUp({
      NewsID: this.data.NewsID
    }, res => {
      _fgj.successTips('点赞成功');
      this.el.praise.addClass('active');
    }, err => {
      if (err.msg === '请先登录！') {
        this.login();
      }
    })
  },
  // 取消点赞
  RecallPraise() {
    RecallPraise({
      NewsID: this.data.NewsID
    }, res => {
      // console.log(res)
      _fgj.successTips('取消点赞');
      this.el.praise.removeClass('active');
    }, err => {
      _fgj.errorTips('取消失败');
    })
  },
  // 登陆弹窗
  login() {
    let html = `
      <div class="form-group text-left">
          <label for="inputTel">手机号码</label>
          <input type="email" class="form-control" id="inputTel" aria-describedby="emailHelp" placeholder="请输入手机号">
          <div class="invalid-feedback">手机号码不正确</div>
        </div>
        <div class="form-group text-left">
          <label for="inputPassword1">密码</label>
          <input type="password" class="form-control" id="inputPassword1" placeholder="请输入密码">
          <div class="invalid-feedback">密码或手机号码错误</div>
        </div>
        <button type="submit" class="btn btn-primary" id="inputBtn">登陆</button>
        <div class="text-right">
          <a href="#">没有账号？去注册</a>
        </div>
      `;

      _fgj.contentTips('登陆', html, false);

      let telVal = $('#inputTel'),
          PassWordVal = $('#inputPassword1'),
          _this = this;

      $('#inputBtn').on('click', function () {
        // 验证手机号和密码
        if (!_fgj.validate(telVal.val(), 'phone')) {
          telVal.addClass('is-invalid');
          return
        } else if (!_fgj.validate(PassWordVal.val(), 'require')) {
          PassWordVal.addClass('is-invalid');
          return
        } else {
          MobileLogin({
            Tel: telVal.val(),
            PassWord: PassWordVal.val()
          }, res => {
            _this.ClickPraiseUp();
          }, err => {
            PassWordVal.addClass('is-invalid');
          })
        }
      });
  },
  // 点击量|阅读量累计
  ClickCountUp() {
    let NewsID = this.data.NewsID;
    ClickCountUp({
      NewsID
    }, res => {
      // 进入这篇资讯就会加一个，需要有提示之类的
    })
  },
  // 获取评论分页数据
  GetCommentList() {
    let page = this.data.commentPage;
    GetPageList({
      page: page,    // 当前页数，默认 1
      NewsID: this.data.NewsID
    }, res => {
      let data = this.filterCommentData(res.data);
      // console.log(data)
      let html = _fgj.handlebars(tempCommentList, {
        list: data
      });
      // 这里有下一页，除了第一页以外是覆盖，其他都是追加
      if (page === 1) {
        $('.js_comment_list').html(html);
      } 
      else {
        $('.js_comment_list').append(html);
      }
      this.onCommentReply();   // 回复评论
    }, err => {
      if (page === 1) {
        $('.js_comment_list').html(tempEmpty);
      } 
      else {
        $('.js_comment_more').hide();
      }
    })
  },
  // 过滤评论数据
  filterCommentData(data) {
    let arr = [];
    let obj = {};
    let newData = [];

    // 先根据ID把数据分类
    for (let i = 0, leng = data.length; i < leng; i++) {
      // if (data[i]._commentgroup)
      if (!obj[data[i]._commentgroup] && !data[i]._touserid) {
        obj[data[i]._commentgroup] = data[i]
        obj[data[i]._commentgroup].child = []
      } else {
        arr.push(data[i])
      }
    };

    for (let i = 0, leng = arr.length; i < leng; i++) {
      for (let key in obj) {
        if (arr[i]._commentgroup === key) {
          obj[key].child.push(arr[i])
        }
      }
    };

    for (let key in obj) {
      newData.push(obj[key])
    };

    return newData
    // 我这里的数据处理的像屎一样
  },
  // 发布评论
  onComment() {
    let commentText = $('.js_comment_text'),
    content = '';

    $('.js_comment_btn').on('click', () => {
      content = commentText.val();
      if (!_fgj.validate(content, 'require')) {
        _fgj.errorTips('内容不能为空');
      } 
      else {
        this.AddComment(content);
      }
    });
  },
  // 回复评论
  onCommentReply() {
    let CommentGroup = '',
        ToUserID = '',
        $this = null,
        _this = this;

    $('.js_comment_reply').on('click', function() {
      $this = $(this);
      swal({
        title: '回复' + $this.data('name'),
        content: {
          element: 'input',
          attributes: {
            placeholder: '请输入回复内容',
          },
          button: {
            text: '确定'
          }
        },
      }).then(val => {
        // console.log(val)
        if (val) {
          CommentGroup = $this.data('group');
          ToUserID = $this.data('id');
          _this.AddComment(val, CommentGroup, ToUserID);
        } 
        else {
          _fgj.errorTips('回复的内容不能为空')
        }
      });
    });
  },
  // 发送评论请求
  AddComment(content, CommentGroup = '', ToUserID = '') {
    AddComment({
      Content: content,
      CommentGroup: CommentGroup, // 评论组,不是回复则不传
      NewsID: this.data.NewsID,
      ToUserID: ToUserID // 回复用户id,不是回复则不传
    }, res => {
      _fgj.successTips('发布成功');
      this.GetCommentList();    // 发布成功后重新获取数据
    }, err => {
      _fgj.errorTips('发布失败');
    })
  },
  // 加载更多评论
  onCommentLoadMOre() {
    $('.js_comment_more').on('click', () => {
      this.data.commentPage++   // 页数加 1
      this.GetCommentList();
    });
  }
};

$(function () {
  messageDetail.init()
});