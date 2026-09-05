/** A single depth-aware finishing pass: photographic distance, not a blanket blur.
 * Full-resolution scene/depth are reused; no second geometry pass or per-frame texture allocation.
 * The focused book and HTML type remain sharp. Behind it, edge-aware taps soften distance.
 */
export function createAtmosphere(THREE, renderer, scene, camera) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: renderer.extensions.has('EXT_color_buffer_float') ? THREE.HalfFloatType : THREE.UnsignedByteType,
    depthBuffer: true,
    samples: Math.min(matchMedia('(max-width:720px)').matches ? 2 : 4, renderer.capabilities.maxSamples),
  });
  target.depthTexture = new THREE.DepthTexture(1, 1, THREE.UnsignedIntType);
  target.texture.colorSpace = THREE.LinearSRGBColorSpace;
  const uniforms = {
    image: { value: target.texture }, depth: { value: target.depthTexture },
    resolution: { value: new THREE.Vector2(1, 1) },
    nearClip: { value: camera.near }, farClip: { value: camera.far },
    focus: { value: 140 }, blurPixels: { value: 3.2 },
    base: { value: new THREE.Color('#e5e1d8') },
    edge: { value: new THREE.Color('#bdc6bd') },
    glow: { value: new THREE.Color('#fff6df') },
    haze: { value: .23 }, vignette: { value: .075 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, toneMapped: true,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D image, depth;
      uniform vec2 resolution;
      uniform float nearClip, farClip, focus, blurPixels, haze, vignette;
      uniform vec3 base, edge, glow;
      float distanceAt(vec2 uv){ float d=texture2D(depth,uv).x; return (nearClip*farClip)/(farClip-d*(farClip-nearClip)); }
      void main(){
        float z=distanceAt(vUv);
        float coc=smoothstep(focus+35.,focus+190.,z)*blurPixels;
        vec4 sampleColor=texture2D(image,vUv);
        float weight=1.;
        // A small rotated disk. Reject nearer taps to preserve foreground silhouettes.
        if(coc>.05 && sampleColor.a>.002) for(int i=0;i<12;i++){
          float angle=float(i)*2.39996323;
          float radius=sqrt((float(i)+.5)/12.);
          vec2 uv=clamp(vUv+vec2(cos(angle),sin(angle))*radius*coc/resolution,vec2(.001),vec2(.999));
          float sampleZ=distanceAt(uv);
          float w=smoothstep(-20.,0.,sampleZ-z);
          sampleColor+=texture2D(image,uv)*w;
          weight+=w;
        }
        sampleColor/=weight;
        // Broad raking daylight: warm at lower-left, stone toward the horizon.
        float pool=exp(-dot((vUv-vec2(.32,.28))*vec2(1.55,1.25),(vUv-vec2(.32,.28))*vec2(1.55,1.25))*1.45);
        vec3 background=mix(edge,glow,pool*.66);
        vec3 color=sampleColor.rgb+background*(1.-sampleColor.a);
        float mist=smoothstep(focus+45.,focus+240.,z)*haze;
        if(z<farClip*.995) color=mix(color,background,mist);
        float corners=dot(vUv-.5,vUv-.5);
        color*=1.-corners*vignette;
        // Sub-visible film grain makes gradients read as atmosphere rather than a CSS fill.
        float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
        color+=grain*.0018;
        gl_FragColor=vec4(max(color,vec3(0.)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const screen = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false; screen.add(quad);
  const screenCamera = new THREE.Camera();
  const view = new THREE.Vector3(), size = new THREE.Vector2();
  let width = 0, height = 0;
  const stats = { calls:0, triangles:0 };
  function resize() {
    renderer.getDrawingBufferSize(size);
    if (size.x === width && size.y === height) return;
    width = size.x; height = size.y;
    target.setSize(width, height); uniforms.resolution.value.set(width, height);
  }
  function setTheme(dark) {
    uniforms.base.value.set(dark ? '#151816' : '#e5e1d8');
    uniforms.edge.value.set(dark ? '#0f1514' : '#bdc6bd');
    uniforms.glow.value.set(dark ? '#292b24' : '#fff6df');
    uniforms.haze.value = dark ? .14 : .23;
  }
  function render(focusPoint, depthOfField = true) {
    resize();
    camera.updateMatrixWorld(true);
    view.copy(focusPoint).applyMatrix4(camera.matrixWorldInverse);
    uniforms.focus.value = Math.max(camera.near, -view.z);
    uniforms.blurPixels.value = depthOfField ? Math.min(4.5, 3.1 * renderer.getPixelRatio()) : 0;
    const oldTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    stats.calls = renderer.info.render.calls + 1; stats.triangles = renderer.info.render.triangles + 2;
    renderer.setRenderTarget(oldTarget);
    renderer.render(screen, screenCamera);
    return stats;
  }
  return { render, resize, setTheme, uniforms, target,
    dispose(){ target.dispose(); target.depthTexture?.dispose(); quad.geometry.dispose(); material.dispose(); }
  };
}
