const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const client = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());

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