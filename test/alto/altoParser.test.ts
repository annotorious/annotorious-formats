import { promises as fs } from 'fs';
import { describe, it, expect } from 'vitest';
import { parseALTO } from '../../src/alto/altoParser';

// Shorthand
const load = (fileName: string) => fs.readFile(`${__dirname}/${fileName}`, 'utf8');

/**
 * @vitest-environment jsdom
 */
describe('altoParser', () => {

  it('should parse the test document correctly', async () => {
    const xml = await load('sample-alto.xml');
    const { annotations, metadata } = parseALTO(xml);

    expect(annotations.length).toBe(294);
    expect(metadata.width).toBe(2976);
    expect(metadata.height).toBe(3968);
    expect(metadata.id).toBe('PAGE3');
  });

});