/**
 * Client with utility functions to retrieve/post data from/to the API/DB 
 */

const axios = require('axios');
const logger = require('./log.js')

class ApiClient {
    constructor(config) {
        this.base = config['base_url'];
    }

    async getData(path) {
        return axios.get(`${this.base}${path}`).then(res => res.data).catch(err => logger.error(err))
    }  

    async getDataAsMap(path) {
        return this.getData(path)
            .then(data => {
                const map = new Map();
                for (const key of Object.keys(data)) {
                    map.set(key, data[key]);
                }
                return map;
            });            
    }

    async postData(path, json) {
        return axios.post(`${this.base}${path}`, json)            
            .catch(err => logger.error(err));
    }

    async getCatFacts() {
        return this.getData(`cats/facts`)
            .catch(err => logger.error('Failed retrieving catfacts: ', err));
    }

    async getCustomPrefixes() {
        return this.getData(`db/server/server_prefixes`)
              .catch(err => logger.error('Failed retrieving custom prefixes: ', err));
    }

    async updateCustomPrefixes(prefixes) {
      return this.postData(`db/server/server_prefixes`, prefixes)
            .catch(err => logger.error('Failed updating custom prefixes: ', err));
    }

    async getIgnoredChannels() {
        return this.getData(`db/server/ignored_channels`)
            .catch(err => logger.error('Failed retrieving ignored channels: ', err));
    }

    async updateIgnoredChannels(channels) {
        return this.postData(`db/server/ignored_channels`, channels)
            .catch(err => logger.error('Failed updating ignored channels: ', err));
    }

    async getDisabledCommands() {
        return this.getData(`db/server/disabled_commands`)
            .catch(err => logger.error('Failed retrieving disabled commands: ', err));
    }

    async updateDisabledCommands(disabled) {
        return this.postData(`db/server/disabled_commands`, disabled)
            .catch(err => logger.error('Failed updating disabled commands: ', err));
    }
    
    async getMhwArmors() {
        return this.getDataAsMap(`mhw/armors`)
            .then(map => {
                let finalMap = {};
                for (const [k, v] of map) {
                    const armor = map.get(k);
              
                    let setBonus = [];
                    let pieces = [];
                    let skills = [];
                    let slots = [];
              
                    for (const i in armor.setBonus) {
                      if (armor.setBonus[i] == '-') {
                        setBonus.push('-');
                      } else {
                        setBonus.push(
                          `${armor.setBonus[i].name}: ${armor.setBonus[i].description} (${armor.setBonus[i].pieces} pieces)`
                        );
                      }
                    }
              
                    for (const i in armor.pieces) {
                      pieces.push(`${armor.pieces[i].name} (${armor.pieces[i].type})`);
                    }
              
                    for (const i in armor.skills) {
                      skills.push(
                        `${armor.skills[i].name} LV${armor.skills[i].rank} (${armor.skills[i].piece})`
                      );
                    }
              
                    for (const i in armor.slots) {
                      if (armor.slots[i] == '-') {
                        slots.push('-');
                      } else {
                        slots.push(
                          `${armor.slots[i].name}: Slot LV${armor.slots[i].rank}`
                        );
                      }
                    }
              
                    finalMap[k] = {
                      name: armor.name,
                      setBonus: setBonus,
                      defenses: `Base: ${armor.defenses.base}\nMax: ${armor.defenses.max}\nAugmented: ${armor.defenses.augmented}`,
                      resistances: `🔥 ${armor.resistances.fire}\n💧 ${armor.resistances.water}\n⚡ ${armor.resistances.thunder}\n❄ ${armor.resistances.ice}\n🐉 ${armor.resistances.dragon}`,
                      pieces: pieces,

                      skills: skills,
                      slots: slots
                    };
                  }
              
                  return finalMap;
            })       
            .catch(err => logger.error('Failed retrieving mhw armors: ', err));
    }

    async getMhwDecorations() {
        return this.getDataAsMap(`mhw/decorations`)
            .then(map => {
                let finalMap = {};
                for (const [k, v] of map) {
                    const deco = map.get(k);
              
                    let skills = [];
                    for (const i in deco.skills) {
                      skills.push(
                        `${deco.skills[i].name}: ${deco.skills[i].description} LV${deco.skills[i].level}`
                      );
                    }
              
                    finalMap[k] = {
                      name: deco.name,
                      rarity: deco.rarity,
                      slot: deco.slot,
                      skills: skills
                    };
                  }
              
                  return finalMap;
            })    
            .catch(err => logger.error('Failed retrieving mhw decorations: ', err));
    }

