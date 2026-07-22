#version 300 es
// 湯けむり: 立ちのぼるfbmノイズ。下端は灯りの色をわずかに拾う。
// 透過canvasに前乗算アルファで出力し、下の水面に重ねる。
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;

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

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = vec2(v_uv.x * aspect, v_uv.y);

  // ゆがみ(疑似カール): fbmでサンプル座標を曲げてから本体のfbmを引く
  vec2 warp = vec2(
    fbm(p * 1.8 + vec2(0.0, -u_time * 0.10)),
    fbm(p * 1.8 + vec2(5.2, -u_time * 0.13))
  ) - 0.5;
  float smoke = fbm(p * vec2(2.4, 1.7) + warp * 0.9 + vec2(0.0, -u_time * 0.16));

  // 下から立ちのぼり、上で消える
  float rise = smoothstep(0.0, 0.25, v_uv.y) * smoothstep(1.05, 0.35, v_uv.y);
  float alpha = smoothstep(0.45, 0.92, smoke) * rise * 0.27;

  // 色: 霞白。下端だけ灯りの暖色をわずかに拾う
  vec3 color = mix(vec3(0.85, 0.68, 0.50), vec3(0.80, 0.83, 0.84), smoothstep(0.0, 0.55, v_uv.y));

  outColor = vec4(color * alpha, alpha); // 前乗算アルファ
}
