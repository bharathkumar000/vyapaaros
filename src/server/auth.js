import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logAudit } from './audit';

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-dev-secret-change-me';
const TOKEN_TTL = process.env.JWT_TTL || '8h';

const USERS = new Map();

const SALT_ROUNDS = 10;

const defaultUser = () => ({
  id: 'user-1',
  username: process.env.ADMIN_USERNAME || '1',
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || '1', SALT_ROUNDS),
  role: 'admin',
  branchIds: null,
});

export function seedUsers(branchIds = []) {
  USERS.clear();
  const user = defaultUser();
  if (user.role !== 'admin') user.branchIds = [...new Set(branchIds)];
  USERS.set(user.id, user);
  return user;
}

export const findByUsername = (username) => {
  for (const user of USERS.values()) {
    if (user.username.toLowerCase() === String(username).toLowerCase()) return user;
  }
  return undefined;
};

export const verifyPassword = (password, passwordHash) => bcrypt.compareSync(String(password), passwordHash);

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      branchIds: user.role === 'admin' ? null : user.branchIds,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );

export function authenticate(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return { error: 'Authentication required', status: 401 };

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { user: payload };
  } catch {
    return { error: 'Invalid or expired token', status: 401 };
  }
}

export const isAdmin = (user) => user?.role === 'admin';

export const canAccessBranch = (user, branchId) => {
  if (!user) return false;
  const targetId = String(branchId || 'branch-1');
  if (isAdmin(user)) return true;
  return Array.isArray(user.branchIds) && user.branchIds.includes(targetId);
};

export function guardBranchAccess(request, user, branchId, event = 'access.denied') {
  if (canAccessBranch(user, branchId)) return null;
  logAudit(event, {
    userId: user?.sub,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    branchId,
  });
  return { error: 'Forbidden', status: 403 };
}
