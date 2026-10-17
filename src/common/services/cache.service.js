import { client } from "../../DB/redis.connection.js";

export const set = async ({ key, value, ttl = undefined } = {}) => {
  if (typeof value == "object") {
    value = JSON.stringify(value);
  }
  return client.set(key, value, { EX: ttl });
};

export const get = async ({ key } = {}) => {
  let value = await client.get(key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

export const exists = async ({ key } = {}) => {
  return await client.exists(key);
};

export const update = async ({ key, value, ttl = undefined } = {}) => {
  if (!(await exists({ key }))) {
    return 0;
  }
  return await set({ key, value, ttl });
};

export const del = async ({ key } = {}) => {
  return await client.del(key);
};

export const keys = async ({ prefix } = {}) => {
  return await client.keys(`${prefix}*`);
};

export const ttl = async ({ key }) => {
  return client.ttl(key);
};

export const expire = async ({ key, ttl }) => {
  return client.expire(key, ttl);
};

export const incrementBy = async ({ key, count = 1 }) => {
  return client.incrBy(key, count);
};
