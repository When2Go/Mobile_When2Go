import type { RepeatItem, RepeatFormData } from '@/types/repeat.types';

type WithBuffer = Pick<RepeatItem, 'safetyBufferMin'> | Pick<RepeatFormData, 'safetyBufferMin'>;

export function resolveRepeatBufferMinutes(
  item: WithBuffer,
  globalBufferMin: number,
): number {
  return item.safetyBufferMin ?? globalBufferMin;
}
