#version 300 es
// ヒーロー「山霞」: 夜の谷。稜線・霞・月・宿の灯りをすべて手続き生成で描く。
// u_scroll(0..1)が進むほど霞が薄れ、宿の灯りが強くなる —
// コピー「霞の向こうに、湯の灯り。」をそのままシェーダーで実装している。
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec2 u_pointer;

// --- value noise / fbm -----------------------------------------------------

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * valueNoise(p);
    p = p * 2.02 + vec2(31.7, 17.3);
    amp *= 0.5;
  }
  return value;
}

// --- 山の稜線 ---------------------------------------------------------------

// layer: 0=遠景 1=中景 2=近景。戻り値は「その高さより下が山」の境界
float ridge(float x, float layer) {
  float seed = layer * 71.3;
  float base = 0.62 - layer * 0.17;
  float amp = 0.10 + layer * 0.05;
  return base + (fbm(vec2(x * (1.6 + layer * 0.7) + seed, seed)) - 0.5) * 2.0 * amp;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  // ポインタでわずかに視差(層ごとに深度差をつける)
  vec2 par = (u_pointer - 0.5) * 0.015;

  float night = clamp(u_scroll * 1.4, 0.0, 1.0);

  // --- 空: 夕暮れの残光 → 夜 ---
  vec3 skyTop = mix(vec3(0.075, 0.101, 0.129), vec3(0.051, 0.070, 0.094), night);
  vec3 skyHorizon = mix(vec3(0.286, 0.243, 0.267), vec3(0.110, 0.145, 0.176), night);
  vec3 color = mix(skyHorizon, skyTop, smoothstep(0.25, 0.95, uv.y));

  // --- 月と暈 ---
  vec2 moonPos = vec2(0.74, 0.78);
  vec2 md = (uv - moonPos) * vec2(aspect, 1.0);
  float mdist = length(md);
  color += vec3(0.867, 0.898, 0.910) * smoothstep(0.035, 0.028, mdist);
  color += vec3(0.60, 0.66, 0.70) * exp(-mdist * 9.0) * 0.35;

  // --- 星(夜が深まるほど見える) ---
  float star = step(0.9975, hash21(floor(uv * vec2(220.0 * aspect, 220.0))));
  color += star * night * 0.5 * smoothstep(0.55, 1.0, uv.y);

  // --- 稜線 3層(遠いほど霞に溶ける) ---
  vec3 ridgeFar = vec3(0.239, 0.322, 0.380);
  vec3 ridgeMid = vec3(0.157, 0.224, 0.271);
  vec3 ridgeNear = vec3(0.086, 0.129, 0.161);

  float xFar = uv.x + par.x * 0.5;
  float xMid = uv.x + par.x * 1.2;
  float xNear = uv.x + par.x * 2.2;

  float hFar = ridge(xFar, 0.0);
  float hMid = ridge(xMid, 1.0);
  float hNear = ridge(xNear, 2.0);

  color = mix(color, ridgeFar, smoothstep(hFar + 0.004, hFar - 0.004, uv.y));
  color = mix(color, ridgeMid, smoothstep(hMid + 0.004, hMid - 0.004, uv.y));

  // --- 宿の灯り(中景の谷あい。スクロールで強まり、ゆらぐ) ---
  vec2 lanternPos = vec2(0.615 + par.x * 1.2, hMid - 0.045);
  vec2 ld = (uv - lanternPos) * vec2(aspect, 1.0);
  float flicker = 0.85 + 0.15 * valueNoise(vec2(u_time * 2.3, 7.7));
  float lantern = exp(-length(ld) * 34.0) * flicker;
  float lanternGain = 0.35 + 0.65 * night;
  // 近景の稜線より下では隠す
  float hidden = smoothstep(hNear + 0.002, hNear - 0.006, uv.y);
  color += vec3(0.851, 0.604, 0.337) * lantern * lanternGain * (1.0 - hidden);

  color = mix(color, ridgeNear, smoothstep(hNear + 0.004, hNear - 0.004, uv.y));

  // --- 霞: 谷を流れる帯。スクロールで薄れていく ---
  float mistDensity = 1.0 - 0.55 * night;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float bandY = 0.30 - fi * 0.085;
    float drift = u_time * (0.010 + fi * 0.006);
    float m = fbm(vec2(uv.x * 2.6 + drift + fi * 13.1, uv.y * 7.0 + fi * 5.7));
    float band = exp(-pow((uv.y - bandY) * (7.0 - fi * 1.5), 2.0));
    float mist = smoothstep(0.35, 0.85, m) * band * mistDensity * (0.34 - fi * 0.06);
    color = mix(color, vec3(0.753, 0.800, 0.820), mist);
  }

  // --- 粒子感(バンディング防止のグレイン) ---
  color += (hash21(uv * u_resolution.xy + u_time) - 0.5) * 0.012;

  outColor = vec4(color, 1.0);
}
