import path from 'path';
import fs from 'fs';

export const configPath = path.resolve(__dirname, '../../config.json');

export function hasConfigFile() {
  return fs.existsSync(configPath);
}

export function omit(obj: Record<string, any>, keys: string[]) {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function getDomain(req: any, hostOnly = false): string {
  const url = new URL(
    req.headers.referer || `${req.protocol}://${req.headers.host}`,
  );
  return hostOnly ? url.host : url.origin;
}

export function getHost(req: any): string {
  return getDomain(req, true);
}

export const getOrigin = getDomain;
