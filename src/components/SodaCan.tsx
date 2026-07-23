"use client";

import { useMemo } from "react";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/grano_color.glb");
useGLTF.preload("/color_granos.glb");

// The 3D product is a coffee bean. `flavor` is kept so the carousel, hero,
// and CMS content keep working unchanged (it drives names, prices, and
// background colors — not the model's look).
export type SodaCanProps = {
  flavor?: "huila" | "geisha" | "caturra" | "reserve";
  scale?: number;
};

// Roast mottling for the tinted beans: the model has no UVs, so image
// textures can't map onto it. Instead we inject cheap 3D value noise into
// the standard material — color drifts between dark and light roast, and
// roughness breaks up so the highlight looks oily and organic instead of
// flat "plastic".
const ROAST_SHADER_PATCH = {
  vertexCommon: /* glsl */ `
    #include <common>
    varying vec3 vRoastPos;
  `,
  vertexBegin: /* glsl */ `
    #include <begin_vertex>
    vRoastPos = position * 1200.0;
  `,
  fragmentCommon: /* glsl */ `
    #include <common>
    varying vec3 vRoastPos;
    float roastHash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float roastNoise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(roastHash(i), roastHash(i + vec3(1, 0, 0)), f.x),
            mix(roastHash(i + vec3(0, 1, 0)), roastHash(i + vec3(1, 1, 0)), f.x), f.y),
        mix(mix(roastHash(i + vec3(0, 0, 1)), roastHash(i + vec3(1, 0, 1)), f.x),
            mix(roastHash(i + vec3(0, 1, 1)), roastHash(i + vec3(1, 1, 1)), f.x), f.y),
        f.z);
    }
  `,
  fragmentColor: /* glsl */ `
    #include <color_fragment>
    {
      float mottle = roastNoise(vRoastPos) * 0.65 + roastNoise(vRoastPos * 2.9 + 17.3) * 0.35;
      // diffuseColor here = white base × grayscale shading layer
      float shade = clamp(diffuseColor.g, 0.0, 1.0);
      vec3 roastDark = vec3(0.09, 0.045, 0.02);
      vec3 roastLight = vec3(0.27, 0.15, 0.07);
      diffuseColor.rgb = mix(roastDark, roastLight, mottle) * (0.5 + 0.5 * shade);
    }
  `,
  fragmentRoughness: /* glsl */ `
    #include <roughnessmap_fragment>
    {
      float gloss = roastNoise(vRoastPos * 1.7 + 5.1);
      roughnessFactor = clamp(roughnessFactor - gloss * 0.3 + 0.08, 0.12, 1.0);
    }
  `,
};

function makeRoastMaterial(hasShadeLayer: boolean) {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: hasShadeLayer,
    color: "#ffffff",
    roughness: 0.45,
    metalness: 0.02,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", ROAST_SHADER_PATCH.vertexCommon)
      .replace("#include <begin_vertex>", ROAST_SHADER_PATCH.vertexBegin);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", ROAST_SHADER_PATCH.fragmentCommon)
      .replace("#include <color_fragment>", ROAST_SHADER_PATCH.fragmentColor)
      .replace("#include <roughnessmap_fragment>", ROAST_SHADER_PATCH.fragmentRoughness);
  };
  return material;
}

// The Blender exports carry the roast color in the material shader (not
// baked), so the vertex color layers arrive as white (COLOR_0) plus a
// grayscale shading layer (COLOR_1). Rebuild the look: pick the layer with
// the most variation as shading, and tint the material coffee-brown unless
// the layer carries real (chromatic) color.
type ColorAttr = THREE.BufferAttribute | THREE.InterleavedBufferAttribute;

function analyzeColors(attr: ColorAttr) {
  const step = Math.max(1, Math.floor(attr.count / 64));
  let luma = 0;
  let chroma = 0;
  let n = 0;
  for (let i = 0; i < attr.count; i += step) {
    const r = attr.getX(i);
    const g = attr.getY(i);
    const b = attr.getZ(i);
    luma += (r + g + b) / 3;
    chroma += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
    n++;
  }
  return { luma: luma / n, chroma: chroma / n };
}

function beanMaterialFor(geometry: THREE.BufferGeometry) {
  let color = geometry.getAttribute("color") as ColorAttr | undefined;
  const alt = geometry.getAttribute("color_1") as ColorAttr | undefined;

  // Prefer the shading layer when the primary one is flat white.
  if (color && alt && analyzeColors(color).luma > 0.92) {
    geometry.setAttribute("color", alt as THREE.BufferAttribute);
    color = alt;
  }

  // Grayscale (no chroma) layers are shading, not color. In that case the
  // procedural roast shader supplies the coffee look; chromatic layers
  // (a future export with real baked colors) render as-is.
  const needsTint = !color || analyzeColors(color).chroma < 0.05;
  if (needsTint) {
    return makeRoastMaterial(Boolean(color));
  }
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    color: "#ffffff",
    roughness: 0.35,
    metalness: 0.05,
  });
}

// Clones a GLTF scene, applies the bean material, and normalizes its size
// so the longest dimension matches `targetSize` (0.75 ≈ the original can's
// height), keeping every existing float/spin animation and position working.
function useNormalizedBeans(path: string, targetSize: number) {
  const { scene } = useGLTF(path);

  return useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.material = beanMaterialFor(mesh.geometry as THREE.BufferGeometry);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    clone.scale.multiplyScalar(targetSize / maxDim);
    return clone;
  }, [scene, targetSize]);
}

/** Single coffee bean — the floating "product" used across the site. */
export function SodaCan({ flavor = "huila", scale = 2, ...props }: SodaCanProps) {
  const bean = useNormalizedBeans("/grano_color.glb", 0.75);

  return (
    <group {...props} dispose={null} scale={scale}>
      <Center>
        <primitive object={bean} />
      </Center>
    </group>
  );
}

/** Pile of coffee beans — used as the story-section centerpiece. */
export function BeansPile({ scale = 2, ...props }: { scale?: number }) {
  // The cluster spans ~9 bean-lengths, so it needs a much larger target
  // size than the single bean for the individual beans to read on screen.
  const pile = useNormalizedBeans("/color_granos.glb", 1.5);

  return (
    <group {...props} dispose={null} scale={scale}>
      <Center>
        <primitive object={pile} />
      </Center>
    </group>
  );
}
