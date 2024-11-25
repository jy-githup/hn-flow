import Mock from 'mockjs';

// import { Service } from '#/cool';

// @Service('chat/session')
class ChatSession {
  async page() {
    return new Promise((resolve) => {
      const data = Mock.mock({
        'list|20': [
          {
            id: '@id',
            nickName: '@cname',
            createTime: '@datetime(HH:mm:ss)',
            text: '@cparagraph(5)',
            'num|0-99': 0,
            avatar() {
              return Mock.Random.image(
                '40x40',
                Mock.Random.color(),
                '#FFF',
                'png',
                this.nickName[0],
              );
            },
          },
        ],
      });

      setTimeout(() => {
        resolve({
          list: data.list,
          pagination: {
            total: 20,
            page: 1,
            size: 20,
          },
        });
      }, 1000);
    });
  }
}

export default ChatSession;