    async getMhwItems() {
        return this.getDataAsMap(`mhw/items`)            
            .catch(err => logger.error('Failed retrieving mhw items: ', err));        
    }

    async getMhwMonsters() {
        return this.getDataAsMap(`mhw/monsters`)          
            .catch(err => logger.error('Failed retrieving mhw monsters: ', err));
    }

    async getMhwSkills() {
        return this.getDataAsMap(`mhw/skills`)
            .then(map => {
                let finalMap = {};
                
                for (const [k, v] of map) {
                    const skill = map.get(k);

                    let ranks = [];
                    for (const i in skill.ranks) {
                        ranks.push(
                            `LV${skill.ranks[i].level}: ${skill.ranks[i].description}`
                        );
                    }

                    finalMap[k] = {
                        name: skill.name,
                        description: skill.description,
                        ranks: ranks
                    };
                }

                return finalMap;
            })       
            .catch(err => logger.error('Failed retrieving mhw skills: ', err));
    }

    async getMhwWeapons() {
        return this.getDataAsMap(`mhw/weapons`)
            .then(map => {
                let finalMap = {};
                for (const [k, v] of map) {
                    const weapon = map.get(k);
              
                    let shelling = `-`;
                    let sharpness = `-`;
                    let ammos = [];
                    let elements = [];
                    let slots = [];
                    let crafting = [];
                    let upgrading = [];
              
                    if (weapon.shelling.type != null && weapon.shelling.level != null) {
                      shelling = `${weapon.shelling.type} LV${weapon.shelling.level}`;
                    }
              
                    if (weapon.ammos != `-`) {
                      for (const i in weapon.ammos) {
                        ammos.push(
                          `${weapon.ammos[i].type}\nLV1: ${weapon.ammos[i].lv1}\nLV2: ${weapon.ammos[i].lv2}\nLV3: ${weapon.ammos[i].lv3}`
                        );
                      }
                    } else {
                      ammos = `-`;
                    }
              
                    if (weapon.elements != `-`) {
                      for (const i in weapon.elements) {
                        elements.push(
                          `${weapon.elements[i].type}: ${weapon.elements[i].damage} damage`
                        );
                      }
                    } else {
                      elements = `-`;
                    }
              
                    if (weapon.slots != `-`) {
                      for (const i in weapon.slots) {
                        slots.push(`Rank: ${weapon.slots[i].rank}`);
                      }
                    } else {
                      slots = `-`;
                    }
              
                    if (weapon.crafting != `-`) {
                      for (const i in weapon.crafting) {
                        crafting.push(
                          `${weapon.crafting[i].name} (x${weapon.crafting[i].quantity})`
                        );
                      }
                    } else {
                      crafting = `-`;
                    }
              
                    if (weapon.upgrade != `-`) {
                      for (const i in weapon.upgrade) {
                        upgrading.push(
                          `${weapon.upgrade[i].name} (x${weapon.upgrade[i].quantity})`
                        );
                      }
                    } else {
                      upgrading = `-`;
                    }
              
                    if (weapon.sharpness.base != `-`) {
                      sharpness = `Red: ${weapon.sharpness.base.red}\nOrange: ${weapon.sharpness.base.orange}\nYellow: ${weapon.sharpness.base.yellow}\nGreen: ${weapon.sharpness.base.green}\nBlue: ${weapon.sharpness.base.blue}\nWhite: ${weapon.sharpness.base.white}\nPurple: ${weapon.sharpness.base.purple}`;
                    } else {
                      sharpness = `-`;
                    }
              
                    finalMap[k] = {
                      name: weapon.name,
                      type: weapon.type,
                      rarity: weapon.rarity,
                      displayAttack: weapon.displayAttack,
                      rawAttack: weapon.rawAttack,
                      damageType: weapon.damageType,
                      affinity: weapon.affinity,
                      defense: weapon.defense,
                      sharpness: {
                        base: sharpness
                      },
                      elderseal: weapon.elderseal,
                      shelling: shelling,
                      specialAmmo: weapon.specialAmmo,
                      deviation: weapon.deviation,
                      ammos: ammos,
                      elements: elements,
                      slots: slots,
                      coatings: weapon.coatings,
                      crafting: crafting,
                      upgrade: upgrading
                    };
                  }
              
                  return finalMap;
            })     
            .catch(err => logger.error('Failed retrieving mhw weapons: ', err));
    }
    
}

module.exports = ApiClient;