const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const PROTO_PATH = './todo.proto';

const serverCert = fs.readFileSync(`./certs/server.crt`);

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;
	
const credit = grpc.credentials.createSsl(serverCert);

const client = new todoProto.TodoService('localhost:50051', credit);

// Ajouter un produit
client.AddProduct({ name: 'Laptop', description: 'A powerful laptop', price: 1200 }, (err, response) => {
  if (err) console.error(err);
  else console.log(response.message);

  // Lister les produits
  client.ListProducts({}, (err, response) => {
    if (err) console.error(err);
    else console.log('Products:', response.products);
  });
});

// Récupérer un produit par ID
client.getProduct({ id: 'INVALID_ID' }, (err, product) => {
  if (err) {
    if (err.code === grpc.status.INVALID_ARGUMENT) {
      console.error('Error: Invalid ID format');
    } else if (err.code === grpc.status.NOT_FOUND) {
      console.error('Error: Product not found');
    } else {
      console.error('Error:', err.message);
    }
  } else {
    console.log('Product:', product);
  }
});