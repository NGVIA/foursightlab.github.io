(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // honor reduced-motion: leave canvas blank, content fully visible

  var mouse = { x: 0, y: 0 }, scrollProg = 0;
  window.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProg = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }, { passive: true });

  function waitThree() {
    if (window.THREE) init();
    else setTimeout(waitThree, 60);
  }

  function init() {
    var THREE = window.THREE;
    var canvas = document.getElementById('fs-canvas');
    if (!canvas) return;

    var A = '#34e0d0', B = '#4d7cff', N = 2200, showLines = true;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 0, 6.6);
    var group = new THREE.Group();
    scene.add(group);

    var R = 2.7, gA = Math.PI * (3 - Math.sqrt(5));
    var sph = new Float32Array(N * 3), exp = new Float32Array(N * 3),
        start = new Float32Array(N * 3), cur = new Float32Array(N * 3),
        col = new Float32Array(N * 3), siz = new Float32Array(N);
    var cA = new THREE.Color(A), cB = new THREE.Color(B);
    var INF = 3.2;

    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1 || 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var th = gA * i;
      sph[i*3] = Math.cos(th) * r * R; sph[i*3+1] = y * R; sph[i*3+2] = Math.sin(th) * r * R;
      exp[i*3]   = sph[i*3]   * INF        + (Math.random()-.5) * 0.7;
      exp[i*3+1] = sph[i*3+1] * INF        + (Math.random()-.5) * 0.7;
      exp[i*3+2] = sph[i*3+2] * INF * 0.45 + (Math.random()-.5) * 0.7;
      var rr = 6 + Math.random()*5, u = Math.random()*2-1, ph = Math.random()*Math.PI*2, rs = Math.sqrt(1-u*u);
      start[i*3] = Math.cos(ph)*rs*rr; start[i*3+1] = u*rr; start[i*3+2] = Math.sin(ph)*rs*rr;
      cur[i*3] = start[i*3]; cur[i*3+1] = start[i*3+1]; cur[i*3+2] = start[i*3+2];
      var tc = (y + 1) / 2;
      var c = cB.clone().lerp(cA, tc);
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
      siz[i] = (Math.random() < 0.16) ? (0.34 + Math.random() * 0.32) : (0.08 + Math.random() * 0.09);
    }

    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(cur, 3));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
    var pMat = new THREE.ShaderMaterial({
      uniforms: { uSizeScale: { value: renderer.getPixelRatio() }, uOpacity: { value: 0.9 } },
      vertexShader: [
        'attribute float aSize;','attribute vec3 aColor;','uniform float uSizeScale;','varying vec3 vColor;',
        'void main() {','  vColor = aColor;','  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * uSizeScale * (300.0 / -mv.z);','  gl_Position = projectionMatrix * mv;','}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;','uniform float uOpacity;','varying vec3 vColor;',
        'void main() {','  vec2 d = gl_PointCoord - vec2(0.5);','  float r2 = dot(d, d) * 4.0;',
        '  float a = exp(-r2 * 3.0);','  if (a < 0.01) discard;','  gl_FragColor = vec4(vColor, a * uOpacity);','}'
      ].join('\n'),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    });
    var points = new THREE.Points(pGeo, pMat);
    group.add(points);

    var lineSeg = null, linePos = null, pairs = null;
    if (showLines) {
      pairs = [];
      for (var a = 0; a < N; a++) {
        var b1 = -1, d1 = 1e9, b2 = -1, d2 = 1e9;
        for (var k = 0; k < N; k++) {
          if (k === a) continue;
          var dx = sph[a*3]-sph[k*3], dy = sph[a*3+1]-sph[k*3+1], dz = sph[a*3+2]-sph[k*3+2];
          var d = dx*dx + dy*dy + dz*dz;
          if (d < d1) { d2=d1; b2=b1; d1=d; b1=k; }
          else if (d < d2) { d2=d; b2=k; }
        }
        if (b1 > a) pairs.push(a, b1);
        if (b2 > a) pairs.push(a, b2);
      }
      linePos = new Float32Array(pairs.length * 3);
      var lcol = new Float32Array(pairs.length * 3);
      for (var m = 0; m < pairs.length; m++) {
        var idx = pairs[m];
        lcol[m*3] = col[idx*3]; lcol[m*3+1] = col[idx*3+1]; lcol[m*3+2] = col[idx*3+2];
      }
      var lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
      lGeo.setAttribute('color', new THREE.BufferAttribute(lcol, 3));
      var lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false });
      lineSeg = new THREE.LineSegments(lGeo, lMat);
      group.add(lineSeg);
    }

    var t0 = performance.now();
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeIO = function (t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; };

    function animate() {
      var now = performance.now();
      var tf = ease(Math.min(1, (now - t0) / 2800));
      var mp = easeIO(scrollProg || 0);
      for (var i = 0; i < N; i++) {
        var sx = sph[i*3]   + (exp[i*3]   - sph[i*3])   * mp;
        var sy = sph[i*3+1] + (exp[i*3+1] - sph[i*3+1]) * mp;
        var sz = sph[i*3+2] + (exp[i*3+2] - sph[i*3+2]) * mp;
        cur[i*3]   = start[i*3]   + (sx - start[i*3])   * tf;
        cur[i*3+1] = start[i*3+1] + (sy - start[i*3+1]) * tf;
        cur[i*3+2] = start[i*3+2] + (sz - start[i*3+2]) * tf;
      }
      pGeo.attributes.position.needsUpdate = true;
      if (lineSeg) {
        for (var m2 = 0; m2 < pairs.length; m2++) {
          var idx2 = pairs[m2];
          linePos[m2*3] = cur[idx2*3]; linePos[m2*3+1] = cur[idx2*3+1]; linePos[m2*3+2] = cur[idx2*3+2];
        }
        lineSeg.geometry.attributes.position.needsUpdate = true;
        lineSeg.material.opacity = 0.13 - mp * 0.07;
      }
      pMat.uniforms.uSizeScale.value = renderer.getPixelRatio() * (1.0 + Math.sin(now * 0.0015) * 0.06 + mp * 0.4);
      group.rotation.y = (now - t0) * 0.00006 + (scrollProg || 0) * 1.4;
      group.rotation.x = (mouse.y || 0) * 0.26 + (1 - tf) * 0.5 + Math.sin(now * 0.0003) * 0.04;
      camera.position.x += ((mouse.x || 0) * 0.9 - camera.position.x) * 0.05;
      camera.position.y += (-(mouse.y || 0) * 0.5 - camera.position.y) * 0.05;
      camera.position.z = 6.6 - mp * 0.6;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    window.addEventListener('resize', function () {
      var ww = canvas.clientWidth || window.innerWidth;
      var hh = canvas.clientHeight || window.innerHeight;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh, false);
    });
  }

  waitThree();
})();
