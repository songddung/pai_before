export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  profile: 'parent' | 'child';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';