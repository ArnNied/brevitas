import { apiKeyConverter, nexusConverter } from './converter';
import { dbAdmin } from './core';

export const nexusCollection = dbAdmin
  .collection('nexus')
  .withConverter(nexusConverter);

export const apiKeyCollection = dbAdmin
  .collection('apiKeys')
  .withConverter(apiKeyConverter);
