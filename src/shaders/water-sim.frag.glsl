#version 300 es
// 露天風呂の水面シミュレーション(波動方程式のピンポン更新)
// テクスチャ: R=現在の高さ, G=1フレーム前の高さ
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_field;
uniform vec2 u_texel;
uniform vec3 u_drop; // xy=波源(uv), z=強さ(0なら波源なし)
uniform float u_aspect;

float height(vec2 uv) {
  return texture(u_field, uv).r;
}

void main() {
  vec2 field = texture(u_field, v_uv).rg;
  float curr = field.r;
  float prev = field.g;

  float left = height(v_uv - vec2(u_texel.x, 0.0));
  float right = height(v_uv + vec2(u_texel.x, 0.0));
  float down = height(v_uv - vec2(0.0, u_texel.y));
  float up = height(v_uv + vec2(0.0, u_texel.y));

  // 波動方程式: 隣接平均の2倍から前フレームを引く
  float next = (left + right + up + down) * 0.5 - prev;
  next *= 0.982; // 減衰(湯のとろみ)

  // 波源(ポインタ・湯口の雫)をガウス状に足す
  if (u_drop.z != 0.0) {
    vec2 d = (v_uv - u_drop.xy) * vec2(u_aspect, 1.0);
    next += u_drop.z * exp(-dot(d, d) * 850.0);
  }

  // 端で波を殺して反射の暴れを防ぐ
  float edge = smoothstep(0.0, 0.03, v_uv.x) * smoothstep(1.0, 0.97, v_uv.x) *
    smoothstep(0.0, 0.03, v_uv.y) * smoothstep(1.0, 0.97, v_uv.y);
  next *= mix(0.9, 1.0, edge);

  outColor = vec4(next, curr, 0.0, 1.0);
}
