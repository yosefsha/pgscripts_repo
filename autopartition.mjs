import pg from 'pg';
import { database } from 'pg/lib/defaults';

// this script will connect to the database and create a customers partitioned table, with the fields id serial and name text by default it will create 50 partitions;
// the table will be partitioned by id, and the partitions will be created by range, each partition will have a range of 1000 ids, starting from 1 to 1000, 1001 to 2000, 2001 to 3000, and so on.
// the table will be created in the public schema, and the partitions will be created in the autopartition schema.
// the table will have a trigger that will redirect the inserts to the correct partition based on the id value.
// the table will have a trigger that will redirect the selects to the correct partition based on the id value.
// the table will have a trigger that will redirect the updates to the correct partition based on the id value.
// the table will have a trigger that will redirect the deletes to the correct partition based on the id value.
// the table will have a trigger that will redirect the inserts to the correct partition based on the id value.
// the table will have a trigger that will redirect the inserts to the correct partition based on the id value.
// the table will have a trigger that will redirect the inserts to the correct partition based on the id value.
// the table will have a trigger that will redirect the inserts to the correct partition based on the id value.

const partitions = 50;
const partitionSize = 1000;
const partitionName = "customers";
const tableName = "customers";
const schemaName = "autopartition";
const idField = "id";
const nameField = "name";
const triggers = ["insert", "select", "update", "delete"];
const triggerEvents = ["before", "after"];
const triggerOperations = ["insert", "update", "delete"];
const triggerTiming = ["row", "statement"];
const triggerLevel = ["row", "statement"];
const triggerLanguage = "plpgsql";
const triggerFunction = "trigger_partition";
const triggerFunctionBody = `
BEGIN
    IF (TG_OP = 'INSERT') THEN
        EXECUTE format('INSERT INTO %I.%I VALUES ($1.*)', TG_TABLE_SCHEMA, TG_TABLE_NAME) USING NEW;
        RETURN NULL;
    ELSIF (TG_OP = 'SELECT') THEN
        EXECUTE format('SELECT * FROM %I.%I WHERE %I = $1.%I', TG_TABLE_SCHEMA, TG_TABLE_NAME, idField, idField) USING NEW;
        RETURN NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        EXECUTE format('UPDATE %I.%I SET $1.* WHERE %I = $1.%I', TG_TABLE_SCHEMA, TG_TABLE_NAME, idField, idField) USING NEW;
        RETURN NULL;
    ELSIF (TG_OP = 'DELETE') THEN
        EXECUTE format('DELETE FROM %I.%I WHERE %I = $1.%I', TG_TABLE_SCHEMA, TG_TABLE_NAME, idField, idField) USING NEW;
        RETURN NULL;
    END IF;
END;
`;


const host = "Yosefs-MacBook-Air.local"
const password = "123456"
const port = 5555;
const database = "customers";

async function run() {
    try {
    console.log("creating Client...with host: ", host)
    const dbClientPostgres = new pg.Client({
        user: "postgres",
        password: password,
        host: "localhost",
        port: port,
        database: "postgres",
        query_timeout: 5000, // Timeout for queries in milliseconds
        connectionTimeoutMillis: 5000, // Timeout for the connection
      });
    console.log ("connecting to postgres...")
    await dbClientPostgres.connect();
    console.log ("dropping database customers...")
    // await dbClientPostgres.query("drop database customers")
    console.log ("creating database customers...")

    await dbClientPostgres.query(`create database ${database}`)
    console.log ("db customers created")

    ///
    const dbClientCustomers = new pg.Client({
        "user": "postgres",
        "password" : password,
        "host" : "localhost",
        "port" : port,
        "database" : "customers"
    })

    console.log ("connecting to customers db...")
    await dbClientCustomers.connect();
    console.log("creating customers table...")
    const sql = `create table customers (id serial, name text) 
                 partition by range (id)`
    await dbClientCustomers.query(sql)
    console.log("creating partitions... ")
    /*
    assume we are going to support 1B customers
    and each partition will have 10M customers 
    that gives 1000/10 -> 100 partition tables 
    */
   for (let i =0; i < 100; i ++)
    {   
        const idFrom = i*10000000;
        const idTo = (i+1)*10000000  ;
        const partitionName = `customers_${idFrom}_${idTo}`
        const psql1  = `create table ${partitionName}
                         (like customers including indexes)`;

        const psql2  = `alter table customers
            attach partition ${partitionName}
            for values from (${idFrom}) to (${idTo})
         `;

       console.log(`creating partition ${partitionName} `)
       await dbClientCustomers.query(psql1);
       await dbClientCustomers.query(psql2);
    }

    
    console.log("closing connection")
    await dbClientCustomers.end();
    await dbClientPostgres.end();
    console.log("done.")
}
    catch (e) {
        console.log(e)
    }
    
}

run();