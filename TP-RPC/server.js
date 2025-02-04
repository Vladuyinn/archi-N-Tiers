const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { MongoClient, ObjectId } = require('mongodb');

const PROTO_PATH = './todo.proto';
const MONGO_URL = 'mongodb://localhost:27017';
const DATABASE_NAME = 'grpc_example';
const COLLECTION_NAME = 'products';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Connectez-vous à MongoDB
let db;
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(DATABASE_NAME);
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Méthodes gRPC pour la gestion des produits
const addProduct = async (call, callback) => {
  const product = call.request;

  try {
    const result = await db.collection(COLLECTION_NAME).insertOne(product);
    callback(null, { message: `Product added with ID: ${result.insertedId}` });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: 'Failed to add product' });
  }
};

const updateProduct = async (call, callback) => {
  const { id, name, description, price } = call.request;

  try {
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, price } }
    );
    callback(null, { message: 'Product updated successfully' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: 'Failed to update product' });
  }
};

const deleteProduct = async (call, callback) => {
  const { id } = call.request;

  try {
    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    callback(null, { message: 'Product deleted successfully' });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: 'Failed to delete product' });
  }
};

const listProducts = async (call, callback) => {
  try {
    const products = await db.collection(COLLECTION_NAME).find().toArray();
    callback(null, { products });
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: 'Failed to fetch products' });
  }
};

// Configuration du serveur gRPC
const server = new grpc.Server();
server.addService(todoProto.TodoService.service, {
  addProduct,
  updateProduct,
  deleteProduct,
  listProducts,
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on http://0.0.0.0:50051');
  server.start();
});