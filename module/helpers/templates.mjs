/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/ptu/templates/actor/parts/actor-summary.hbs',
    'systems/ptu/templates/actor/parts/actor-skills.hbs',
    'systems/ptu/templates/actor/parts/actor-stats-combat.hbs',
    'systems/ptu/templates/actor/parts/actor-stats-derived.hbs',
    'systems/ptu/templates/actor/parts/actor-trainer.hbs',
    'systems/ptu/templates/actor/parts/actor-trainer-card.hbs',
  ]);
};
