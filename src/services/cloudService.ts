// src/services/cloudService.ts
import AWS from 'aws-sdk';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { ComputeManagementClient } from '@azure/arm-compute';
import { StorageManagementClient } from '@azure/arm-storage';
import { GoogleAuth } from 'google-auth-library';
// Removed unused and incorrect import for Compute from '@google-cloud/compute'
import { Storage } from '@google-cloud/storage';
import { CloudAccount, CloudUserCredentials } from '../types/cloud';
import { encrypt, decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import { query } from '../config/database';

export class CloudService {
  async createStudentCloudUser(
    cloudAccount: CloudAccount,
    studentId: number,
    assessmentId: number
  ): Promise<CloudUserCredentials> {
    const username = `student-${studentId}-${assessmentId}-${Date.now()}`;
    
    try {
      const decryptedCredentials = {
        ...cloudAccount.credentials,
        accessKeyId: decrypt(cloudAccount.credentials.accessKeyId),
        secretAccessKey: decrypt(cloudAccount.credentials.secretAccessKey)
      };

      switch (cloudAccount.provider) {
        case 'aws':
          return await this.createAWSUser(decryptedCredentials, username);
        case 'azure':
          return await this.createAzureUser(decryptedCredentials, username);
        case 'gcp':
          return await this.createGCPUser(decryptedCredentials, username);
        default:
          throw new Error(`Unsupported cloud provider: ${cloudAccount.provider}`);
      }
    } catch (error) {
      logger.error('Error creating cloud user:', error);
      throw new Error(`Failed to create cloud user: ${(error as Error).message}`);
    }
  }

  private async createAWSUser(credentials: any, username: string): Promise<CloudUserCredentials> {
    const iam = new AWS.IAM({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region || 'us-east-1'
    });

    try {
      // Create IAM user
      await iam.createUser({ UserName: username }).promise();
      logger.info(`AWS user created: ${username}`);

      // Create access key
      const accessKeyResult = await iam.createAccessKey({ UserName: username }).promise();

      // Attach PowerUser policy (customize as needed)
      await iam.attachUserPolicy({
        UserName: username,
        PolicyArn: 'arn:aws:iam::aws:policy/PowerUserAccess'
      }).promise();

      // Create inline policy for specific permissions
      const policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              's3:*',
              'ec2:*',
              'iam:ListRoles',
              'iam:PassRole',
              'lambda:*',
              'cloudformation:*'
            ],
            Resource: '*'
          }
        ]
      };

      await iam.putUserPolicy({
        UserName: username,
        PolicyName: 'AssessmentPolicy',
        PolicyDocument: JSON.stringify(policyDocument)
      }).promise();

      return {
        provider: 'aws',
        username,
        access_key: accessKeyResult.AccessKey.AccessKeyId!,
        secret_key: accessKeyResult.AccessKey.SecretAccessKey!,
        region: credentials.region || 'us-east-1'
      };
    } catch (error) {
      // Cleanup on error
      try {
        await iam.deleteUser({ UserName: username }).promise();
      } catch (cleanupError) {
        logger.error('Error cleaning up AWS user:', cleanupError);
      }
      throw error;
    }
  }

  private async createAzureUser(credentials: any, username: string): Promise<CloudUserCredentials> {
    // Implementation for Azure user creation
    // This would involve Azure AD and subscription management
    const credential = new ClientSecretCredential(
      credentials.tenantId,
      credentials.clientId,
      credentials.clientSecret
    );

    // For now, return the main credentials (in production, create actual user)
    return {
      provider: 'azure',
      username,
      subscription_id: credentials.subscriptionId,
      tenant_id: credentials.tenantId,
      access_key: credentials.clientId,
      secret_key: credentials.clientSecret
    };
  }

  private async createGCPUser(credentials: any, username: string): Promise<CloudUserCredentials> {
    // Implementation for GCP user creation
    // This would involve IAM service account creation
    const auth = new GoogleAuth({
      credentials: credentials.serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // For now, return the main credentials (in production, create actual service account)
    return {
      provider: 'gcp',
      username,
      project_id: credentials.projectId,
      access_key: JSON.stringify(credentials.serviceAccountKey)
    };
  }

  async cleanupStudentResources(credentials: CloudUserCredentials): Promise<void> {
    try {
      switch (credentials.provider) {
        case 'aws':
          await this.cleanupAWSResources(credentials);
          break;
        case 'azure':
          await this.cleanupAzureResources(credentials);
          break;
        case 'gcp':
          await this.cleanupGCPResources(credentials);
          break;
      }
      logger.info(`Cleaned up resources for user: ${credentials.username}`);
    } catch (error) {
      logger.error('Error cleaning up cloud resources:', error);
    }
  }

  private async cleanupAWSResources(credentials: CloudUserCredentials): Promise<void> {
    const iam = new AWS.IAM({
      accessKeyId: credentials.access_key,
      secretAccessKey: credentials.secret_key,
      region: credentials.region
    });

    try {
      // List and delete access keys
      const accessKeys = await iam.listAccessKeys({ UserName: credentials.username }).promise();
      for (const key of accessKeys.AccessKeyMetadata) {
        if (key.AccessKeyId) {
          await iam.deleteAccessKey({
            UserName: credentials.username,
            AccessKeyId: key.AccessKeyId
          }).promise();
        } else {
          logger.warn(`AccessKeyId is undefined for user: ${credentials.username}`);
        }
      }

      // Detach policies
      const attachedPolicies = await iam.listAttachedUserPolicies({ UserName: credentials.username }).promise();
      for (const policy of attachedPolicies.AttachedPolicies ?? []) {
        await iam.detachUserPolicy({
          UserName: credentials.username,
          PolicyArn: policy.PolicyArn!
        }).promise();
      }

      // Delete inline policies
      const inlinePolicies = await iam.listUserPolicies({ UserName: credentials.username }).promise();
      for (const policyName of inlinePolicies.PolicyNames) {
        await iam.deleteUserPolicy({
          UserName: credentials.username,
          PolicyName: policyName
        }).promise();
      }

      // Delete user
      await iam.deleteUser({ UserName: credentials.username }).promise();
    } catch (error) {
      logger.error(`Error cleaning up AWS user ${credentials.username}:`, error);
    }
  }

  private async cleanupAzureResources(credentials: CloudUserCredentials): Promise<void> {
    // Implement Azure resource cleanup
    logger.info('Azure resource cleanup not implemented yet');
  }

  private async cleanupGCPResources(credentials: CloudUserCredentials): Promise<void> {
    // Implement GCP resource cleanup
    logger.info('GCP resource cleanup not implemented yet');
  }

  async testCloudConnection(provider: string, credentials: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (provider) {
        case 'aws':
          const aws = new AWS.STS({
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            region: credentials.region
          });
          await aws.getCallerIdentity().promise();
          return { success: true };
        case 'azure':
          const azureCredential = new ClientSecretCredential(
            credentials.tenantId,
            credentials.clientId,
            credentials.clientSecret
          );
          const computeClient = new ComputeManagementClient(azureCredential, credentials.subscriptionId);
          await computeClient.virtualMachines.listAll();
          return { success: true };
        case 'gcp':
          const gcpAuth = new GoogleAuth({
            credentials: credentials.serviceAccountKey,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
          });
          const gcpClient = await gcpAuth.getClient();
          await gcpClient.request({ url: 'https://www.googleapis.com/auth/cloud-platform' });
          return { success: true };
        default:
          return { success: false, error: 'Unsupported cloud provider' };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async createCloudAccount(data: any) {
    // TODO: Implement cloud account creation logic
    return { id: 1, ...data };
  }

  async updateCloudAccount(id: string, data: any) {
    // TODO: Implement cloud account update logic
    return { id, ...data };
  }

  async deleteCloudAccount(id: string) {
    // TODO: Implement cloud account deletion logic
    return { id, deleted: true };
  }

  async getCloudAccounts() {
    // TODO: Implement get all cloud accounts logic
    return [{ id: 1, name: 'Sample Cloud Account' }];
  }

  async removeCloudAllocation(id: string) {
    await query('DELETE FROM cloud_allocations WHERE id = $1', [id]);
  }

  async allocateCloudAccount(cloudAccountId: string, assessmentId?: string, batchId?: string) {
    await query(
      'INSERT INTO cloud_allocations (cloudAccountId, assessmentId, batchId) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [cloudAccountId, assessmentId || null, batchId || null]
    );
  }

  async getCloudAllocations() {
    const res = await query('SELECT * FROM cloud_allocations');
    return res.rows;
  }
}

export const cloudService = new CloudService();

export const allocateCloudAccount = async (cloudAccountId: string, assessmentId?: string, batchId?: string) => {
  // Store allocation in a new table: cloud_allocations (cloudAccountId, assessmentId, batchId)
  await query(
    'INSERT INTO cloud_allocations (cloudAccountId, assessmentId, batchId) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [cloudAccountId, assessmentId || null, batchId || null]
  );
};

export const getCloudAllocations = async () => {
  const res = await query('SELECT * FROM cloud_allocations');
  return res.rows;
};