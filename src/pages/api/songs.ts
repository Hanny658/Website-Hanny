import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dirPath = path.join(process.cwd(), 'src', 'songdata')
  const files = fs.readdirSync(dirPath).filter((file) => file.endsWith('.json'))

  const songList = files.map((file) => {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf-8')
    const data = JSON.parse(content)
    return { number: data.number, title: data.title }
  })

  res.status(200).json(songList)
}
