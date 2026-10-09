import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string, duration: number = 4000): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type, title, duration };

    this.toasts.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Success'): void {
    this.show(message, 'success', title);
  }

  error(message: string, title: string = 'Error'): void {
    this.show(message, 'error', title, 5000);
  }

  info(message: string, title: string = 'Information'): void {
    this.show(message, 'info', title);
  }

  warning(message: string, title: string = 'Notice'): void {
    this.show(message, 'warning', title);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
