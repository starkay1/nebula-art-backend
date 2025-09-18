export interface ImageDimensions {
    width: number;
    height: number;
}
export interface ProcessedImageUrls {
    original: string;
    medium: string;
    thumbnail: string;
}
export declare class ImageUtils {
    private uploadPath;
    private allowedMimeTypes;
    private maxFileSize;
    constructor();
    processArtworkImage(imageData: string): Promise<ProcessedImageUrls>;
    getImageDimensions(imageUrl: string): Promise<ImageDimensions | null>;
    deleteImage(imageUrl: string): Promise<void>;
    private decodeImageData;
    private validateImage;
    private processOriginalImage;
    private processMediumImage;
    private processThumbnailImage;
    private ensureUploadDirectory;
    generateResponsiveUrls(baseUrl: string): {
        [key: string]: string;
    };
    convertToWebP(buffer: Buffer, quality?: number): Promise<Buffer>;
    extractDominantColors(buffer: Buffer, count?: number): Promise<string[]>;
}
//# sourceMappingURL=image.utils.d.ts.map