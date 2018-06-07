import './index.scss';
import _fgj from 'util/fgj.js'; 

import { FileUpLoad } from 'api/public.js';

let tempIndex = require('./index.hbs');   // 二手房买卖

/**
 * 图片上传
 * @class imageUpload
 */
export default class imageUpload {
  constructor() {
    this.defaultOption = {
      photo: [],   // 图片地址
    }
    this.el = {};   // 用来存储页面元素
  }

  // 初始化
  init(option, callback) {
    this.option = $.extend({}, this.defaultOption, option);

    this.render();   // 渲染
  }
  // 渲染
  render() {
    let option = this.option,
        html   = _fgj.handlebars(tempIndex, {
          list: option.photo
        });

    option.box.html(html);
    typeof option.backPhoto === 'function' && option.backPhoto(option.photo); // 返回已选中的图片
    this.imageUpload(); // 选择图片
    this.removeImg();   // 删除图片
  }

  // 选择图片
  imageUpload() {
    let option  = this.option,
        _this   = this;

    option.box.find('.fileupload').on('change', function (e) {
      let forms = new FormData();
      e = e || window.event;
      forms.append('fileupload', e.target.files[0]);
      _this.FileUpLoad(forms);
    })
  }
  // 图片上传地址
  FileUpLoad(forms) {
    let option = this.option;

    typeof option.laddaStart === 'function' && option.laddaStart(); // 开启等待
    FileUpLoad(forms, res => {
      // console.log(res)
      this.uploadImageShow(res);
    },
    err => {
       // 图片上传失败
      typeof option.HintTop === 'function' && option.HintTop({
        type: 'danger',
        text: '图片上传失败'
      });
    })
  }
  // 图片上传成功后处理数据
  uploadImageShow(list) {
    // let obj = _fgj.photoPath() + list.sm_path.replace(/sm_/gi,'').slice(1),
    let src     = _fgj.photoPath() + list.sm_path.slice(1), // 去掉前面的|
        option  = this.option,
        data    = this.option.photo;

    list.src = src;
    data.push(list);

    typeof option.laddaStop === 'function' && option.laddaStop();   // 停止等待
    this.render();    // 去渲染
  }

  // 删除图片
  removeImg() {
    let option = this.option,
        index  = -1,
        _this  = this;

    option.box.find('.js_remove_img').on('click', function () {
      index = $(this).data('index');
      option.photo.splice(index, 1);
      _this.render();
    });
  }
};