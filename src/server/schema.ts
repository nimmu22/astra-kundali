import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';
// One aggregate counter. No wallet, birth, account, IP or device records.
export const siteViews=sqliteTable('site_views',{
 id:text('id').primaryKey(),
 total:integer('total').notNull().default(0),
});
