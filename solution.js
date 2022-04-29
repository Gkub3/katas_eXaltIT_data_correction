/**
 * Each endpoint holds some data, but someone made a mistake and shuffled it.
 * Thankfully, all users ids are still here !
 * You have to fix it ! For that, you have to make a backup of each endpoint locally (one json file per endpoint),
 * then compile them in one file, sanitize the data, store it locally and upload it on Krates.
 */

//Chargement des dépendances
const   https = require('https'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        { writeFile } = require ('fs/promises')

//Endpoints
const ENDPOINTS = {
    FIREBASE : {
        URL : 'https://recrutement-practice-default-rtdb.firebaseio.com/',
        APIS : {
            USERS : 'users.json',
            INFORMATIONS : 'informations.json',
            JOBS : 'jobs.json',
        }
    },
    KRATES : {
        URL : 'https://krat.es/',
        NAME : 'users',
        ID : '649114553aee159b6fd4',
        API_KEY : '298ebd9f-d5a9-48fd-83fe-2cedf5acda98'        
    }
}
const FIREBASE_APIS = [ ENDPOINTS.FIREBASE.APIS.USERS, ENDPOINTS.FIREBASE.APIS.INFORMATIONS, ENDPOINTS.FIREBASE.APIS.JOBS ]

//Références local de stockage des fichiers JSON
const DIR_ENDPOINT = path.join(__dirname, 'data')
const FILE_RESULT = path.join(DIR_ENDPOINT,'data.json')

/**
 * Récupération des données JSON depuis le endpoint
 * 
 * @param {string} endpoint URL de l'API
 * @returns {Object} JSON Data
 */
const getDataFromEndPoint = (endpoint) => {
    return new Promise((resolve, reject) => {
        try {
            let urlInfo = url.parse(endpoint)
            let options = {
                host: urlInfo.hostname,
                port: urlInfo.port,
                path: urlInfo.path,
                method: "GET"
            }
            let req = https.request(options, (res) => {
                let msg = ''
                res.setEncoding('utf8')
                res.on('data', (chunk) => {
                    msg += chunk
                })
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(msg))
                    } catch (err) { reject(err.message || err) }
                })
            })
            req.on('error', (err) => {
                reject(err.message || err)
            })
            req.end()
        } catch (err) { reject(err.message || err) }
    })
}
/**
 * Récupération des données des différents endpoints
 * 
 * @returns {Array} Liste des données JSON
 */
const getData = () => {
    return new Promise((resolve, reject) => {
        try {
            let promises = new Array(FIREBASE_APIS.length)
            for (let i = 0, l = FIREBASE_APIS.length; i < l; i++) {
                promises[i] = getDataFromEndPoint(ENDPOINTS.FIREBASE.URL+FIREBASE_APIS[i])
            }
            Promise.all(promises).then((values) => {
                resolve(values)
            }).catch((err) => reject(err))
        } catch (err) { reject(err.message || err) }
    })
}
/**
 * Sauvegarde des données dans les fichiers sur le disque
 * 
 * @param {Array} datas Liste des données récupérées
 */
