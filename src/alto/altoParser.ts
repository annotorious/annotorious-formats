import { v4 as uuidv4 } from 'uuid';
import { ShapeType, type ImageAnnotation } from '@annotorious/annotorious';
import type { RectangleGeometry } from '@annotorious/annotorious';
import type { Page } from './Types';

const parseTextLine = (
  t: Element
) => {
  const annotations: ImageAnnotation[] = [];

  // Record line width
  let lineMinX = Infinity;
  let lineMaxX = 0;
  
  // Count characters and Strings (=words, roughly speaking)
  let numChars = 0;
  let numStrings = 0;

  // Sum up the individual word heights, so we can 
  // compute average line height in the end
  let stringHeightSum = 0;

  // Same for word width
  let stringWidthSum = 0;

  const strings = t.querySelectorAll('String');

  for (const str of strings) {
    // Example: <String ID="S3" CONTENT="a." HPOS="1979" VPOS="228" WIDTH="84" HEIGHT="92" STYLEREFS="TS1" WC="0.1"/>
    const id = str.getAttribute('ID') || uuidv4();
    const content = str.getAttribute('CONTENT');
    const minX = parseFloat(str.getAttribute('HPOS'));
    const minY = parseFloat(str.getAttribute('VPOS'));
    const w = parseFloat(str.getAttribute('WIDTH'));
    const h = parseFloat(str.getAttribute('HEIGHT'));

    const maxX = minX + w;
    const maxY = minY + h;

    if (minX < lineMinX)
      lineMinX = minX;

    if (maxX > lineMaxX)
      lineMaxX = maxX;

    numChars += content.length;
    numStrings += 1;

    stringHeightSum += h;
    stringWidthSum += w;

    annotations.push({
      id,
      bodies: [{
        id,
        annotation: id,
        purpose: 'transcribing',
        value: content
      }],
      target: {
        annotation: id,
        selector: {
          type: ShapeType.RECTANGLE,
          geometry: {
            bounds: { minX, minY, maxX, maxY },
            x: minX,
            y: minY,
            w, 
            h
          } as RectangleGeometry
        }
      }
    })
  }

  return { 
    annotations, 
    avgWordHeight: stringHeightSum / strings.length,
    avgWordWidth: stringWidthSum / strings.length,
    lineWidth: lineMaxX - lineMinX,
    numWords: numStrings,
    numChars
  };
}

export const parseALTO = (xmlText: string): Page => {
  const annotations = [];

  const parser = new DOMParser();

  const doc = parser.parseFromString(xmlText, 'application/xml');

  const page = doc.querySelector('Page');

  const textLines = doc.querySelectorAll('TextLine');

  // Sum up average word width and height, so we can compute
  // global averages across the page in the end
  let wordHeightSum = 0;
  let wordWidthSum = 0;

  // Same for line width...
  let lineWidthSum = 0;

  // ...and number of words and characters per line
  let numWordsSum = 0;
  let numCharsSum = 0;

  for (const line of textLines) {
    const { 
      annotations: lineAnnotations, 
      avgWordHeight,
      avgWordWidth,
      lineWidth,
      numWords,
      numChars
    } = parseTextLine(line);

    wordHeightSum += avgWordHeight;
    wordWidthSum += avgWordWidth;

    lineWidthSum += lineWidth;

    numWordsSum += numWords;
    numCharsSum += numChars;

    annotations.push(...lineAnnotations);
  }

  const id = page.getAttribute('ID');
  const height = parseFloat(page.getAttribute('HEIGHT'));
  const width = parseFloat(page.getAttribute('WIDTH')); 
  const numLines = textLines.length;

  const { length } = textLines;

  const avgLineHeight = wordHeightSum / length;
  const avgLineWidth = lineWidthSum / length;
  const avgWordWidth = wordWidthSum / length;

  const avgWordsPerLine = numWordsSum / length;
  const avgCharsPerLine = numCharsSum / length;

  return {
    annotations, 
    metadata: { 
      id, 
      height,
      width, 
      avgLineHeight,
      avgLineWidth,
      avgWordWidth,
      avgWordsPerLine,
      avgCharsPerLine,
      numLines
    }
  };
}