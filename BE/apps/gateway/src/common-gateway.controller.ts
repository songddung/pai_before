import {
  All,
  Controller,
  Headers,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Controller()
export class CommonGatewayController {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  // JWT 토큰에서 사용자 ID, 프로필 ID 등 정보 추출
  private extractUserInfoFromJWT(authHeader: string): {
    userId: string;
    profileId?: string;
    profileType?: string;
  } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('유효한 토큰이 필요합니다.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token) as any;

      if (!payload) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const userId = payload.sub;
      if (!userId) {
        throw new UnauthorizedException('토큰에서 사용자 ID를 찾을 수 없습니다.');
      }

      return {
        userId: userId.toString(),
        profileId: (payload.profile_id || payload.profileId)?.toString(),
        profileType: payload.profile_type || payload.profileType,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('토큰 처리 중 오류가 발생했습니다.');
    }
  }

  // 경로에 따라 호출할 마이크로서비스의 base URL 반환
  private getServiceUrl(path: string): string {
    if (path.startsWith('/api/users')) {
      return `${process.env.USER_SERVICE_URL || 'http://localhost:3001'}${path}`;
    }
    if (path.startsWith('/api/profile')) {
      return `${process.env.USER_SERVICE_URL || 'http://localhost:3001'}${path}`;
    }
    if (path.startsWith('/api/media')) {
      return `${process.env.MEDIA_SERVICE_URL || 'http://localhost:3002'}${path}`;
    }
    if (path.startsWith('/api/ark')) {
      return `${process.env.ARK_SERVICE_URL || 'http://localhost:3003'}${path}`;
    }
    if (path.startsWith('/api/conversations')) {
      return `${process.env.CONVERSATION_SERVICE_URL || 'http://localhost:3004'}${path}`;
    }
    if (path.startsWith('/api/quiz')) {
      return `${process.env.QUIZ_SERVICE_URL || 'http://localhost:3005'}${path}`;
    }
    if (path.startsWith('/api/ai')) {
      return `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}${path}`;
    }

    throw new Error(`Unknown service path: ${path}`);
  }

  // 인증 없이 접근 가능한 공개 경로인지 판단
  private isPublicPath(path: string, method: string): boolean {
    const publicPaths = [
      { path: '/api/users', method: 'POST' },       // 회원가입
      { path: '/api/users/login', method: 'POST' }, // 로그인
    ];

    return publicPaths.some(
      (publicPath) => path === publicPath.path && method === publicPath.method,
    );
  }

  // 특정 경로에서는 프로필 정보가 JWT에 포함되어야 함
  private requiresProfile(path: string, method: string): boolean {
    const profileRequiredPaths = [
      { path: '/api/quiz', method: 'POST' },
      { path: '/api/conversations', method: 'POST' },
      { pathPattern: /^\/api\/profile\/[^\/]+$/, method: 'PATCH' },
      { pathPattern: /^\/api\/profile\/[^\/]+$/, method: 'DELETE' },
      { pathPattern: /^\/api\/profile\/[^\/]+\/pin$/, method: 'PATCH' },
      { pathPattern: /^\/api\/profile\/[^\/]+\/pin\/verify$/, method: 'POST' },
    ];

    return profileRequiredPaths.some((required) => {
      if (required.pathPattern) {
        return required.pathPattern.test(path) && method === required.method;
      }
      return path.startsWith(required.path) && method === required.method;
    });
  }

  // 모든 경로를 받아 각 마이크로서비스로 프록시 요청
  @All('*')
  async proxyRequest(@Req() req: any, @Res() res: any) {
    const { method, url, body, headers } = req;
    const path = url.split('?')[0];
    const authHeader = headers.authorization;

    try {
      // 인증이 필요한 경우, JWT 검증 및 사용자 정보 추출
      if (!this.isPublicPath(path, method.toUpperCase())) {
        const userInfo = this.extractUserInfoFromJWT(authHeader);

        // 프로필이 필요한 경로인 경우, 검증
        if (this.requiresProfile(path, method.toUpperCase())) {
          if (!userInfo.profileId || !userInfo.profileType) {
            throw new UnauthorizedException('프로필을 선택해주세요.');
          }
        }
      }

      // 서비스 URL 결정
      const serviceUrl = this.getServiceUrl(path);

      // 헤더에서 host, content-length 제거
      const forwardHeaders = { ...headers };
      delete forwardHeaders.host;
      delete forwardHeaders['content-length'];

      // multipart/form-data 여부 확인
      const isMultipart = headers['content-type']?.includes('multipart/form-data');

      // 응답 타입 결정 (기본: json)
      let responseType: 'json' | 'arraybuffer' | 'stream' = 'json';

      // 음성/미디어 파일 응답인 경우 arraybuffer로 설정
      if (
        path.includes('/tts/generate') ||
        path.includes('/media/download') ||
        path.match(/\.(mp3|wav|mp4|jpg|png)$/)
      ) {
        responseType = 'arraybuffer';
      }

      // 실제 마이크로서비스로 요청 전달
      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url:
            serviceUrl +
            (req.url.includes('?') ? '?' + req.url.split('?')[1] : ''),
          data: isMultipart ? req : body,
          headers: forwardHeaders,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          validateStatus: () => true,
          responseType,
        }),
      );

      // 응답 헤더 세팅 (transfer-encoding 제외)
      Object.keys(response.headers).forEach((key) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.set(key, response.headers[key]);
        }
      });

      // 응답 데이터 전달
      if (responseType === 'arraybuffer') {
        // 바이너리 데이터는 Buffer로 전송
        res.status(response.status).send(Buffer.from(response.data));
      } else {
        // JSON 또는 텍스트 응답
        res.status(response.status).send(response.data);
      }
    } catch (error) {
      // 인증 실패
      if (error instanceof UnauthorizedException) {
        res.status(401).json({ success: false, message: error.message });
      }
      // 알 수 없는 서비스 경로
      else if (error.message.startsWith('Unknown service path')) {
        res.status(404).json({ success: false, message: 'Service not found' });
      }
      // 기타 에러
      else {
        console.error('Gateway error:', error);
        res.status(500).json({ success: false, message: 'Internal gateway error' });
      }
    }
  }
}
