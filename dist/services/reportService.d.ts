export declare class ReportService {
    generateAssessmentReport(assessmentId: number): Promise<any>;
    generateBatchReport(batchId: number): Promise<any>;
    exportReport(reportType: string, format: string): Promise<Buffer>;
    generateComprehensiveAssessmentReport(): Promise<any>;
    generateCloudUserStatistics(): Promise<any>;
    getCloudEvaluationReport(): Promise<{
        provider: string;
        passRate: number;
        avgScore: number;
        attempts: number;
    }[]>;
}
export declare const reportService: ReportService;
//# sourceMappingURL=reportService.d.ts.map