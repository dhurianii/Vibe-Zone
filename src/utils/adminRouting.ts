export function isProtectedAdminPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/access-denied'
  );
}

export type AdminGateAction = 'render-login' | 'render-access-denied' | 'render-panel';

export interface AdminGateDecision {
  action: AdminGateAction;
  redirectTo: string | null;
}

export function evaluateAdminRouteGate(
  pathname: string,
  authState: {
    isAuthenticated: boolean;
    isAuthorized: boolean;
  }
): AdminGateDecision {
  if (!authState.isAuthenticated) {
    if (pathname === '/access-denied') {
      return {
        action: 'render-login',
        redirectTo: '/admin/login',
      };
    }
    if (pathname !== '/admin/login' && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
      return {
        action: 'render-login',
        redirectTo: '/admin/login',
      };
    }
    return {
      action: 'render-login',
      redirectTo: null,
    };
  }

  if (!authState.isAuthorized) {
    return {
      action: 'render-access-denied',
      redirectTo: pathname === '/access-denied' ? null : '/access-denied',
    };
  }

  if (pathname === '/admin/login' || pathname === '/access-denied') {
    return {
      action: 'render-panel',
      redirectTo: '/admin',
    };
  }

  return {
    action: 'render-panel',
    redirectTo: null,
  };
}
