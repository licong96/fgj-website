var template = require('./index.hbs');
import './index.scss';
$('#calculator').html(template);

// 保存计算结果
export var calculatorData = {};

// tab component
var tab = (function ($) {

  var tabSwitch = function (item) {
      item.siblings('.item').removeClass('current');
      item.addClass('current');
  }

  // 切换tab菜单的样式
  var tabNavSwitch = function (index, tab){
      var tabNav = $(tab.find('.tab-nav .item')[index]);
      tabSwitch(tabNav);
  };

  // 切换tab显示
  var tabBodySwitch = function (index, tab) {
      var tabBody = $(tab.find('.tab-body .item')[index]);
      tabSwitch(tabBody);
  };

  // 初始化tab并监听tab菜单的点击事件
  var tabInit = function (index) {
      // 初始化tab
      $('.tab').each(function () {
          var $this = $(this);
          tabNavSwitch(index, $this);
          tabBodySwitch(index, $this);
      });
      // 监听tab菜单的点击事件
      $(document).on('click', '.tab .tab-nav .item', function (e) {
          e.preventDefault();
          var clickedIndex = $(this).index();
          var tab = $(this).closest('.tab');
          tabNavSwitch(clickedIndex, tab);
          tabBodySwitch(clickedIndex, tab);
          form.resetResultHandle();
      })
  };

  return {
      init: function (index) {
          tabInit(index);
      }
  };
})(jQuery);

