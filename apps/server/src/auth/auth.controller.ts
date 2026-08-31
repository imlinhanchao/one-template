import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Response,
  Body,
} from '@nestjs/common';
import * as GitHub from '../lib/github';
import * as Steam from '../lib/steam';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService } from './auth.service';
import Fishpi from 'fishpi';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from 'src/config/config.service';

export interface IRegisterBody {
  username: string;
  password: string;
  email: string;
  nickname?: string;
}

export interface ILoginBody {
  username: string;
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Body()
    body: IRegisterBody,
  ) {
    if (!body.username || !body.password || !body.email) {
      throw new Error('用户名、密码和邮箱不能为空');
    }
    if (body.email.indexOf('@') === -1) {
      throw new Error('邮箱格式不正确');
    }
    return await this.authService.register(body);
  }

  @Post('login')
  async login(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Body() body: ILoginBody,
  ) {
    if (!body.username || !body.password) {
      throw new Error('用户名和密码不能为空');
    }
    return await this.authService.login(body);
  }

  @Get('login/fishpi')
  async loginFishpi(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Query() query,
  ) {
    const fishpi = new Fishpi();
    if (query['openid.mode'] === 'id_res') {
      const user = await fishpi.authVerify(query);
      if (user) {
        return await this.authService.loginFishpi(user);
      } else {
        throw new Error('Fishpi OAuth 验证失败');
      }
    } else {
      const domain = new URL(
        req.headers.referer || `${req.protocol}://${req.headers.host}`,
      ).origin;
      res.redirect(fishpi.generateAuthURL(domain + '/#/login/fishpi'));
    }
  }

  @Get('login/github')
  async loginGithub(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Query() query,
  ) {
    const domain = new URL(
      req.headers.referer || `${req.protocol}://${req.headers.host}`,
    ).host;
    const clientId = this.configService.get('github')?.clientId;
    if (!clientId) return res.end('GitHub OAuth 未配置，请联系管理员');
    if (req.query['code']) {
      const authResult = await this.authService.loginGithub(query, domain);
      return authResult;
    }
    res.redirect(GitHub.getAuthUrl(domain));
  }

  @Get('login/steam')
  async loginSteam(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Query() query,
  ) {
    const domain = new URL(
      req.headers.referer || `${req.protocol}://${req.headers.host}`,
    ).host;
    if (query['openid.mode'] === 'id_res') {
      const steamid = await Steam.verify(query);
      if (steamid) {
        return await this.authService.loginSteam(steamid);
      }
    } else {
      res.redirect(Steam.getAuthUrl(domain));
    }
  }

  @Get('login/support')
  loginSupport() {
    const thirds: string[] = [];
    if (this.configService.get('github')?.clientId) {
      thirds.push('github');
    }
    if (this.configService.get('steam')?.apiKey) {
      thirds.push('steam');
    }
    return {
      thirdParty: thirds,
    };
  }
}
