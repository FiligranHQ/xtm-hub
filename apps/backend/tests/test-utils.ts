import { v4 as uuidv4 } from 'uuid';

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

    this.subscription = await Promise.resolve(
      resolver.subscribe?.(null, args, context, info)
    );
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

export async function createUser({
  knex,
  email,
  userId = uuidv4(),
  first_name = 'John',
  last_name = 'Doe',
  professional_organization_id = 'ba091095-418f-4b4f-b150-6c9295e232c4',
  pending = false,
}: {
  knex: (table: string) => any;
  email: string;
  userId?: string;
  first_name?: string;
  last_name?: string;
  professional_organization_id?: string;
  pending?: boolean;
}) {
  // Fixed salt and password (same for all users)
  const salt = 'fabc28ed1339f8b34c10bc3b5a650c01';
  const password =
    'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e';
  try {
    // Check if user already exists
    const existingUser = await knex('User')
      .where({ email })
      .orWhere({ id: userId })
      .first();

    if (existingUser) {
      return {
        userId: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
      };
    }

    // Insert Personal Organization
    await knex('Organization')
      .insert({
        id: userId,
        name: email,
        personal_space: true,
      })
      .onConflict('id')
      .ignore();

    // Insert User
    await knex('User')
      .insert({
        id: userId,
        email,
        salt,
        password,
        first_name,
        last_name,
        selected_organization_id: pending
          ? userId
          : professional_organization_id,
      })
      .onConflict('id')
      .ignore();

    await knex('User_Organization').insert([
      ...(!pending
        ? [
            {
              user_id: userId,
              organization_id: professional_organization_id,
            },
          ]
        : []),
      {
        user_id: userId,
        organization_id: userId,
      },
    ]);

    if (pending) {
      await knex('User_Organization_Pending').insert([
        {
          user_id: userId,
          organization_id: professional_organization_id,
        },
      ]);
    }

    return {
      userId,
      email,
      first_name,
      last_name,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
