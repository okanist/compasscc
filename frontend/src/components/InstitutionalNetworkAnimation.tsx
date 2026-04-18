import { useEffect, useRef } from "react";

type NodeTone = "soft" | "gold" | "blue";

type Node = {
  id: number;
  x: number;
  y: number;
  r: number;
  tone: NodeTone;
};

type Edge = {
  from: number;
  to: number;
  strength: number;
};

type SignalPath = {
  edges: number[];
  speed: number;
  phase: number;
};

const nodes: Node[] = [
  { id: 0, x: 18, y: 72, r: 2.5, tone: "gold" },
  { id: 1, x: 36, y: 58, r: 2.4, tone: "soft" },
  { id: 2, x: 34, y: 96, r: 2.1, tone: "soft" },
  { id: 3, x: 56, y: 48, r: 2.7, tone: "gold" },
  { id: 4, x: 56, y: 76, r: 2.4, tone: "soft" },
  { id: 5, x: 54, y: 108, r: 2.5, tone: "soft" },
  { id: 6, x: 76, y: 36, r: 2.9, tone: "gold" },
  { id: 7, x: 82, y: 64, r: 2.4, tone: "gold" },
  { id: 8, x: 80, y: 94, r: 2.5, tone: "gold" },
  { id: 9, x: 102, y: 52, r: 2.6, tone: "blue" },
  { id: 10, x: 102, y: 84, r: 2.4, tone: "soft" },
  { id: 11, x: 126, y: 32, r: 3, tone: "gold" },
  { id: 12, x: 124, y: 58, r: 2.6, tone: "soft" },
  { id: 13, x: 126, y: 92, r: 2.5, tone: "soft" },
  { id: 14, x: 148, y: 48, r: 2.8, tone: "gold" },
  { id: 15, x: 152, y: 74, r: 3, tone: "gold" },
  { id: 16, x: 150, y: 108, r: 2.4, tone: "soft" },
  { id: 17, x: 174, y: 40, r: 2.8, tone: "gold" },
  { id: 18, x: 180, y: 74, r: 3, tone: "gold" },
  { id: 19, x: 186, y: 94, r: 2.8, tone: "gold" },
  { id: 20, x: 206, y: 56, r: 2.9, tone: "blue" },
  { id: 21, x: 206, y: 84, r: 2.7, tone: "blue" },
  { id: 22, x: 220, y: 38, r: 2.2, tone: "soft" },
  { id: 23, x: 226, y: 106, r: 2.2, tone: "soft" },
  { id: 24, x: 246, y: 60, r: 2.5, tone: "blue" },
  { id: 25, x: 254, y: 88, r: 2.4, tone: "soft" },
  { id: 26, x: 270, y: 76, r: 2.6, tone: "blue" }
];

