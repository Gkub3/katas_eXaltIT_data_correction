//Chargement des dépendances
import https from 'https'
import url from 'url'
/**
 * Sauvegarde des données utilisateurs dans une base Krates
 * ATTENTION : les '_id' n'étant pas sauvegardé chaque POST crée de nouveaux records
 *
 * @param {Object} config Objet JSON de la configuration Krates
 * @param {Object} data Données JSON à sauvegarder
 * @returns {Object} Données JSON Krates
 */
 export default function saveDataInKrates(config, data) {
    return new Promise((resolve, reject) => {
        try {
            let dataToSend = []
            for (const id in data){
                let user = data[id]
                user['id'] = id
                dataToSend.push(user)
            }
            const urlInfo = url.parse(config.URL+[config.ID, config.NAME].join("/")); 
            const options = {
                host    : urlInfo.hostname,
                port    : urlInfo.port,
                path    : urlInfo.path,
                method  : 'POST',
                headers : {
                  'Content-Type': 'application/json',
                  'x-api-key': config.API_KEY      
                }
              };
              const req = https.request(options, (res) => {
                let msg = ''
                res.setEncoding('utf8')
                res.on('data', (chunk) => {
                    msg += chunk
                })
                res.on('end', () => {
                    try { 
                        const result = JSON.parse(msg)
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