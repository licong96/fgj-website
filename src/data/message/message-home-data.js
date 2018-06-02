import Mock from 'mockjs'

var Random = Mock.Random

Mock.mock(/type=getMessageList/, function (options) {
  return Mock.mock({
    'list|2-4': [
      {
        link: '#',
        pic: Random.image('300x220', 'FF6600'),
        title: '刚发现发的金隅翡丽·蓝爵堡楼盘价值最新消息重磅来袭',
        desc: '金隅翡丽·刚发现发的金隅翡丽·蓝爵堡楼盘价值最新消息重磅来袭蓝爵堡也于8月1号举行盛大的精装样板间开放活动，这次所开放的样板间为153平方米的郎阔三居还有239平方米的叠拼别墅。金隅翡丽·蓝爵堡已经开设了两期，而都在开设后的几天都被“一抢而光”',
        bold: '来自今日头条',
        time: Random.time(),
        eye: Random.natural(500, 1500),
        collect: Random.natural(200, 800),
        comment: Random.natural(100, 500),
      }
    ]
  })
});