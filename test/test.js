//Chargement des dépendances
const { getUserData, FILE_RESULT } = require('../solution'),
      assert = require('assert').strict,
      result = require('./results.json')

describe("Test de comparaison de la récupération de données avec le résultat attendu", function() {
  
  it("L'objet renvoyé par la fonction doit contenir les mêmes données que le fichier de résultat", async function() {
      let data = await getUserData()
      for (const id in result){
        assert.deepStrictEqual(result[id], data[id])
      }      
  })

  it("Le fichier fabriqué par la fonction doit contenir les mêmes données que le fichier de résultat", async function() {
      await getUserData(true)
      data = require(FILE_RESULT)
      for (const id in result){
        assert.deepStrictEqual(result[id], data[id])
      } 
  })
})