# Performance: ResizeObserver + Framer Motion

Framer Motion's `layout` prop runs continuous geometry measurements via its own internal ResizeObserver. Spring animations asymptotically settle but never fully stop, producing a stream of sub-pixel resize events even "at rest." If our code also uses ResizeObserver on a container affected by these animations (like the messages scroll area), and the observer callback triggers layout changes (like adjusting scrollTop), it creates a feedback loop that pins the CPU.

We hit this already with `useStickToBottom` — the fix was time-based throttling (100ms) on the observer callback. Any future ResizeObserver usage near animated elements needs the same care. Watch for:

- Observers on containers whose size is influenced by `<motion.div layout>` children
- Observer callbacks that mutate scroll position or element dimensions
- Firefox is especially sensitive to this (two tab processes hit 100%+ CPU)
