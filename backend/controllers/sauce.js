// contient logique métier pour sauce //////////

//importations
const Sauce = require('../models/Sauce'); //importe le schéma de Sauce
const fs = require('fs'); //permet de modifier le système de fichiers


///// exporte les fonctions /////

//créée une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //récupère chq segment de l'URL de la localisation de l'image
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
};

// modifie une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? //opérateur terner qui teste si nouvelle image = 1er objet avec req.file, sinon = 2ème objet avec copie de req.body
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
};

// supprime une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //cherche la sauce dans la bdd
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; //extrait le nom du fichier à supprimer
      fs.unlink(`images/${filename}`, () => { //supprime un fichier
        Sauce.deleteOne({ _id: req.params.id }) //Supprime de la sauce dans la bdd
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// récupère une sauce spécifique
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //cherche le même id
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// récupère toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// gère like/dislike
// 3 conditions : la valeur de req.body.like est soit:
  // 0 = utilisateur annule son like ou dislike
  // 1 = l'utilisateur like
  // -1 = l'utilisateur dislike
exports.likeSauce = (req, res, _) => {
  switch (req.body.like) {
    case 0:  
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find( user => user === req.body.userId)) { // cherche si l'utilisateur est déjà dans le tableau usersLiked
            console.log(sauce.usersLiked)

            Sauce.updateOne({ _id: req.params.id }, { // si oui, met à jour la sauce avec le _id présent dans la requête
              $inc: { likes: -1 }, // décrémente la valeur des likes de 1 (soit -1)
              $pull: { usersLiked: req.body.userId } // retire l'utilisateur du tableau.
            })
              .then(() => { res.status(201).json({ message: "vote enregistré"}); })
              .catch((error) => { res.status(400).json({error}); });
          } 
          if (sauce.usersDisliked.find(user => user === req.body.userId)) { //idem mais pour usersDisliked
            Sauce.updateOne({ _id: req.params.id }, {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId }
            })
              .then(() => { res.status(201).json({ message: "vote enregistré" }); })
              .catch((error) => { res.status(400).json({error}); });
          }
        })
        .catch((error) => { res.status(404).json({error}); });
      break;
    
    case 1:                                                 
      Sauce.updateOne({ _id: req.params.id }, { // recherche la sauce avec le _id présent dans la requête
        $inc: { likes: 1 }, // incrémente de la valeur de likes par 1.
        $push: { usersLiked: req.body.userId } // ajoute l'utilisateur dans le array usersLiked.
      })
        .then(() => { res.status(201).json({ message: "vote enregistré" }); })
        .catch((error) => { res.status(400).json({ error }); });
      break;
    
    case -1:                                                  
      Sauce.updateOne({ _id: req.params.id }, { // recherche la sauce avec le _id présent dans la requête
        $inc: { dislikes: 1 }, // décremente de 1 la valeur de dislikes.
        $push: { usersDisliked: req.body.userId } // rajoute l'utilisateur à l'array usersDiliked.
      })
        .then(() => { res.status(201).json({ message: "vote enregistré" }); })
        .catch((error) => { res.status(400).json({ error }); });
      break;
    default:
      console.error("bad request");
  }
};