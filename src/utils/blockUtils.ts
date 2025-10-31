import { type MouseEvent, type KeyboardEvent } from 'react';

export function createHeaderKeyDownHandler(
  onToggleMinimize: () => void,
  onRemove: () => void
) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleMinimize();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      onRemove();
    }
  };
}

export function createStopPropagationHandler<T extends HTMLElement>(
  callback: (e: MouseEvent<T>) => void
) {
  return (e: MouseEvent<T>) => {
    e.stopPropagation();
    callback(e);
  };
}

export function shouldPreventDragFromInteractiveElements(target: HTMLElement): boolean {
  return !!target.closest('input, button, .log-content');
}