const saveLoadedData = (datas) => {
    return new Promise((resolve, reject) => {
        try {
            if(!datas || datas.length !== FIREBASE_APIS.length){return reject("Incorrect data format")}
            fs.mkdir(DIR_ENDPOINT, {recursive: true}, (err) => {
                try{ 
                    if (err) { return reject(err.message || err)}
                    let promises = new Array(FIREBASE_APIS.length)
                    for (let i = 0, l = FIREBASE_APIS.length; i < l; i++) {
                        promises[i] = writeFile(path.join(DIR_ENDPOINT,FIREBASE_APIS[i]), JSON.stringify(datas[i]))
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
 * Fusion des données en un seul objet JSON
 * 
 * @param {Array} datas Liste des données récupérées
 * @returns {Object} JSON Data
 */
const mergeData = (datas) => {
    /**
     * Extraction des ids 
     */
    function initializeData () {
        let data = {}
        for (let i = 0, l = datas.length; i < l; i++){
            for (const id in datas[i]){
                data[id] = {}
            }
        } 
        return data  
    }
    /**
     * Extraction d'une propriété
     */
    function getPropertyValue (id, propertyName, selectiveIndex=-1) {
        let value = selectiveIndex >= 0 && datas[selectiveIndex][id] && datas[selectiveIndex][id][propertyName] ? datas[selectiveIndex][id][propertyName] : null
        if (value && value !== '#ERROR') { return value }
        for (let i = 0, l = datas.length; i < l; i++) {
            if (i !== selectiveIndex){
                let value = datas[i][id] && datas[i][id][propertyName] ? datas[i][id][propertyName] : null
                if (value) { return value }
            }    
        }
        return null
    }
    return new Promise((resolve, reject) => {
        try {
            if(!datas){return reject("Incorrect data")}
            let data = initializeData();
            for (const id in data){
                //Extraction du nom et de l'âge
                let name = getPropertyValue(id, 'name', FIREBASE_APIS.indexOf(ENDPOINTS.FIREBASE.APIS.USERS))  
                if (name) { data[id]['name'] = name}
                let age = getPropertyValue(id, 'age', FIREBASE_APIS.indexOf(ENDPOINTS.FIREBASE.APIS.INFORMATIONS))  
                if (age) { data[id]['age'] = age}
                //Extraction des propriétés supplémentaires
                for (let i = 0, l = datas.length; i < l; i++) {
                    for (const id in datas[i]){
                        for (const property in  datas[i][id]){
                            if (property !== 'name' && property !== 'age' && !data[id][property]){
                                let value = getPropertyValue(id, property)
                                if (value) { data[id][property] = value}
                            }
                        }
                    }
                }
            }
            resolve(data)
        } catch (err) { reject(err.message || err) }
    })
}
/**
 * Mise en forme des données
 * 
 * @param {Object} data Données JSON avant traitement
 * @returns {Object} Données JSON après traitement
 */
const sanitizeData = (data) => {
    /**
     * Majuscule sur le première lettre de chaque mot séparé par "-"
     * 
     * @param {string} str Chaine à traiter
     * @returns {string} Chaine avec majuscule
     */
     function capitalizeName (str) {
        let capitalized = str.trim().toLowerCase().split('-')
        for (var i = 0; i < capitalized.length; i++) {
            capitalized[i] = capitalized[i].charAt(0).toUpperCase() + capitalized[i].slice(1);
        }
        return capitalized.join('-')
    }
    /**
     * Majuscule sur le première lettre du premier mot
     * 
     * @param {string} str Chaine à traiter
     * @returns {string} Chaine avec majuscule
     */
    function capitalizeCity (str) {
        let capitalized = str.trim().toLowerCase()
        return capitalized.charAt(0).toUpperCase() + capitalized.slice(1)
    }
    return new Promise((resolve, reject) => {
        try {
            let dataSanitized = data
            for (const id in dataSanitized){
                if (dataSanitized[id]['name']) { dataSanitized[id]['name'] = capitalizeName(dataSanitized[id]['name'].replaceAll('3','e').replaceAll('4','a').replaceAll('1','i').replaceAll('0','o')) }
                if (dataSanitized[id]['city']) { dataSanitized[id]['city'] = capitalizeCity(dataSanitized[id]['city']) }            
            }
            resolve(dataSanitized)
        } catch (err) { reject(err.message || err) }
    })   
}
/**
 * Sauvegarde des données utilisateurs dans un fichier
 * 
 * @param {Object} data Données JSON à sauvegarder
 */
 const saveUserDataInFile = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            fs.mkdir(path.dirname(FILE_RESULT), {recursive: true}, async (err) => {
                try{ 
                    if (err) { return reject(err.message || err)}
                    await writeFile(FILE_RESULT, JSON.stringify(data))
                    resolve()
                } catch (err) { reject(err.message || err) }
            })
        } catch (err) { reject(err.message || err) }
    })   
}
/**
 * Sauvegarde des données utilisateurs dans une base Krates
 * ATTENTION : les '_id' n'étant pas sauvegardé chaque POST crée de nouveaux records
 *
 * @param {Object} data Données JSON à sauvegarder
 */
 const saveUserDataInKrates = (data) => {
    return new Promise((resolve, reject) => {
        try {
            let dataToSend = []
            for (const id in data){
                let user = data[id]
                user['id'] = id
                dataToSend.push(user)
            }
            let urlInfo = url.parse(ENDPOINTS.KRATES.URL+[ENDPOINTS.KRATES.ID, ENDPOINTS.KRATES.NAME].join("/"))
            let options = {
                host    : urlInfo.hostname,
                port    : urlInfo.port,
                path    : urlInfo.path,
                method  : 'POST',
                headers : {
                  'Content-Type': 'application/json',
                  'x-api-key': ENDPOINTS.KRATES.API_KEY      
                }
              };
            let req = https.request(options, (res) => {
                let msg = ''
                res.setEncoding('utf8')
                res.on('data', (chunk) => {
                    msg += chunk
                })
                res.on('end', () => {
                    try { 
                        let result = JSON.parse(msg)
                        if (result.status === 'FAILED') {return reject(result.message)}
                        resolve(result)
                    } catch (err) { reject(err.message || err) }
                })
            })
            req.on('error', (err) => {
                reject(err.message || err)
            })
            req.write(JSON.stringify(dataToSend))
            req.end()         
        } catch (err) { reject(err.message || err) }
    })
}
/**
 * Chargement des données et mise en forme depuis les endpoints de démonstration
 * 
 * @param {boolean} saveInFile Flag pour indiquer si l'on souhaite sauvegarder les données sur le disque
 * @param {boolean} saveInKrates Flag pour indiquer si l'on souhaite sauvegarder les données dans la base Krates
 * @returns {Object} Données JSON des utilisateurs
 */
const getUserData = (saveInFile=false, saveInKrates=false) => {
    return new Promise(async (resolve, reject) => {
        try {
            let datas = await getData()
            let data = await mergeData(datas)
            let dataSanitized = await sanitizeData(data)
            if (saveInFile) { 
                await saveLoadedData(datas) 
                await saveUserDataInFile(dataSanitized)
            }
            if (saveInKrates) { 
                await saveUserDataInKrates(dataSanitized) //Retour non sauvegardé
            }
            resolve(dataSanitized)
        } catch (err) { reject(err.message || err) }
    })   
}
/**
 * Permet de détecter si le fichier à été exécuté directement
 */
if (require.main === module) {
    getUserData(true, true).then((data) => {
        console.log(data)
    }).catch((err) => console.error(err))
}

module.exports.getUserData = getUserData;
module.exports.FILE_RESULT = FILE_RESULT;