import { Token } from '@linode/api-v4/lib/profile/types';
import * as Factory from 'factory.ts';

export const appTokenFactory = Factory.Sync.makeFactory<Token>({
  id: Factory.each((i) => i),
  label: 'test-token',
  thumbnail_url: null,
  scopes: 'linodes:create',
  created: '2020-01-01T12:00:00',
  expiry: null,
  website: 'http://cloud.linode.com',
});

export interface Access {
  Account: number;
  Databases: number;
  Domains: number;
  Events: number;
  // 'Firewalls': number,
  Images: number;
  IPs: number;
  Linodes: number;
  // 'Kubernetes': number,
  Longview: number;
  NodeBalancers: number;
  // 'Object Storage': number,
  StackScripts: number;
  Volumes: number;
}

export const accessFactory = Factory.Sync.makeFactory<Access>({
  Account: 0,
  Databases: 0,
  Domains: 0,
  Events: 0,
  // 'Firewalls': 0,
  Images: 0,
  IPs: 0,
  Linodes: 0,
  // 'Kubernetes': 0,
  Longview: 0,
  NodeBalancers: 0,
  // 'Object Storage': 0,
  StackScripts: 0,
  Volumes: 0,
});
