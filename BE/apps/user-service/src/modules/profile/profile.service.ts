import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProfileResponse } from '@your-org/shared-types';
import { CreateProfileDto } from 'src/dto/create-profile.dto';
import { PrismaService } from 'src/services/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';
import { RedisService } from 'src/services/redis.service';
import axios from 'axios';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  // 프로필 등록
  async createProfile(
    createProfileDto: CreateProfileDto,
  ): Promise<ProfileResponse> {
    const {
      user_id,
      profile_type,
      name,
      birth_date,
      gender,
      avatar_media_id,
      pin,
    } = createProfileDto;

    // 부모인 경우 pin 체크
    if (profile_type === 'PARENT' && !pin) {
      throw new BadRequestException('핀번호를 등록해주세요');
    }

    // 아이일 경우 pin 없어야 함
    if (profile_type === 'CHILD' && pin) {
      throw new BadRequestException('아이는 핀번호를 등록할 수 없습니다');
    }

    if (profile_type === 'PARENT') {
      const pinHash = await bcrypt.hash(String(pin!), 12);

      const parent = await this.prisma.parent.create({
        data: {
          userId: BigInt(user_id),
          name,
          birthDate: new Date(birth_date),
          gender,
          pinHash,
          avatarMediaId: avatar_media_id ? BigInt(avatar_media_id) : null,
          voiceMediaId: null,
        },
      });
      return {
        profile_id: Number(parent.parentId),
        user_id: parent.userId.toString(),
        profile_type: 'PARENT' as const,
        name: parent.name,
        birth_date: parent.birthDate?.toISOString().split('T')[0] || birth_date,
        gender: (parent.gender || gender) as 'MALE' | 'FEMALE',
        avatar_media_id: parent.avatarMediaId?.toString(),
        voice_media_id: parent.voiceMediaId?.toString(),
        created_at: parent.createdAt.toISOString(),
      };
    } else {
      const child = await this.prisma.child.create({
        data: {
          userId: BigInt(user_id),
          name,
          birthDate: new Date(birth_date),
          gender,
          avatarMediaId: avatar_media_id ? BigInt(avatar_media_id) : null,
        },
      });

      return {
        profile_id: Number(child.childId),
        user_id: child.userId.toString(),
        profile_type: 'CHILD' as const,
        name: child.name,
        birth_date: child.birthDate?.toISOString().split('T')[0] || birth_date,
        gender: (child.gender || gender) as 'MALE' | 'FEMALE',
        avatar_media_id: child.avatarMediaId?.toString(),
        created_at: child.createdAt.toISOString(),
      };
    }
  }

  // 프로필 조회
  async getAllProfiles(userId: string) {
    const parents = await this.prisma.parent.findMany({
      where: { userId: BigInt(userId) },
      select: {
        parentId: true,
        userId: true,
        name: true,
        birthDate: true,
        gender: true,
        createdAt: true,
        avatarMediaId: true,
        voiceMediaId: true,
      },
    });

    const children = await this.prisma.child.findMany({
      where: { userId: BigInt(userId) },
      select: {
        childId: true,
        userId: true,
        name: true,
        birthDate: true,
        gender: true,
        createdAt: true,
        avatarMediaId: true,
      },
    });

    const allProfiles = [
      ...parents.map((parent) => ({
        profile_id: Number(parent.parentId),
        user_id: parent.userId.toString(),
        profile_type: 'PARENT' as const,
        name: parent.name,
        birth_date: parent.birthDate?.toISOString().split('T')[0] || '',
        gender: (parent.gender || '') as 'MALE' | 'FEMALE',
        avatar_media_id: parent.avatarMediaId?.toString(),
        voice_media_id: parent.voiceMediaId?.toString(),
        created_at: parent.createdAt.toISOString(),
      })),
      ...children.map((child) => ({
        profile_id: Number(child.childId),
        user_id: child.userId.toString(),
        profile_type: 'CHILD' as const,
        name: child.name,
        birth_date: child.birthDate?.toISOString().split('T')[0] || '',
        gender: (child.gender || '') as 'MALE' | 'FEMALE',
        avatar_media_id: child.avatarMediaId?.toString(),
        created_at: child.createdAt.toISOString(),
      })),
    ];
    return allProfiles;
  }

  // 프로필 수정
  async updateProfile(
    profileId: string,
    profileType: 'PARENT' | 'CHILD',
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const { name, birth_date, gender, avatar_media_id, voice_media_id, pin } =
      updateProfileDto;

    if (profileType === 'PARENT') {
      const updateFields: any = {};

      if (name !== undefined) updateFields.name = name;
      if (birth_date !== undefined)
        updateFields.birthDate = new Date(birth_date);
      if (gender !== undefined) updateFields.gender = gender;
      if (avatar_media_id !== undefined)
        updateFields.avatarMediaId = BigInt(avatar_media_id);
      if (voice_media_id !== undefined)
        updateFields.voiceMediaId = voice_media_id;
      if (pin !== undefined)
        updateFields.pinHash = await bcrypt.hash(String(pin), 12);

      const parent = await this.prisma.parent.update({
        where: {
          parentId: BigInt(profileId),
          userId: BigInt(userId),
        },
        data: updateFields,
      });
      return {
        profile_id: Number(parent.parentId),
        user_id: parent.userId.toString(),
        profile_type: 'PARENT' as const,
        name: parent.name,
        birth_date: parent.birthDate?.toISOString().split('T')[0] || '',
        gender: (parent.gender || gender) as 'MALE' | 'FEMALE',
        avatar_media_id: parent.avatarMediaId?.toString(),
        voice_media_id: parent.voiceMediaId?.toString(),
        created_at: parent.createdAt.toISOString(),
      };
    } else {
      const updateFields: any = {};
      if (name !== undefined) updateFields.name = name;
      if (birth_date !== undefined)
        updateFields.birthDate = new Date(birth_date);
      if (gender !== undefined) updateFields.gender = gender;
      if (avatar_media_id !== undefined)
        updateFields.avatarMediaId = avatar_media_id
          ? BigInt(avatar_media_id)
          : null;

      const child = await this.prisma.child.update({
        where: {
          childId: BigInt(profileId),
          userId: BigInt(userId),
        },
        data: updateFields,
      });
      return {
        profile_id: Number(child.childId),
        user_id: child.userId.toString(),
        profile_type: 'CHILD' as const,
        name: child.name,
        birth_date: child.birthDate?.toISOString().split('T')[0] || '',
        gender: (child.gender || gender) as 'MALE' | 'FEMALE',
        avatar_media_id: child.avatarMediaId?.toString(),
        created_at: child.createdAt.toISOString(),
      };
    }
  }

  // 프로필 삭제
  async deleteProfile(
    profileId: string,
    userId: string,
    profileType: string,
  ): Promise<void> {
    if (profileType === 'PARENT') {
      await this.prisma.parent.delete({
        where: {
          parentId: BigInt(profileId),
          userId: BigInt(userId),
        },
      });
    } else {
      await this.prisma.child.delete({
        where: {
          childId: BigInt(profileId),
          userId: BigInt(userId),
        },
      });
    }
  }

  // 프로필 선택
  async selectProfile(
    profileId: string,
    userId: string,
    profileType: 'PARENT' | 'CHILD',
  ) {
    console.log('프로필 선택 시작:', { profileId, userId, profileType });

    // 1. 기존 리프레시 토큰 삭제 (새로운 세션 시작)
    try {
      await this.redisService.deleteRefreshToken(userId);
      console.log('기존 리프레시 토큰 삭제 완료:', userId);
    } catch (error) {
      console.log('기존 토큰 삭제 중 오류 (무시):', error.message);
    }

    let profileData;

    if (profileType === 'PARENT') {
      const parent = await this.prisma.parent.findUnique({
        where: {
          parentId: BigInt(profileId),
          userId: BigInt(userId),
        },
        select: {
          parentId: true,
          name: true,
          avatarMediaId: true,
        },
      });

      if (!parent) {
        throw new BadRequestException('부모 프로필을 찾을 수 없습니다');
      }

      profileData = {
        profile_id: Number(parent.parentId),
        profile_type: 'PARENT',
        name: parent.name,
        avatar_media_id: parent.avatarMediaId?.toString(),
      };
    } else {
      const child = await this.prisma.child.findUnique({
        where: {
          childId: BigInt(profileId),
          userId: BigInt(userId),
        },
        select: {
          childId: true,
          name: true,
          avatarMediaId: true,
        },
      });

      if (!child) {
        throw new BadRequestException('아이 프로필을 찾을 수 없습니다');
      }

      profileData = {
        profile_id: Number(child.childId),
        profile_type: 'CHILD',
        name: child.name,
        avatar_media_id: child.avatarMediaId?.toString(),
      };
    }

    // 2. 새로운 JWT 토큰 생성 (auth-service와 일관성 유지)
    const payload = {
      sub: userId, // auth-service와 동일하게 sub 사용
      profile_id: profileData.profile_id,
      profile_type: profileData.profile_type,
      profile_name: profileData.name,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refresh_token = this.jwtService.sign(
      { sub: userId, profile_id: profileData.profile_id },
      { expiresIn: '7d' },
    );

    // 3. 새로운 리프레시 토큰을 Redis에 저장
    await this.redisService.setRefreshToken(
      userId,
      refresh_token,
      7 * 24 * 60 * 60, // 7일
    );

    console.log('새로운 토큰 생성 및 저장 완료:', {
      userId,
      profileId: profileData.profile_id,
      profileType: profileData.profile_type,
    });

    return {
      ...profileData,
      access_token,
      refresh_token,
    };
  }

  // PIN 설정
  async updatePin(
    profileId: string,
    userId: string,
    pin: string,
  ): Promise<void> {
    const pinHash = await bcrypt.hash(String(pin), 12);

    await this.prisma.parent.update({
      where: {
        parentId: BigInt(profileId),
        userId: BigInt(userId),
      },
      data: { pinHash },
    });
  }

  // PIN 검증
  async verifyPin(
    profileId: string,
    userId: string,
    pin: string,
  ): Promise<boolean> {
    const redisKey = `pin_attempts:${userId}:${profileId}`;
    const maxAttempts = 5;

    // 현재 시도 횟수 확인
    const currentAttempts = await this.redisService.get(redisKey);
    const attempts = currentAttempts ? parseInt(currentAttempts) : 0;

    if (attempts >= maxAttempts) {
      throw new BadRequestException(
        'PIN 입력 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    const parent = await this.prisma.parent.findUnique({
      where: {
        parentId: BigInt(profileId),
        userId: BigInt(userId),
      },
      select: {
        pinHash: true,
      },
    });
    if (!parent?.pinHash) {
      throw new BadRequestException('PIN이 설정되지 않았습니다');
    }

    const isValid = await bcrypt.compare(String(pin), parent.pinHash);

    if (isValid) {
      // PIN 성공 시 시도 횟수 초기화
      await this.redisService.del(redisKey);
      return true;
    } else {
      const newAttempts = attempts + 1;
      await this.redisService.setex(redisKey, 300, newAttempts.toString());

      const remainingAttempts = maxAttempts - newAttempts;
      if (remainingAttempts > 0) {
        throw new BadRequestException(
          `PIN이 일치하지 않습니다. ${remainingAttempts}번 시도가 가능합니다.`,
        );
      } else {
        throw new BadRequestException(
          'PIN 입력 시도 횟수를 초과했습니다. 5분 후 다시 시도 해주세요.',
        );
      }
    }
  }

  // 음성 등록
  async registerVoice(
    profileId: string,
    userId: string,
    audioFile: any,
    authToken?: string,
  ): Promise<{ voice_id: string }> {
    // 1. 프로필이 존재하는지 확인
    const parent = await this.prisma.parent.findUnique({
      where: {
        parentId: BigInt(profileId),
        userId: BigInt(userId),
      },
    });

    if (!parent) {
      throw new BadRequestException('부모 프로필을 찾을 수 없습니다');
    }

    try {
      // 2. AI 서비스로 음성 파일 전송
      const aiServiceUrl = process.env.GATEWAY_URL || 'http://localhost:3006';

      const FormData = require('form-data');
      const formData = new FormData();

      formData.append('account_id', userId);
      formData.append('profile_name', parent.name);
      formData.append('audio_file', audioFile.buffer, audioFile.originalname);

      const headers: any = {
        ...formData.getHeaders(),
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (authToken) {
        headers['Authorization'] = authToken;
      }

      console.log('AI 서비스 요청 정보:', {
        url: `${aiServiceUrl}/api/ai/tts/voice-profiles`,
        headers: headers,
        account_id: userId,
        profile_name: parent.name,
        audioFile: {
          originalname: audioFile.originalname,
          size: audioFile.buffer?.length,
          mimetype: audioFile.mimetype
        }
      });

      const response = await axios.post(
        `${aiServiceUrl}/api/ai/tts/voice-profiles`,
        formData,
        {
          headers,
        },
      );

      console.log('AI 서비스 응답:', {
        status: response.status,
        data: response.data
      });

      const voiceId = response.data.profile_id;
      console.log('추출된 voice_id:', voiceId);

      // 3. 데이터베이스에 voice_id 저장
      console.log('DB 업데이트 시작:', {
        profileId,
        userId,
        voiceId,
        profileIdType: typeof profileId,
        userIdType: typeof userId
      });

      // profileId와 userId가 문자열인지 확인하고 숫자로 변환
      const profileIdNum = parseInt(profileId);
      const userIdNum = parseInt(userId);

      console.log('변환된 ID들:', {
        profileIdNum,
        userIdNum,
        profileIdValid: !isNaN(profileIdNum),
        userIdValid: !isNaN(userIdNum)
      });

      if (isNaN(profileIdNum) || isNaN(userIdNum)) {
        throw new BadRequestException('잘못된 프로필 ID 또는 사용자 ID');
      }

      await this.prisma.parent.update({
        where: {
          parentId: BigInt(profileIdNum),
          userId: BigInt(userIdNum),
        },
        data: {
          voiceMediaId: voiceId,
        },
      });

      console.log('DB 업데이트 완료');
      return { voice_id: voiceId };
    } catch (error) {
      console.error('registerVoice 오류:', error);

      if (error.response) {
        console.error('AI 서비스 응답 오류:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        throw new HttpException(
          `AI 서비스 호출 실패: ${JSON.stringify(error.response.data)}`,
          error.response.status,
        );
      }

      if (error.request) {
        console.error('AI 서비스 요청 오류:', error.request);
        throw new HttpException(
          'AI 서비스에 연결할 수 없습니다',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      console.error('일반 오류:', error.message);
      throw new HttpException(
        `음성 등록 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
