import UseCase from '../model/kanel/public/UseCase';

export type WithUseCases<T> = T & { use_cases: UseCase[] };
