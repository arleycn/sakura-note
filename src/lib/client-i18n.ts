type ClientLang = 'zh' | 'en';

const zh = {
  empty: '还没有留言，来坐第一个沙发吧～',
  count: (n: number) => `${n} 条`,
  imageAlt: (author: string) => `${author} 上传的配图`,
  needName: '先留个昵称吧～',
  tooShort: '内容太短啦，至少写两个字',
  sending: '正在发送…',
  invalid: '昵称或内容不符合要求，检查一下长度',
  generic: '发送失败，稍后再试',
  success: '留言成功，谢谢你 🌸',
  justNow: '刚刚',
  minutesAgo: (n: number) => `${n} 分钟前`,
  hoursAgo: (n: number) => `${n} 小时前`,
  daysAgo: (n: number) => `${n} 天前`,
  locale: 'zh-CN',
};

const en: typeof zh = {
  empty: 'No comments yet — be the first one.',
  count: (n: number) => `${n}`,
  imageAlt: (author: string) => `Image uploaded by ${author}`,
  needName: 'Please leave a name first.',
  tooShort: 'Your comment is too short — at least two characters.',
  sending: 'Posting…',
  invalid: 'Name or comment does not meet the length requirement',
  generic: 'Failed to send, please try again later',
  success: 'Comment posted. Thanks for stopping by 🌸',
  justNow: 'just now',
  minutesAgo: (n: number) => `${n}m ago`,
  hoursAgo: (n: number) => `${n}h ago`,
  daysAgo: (n: number) => `${n}d ago`,
  locale: 'en-US',
};

export function clientLabels(): typeof zh {
  const lang: ClientLang = document.documentElement.lang === 'en' ? 'en' : 'zh';
  return lang === 'en' ? en : zh;
}
