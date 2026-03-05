export interface ExistingFile {
  file_name: string;
  id: string;
}

export type NewFile = File & {
  preview: string;
  id: string;
};

export const docIsExistingFile = (value: unknown): value is ExistingFile => {
  return typeof value === 'object' && value !== null && 'file_name' in value;
};

export const fileListCheck = (file: unknown) =>
  file && (file as FileList).length > 0;

export const optionalFileListCheck = (file: unknown) =>
  !file || (file as FileList).length === 0 || (file as FileList).length > 0;

export const isFile = (file: unknown): file is File => file instanceof File;

export type FormImagesValues = Array<File | ExistingFile>;
export const splitExistingAndNewImages = (
  images: FormImagesValues
): [string[], File[]] =>
  images.reduce(
    ([existing, newImages], image) => {
      if (isFile(image)) {
        // Don't pass the big base64 encoded image to the server
        delete (image as File & { preview?: string }).preview;
        return [existing, newImages.concat(image)];
      } else {
        return [existing.concat(image.id), newImages];
      }
    },
    [[] as string[], [] as File[]]
  );
