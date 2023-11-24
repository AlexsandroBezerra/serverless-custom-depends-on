import { describe } from 'vitest'
import { filterResourcesByType } from './filter'

import CfnResourceList = Serverless.CfnResourceList

describe('filterResourcesByType', (it) => {
  it('should filter resources by type', ({ expect }) => {
    const resources = {
      Resource1: {
        Type: 'AWS::Lambda::Function'
      },
      Resource2: {
        Type: 'AWS::ApiGateway::Method'
      }
    } as unknown as CfnResourceList

    const filtered = filterResourcesByType(resources, 'AWS::Lambda::Function')

    expect(Object.keys(filtered).length).toBe(1)
    expect(filtered.Resource1).toBeDefined()
  })

  it('should return empty object if no resources match', ({ expect }) => {
    const resources = {
      Resource1: {
        Type: 'AWS::Lambda::Function'
      },
      Resource2: {
        Type: 'AWS::ApiGateway::Method'
      }
    } as unknown as CfnResourceList

    const filtered = filterResourcesByType(resources, 'AWS::S3::Bucket')

    expect(Object.keys(filtered).length).toBe(0)
  })

  it('should return empty object if no resources', ({ expect }) => {
    const resources = {} as unknown as CfnResourceList

    const filtered = filterResourcesByType(resources, 'AWS::S3::Bucket')

    expect(Object.keys(filtered).length).toBe(0)
  })
})
