import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
  // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
  // to a different host
  link: new HttpLink({
    //pending 1 has updated tx coutn but no id fixes on historical

    // the old pending version of 2 without the price fix
    // uri: 'https://api.thegraph.com/subgraphs/id/QmPjQ4ZP5QpAvHgewv8ydXTs9CNybaGpTXAhdv1GBszx35'

    //current pending of 2 has the price fix
    uri: 'https://api.thegraph.com/subgraphs/id/QmWHpyTDUmJ61xjtpz6ZSqR4qGRTJwQoT5WvMfcmB4QSfu'

    // 3 is deployed without tx coutn and without price fix
    // uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/unsiwap3'
  }),
  cache: new InMemoryCache()
})
