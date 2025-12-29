<script lang="ts">
  import { onMount } from 'svelte';

  interface FAQ {
    question: string;
    answer: string;
  }

  const faqs: FAQ[] = [
    {
      question: 'Puedo cancelar en cualquier momento?',
      answer: 'Si, puedes cancelar tu suscripcion cuando quieras desde la configuracion de tu cuenta. No hay contratos ni compromisos. Si cancelas, tendras acceso hasta el final del periodo pagado.'
    },
    {
      question: 'Como funciona la prueba gratis?',
      answer: 'Tienes 7 dias para probar todas las funciones de Llego+ sin costo. No se te cobrara nada durante la prueba. Al finalizar, se activara automaticamente tu plan elegido a menos que canceles antes.'
    },
    {
      question: 'Que metodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de credito y debito internacionales (Visa, Mastercard), transferencias bancarias en CUP y USD, y pagos a traves de nuestros puntos de recarga autorizados.'
    },
    {
      question: 'Puedo cambiar entre plan mensual y anual?',
      answer: 'Si, puedes cambiar tu plan en cualquier momento. Si cambias de mensual a anual, se te aplicara el descuento inmediatamente. Si cambias de anual a mensual, el cambio se hara efectivo al terminar tu periodo actual.'
    },
    {
      question: 'Como funciona el cashback?',
      answer: 'Con cada compra que hagas en Llego, recibiras hasta 5% del valor de vuelta a tu balance. Este saldo puedes usarlo para pagar futuras compras o retirarlo cuando alcances el minimo.'
    },
    {
      question: 'La suscripcion funciona en toda Cuba?',
      answer: 'Si, Llego+ esta disponible en todas las provincias donde opera Llego. Los beneficios de mensajeria gratuita aplican dentro del rango local de tu ubicacion.'
    }
  ];

  let openIndex = $state<number | null>(null);
  let sectionRef: HTMLElement | null = null;
  let isVisible = $state(false);

  function toggle(index: number) {
    openIndex = openIndex === index ? null : index;
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => observer.disconnect();
  });
</script>

<section class="faq" bind:this={sectionRef}>
  <div class="container">
    <div class="section-header" class:visible={isVisible}>
      <span class="section-eyebrow">FAQ</span>
      <h2 class="section-title">Preguntas frecuentes</h2>
      <p class="section-description">
        Todo lo que necesitas saber sobre Llego+
      </p>
    </div>

    <div class="faq-list" class:visible={isVisible}>
      {#each faqs as faq, index}
        <div
          class="faq-item"
          class:open={openIndex === index}
          style="--delay: {index * 50}ms"
        >
          <button
            class="faq-question"
            onclick={() => toggle(index)}
            aria-expanded={openIndex === index}
          >
            <span class="question-text">{faq.question}</span>
            <div class="question-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14"/>
                <path d="M5 12h14" class="horizontal"/>
              </svg>
            </div>
          </button>

          <div class="faq-answer">
            <div class="answer-content">
              <p>{faq.answer}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="cta-section" class:visible={isVisible}>
      <p class="cta-text">Tienes mas preguntas?</p>
      <a href="#" class="cta-link">
        <span>Contactar soporte</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  </div>
</section>

<style>
  .faq {
    padding: var(--spacing-4xl) 0;
    background: #000;
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
  }

  /* Section Header */
  .section-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-header.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-eyebrow {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--color-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    border-radius: var(--radius-full);
    margin-bottom: var(--spacing-lg);
    letter-spacing: 0.05em;
  }

  .section-title {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin-bottom: var(--spacing-md);
  }

  .section-description {
    font-size: var(--font-size-lg);
    color: var(--color-text-variant);
  }

  /* FAQ List */
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  }

  .faq-list.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .faq-item {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-base);
  }

  .faq-item:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .faq-item.open {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(225, 199, 142, 0.2);
  }

  .faq-question {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
    text-align: left;
    cursor: pointer;
  }

  .question-text {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text);
    line-height: 1.4;
  }

  .question-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-variant);
    transition: all var(--transition-base);
  }

  .faq-item.open .question-icon {
    background: rgba(225, 199, 142, 0.15);
    color: var(--color-secondary);
  }

  .question-icon svg path {
    transition: transform var(--transition-base), opacity var(--transition-base);
  }

  .faq-item.open .question-icon .horizontal {
    opacity: 0;
    transform: rotate(90deg);
  }

  .faq-answer {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--transition-base);
  }

  .faq-item.open .faq-answer {
    grid-template-rows: 1fr;
  }

  .answer-content {
    overflow: hidden;
  }

  .answer-content p {
    padding: 0 var(--spacing-xl) var(--spacing-xl);
    font-size: var(--font-size-base);
    color: var(--color-text-variant);
    line-height: 1.7;
  }

  /* CTA Section */
  .cta-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-3xl);
    padding-top: var(--spacing-2xl);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
  }

  .cta-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-text {
    font-size: var(--font-size-base);
    color: var(--color-text-variant);
  }

  .cta-link {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    color: var(--color-secondary);
    font-weight: 500;
    font-size: var(--font-size-base);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .cta-link:hover {
    background: rgba(225, 199, 142, 0.1);
  }

  .cta-link svg {
    transition: transform var(--transition-fast);
  }

  .cta-link:hover svg {
    transform: translateX(4px);
  }
</style>
