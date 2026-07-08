import { Readable } from 'stream';
import { describe, expect, it } from 'vitest';
import { streamToBase64 } from './process-upload-file';

describe('streamToBase64', () => {
  it('resolves with the base64 encoding of the stream content', async () => {
    const stream = Readable.from([Buffer.from('fake-image-bytes')]);

    const result = await streamToBase64(stream);

    expect(result).toBe(Buffer.from('fake-image-bytes').toString('base64'));
  });

  it('concatenates multiple chunks before encoding', async () => {
    const stream = Readable.from([Buffer.from('foo'), Buffer.from('bar')]);

    const result = await streamToBase64(stream);

    expect(result).toBe(Buffer.from('foobar').toString('base64'));
  });

  it('rejects when the stream emits an error', async () => {
    const stream = new Readable({
      read() {
        this.emit('error', new Error('stream broke'));
      },
    });

    await expect(streamToBase64(stream)).rejects.toThrow('stream broke');
  });
});
