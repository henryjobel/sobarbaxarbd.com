import { NextResponse } from 'next/server'

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function created(data: unknown) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

export function unauthorized() {
  return error('Unauthorized', 401)
}

export function forbidden() {
  return error('Forbidden', 403)
}

export function notFound(resource = 'Resource') {
  return error(`${resource} not found`, 404)
}

export function badRequest(message = 'Bad request') {
  return error(message, 400)
}
