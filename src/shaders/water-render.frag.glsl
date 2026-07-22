#version 300 es
// 露天風呂の水面描画: シミュレーションの高さ場から法線を起こし、
// 湯底の岩肌を屈折させ、月光(白)と灯り(橙)の2灯でスペキュラを乗せる
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_field;
uniform vec2 u_texel;
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
  for (int i = 0; i < 4; i++) {
    value += amp * valueNoise(p);
    p = p * 2.02 + vec2(31.7, 17.3);
    amp *= 0.5;
  }
  return value;
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);

  // --- シミュレーションの高さ場 + 常在のさざなみ ---
  float hC = texture(u_field, v_uv).r;
  float hX = texture(u_field, v_uv + vec2(u_texel.x, 0.0)).r;
  float hY = texture(u_field, v_uv + vec2(0.0, u_texel.y)).r;

  vec2 ambient = vec2(
    fbm(v_uv * vec2(aspect, 1.0) * 5.0 + vec2(u_time * 0.05, 0.0)),
    fbm(v_uv * vec2(aspect, 1.0) * 5.0 + vec2(0.0, u_time * 0.04) + 11.3)
  ) - 0.5;

  vec2 grad = vec2(hX - hC, hY - hC) * 3.5 + ambient * 0.020;
  vec3 normal = normalize(vec3(-grad.x, -grad.y, 0.045));

  // --- 湯底: 岩肌を屈折越しに見る ---
  vec2 refr = v_uv + normal.xy * 0.10;
  float rock = fbm(refr * vec2(aspect, 1.0) * 6.5);
  vec3 bottom = mix(
    vec3(0.055, 0.082, 0.090),
    vec3(0.118, 0.157, 0.157),
    smoothstep(0.35, 0.75, rock)
  );
  // 湯の花(白いミネラルの粒)
  bottom += vec3(0.30, 0.32, 0.31) * step(0.985, hash21(floor(refr * 260.0))) * 0.5;

  // --- 湯のにごり(乳白色を深さで混ぜる) ---
  float depth = smoothstep(0.0, 0.9, distance(v_uv, vec2(0.5, 0.45)));
  vec3 water = mix(bottom, vec3(0.286, 0.353, 0.353), 0.32 + depth * 0.16);

  // --- 2灯のスペキュラ: 月(白・鋭い)と灯り(橙・柔らかい) ---
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 moonDir = normalize(vec3(0.35, 0.55, 0.65));
  vec3 lampDir = normalize(vec3(-0.45, 0.35, 0.55));
  float moonSpec = pow(max(dot(reflect(-moonDir, normal), viewDir), 0.0), 90.0);
  float lampSpec = pow(max(dot(reflect(-lampDir, normal), viewDir), 0.0), 24.0);
  water += vec3(0.82, 0.87, 0.90) * moonSpec * 0.75;
  water += vec3(0.82, 0.58, 0.33) * lampSpec * 0.38;

  // --- 縁を落として湯船の内側に見せる ---
  float vignette = smoothstep(0.0, 0.10, v_uv.x) * smoothstep(1.0, 0.90, v_uv.x) *
    smoothstep(0.0, 0.14, v_uv.y) * smoothstep(1.0, 0.86, v_uv.y);
  water *= mix(0.45, 1.0, vignette);

  // グレイン
  water += (hash21(v_uv * u_resolution.xy + u_time) - 0.5) * 0.010;

  outColor = vec4(water, 1.0);
}
