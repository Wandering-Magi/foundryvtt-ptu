/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
const skillRanks = {
  1: "PTU.Pathetic",
  2: "PTU.Untrained",
  3: "PTU.Novice",
  4: "PTU.Adept",
  5: "PTU.Expert",
  6: "PTU.Master",
  8: "PTU.Virtuoso",
};
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
    this._preparePokemonData(actorData);
  }

  /**
   * Prepare Trainer type specific data
   */
  _prepareTrainerData(actorData) {
    if (!(this.system instanceof TrainerData)) return;

    let trainer = this.system;
    // Assign the trainer their ID number

    // Iterate through skills
    for (let [_, attrs] of Object.entries(trainer.skills)) {
      // set the localized rank value
      attrs.ranks = game.i18n.localize(`${skillRanks[attrs.value]}`);
      // set the dice roll vstring
      attrs.roll = attrs.value + "d6" + attrs.modifier;
    }

    // Iterate through stats and calculate totals
    for (let [_, stat] of Object.entries(trainer.stats)) {
      // calculate the total of all stat changes
      let statTotal = stat.base + stat.feats + stat.bonus + stat.level;
      // modify them by the combat stage
      let stageMod = stat.cs >= 0 ? 1 + stat.cs * 0.2 : 1 + stat.cs * 0.1;
      // update the stat value
      stat.value = Math.max(1, statTotal * stageMod);
    }

    // Calculate HP for Trainers
    trainer.health.max = trainer.level * 2 + trainer.stats.hp.value * 3 + 10;

    // Calculate AP for Trainers
    trainer.ap.max = Math.floor(trainer.level / 3) + 5;
    trainer.ap.value =
      trainer.ap.max -
      (trainer.ap.used.spent + trainer.ap.used.bound + trainer.ap.used.drained);

    // Calculate Exp for Trainers
    trainer.exp.value =
      trainer.exp.milestone * 10 + trainer.exp.dexExp + trainer.exp.misc;

    // Calcualte Level for Trainers
    trainer.level = 1 + Math.floor(trainer.exp.value / 10);

    //Calcualte Evasion
    let skill = [
      trainer.stats.def.value,
      trainer.stats.sdef.value,
      trainer.stats.spd.value,
    ];
    let eva = [
      trainer.evasion.physical.stat,
      trainer.evasion.special.stat,
      trainer.evasion.speed.stat,
    ];
    for (let s in eva) {
      eva[s] = skill[s] >= 30 ? 30 : skill[s];
    }
  }

  /**
   * Prepare Pokemon type specific data
   */
  _preparePokemonData(actorData) {
    if (!(this.system instanceof Pokemon)) return;
  }
  /**
   * Prepare Character type specific data
   */
  // _prepareCharacterData(actorData) {
  //   if (actorData.type !== "character") return;

  //   // Make modifications to data here. For example:
  //   const systemData = actorData.system;

  //   // Loop through ability scores, and add their modifiers to our sheet output.
  //   for (let [key, ability] of Object.entries(systemData.abilities)) {
  //     // Calculate the modifier using d20 rules.
  //     ability.mod = Math.floor((ability.value - 10) / 2);
  //   }
  // }

  /**
   * Override getRollData() that's supplied to rolls.
  //  */
  // getRollData() {
  //   const data = super.getRollData();

  //   // Prepare character roll data.
  //   this._getCharacterRollData(data);
  //   this._getNpcRollData(data);

  //   return data;
  //}

  //   /**
  //    * Prepare character roll data.
  //    */
  //   _getCharacterRollData(data) {
  //     if (this.type !== "character") return;

  //     // Copy the ability scores to the top level, so that rolls can use
  //     // formulas like `@str.mod + 4`.
  //     if (data.abilities) {
  //       for (let [k, v] of Object.entries(data.abilities)) {
  //         data[k] = foundry.utils.deepClone(v);
  //       }
  //     }

  //     // Add level for easier access, or fall back to 0.
  //     if (data.attributes.level) {
  //       data.lvl = data.attributes.level.value ?? 0;
  //     }
  //   }

  //   /**
  //    * Prepare NPC roll data.
  //    */
  //   _getNpcRollData(data) {
  //     if (this.type !== "npc") return;

  //     // Process additional NPC data here.
  //   }
}

const fields = foundry.data.fields;
const commonStat = () => {
  return {
    feats: new fields.NumberField({ initial: 0 }),
    bonus: new fields.NumberField({ initial: 0 }),
    level: new fields.NumberField({ initial: 0 }),
    cs: new fields.NumberField({ initial: 0 }),
    value: new fields.NumberField({ initial: 0 }),
  };
};

