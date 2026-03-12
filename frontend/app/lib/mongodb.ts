import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // En développement, utilisez une variable globale pour que la connexion
  // persiste entre les rechargements de l'API
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // En production, c'est préférable de créer une nouvelle connexion
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Exporter un module avec une promesse de client MongoDB
export default clientPromise
