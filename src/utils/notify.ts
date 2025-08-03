import { Notify, QNotifyCreateOptions } from 'quasar'

type NotifyType = 'positive' | 'negative' | 'warning' | 'info';

interface NotifyOptions {
  message: string;
  color?: NotifyType;
  position?: QNotifyCreateOptions['position'];
  timeout?: number;
}

export function notify({
  message,
  color = 'info',
  position = 'bottom',
  timeout = 3000,
}: NotifyOptions) {
  Notify.create({
    message,
    color,
    position,
    timeout,
  })
}
