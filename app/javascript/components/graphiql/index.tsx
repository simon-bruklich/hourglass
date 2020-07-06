import * as React from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import GraphiQL from 'graphiql/dist/index';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Fetcher } from 'graphiql/dist/components/GraphiQL';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'graphiql/graphiql.min.css';

import { getCSRFToken } from '@hourglass/workflows/student/exams/show/helpers';

const URL = '/graphql';

const graphQLFetcher: Fetcher = async (graphQLParams) => (
  fetch(URL, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    body: JSON.stringify(graphQLParams),
  }).then((response) => response.json())
);

const defaultQuery = `
{
  courses {
    title
    exams {
      id
      name
    }
  }
}
`;

const GIQL: React.FC = () => (
  <div className="vh-100">
    <GraphiQL fetcher={graphQLFetcher} defaultQuery={defaultQuery} />
  </div>
);

export default GIQL;
