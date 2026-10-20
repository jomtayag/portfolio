// v-reveal: fades an element in when it enters the viewport. Optional value = delay in ms.
const io = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  : null

export const reveal = {
  mounted(el, binding) {
    el.classList.add('rv')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    io ? io.observe(el) : el.classList.add('is-in')
  },
  unmounted(el) {
    io?.unobserve(el)
  },
}
