export interface GalleryItem {
  _id?: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  category: string;
  order?: number;
  isCover?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