const commonActorData = () => {
  return {
    stats: new fields.SchemaField({
      hp: new fields.SchemaField({
        base: new fields.NumberField({ initial: 10 }),
        ...commonStat(),
      }),
      atk: new fields.SchemaField({
        base: new fields.NumberField({ initial: 5 }),
        ...commonStat(),
      }),
      def: new fields.SchemaField({
        base: new fields.NumberField({ initial: 5 }),
        ...commonStat(),
      }),
      satk: new fields.SchemaField({
        base: new fields.NumberField({ initial: 5 }),
        ...commonStat(),
      }),
      sdef: new fields.SchemaField({
        base: new fields.NumberField({ initial: 5 }),
        ...commonStat(),
      }),
      spd: new fields.SchemaField({
        base: new fields.NumberField({ initial: 5 }),
        ...commonStat(),
      }),
    }),
    capabilities: new fields.SchemaField({
      overland: new fields.NumberField({ initial: 5, integer: true }),
      throwing: new fields.NumberField({ initial: 6, integer: true }),
      highjump: new fields.NumberField({ initial: 0, integer: true }),
      longjump: new fields.NumberField({ initial: 1, integer: true }),
      swim: new fields.NumberField({ initial: 2, integer: true }),
      power: new fields.NumberField({ initial: 4, integer: true }),
      size: new fields.StringField({ initial: "Medium" }),
    }),
    otherCapabilities: new fields.ArrayField(new fields.StringField()),

    evasion: new fields.SchemaField({
      physical: new fields.SchemaField({
        stat: new fields.NumberField({ initial: 0, integer: true }),
        bonus: new fields.NumberField({ initial: 0, integer: true }),
        value: new fields.NumberField({ initial: 0, integer: true }),
      }),
      special: new fields.SchemaField({
        stat: new fields.NumberField({ initial: 0, integer: true }),
        bonus: new fields.NumberField({ initial: 0, integer: true }),
        value: new fields.NumberField({ initial: 0, integer: true }),
      }),
      speed: new fields.SchemaField({
        stat: new fields.NumberField({ initial: 0, integer: true }),
        bonus: new fields.NumberField({ initial: 0, integer: true }),
        value: new fields.NumberField({ initial: 0, integer: true }),
      }),
    }),
  };
};

const skills = () => {
  return {
    skills: new fields.SchemaField({
      acrobatics: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Acrobatics`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Body`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      athletics: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Athletics`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Body`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      charm: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Charm`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Spirit`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      combat: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Combat`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Body`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      command: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Command`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Spirit`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      gened: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.GenEd`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      meded: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.MedEd`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      occed: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.OccEd`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      pokeed: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.PokeEd`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      teched: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.TechEd`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      focus: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Focus`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Spirit`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      guile: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Guile`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      intimidate: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Intimidate`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Body`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      intuition: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Intuition`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Spirit`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      perception: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Perception`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Mind`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      stealth: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Stealth`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Body`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
      survival: new fields.SchemaField({
        name: new fields.StringField({
          initial: game.i18n.localize(`PTU.Survival`),
        }),
        group: new fields.StringField({
          initial: game.i18n.localize(`PTU.Body`),
        }),
        value: new fields.NumberField({ initial: 2 }),
        modifier: new fields.StringField({ initial: "" }),
      }),
    }),
  };
};

export class TrainerData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...commonActorData(),
      ...skills(),
      details: new fields.SchemaField({
        sex: new fields.StringField({ initial: "" }),
        age: new fields.NumberField({ initial: 0, integer: true }),
        height: new fields.NumberField({ initial: 0, integer: true }),
        weight: new fields.NumberField({ initial: 0, integer: true }),
        biography: new fields.HTMLField(),
        description: new fields.HTMLField(),
        personality: new fields.HTMLField(),
        goals: new fields.HTMLField(),
      }),

      money: new fields.NumberField({ initial: 0, integer: true }),
      id: new fields.NumberField({ initial: 0 }),
      level: new fields.NumberField({ initial: 1, integer: true }),
      exp: new fields.SchemaField({
        milestone: new fields.NumberField({ initial: 0 }),
        dexExp: new fields.NumberField({ initial: 0 }),
        misc: new fields.NumberField({ initial: 0 }),
        value: new fields.NumberField({ initial: 0 }),
      }),

      health: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
        min: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        max: new fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
      }),

      ap: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
        min: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        max: new fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
        used: new fields.SchemaField({
          spent: new fields.NumberField({ initial: 0 }),
          bound: new fields.NumberField({ initial: 0 }),
          drained: new fields.NumberField({ initial: 0 }),
        }),
      }),
    };
  }
}

class Pokemon extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...commonActorData(),
      ...skills(),

      health: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
        min: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        max: new fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
      }),
    };
  }
}
