<template>
  <section class="container">
    <div>
      <b-button-group class="mr-5 mb-3">
        <b-button
          v-for="(currency, index) in currencies"
          :key="index"
          :variant="
            selectedCurrency === currency ? 'primary' : 'outline-primary'
          "
          class="text-uppercase"
          @click="selectedCurrency = currency"
        >
          {{ currency }}
        </b-button>
      </b-button-group>

      <b-button-group class="mr-5 mb-3">
        <b-button
          v-for="(year, index) in years"
          :key="index"
          :variant="
            selectedYears.includes(year) ? 'primary' : 'outline-primary'
          "
          class="text-capitalize"
          @click="updateSelectedYears(year)"
        >
          {{ year }} YRS
        </b-button>
      </b-button-group>

      <b-button-group class="mb-3">
        <b-button
          v-for="(key, index) in keys"
          :key="index"
          :variant="selectedIndicator === key ? 'primary' : 'outline-primary'"
          class="text-capitalize"
          @click="selectedIndicator = key"
        >
          {{ key }}
        </b-button>
      </b-button-group>
    </div>

    <div>
      <b-form-input
        v-model="companyFilter"
        placeholder="Filter by company name..."
        class="w-50"
      ></b-form-input>
    </div>

    <div>
      <b-table
        id="quotes-table"
        :items="data"
        :fields="fields"
        small
        responsive="lg"
        tbody-tr-class="row--fixed-width"
        sort-by="dateSent"
        sort-desc
        no-sort-reset
        sort-icon-left
        :sort-compare="sortCompare"
        :filter-function="filterByCompany"
        :filter="companyFilter"
        :tbody-transition-props="transProps"
        primary-key="id"
      >
        <template #thead-top="data">
          <b-tr>
            <b-th class="header--none" colspan="3"></b-th>
            <b-th
              v-for="(year, index) in selectedYears"
              :key="index"
              class="header--year"
              colspan="2"
            >
              <p>{{ year }} YRS</p>
            </b-th>
          </b-tr>
        </template>

        <template #cell(show_details)="row">
          <b-icon-chevron-down
            v-if="row.item.quotes !== null"
            @click="row.toggleDetails"
            :class="[
              { active: row.detailsShowing },
              'expand-icon h5 mb-0 cursor-pointer',
            ]"
          />
        </template>

        <template #cell(dateSent)="data">
          {{ formatDateString(data.value) }}
        </template>

        <template #cell(company)="data">
          <b>{{ data.value }}</b>
        </template>

        <template #row-details="row">
          <template v-for="indicator in keys">
            <b-tr v-if="indicator !== selectedIndicator" :key="indicator">
              <b-td>{{ indicator }}</b-td>
              <b-td v-for="field in fields.slice(3)" :key="field.key">
                {{ getValueFromKey(row.item, field, indicator) }}
              </b-td>
            </b-tr>
          </template>
        </template>

        <template #custom-foot>
          <b-tr class="footer--border">
            <b-th v-for="(field, index) in fields" :key="index">
              {{ getAverage(field.key) }}
            </b-th>
          </b-tr>
        </template>
      </b-table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KeyValueObject, TableCompany } from '@/types/general'

const props = defineProps({
  data: { type: Array<TableCompany>, required: true },
  years: { type: Array<number>, required: true },
  currencies: { type: Array<string>, required: true },
  types: { type: Array<string>, required: true },
})
const transProps = { name: 'flip-list' }
const keys = ['spread', 'yield', '3MLSpread']
const selectedYears = ref<Array<number>>([])
const companyFilter = ref<string>('')
const selectedCurrency = ref<string>('USD')
const selectedIndicator = ref<string>('spread')

