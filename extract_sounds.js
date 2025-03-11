const fs = require('fs');
const path = require('path');

// 读取HTML文件（使用绝对路径）
const htmlContent = fs.readFileSync('/Users/xz/Desktop/生涯/游戏/a.html', 'utf8');

// 定义要提取的音效
const soundsToExtract = [
  { name: 'correct.mp3', pattern: 'VEGAS/ding.mp3",function\\(\\){return{base64:"(data:audio/mpeg;base64,[^"]+)' },
  { name: 'incorrect.mp3', pattern: 'VEGAS/boing.mp3",function\\(\\){return{base64:"(data:audio/mpeg;base64,[^"]+)' },
  { name: 'click.mp3', pattern: 'VEGAS/trumpet.mp3",function\\(\\){return{base64:"(data:audio/mpeg;base64,[^"]+)' },
  { name: 'try-again.mp3', pattern: 'VEGAS/organ.mp3",function\\(\\){return{base64:"(data:audio/mpeg;base64,[^"]+)' },
  { name: 'drop.mp3', pattern: 'TAMBO/empty_apartment_bedroom_06_resampled.mp3",function\\(\\){return{base64:"(data:audio/mpeg;base64,[^"]+)' }
];

// 确保目录存在
const outputDir = 'temp_sounds';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 提取并保存每个音效
soundsToExtract.forEach(sound => {
  try {
    const regex = new RegExp(sound.pattern);
    const match = regex.exec(htmlContent);
    
    if (match && match[1]) {
      const dataUrl = match[1];
      const base64Data = dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync(path.join(outputDir, sound.name), buffer);
      console.log(`成功提取 ${sound.name}`);
    } else {
      console.log(`未找到 ${sound.name} 的匹配内容`);
    }
  } catch (error) {
    console.error(`提取 ${sound.name} 时出错:`, error);
  }
});

console.log('音效提取完成！'); 