const edges: Edge[] = [
  { from: 0, to: 1, strength: 0.7 }, { from: 0, to: 3, strength: 0.75 }, { from: 0, to: 4, strength: 0.6 },
  { from: 1, to: 3, strength: 0.55 }, { from: 1, to: 4, strength: 0.45 }, { from: 1, to: 2, strength: 0.35 },
  { from: 2, to: 4, strength: 0.28 }, { from: 2, to: 5, strength: 0.3 },
  { from: 3, to: 4, strength: 0.45 }, { from: 3, to: 6, strength: 0.78 }, { from: 3, to: 7, strength: 0.72 },
  { from: 4, to: 7, strength: 0.55 }, { from: 4, to: 8, strength: 0.5 }, { from: 4, to: 10, strength: 0.38 },
  { from: 5, to: 8, strength: 0.45 }, { from: 5, to: 10, strength: 0.34 },
  { from: 6, to: 7, strength: 0.5 }, { from: 6, to: 9, strength: 0.62 }, { from: 6, to: 11, strength: 0.85 },
  { from: 7, to: 9, strength: 0.5 }, { from: 7, to: 10, strength: 0.52 }, { from: 7, to: 12, strength: 0.66 },
  { from: 8, to: 10, strength: 0.42 }, { from: 8, to: 13, strength: 0.55 },
  { from: 9, to: 11, strength: 0.48 }, { from: 9, to: 12, strength: 0.56 }, { from: 9, to: 14, strength: 0.62 },
  { from: 10, to: 12, strength: 0.46 }, { from: 10, to: 13, strength: 0.42 }, { from: 10, to: 15, strength: 0.56 },
  { from: 11, to: 12, strength: 0.52 }, { from: 11, to: 14, strength: 0.78 }, { from: 11, to: 17, strength: 0.72 },
  { from: 12, to: 14, strength: 0.48 }, { from: 12, to: 15, strength: 0.7 }, { from: 12, to: 18, strength: 0.62 },
  { from: 13, to: 15, strength: 0.52 }, { from: 13, to: 16, strength: 0.46 }, { from: 13, to: 19, strength: 0.55 },
  { from: 14, to: 15, strength: 0.6 }, { from: 14, to: 17, strength: 0.74 }, { from: 14, to: 18, strength: 0.78 },
  { from: 15, to: 18, strength: 0.76 }, { from: 15, to: 19, strength: 0.68 }, { from: 15, to: 20, strength: 0.55 },
  { from: 16, to: 19, strength: 0.44 }, { from: 16, to: 21, strength: 0.4 },
  { from: 17, to: 18, strength: 0.5 }, { from: 17, to: 20, strength: 0.58 }, { from: 17, to: 22, strength: 0.34 },
  { from: 18, to: 19, strength: 0.48 }, { from: 18, to: 20, strength: 0.56 }, { from: 18, to: 21, strength: 0.6 },
  { from: 19, to: 21, strength: 0.52 }, { from: 19, to: 23, strength: 0.3 },
  { from: 20, to: 21, strength: 0.42 }, { from: 20, to: 24, strength: 0.52 },
  { from: 21, to: 24, strength: 0.5 }, { from: 21, to: 25, strength: 0.36 },
  { from: 22, to: 24, strength: 0.2 }, { from: 22, to: 25, strength: 0.16 },
  { from: 23, to: 25, strength: 0.18 }, { from: 23, to: 24, strength: 0.16 },
  { from: 24, to: 25, strength: 0.24 }, { from: 24, to: 26, strength: 0.28 }, { from: 25, to: 26, strength: 0.18 }
];

const signalPaths: SignalPath[] = [
  { edges: [1, 10, 21, 35, 42, 49, 58], speed: 0.14, phase: 0.02 },
  { edges: [9, 18, 31, 40, 47, 50, 57], speed: 0.11, phase: 0.35 },
  { edges: [17, 26, 33, 41, 48, 55, 60], speed: 0.1, phase: 0.63 }
];

const minNodeX = Math.min(...nodes.map((node) => node.x));
const maxNodeX = Math.max(...nodes.map((node) => node.x));
const minNodeY = Math.min(...nodes.map((node) => node.y));
const maxNodeY = Math.max(...nodes.map((node) => node.y));

function getNodeColors(tone: NodeTone) {
  if (tone === "gold") {
    return {
      glow: "rgba(223, 187, 131, ",
      stroke: "rgba(223, 187, 131, ",
      core: "rgba(236, 216, 176, "
    };
  }

  if (tone === "blue") {
    return {
      glow: "rgba(116, 142, 196, ",
      stroke: "rgba(108, 133, 185, ",
      core: "rgba(146, 167, 215, "
    };
  }

  return {
    glow: "rgba(83, 100, 129, ",
    stroke: "rgba(71, 88, 120, ",
    core: "rgba(42, 55, 78, "
  };
}

