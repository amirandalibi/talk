import { graphql } from "react-relay";
import { Environment } from "relay-runtime";

import {
  commitMutationPromiseNormalized,
  createMutation,
} from "coral-framework/lib/relay";

import { RegenerateSSOKeyMutation as MutationTypes } from "coral-admin/__generated__/RegenerateSSOKeyMutation.graphql";

let clientMutationId = 0;

const RegenerateSSOKeyMutation = createMutation(
  "regenerateSSOKey",
  (environment: Environment) =>
    commitMutationPromiseNormalized<MutationTypes>(environment, {
      mutation: graphql`
        mutation RegenerateSSOKeyMutation($input: RegenerateSSOKeyInput!) {
          regenerateSSOKey(input: $input) {
            organization {
              auth {
                integrations {
                  sso {
                    key
                    keyGeneratedAt
                  }
                }
              }
            }
            clientMutationId
          }
        }
      `,
      variables: {
        input: {
          clientMutationId: (clientMutationId++).toString(),
        },
      },
    })
);

export default RegenerateSSOKeyMutation;
