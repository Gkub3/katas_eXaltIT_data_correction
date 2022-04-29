//Chargement des dépendances
import path from 'path'
import fs from 'fs'
import { writeFile } from 'fs/promises'
/**
 * Sauvegarde des données reçues dans les fichiers
 * 
 * @param {Array} APIS Liste des APIs
 * @param {string} folder Dossier de destination
 * @param {Array} datas Liste des données JSON avant traitement
 */
 export function saveLoadedData (APIS, folder, datas) {
    return new Promise((resolve, reject) => {
        try {
            if(!datas || datas.length !== APIS.length){return reject("Incorrect data format")}
            fs.mkdir(folder, {recursive: true}, (err) => {
                try{ 
                    if (err) { return reject(err.message || err)}
                    let promises = new Array(APIS.length)
                    for (let i = 0, l = APIS.length; i < l; i++) {
                        promises[i] = writeFile(path.join(folder,APIS[i]), JSON.stringify(datas[i]))
                    }
                    Promise.all(promises).then(() => {
                        resolve()
                    }).catch((err) => {
                        reject(err)
                    })
                } catch (err) { reject(err.message || err) }
            })
        } catch (err) { reject(err.message || err) }
    })
}
/**
 * Sauvegarde des données utilisateurs dans un fichier
 * 
 * @param {string} file Fichier destination
 * @param {Object} data Données JSON à sauvegarder
 */
 export function saveData (file, data) {
    return new Promise(async (resolve, reject) => {
        try {
            fs.mkdir(path.dirname(file), {recursive: true}, async (err) => {
                try{ 
                    if (err) { return reject(err.message || err)}
                    await writeFile(file, JSON.stringify(data))
                    resolve()
                } catch (err) { reject(err.message || err) }
            })
        } catch (err) { reject(err.message || err) }
    })   
}
