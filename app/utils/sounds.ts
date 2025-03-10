// Sound utility for the fraction pairing game

// 定义音效类型
export type SoundType = 'correct' | 'incorrect' | 'click' | 'tryAgain' | 'drop';

// Define sound sources (can easily be changed)
const soundSources: Record<SoundType, string> = {
  // 正确音效 - 欢快的成功音效，当分数配对正确时播放
  correct: '/sounds/correct.mp3',
  // 错误音效 - 游戏失败的提示音，当分数配对错误时播放
  incorrect: '/sounds/incorrect.mp3',
  // 点击音效 - 按钮点击的轻快声音，当点击按钮时播放
  click: '/sounds/click.mp3',
  // 再试一次音效 - 提示用户重试的声音，当点击“再试一次”按钮时播放
  tryAgain: '/sounds/try-again.mp3',
  // 放置音效 - 轻柔的放置声音，当将分数放到天平上时播放
  drop: '/sounds/drop.mp3',
};

// 备用音效源（如果本地音效文件加载失败）
const fallbackSoundSources: Record<SoundType, string> = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/1008/1008-preview.mp3', // 叮声上升音效，简短清脆，非常适合教育游戏正确提示
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/249/249-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
  tryAgain: 'https://assets.mixkit.co/active_storage/sfx/140/140-preview.mp3',
  drop: 'https://assets.mixkit.co/active_storage/sfx/133/133-preview.mp3',
};

// 创建音频对象缓存
const sounds: Record<SoundType, HTMLAudioElement> = {} as Record<SoundType, HTMLAudioElement>;

// 加载指定音效
const loadSound = (type: SoundType): HTMLAudioElement => {
  if (!sounds[type]) {
    // 尝试加载本地音效文件
    sounds[type] = new Audio(soundSources[type]);
    
    // 添加错误处理，如果本地文件加载失败，尝试使用备用源
    sounds[type].onerror = () => {
      console.log(`本地音效加载失败(${type})，使用备用源`);
      sounds[type].src = fallbackSoundSources[type];
    };
    
    // 设置音量
    sounds[type].volume = type === 'click' ? 0.25 : // 按钮点击音量较低
                       type === 'drop' ? 0.4 :     // 放置音量适中
                       type === 'correct' ? 0.6 :  // 正确音效稍大声
                       type === 'incorrect' ? 0.5 : 0.5; // 其他音效适中
  }
  return sounds[type];
};

// 初始化所有音效（预加载）
const initSounds = () => {
  try {
    // 预加载所有音效
    Object.keys(soundSources).forEach(key => {
      loadSound(key as SoundType);
    });
    console.log('音效系统初始化完成');
    return true;
  } catch (error) {
    console.error('音效系统初始化失败:', error);
    return false;
  }
};

// 播放指定音效
const playSound = (soundName: SoundType) => {
  try {
    // 获取或加载音效
    const sound = loadSound(soundName);
    
    // 停止并重置音效，然后播放（允许快速连续触发）
    sound.pause();
    sound.currentTime = 0;
    
    // 尝试播放音效
    const playPromise = sound.play();
    
    // 处理播放承诺，处理潜在的自动播放限制
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log(`音效播放受限(${soundName}):`, err);
        
        // 在用户交互之后，音频播放限制通常会被解除
        // 在真实用户交互事件处理程序中，这种备用方案更有可能成功
        // 创建新的音频实例尝试播放（浏览器可能允许新创建的实例播放）
        try {
          const newSound = new Audio(soundSources[soundName]);
          newSound.volume = sound.volume;
          newSound.play().catch(() => {});
        } catch (e) {
          // 静默失败
        }
      });
    }
  } catch (error) {
    // 静默失败，不影响用户体验
    console.error(`播放音效时出错(${soundName}):`, error);
  }
};

export { initSounds, playSound, soundSources };
