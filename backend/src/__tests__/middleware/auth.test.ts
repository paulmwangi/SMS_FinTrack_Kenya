import { Request, Response, NextFunction } from 'express';

// Mock passport config to avoid PrismaClient initialization
jest.mock('../../config/passport', () => ({
  __esModule: true,
  default: { authenticate: jest.fn() },
}));

import { authorize } from '../../middleware/auth';

describe('authorize middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should return 401 if no user on request', () => {
    const middleware = authorize('ADMIN');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not in allowed roles', () => {
    mockReq.user = { role: 'MEMBER' } as any;
    const middleware = authorize('ADMIN', 'TREASURER');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() if user role is allowed', () => {
    mockReq.user = { role: 'ADMIN' } as any;
    const middleware = authorize('ADMIN', 'TREASURER');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should allow multiple roles', () => {
    mockReq.user = { role: 'TREASURER' } as any;
    const middleware = authorize('ADMIN', 'TREASURER', 'CHAIRMAN');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
