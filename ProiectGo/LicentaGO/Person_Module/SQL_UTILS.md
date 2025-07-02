## Cheatsheet for Azure SQL

### Delete all the tables from DB

```
-- Step 1: Drop all foreign key constraints in the XXPerson schema

DECLARE @sql NVARCHAR(MAX) = N'';

-- Generate DROP CONSTRAINT statements for all foreign keys in the XXPerson schema
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(fk.parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(fk.parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';' + CHAR(13)
FROM sys.foreign_keys AS fk
WHERE OBJECT_SCHEMA_NAME(fk.parent_object_id) = 'XXPerson';

-- Execute the generated DROP CONSTRAINT statements
EXEC sp_executesql @sql;

-- Step 2: Drop all tables in the XXPerson schema

SET @sql = N'';

-- Generate DROP TABLE statements for all tables in the XXPerson schema
SELECT @sql += 'DROP TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(t.object_id)) + '.' + QUOTENAME(t.name) + ';' + CHAR(13)
FROM sys.tables AS t
WHERE OBJECT_SCHEMA_NAME(t.object_id) = 'XXPerson';

-- Execute the generated DROP TABLE statements
EXEC sp_executesql @sql;
```

