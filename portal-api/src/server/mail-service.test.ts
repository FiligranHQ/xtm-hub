import { describe, expect, it } from 'vitest';
import { renderEmail } from './mail-service';

describe('sendMail service', () => {
  it('shound render email', async () => {
    const html = await renderEmail({
      name: 'Jean-Philippe',
      project: 'XTM Hub',
      text: 'test',
    });
    // The test is simple but it test that fspromise
    // can get the html template and that we copy in the docker ilmage
    expect(html).toBeTruthy();
  });
});
