

## How to create a ES DB migration

- Run `yarn esmigrate:make my_modif_name`. It will create a migration file in the src/thirdparty/elasticsearch/migrations.
- Fill up and down functions in the file. Don't remove the `next()` call at the end of each function! (otherwise next migration file will not be processed)
- On you first launch of portal-api, it will update the DB. It will insert a new entry in the ES `migrations` table.

If you want to manually upgrade/downgrade elastic search:
- run `yarn esmigrate:up` to run all migration files
- run `yarn esmigrate:down` to remove the last migration (it will remove only this one)
