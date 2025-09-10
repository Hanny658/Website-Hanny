"use client";

/** Firecracker effect implemented in canvas (trying to make more use of framer motion) */

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    life: number
    maxLife: number
}

const MIN_PARTICLE_PER_CLICK = 20;

export default function FirecrackerCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const particles = useRef<Particle[]>([])
    const controls = useAnimation()

    const colors = [
        "#00ff00", // neon green (classic terminal green)
        "#ff0000", // vivid red
        "#00ffff", // cyan / aqua
        "#ff00ff", // magenta / hacker pink
        "#ffff00", // yellow highlight
        "#ff6600", // orange flame
        "#3399ff", // electric blue
        "#ffffff", // white sparks
        ]

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.current.forEach((p, i) => {
                p.x += p.vx
                p.y += p.vy
                p.vy += 0.05 // gravity
                p.life++

                // Draw
                const alpha = 1 - p.life / p.maxLife
                ctx.fillStyle = `${p.color}${Math.floor(alpha * 255)
                    .toString(16)
                    .padStart(2, "0")}`
                ctx.beginPath()
                const newSize = Math.max(0, p.size * (1 - p.life / p.maxLife))
                ctx.arc(p.x, p.y, newSize, 0, Math.PI * 2)
                ctx.fill()

                // Remove dead particles
                if (p.life >= p.maxLife) {
                    particles.current.splice(i, 1)
                }
            });

            requestAnimationFrame(animate)
        };

        animate();

        const handleClick = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const count = MIN_PARTICLE_PER_CLICK + Math.floor(Math.random() * 20)

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * 2 * Math.PI
                const speed = Math.random() * 4 + 2
                particles.current.push({
                    x: clientX,
                    y: clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 0,
                    maxLife: 50 + Math.floor(Math.random() * 30),
                })
            }
        }

        window.addEventListener("click", handleClick)
        return () => window.removeEventListener("click", handleClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls])

    return (
        <motion.canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            animate={controls}
        />
    )
}