export function InstitutionalNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrameId = 0;
    const start = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const elapsed = mediaQuery.matches ? 0 : (time - start) / 1000;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const networkWidth = maxNodeX - minNodeX;
      const networkHeight = maxNodeY - minNodeY;
      const scale = Math.min((width * 0.88) / networkWidth, (height * 0.7) / networkHeight);
      const centeredWidth = networkWidth * scale;
      const centeredHeight = networkHeight * scale;
      const offsetX = (width - centeredWidth) / 2 - minNodeX * scale;
      const offsetY = (height - centeredHeight) / 2 - minNodeY * scale;
      const centerX = offsetX + (minNodeX + networkWidth / 2) * scale;
      const centerY = offsetY + (minNodeY + networkHeight / 2) * scale;

      const ambient = ctx.createRadialGradient(centerX, centerY, 12, centerX, centerY, 145 * scale);
      ambient.addColorStop(0, "rgba(223, 187, 131, 0.05)");
      ambient.addColorStop(0.42, "rgba(88, 119, 177, 0.05)");
      ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150 * scale, 0, Math.PI * 2);
      ctx.fill();

      const nodeEnergy = new Map<number, number>();

      edges.forEach((edge, edgeIndex) => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        const x1 = offsetX + from.x * scale;
        const y1 = offsetY + from.y * scale;
        const x2 = offsetX + to.x * scale;
        const y2 = offsetY + to.y * scale;

        const baseAlpha = 0.07 + edge.strength * 0.1;
        const shimmer = mediaQuery.matches ? 0.02 : 0.03 * Math.sin(elapsed * 0.38 + edgeIndex * 0.23);

        ctx.lineWidth = edge.strength > 0.65 ? 1.2 : 0.95;
        ctx.strokeStyle = `rgba(82, 99, 129, ${baseAlpha + shimmer})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        signalPaths.forEach((path) => {
          const edgePosition = path.edges.indexOf(edgeIndex);
          if (edgePosition === -1) return;

          const travel = mediaQuery.matches ? 0 : (elapsed * path.speed + path.phase) % 1;
          const pathProgress = travel * path.edges.length;
          const distance = Math.abs(pathProgress - edgePosition - 0.5);
          const glow = Math.max(0, 1 - distance / 0.95);

          if (glow <= 0.02) return;

          ctx.strokeStyle = `rgba(223, 187, 131, ${glow * 0.24})`;
          ctx.lineWidth = 1.15;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          const signalT = Math.min(1, Math.max(0, pathProgress - edgePosition));
          const signalX = x1 + (x2 - x1) * signalT;
          const signalY = y1 + (y2 - y1) * signalT;

          ctx.beginPath();
          ctx.fillStyle = `rgba(236, 216, 176, ${0.18 + glow * 0.2})`;
          ctx.arc(signalX, signalY, 1.2 + glow * 1.15, 0, Math.PI * 2);
          ctx.fill();

          nodeEnergy.set(edge.from, Math.max(nodeEnergy.get(edge.from) ?? 0, glow * 0.65));
          nodeEnergy.set(edge.to, Math.max(nodeEnergy.get(edge.to) ?? 0, glow * 0.65));
        });
      });

      nodes.forEach((node) => {
        const x = offsetX + node.x * scale;
        const y = offsetY + node.y * scale;
        const localEnergy = nodeEnergy.get(node.id) ?? 0;
        const basePulse = mediaQuery.matches ? 0.92 : 0.96 + 0.025 * Math.sin(elapsed * 0.3 + node.id * 0.17);
        const radius = node.r * scale * (basePulse + localEnergy * 0.22);
        const colors = getNodeColors(node.tone);

        ctx.beginPath();
        ctx.fillStyle = `${colors.glow}${node.tone === "soft" ? 0.04 + localEnergy * 0.06 : 0.05 + localEnergy * 0.1})`;
        ctx.arc(x, y, radius * 2.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(16, 24, 38, 0.96)";
        ctx.arc(x, y, radius + 1.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = `${colors.stroke}${node.tone === "soft" ? 0.22 + localEnergy * 0.1 : 0.48 + localEnergy * 0.18})`;
        ctx.lineWidth = 1;
        ctx.arc(x, y, radius + 0.72, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `${colors.core}${node.tone === "soft" ? 0.2 + localEnergy * 0.08 : 0.55 + localEnergy * 0.2})`;
        ctx.arc(x, y, radius * 0.54, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="institutional-network-animation">
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
