import https from 'https'

export default (urlOptions, data = '') => new Promise((resolve, reject) => {
  // Inspired from https://gist.github.com/ktheory/df3440b01d4b9d3197180d5254d7fb65
  const req = https.request(urlOptions, res => {
    // I believe chunks can simply be joined into a string
    const chunks = []

    res.on('data', chunk => chunks.push(chunk))
    res.on('error', reject)
    res.on('end', () => {
      const { statusCode, headers } = res
      const validResponse = statusCode >= 200 && statusCode <= 299
      const body = Buffer.concat(chunks).toString();

      if (validResponse) resolve({ statusCode, headers, body })
      else reject(new Error(`Request failed. status: ${statusCode}, body: ${body}`))
    })
  })

  req.on('error', reject)
  req.end()
})