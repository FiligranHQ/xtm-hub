import Label from '../model/kanel/public/Label';

export type WithLabels<T> = T & { labels: Label[] };
