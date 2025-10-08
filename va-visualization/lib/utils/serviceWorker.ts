/**
 * Service Worker 등록 및 관리 유틸리티
 */

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Service Worker 등록
   */
  public async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW] Service Worker not supported');
      return null;
    }

    try {
      console.log('[SW] Registering Service Worker...');
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[SW] Service Worker registered successfully:', this.registration);

      // 업데이트 확인
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New Service Worker available');
              this.showUpdateNotification();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Service Worker 업데이트 알림 표시
   */
  private showUpdateNotification(): void {
    if (confirm('새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?')) {
      this.updateServiceWorker();
    }
  }

  /**
   * Service Worker 업데이트
   */
  public async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      console.warn('[SW] No registration found');
      return;
    }

    try {
      const newWorker = this.registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('[SW] Failed to update Service Worker:', error);
    }
  }

  /**
   * 캐시 클리어
   */
  public async clearCache(): Promise<void> {
    if (!this.registration) {
      console.warn('[SW] No registration found');
      return;
    }

    try {
      if (this.registration.active) {
        this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
      console.log('[SW] Cache clear requested');
    } catch (error) {
      console.error('[SW] Failed to clear cache:', error);
    }
  }

  /**
   * Service Worker 상태 확인
   */
  public getStatus(): {
    isSupported: boolean;
    isRegistered: boolean;
    isActive: boolean;
    registration: ServiceWorkerRegistration | null;
  } {
    return {
      isSupported: 'serviceWorker' in navigator,
      isRegistered: !!this.registration,
      isActive: !!this.registration?.active,
      registration: this.registration
    };
  }
}

/**
 * Service Worker 등록 훅
 */
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    const swManager = ServiceWorkerManager.getInstance();
    
    setIsSupported(swManager.getStatus().isSupported);
    
    if (swManager.getStatus().isSupported) {
      swManager.register().then((registration) => {
        setIsRegistered(!!registration);
      });
    }
  }, []);

  return {
    isSupported,
    isRegistered,
    updateServiceWorker: () => ServiceWorkerManager.getInstance().updateServiceWorker(),
    clearCache: () => ServiceWorkerManager.getInstance().clearCache()
  };
}

// React import (useServiceWorker 훅에서 사용)
import React from 'react';


