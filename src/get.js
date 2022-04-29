//Chargement des dépendances
import https from 'https'
import url from 'url'
/**
 * Récupération des données JSON depuis le endpoint
 * 
 * @param {string} endpoint URL de l'API
 * @returns {Object} JSON Data
 */
 const getDataFromEndPoint = (endpoint) => {
    return new Promise((resolve, reject) => {
        try {
            const urlInfo = url.parse(endpoint)
            const options = {
                host: urlInfo.hostname,
                port: urlInfo.port,
                path: urlInfo.path,
                method: "GET"
            }
            const req = https.request(options, (res) => {
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
 * @param {Object} config Objet JSON de la configuration Firebase
 * @returns {Array} Liste des données JSON
 */
export default function get (config) {
    return new Promise((resolve, reject) => {
        try {
            let promises = new Array()
            for (const api in config.APIS) {
                promises.push(getDataFromEndPoint(config.URL+config.APIS[api]))
            }
            Promise.all(promises).then((values) => {
                resolve(values)
            }).catch((err) => reject(err))
        } catch (err) { reject(err.message || err) }
    })
}