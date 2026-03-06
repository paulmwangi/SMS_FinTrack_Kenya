import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  it('should have initial unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set user and token via setUser', () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'MEMBER' };
    const mockToken = 'test-jwt-token';

    useAuthStore.getState().setUser(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('should clear state on logout', () => {
    // First set authenticated state
    const mockUser = { id: '1', email: 'test@example.com', role: 'MEMBER' };
    useAuthStore.getState().setUser(mockUser, 'test-token');

    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
