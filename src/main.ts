import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

/* 表驱动编程示范 */
// const errorMap = {
//   '52003': '用户认证失败',
//   '52004': 'error2',
//   '52005': 'error3',
//   'unknown': '服务器繁忙'
// };

export const translate = (word: string) => {

  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  let from, to;

  if (/[a-zA-Z]/.test(word[0])) {
    // english to chinese
    from = 'en';
    to = 'zh';
  } else {
    // chinese to english
    from = 'zh';
    to = 'en';
  }

  let query: string = querystring.stringify({
    q: word,
    from,
    to,
    appid: appId,
    salt,
    sign
  });

  const options = {
    hostname: 'fanyi-api.baidu.com',
    port: 443,
    path: `/api/trans/vip/translate?${query}`,
    method: 'GET',
  };
  const request = https.request(options, (response) => {
    let chunks: Buffer[] = [];
    response.on('data', (chunk: Buffer) => {
      // console.log(chunk.constructor);
      chunks.push(chunk);
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString();
      type BaiduResult = {
        error_code?: string,
        error_msg?: string,
        from: string,
        to: string,
        trans_result: {
          src: string,
          dst: string
        }[]
      }
      const object: BaiduResult = JSON.parse(string);

      /* 表驱动编程示范 */
      // if(object.error_code){
      //   if(object.error_code in errorMap){
      //     console.log(errorMap[object.error_code] || object.error_msg)
      //   }
      // }

      if (object.error_code) {
        if (object.error_code === '52003') {
          console.error('用户认证失败');
        } else {
          console.error(object.error_msg);
        }
        process.exit(2);
      } else {
        object.trans_result.map(obj => {
          console.log(obj.dst);
        });
        process.exit(0);
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};