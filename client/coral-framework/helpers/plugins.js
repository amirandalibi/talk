import React from 'react';
import uniq from 'lodash/uniq';
import pick from 'lodash/pick';
import merge from 'lodash/merge';
import plugins from 'pluginsConfig';
import flatten from 'lodash/flatten';
import flattenDeep from 'lodash/flattenDeep';
import {loadTranslations} from 'coral-framework/services/i18n';
import {injectReducers, getStore} from 'coral-framework/services/store';
import camelize from './camelize';

export function getSlotComponents(slot) {
  const pluginConfig = getStore().getState().config.plugin_config;

  return flatten(plugins

    // Filter out components that have slots and have been disabled in `plugin_config`
      .filter((o) => o.module.slots && (!pluginConfig || !pluginConfig[o.name] || !pluginConfig[o.name].disable_components))

      .filter((o) => o.module.slots[slot])
      .map((o) => o.module.slots[slot])
  );
}

export function isSlotEmpty(slot) {
  return getSlotComponents(slot).length === 0;
}

/**
 * Returns React Elements for given slot.
 */
export function getSlotElements(slot, props = {}) {
  return getSlotComponents(slot)
    .map((component, i) => React.createElement(component, {key: i, ...props}));
}

export function getSlotFragments(slot, part) {
  const components = uniq(flattenDeep(plugins
    .filter((o) => o.module.slots ? o.module.slots[slot] : false)
    .map((o) => o.module.slots[slot])
  ));

  const documents = components
    .map((c) => c.fragments)
    .filter((fragments) => fragments && fragments[part])
    .reduce((res, fragments) => {
      res.push(fragments[part]);
      return res;
    }, []);

  return documents;
}

export function getGraphQLExtensions() {
  return plugins
    .map((o) => pick(o.module, ['mutations', 'queries', 'fragments']))
    .filter((o) => o);
}

function getTranslations() {
  return plugins
    .map((o) => o.module.translations)
    .filter((o) => o);
}

export function loadPluginsTranslations() {
  getTranslations().forEach((t) => loadTranslations(t));
}

export function injectPluginsReducers() {
  const reducers = merge(
    ...plugins
      .filter((o) => o.module.reducer)
      .map((o) => ({[camelize(o.name)] : o.module.reducer}))
  );
  injectReducers(reducers);
}

function addMetaDataToSlotComponents() {

  // Add talkPluginName to Slot Components.
  plugins.forEach((plugin) => {
    const slots = plugin.module.slots;
    slots && Object.keys(slots).forEach((slot) => {
      slots[slot].forEach((component) => {
        component.talkPluginName = plugin.name;
      });
    });
  });
}

addMetaDataToSlotComponents();
