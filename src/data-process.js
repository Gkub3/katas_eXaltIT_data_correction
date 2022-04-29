/**
 * Fusion des données en un seul objet JSON
 * 
 * @param {Array} APIS Liste des APIs
 * @param {Array} datas Liste des données 
 * @returns {Object} JSON Data
 */
 const mergeData = (APIS, datas) => {
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
                value = datas[i][id] && datas[i][id][propertyName] ? datas[i][id][propertyName] : null
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
                const name = getPropertyValue(id, 'name', APIS.indexOf('users.json'))  
                if (name) { data[id]['name'] = name}
                const age = getPropertyValue(id, 'age', APIS.indexOf('informations.json'))  
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
        const capitalized = str.trim().toLowerCase()
        return capitalized.charAt(0).toUpperCase() + capitalized.slice(1)
    }
    /**
     * Remplace toutes les occurences dans la chaine de caractères
     * 
     * @param {string} str Chaine à traiter
     * @param {string} find Chaine à trouver
     * @param {string} replace Chaine de remplacement
     * @returns {string} Chaine traitée
     */
    function replaceAll(str, find, replace) {
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
        }
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }
    return new Promise((resolve, reject) => {
        try {
            for (const id in data){ 
                if (data[id]['name']) { data[id]['name'] = capitalizeName(replaceAll(replaceAll(replaceAll(replaceAll(data[id]['name'],'3','e'),'4','a'),'1','i'),'0','o')) }
                if (data[id]['city']) { data[id]['city'] = capitalizeCity(data[id]['city']) }            
            }
            resolve(data)
        } catch (err) { reject(err.message || err) }
    })   
}
/**
 * Traitement des données
 * 
 * @param {Array} APIS Liste des APIs
 * @param {Array} datas Liste des données JSON avant traitement
 * @returns {Object} Données JSON après traitement
 */
 export default function processData (APIS, datas) {
    return new Promise(async (resolve, reject) => {
        try {
            const dataMerged = await mergeData(APIS, datas)
            const dataSanitized = await sanitizeData(dataMerged)  
            resolve(dataSanitized)
        } catch (err) { reject(err.message || err) }
    })  
 }