// 对表单的处理
var form = (function ($) {

  var dorpdownHandle = function () {
      $(document).on('click', '.toggle-dropdown, .select', function (e) {
          e.preventDefault();
          e.stopPropagation();
          $('.dropdown').removeClass('active');
          var dropdown = $(this).nextAll('.dropdown');

          if(dropdown.hasClass('active')){
              dropdown.removeClass('active');
          }else{
              dropdown.addClass('active');
          }
      });

      $(document).on('click', function () {
          var dropdown =  $('.dropdown');
          if(dropdown.hasClass('active')){
              dropdown.removeClass('active');
          }
      })
  };

  var getDropdownListValue = function () {
    $(document).on('click', '.dropdown li', function (e) {
        var $this = $(this);
        var value = $this.attr('data-value');
        $this.closest('.form-input').find('input').val(value).change();
    });
  };

  // 切换表单的显示
  var changeFormDisplay = function () {
      $(document).on('change', '.business-dk-type input', function (e) {
       $(this).closest('.item').find('form').hide();
        $('#' + e.target.value).show();
        resetResultHandle();
      });
      $(document).on('change', '.fund-dk-type input', function (e) {
          $(this).closest('.item').find('form').hide();
          $('#' + e.target.value).show();
          resetResultHandle();
      });
  };

  // 将 xx年 变成xx
  var getDkTime = function (time) {
    if(typeof time === 'string'){
        var index = time.indexOf('年');
        if(index !== -1){
            return parseInt(time.substring(0, index));
        }else{
            return parseInt(time);
        }
    }else{
        alert('参数错误: time 应为字符串 格式为 数字 + 年');
        return false;
    }
  };

  // 商贷利率折扣
  var getInterestRateDiscount = function (str) {
      str = $.trim(str);
      var discount = 1;
      switch (str){
          case '最新基准利率7折':
              discount = 0.7;
              break;
          case '最新基准利率8折':
              discount = 0.8;
              break;
          case '最新基准利率8.3折':
              discount = 0.83;
              break;
          case '最新基准利率8.5折':
              discount = 0.85;
              break;
          case '最新基准利率8.8折':
              discount = 0.88;
              break;
          case '最新基准利率9折':
              discount = 0.9;
              break;
          case '最新基准利率9.5折':
              discount = 0.95;
              break;
          case '最新基准利率':
              discount = 1;
              break;
          case '最新基准利率1.05倍':
              discount = 1.05;
              break;
          case '最新基准利率1.1倍':
              discount = 1.1;
              break;
          case '最新基准利率1.2倍':
              discount = 1.2;
              break;
          case '最新基准利率1.3倍':
              discount = 1.3;
              break;
          case '公积金基准利率':
              discount = 1;
              break;
          case '公积金基准利率1.1倍':
              discount = 1.1;
              break;
          case '公积金基准利率1.2倍':
              discount = 1.2;
              break;
          default:
              discount = 1;
      }
      return discount;
  };

  // 获取利率
  var getInterestRate = function (year, discount) {
      var lilv = year <= 5 ? 4.75 : 4.90;
      return (lilv * discount).toFixed(2) + '%';
  };

  // 获取公积金利率
  var getRateInterestRate = function (year, discount) {
      var lilv = year <= 5 ? 2.75 : 3.25;
      return (lilv * discount).toFixed(2) + '%';
  };

  //本息还款的月还款额(参数: 年利率/贷款总额/贷款总月份)
  var getBenxiMonthlyPayment = function(interestRate,total,month){
      var lilv_month = interestRate / 12;//月利率
      return total * lilv_month * Math.pow(1 + lilv_month, month) / ( Math.pow(1 + lilv_month, month) -1 );
  };

  //本金还款的月还款额(参数: 年利率 / 贷款总额 / 贷款总月份 / 贷款当前月0～length-1)
  var getBenjinMonthlyPayment = function(interestRate,total,month,cur_month){
      var lilv_month = interestRate / 12;//月利率
      var benjin_money = total/month;
      return (total - benjin_money * cur_month) * lilv_month + benjin_money;
  };

  // 获取结果数据
  var getResultData = function (money, year, interestRate) {
      // +++++++++++
      // 等额本息
      // +++++++++++

      // 每月还款额=贷款本金×[月利率×（1+月利率）^还款月数]÷[（1+月利率）^还款月数—1]

      var total = money * 10000;
      var month = year * 12;
      // 每月还款
      var benXiMonthlyPayment = getBenxiMonthlyPayment(interestRate, total, month);
      //还款总额
      var allMoney = benXiMonthlyPayment * month;
      var totalInterest = allMoney - total;

      // +++++++++++++
      // 等额本金
      // +++++++++++++

      // var monthlyMap = [];
      // 要生成每个月的还款额,可用for循环,遍历月数,由函数getBenjinMonthlyPayment得到。
      var firstMonthPayment = getBenjinMonthlyPayment(interestRate, total, month, 0);
      var secondMonthPayment = getBenjinMonthlyPayment(interestRate, total, month, 1);
      // 还款总额
      var benjinAllMoney = 0;
      for(var i=0; i < month; i++){
          benjinAllMoney += getBenjinMonthlyPayment(interestRate, total, month, i);
      }
      var benjinTotalInterest = benjinAllMoney - total;


      return {
          'benxi': {
              'all': parseFloat(total).toFixed(2),
              'month': month,
              'monthlyPayment': parseFloat(benXiMonthlyPayment).toFixed(2),
              'totalInterest': parseFloat(totalInterest).toFixed(2),
              'allMoney': parseFloat(allMoney).toFixed(2)
          },
          'benjin':{
              'all': parseFloat(total).toFixed(2),
              'month': month,
              'firstMonthPayment': parseFloat(firstMonthPayment).toFixed(2),
              'totalInterest': parseFloat(benjinTotalInterest).toFixed(2),
              'allMoney': parseFloat(benjinAllMoney).toFixed(2),
              'monthlyDecline': parseFloat(firstMonthPayment - secondMonthPayment).toFixed(2)
          }
      }
  };

  // 清空结果表格
  var resetResultHandle = function () {
      var data = {
          'benxi': {
              'all': 0,
              'month': 0,
              'monthlyPayment': 0,
              'totalInterest': 0,
              'allMoney': 0
          },
          'benjin':{
              'all': 0,
              'month': 0,
              'firstMonthPayment': 0,
              'totalInterest': 0,
              'allMoney': 0,
              'monthlyDecline': 0
          }
      };
      try{
          for(v in data){
              for(b in data[v]){
                  if(v === 'benxi'){
                      document.getElementById('dbx-' + b).innerHTML = data[v][b];
                  }else if(v === 'benjin'){
                      document.getElementById('dbj-' + b).innerHTML = data[v][b];
                  }
              }
          }
      }catch (e){
          console.log(e.message);
      }
  };

  // 将结果填充到结果表格中
  var setResultTable = function (data) {
    calculatorData = data;      // 把结果保存到calculatorData中，外面就好用了

    // estateDetail.mortgageCounter();
      // 将数据插入结果表格中
      // try{
      //     for(v in data){
      //         for(b in data[v]){
      //             if(v === 'benxi'){
      //                 document.getElementById('dbx-' + b).innerHTML = data[v][b];
      //             }else if(v === 'benjin'){
      //                 document.getElementById('dbj-' + b).innerHTML = data[v][b];
      //             }
      //         }
      //     }
      // }catch (e){
      //     console.log(e.message);
      // }
      // 页面滚动到结果表格部分
      //
      // $('html,body').animate({
      //     scrollTop:$('#result').offset().top
      // }, 500);
  };

  // 获取组合贷款数据
  // 参数: 贷款年数/公积金金额/公积金利率/商业贷款金额/商业贷款利率
  var getZhResultData = function(year, gjjMoney, gjjLilv, syMoney, interestRate){
      var sy = getResultData(syMoney, year, interestRate);
      var gjj = getResultData(gjjMoney, year, gjjLilv);
      var month = year * 12;

      return {
          'benxi': {
              'all': parseFloat(parseFloat(sy.benxi.all) + parseFloat(gjj.benxi.all)).toFixed(2),
              'month': month,
              'monthlyPayment': parseFloat(parseFloat(sy.benxi.monthlyPayment) + parseFloat(gjj.benxi.monthlyPayment)).toFixed(2),
              'totalInterest': parseFloat(parseFloat(sy.benxi.totalInterest) + parseFloat(gjj.benxi.totalInterest)).toFixed(2),
              'allMoney': parseFloat(parseFloat(sy.benxi.allMoney) + parseFloat(gjj.benxi.allMoney)).toFixed(2)
          },
          'benjin':{
              'all': parseFloat(parseFloat(sy.benjin.all) + parseFloat(gjj.benxi.all)).toFixed(2),
              'month': month,
              'firstMonthPayment': parseFloat(parseFloat(sy.benjin.firstMonthPayment) + parseFloat(gjj.benjin.firstMonthPayment)).toFixed(2),
              'totalInterest': parseFloat(parseFloat(sy.benjin.totalInterest) + parseFloat(gjj.benjin.totalInterest)).toFixed(2),
              'allMoney': parseFloat(parseFloat(sy.benjin.allMoney) + parseFloat(gjj.benjin.allMoney)).toFixed(2),
              'monthlyDecline': parseFloat(parseFloat(sy.benjin.monthlyDecline) + parseFloat(gjj.benjin.monthlyDecline)).toFixed(2)
          }
      }
  };

  // item1的表单处理
  var item1FormHandle = function () {

      var item1EdForm = $('#item1-ed-form');
      var item1MjForm = $('#item1-mj-form');
      var forms = $('#business-form').find('form');

      // 商业贷款按贷款额度算
      forms.on('change', '[name=time]', function (e) {
          var form = $(this).parents('form');
          var year = getDkTime(e.target.value);
          var discount = form.find('[name=interestRateDiscount]').val();
            discount = getInterestRateDiscount(discount);

          var lilv = getInterestRate(year, discount);
          form.find('[name=interestRate]').val(lilv);
      });

      forms.on('change', '[name=interestRateDiscount]', function (e) {
          var form = $(this).parents('form');
          var discount = getInterestRateDiscount(e.target.value);
          var year = getDkTime(form.find('[name=time]').val());

          var lilv = getInterestRate(year, discount);
          $(this).parents('form').find('[name=interestRate]').val(lilv);
      });

      // 表单提交计算
      item1EdForm.on('submit', function (e) {
          e.preventDefault();
          var form = e.target;
          var money = form.money.value;
          var year = getDkTime(form.time.value);
          var interestRate = parseFloat(form.interestRate.value) / 100;
          if(isNaN(money)){
              alert('贷款金额请输入数字');
              form.money.focus();
              return false;
          }
          var data = getResultData(money, year, interestRate);
          setResultTable(data);
          return false;
      });

      item1MjForm.on('submit', function (e) {
          e.preventDefault();
          var form = e.target;
          // 单价
          var unitPayment = form.unitPayment.value;
          // 面积
          var area = form.area.value;
          // 首付
          var firstPayment = parseInt(form.firstPayment.value) / 10;
          // 年
          var year = getDkTime(form.time.value);
          // 利率
          var interestRate = parseFloat(form.interestRate.value) / 100;
          if(isNaN(unitPayment)){
              alert('单价请填数字');
              return false;
          }
          if(isNaN(area)){
              alert('面积请填数字');
              return false;
          }

          var money = parseFloat((unitPayment * area * (1-firstPayment)) / 10000).toFixed(2);
          var data = getResultData(money, year, interestRate);
          setResultTable(data);
      });
  };

  // item2的表单处理
  var item2FormHandle = function () {

      var item2EdForm = $('#item2-ed-form');
      var item2MjForm = $('#item2-mj-form');
      var forms = $('#fund-form').find('form');

      // 公积金贷款按贷款额度算
      forms.on('change', '[name=time]', function (e) {
          var form = $(this).parents('form');
          var year = getDkTime(e.target.value);
          var discount = form.find('[name=interestRateDiscount]').val();
          discount = getInterestRateDiscount(discount);

          var lilv = getRateInterestRate(year, discount);
          form.find('[name=interestRate]').val(lilv);
      });

      forms.on('change', '[name=interestRateDiscount]', function (e) {
          var form = $(this).parents('form');
          var discount = getInterestRateDiscount(e.target.value);
          var year = getDkTime(form.find('[name=time]').val());

          var lilv = getRateInterestRate(year, discount);
          $(this).parents('form').find('[name=interestRate]').val(lilv);
      });

      // 表单提交计算
      item2EdForm.on('submit', function (e) {
          e.preventDefault();
          var form = e.target;
          var money = form.money.value;
          var year = getDkTime(form.time.value);
          var interestRate = parseFloat(form.interestRate.value) / 100;
          if(isNaN(money)){
              alert('贷款金额请输入数字');
              form.money.focus();
              return false;
          }
          var data = getResultData(money, year, interestRate);
          setResultTable(data);
          return false;
      });

      item2MjForm.on('submit', function (e) {
          e.preventDefault();
          var form = e.target;
          // 单价
          var unitPayment = form.unitPayment.value;
          // 面积
          var area = form.area.value;
          // 首付
          var firstPayment = parseInt(form.firstPayment.value) / 10;
          // 年
          var year = getDkTime(form.time.value);
          // 利率
          var interestRate = parseFloat(form.interestRate.value) / 100;
          if(isNaN(unitPayment)){
              alert('单价请填数字');
              return false;
          }
          if(isNaN(area)){
              alert('面积请填数字');
              return false;
          }

          var money = parseFloat((unitPayment * area * (1-firstPayment)) / 10000).toFixed(2);
          var data = getResultData(money, year, interestRate);
          setResultTable(data);
      });
  };

  // item3的表单处理
  var item3FormHandle = function () {

      var item3Form = $('#item3-form');
      var forms = $('#combination-form').find('form');

      // 贷款期限切换
      forms.on('change', '[name=time]', function (e) {
          var form = $(this).parents('form');
          var year = getDkTime(e.target.value);
          var discount = form.find('[name=interestRateDiscount]').val();
          discount = getInterestRateDiscount(discount);

          var lilv = getInterestRate(year, discount);
          form.find('[name=interestRate]').val(lilv);
      });

      forms.on('change', '[name=interestRateDiscount]', function (e) {
          var form = $(this).parents('form');
          var discount = getInterestRateDiscount(e.target.value);
          var year = getDkTime(form.find('[name=time]').val());

          var lilv = getInterestRate(year, discount);
          $(this).parents('form').find('[name=interestRate]').val(lilv);
      });

      // 表单提交计算
      item3Form.on('submit', function (e) {
          e.preventDefault();
          var form = e.target;
          // 期限
          var year = getDkTime(form.time.value);
          // 公积金金额
          var gjjMoney = form.gjjMoney.value;
          // 公积金利率
          var gjjLilv = parseFloat(form.gjjLilv.value) / 100;
          // 商业贷款金额
          var syMoney = form.syMoney.value;
          // 商业贷款利率
          var interestRate = parseFloat(form.interestRate.value) / 100;

          if(isNaN(gjjMoney)){
              alert('公积金贷款金额请输入数字');
              form.gjjMoney.focus();
              return false;
          }
          if(isNaN(syMoney)){
              alert('商业贷款金额请输入数字');
              form.syMoney.focus();
              return false;
          }
          var data = getZhResultData(year, gjjMoney, gjjLilv, syMoney, interestRate);
          setResultTable(data);
          return false;
      });
  };

  // 重新计算
  var recountHandle = function () {
      $('#recount').click(function (e) {
          e.preventDefault();
          $('html, body').animate({
              scrollTop: $('#calculator').offset().top
          }, 300);
          return false;
      });
  };

  return {
      init: function () {
          dorpdownHandle();
          getDropdownListValue();
          changeFormDisplay();
          item1FormHandle();
          item2FormHandle();
          item3FormHandle();
          recountHandle();
      },
      showCalc: function (index) {
          var calc = $('#calculator');
          calc.find('.tab-nav .item')[index].click();

          $('html, body').animate({
              scrollTop: calc.offset().top
          }, 300);
      },
      resetResultHandle: function () {
          resetResultHandle();
      }
  };
})(jQuery);

setTimeout(() => {
  // 初始化程序
  $(function () {
    tab.init(0);
    form.init();
  });
}, 300)
