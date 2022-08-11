////////// contient logique de routing pour sauce //////////

//importe Express
const express = require("express");

//créé un routeur Express
const router = express.Router();

//importations
const auth = require("../middleware/auth"); //importe le middelware de protection de route
const multer = require("../middleware/multer-config"); //middelware de gestion de fichier

//importe la logique métier de sauce
const sauceCtrl = require("../controllers/sauce");

//routes disponibles dans l'application avec leur nom de fonction (avec une sémantique qui permet de savoir ce qu'elles font)
router.get("/", auth, sauceCtrl.getAllSauces);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

//exporte le routeur Express
module.exports = router;