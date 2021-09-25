import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OcrService {
  // 这里购买！ https://market.aliyun.com/products/57124001/cmapi00035185.html
  async process(buffer) {
    return await axios
      .post(
        'https://codevirify.market.alicloudapi.com/icredit_ai_image/verify_code/v1',
        {
          IMAGE: buffer.toString('base64'),
          IMAGE_TYPE: 0,
        },
        {
          transformRequest: [
            function (data) {
              let ret = '';
              for (const it in data) {
                ret +=
                  encodeURIComponent(it) +
                  '=' +
                  encodeURIComponent(data[it]) +
                  '&';
              }
              ret = ret.substring(0, ret.lastIndexOf('&'));
              return ret;
            },
          ],
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'APPCODE abbbbbbb',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
          },
        },
      )
      .then((r) => {
        return r.data;
      });
  }
}
