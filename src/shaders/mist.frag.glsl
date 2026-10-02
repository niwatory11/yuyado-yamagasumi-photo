#version 300 es
// ヒーロー「山霞」: 背景写真(夜の谷と宿)の上を流れる霞だけを描くオーバーレイ。
// 出力は premultiplied alpha(canvasは alpha: true)。霞のない所は透明で写真が透ける。
// u_scroll(0..1)が進むほど霞が晴れ、写真の宿の灯りが見えてくる —
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

// premultiplied の「上に重ねる」合成
void over(inout vec4 acc, vec3 color, float alpha) {
  acc.rgb = color * alpha + acc.rgb * (1.0 - alpha);
  acc.a = alpha + acc.a * (1.0 - alpha);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  // ポインタでわずかに視差(手前の帯ほど大きく動く)
  vec2 par = (u_pointer - 0.5) * 0.02;

  // 0 = 霞の底(読み込み直後), 1 = 霞が晴れた夜
  float clear = smoothstep(0.0, 0.75, u_scroll);

  vec3 mistColor = vec3(0.753, 0.800, 0.820);
  vec3 veilColor = vec3(0.420, 0.478, 0.510);
  vec4 acc = vec4(0.0);

  // --- 薄い紗: 画面全体にかかる低周波の霞。谷底(下)ほど濃い ---
  float veilNoise = fbm(vec2(uv.x * aspect * 0.9 + u_time * 0.006, uv.y * 1.6 - u_time * 0.004));
  float veilFalloff = mix(0.55, 1.0, smoothstep(0.85, 0.15, uv.y));
  float veil = smoothstep(0.25, 0.75, veilNoise) * veilFalloff * mix(0.42, 0.10, clear);
  over(acc, veilColor, veil);

  // --- 霞の帯: 谷を横に流れる3本。手前ほど低く速い ---
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float bandY = 0.46 - fi * 0.13;
    float drift = u_time * (0.012 + fi * 0.007);
    vec2 p = vec2((uv.x + par.x * (1.0 + fi)) * aspect * 1.4 + drift + fi * 13.1,
                  (uv.y + par.y * 0.5) * 6.0 + fi * 5.7);
    float m = fbm(p);
    float band = exp(-pow((uv.y - bandY) * (5.5 - fi * 1.2), 2.0));
    float strength = mix(0.62 - fi * 0.08, 0.16, clear);
    float mist = smoothstep(0.32, 0.82, m) * band * strength;
    over(acc, mistColor, mist);
  }

  outColor = acc;
}
