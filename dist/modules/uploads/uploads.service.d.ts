export declare const uploadsService: {
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        path: string;
        fileName: string;
        mimetype: string;
        size: number;
    }>;
};
//# sourceMappingURL=uploads.service.d.ts.map