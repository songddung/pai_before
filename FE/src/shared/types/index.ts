// 1ÔÜ shared-types ¬´ô´0
export type * from '@shared-types';

// `¸ÔÜ © õµ À…
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

//  ø¬ð À…
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;