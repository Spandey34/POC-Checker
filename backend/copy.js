require("dotenv").config();

const { MongoClient } = require("mongodb");

const sourceUri = process.env.SOURCE_URI;
const targetUri = process.env.TARGET_URI;

async function copyDatabase() {
    const sourceClient = new MongoClient(sourceUri);
    const targetClient = new MongoClient(targetUri);

    try {
        await sourceClient.connect();
        await targetClient.connect();

        console.log("Connected to MongoDB");

        const sourceDb = sourceClient.db();
        const targetDb = targetClient.db();

        const collections = await sourceDb.listCollections().toArray();

        //console.log("Collections found:", collections);

        if (collections.length === 0) {
            console.log("No collections found in source database");
            return;
        }

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;

            console.log(`Copying collection: ${collectionName}`);

            const sourceCollection = sourceDb.collection(collectionName);
            const targetCollection = targetDb.collection(collectionName);

            const documents = await sourceCollection.find({}).toArray();

            console.log(`Found ${documents.length} documents`);

            if (documents.length > 0) {

                await targetCollection.deleteMany({});
                await targetCollection.insertMany(documents);

                console.log(`Copied ${documents.length} documents`);
            } else {
                console.log(`${collectionName} is empty`);
            }
        }

        console.log("Database copy completed");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sourceClient.close();
        await targetClient.close();
    }
}

copyDatabase();