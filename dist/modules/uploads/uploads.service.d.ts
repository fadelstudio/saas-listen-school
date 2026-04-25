export declare const uploadsService: {
    uploadFile(file: Express.Multer.File, folder?: string, bucket?: string): Promise<{
        url: string;
        path: string;
        fileName: string;
        mimetype: string;
        size: number;
        bucket: string;
    }>;
    /** URL signée pour affichage (durée `SIGNED_URL_EXPIRES_IN`). */
    getSignedUrlForPath(path: string | null | undefined): Promise<string | null>;
    removeObjectAtPath(path: string): Promise<void>;
    /** Upload image profil (types restreints) — même bucket que `uploadFile`. */
    uploadProfileImage(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        path: string;
        fileName: string;
        mimetype: string;
        size: number;
        bucket: string;
    }>;
};
//# sourceMappingURL=uploads.service.d.ts.map