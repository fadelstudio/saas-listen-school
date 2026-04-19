export declare const bulkImportService: {
    /**
     * Importe des étudiants depuis un CSV.
     * Format CSV : email,firstName,lastName,matricule,classId
     * - schoolId : école de l'admin qui importe
     * - campusId : campus cible (doit appartenir à l'école)
     * Chaque étudiant est rattaché à la classe ET au campus via la relation N:M.
     */
    importStudents(schoolId: string, campusId: string, csvData: string): Promise<{
        success: number;
        errors: string[];
    }>;
    /**
     * Importe des professeurs depuis un CSV.
     * Format CSV : email,firstName,lastName
     * Note : le professeur n'a pas de schoolId direct ni campusId.
     * Il sera rattaché à l'école via ses assignations ClassModule (cf. /class-modules).
     * Un compte User avec role PROFESSOR est créé automatiquement avec le mot de passe par défaut.
     */
    importProfessors(schoolId: string, _campusId: string, csvData: string): Promise<{
        success: number;
        errors: string[];
    }>;
};
//# sourceMappingURL=bulk-import.service.d.ts.map