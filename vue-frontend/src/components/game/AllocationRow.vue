<template>
  <div class="alloc-row card" :class="{ selected: amount > 0 }">
    <div class="ar-head">
      <div class="ar-ident">
        <span class="ar-name">{{ stock.name }}</span>
        <span class="badge badge-gray">{{ stock.sector }}</span>
      </div>
      <div class="ar-price">
        <span class="ar-price-label">기준가</span>
        <strong class="num">{{ format(stock.price) }}원</strong>
      </div>
    </div>

    <p class="ar-desc">{{ stock.description }}</p>

    <!-- 비중이 이 카드의 큰 숫자다. 0이면 흐리게. -->
    <div class="ar-meter">
      <div class="ar-figure">
        <span class="ar-weight num num-lg" :class="{ empty: amount === 0 }">{{ weight.toFixed(0) }}%</span>
        <span class="ar-qty">{{ quantity }}주</span>
      </div>
      <div class="track" role="presentation">
        <div class="track-fill" :style="{ width: weight + '%' }"></div>
      </div>
    </div>

    <div class="ar-controls">
      <div class="ar-input-group">
        <label class="sr-only" :for="inputId">{{ stock.name }} 주문 수량</label>
        <input
          :id="inputId"
          class="ar-input"
          type="number"
          inputmode="numeric"
          min="0"
          step="1"
          :max="maxQuantity"
          :value="quantity"
          @input="onInput"
        />
        <span class="ar-unit">주</span>
      </div>

      <div class="ar-quick">
        <button type="button" class="chip" @click="setPortion(0.25)">25%</button>
        <button type="button" class="chip" @click="setPortion(0.5)">50%</button>
        <button type="button" class="chip" @click="setMax">최대</button>
        <button
          type="button"
          class="chip ar-chip-clear"
          :disabled="amount === 0"
          @click="emit('update', 0)"
        >
          비우기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stock: { type: Object, required: true },
  amount: { type: Number, default: 0 },
  /** 이 종목에 더 넣을 수 있는 상한 = 현재 금액 + 남은 현금 */
  maxAmount: { type: Number, required: true },
  initialCash: { type: Number, required: true }
})

const emit = defineEmits(['update'])

const inputId = computed(() => `alloc-${props.stock.id}`)
const weight = computed(() =>
  props.initialCash ? (props.amount / props.initialCash) * 100 : 0
)

/** 정수 주 단위. 남는 금액은 현금으로 돌아간다 */
const quantity = computed(() => Math.floor(props.amount / props.stock.price))
const maxQuantity = computed(() => Math.floor(props.maxAmount / props.stock.price))

function format(n) {
  return Number(n).toLocaleString('ko-KR')
}

function onInput(e) {
  const requestedQuantity = Math.max(0, Math.floor(Number(e.target.value) || 0))
  const nextQuantity = Math.min(requestedQuantity, maxQuantity.value)
  emit('update', nextQuantity * props.stock.price)
}

function setPortion(ratio) {
  const targetBudget = props.initialCash * ratio
  const targetQuantity = Math.floor(targetBudget / props.stock.price)
  const nextQuantity = Math.min(targetQuantity, maxQuantity.value)
  emit('update', nextQuantity * props.stock.price)
}

function setMax() {
  emit('update', maxQuantity.value * props.stock.price)
}
</script>

<style scoped>
.alloc-row {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: box-shadow var(--dur) var(--ease);
}
.alloc-row.selected {
  box-shadow: var(--elev-card), inset 0 0 0 1.5px var(--brand);
}

.ar-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}
.ar-ident {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  min-width: 0;
}
.ar-name {
  font-size: var(--fs-17);
  font-weight: var(--fw-bold);
  color: var(--text-strong);
}
.ar-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.ar-price-label {
  font-size: var(--fs-12);
  color: var(--text-weak);
}
.ar-price strong { font-size: var(--fs-15); font-weight: var(--fw-semibold); }

.ar-desc {
  margin: 0;
  font-size: var(--fs-13);
  line-height: var(--lh);
  color: var(--text-weak);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ar-meter {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.ar-figure {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}
.ar-weight { transition: color var(--dur) var(--ease); }
.ar-weight.empty { color: var(--text-disabled); }
.ar-qty {
  font-size: var(--fs-13);
  color: var(--text-weak);
}

.ar-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* 수량 입력 — 테두리 없이 한 단 낮은 면. 브라우저 스피너 화살표는 지운다. */
.ar-input-group {
  position: relative;
  display: flex;
  align-items: center;
}
.ar-input {
  width: 100%;
  height: 48px;
  padding: 0 40px 0 var(--space-4);
  border: none;
  border-radius: var(--r-12);
  background: var(--fill-weak);
  color: var(--text-strong);
  font-size: var(--fs-20);
  font-weight: var(--fw-bold);
  text-align: right;
  font-variant-numeric: tabular-nums;
  -moz-appearance: textfield;
  appearance: textfield;
  transition: box-shadow var(--dur) var(--ease), background-color var(--dur) var(--ease);
}
.ar-input::-webkit-outer-spin-button,
.ar-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.ar-input:hover { background: var(--fill); }
.ar-input:focus {
  outline: none;
  background: var(--surface);
  box-shadow: inset 0 0 0 1.5px var(--brand);
}
.ar-unit {
  position: absolute;
  right: var(--space-4);
  font-size: var(--fs-15);
  color: var(--text-weak);
  pointer-events: none;
}

.ar-quick {
  display: flex;
  gap: var(--space-2);
}
.ar-quick .chip { flex: 1; padding: 0; }

@media (min-width: 560px) {
  .ar-controls {
    flex-direction: row;
    align-items: center;
  }
  .ar-input-group { flex: 1; }
  .ar-quick { flex-shrink: 0; }
  .ar-quick .chip { flex: none; padding: 0 var(--space-4); }
}

@media (prefers-reduced-motion: reduce) {
  .alloc-row,
  .ar-weight,
  .ar-input { transition: none; }
}
</style>
