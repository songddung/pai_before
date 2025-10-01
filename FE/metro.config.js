const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// shared-types 모듈 해결을 위한 설정
config.resolver.alias = {
  '@shared-types': path.resolve(__dirname, '../dist/shared-types/src'),
};

// watchFolders에 shared-types 추가
config.watchFolders = [
  path.resolve(__dirname, '../dist/shared-types'),
  ...((config.watchFolders) || []),
];

// RedBox 완전 비활성화를 위한 transformer 설정
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// 에러 리포팅 비활성화
config.reporter = {
  update: () => {},
};

module.exports = config;