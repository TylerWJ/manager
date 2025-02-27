export interface VPC {
  id: number;
  label: string;
  description: string;
  region: string;
  subnets: Subnet[];
  created: string;
  updated: string;
}

export interface CreateVPCPayload {
  label: string;
  description?: string;
  region: string;
  subnets?: SubnetPostObject[];
}

export interface UpdateVPCPayload {
  label?: string;
  description?: string;
}

export interface SubnetPostObject {
  label: string;
  ipv4: string;
  ipv6: string;
}

export interface Subnet extends SubnetPostObject {
  id: number;
  linodes: number[];
  created: string;
  updated: string;
}
