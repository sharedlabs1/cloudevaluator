export declare class BatchService {
    createBatch(data: any): Promise<any>;
    addStudentsToBatch(batchId: string, studentIds: string[]): Promise<{
        batchId: string;
        added: string[];
    }>;
    removeStudentFromBatch(batchId: string, studentId: string): Promise<{
        batchId: string;
        removed: string;
    }>;
    getBatchDetails(batchId: string): Promise<{
        batchId: string;
        name: string;
    }>;
}
//# sourceMappingURL=batchService.d.ts.map