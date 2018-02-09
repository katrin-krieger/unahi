let mqtt = require('mqtt');

let client = mqtt.connect('mqtt://sarah:1883')

client.on('connect', () => {
  client.subscribe('/stat/waage/scale')
  client.subscribe('/test/stardust/text')
  client.publish('/test/stardust/text', 'Hallo Schni!!!!!!!!!!!!!!')
})

client.on('message', (topic, message) => {
  console.log(message.toString())
})
