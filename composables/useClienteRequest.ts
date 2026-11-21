export const useClienteRequest = () => {
  const client = useSanctumClient()

  const request = async (url: string, method: string, body: any = null) => {
    try {
      return await client(url, {
        method,
        body: body || null,
      })
    }
    catch (e: any) {
      throw e?.data ?? e
    }
  }

  return {
    get: (url: string) => request(url, 'GET'),
    post: (url: string, body: any) => request(url, 'POST', body),
    put: (url: string, body: any) => request(url, 'PUT', body),
    deleted: (url: string, body?: any) => request(url, 'DELETE', body),
  }
}
