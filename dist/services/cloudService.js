"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudAllocations = exports.allocateCloudAccount = exports.cloudService = exports.CloudService = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const identity_1 = require("@azure/identity");
const arm_compute_1 = require("@azure/arm-compute");
const google_auth_library_1 = require("google-auth-library");
const encryption_1 = require("../utils/encryption");
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = require("../config/database");
class CloudService {
    async createStudentCloudUser(cloudAccount, studentId, assessmentId) {
        const username = `student-${studentId}-${assessmentId}-${Date.now()}`;
        try {
            const decryptedCredentials = {
                ...cloudAccount.credentials,
                accessKeyId: (0, encryption_1.decrypt)(cloudAccount.credentials.accessKeyId),
                secretAccessKey: (0, encryption_1.decrypt)(cloudAccount.credentials.secretAccessKey)
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
        }
        catch (error) {
            logger_1.default.error('Error creating cloud user:', error);
            throw new Error(`Failed to create cloud user: ${error.message}`);
        }
    }
    async createAWSUser(credentials, username) {
        const iam = new aws_sdk_1.default.IAM({
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            region: credentials.region || 'us-east-1'
        });
        try {
            await iam.createUser({ UserName: username }).promise();
            logger_1.default.info(`AWS user created: ${username}`);
            const accessKeyResult = await iam.createAccessKey({ UserName: username }).promise();
            await iam.attachUserPolicy({
                UserName: username,
                PolicyArn: 'arn:aws:iam::aws:policy/PowerUserAccess'
            }).promise();
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
                access_key: accessKeyResult.AccessKey.AccessKeyId,
                secret_key: accessKeyResult.AccessKey.SecretAccessKey,
                region: credentials.region || 'us-east-1'
            };
        }
        catch (error) {
            try {
                await iam.deleteUser({ UserName: username }).promise();
            }
            catch (cleanupError) {
                logger_1.default.error('Error cleaning up AWS user:', cleanupError);
            }
            throw error;
        }
    }
    async createAzureUser(credentials, username) {
        const credential = new identity_1.ClientSecretCredential(credentials.tenantId, credentials.clientId, credentials.clientSecret);
        return {
            provider: 'azure',
            username,
            subscription_id: credentials.subscriptionId,
            tenant_id: credentials.tenantId,
            access_key: credentials.clientId,
            secret_key: credentials.clientSecret
        };
    }
    async createGCPUser(credentials, username) {
        const auth = new google_auth_library_1.GoogleAuth({
            credentials: credentials.serviceAccountKey,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        return {
            provider: 'gcp',
            username,
            project_id: credentials.projectId,
            access_key: JSON.stringify(credentials.serviceAccountKey)
        };
    }
    async cleanupStudentResources(credentials) {
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
            logger_1.default.info(`Cleaned up resources for user: ${credentials.username}`);
        }
        catch (error) {
            logger_1.default.error('Error cleaning up cloud resources:', error);
        }
    }
    async cleanupAWSResources(credentials) {
        const iam = new aws_sdk_1.default.IAM({
            accessKeyId: credentials.access_key,
            secretAccessKey: credentials.secret_key,
            region: credentials.region
        });
        try {
            const accessKeys = await iam.listAccessKeys({ UserName: credentials.username }).promise();
            for (const key of accessKeys.AccessKeyMetadata) {
                if (key.AccessKeyId) {
                    await iam.deleteAccessKey({
                        UserName: credentials.username,
                        AccessKeyId: key.AccessKeyId
                    }).promise();
                }
                else {
                    logger_1.default.warn(`AccessKeyId is undefined for user: ${credentials.username}`);
                }
            }
            const attachedPolicies = await iam.listAttachedUserPolicies({ UserName: credentials.username }).promise();
            for (const policy of attachedPolicies.AttachedPolicies ?? []) {
                await iam.detachUserPolicy({
                    UserName: credentials.username,
                    PolicyArn: policy.PolicyArn
                }).promise();
            }
            const inlinePolicies = await iam.listUserPolicies({ UserName: credentials.username }).promise();
            for (const policyName of inlinePolicies.PolicyNames) {
                await iam.deleteUserPolicy({
                    UserName: credentials.username,
                    PolicyName: policyName
                }).promise();
            }
            await iam.deleteUser({ UserName: credentials.username }).promise();
        }
        catch (error) {
            logger_1.default.error(`Error cleaning up AWS user ${credentials.username}:`, error);
        }
    }
    async cleanupAzureResources(credentials) {
        logger_1.default.info('Azure resource cleanup not implemented yet');
    }
    async cleanupGCPResources(credentials) {
        logger_1.default.info('GCP resource cleanup not implemented yet');
    }
    async testCloudConnection(provider, credentials) {
        try {
            switch (provider) {
                case 'aws':
                    const aws = new aws_sdk_1.default.STS({
                        accessKeyId: credentials.accessKeyId,
                        secretAccessKey: credentials.secretAccessKey,
                        region: credentials.region
                    });
                    await aws.getCallerIdentity().promise();
                    return { success: true };
                case 'azure':
                    const azureCredential = new identity_1.ClientSecretCredential(credentials.tenantId, credentials.clientId, credentials.clientSecret);
                    const computeClient = new arm_compute_1.ComputeManagementClient(azureCredential, credentials.subscriptionId);
                    await computeClient.virtualMachines.listAll();
                    return { success: true };
                case 'gcp':
                    const gcpAuth = new google_auth_library_1.GoogleAuth({
                        credentials: credentials.serviceAccountKey,
                        scopes: ['https://www.googleapis.com/auth/cloud-platform']
                    });
                    const gcpClient = await gcpAuth.getClient();
                    await gcpClient.request({ url: 'https://www.googleapis.com/auth/cloud-platform' });
                    return { success: true };
                default:
                    return { success: false, error: 'Unsupported cloud provider' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async createCloudAccount(data) {
        return { id: 1, ...data };
    }
    async updateCloudAccount(id, data) {
        return { id, ...data };
    }
    async deleteCloudAccount(id) {
        return { id, deleted: true };
    }
    async getCloudAccounts() {
        return [{ id: 1, name: 'Sample Cloud Account' }];
    }
    async removeCloudAllocation(id) {
        await (0, database_1.query)('DELETE FROM cloud_allocations WHERE id = $1', [id]);
    }
    async allocateCloudAccount(cloudAccountId, assessmentId, batchId) {
        await (0, database_1.query)('INSERT INTO cloud_allocations (cloudAccountId, assessmentId, batchId) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [cloudAccountId, assessmentId || null, batchId || null]);
    }
    async getCloudAllocations() {
        const res = await (0, database_1.query)('SELECT * FROM cloud_allocations');
        return res.rows;
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
const allocateCloudAccount = async (cloudAccountId, assessmentId, batchId) => {
    await (0, database_1.query)('INSERT INTO cloud_allocations (cloudAccountId, assessmentId, batchId) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [cloudAccountId, assessmentId || null, batchId || null]);
};
exports.allocateCloudAccount = allocateCloudAccount;
const getCloudAllocations = async () => {
    const res = await (0, database_1.query)('SELECT * FROM cloud_allocations');
    return res.rows;
};
exports.getCloudAllocations = getCloudAllocations;
//# sourceMappingURL=cloudService.js.map