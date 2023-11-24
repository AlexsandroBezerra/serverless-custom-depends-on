export function filterResourcesByType (
  resources: Serverless.CfnResourceList,
  type: string
): Serverless.CfnResourceList {
  const filtered = Object.entries(resources).filter(([_, value]) => {
    return value.Type === type
  })

  return Object.fromEntries(filtered)
}