const fields = computed(() => {
  const baseFields = [
    { key: 'show_details', label: '' },
    { key: 'dateSent', sortable: true },
    { key: 'company', sortable: true },
  ]
  selectedYears.value.forEach((year) => {
    props.types.forEach((type) => {
      baseFields.push({
        key: `${year}-${selectedCurrency.value}-${type}`,
        label: type,
        formatter: (_value: unknown, _key: string, item: TableCompany, indicator: string) => {
          let value = ''
          const indicatorKey = indicator ? indicator : selectedIndicator.value
          console.log(indicatorKey)
          if (item.quotes && item.quotes[indicatorKey]) {
            value = item.quotes[indicatorKey].find((quote) => {
              return quote.key === `${year}-${selectedCurrency.value}-${type}`
            })?.value
          }
          if (value) {
            return indicatorKey === 'yield'
              ? `${value}%`
              : `${value}bp`
          }
          return ''
        },
      })
    })
  })
  return baseFields
})

watch(props.years, async () => {
  selectedYears.value = []
  props.years.forEach((year) => {
    selectedYears.value.push(year)
  })
})

const formatDateString = (dateToFormat: string) => {
  if (!dateToFormat) return
  const date = new Date(dateToFormat)
  return (
    date.toLocaleDateString('en-US', { day: '2-digit' }) +
    '-' +
    date.toLocaleDateString('en-US', { month: 'short' }) +
    '-' +
    date.toLocaleDateString('en-US', { year: '2-digit' })
  )
}

const updateSelectedYears = (year: number) => {
  const index = selectedYears.value.indexOf(year)
  if (index >= 0) {
    selectedYears.value.splice(index, 1)
  } else {
    selectedYears.value.push(year)
    selectedYears.value.sort((a, b) => a - b)
  }
}

const sortCompare = (aRow, bRow, key, sortDesc) => {
  let a = aRow[key]
  let b = bRow[key]

  if (key === 'dateSent') {
    a = new Date(a).getTime()
    b = new Date(b).getTime()
  }

  if ((!aRow.quotes && !!bRow.quotes) || (!!aRow.quotes && !bRow.quotes)) {
    if (sortDesc) {
      return !aRow.quotes ? -1 : 1
    }
    return !aRow.quotes ? 1 : -1
  }
  if (a !== b) {
    return a < b ? -1 : 1
  } else {
    if (sortDesc) {
      return aRow.preferred < bRow.preferred ? -1 : 1
    }
    return aRow.preferred < bRow.preferred ? 1 : -1
  }
}

const filterByCompany = (rowData: TableCompany, second: string) => {
  return rowData.company.toLowerCase().includes(second.toLowerCase())
}

const getAverage = (key: string) => {
  if (['show_details', 'dateSent'].includes(key)) return ''
  if (['company'].includes(key)) return `Average by ${selectedIndicator.value}`
  let total = 0
  let items = 0
  props.data.forEach((company: TableCompany) => {
    if (company.quotes && company.quotes[selectedIndicator.value]) {
      const quote: KeyValueObject = company.quotes[
        selectedIndicator.value
      ].find((quote: KeyValueObject) => quote.key === key)
      if (quote) {
        items++
        total += quote.value
      }
    }
  })
  const average = items ? total / items : ''
  if (average) {
    return selectedIndicator.value === 'yield'
      ? `${average.toFixed(3)}%`
      : `${average.toFixed(0)}bp`
  }
  return ''
}

const getValueFromKey = (company, fieldDefinition, indicator) => {
  if (company && company.quotes) {
    return fieldDefinition.formatter(null, null, company, indicator)
  }
  return ''
}
</script>

<style>
svg.expand-icon {
  transition: 0.3s all ease;
}
svg.expand-icon.active {
  transform: rotate(180deg);
}
.table thead tr th {
  border: none;
  color: gray;
  text-transform: uppercase;
}
.table thead tr th.header--year p {
  color: black;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid;
  margin-bottom: 0px;
}
tr.footer--border {
  border: 1px solid;
}
tr.footer--border th {
  border-top: none;
}
.table tbody tr:nth-of-type(1) td {
  border-top: 1px solid black;
}
table#quotes-table .flip-list-move {
  transition: transform 0.5s;
}
</style>
