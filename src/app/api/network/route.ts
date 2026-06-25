import { NextResponse } from 'next/server'
import os from 'os'
import { DEFAULT_PORT } from '@/lib/constants'

export async function GET() {
  try {
    const hostname = os.hostname()
    const interfaces = os.networkInterfaces()
    const networkInterfaces: { name: string; address: string; family: string }[] = []

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue
      for (const addr of addrs) {
        if (!addr.internal && addr.family === 'IPv4') {
          networkInterfaces.push({
            name,
            address: addr.address,
            family: addr.family,
          })
        }
      }
    }

    return NextResponse.json({
      hostname,
      port: parseInt(process.env.PORT || String(DEFAULT_PORT), 10),
      interfaces: networkInterfaces,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get network info'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
