const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

//const uri = "mongodb+srv://<usuario>:<password>@tu-cluster.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://kevingalarza:sofka@cluster0.g74ckfa.mongodb.net/";
const client = new MongoClient(uri);

let db, catalogoCollection;

async function conectarDB() {
    try {
        await client.connect();
        db = client.db('e_commerce');
        catalogoCollection = db.collection('catalogo');
        console.log("🔥 Conectado exitosamente a MongoDB Atlas");
    } catch (e) {
        console.error("Error al conectar a la BD:", e);
    }
}
conectarDB();

// 1. READ: Obtener todos los productos de la base de datos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await catalogoCollection.find({}).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// 2. CREATE: Insertar un nuevo producto en MongoDB
app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = {
            sku: req.body.sku,
            nombre: req.body.nombre,
            precio: parseFloat(req.body.precio),
            especificaciones: req.body.especificaciones || { detalle: "Estándar" },
            etiquetas: req.body.etiquetas || [],
            reseñas: []
        };
        const resultado = await catalogoCollection.insertOne(nuevoProducto);
        res.json({ success: true, id: resultado.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Error al insertar el producto" });
    }
});

// 3. DELETE: Eliminar un producto por su _id de MongoDB
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await catalogoCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el documento" });
    }
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});