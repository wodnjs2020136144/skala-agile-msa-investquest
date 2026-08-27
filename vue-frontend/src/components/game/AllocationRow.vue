<template>
  <div class="alloc-row" :class="{ selected: amount > 0 }">
    <div class="ar-head">
      <div class="ar-ident">
        <span class="ar-name">{{ stock.name }}</span>
      </div>
      <div class="ar-tags">
        <span class="badge badge-gray">{{ stock.sector }}</span>
      </div>
    </div>

    <p class="ar-desc">{{ stock.description }}</p>

    <div class="ar-controls">
      <div class="ar-price">
        <span class="ar-price-label">기준가</span>
        <strong>{{ format(stock.price) }}원</strong>
      </div>

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
        <button type="button" class="ar-chip" @click="setPortion(0.25)">25%</button>
        <button type="button" class="ar-chip" @click="setPortion(0.5)">50%</button>
        <button type="button" class="ar-chip" @click="setMax">최대</button>
        <button
          type="button"
          class="ar-chip ar-chip-clear"
          :disabled="amount === 0"
          @click="emit('update', 0)"
        >
          비우기
        </button>
      </div>
    </div>

    <div class="ar-meter">
      <div class="ar-bar" role="presentation">
        <div class="ar-fill" :style="{ width: weight + '%' }"></div>
      </div>
      <div class="ar-meta">
        <span class="ar-weight">{{ weight.toFixed(0) }}%</span>
        <span class="ar-qty">{{ quantity }}주</span>
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 19px;
  background: var(--color-bg-primary);
  transition: var(--transition);
}

.alloc-row.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.ar-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.ar-ident { display: flex; align-items: baseline; gap: 8px; }
.ar-name { font-size: 1.02rem; font-weight: 800; color: var(--color-text-primary); }
.ar-tags { display: flex; gap: 6px; flex-wrap: wrap; }

.ar-desc {
  margin: 8px 0 14px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.ar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ar-price { font-size: 0.85rem; color: var(--color-text-secondary); }
.ar-price-label { margin-right: 6px; }
.ar-price strong { color: var(--color-text-primary); font-variant-numeric: tabular-nums; }

.ar-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.ar-input {
  width: 120px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  font-weight: 700;
}

.ar-input:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.ar-unit { font-size: 0.85rem; color: var(--color-text-secondary); }

.ar-quick { display: flex; gap: 4px; flex-wrap: wrap; }

.ar-chip {
  padding: 5px 9px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.ar-chip:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.ar-chip:disabled { opacity: 0.4; cursor: not-allowed; }
.ar-chip:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.ar-meter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.ar-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: 999px;
  overflow: hidden;
}

.ar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.ar-meta {
  display: flex;
  gap: 10px;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  min-width: 92px;
  justify-content: flex-end;
}

.ar-weight { font-weight: 700; color: var(--color-text-primary); }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 560px) {
  .ar-input-group { margin-left: 0; width: 100%; }
  .ar-input { flex: 1; width: auto; }
  .ar-quick { width: 100%; }
  .ar-chip { flex: 1; text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  .ar-fill { transition: none; }
}
</style>
