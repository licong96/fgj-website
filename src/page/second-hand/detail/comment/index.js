import './index.scss';
import _fgj from 'util/fgj.js'

let templateBox = require('./box.hbs');
let templatepropertyList = require('./property-list.hbs');
let tempEmpty = require('components/empty/empty.hbs');

// 评论
/**
 * @class Comment
 * @param { Element } box 容器
 */
export default class Comment {
  constructor() {
    this.defaultOption = {
    };
  }

  init(options) {
    this.option = $.extend({}, this.defaultOption, options);

    this.renderCon();   // 渲染主体容器
  }

  // 渲染主体内容
  renderCon() {
    let html = _fgj.handlebars(templateBox, {});
    this.option.box.html(html);
    
    this.GetPropertyComment();
    this.bindEvent();
  }

  bindEvent() {
    this.el = {
      commentText: $('.js_comment_text'),
      commentList: $('.js_comment_list'),
      commentMore: $('.js_comment_more'),
    }
    this.onComment();
    this.onCommentLoadMOre();
  }

  // 获取评论数据
  GetPropertyComment() {
    let option = this.option;
    option.GetPropertyComment && option.GetPropertyComment(option.page);
  }

  // 渲染评论列表-资讯
  renderListMsg (param) {
    let html = _fgj.handlebars(templateListMsg, {
      list: param.data
    });
    param.box.html(html);
  }
  
  // 成功获取到评论数据
  successFul(data) {
    let newData = this.filterCommentData(data);
    // console.log(data)
    let html = _fgj.handlebars(templatepropertyList, {
      list: newData
    });
    
    // 这里有下一页，除了第一页以外是覆盖，其他都是追加
    if (this.option.page === 1) {
      this.el.commentList.html(html);
    } 
    else {
      this.el.commentList.append(html);
    };

    this.onCommentReply();   // 回复评论
  }

  // 没有获取到数据
  empty(err) {
    if (this.option.page === 1) {
      this.el.commentList.html(tempEmpty);
    } 
    else {
      this.el.commentMore.hide();
    }
  }
  
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
  }

  // 发布评论
  onComment() {
    let option = this.option,
        content = '';

    $('.js_comment_btn').on('click', () => {
      content = this.el.commentText.val();
      if (!$.trim(content)) {
        _fgj.errorTips('内容不能为空');
      } 
      else {
        this.el.commentText.val('');    // 发布成功后清空输入框
        this.AddComment(content)
      }
    });
  }
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
          }
        },
        button: {
          text: '确定'
        }
      }).then(content => {
        if ($.trim(content)) {
          CommentGroup = $this.data('group');
          ToUserID = $this.data('id');
          _this.AddComment(content, CommentGroup, ToUserID);
        } 
        else if (typeof content !== 'object') {
          _fgj.errorTips('回复的内容不能为空')
        }
      });
    });
  }
  // 发送评论请求
  AddComment(content, CommentGroup = '', ToUserID = '') {
    let option = this.option;
    option.AddPropertyComment && option.AddPropertyComment(content, CommentGroup, ToUserID);
  }
  // 加载更多评论
  onCommentLoadMOre() {
    this.el.commentMore.on('click', () => {
      this.option.page++   // 页数加 1
      this.GetPropertyComment();
    });
  }
};