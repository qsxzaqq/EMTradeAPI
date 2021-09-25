import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { LoginDto } from '../api/api.dto';
import { OcrService } from '../ocr/ocr.service';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private clients = [];

  constructor(private ocrService: OcrService) {}

  async login(login: LoginDto) {
    const randNum = '0.903' + new Date().getTime();

    const image = await axios
      .get(
        'https://jywg.18.cn/Login/YZM?randNum=' +
          randNum +
          '&_ra=' +
          Math.random(),
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
          },
          responseType: 'arraybuffer',
        },
      )
      .then((r) => {
        return r.data;
      });

    const identifyCode = (await this.ocrService.process(image))[
      'VERIFY_CODE_ENTITY'
    ]['VERIFY_CODE'];

    const login_res = await axios
      .post(
        'https://jywg.18.cn/Login/Authentication',
        {
          duration: 1800,
          password: login.password,
          identifyCode: identifyCode,
          type: 'Z',
          userId: login.username,
          randNumber: randNum,
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
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
          },
        },
      )
      .then((r) => {
        return r;
      });

    if (login_res.data.Status == -1) {
      return {
        status: -1,
        error: login_res.data.Message,
      };
    }

    if (!login_res.headers['set-cookie']) {
      return {
        status: -1,
        error: '登陆错误',
      };
    }

    let cookies = '';
    login_res.headers['set-cookie'].forEach((v) => {
      cookies = cookies + v.split('; expires=')[0] + '; ';
    });

    const validateKey = await axios
      .get('https://jywg.18.cn/Trade/Buy', {
        headers: {
          Cookie: cookies,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        },
        responseType: 'text',
      })
      .then((r) => {
        const content = r.data;
        const key = 'input id="em_validatekey" type="hidden" value="';
        const inputBegin = content.indexOf(key) + key.length;
        const inputEnd = content.indexOf('" />', inputBegin);
        return content.substring(inputBegin, inputEnd);
      });

    const clientId =
      this.clients.push({
        login: true,
        cookies: cookies,
        validateKey: validateKey,
      }) - 1;

    this.logger.log('账户登陆 clientId: ' + clientId);

    return {
      status: 0,
      data: {
        clientId: clientId,
        users: login_res.data.Data,
      },
    };
  }

  async logout(clientId) {
    const client = this.clients[clientId];
    if (!client) {
      return {
        status: -1,
        error: '错误',
      };
    }

    if (!client.login) {
      return {
        status: 0,
      };
    }

    this.logger.log('账户退出 clientId: ' + clientId);

    await axios.get('https://jywg.18.cn/Login/ExitLogin?clear=1', {
      headers: {
        Cookie: client.cookies,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
      },
      responseType: 'text',
    });

    this.clients.splice(clientId, 1);

    return {
      status: 0,
    };
  }

  async asserts(clientId) {
    const client = this.clients[clientId];
    if (!client) {
      return {
        status: -1,
        error: '错误',
      };
    }

    if (!client.login) {
      this.clients.splice(clientId, 1);
      return {
        status: -999,
        error: '你掉线了',
      };
    }

    this.logger.log('账户查持仓 clientId: ' + clientId);

    const data = await axios
      .get(
        'https://jywg.18.cn/Com/GetAssetsEx?validatekey=' + client.validateKey,
        {
          headers: {
            Cookie: client.cookies,
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
          },
        },
      )
      .then((r) => {
        return r;
      });

    if (data.status != 200 || data.data.Status != 0) {
      client.login = false;

      return {
        status: -999,
        error: '错误, 登陆超时 or 奇葩问题',
      };
    }

    return {
      status: 0,
      data: {
        clientId: clientId,
        asserts: data.data.Data,
      },
    };
  }

  async heartbeat() {
    for (let i = 0; i < this.clients.length; i++) {
      if (!this.clients[i].login) {
        continue;
      }

      const data = await this.asserts(i);
      if (data.status == 0) {
        this.clients[i].login = true;
      }
    }
  }
}
