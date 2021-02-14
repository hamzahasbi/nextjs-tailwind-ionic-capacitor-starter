import FactoryAPI, { initFactoryAPI } from './api';
import get from 'lodash.get';
import truncate from "truncate";
import {stripHtml} from "string-strip-html";
initFactoryAPI();

export const getThematique = language => {
  const endpointUrl = FactoryAPI.getEndpoints().find(locale => {
    return locale.locale === language;
  })['url'];

  return FactoryAPI.getResourcesV2(
    endpointUrl,
    'taxonomy_term/vactory_news_theme',
    {
      fields: {
        'taxonomy_term--vactory_news_theme': 'drupal_internal__tid,name',
      },
    },
  );
};
export const getNewsNodes = (language, selectedTerm, offset) => {
  // need to passe local to every page too.
  const endpointUrl = FactoryAPI.getEndpoints().find(locale => {
    return locale.locale === language;
  })['url'];

  let categoryFilter = {
    'filter[taxonomy_term--vactory_news_theme][condition][path]':
      'field_vactory_news_theme.drupal_internal__tid',
    'filter[taxonomy_term--vactory_news_theme][condition][operator]': '=',
    'filter[taxonomy_term--vactory_news_theme][condition][value]': selectedTerm,
  };

  if (selectedTerm === 'all') {
    categoryFilter = {};
  }


  return FactoryAPI.getResourcesV2(endpointUrl, 'node/vactory_news', {
    page: {
      limit: 10,
      offset: offset,
    },
    sort: '-created',
    // do not use filter param directly.
    // bypass paramsSerializer
    // https://www.npmjs.com/package/qs
    ...categoryFilter,
    fields: {
      'node--vactory_news':
        'drupal_internal__nid,langcode,title,path,created,field_vactory_excerpt,field_vactory_media,field_vactory_taxonomy_1',
        "media--image": "thumbnail",
        "file--image": "uri",
        "taxonomy_term--vactory_news_theme": "name",
    },
    include: "field_vactory_media_image,field_vactory_media_image.thumbnail,field_vactory_taxonomy_1,field_vactory_paragraphs",
  });
};

export const getNewsById = (id, language) => {
  const endpointUrl = FactoryAPI.getEndpoints().find(locale => {
    return locale.locale === language;
  })['url'];

  const filterId = {
    'filter[drupal_internal__nid][condition][path]': 'drupal_internal__nid',
    'filter[drupal_internal__nid][condition][operator]': '=',
    'filter[drupal_internal__nid][condition][value]': id,
  };
  return FactoryAPI.getResourcesV2(endpointUrl, 'node/vactory_news', {
    // do not use filter param directly.
    // bypass paramsSerializer
    // https://www.npmjs.com/package/qs
    ...filterId,
    fields: {
      "node--vactory_news": "drupal_internal__nid,langcode,title,path,metatag_normalized,created,field_vactory_excerpt,field_vactory_media_image,field_vactory_taxonomy_1,body,field_vactory_date,field_vactory_paragraphs,internal_node_banner,node_settings",
      "media--image": "thumbnail",
      "file--image": "uri",
      "taxonomy_term--vactory_news_theme": "name",
    },
    include: "field_vactory_media_image,field_vactory_media_image.thumbnail,field_vactory_taxonomy_1,field_vactory_paragraphs",
  });
};


export const normalizer = (nodes) => {
  return nodes.map(post => ({
      id: post.drupal_internal__nid,
      title: post.title,
      url: get(post, 'path.alias', '#.'),
      excerpt: truncate(stripHtml(get(post, 'field_vactory_excerpt.processed', '')), 100),
      category: get(post, 'field_vactory_taxonomy_1.name', null),
      image: get(post, 'field_vactory_media_image.thumbnail.uri.value', null)
  }));
};