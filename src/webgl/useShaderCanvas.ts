import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { createFullscreenVao, createProgram, drawFullscreen } from './gl'
import vertSource from '../shaders/fullscreen.vert.glsl?raw'

type ShaderCanvasOptions = {
  frag: string
  /** devicePixelRatio の上限(既定2。負荷の高いシェーダーは下げる) */
  maxDpr?: number
  /** 要素のスクロール進行率(0..1)を u_scroll として渡す */
  trackScroll?: boolean
  /** ポインタ位置(0..1)を u_pointer として渡す(慣性付き) */
  trackPointer?: boolean
}

/**
 * フルスクリーンフラグメントシェーダー用のcanvasフック。
 * ガード一式(WebGL2非対応 / reduced-motion / 画面外 / タブ非表示 / DPRクランプ)を
 * ここに一元化し、コンポーネント側はフォールバック表示だけを担当する。
 *
 * 共通uniform: u_time / u_resolution / u_scroll / u_pointer
 */
export function useShaderCanvas({
  frag,
  maxDpr = 2,
  trackScroll = false,
  trackPointer = false,
}: ShaderCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ref = useCallback((element: HTMLCanvasElement | null) => {
    canvasRef.current = element
  }, [])
  const prefersReducedMotion = usePrefersReducedMotion()
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    })
    if (!gl) {
      setSupported(false)
      return
    }
    const program = createProgram(gl, vertSource, frag)
    const vao = createFullscreenVao(gl)
    if (!program || !vao) {
      setSupported(false)
      return
    }

    gl.useProgram(program)
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uScroll = gl.getUniformLocation(program, 'u_scroll')
    const uPointer = gl.getUniformLocation(program, 'u_pointer')

    let rafId = 0
    let running = false
    let inView = true
    let elapsed = 0
    let lastTs: number | null = null
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const scrollProgress = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.height === 0) return 0
      // 要素上端が画面上端からどれだけ通過したか(0=到達前, 1=通過済み)
      return Math.min(1, Math.max(0, -rect.top / rect.height))
    }

    const renderFrame = (dt: number) => {
      elapsed += dt
      resize()
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06
      gl.useProgram(program)
      gl.uniform1f(uTime, elapsed)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uScroll, trackScroll ? scrollProgress() : 0)
      gl.uniform2f(uPointer, pointer.x, pointer.y)
      drawFullscreen(gl, vao)
    }

    const loop = (ts: number) => {
      if (!running) return
      const dt = lastTs === null ? 0 : Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts
      renderFrame(dt)
      rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || prefersReducedMotion) return
      running = true
      lastTs = null
      rafId = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      pointer.tx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      pointer.ty = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (inView) start()
    }

    // 画面外では描画ループを止める
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) {
              inView = entry.isIntersecting
              if (inView && !document.hidden) start()
              else stop()
            }
          })
        : null
    observer?.observe(canvas)

    if (trackPointer && !prefersReducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (prefersReducedMotion) {
      // 動きを止めた1フレームだけ描く(リサイズ時のみ再描画)
      renderFrame(0)
    } else if (!observer) {
      start()
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (prefersReducedMotion) renderFrame(0)
          })
        : null
    resizeObserver?.observe(canvas)

    return () => {
      stop()
      observer?.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteProgram(program)
      gl.deleteVertexArray(vao)
      // loseContext()はStrictModeの再マウントで同一canvasの再取得を壊すため呼ばない
      // (同じcanvasへのgetContextは同一コンテキストを返すので、リークにはならない)
    }
  }, [frag, maxDpr, trackScroll, trackPointer, prefersReducedMotion])

  return { ref, supported }
}
