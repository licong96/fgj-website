import Mock from 'mockjs'

var Random = Mock.Random

Mock.mock(/todo=estate&type=image/, function (options) {
  return Mock.mock({
    "photo|2": [
      {
        path: Random.image('300x220', '#ccc')
      }
    ]
  })
})