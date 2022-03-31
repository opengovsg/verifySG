import { Injectable } from '@nestjs/common'
import convict, { Config, Path } from 'convict'
import 'dotenv/config'
import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm'
import fs from 'fs'

import { ConfigSchema, schema } from '../config.schema'

@Injectable()
export class ConfigService {
  config: Config<ConfigSchema>
  constructor() {
    this.config = convict(schema)
    this.config.validate()
  }

  // We want to implicitly use the return type of convict get method.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  get<K extends Path<ConfigSchema>>(key: K) {
    return this.config.get(key)
  }

  get isDevEnv(): boolean {
    return this.config.get('environment') === 'development'
  }

  // This is a helper for local file runs or jest, as specified in package.json
  // It emulates the loading of SSM which Lambda will do.
  // This file is not meant to be used in a deployment and is .mjs so we can use top-level await
  static async createEnvFile() {
    const client = new SSMClient({ region: 'ap-southeast-1' })
    const ENV = process.env.ENV ?? 'staging'
    const prefix = `/${ENV}-checkwho-gov/`
    const params: Record<string, string> = {}
    let nextToken

    do {
      // Handle pagination (max 10 params per call)
      const res: any = await client.send(
        new GetParametersByPathCommand({
          Path: prefix,
          Recursive: true,
          WithDecryption: true,
          ...(nextToken ? { NextToken: nextToken } : {}),
        }),
      )

      for (const parameter of res.Parameters ?? []) {
        const paramName = parameter.Name.slice(prefix.length)
        const isStringList = parameter.Type === 'StringList'
        params[paramName] = isStringList
          ? `[${parameter.Value.split(',').map((x: string) => `"${x}"`)}]`
          : parameter.Value
      }

      nextToken = res.NextToken
    } while (nextToken)

    // format strings, JSON strings, and StringList appropriately
    const envString = Object.entries(params)
      .map(([k, v]) => {
        const strippedValue = v.replace(/\s/g, '')
        const looksLikeJson = strippedValue.includes('{')
        return looksLikeJson
          ? `${k}=${strippedValue}`
          : `${k}='${strippedValue}'`
      })
      .join('\n')
      .concat(`\nENV=${ENV}`)
      .concat(`\nNODE_ENV=${ENV}`)

    console.log({
      message: 'Succesfully fetched environment variables from SSM',
      keys: Object.keys(params),
    })

    await fs.promises.writeFile('.env', envString)
  }
}
