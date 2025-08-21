import { CloudAccount, CloudUserCredentials } from '../types/cloud';
export declare class CloudService {
    createStudentCloudUser(cloudAccount: CloudAccount, studentId: number, assessmentId: number): Promise<CloudUserCredentials>;
    private createAWSUser;
    private createAzureUser;
    private createGCPUser;
    cleanupStudentResources(credentials: CloudUserCredentials): Promise<void>;
    private cleanupAWSResources;
    private cleanupAzureResources;
    private cleanupGCPResources;
    testCloudConnection(provider: string, credentials: any): Promise<{
        success: boolean;
        error?: string;
    }>;
    createCloudAccount(data: any): Promise<any>;
    updateCloudAccount(id: string, data: any): Promise<any>;
    deleteCloudAccount(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    getCloudAccounts(): Promise<{
        id: number;
        name: string;
    }[]>;
    removeCloudAllocation(id: string): Promise<void>;
    allocateCloudAccount(cloudAccountId: string, assessmentId?: string, batchId?: string): Promise<void>;
    getCloudAllocations(): Promise<any[]>;
}
export declare const cloudService: CloudService;
export declare const allocateCloudAccount: (cloudAccountId: string, assessmentId?: string, batchId?: string) => Promise<void>;
export declare const getCloudAllocations: () => Promise<any[]>;
//# sourceMappingURL=cloudService.d.ts.map