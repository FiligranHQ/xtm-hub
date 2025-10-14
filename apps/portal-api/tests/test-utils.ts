export class SubscriptionSpy {
  events: any[] = [];
  private subscription: AsyncIterable<any> | null = null;
  private iterator: AsyncIterator<any> | null = null;

  async spy(resolver: any, args = {}, context = {}, fields?: string[]) {
    this.events = [];

    const info = fields
      ? {
          fieldNodes: [
            {
              selectionSet: {
                selections: fields.map((f) => ({
                  kind: 'Field',
                  name: { value: f },
                })),
              },
            },
          ],
        }
      : {};

    this.subscription = resolver.subscribe?.(null, args, context, info);
    if (!this.subscription?.[Symbol.asyncIterator]) {
      throw new Error('Resolver did not return a valid subscription');
    }

    this.iterator = this.subscription[Symbol.asyncIterator]();

    (async () => {
      try {
        for await (const value of this.subscription!) {
          this.events.push(resolver.resolve?.(value) || value);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }

  async waitForEvents(count: number, timeout = 3000) {
    const start = Date.now();
    while (this.events.length < count) {
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout: ${this.events.length}/${count} events`);
      }
      await new Promise((r) => setTimeout(r, 10));
    }
    return this.events.slice(0, count);
  }

  async expectNoEvents(waitTime = 100) {
    await new Promise((r) => setTimeout(r, waitTime));
    if (this.events.length > 0) {
      throw new Error(`Expected no events but got ${this.events.length}`);
    }
  }

  async cleanup() {
    if (this.iterator) {
      await this.iterator.return?.();
      this.iterator = null;
      this.subscription = null;
    }
  }
}
