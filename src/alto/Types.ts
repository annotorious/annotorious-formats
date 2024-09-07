import type { ImageAnnotation } from '@annotorious/annotorious';

export interface Page {

  annotations: ImageAnnotation[];

  metadata: PageMetadata;

}

export interface PageMetadata {

  id?: string; 
  
  height?: number;

  width?: number;

  numLines: number;

  avgCharsPerLine: number;

  avgLineHeight: number;

  avgLineWidth: number;

  avgWordsPerLine: number;

  avgWordWidth: number;
  
}