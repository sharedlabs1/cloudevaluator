export interface CloudAccount {
    id: number;
    name: string;
    provider: 'aws' | 'azure' | 'gcp';
    credentials: any;
    is_active: boolean;
    created_by: number;
    created_at: Date;
  }
  
  export interface CloudUserCredentials {
    provider: string;
    username: string;
    access_key?: string;
    secret_key?: string;
    region?: string;
    subscription_id?: string;
    tenant_id?: string;
    project_id?: string;
  }