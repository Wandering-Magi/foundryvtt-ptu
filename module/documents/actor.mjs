/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class PTUActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.ptu || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareTrainerData(actorData);
    //this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareTrainerData(actorData) {
    if (actorData.type !== 'trainer') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through ability scores, and add their totals and CS adjusted to our sheet output.
    for (let [key, ability] of Object.entries(systemData.stats)) {
      // Calculate the ability total
      ability.total =
        ability.base + ability.feats + ability.bonus + ability.level;
      const stageMod =
        ability.stage >= 0 ? 1 + ability.stage * 0.2 : 1 + ability.stage * 0.1;
      ability.value = Math.max(1, ability.total * stageMod);
      //console.log(key, ability);

      // while making adjustments to hp, modify actor max/injured health
      if (key === 'hp') {
        const level = 1;
        systemData.hitpoints.max = Math.trunc(
          (level * 2 + ability.adjusted * 3 + 10) *
            (1 - systemData.hitpoints.injuries / 10)
        );
      }

      // calculate evasion for (s)def and speed

      // adjust movement values by speed cs
    }

    // skill management
    for (let [key, skill] of Object.entries(systemData.skills)) {
      const skillRank = [
        null,
        'Pathetic',
        'Untrained',
        'Novice',
        'Adept',
        'Expert',
        'Master',
      ];
      // roll format of "Nd6 + M"
      skill.value = skill.value > 6 ? 6 : skill.value;
      skill.roll = `${skill.value}d6${
        skill.modifier != '' ? '+' + skill.modifier : ''
      }`;
      skill.rank = skillRank[skill.value];
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }
}
