import * as pulumi from '@pulumi/pulumi'

import { createEcs, createRds, createVpc, loadContext } from './src/helpers'

const context = loadContext()

const vpc = createVpc({ secondOctet: 4 }, context)

context.vpc = vpc

const { alb, cluster, service, mainListener } = createEcs({}, context)

export const url = pulumi.interpolate`${alb.loadBalancer.dnsName}`

createRds({}, context)
