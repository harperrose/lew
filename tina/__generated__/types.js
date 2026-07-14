export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const SitePartsFragmentDoc = gql`
    fragment SiteParts on Site {
  __typename
  siteTitle
  infoLabel
  onlyWorkLabel
  columnTitles {
    __typename
    shortStories
    poems
    interviews
    biography
    references
    contact
  }
  biography {
    __typename
    title
    text
  }
  shortStories {
    __typename
    title
    text
  }
  poems {
    __typename
    title
    text
    image
  }
  interviews {
    __typename
    title
    text
  }
  references {
    __typename
    title
    text
  }
  contactLinks {
    __typename
    title
    text
  }
}
    `;
export const SiteDocument = gql`
    query site($relativePath: String!) {
  site(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SiteParts
  }
}
    ${SitePartsFragmentDoc}`;
export const SiteConnectionDocument = gql`
    query siteConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SiteFilter) {
  siteConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SiteParts
      }
    }
  }
}
    ${SitePartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    site(variables, options) {
      return requester(SiteDocument, variables, options);
    },
    siteConnection(variables, options) {
      return requester(SiteConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "https://content.tinajs.io/2.4/content/6e9d8786-5e32-4820-8485-ced9b0412518/github/main",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
