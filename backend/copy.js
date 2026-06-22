require("dotenv").config();
const { Client } = require("pg");

const sourceUri = process.env.SOURCE_URI;
const targetUri = process.env.TARGET_URI;

async function copyDatabase() {
    // Initialize PostgreSQL clients
    const sourceClient = new Client({ connectionString: sourceUri });
    const targetClient = new Client({ connectionString: targetUri });

    try {
        await sourceClient.connect();
        await targetClient.connect();

        console.log("Connected to both PostgreSQL databases successfully.");

        // 1. Fetch all custom base tables in the 'public' schema
        const tablesResult = await sourceClient.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        `);

        const tables = tablesResult.rows.map(row => row.table_name);

        if (tables.length === 0) {
            console.log("No tables discovered in the source database.");
            return;
        }

        // 2. Iterate through discovered tables and migrate records
        for (const tableName of tables) {
            console.log(`\nProcessing table: "${tableName}"`);

            // Fetch all records from the source table
            const sourceData = await sourceClient.query(`SELECT * FROM "${tableName}"`);
            const rows = sourceData.rows;
            const fields = sourceData.fields.map(f => f.name);

            console.log(`Found ${rows.length} rows in source table.`);

            if (rows.length > 0) {
                // Clear the target table. 
                // CASCADE automatically bypasses foreign-key locking orders safely.
                await targetClient.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);

                // Formulate target column mappings safely wrapped in quotes
                const columns = fields.map(f => `"${f}"`).join(', ');

                // 🚀 SQL OPTIMIZATION: Chunk records to avoid Postgres parameter limits (max 65,535 parameters)
                const maxParameters = 60000;
                const chunkSize = Math.floor(maxParameters / fields.length) || 1;

                for (let i = 0; i < rows.length; i += chunkSize) {
                    const chunk = rows.slice(i, i + chunkSize);
                    const valueLines = [];
                    const queryValues = [];
                    let paramIndex = 1;

                    // Build parameter placeholders dynamically ($1, $2, $3...)
                    for (const row of chunk) {
                        const placeholders = [];
                        for (const field of fields) {
                            placeholders.push(`$${paramIndex++}`);
                            queryValues.push(row[field]);
                        }
                        valueLines.push(`(${placeholders.join(', ')})`);
                    }

                    const batchInsertQuery = `
                        INSERT INTO "${tableName}" (${columns}) 
                        VALUES ${valueLines.join(', ')};
                    `;

                    await targetClient.query(batchInsertQuery, queryValues);
                }

                console.log(`Copied ${rows.length} rows into target table successfully.`);
            } else {
                console.log(`"${tableName}" is empty. Skipping rows copy...`);
            }
        }

        console.log("\nDatabase migration completed successfully.");

    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        // Safe database lifecycle termination cleanup
        await sourceClient.end();
        await targetClient.end();
        console.log("Database connections closed.");
    }
}

copyDatabase();