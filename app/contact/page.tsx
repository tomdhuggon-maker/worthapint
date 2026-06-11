'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const res = await fetch('https://formspree.io/f/xkoaqnjk', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      setStatus('sent')
      form.reset()
    } else {
      setStatus('error')
    }
  }

  return (
    <main className="page-wrap">
      <header className="pub-header">
        <p className="pub-area">Get in touch</p>
        <h1 className="pub-name">Contact</h1>
      </header>

      <hr className="divider" />

      {status === 'sent' ? (
        <p className="contact-success">Message sent — thanks! I'll get back to you soon.</p>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="name">Name</label>
            <input className="form-input" id="name" name="name" type="text" required />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-input" id="email" name="email" type="email" required />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="message">Message</label>
            <textarea className="form-textarea" id="message" name="message" rows={5} required />
          </div>
          {status === 'error' && (
            <p className="contact-error">Something went wrong — please try again.</p>
          )}
          <button className="form-submit" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
        </form>
      )}
    </main>
  )
}