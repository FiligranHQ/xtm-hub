import "knex";
declare module "knex" {
    namespace Knex {
        interface QueryBuilder {
            asConnection <T>(): Promise<T>;
        }
    }
}