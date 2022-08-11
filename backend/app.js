require('dotenv').config(); //Chargment des variables d'environnement
const express = require('express');
const path = require('path'); //pour l'accès au chemin de notre système de fichier
const rateLimit = require('express-rate-limit')//limite des requêtes par IP
const helmet = require('helmet');//définit divers en têtes HTTP sécurisées
const mongoSanitize = require('express-mongo-sanitize');//protège des attaques par injection NoSQL
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userROutes = require('../backend/routes/user');
const sauceRoutes = require('../backend/routes/sauce');

//100 requêtes toutes les 15 min par IP
const apiLimiter = rateLimit({
  windowMs: 15*60*1000, // 15 minutes 
  max: 100
});

//Ajoute de la base de données avec mongoose
mongoose.connect('mongodb+srv://ndohvich:171191Yannickndohjules@cluster0.zxie4.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use('/api', apiLimiter);

app.use(helmet());

//me sert de controler les fichiers en tete
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(mongoSanitize());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userROutes); 
app.use('/api/sauces', sauceRoutes);

module.exports = app;