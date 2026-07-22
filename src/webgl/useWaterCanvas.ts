import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { createFullscreenVao, createProgram, drawFullscreen } from './gl'
import vertSource from '../shaders/fullscreen.vert.glsl?raw'
import simSource from '../shaders/water-sim.frag.glsl?raw'
import renderSource from '../shaders/water-render.frag.glsl?raw'

/** シミュレーション解像度(正方形)。表示解像度から独立させて負荷を一定に保つ */
const SIM_SIZE = 256

type Drop = { x: number; y: number; strength: number }

/**
 * 触れる水面: 波動方程式をピンポンFBOで解き、法線を起こして描画する。
 * - float色バッファ非対応の環境では、シミュレーションなしの静かな水面に落とす
 * - reduced-motion では1フレームだけ描いて停止(波源も付けない)
 * - ポインタで波紋、無操作時も湯口の雫が周期的に波紋を作る
 */
export function useWaterCanvas() {
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
      alpha: false,
      powerPreference: 'low-power',
    })
    if (!gl) {
      setSupported(false)
      return
    }

    const renderProgram = createProgram(gl, vertSource, renderSource)
    const simProgram = createProgram(gl, vertSource, simSource)
    const vao = createFullscreenVao(gl)
    if (!renderProgram || !simProgram || !vao) {
      setSupported(false)
      return
    }

    // float色バッファが使えない環境ではシミュレーションを諦める(描画のみ)
    const floatExt = gl.getExtension('EXT_color_buffer_float')
    const simEnabled = Boolean(floatExt) && !prefersReducedMotion

    // --- シミュレーション用ピンポンテクスチャ ---
    const makeFieldTexture = () => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RG16F,
        SIM_SIZE,
        SIM_SIZE,
        0,
        gl.RG,
        gl.HALF_FLOAT,
        null,
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return tex
    }

    const fields = simEnabled
      ? [makeFieldTexture(), makeFieldTexture()]
      : [null, null]
    const fbos = simEnabled ? [gl.createFramebuffer(), gl.createFramebuffer()] : []
    if (simEnabled) {
      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[i])
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          fields[i],
          0,
        )
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
    // シミュレーション無効時に束ねる無音のフィールド(高さ0)
    const silentField = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, silentField)
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    )

    // uniform locations
    const simU = {
      field: gl.getUniformLocation(simProgram, 'u_field'),
      texel: gl.getUniformLocation(simProgram, 'u_texel'),
      drop: gl.getUniformLocation(simProgram, 'u_drop'),
      aspect: gl.getUniformLocation(simProgram, 'u_aspect'),
    }
    const renderU = {
      field: gl.getUniformLocation(renderProgram, 'u_field'),
      texel: gl.getUniformLocation(renderProgram, 'u_texel'),
      time: gl.getUniformLocation(renderProgram, 'u_time'),
      resolution: gl.getUniformLocation(renderProgram, 'u_resolution'),
    }

    let current = 0
    let rafId = 0
    let running = false
    let inView = true
    let elapsed = 0
    let lastTs: number | null = null
    let sinceDrip = 0
    const dropQueue: Drop[] = []
    let lastPointer: { x: number; y: number } | null = null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }

    const simStep = (drop: Drop | undefined) => {
      const next = 1 - current
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[next])
      gl.viewport(0, 0, SIM_SIZE, SIM_SIZE)
      gl.useProgram(simProgram)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fields[current])
      gl.uniform1i(simU.field, 0)
      gl.uniform2f(simU.texel, 1 / SIM_SIZE, 1 / SIM_SIZE)
      gl.uniform1f(simU.aspect, canvas.width / Math.max(canvas.height, 1))
      if (drop) {
        gl.uniform3f(simU.drop, drop.x, drop.y, drop.strength)
      } else {
        gl.uniform3f(simU.drop, 0, 0, 0)
      }
      drawFullscreen(gl, vao)
      current = next
    }

    const renderFrame = (dt: number) => {
      elapsed += dt
      resize()

      if (simEnabled) {
        // 1フレームに2ステップ回すと波の伝播が自然な速さになる
        simStep(dropQueue.shift())
        simStep(dropQueue.shift())
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(renderProgram)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, simEnabled ? fields[current] : silentField)
      gl.uniform1i(renderU.field, 0)
      gl.uniform2f(renderU.texel, 1 / SIM_SIZE, 1 / SIM_SIZE)
      gl.uniform1f(renderU.time, elapsed)
      gl.uniform2f(renderU.resolution, canvas.width, canvas.height)
      drawFullscreen(gl, vao)
    }

    const loop = (ts: number) => {
      if (!running) return
      const dt = lastTs === null ? 0 : Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts

      // 湯口の雫: 無操作でも水面が生きているように
      sinceDrip += dt
      if (simEnabled && sinceDrip > 2.6) {
        sinceDrip = 0
        dropQueue.push({
          x: 0.16 + Math.random() * 0.05,
          y: 0.72 + Math.random() * 0.05,
          strength: 0.35,
        })
      }

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
      if (!simEnabled) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = (event.clientX - rect.left) / rect.width
      const y = 1 - (event.clientY - rect.top) / rect.height
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        lastPointer = null
        return
      }
      // 動いた距離に応じた強さで波紋(最大値は控えめに)
      const dist = lastPointer
        ? Math.hypot(x - lastPointer.x, y - lastPointer.y)
        : 0.01
      lastPointer = { x, y }
      if (dropQueue.length < 6) {
        dropQueue.push({ x, y, strength: Math.min(0.5, 0.1 + dist * 6.0) })
      }
    }
    const onPointerLeave = () => {
      lastPointer = null
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (inView) start()
    }

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

    canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    if (prefersReducedMotion) {
      renderFrame(0)
    } else if (!observer) {
      start()
    }

    return () => {
      stop()
      observer?.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteProgram(renderProgram)
      gl.deleteProgram(simProgram)
      gl.deleteVertexArray(vao)
      for (const field of fields) if (field) gl.deleteTexture(field)
      for (const fbo of fbos) if (fbo) gl.deleteFramebuffer(fbo)
      gl.deleteTexture(silentField)
      // loseContext()はStrictModeの再マウントで同一canvasの再取得を壊すため呼ばない
    }
  }, [prefersReducedMotion])

  return { ref, supported }
}
