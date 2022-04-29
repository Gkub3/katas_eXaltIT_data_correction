//Chargement des dépendances
import esMain from 'es-main';
import { readFile } from 'fs/promises'
import getData from './src/get.js'
import processData from './src/data-process.js'
import { saveLoadedData, saveData } from './src/save-file.js';
import saveDataInKrates from './src/krates.js';

//Chargement de la configuration
const configFirebase = JSON.parse(await readFile(new URL('./src/config/firebase-config.json', import.meta.url)));
const configKrates = JSON.parse(await readFile(new URL('./src/config/krates-config.json', import.meta.url)));
//Initialisation de la liste des APIS
let APIS = [];
for (const api in configFirebase.APIS) { APIS.push(configFirebase.APIS[api]) }
/**
 * Chargement des données et mise en forme depuis les endpoints de démonstration
 * 
 * @param {boolean} saveInFile Flag pour indiquer si l'on souhaite sauvegarder les données sur le disque
 * @param {boolean} saveInKrates Flag pour indiquer si l'on souhaite sauvegarder les données dans la base Krates
 * @returns {Object} Données JSON des utilisateurs
 */
 export default function getUserData (saveInFile=false, saveInKrates=false) {
    return new Promise(async (resolve, reject) => {
        try { 
            const datas = await getData(configFirebase)
            const data = await processData(APIS, datas)
            if (saveInFile) { 
                await saveLoadedData(APIS, './data/', datas) 
                await saveData('./data/data.json', data)
            }
            if (saveInKrates) { 
                await saveDataInKrates(configKrates, data) //Retour non sauvegardé
            }
            resolve(data)
        } catch (err) { reject(err.message || err) }
    })   
}
/**
 * Permet de détecter si le fichier à été exécuté directement
 */
if (esMain(import.meta)) {
    getUserData(true,true)
}