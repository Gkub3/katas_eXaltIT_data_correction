//Chargement des dépendances
import { strict as assert } from 'assert'
import { readFile } from 'fs/promises'

import getUserData from '../index.js'

const result = JSON.parse(await readFile(new URL('./results.json', import.meta.url)));

describe("Test de comparaison de la récupération de données avec le résultat attendu", function() {
  
  it("L'objet renvoyé par la fonction doit contenir les mêmes données que le fichier de résultat", async function() {
      let data = await getUserData()
      for (const id in result){
        assert.deepStrictEqual(result[id], data[id])
      }      
  })

  it("Le fichier fabriqué par la fonction doit contenir les mêmes données que le fichier de résultat", async function() {
      await getUserData(true)
      const data = JSON.parse(await readFile(new URL('../data/data.json', import.meta.url)));
      for (const id in result){
        assert.deepStrictEqual(result[id], data[id])
      } 
  })
})