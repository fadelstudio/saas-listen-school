export declare const bulkImportService: {
    importStudents(schoolId: string, campusId: string, csvData: string): Promise<{
        success: number;
        errors: string[];
    }>;
    importProfessors(_schoolId: string, campusId: string, csvData: string): Promise<{
        success: number;
        errors: string[];
    }>;
};
//# sourceMappingURL=bulk-import.service.d.ts.map