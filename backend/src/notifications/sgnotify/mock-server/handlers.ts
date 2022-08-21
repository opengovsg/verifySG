import { rest } from 'msw'

import {
  AUTHZ_ENDPOINT,
  NOTIFICATION_ENDPOINT,
  PUBLIC_KEY_ENDPOINT,
} from '../../constants'

export const sgNotifyMockApi = (endpoint: string) =>
  // process.env.SGNOTIFY_URL defined in backend/jest.env.js
  `${process.env.SGNOTIFY_URL}${endpoint}`

// Matches any "GET /user" requests,
// and responds using the `responseResolver` function.
export const handlers = [
  rest.get(sgNotifyMockApi(PUBLIC_KEY_ENDPOINT), async (_req, res, ctx) => {
    // actual public keys at https://stg-ntf.singpass.gov.sg/.well-known/ntf-authz-keys as at 21 Aug 2022
    return res(
      ctx.json({
        keys: [
          {
            kty: 'EC',
            use: 'sig',
            crv: 'P-256',
            kid: 'ntf-stg-01',
            x: 'H84i7bJw4FrGC-G-1bcTzqy1-VNNug7Y3Jf0QZBYf_Q',
            y: 'HB7VNYe2ksPv9ToYExFBr7UokG6Uec6chdoJu8PEtYw',
          },
          {
            kty: 'EC',
            use: 'enc',
            crv: 'P-256',
            kid: 'ntf-stg-01',
            x: 'H84i7bJw4FrGC-G-1bcTzqy1-VNNug7Y3Jf0QZBYf_Q',
            y: 'HB7VNYe2ksPv9ToYExFBr7UokG6Uec6chdoJu8PEtYw',
            alg: 'ECDH-ES+A256KW',
          },
        ],
      }),
    )
  }),
  // TODO: figure out SGNotify's crypto set up and mock a version with keys that are actually internally coherent
  rest.post(sgNotifyMockApi(NOTIFICATION_ENDPOINT), async (_req, res, ctx) => {
    return res(
      ctx.json({
        jwe: {},
      }),
    )
  }),
  rest.post(sgNotifyMockApi(AUTHZ_ENDPOINT), async (_req, res, ctx) => {
    // TODO
    return res(
      ctx.json({
        token: {},
      }),
    )
  }),
]
